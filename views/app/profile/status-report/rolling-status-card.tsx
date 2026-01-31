import { CheckCircleIcon, RibbonIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Card } from '~/views/app/profile/status-report/card';

const RollingStatusCard = () => {
    return (
        <View className="px-4 pt-10">
            <Card className="gap-4 rounded-2xl bg-background shadow-sm p-5">
                <Text className="text-xl text-foreground font-medium">Rolling Status</Text>

                <View className="flex-row items-center gap-2 mb-6">
                    <View className="flex-row items-center justify-center bg-green-700 rounded-full w-12 h-12">
                        <CheckCircleIcon color={'white'} size={22} />
                    </View>
                    <View>
                        <Text className="font-medium text-foreground">Active</Text>
                        <Text className="text-muted-foreground">Good standing</Text>
                    </View>
                </View>

                <View className="flex-row items-start gap-2 p-4 border border-green-200 bg-green-50 rounded-xl">
                    <View className="mt-1">
                        <RibbonIcon color={'green'} size={12} />
                    </View>
                    <Text className="whitespace-normal">You're maintaining a consistent atendance. Keep it up!</Text>
                </View>

                <LinearGradient
                    colors={['#10b981', '#14b8a6']} // green-500 to teal-500
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }} // left to right
                    style={{ borderRadius: 12 }}
                >
                    <View className="flex-row items-center justify-between p-4 bg-gradient-to-r from-green-500 to-cyan-500 rounded-xl">
                        <View className="flex-row items-center gap-2">
                            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                                <Text>🔥</Text>
                            </View>
                            <View>
                                <Text className="font-semibold text-lg text-white">Active Streak</Text>
                                <Text className="whitespace-normal text-white font-medium">
                                    Keep the momentum going!
                                </Text>
                            </View>
                        </View>

                        <View className="items-end">
                            <Text className="text-3xl font-bold text-white">2</Text>
                            <Text className="text-white font-medium">months</Text>
                        </View>
                    </View>
                </LinearGradient>
            </Card>
        </View>
    );
};

export default RollingStatusCard;
