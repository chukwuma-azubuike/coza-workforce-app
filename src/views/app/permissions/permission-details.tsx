import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card, HStack, Text, VStack } from 'native-base';
import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { IPermission } from '../../../store/types';

interface IPermissionDetails {
    navigation: NativeStackScreenProps<ParamListBase, string, undefined>;
    details: IPermission;
}

const PermissionDetails: React.FC<IPermissionDetails> = props => {
    const {
        details: {
            requestor,
            startDate,
            endDate,
            description,
            dateCreated,
            status,
            comment,
        },
        navigation,
    } = props;

    return (
        <ViewWrapper scroll>
            <Card bg="gray.50" p={2}>
                <VStack>
                    <HStack>
                        <Text bold>Requester</Text>
                        <Text>{requestor}</Text>
                    </HStack>
                </VStack>
            </Card>
        </ViewWrapper>
    );
};

export default PermissionDetails;
