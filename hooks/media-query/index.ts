import { useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

interface ScreenDimensions {
    width: number;
    height: number;
}

interface MediaQuery {
    isMobile: boolean;
    isTabletPortrait: boolean;
    isTablet: boolean;
}

const useMediaQuery = (): MediaQuery => {
    const [screenDimensions, setScreenDimensions] = useState<ScreenDimensions>(Dimensions.get('window'));
    const [isMounted, setIsMounted] = useState(true);

    useEffect(() => {
        const handleDimensionChange = ({ window }: { window: ScaledSize }) => {
            if (isMounted) {
                setScreenDimensions(window);
            }
        };

        Dimensions.addEventListener('change', handleDimensionChange);

        return () => {
            setIsMounted(false);
        };
    }, [isMounted]);

    const { width } = screenDimensions;

    return {
        isMobile: width <= 480,
        isTabletPortrait: width > 480 && width < 830,
        isTablet: width > 830,
    };
};

export default useMediaQuery;
