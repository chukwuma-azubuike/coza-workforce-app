import React from 'react';
import ViewWrapper from '@components/layout/viewWrapper';
import useScreenFocus from '@hooks/focus';
import { router } from 'expo-router';

const CampusGroupHeads: React.FC = () => {
    const handleReroute = () => {
        return router.push('/group-head-campus/group-head-campuses');
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
