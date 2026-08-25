import * as React from 'react';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Text } from '~/components/ui/text';
import StepProgress from './step-progress';
import { useRegisterForm } from '../context';

interface IRegisterStepLayoutProps {
    title: string;
    subtitle?: string;
    /** Pinned footer (Back / Continue buttons) — stays visible above the keyboard. */
    footer: React.ReactNode;
    children: React.ReactNode;
}

const STEP_LABELS = ['Personal', 'Others', 'Social', 'Password'];

/**
 * Shared chrome for every register step: progress header, title + subtitle,
 * a keyboard-aware scrolling body, and a pinned footer. Centralising this keeps
 * spacing/keyboard behaviour identical across steps and removes the per-step
 * boilerplate that had drifted out of sync.
 *
 * Keyboard handling: `KeyboardAwareScrollView` auto-scrolls the focused field
 * above the keyboard (matches the app's ViewWrapper convention). The footer is
 * kept above the keyboard on iOS by the outer `KeyboardAvoidingView` (padding);
 * on Android the manifest's `adjustResize` resizes the window, so the footer
 * sits above the keyboard without an explicit avoider (avoids double-shifting).
 */
const RegisterStepLayout: React.FC<IRegisterStepLayoutProps> = ({ title, subtitle, footer, children }) => {
    const { currentStep } = useRegisterForm();
    const isIOS = Platform.OS === 'ios';

    return (
        <KeyboardAvoidingView
            behavior={undefined}
            keyboardVerticalOffset={0}
            className="flex-1"
        >
            <View className="flex-1 px-4">
                <StepProgress labels={STEP_LABELS} currentStep={currentStep} />
                <View className="mt-6 gap-1">
                    <Text className="text-3xl font-bold">{title}</Text>
                    {!!subtitle && <Text className="text-base text-muted-foreground">{subtitle}</Text>}
                </View>
                <View className="flex-1">
                    <KeyboardAwareScrollView
                        className="flex-1"
                        enableOnAndroid
                        enableAutomaticScroll
                        extraScrollHeight={20}
                        extraHeight={120}
                        enableResetScrollToCoords={false}
                        keyboardOpeningTime={0}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        contentContainerStyle={{ flexGrow: 1, paddingTop: 20, paddingBottom: 24 }}
                    >
                        {children}
                    </KeyboardAwareScrollView>
                </View>
                <View className="pb-4 pt-2">{footer}</View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default RegisterStepLayout;
