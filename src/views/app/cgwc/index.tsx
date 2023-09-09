import React from 'react';
import useRole from '@hooks/role';
import { ParamListBase, useNavigation } from '@react-navigation/native';
// import useScreenFocus from '@hooks/focus';
import ViewWrapper from '@components/layout/viewWrapper';
import { CGWCList } from './list';
import { ICGWC } from '@store/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AddButtonComponent } from '@components/atoms/button';
import If from '@components/composite/if-container';

const CGWC: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation, route }) => {
    const { isSuperAdmin } = useRole();
    const { navigate } = useNavigation();
    const updatedListItem = route.params as ICGWC;

    //TODO: To be determined by product team discuss
    // const handleReroute = () => {
    //     if (!isSuperAdmin) {
    //     return navigate('CGWC Details' as never);
    //     }
    // };

    // useScreenFocus({
    //     onFocus: handleReroute,
    // });

    // React.useEffect(() => {
    //     handleReroute();
    // }, []);

    const gotoCreateCGWC = () => {
        navigation.navigate('Create CGWC');
    };

    return (
        <ViewWrapper>
            <CGWCList updatedListItem={updatedListItem} />
            <If condition={isSuperAdmin}>
                <AddButtonComponent zIndex={10} onPress={gotoCreateCGWC} />
            </If>
        </ViewWrapper>
    );
};

export default CGWC;
