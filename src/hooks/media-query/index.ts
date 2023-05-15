import { Dimensions } from 'react-native';

const useMediaQuery = () => {
    const { width } = Dimensions.get('window');

    return {
        isMobile: width < 768,
        isTablet: width > 768,
    };
};

export default useMediaQuery;
