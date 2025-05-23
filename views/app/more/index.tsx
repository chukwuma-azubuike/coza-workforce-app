import React from 'react';
import { Text } from '~/components/ui/text';
import ViewWrapper from '@components/layout/viewWrapper';
import { TouchableOpacity, View } from 'react-native';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '@config/appConfig';
import useRole from '@hooks/role';
// import { useCustomBackNavigation } from '@hooks/navigation';
import { useGetUserByIdQuery } from '@store/services/account';
import useScreenFocus from '@hooks/focus';
import { Href, Link, router } from 'expo-router';
import useMoreRoutes from '~/hooks/more-routes';

const More: React.FC = () => {
    const {
        user: { userId },
    } = useRole();

    const { refetch, isLoading } = useGetUserByIdQuery(userId);
    useScreenFocus({
        onFocus: refetch,
    });

    const filteredRoutes = useMoreRoutes();

    const handlePress = (href: Href) => () => {
        router.push(href);
    };

    // useCustomBackNavigation({ targetRoute: 'Home' });

    return (
        <ViewWrapper scroll style={{ flex: 1 }} noPadding refreshing={isLoading} onRefresh={refetch}>
            <View className="mx-2 gap-3">
                {filteredRoutes?.map((route, idx) => (
                    <Link key={idx} href={route.href}>
                        <TouchableOpacity
                            key={idx}
                            activeOpacity={0.6}
                            onPress={handlePress(route.href)}
                            className="bg-muted-background mb-2 px-6 w-full rounded-xl h-16 justify-center"
                        >
                            <View className="justify-between items-center w-full flex-row gap-4">
                                <View className="flex-row justify-start gap-4 items-center">
                                    <Icon
                                        size={22}
                                        name={route.icon.name}
                                        type={route.icon.type}
                                        color={THEME_CONFIG.lightGray}
                                    />
                                    <Text className="text-muted-foreground">{route.name}</Text>
                                </View>
                                <Icon
                                    size={22}
                                    type="entypo"
                                    name="chevron-small-right"
                                    color={THEME_CONFIG.lightGray}
                                />
                            </View>
                        </TouchableOpacity>
                    </Link>
                ))}
            </View>
        </ViewWrapper>
    );
};

export default React.memo(More);
