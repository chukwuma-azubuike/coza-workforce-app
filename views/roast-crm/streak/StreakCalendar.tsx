import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Canvas, RoundedRect } from '@shopify/react-native-skia';
import dayjs from 'dayjs';

import { Text } from '~/components/ui/text';
import { useColorScheme } from '~/lib/useColorScheme';
import { IStreakDay } from '~/store/types';

/**
 * The engagement heatmap.
 *
 * In Skia because ninety-one cells is ninety-one views, and this sits inside a screen that
 * scrolls. A React Native tree that large costs a visible hitch on the mid-range Android
 * handsets most of the workforce carries; a single `Canvas` costs one.
 *
 * Colour is the **existing indigo engagement accent** at five steps of opacity, not a new
 * palette — the heatmap is a second view of the same data the dashboards already shade,
 * and inventing a scale for it would make the two disagree.
 */

const COLUMNS = 7;
const GAP = 4;

/** Sunday-first, matching how the rest of the app renders a week. */
const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const ACCENT = '#6366F1';

/**
 * Intensity from the qualifying-action count.
 *
 * Deliberately coarse. The question the heatmap answers is "did I show up, and roughly how
 * hard" — a continuous scale would imply a precision the underlying count does not have,
 * since one long call and six taps both produce numbers here.
 */
export const intensityFor = (day: IStreakDay): number => {
    if (!day.engaged) {
        return 0;
    }

    if (day.actions >= 7) {
        return 1;
    }

    if (day.actions >= 4) {
        return 0.78;
    }

    if (day.actions >= 2) {
        return 0.55;
    }

    return 0.32;
};

interface StreakCalendarProps {
    days: IStreakDay[];
    /** Available width in points. Cells size themselves to fill it. */
    width: number;
}

const StreakCalendar: React.FC<StreakCalendarProps> = ({ days, width }) => {
    const { isDarkColorScheme } = useColorScheme();

    const cell = Math.floor((width - GAP * (COLUMNS - 1)) / COLUMNS);

    const grid = useMemo(() => {
        if (!days.length) {
            return { cells: [] as Array<{ x: number; y: number; opacity: number; key: string }>, rows: 0 };
        }

        // The range rarely starts on a Sunday, so the first row is padded to keep every
        // column a real weekday. Without this the grid still renders — it just silently
        // stops meaning anything, because Wednesday drifts a column each month.
        const offset = dayjs(days[0]?.localDate).day();

        const cells = days.map((day, index) => {
            const position = offset + index;

            return {
                key: day.localDate,
                x: (position % COLUMNS) * (cell + GAP),
                y: Math.floor(position / COLUMNS) * (cell + GAP),
                opacity: intensityFor(day),
            };
        });

        return { cells, rows: Math.ceil((offset + days.length) / COLUMNS) };
    }, [cell, days]);

    const height = grid.rows * cell + Math.max(0, grid.rows - 1) * GAP;
    const trackColour = isDarkColorScheme ? '#27272A' : '#E4E4E7';

    return (
        <View className="gap-2">
            <View className="flex-row">
                {WEEKDAYS.map((label, index) => (
                    <Text
                        key={`${label}-${index}`}
                        className="!text-[10px] text-muted-foreground text-center"
                        style={{ width: cell, marginRight: index === COLUMNS - 1 ? 0 : GAP }}
                    >
                        {label}
                    </Text>
                ))}
            </View>

            <Canvas style={{ width, height }}>
                {grid.cells.map(({ key, x, y, opacity }) => (
                    <RoundedRect
                        key={key}
                        x={x}
                        y={y}
                        width={cell}
                        height={cell}
                        r={4}
                        color={opacity === 0 ? trackColour : ACCENT}
                        opacity={opacity === 0 ? 1 : opacity}
                    />
                ))}
            </Canvas>

            <View className="flex-row items-center justify-end gap-1.5 pt-1">
                <Text className="!text-[10px] text-muted-foreground">Less</Text>
                {[0, 0.32, 0.55, 0.78, 1].map(step => (
                    <View
                        key={step}
                        className="w-3 h-3 rounded-[3px]"
                        style={{ backgroundColor: step === 0 ? trackColour : ACCENT, opacity: step === 0 ? 1 : step }}
                    />
                ))}
                <Text className="!text-[10px] text-muted-foreground">More</Text>
            </View>
        </View>
    );
};

export default StreakCalendar;
