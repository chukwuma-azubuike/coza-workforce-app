/**
 * @format
 */
import React from 'react';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { extractIncomingNotifications } from './src/utils/extractIncomingNotifications';

function HeadlessCheck({ isHeadless }) {
    // If App has been launched in the background by iOS, then ignore.
    if (isHeadless) {
        return null;
    }

    return <App />;
}

messaging().setBackgroundMessageHandler(async remoteMessage => {
    const { title, body, data } = extractIncomingNotifications(remoteMessage);

    notifee.displayNotification({
        title,
        body,
        data: JSON.stringify(data)
    })

    //handle background event for when the notification is displayed in the background
    notifee.onBackgroundEvent(async ({ type, detail }) => {
        const { notification, pressAction } = detail;

        // Remove the notification
        if (type === EventType.ACTION_PRESS) {
            await notifee.cancelNotification(notification.id);
            // Or perform another action (Deeplink action)
        }
    });
});

AppRegistry.registerComponent(appName, () => HeadlessCheck);
