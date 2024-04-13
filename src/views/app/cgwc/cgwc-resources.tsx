import React from 'react';
import Loading from '@components/atoms/loading';
import useScreenFocus from '@hooks/focus';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ICGWCInstantMessage } from '@store/types';
import { View } from 'react-native';
import PDFView from 'react-native-view-pdf';

const CGWCResources: React.FC<NativeStackScreenProps<ParamListBase>> = ({ route, navigation }) => {
    const params = route.params as ICGWCInstantMessage;
    const { setOptions } = navigation;
    setOptions({
        title: params.title || 'CGWC Resource',
    });
    const resourceType = 'url';

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {};

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
        <View style={{ flex: 1 }}>
            {isLoading && <Loading />}
            <PDFView
                ref={pdfRef}
                fadeInDuration={250.0}
                style={{ flex: 1 }}
                onLoad={handleLoad}
                resource={params.messageLink}
                resourceType={resourceType}
                onError={handleError}
            />
        </View>
    );
};

export default React.memo(CGWCResources);
