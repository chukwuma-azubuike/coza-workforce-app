import dayjs from 'dayjs';
import { CalendarIcon, ClockIcon } from 'lucide-react-native';
import { View } from 'react-native';
import StatusTag from '~/components/atoms/status-tag';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion';
import { Badge } from '~/components/ui/badge';
import { Skeleton } from '~/components/ui/skeleton';
import { Text } from '~/components/ui/text';
import { THEME_CONFIG } from '~/config/appConfig';
import { cn } from '~/lib/utils';
import { IGetUserStatusHistoryResponse, IGetUserStatusReport } from '~/store/services/account';
import { IAttendanceStatus } from '~/store/types';

const AttendanceHistorySkeleton = () => {
    return (
        <View className="flex-row items-center justify-between w-full bg-background p-4 rounded-lg">
            <View className="flex-row items-center gap-6">
                <Skeleton className={'w-4 h-4 rounded'} />
                <View className="gap-2">
                    <View className="flex-row items-center gap-2">
                        <Skeleton className={'w-32 h-5'} />
                    </View>
                    <Skeleton className={'h-4 w-8'} />
                </View>
            </View>

            <View>
                <Skeleton className={'h-6 w-20 rounded-xl'} />
            </View>
        </View>
    );
};

const AttendanceHeader = ({ history, isCurrent }: { history: IGetUserStatusReport; isCurrent: boolean }) => {
    return (
        <AccordionTrigger className="py-2 px-4 rounded-xl bg-background border border-border shadow-sm min-h-[74px]">
            <View className="flex-row items-center justify-between w-[92%]">
                <View className="flex-row items-center gap-6">
                    <CalendarIcon color={THEME_CONFIG.gray} size={18} />
                    <View>
                        <View className="flex-row items-center gap-2">
                            <Text className="text-base text-foreground font-medium">
                                {history.monthName} {history.year}
                            </Text>
                            {false && isCurrent && (
                                <Badge variant="outline" className="bg-blue-50 border-blue-200">
                                    <Text className="text-blue-700">Current</Text>
                                </Badge>
                            )}
                        </View>
                        <Text
                            className={`text-xs font-medium text-zinc-500 ${
                                !history.metrics?.numberOfServicesInMonth && 'hidden'
                            }`}
                        >
                            {history.metrics?.numberOfServicesAttended}/{history.metrics?.numberOfServicesInMonth}{' '}
                            Services
                        </Text>
                    </View>
                </View>

                <View>{history.status && <StatusTag className="py-[1px]">{history.status}</StatusTag>}</View>
            </View>
        </AccordionTrigger>
    );
};

const AttendanceStatusBadge = ({ status }: { status: IAttendanceStatus }) => {
    const badgeVariant = (() => {
        switch (status) {
            case 'PRESENT':
            case 'LATE':
                return {
                    label: 'Attended',
                    class: 'bg-green-50 border-green-200 w-fit',
                    textClass: 'text-green-700 text-xs',
                };
            case 'ABSENT_WITH_PERMISSION':
                return {
                    label: 'Permission',
                    class: 'bg-blue-50 border-blue-200 w-fit',
                    textClass: 'text-blue-700 text-xs',
                };
            case 'ABSENT':
            default:
                return {
                    label: 'Absent',
                    class: 'bg-red-50 border-red-200 w-fit',
                    textClass: 'text-red-700 text-xs',
                };
        }
    })();
    return (
        <Badge variant="outline" className={badgeVariant.class}>
            <Text className={badgeVariant.textClass}>{badgeVariant.label}</Text>
        </Badge>
    );
};

