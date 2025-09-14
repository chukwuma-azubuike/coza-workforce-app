import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { View } from 'react-native';
import { Button } from './ui/button';
import { Text } from './ui/text';
import { RefreshCcw } from 'lucide-react-native';

export default function EASUpdates() {
    const { currentlyRunning, isUpdateAvailable, isUpdatePending } = Updates.useUpdates();

    useEffect(() => {
        if (isUpdatePending) {
            // Update has successfully downloaded; apply it now
            Updates.reloadAsync();
        }
    }, [isUpdatePending]);

    // If true, we show the button to download and run the update
    const showDownloadButton = isUpdateAvailable;

    // Show whether or not we are running embedded code or an update
    const runTypeMessage = currentlyRunning.isEmbeddedLaunch
        ? 'This app is running from built-in code'
        : 'This app is running an update';

    return (
        <View className="flex-1 gap-4">
            <View className="flex-1">
                <Text className="text-muted-foreground text-center">{runTypeMessage}</Text>
            </View>
            <View className="flex-1 gap-4">
                <Button icon={<RefreshCcw />} size="sm" onPress={() => Updates.checkForUpdateAsync()}>
                    Check manually for updates
                </Button>
                {showDownloadButton ? (
                    <Button size="sm" onPress={() => Updates.fetchUpdateAsync()}>
                        Download and run update
                    </Button>
                ) : null}
            </View>
            <StatusBar style="auto" />
        </View>
    );
}
