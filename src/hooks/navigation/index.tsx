import React from 'react';
import { useNavigation } from '@react-navigation/native';
import useAppColorMode from '../theme/colorMode';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../config/appConfig';
import { IconButton } from 'native-base';

const usePreventGoBack = () => {
    const navigation = useNavigation().addListener;

    React.useEffect(() => {
        navigation('beforeRemove', e => {
            e.preventDefault();
        });
    }, [navigation]);
};

const useCustomBackNavigation = ({ targetRoute }: { targetRoute: string }) => {
    const navigation = useNavigation();

    const handleGoBack = () => {
        navigation.navigate(targetRoute as never);
    };
    const { isDarkMode } = useAppColorMode();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <IconButton
                    ml={2}
                    fontSize="lg"
                    _light={{
                        _pressed: { backgroundColor: 'gray.200' },
                    }}
                    _dark={{
                        _pressed: { backgroundColor: 'gray.800' },
                    }}
                    onPress={handleGoBack}
                    icon={
                        <Icon
                            size={24}
                            name="keyboard-backspace"
                            type="material-community"
                            color={isDarkMode ? THEME_CONFIG.lightGray : 'black'}
                        />
                    }
                />
            ),
        });
    }, [navigation]);
};

export { usePreventGoBack, useCustomBackNavigation };
