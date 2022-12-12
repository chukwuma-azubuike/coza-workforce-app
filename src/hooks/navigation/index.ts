import React from 'react';
import { useNavigation } from '@react-navigation/native';

const usePreventGoBack = () => {
    const navigation = useNavigation().addListener;

    React.useEffect(() => {
        navigation('beforeRemove', e => {
            e.preventDefault();
        });
    }, [navigation]);
};

export { usePreventGoBack };
