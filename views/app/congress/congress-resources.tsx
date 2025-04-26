import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Pdf from 'react-native-pdf';
import Loading from '@components/atoms/loading';
import useScreenFocus from '@hooks/focus';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ICongressInstantMessage } from '@store/types';

const CongressResources: React.FC<NativeStackScreenProps<ParamListBase>> = ({ route, navigation }) => {
    const params = route.params as ICongressInstantMessage;
    const { setOptions } = navigation;
    setOptions({
        title: params.title || 'Congress Resource',
    });

    const handleLoad = () => {
        setIsLoading(false);
    };

    const pdfRef = React.useRef<any>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);

    const reloadPDF = async () => {
        setIsLoading(true);
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
            {isLoading && <Loading />}
            <Pdf
                style={styles.pdf}
                trustAllCerts={false}
                onLoadComplete={handleLoad}
                source={{ uri: params.messageLink, cache: true }}
            />
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
