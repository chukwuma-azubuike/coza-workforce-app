import React, { useCallback } from 'react';
import useRole from '@hooks/role';
import ViewWrapper from '@components/layout/viewWrapper';
import { CongressList } from './list';
import { ICongress } from '@store/types';
import { AddButtonComponent } from '@components/atoms/button';
import If from '@components/composite/if-container';
import { router, useLocalSearchParams } from 'expo-router';

const Congress: React.FC = () => {
    const { isSuperAdmin } = useRole();
    const updatedListItem = useLocalSearchParams() as unknown as ICongress;

    const gotoCreateCongress = useCallback(() => {
        router.push('/congress/create-congress');
    }, []);

    return (
        <ViewWrapper className="pt-4 flex-1">
            <CongressList updatedListItem={updatedListItem} />
            <If condition={isSuperAdmin}>
                <AddButtonComponent className="z-10" onPress={gotoCreateCongress} />
            </If>
        </ViewWrapper>
    );
};

export default React.memo(Congress);
