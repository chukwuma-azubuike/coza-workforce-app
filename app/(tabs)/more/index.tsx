import React from 'react';
import { SafeAreaView } from 'react-native';
import More from '~/views/app/more';

const MoreScreen: React.FC = () => {
    return (
        <SafeAreaView className="flex-1">
            <More />
        </SafeAreaView>
    );
};

export default MoreScreen;
