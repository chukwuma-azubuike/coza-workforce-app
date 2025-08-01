import { ParamListBase, useNavigation } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import useScreenFocus from '@hooks/focus';

const CampusGroupHeads: React.FC<NativeStackScreenProps<ParamListBase>> = ({ navigation, route }) => {
    const { navigate } = useNavigation();

    const handleReroute = () => {
        return navigate('Group Head Campuses' as never);
    };

    useScreenFocus({
        onFocus: handleReroute,
    });

    React.useEffect(() => {
        handleReroute();
    }, []);

    return <ViewWrapper className="flex-1">{null}</ViewWrapper>;
};

export default CampusGroupHeads;
