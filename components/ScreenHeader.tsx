import { SafeAreaView, View } from 'react-native';
import { NavButton } from './NavButton';
import { Text } from './ui/text';
import formatRouteTitle from '~/utils/formatRouteTitle';
import { usePathname } from 'expo-router';

const ScreenHeader: React.FC<{ name: string }> = ({ name }) => {
    const pathname = usePathname();

    return (
        <SafeAreaView>
            <View className="flex-row items-center">
                <NavButton />
                <Text className="text-center font-semibold flex-1">{formatRouteTitle(name, pathname)}</Text>
                <View className="w-12" />
            </View>
        </SafeAreaView>
    );
};

export default ScreenHeader;
