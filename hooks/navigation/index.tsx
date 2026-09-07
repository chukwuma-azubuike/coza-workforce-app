import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { Href } from 'expo-router';
import { NavButton } from '~/components/NavButton';

const usePreventGoBack = () => {
    const navigation = useNavigation();

    React.useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', e => {
            e.preventDefault();
        });
        return unsubscribe;
    }, [navigation]);
};

const useCustomBackNavigation = ({ targetRoute, params }: { targetRoute: Href; params?: any }) => {
    const navigation = useNavigation();

    const handleGoBack = () => {
        router.replace({ pathname: targetRoute as any, params });
    };

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => <NavButton onBack={handleGoBack} />,
        });
    }, [navigation, params, targetRoute]);
};

export { usePreventGoBack, useCustomBackNavigation };
