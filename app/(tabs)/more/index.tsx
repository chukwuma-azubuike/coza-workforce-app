import React from 'react';
import { View } from 'react-native';
import More from '~/views/app/more';

const MoreScreen: React.FC = () => {
    return (
        <View className="flex-1 pt-6">
            <More />
        </View>
    );
};

export default MoreScreen;
