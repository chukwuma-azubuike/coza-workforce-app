import { usePathname } from 'expo-router';
import React from 'react';
import { Colors } from '~/constants/Colors';
import { useColorScheme } from '~/lib/useColorScheme';
import formatRouteTitle from '~/utils/formatRouteTitle';

const useRouteOptions = () => {
    const pathname = usePathname();
    const { isDarkColorScheme } = useColorScheme();

    // Memoize general screen options to avoid unnecessary re-renders.
    const generalScreenOptions = React.useMemo(
        () => ({
            headerTitle: formatRouteTitle(pathname),
            headerBackButtonDisplayMode: 'minimal',
            headerStyle: {
                backgroundColor: isDarkColorScheme ? Colors.dark.background : Colors.light.background,
            },
        }),
        [isDarkColorScheme, pathname]
    );

    return {
        generalScreenOptions,
    };
};

export default useRouteOptions;
