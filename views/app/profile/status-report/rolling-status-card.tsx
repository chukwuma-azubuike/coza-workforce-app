import { CheckCircleIcon, RibbonIcon, CircleXIcon, BanIcon, FileQuestionIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { IGetUserStatusHistoryResponse } from '~/store/services/account';
import { Card } from '~/views/app/profile/status-report/card';
import { Skeleton } from '~/components/ui/skeleton';
import { IUserStatus } from '~/store/types';
import { getStatusContent, calculateMonthStreak } from '~/views/app/profile/status-report/utils';

type UserStatus = IUserStatus;

const RollingStatusCardSkeleton = () => {
    return (
        <View className="px-4 pt-10">
            <Card className="gap-4 rounded-2xl bg-background shadow-sm p-5">
                {/* Title skeleton */}
                <Skeleton className="h-7 w-32 rounded-md" />

                {/* Status section skeleton */}
                <View className="flex-row items-center gap-2 mb-6">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <View className="gap-2">
                        <Skeleton className="h-5 w-20 rounded-md" />
                        <Skeleton className="h-4 w-28 rounded-md" />
                    </View>
                </View>

                {/* Info banner skeleton */}
                <View className="flex-row items-start gap-2 p-4 border rounded-xl">
                    <Skeleton className="w-3 h-3 rounded-full mt-1" />
                    <View className="flex-1 gap-1">
                        <Skeleton className="h-4 w-full rounded-md" />
                        <Skeleton className="h-4 w-3/4 rounded-md" />
                    </View>
                </View>

                {/* Streak card skeleton */}
                <View className="p-4 rounded-xl">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-row items-center gap-2">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <View className="gap-2">
                                <Skeleton className="h-5 w-28 rounded-md" />
                                <Skeleton className="h-4 w-36 rounded-md" />
                            </View>
                        </View>
                        <View className="items-end gap-1">
                            <Skeleton className="h-9 w-12 rounded-md" />
                            <Skeleton className="h-4 w-16 rounded-md" />
                        </View>
                    </View>
                </View>
            </Card>
        </View>
    );
};

// Helper function to get the appropriate icon based on status
const getStatusIcon = (status: UserStatus | undefined) => {
    switch (status) {
        case 'ACTIVE':
            return CheckCircleIcon;
        case 'DORMANT':
        case 'INACTIVE':
            return CircleXIcon;
        case 'BLACKLISTED':
            return BanIcon;
        default:
            return FileQuestionIcon; // Default icon for unknown status
    }
};

// Helper function to format status text to sentence case
const formatStatusText = (status: string | undefined): string => {
    if (!status) return 'Unknown';
    // Convert to sentence case: "ACTIVE" -> "Active"
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

type RollingStatusCardProps = {
    statusReport: IGetUserStatusHistoryResponse | undefined;
    isFetching: boolean;
};
const RollingStatusCard: React.FC<RollingStatusCardProps> = ({ statusReport, isFetching }) => {
    if (isFetching) {
        return <RollingStatusCardSkeleton />;
    }

    const status = (statusReport?.currentReport?.status as UserStatus) ?? 'UNKNOWN';
    const content = getStatusContent(status);

    // Get the appropriate icon component based on status
    const StatusIcon = getStatusIcon(status);

    // Format status text to sentence case
    const formattedStatus = formatStatusText(status);

    // Calculate the streak based on status history
    const monthStreak = calculateMonthStreak(statusReport?.history || [], status);
    const streakLabel = monthStreak === 1 ? 'month' : 'months';

    return (
        <View className="px-4">
            <Card className="gap-4 rounded-2xl bg-background shadow-sm py-5 px-0">
                <Text className="text-xl text-foreground font-medium">Rolling Status</Text>

                <View className="flex-row items-center gap-2 mb-6">
                    <View
                        className={`flex-row items-center justify-center ${content.iconBgColor} rounded-full w-12 h-12`}
                    >
                        <StatusIcon color={'white'} size={22} />
                    </View>
                    <View>
                        <Text className="font-medium text-foreground">{formattedStatus}</Text>
                        <Text className="text-muted-foreground">{content.subtitle}</Text>
                    </View>
                </View>

                <View
                    className={`flex-row items-start gap-2 p-4 border ${content.bannerBorderColor} ${content.bannerBgColor} rounded-xl`}
                >
                    <View className="mt-1">
                        <RibbonIcon color={content.iconColor} size={12} />
                    </View>
                    <Text className="whitespace-normal">{content.message}</Text>
                </View>

                <LinearGradient
                    colors={content.gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }} // left to right
                    style={{ borderRadius: 12 }}
                >
                    <View className="flex-row items-center justify-between p-4 bg-gradient-to-r from-green-500 to-cyan-500 rounded-xl">
                        <View className="flex-row items-center gap-2">
                            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                                <Text>{content.emoji}</Text>
                            </View>
                            <View>
                                <Text className="font-semibold text-lg text-foreground">{content.streakTitle}</Text>
                                <Text className="whitespace-normal text-foreground font-medium max-w-[200px]">
                                    {content.streakSubtitle}
                                </Text>
                            </View>
                        </View>

                        <View className="items-end">
                            <Text className="text-3xl font-bold text-foreground">{monthStreak}</Text>
                            <Text className="text-foreground font-medium">{streakLabel}</Text>
                        </View>
                    </View>
                </LinearGradient>
            </Card>
        </View>
    );
};

export default RollingStatusCard;
