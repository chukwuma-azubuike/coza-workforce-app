import React from 'react';
import ViewWrapper from '../../../components/layout/viewWrapper';
import Empty from '../../../components/atoms/empty';
import { AddButtonComponent } from '../../../components/atoms/button';
import { ParamListBase } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
    CampusPermissions,
    MyPermissionsList,
    MyTeamPermissionsList,
} from './permissions-list';
import ButtonSelector, {
    useButtonSelector,
} from '../../../components/composite/button-selector';
import RenderContainer from '../../../components/composite/render-container';

const Permissions: React.FC<NativeStackScreenProps<ParamListBase>> = ({
    navigation,
}) => {
    const handlePress = () => {
        navigation.navigate('Request permission');
    };

    const { focused, setFocused } = useButtonSelector();

    return (
        <ViewWrapper>
            <>
                {/* <Empty message="You haven't requested any permissions." /> */}
                <AddButtonComponent zIndex={10} onPress={handlePress} />
                <ButtonSelector
                    focused={focused}
                    setFocused={setFocused}
                    items={[
                        { title: 'My Permissions' },
                        { title: 'Team Permissions' },
                        { title: 'Campus Permissions' },
                    ]}
                />
                <RenderContainer
                    renderIndex={focused}
                    components={[
                        <MyPermissionsList />,
                        <MyTeamPermissionsList />,
                        <CampusPermissions />,
                    ]}
                />
            </>
        </ViewWrapper>
    );
};

export default Permissions;
