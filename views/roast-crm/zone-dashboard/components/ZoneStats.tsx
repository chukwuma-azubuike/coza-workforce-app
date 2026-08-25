import { Pressable, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Card, CardContent } from '~/components/ui/card';
import { Text } from '~/components/ui/text';
import { AssimilationStage, PipelineStage } from '~/store/types';
import { cn } from '~/lib/utils';

interface StatCardProps {
    value: number;
    label: string;
    color: string;
    valueUnit?: string;
    onPress?: () => void;
    selected?: boolean;
}

export function StatCard({ value, label, color, valueUnit = '', onPress, selected }: StatCardProps) {
    const content = (
        <Card className={cn('items-center flex-1', selected && 'border-foreground')}>
            <CardContent className="p-4 gap-0.5">
                <View className="flex-row items-center gap-1">
                    <Text className={`text-3xl font-bold text-center w-full ${color}`}>
                        {(value ?? 0).toFixed(0)}
                        {valueUnit}
                    </Text>
                    {!!onPress && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </View>
                <Text className="text-foreground text-base line-clamp-2 !break-words text-center">{label}</Text>
            </CardContent>
        </Card>
    );

    if (!onPress) return content;

    return <Pressable onPress={onPress}>{content}</Pressable>;
}

interface ZoneStatsProps {
    totalGuests: number;
    totalWorkers: number;
}

export function ZoneStats({ totalGuests, totalWorkers }: ZoneStatsProps) {
    return (
        <View className="flex-row flex-wrap gap-4">
            <StatCard value={totalGuests} label="Total Guests" color="text-blue-600" />
            <StatCard value={totalWorkers} label="Total Workers" color="text-blue-600" />
        </View>
    );
}

const STAGE_COUNT_KEY: Partial<Record<AssimilationStage, keyof AssimilationStageBreakdown>> = {
    [AssimilationStage.INVITED]: 'invitedCount',
    [AssimilationStage.ATTENDED]: 'attendedCount',
    [AssimilationStage.BEING_DISCIPLED]: 'discipleCount',
    [AssimilationStage.ASSIMILATED]: 'joinedCount',
};

// A funnel reads left-to-right as progress toward the goal, so segments go cool -> warm -> green
// ("arrived"). The "currently selected" ring uses `foreground` (black on light, white on dark) so
// it reads as a focus outline rather than another stage color competing for meaning.
const STAGE_BAR_COLOR: Partial<Record<AssimilationStage, string>> = {
    [AssimilationStage.INVITED]: 'bg-blue-600',
    [AssimilationStage.ATTENDED]: 'bg-cyan-600',
    [AssimilationStage.BEING_DISCIPLED]: 'bg-amber-600',
    [AssimilationStage.ASSIMILATED]: 'bg-green-600',
};

const STAGE_TEXT_COLOR: Partial<Record<AssimilationStage, string>> = {
    [AssimilationStage.INVITED]: 'text-blue-600',
    [AssimilationStage.ATTENDED]: 'text-cyan-600',
    [AssimilationStage.BEING_DISCIPLED]: 'text-amber-600',
    [AssimilationStage.ASSIMILATED]: 'text-green-600',
};

// Soft tint so the "guests by stage" rows read as tappable filter chips (same convention used
// for status chips elsewhere in the app) rather than a static legend.
const STAGE_CHIP_BG: Partial<Record<AssimilationStage, string>> = {
    [AssimilationStage.INVITED]: 'bg-blue-100 dark:bg-blue-900/30',
    [AssimilationStage.ATTENDED]: 'bg-cyan-100 dark:bg-cyan-900/30',
    [AssimilationStage.BEING_DISCIPLED]: 'bg-amber-100 dark:bg-amber-900/30',
    [AssimilationStage.ASSIMILATED]: 'bg-green-100 dark:bg-green-900/30',
};

export interface AssimilationStageBreakdown {
    invitedCount: number;
    attendedCount: number;
    discipleCount: number;
    joinedCount: number;
    totalGuests: number;
}

interface AssimilationFunnelProps {
    stages: PipelineStage[];
    breakdown?: AssimilationStageBreakdown;
    selectedStageId?: string;
    onSelectStage: (stageId: string | undefined) => void;
}

export function AssimilationFunnel({ stages, breakdown, selectedStageId, onSelectStage }: AssimilationFunnelProps) {
    const counts = stages.map(stage => {
        const countKey = STAGE_COUNT_KEY[stage.label];
        return (countKey && breakdown ? breakdown[countKey] : 0) ?? 0;
    });
    const total = counts.reduce((sum, count) => sum + count, 0);

    const handleSelect = (stageId: string, isSelected: boolean) => {
        Haptics.selectionAsync();
        onSelectStage(isSelected ? undefined : stageId);
    };

    return (
        <View className="gap-3">
            {/* <View className="flex-row h-8 rounded-full overflow-hidden bg-secondary">
                {total < 1 ? (
                    <View className="flex-1" />
                ) : (
                    stages.map((stage, index) => {
                        const count = counts[index] ?? 0;
                        // Give zero-count stages a thin sliver so they stay tappable and visible,
                        // rather than collapsing to nothing in the bar.
                        const flexBasis = Math.max(count, total * 0.03);
                        const isSelected = selectedStageId === stage._id;

                        return (
                            <Pressable
                                key={stage._id}
                                style={{ flex: flexBasis }}
                                onPress={() => handleSelect(stage._id, isSelected)}
                                className={cn(
                                    'active:opacity-70 ',
                                    STAGE_BAR_COLOR[stage.label] ?? 'bg-muted',
                                    isSelected && 'border-2 border-foreground'
                                )}
                            />
                        );
                    })
                )}
            </View> */}

            <View className="flex-row flex-wrap gap-x-3 gap-y-2">
                {stages.map((stage, index) => {
                    const isSelected = selectedStageId === stage._id;

                    return (
                        <Pressable
                            key={stage._id}
                            className={cn(
                                'flex-row items-center gap-2 min-w-[45%] flex-1 px-4 py-3 rounded-full overflow-hidden active:opacity-70',
                                STAGE_CHIP_BG[stage.label] ?? 'bg-secondary',
                                isSelected && 'border-2 border-foreground'
                            )}
                            onPress={() => handleSelect(stage._id, isSelected)}
                        >
                            <View className={cn('w-2.5 h-2.5 rounded-full', STAGE_BAR_COLOR[stage.label] ?? 'bg-muted')} />
                            <Text className="text-foreground flex-1" numberOfLines={1}>
                                {stage.name}
                            </Text>
                            <Text className={cn('font-bold', STAGE_TEXT_COLOR[stage.label] ?? 'text-foreground')}>
                                {counts[index] ?? 0}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
}
