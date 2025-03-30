import React from 'react';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ParamListBase } from '@react-navigation/native';
import { APP_NAME, APP_SLOGAN } from '@env';
import Logo from '@components/atoms/logo';
import SupportLink from '../support-link';
import { KeyboardAvoidingView, Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { router } from 'expo-router';

const Welcome: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation }) => {
    const goToLogin = () => router.push('/login');
    const goToRegister = () => router.push('/verify-email');

    return (
        <SafeAreaView>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View className="w-full flex-1 justify-between pb-4">
                    <View className="space-y-10 px-4">
                        <View className="space-y-6 px-4 items-center justify-around">
                            <Logo />
                            <Text className="text-2xl">{APP_NAME}</Text>
                            <Text className="text-muted-foreground">{APP_SLOGAN}</Text>
                        </View>
                        <View className="space-y-1 pt-4">
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
