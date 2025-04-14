import { Text } from '~/components/ui/text';

import React from 'react';
import Logo from '@components/atoms/logo';
import SupportLink from '../support-link';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native';
import { Button } from '~/components/ui/button';
import { router } from 'expo-router';
import APP_ENV from '~/config/envConfig';

const Welcome: React.FC = () => {
    const goToLogin = () => router.push('/login');
    const goToRegister = () => router.push('/verify-email');

    return (
        <SafeAreaView className="flex-1">
            <View className="w-full flex-1 justify-between pb-4">
                <View className="gap-10 px-4 justify-center pt-20">
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
                <View className="w-full justify-end items-center">
                    <SupportLink />
                </View>
            </View>
        </SafeAreaView>
    );
};

export default React.memo(Welcome);
