import React from 'react';
import Logo from '@components/atoms/logo';
import SupportLink from '../support-link';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { router } from 'expo-router';
import APP_ENV from '~/config/envConfig';

const Welcome: React.FC = () => {
    const goToLogin = () => router.push('/login');
    const goToRegister = () => router.push('/register');

    return (
        <SafeAreaView className="flex-1">
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <View className="w-full flex-1 justify-around pb-4">
                    <View className="gap-6 px-4">
                        <View className="gap-6 px-4 items-center justify-around">
                            <Logo />
                            <Text className="text-2xl">{APP_ENV.APP_NAME}</Text>
                            <Text className="text-muted-foreground">{APP_ENV.APP_SLOGAN}</Text>
                        </View>
                        <View className="gap-6 pt-4">
                            <Button onPress={goToLogin}>Login</Button>
                            <Button variant="outline" onPress={goToRegister}>
                                Register
                            </Button>
                        </View>
                    </View>
                    <View className="w-full justify-center items-center">
                        <SupportLink />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default React.memo(Welcome);
