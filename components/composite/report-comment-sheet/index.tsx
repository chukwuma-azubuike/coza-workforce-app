import React, { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, KeyboardAvoidingView, Modal, Platform, TouchableWithoutFeedback, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Textarea } from '~/components/ui/textarea';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';

const MIN_CHARS = 20;

interface ReportCommentSheetProps {
    visible: boolean;
    title: string;
    placeholder?: string;
    submitLabel?: string;
    isLoading?: boolean;
    onClose: () => void;
    onSubmit: (comment: string) => void;
}

const ReportCommentSheet: React.FC<ReportCommentSheetProps> = ({
    visible,
    title,
    placeholder = 'Add a comment…',
    submitLabel = 'Submit',
    isLoading = false,
    onClose,
    onSubmit,
}) => {
    const [comment, setComment] = useState('');
    const slideAnim = useRef(new Animated.Value(300)).current;

    useEffect(() => {
        if (visible) {
            setComment('');
            Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
        } else {
            Animated.timing(slideAnim, { toValue: 300, duration: 200, useNativeDriver: true }).start();
        }
    }, [visible]);

    const remaining = MIN_CHARS - comment.length;
    const canSubmit = comment.trim().length >= MIN_CHARS;

    const handleSubmit = () => {
        if (canSubmit) onSubmit(comment.trim());
    };

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                    <View className="flex-1 justify-end bg-black/40">
                        <TouchableWithoutFeedback>
                            <Animated.View
                                style={{ transform: [{ translateY: slideAnim }] }}
                                className="bg-background rounded-t-3xl"
                            >
                                {/* Handle bar */}
                                <View className="items-center pt-3 pb-1">
                                    <View className="w-10 h-1 rounded-full bg-muted" />
                                </View>

                                <View className="px-5 pt-3 pb-2">
                                    <Text className="!text-base font-bold text-foreground">{title}</Text>
                                </View>

                                <Separator />

                                <View className="px-5 pt-4 pb-2 gap-2">
                                    <Textarea
                                        value={comment}
                                        onChangeText={setComment}
                                        placeholder={placeholder}
                                        numberOfLines={5}
                                        className="min-h-[100px]"
                                        autoFocus
                                    />
                                    <View className="flex-row items-center justify-between">
                                        {remaining > 0 ? (
                                            <Text className="!text-[11px] text-muted-foreground">
                                                {remaining} more character{remaining !== 1 ? 's' : ''} required
                                            </Text>
                                        ) : (
                                            <Text className="!text-[11px] text-green-600 dark:text-green-400">
                                                Minimum met
                                            </Text>
                                        )}
                                        <Text className="!text-[11px] text-muted-foreground">
                                            {comment.length} chars
                                        </Text>
                                    </View>
                                </View>

                                <View className="flex-row gap-3 px-5 pt-2 pb-8">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onPress={onClose}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="default"
                                        className="flex-1"
                                        onPress={handleSubmit}
                                        disabled={!canSubmit}
                                        isLoading={isLoading}
                                    >
                                        {submitLabel}
                                    </Button>
                                </View>
                            </Animated.View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
        </Modal>
    );
};

export default ReportCommentSheet;
