import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native';

import ScreenHeader from '~/components/ScreenHeader';

const MoreScreenLayout: React.FC = () => {
    return (
        <SafeAreaView className="flex-1">
            <Stack>
                <Stack.Screen
                    name="index"
                    options={{
                        headerBackButtonDisplayMode: 'minimal',
                        header: props => <ScreenHeader name={props.route.name} />,
                    }}
                />
            </Stack>
        </SafeAreaView>
    );
};

export default MoreScreenLayout;
