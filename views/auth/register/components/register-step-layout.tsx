import * as React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
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
 */
const RegisterStepLayout: React.FC<IRegisterStepLayoutProps> = ({ title, subtitle, footer, children }) => {
    const { currentStep } = useRegisterForm();
    const isIOS = Platform.OS === 'ios';

    return (
        <KeyboardAvoidingView
            behavior={isIOS ? 'padding' : 'height'}
            keyboardVerticalOffset={isIOS ? 0 : 20}
            className="flex-1"
        >
            <View className="flex-1 px-4 pt-6">
                <StepProgress labels={STEP_LABELS} currentStep={currentStep} />
                <View className="mt-6 gap-1">
                    <Text className="text-3xl font-bold">{title}</Text>
                    {!!subtitle && <Text className="text-base text-muted-foreground">{subtitle}</Text>}
                </View>
                <Animated.View key={currentStep} entering={FadeIn.duration(250)} className="flex-1">
                    <ScrollView
                        className="flex-1"
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                        keyboardDismissMode="on-drag"
                        contentContainerStyle={{ flexGrow: 1, paddingTop: 20, paddingBottom: 24 }}
                    >
                        {children}
                    </ScrollView>
                </Animated.View>
                <View className="pb-4 pt-2">{footer}</View>
            </View>
        </KeyboardAvoidingView>
    );
};

export default RegisterStepLayout;
