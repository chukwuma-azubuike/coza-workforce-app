import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Text } from '~/components/ui/text';
import { cn } from '~/lib/utils';
import { campusColor, formatCompactNumber, formatPercent } from '../lib';

export interface LeagueRow {
    id: string;
    label: string;
    value: number;
    /** Optional fraction of total (0..1) — rendered as a share chip when present. */
    share?: number;
    /** Optional secondary descriptor under the label (e.g. "1,500 present"). */
    secondary?: string;
    /** Override the bar/dot colour; defaults to the stable campus colour for `id`. */
    color?: string;
}

interface LeagueTableProps {
    rows: LeagueRow[];
    /** How many rows to show before "+N more" (full list lives in the drill-down). */
    maxRows?: number;
    /** Format the trailing value; defaults to compact number. */
    valueFormatter?: (value: number) => string;
    onRowPress?: (row: LeagueRow) => void;
}

/**
 * Ranked horizontal-bar league table. Bars are scaled to the leading value so
 * relative magnitude reads at a glance; colour is stable per id and always paired
 * with a label + numeric value (never colour alone).
 */
const LeagueTable: React.FC<LeagueTableProps> = ({ rows, maxRows = 6, valueFormatter = formatCompactNumber, onRowPress }) => {
    const sorted = React.useMemo(() => [...rows].sort((a, b) => b.value - a.value), [rows]);
    const max = sorted[0]?.value || 1;
    const visible = sorted.slice(0, maxRows);
    const hidden = sorted.length - visible.length;

    return (
        <View className="gap-3">
            {visible.map((row, i) => {
                const color = row.color ?? campusColor(row.id);
                const pct = Math.max(0.04, row.value / max); // floor so tiny values stay visible
                const RowWrap: any = onRowPress ? TouchableOpacity : View;
                return (
                    <RowWrap
                        key={row.id}
                        {...(onRowPress ? { activeOpacity: 0.6, onPress: () => onRowPress(row) } : {})}
                        className="gap-1.5"
                    >
                        <View className="flex-row items-center justify-between gap-2">
                            <View className="flex-row items-center gap-2 flex-1">
                                <Text className="!text-[12px] font-bold text-muted-foreground w-4">{i + 1}</Text>
                                <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                                <Text numberOfLines={1} className="text-md font-semibold text-foreground flex-1">
                                    {row.label}
                                </Text>
                            </View>
                            <View className="flex-row items-baseline gap-1.5">
                                <Text className="text-md font-bold text-foreground">{valueFormatter(row.value)}</Text>
                                {row.share !== undefined && (
                                    <Text className="!text-[12px] font-medium text-muted-foreground w-10 text-right">
                                        {formatPercent(row.share)}
                                    </Text>
                                )}
                            </View>
                        </View>
                        <View className="flex-row items-center gap-2 pl-6">
                            <View className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                                <View
                                    className="h-full rounded-full"
                                    style={{ width: `${pct * 100}%`, backgroundColor: color }}
                                />
                            </View>
                            {!!row.secondary && (
                                <Text numberOfLines={1} className="!text-[11px] text-muted-foreground">
                                    {row.secondary}
                                </Text>
                            )}
                        </View>
                    </RowWrap>
                );
            })}
            {hidden > 0 && (
                <Text className={cn('!text-[12px] text-muted-foreground pl-6')}>+{hidden} more</Text>
            )}
        </View>
    );
};

export default React.memo(LeagueTable);
