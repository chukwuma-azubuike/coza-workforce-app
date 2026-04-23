import { Text } from '~/components/ui/text';
import React from 'react';
import { HomeContext } from '../context';
import { THEME_CONFIG } from '@config/appConfig';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CampusLocation = () => {
    const {
        latestService: { data, isError, isLoading },
    } = React.useContext(HomeContext);

    return (
        <View className="items-center">
            <View className="flex-row items-center">
                {data?.campus?.campusName && (
                    <Ionicons
                        color={!isError && !isLoading ? THEME_CONFIG.gray : 'transparent'}
                        name="location-sharp"
                        size={15}
                    />
                )}
                <Text className="font-semibold text-muted-foreground text-base ml-1">
                    {!isError ? data?.campus?.campusName : ''}
                </Text>
            </View>
        </View>
    );
};

export default React.memo(CampusLocation);
