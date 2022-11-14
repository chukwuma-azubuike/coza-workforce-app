import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import { List, VStack } from 'native-base';
import { AppRoutes, IAppRoute } from '../../../config/navigation';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

const More: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    const handlePress = (route: IAppRoute) => () =>
        navigation.navigate(route.name);

    return (
        <ViewWrapper>
            <VStack>
                <List>
                    {AppRoutes.map((route, idx) => (
                        <List.Item key={idx} onPress={handlePress(route)}>
                            {route.name}
                        </List.Item>
                    ))}
                </List>
            </VStack>
        </ViewWrapper>
    );
};

export default More;
