import React from 'react';
import { Stack } from 'expo-router';
import useMoreRoutes from '~/hooks/more-routes';

const StackScreens: React.FC = () => {
    const filteredRoutes = useMoreRoutes();

    return (
        <Stack screenOptions={{ headerShown: false }}>
            {filteredRoutes.map(route => (
                <Stack.Screen
                    key={route.href}
                    options={{ headerShown: false }}
                    name={(route.href as string).replace('/', '')}
                />
            ))}
        </Stack>
    );
};

export default StackScreens;
