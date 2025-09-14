import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Pdf from 'react-native-pdf';
import Loading from '@components/atoms/loading';
import useScreenFocus from '@hooks/focus';
import { ICongressInstantMessage } from '@store/types';
import { useNavigation } from '@react-navigation/native';
import { useLocalSearchParams } from 'expo-router';

const CongressResources: React.FC = () => {
    const params = useLocalSearchParams() as unknown as ICongressInstantMessage;
    const { setOptions } = useNavigation();

    setOptions({
        title: params.title,
    });

    const handleLoad = () => {
        setIsLoading(false);
    };

    const pdfRef = React.useRef<any>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);

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
            {isLoading ? (
                <Loading className="flex-1" spinnerProps={{ className: 'flex-1 justify-center mx-auto' }} />
            ) : (
                <Pdf
                    style={styles.pdf}
                    trustAllCerts={false}
                    onLoadComplete={handleLoad}
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
