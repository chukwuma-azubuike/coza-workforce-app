import { BACKGROUND_THEME, TEXT_THEME } from '@config/appConfig';
import { useColorMode } from 'native-base';
import { useColorScheme } from 'react-native';

const useAppColorMode = () => {
    const { colorMode, accessibleColors, setAccessibleColors, setColorMode, toggleColorMode } = useColorMode();
    const scheme = useColorScheme() as keyof typeof BACKGROUND_THEME;

    const isLightMode = colorMode === 'light';
    const isDarkMode = colorMode === 'dark';
    const backgroundColor = BACKGROUND_THEME[scheme];
    const textColor = TEXT_THEME[scheme];

    return {
        isDarkMode,
        isLightMode,
        colorMode,
        textColor,
        accessibleColors,
        setAccessibleColors,
        setColorMode,
        toggleColorMode,
        backgroundColor,
    };
};

export default useAppColorMode;
