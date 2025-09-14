import { SafeAreaView, StyleSheet, View } from 'react-native';
import { NavButton } from './NavButton';
import { Text } from './ui/text';
import formatRouteTitle from '~/utils/formatRouteTitle';
import { usePathname } from 'expo-router';

const ScreenHeader: React.FC<{ name: string; onBack?: () => void; bypassFormat?: boolean }> = ({
    name,
    onBack,
    bypassFormat = false,
}) => {
    const pathname = usePathname();

    return (
        <SafeAreaView>
            <View style={styles.container}>
                <NavButton onBack={onBack} />
                <Text className="text-center font-semibold flex-1">
                    {bypassFormat ? name : formatRouteTitle(name, pathname)}
                </Text>
                <View className="w-12" />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

export default ScreenHeader;
