import { SlottableTextProps } from '@rn-primitives/types';
import { Text } from './text';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME_CONFIG } from '~/config/appConfig';
import { IoniconTypes } from '~/types/app';

const FormErrorMessage: React.FC<SlottableTextProps> = props => {
    return (
        <View className="flex-row w-full items-center gap-2">
            <Ionicons size={22} name={'warning-outline' as IoniconTypes} color={THEME_CONFIG.error} />
            <Text {...props} className="text-destructive" />;
        </View>
    );
};

export default FormErrorMessage;
