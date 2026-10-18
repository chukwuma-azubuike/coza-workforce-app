import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import MediaViewer from '~/components/composite/media-viewer';

/**
 * Opens the resource attached to a congress instant message. The link can be a
 * PDF, an image, a video, an Office document or an ordinary web page —
 * `MediaViewer` resolves which and renders it accordingly.
 */
const CongressResources: React.FC = () => {
    const params = useLocalSearchParams<{ title?: string; messageLink?: string }>();

    return (
        <View className="flex-1 bg-background">
            <MediaViewer url={params?.messageLink} title={params?.title} />
        </View>
    );
};

export default React.memo(CongressResources);