export const AttendanceStatusRing = ({
    status,
    className,
    dotClassName,
}: {
    status: IAttendanceStatus;
    className?: string;
    dotClassName?: string;
}) => {
    const badgeVariant = (() => {
        switch (status) {
            case 'PRESENT':
            case 'LATE':
                return {
                    label: 'Attended',
                    class: 'w-10 h-10 rounded-full border-4 border-green-700 dark:border-green-500 items-center justify-center relative z-[1]',
                    dotClass: 'w-5 h-5 rounded-full bg-green-700 dark:bg-green-500',
                };

            case 'ABSENT_WITH_PERMISSION':
                return {
                    label: 'Absent with permission',
                    class: 'w-10 h-10 rounded-full border-4 border-blue-700 dark:border-blue-500 items-center justify-center relative z-[1]',
                    dotClass: 'w-5 h-5 rounded-full bg-blue-700 dark:bg-blue-500',
                };
            case 'ABSENT':
            default:
                return {
                    label: 'Absent',
                    class: 'w-10 h-10 rounded-full border-4 border-red-700 dark:border-red-500 items-center justify-center relative z-[1]',
                    dotClass: 'w-5 h-5 rounded-full bg-red-700 dark:bg-red-500',
                };
        }
    })();
    return (
        <View className={cn(badgeVariant.class, className)}>
            {status !== 'ABSENT' && <View className={cn(badgeVariant.dotClass, dotClassName)}></View>}
        </View>
    );
};

const AttendanceContent = ({ history }: { history: IGetUserStatusReport }) => {
    const noAttendance = !history.attendances?.length;

    if (noAttendance) {
        return (
            <AccordionContent className="border-none">
                <View className="py-5 px-2">
                    <Text className="text-muted-foreground">No attendance record</Text>
                </View>
            </AccordionContent>
        );
    }
    return (
        <AccordionContent className="border-none">
            {history?.attendances?.map((attendance, index) => {
                const date = attendance?.serviceTime ?? attendance?.createdAt;
                const serviceDate = dayjs(date).format('MMM DD');
                return (
                    <View key={index} className="py-5 px-2 gap-8 items-start flex-row">
                        <View className="h-fit w-fit relative">
                            <AttendanceStatusRing status={attendance?.status} />
                            {index !== 0 && (
                                <View className="absolute top-[-100%] left-1/2 -translate-x-1/2 w-[2px] h-full bg-neutral-200 dark:bg-neutral-700"></View>
                            )}
                        </View>

                        <View className="bg-background shadow-sm rounded-lg p-2 py-3 border border-border px-4 flex-1">
                            <View className="flex-row items-center justify-between">
                                <Text className="text-foreground">{attendance?.serviceName}</Text>
                                <AttendanceStatusBadge status={attendance?.status} />
                            </View>
                            <View className="flex-row items-center gap-2">
                                <ClockIcon color={THEME_CONFIG.gray} size={12} />
                                <Text className="text-muted-foreground text-xs">{serviceDate}</Text>
                            </View>
                        </View>
                    </View>
                );
            })}
        </AccordionContent>
    );
};

type AttendanceHistoryProps = {
    statusReport: IGetUserStatusHistoryResponse | undefined;
    isFetching?: boolean;
};

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ statusReport, isFetching }) => {
    return (
        <View className="py-6 px-4">
            <View className="py-5">
                <Text className="text-xl font-medium text-foreground">Attendance History</Text>
                <Text className="text-sm font-medium text-muted-foreground">Track your progress month by month</Text>
            </View>

            {isFetching ? (
                <View className="gap-5">
                    {Array.from({ length: 12 }).map((_, idx) => (
                        <AttendanceHistorySkeleton key={idx} />
                    ))}
                </View>
            ) : (
                <Accordion type="multiple" collapsable className="space-y-4">
                    <View className="gap-5">
                        {statusReport?.history?.map((history, index) => (
                            <AccordionItem
                                key={history.monthName}
                                value={history.monthName}
                                className="!border-b-0 p-0.5"
                            >
                                <AttendanceHeader history={history} isCurrent={index === 0} />
                                <AttendanceContent history={history} />
                            </AccordionItem>
                        ))}
                    </View>
                </Accordion>
            )}
        </View>
    );
};

export default AttendanceHistory;
