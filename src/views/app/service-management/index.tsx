import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import { AddButtonComponent } from '@components/atoms/button';
import { AllService } from './list';
import { IService } from '@store/types';

const ServiceManagement: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation, route }) => {
    const updatedListItem = route.params as IService;
    const gotoService = () => {
        navigation.navigate('Create service');
    };

    return (
        <ViewWrapper>
            <AllService updatedListItem={updatedListItem} />
            <AddButtonComponent zIndex={10} onPress={gotoService} />
        </ViewWrapper>
    );
};

export default ServiceManagement;
