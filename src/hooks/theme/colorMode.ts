import { BACKGROUND_THEME, BORDER_THEME, TEXT_THEME, TEXT_THEME_MAIN } from '@config/appConfig';
import { useColorMode } from 'native-base';
import { useColorScheme } from 'react-native';

const useAppColorMode = () => {
    const { colorMode, accessibleColors, setAccessibleColors, setColorMode, toggleColorMode } = useColorMode();
    const scheme = useColorScheme() as keyof typeof BACKGROUND_THEME;

    const isLightMode = colorMode === 'light';
    const isDarkMode = colorMode === 'dark';
    const borderColor = BORDER_THEME[scheme];
    const backgroundColor = BACKGROUND_THEME[scheme];
    const textColor = TEXT_THEME[scheme];
    const textColorMain = TEXT_THEME_MAIN[scheme];

    return {
        isDarkMode,
        isLightMode,
        colorMode,
        textColor,
        borderColor,
        textColorMain,
        accessibleColors,
        setAccessibleColors,
        setColorMode,
        toggleColorMode,
        backgroundColor,
    };
};

export default useAppColorMode;
