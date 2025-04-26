import React from 'react';
import useRole from '@hooks/role';
import { ParamListBase } from '@react-navigation/native';
// import useScreenFocus from '@hooks/focus';
import ViewWrapper from '@components/layout/viewWrapper';
import { CongressList } from './list';
import { ICongress } from '@store/types';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AddButtonComponent } from '@components/atoms/button';
import If from '@components/composite/if-container';

const Congress: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation, route }) => {
    const { isSuperAdmin } = useRole();
    const updatedListItem = route.params as ICongress;

    //TODO: To be determined by product team discuss
    // const handleReroute = () => {
    //     if (!isSuperAdmin) {
    //     return navigate('Congress Details' as never);
    //     }
    // };

    // useScreenFocus({
    //     onFocus: handleReroute,
    // });

    // React.useEffect(() => {
    //     handleReroute();
    // }, []);

    const gotoCreateCongress = () => {
        navigation.navigate('Create Congress');
    };

    return (
        <ViewWrapper>
            <CongressList updatedListItem={updatedListItem} />
            <If condition={isSuperAdmin}>
                <AddButtonComponent className='z-10' onPress={gotoCreateCongress} />
            </If>
        </ViewWrapper>
    );
};

export default React.memo(Congress);
