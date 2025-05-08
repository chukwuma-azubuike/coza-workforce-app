import { useNavigation } from 'expo-router';
import React from 'react';
import ScreenHeader from '~/components/ScreenHeader';
import CongressDetails from '~/views/app/congress/congress-details';

const CongressDetailsScreen: React.FC = () => {
    // const { setOptions } = useNavigation();

    // setOptions({
    //     header: (props: any) => <ScreenHeader name={props.route.name} />,
    // });
    return <CongressDetails />;
};

export default CongressDetailsScreen;
