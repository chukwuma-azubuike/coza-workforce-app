import { BriefcaseIcon, MapPinIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';
import AvatarComponent from '~/components/atoms/avatar';
import { THEME_CONFIG } from '~/config/appConfig';
import { IUser } from '~/store/types';

const UserDetails = ({ user, isGlobalPastor }: { user: IUser | undefined; isGlobalPastor: boolean }) => {
    return (
        <View className="py-6 px-4 shadow-sm items-center flex-row gap-6 bg-white dark:bg-black">
            <View className="border-4 border-neutral-50 dark:border-neutral-800 h-fit w-fit rounded-full shadow-sm">
                <AvatarComponent
                    alt="current-user-avatar"
                    lastName={user?.lastName}
                    firstName={user?.firstName}
                    imageUrl={user?.pictureUrl || ''}
                    className="w-24 h-24"
                    isLoading={false}
                />
            </View>
            <View className="gap-2 py-2 items-start">
                <View
                    style={{
                        justifyContent: 'space-around',
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <View>
                        <Text className="font-semibold text-lg text-foreground">{user?.firstName}</Text>
                    </View>
                    <Text className="font-semibold text-lg text-foreground">{user?.lastName}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                    <BriefcaseIcon color={THEME_CONFIG.lightGray} size={16} />
                    <Text className="font-medium text-muted-foreground">
                        {isGlobalPastor ? 'Global Senior Pastor' : user?.department?.departmentName}
                    </Text>
                </View>
                <View className="flex-row items-center gap-1">
                    <MapPinIcon color={THEME_CONFIG.lightGray} size={16} />
                    <Text className="text-muted-foreground font-medium">{user?.campus?.campusName}</Text>
                </View>
            </View>
        </View>
    );
};

export default UserDetails;
