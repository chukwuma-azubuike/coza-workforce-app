import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import Empty from '../../../components/atoms/empty';
import { AddButtonComponent } from '../../../components/atoms/button';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import PermissionStats from './permission-stats';
import PermissionsList from './permissions-list';

const Permissions: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    const handlePress = () => {
        navigation.navigate('Request permission');
    };

    return (
        <ViewWrapper>
            <>
                {/* <Empty message="You haven't requested any permissions." /> */}
                <PermissionStats />
                <AddButtonComponent zIndex={10} onPress={handlePress} />
                <PermissionsList />
            </>
        </ViewWrapper>
    );
};

export default Permissions;
