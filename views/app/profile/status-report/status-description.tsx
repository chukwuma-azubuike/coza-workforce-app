import { BanIcon, CheckCircleIcon, CircleAlertIcon, CircleXIcon } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { cn } from '~/lib/utils';
import { IAttendanceStatus } from '~/store/types';
import { AttendanceStatusRing } from '~/views/app/profile/status-report/attendance-history';
import { Card } from '~/views/app/profile/status-report/card';

type StatusCardProps = {
    children: React.ReactNode;
    color: 'green' | 'blue' | 'amber' | 'red';
    className?: string;
};

const StatusCard = ({ children, color, className }: StatusCardProps) => {
    const cardClasses = (() => {
        switch (color) {
            case 'green':
                return 'bg-green-50 border-green-200';
            case 'amber':
                return 'bg-amber-50 border-amber-200';
            case 'red':
                return 'bg-red-50 border-red-200';
            case 'blue':
            default:
                return 'bg-blue-50 border-blue-200';
        }
    })();
    return <Card className={cn('rounded-xl flex-row shadow-none', cardClasses, className)}>{children}</Card>;
};

const ServiceStatusCard = ({
    color,
    icon,
    label,
    description,
}: {
    color: StatusCardProps['color'];
    icon: React.ReactNode;
    label: string;
    description: string;
}) => {
    return (
        <StatusCard color={color}>
            <View>{icon}</View>
            <View className="gap-1">
                <Text className="font-medium text-base">{label}</Text>
                <Text className="text-gray-700">{description}</Text>
            </View>
        </StatusCard>
    );
};

const StatusDescription = () => {
    return (
        <View className="px-4 py-6">
            <View className="gap-4 bg-none! py-5 px-0">
                <Text className="text-xl text-foreground font-medium">Understanding Your Status</Text>

                <View className="py-4 gap-4">
                    <Text className="font-semibold text-foreground">Service Status</Text>
                    <ServiceStatusCard
                        color="green"
                        icon={
                            <AttendanceStatusRing
                                status={IAttendanceStatus.PRESENT}
                                className="w-8 h-8 border-[3px]"
                                dotClassName="w-3.5 h-3.5"
                            />
                        }
                        label="Attended"
                        description="You were present at the service"
                    />
                    <ServiceStatusCard
                        color="blue"
                        icon={
                            <AttendanceStatusRing
                                status={IAttendanceStatus.ABSENT_WITH_PERMISSION}
                                className="w-8 h-8 border-[3px]"
                                dotClassName="w-3.5 h-3.5"
                            />
                        }
                        label="Permission"
                        description="Excused absence, counts as present"
                    />
                    <ServiceStatusCard
                        color="red"
                        icon={
                            <AttendanceStatusRing
                                status={IAttendanceStatus.ABSENT}
                                className="w-8 h-8 border-[3px]"
                                dotClassName="w-3.5 h-3.5"
                            />
                        }
                        label="Absent"
                        description="You did not attend"
                    />
                </View>

                <View className="py-4 gap-4">
                    <Text className="font-semibold text-foreground">Monthly Status</Text>
                    <Text className="text-muted-foreground">Based on attendance for that specific month</Text>
                    <ServiceStatusCard
                        color="green"
                        icon={<CheckCircleIcon color={'green'} size={24} />}
                        label="Active"
                        description="Attended 5 or more services"
                    />
                    <ServiceStatusCard
                        color="amber"
                        icon={<CircleAlertIcon color={'darkorange'} size={24} />}
                        label="Inactive"
                        description="Attended less than 5 services"
                    />
                </View>

                <View className="py-4 gap-4">
                    <Text className="font-semibold text-foreground">Rolling Status</Text>
                    <Text className="text-muted-foreground">Based on consecutive monthly patterns</Text>
                    {/* <ServiceStatusCard
                        color="green"
                        icon={<CheckCircleIcon color={'green'} size={24} />}
                        label="Active"
                        description="Less than 3 consecutive inactive months"
                    /> */}
                    <ServiceStatusCard
                        color="amber"
                        icon={<CircleXIcon color={'darkorange'} size={24} />}
                        label="Dormant"
                        description="3 consecutive inactive months"
                    />
                    <ServiceStatusCard
                        color="red"
                        icon={<BanIcon color={'red'} size={24} />}
                        label="Blacklisted"
                        description="Dormant for 3 consecutive months"
                    />
                </View>
            </View>
        </View>
    );
};

export default StatusDescription;
