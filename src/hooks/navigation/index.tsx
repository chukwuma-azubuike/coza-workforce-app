import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { NavigationBackButton } from '@components/atoms/button';

const usePreventGoBack = () => {
    const navigation = useNavigation().addListener;

    React.useEffect(() => {
        navigation('beforeRemove', e => {
            e.preventDefault();
        });
    }, [navigation]);
};

const useCustomBackNavigation = ({ targetRoute, params }: { targetRoute: string; params?: any }) => {
    const navigation = useNavigation();

    const handleGoBack = () => {
        navigation.navigate(targetRoute as never, params as never);
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => <NavigationBackButton onPress={handleGoBack} />,
        });
    }, [navigation, params, targetRoute]);
};

export { usePreventGoBack, useCustomBackNavigation };
