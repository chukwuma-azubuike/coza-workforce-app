import { useColorMode } from 'native-base';

const useAppColorMode = () => {
    const { colorMode, accessibleColors, setAccessibleColors, setColorMode, toggleColorMode } = useColorMode();

    const isLightMode = colorMode === 'light';
    const isDarkMode = colorMode === 'dark';

    return {
        isDarkMode,
        isLightMode,
        colorMode,
        accessibleColors,
        setAccessibleColors,
        setColorMode,
        toggleColorMode,
    };
};

export default useAppColorMode;
