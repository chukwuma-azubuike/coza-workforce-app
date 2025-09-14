import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { IService } from '~/store/types';
import UpdateService from '~/views/app/service-management/update-service';

const UpdateServiceScreen: React.FC = () => {
    const service = useLocalSearchParams() as unknown as IService;
    return <UpdateService {...service} />;
};

export default UpdateServiceScreen;
