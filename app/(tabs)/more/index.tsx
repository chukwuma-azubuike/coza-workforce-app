import React, { Suspense } from 'react';
import { View } from 'react-native';
import Loading from '~/components/atoms/loading';
const More = React.lazy(() => import('~/views/app/more'));

const MoreScreen: React.FC = () => {
    return (
        <View className="flex-1 pt-6">
            <Suspense fallback={<Loading cover />}>
                <More />
            </Suspense>
        </View>
    );
};

export default MoreScreen;
