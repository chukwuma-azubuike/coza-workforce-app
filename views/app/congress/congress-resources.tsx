import React from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import Pdf from 'react-native-pdf-jsi';
import useScreenFocus from '@hooks/focus';
import { ICongressInstantMessage } from '@store/types';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';
import FormErrorMessage from '~/components/ui/error-message';
import { Text } from '~/components/ui/text';

const CongressResources: React.FC = () => {
    const params = useLocalSearchParams() as unknown as ICongressInstantMessage;
    const { setOptions } = useNavigation();

    setOptions({
        title: params.title,
    });

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = (error: any) => {
        setIsLoading(false);
        setLoadProgress(0);
        setError(JSON.stringify(error));
    };

    const handleLoadProgress = (percent: number) => {
        setIsLoading(true);
        setLoadProgress(percent);
    };

    const pdfRef = React.useRef<any>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [error, setError] = React.useState<string>('');
    const [loadProgress, setLoadProgress] = React.useState<number>(0);

    const reloadPDF = async () => {
        if (!pdfRef.current) {
            return;
        }

        try {
            await pdfRef.current.reload();
        } catch (err) {}
    };

    useScreenFocus({
        onFocus: reloadPDF,
    });

    return (
        <View style={styles.container}>
            {error ? (
                <FormErrorMessage>{error}</FormErrorMessage>
            ) : isLoading ? (
                <View className="flex-1 flex-row gap-2 justify-center items-center w-full">
                    <ActivityIndicator className="text-foreground" />
                    <Text className="flex font-semibold">{loadProgress}%</Text>
                </View>
            ) : (
                <Pdf
                    style={styles.pdf}
                    trustAllCerts={false}
                    onError={handleError}
                    onLoadComplete={handleLoad}
                    onLoadProgress={handleLoadProgress}
                    source={{ uri: params.messageLink, cache: true }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    pdf: {
        flex: 1,
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
});

export default React.memo(CongressResources);
