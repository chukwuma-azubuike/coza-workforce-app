import { SlottableTextProps } from '@rn-primitives/types';
import { Text } from './text';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME_CONFIG } from '~/config/appConfig';
import { IoniconTypes } from '~/types/app';

const FormErrorMessage: React.FC<SlottableTextProps> = props => {
    return (
        <View className="flex-row w-full gap-1.5">
            <Ionicons
                size={16}
                name={'warning-outline' as IoniconTypes}
                color={THEME_CONFIG.error}
                className="mt-0.5"
            />
            <Text {...props} className="text-base text-destructive line-clamp-none" />
        </View>
    );
};

export default FormErrorMessage;
