import React from 'react';
import { useNavigation } from '@react-navigation/native';
import useAppColorMode from '../theme/colorMode';
import { Icon } from '@rneui/themed';
import { THEME_CONFIG } from '../../config/appConfig';
import { IconButton } from 'native-base';
import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';
import { extractIncomingNotifications } from '../../utils/extractIncomingNotifications';

const usePreventGoBack = () => {
    const navigation = useNavigation().addListener;

    React.useEffect(() => {
        navigation('beforeRemove', e => {
            e.preventDefault();
        });
    }, [navigation]);
};

const useCustomBackNavigation = ({ targetRoute, params }: { targetRoute: string; params?: any }) => {
    const navigation = useNavigation();

    const handleGoBack = () => {
        navigation.navigate(targetRoute as never, params as never);
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
    }, [navigation, params, targetRoute]);
};

export interface IDeepLink {
    route: string;
    data?: any;
    id?: string;
}

const useDeepLinkNavigation = () => {
    const { navigate } = useNavigation();

    const handleNavigation = (deepLink: IDeepLink, tabKey: string) => {
        navigate(deepLink as never, { tabKey });
    };

    const [initialRoute, setInitialRoute] = React.useState<string>('Home');
    const [tabKey, setTabKey] = React.useState<string>();

    // Background Notifications handler
    React.useEffect(() => {
        messaging().onNotificationOpenedApp(remoteMessage => {
            const { deepLink, tabKey } = extractIncomingNotifications(remoteMessage);

            setTabKey(tabKey);
            handleNavigation(deepLink as unknown as IDeepLink, tabKey as any);
        });

        // Check whether an initial notification is available
        messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    const { deepLink, tabKey } = extractIncomingNotifications(remoteMessage);
                    setTabKey(tabKey);
                    setInitialRoute(deepLink as unknown as string);
                }
            });
    }, []);

    // Foreground Notifications handler
    React.useEffect(() => {
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            const { title, body, deepLink, tabKey } = extractIncomingNotifications(remoteMessage);

            Alert.alert(
                title as string,
                body,
                !!deepLink
                    ? [
                          { text: 'Cancel', style: 'cancel' },
                          {
                              text: 'View',
                              onPress: () => {
                                  setTabKey(tabKey);
                                  handleNavigation(deepLink as unknown as IDeepLink, tabKey as any);
                              },
                          },
                      ]
                    : undefined
            );
        });

        return unsubscribe;
    }, []);

    return { tabKey, initialRoute };
};

export { usePreventGoBack, useCustomBackNavigation, useDeepLinkNavigation };
