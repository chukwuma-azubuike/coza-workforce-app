import React, { Suspense, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Modal, View } from 'react-native';
import Loading from '~/components/atoms/loading';
import { X } from 'lucide-react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import { OutgoingCall, roastCRMActions, roastCRMSelectors } from '~/store/actions/roast-crm';
import { GuestProfile } from '../guests';
import { useAppDispatch, useAppSelector } from '~/store/hooks';

interface PromptState extends OutgoingCall {
    visible: boolean;
}

const CallPromptManager: React.FC = () => {
    const dispatch = useAppDispatch();
    const queue = useAppSelector(roastCRMSelectors.selectCallQueue);
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);
    const [prompt, setPrompt] = useState<PromptState>({ visible: false } as PromptState);
    const nextTimerRef = useRef<NodeJS.Timeout | null>(null);
    const latest = queue[queue.length - 1];

    useEffect(() => {
        const handleAppState = (nextState: AppStateStatus) => {
            // if we went from background/inactive -> active, trigger prompt flow
            if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
                triggerPromptFlow();
            }
            appStateRef.current = nextState;
        };

        const sub = AppState.addEventListener('change', handleAppState);
        return () => {
            sub.remove();
            if (nextTimerRef.current) clearTimeout(nextTimerRef.current);
        };
    }, [queue]); // queue included so we know latest on changes

    // if app starts active and there is a queue, you may want to prompt on cold start:
    useEffect(() => {
        // if app just resumed cold-start and there's pending calls, optionally trigger
        if (AppState.currentState === 'active' && queue.length > 0 && !prompt?.visible) {
            // small delay to let UI settle
            setTimeout(() => triggerPromptFlow(), 5_000);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const triggerPromptFlow = () => {
        // If modal already visible, do nothing
        if (prompt?.visible) return;

        // show most recent call (LIFO). If you prefer FIFO, use queue[0] instead.
        if (queue.length === 0) return;

        if (latest) {
            setPrompt({ ...latest, visible: true });
        }
    };

    const handleClose = () => {
        // hide current prompt
        setPrompt({ visible: false } as PromptState);

        // schedule next prompt after 15 seconds if queue not empty
        nextTimerRef.current = setTimeout(() => {
            // ensure queue still has items
            // Note: we don't re-check visibility here; triggerPromptFlow will no-op if visible
            if (queue.length > 1) {
                // queue length > 1 because we already popped one
                triggerPromptFlow();
            }
        }, 15_000) as unknown as NodeJS.Timeout;
    };

    const handleSubmit = () => {
        if (!prompt?.id) {
            setPrompt({ visible: false } as PromptState);
            return;
        }

        handleClose();

        // remove the call from queue
        dispatch(roastCRMActions.popOutgoingCall());
    };

    return (
        <Modal
            animationType="slide"
            visible={prompt?.visible}
            className="!bg-background"
            presentationStyle="formSheet"
            onRequestClose={handleClose}
        >
            <View
                style={{ justifyContent: 'flex-end' }}
                className="bg-secondary dark:bg-background rounded-t-lg pb-8 flex-1"
            >
                <View className="bg-secondary/40 rounded-t-2xl p-6 relative">
                    <Text className="font-semibold text-lg text-center max-w-[85%] mx-auto">
                        How was your call with{' '}
                        <Text className="font-black text-lg text-center text-blue-600">
                            {latest?.guest?.firstName} {latest?.guest?.lastName}
                        </Text>
                    </Text>
                    <Button variant="ghost" className="absolute top-5 right-4 !h-8 w-8" onPress={handleClose}>
                        <X className="w-4 h-4 text-muted-foreground" />
                    </Button>
                </View>
                <View className="flex-1 px-2">
                    <Text className="font-bold py-2 text-center animate-pulse duration-1000">Please give feedback</Text>
                    <Suspense fallback={<Loading cover />}>
                        <GuestProfile
                            guest={latest?.guest as any}
                            contactChannel={latest?.type}
                            onSubmitEnagegment={handleSubmit}
                        />
                    </Suspense>
                </View>
            </View>
        </Modal>
    );
};

export default CallPromptManager;
