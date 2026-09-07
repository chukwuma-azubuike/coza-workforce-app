import React from 'react';
import { View } from 'react-native';
import { Info, Trophy } from 'lucide-react-native';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion';
import { Text } from '~/components/ui/text';
import { THEME_CONFIG } from '~/config/appConfig';
import { cn } from '~/lib/utils';
import type { ScoringLegend, ScoringLegendEntry } from '~/store/types/roast-crm';

// Matches the same cool -> warm -> green funnel-progress convention used for the assimilation
// funnel/stage cards elsewhere in Roast CRM (see STAGE_BAR_COLOR in zone-dashboard/components/ZoneStats.tsx).
// `engagement` isn't a pipeline stage - it's scored per-contact-logged, not per-guest - so it
// gets its own indigo accent rather than reusing a funnel color.
const LEGEND_STYLE: Record<string, { dot: string; pill: string; pillText: string }> = {
    invited: { dot: 'bg-blue-600', pill: 'bg-blue-600/10', pillText: 'text-blue-700 dark:text-blue-300' },
    attended: { dot: 'bg-cyan-600', pill: 'bg-cyan-600/10', pillText: 'text-cyan-700 dark:text-cyan-300' },
    discipled: { dot: 'bg-amber-600', pill: 'bg-amber-600/10', pillText: 'text-amber-700 dark:text-amber-300' },
    assimilated: { dot: 'bg-green-600', pill: 'bg-green-600/10', pillText: 'text-green-700 dark:text-green-300' },
    engagement: { dot: 'bg-indigo-600', pill: 'bg-indigo-600/10', pillText: 'text-indigo-700 dark:text-indigo-300' },
};

const FALLBACK_STYLE = { dot: 'bg-muted-foreground', pill: 'bg-muted', pillText: 'text-foreground' };

// The backend only gives us a label + points value per stage, so the "conversational"
// framing here is a fixed action-clause per known stage key (falls back to the raw label for
// any stage this app doesn't recognize yet).
const LEGEND_ACTION: Record<string, string> = {
    invited: 'Invite a guest',
    attended: 'Get them to attend a service',
    discipled: 'Walk with them through discipleship',
    assimilated: 'See them fully assimilated',
    engagement: 'Update the engagement timeline with a guest',
};

// The guest journey is a funnel, so these render in pipeline order on a connected rail regardless
// of the order the API serialises them in. Anything else (engagement, plus any stage the backend
// adds later) is listed after it, unconnected.
const FUNNEL_ORDER: Array<keyof ScoringLegend> = ['invited', 'attended', 'discipled', 'assimilated'];

// Most stages score `pointsPerGuest`; `engagement` scores `pointsPerEngagement` instead.
const legendPoints = (entry: ScoringLegendEntry) => entry.pointsPerGuest ?? entry.pointsPerEngagement ?? 0;

interface LegendRow {
    id: string;
    action: string;
    points: number;
}

const toRow = (id: string, entry: ScoringLegendEntry): LegendRow => ({
    id,
    action: LEGEND_ACTION[id] ?? entry.label ?? id,
    points: legendPoints(entry),
});

/** One legend line: rail dot (optionally connected to its neighbours), action, points pill. */
const ScoringRow: React.FC<LegendRow & { connectUp?: boolean; connectDown?: boolean }> = ({
    id,
    action,
    points,
    connectUp,
    connectDown,
}) => {
    const style = LEGEND_STYLE[id] ?? FALLBACK_STYLE;

    return (
        <View className="flex-row items-center gap-3">
            {/* Fixed 44px rail keeps every dot on one axis and lets the connectors meet the dot exactly. */}
            <View className="w-3 h-11 items-center justify-center">
                {connectUp && <View className="absolute top-0 h-[17px] w-[1.5px] bg-border" />}
                {connectDown && <View className="absolute bottom-0 h-[17px] w-[1.5px] bg-border" />}
                <View className={cn('w-2.5 h-2.5 rounded-full', style.dot)} />
            </View>
            <Text className="flex-1 text-sm native:text-sm text-muted-foreground line-clamp-none">{action}</Text>
            <View className={cn('px-2 py-0.5 rounded-full', style.pill)}>
                <Text className={cn('text-xs native:text-xs font-semibold', style.pillText)}>+{points} pts</Text>
            </View>
        </View>
    );
};

const SectionLabel: React.FC<{ children: string }> = ({ children }) => (
    <Text className="text-[11px] native:text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
        {children}
    </Text>
);

interface ScoringGuideProps {
    scoringLegend: ScoringLegend;
}

/**
 * Collapsible "how points are earned" panel for the workers leaderboard. Collapsed by default so
 * the ranking owns the first screen - the guide is reference material, not the headline.
 */
export const ScoringGuide: React.FC<ScoringGuideProps> = ({ scoringLegend }) => {
    const { funnelRows, otherRows, journeyTotal } = React.useMemo(() => {
        const entries = Object.entries(scoringLegend).filter((pair): pair is [string, ScoringLegendEntry] => !!pair[1]);

        const funnel = FUNNEL_ORDER.map(stage => entries.find(([id]) => id === stage)).flatMap(entry =>
            entry ? [toRow(entry[0], entry[1])] : []
        );
        const others = entries
            .filter(([id]) => !FUNNEL_ORDER.includes(id as keyof ScoringLegend))
            .map(([id, entry]) => toRow(id, entry));

        return {
            funnelRows: funnel,
            otherRows: others,
            journeyTotal: funnel.reduce((sum, row) => sum + row.points, 0),
        };
    }, [scoringLegend]);

    if (!funnelRows.length && !otherRows.length) return null;

    return (
        <Accordion type="single" collapsible>
            <AccordionItem value="scoring" className="rounded-2xl border border-border bg-card overflow-hidden">
                <AccordionTrigger className="px-4 py-3">
                    <View className="flex-row items-center gap-3 flex-1 pr-3">
                        <View className="w-9 h-9 rounded-full items-center justify-center bg-primary/10">
                            <Trophy size={17} color={THEME_CONFIG.primary} />
                        </View>
                        <View className="flex-1 gap-0.5">
                            <Text className="text-base native:text-base font-semibold text-foreground">
                                How workers earn points
                            </Text>
                            <Text className="text-xs native:text-xs text-muted-foreground line-clamp-none">
                                {journeyTotal > 0
                                    ? `A full guest journey is worth +${journeyTotal} pts`
                                    : `${funnelRows.length + otherRows.length} ways to score`}
                            </Text>
                        </View>
                    </View>
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4 gap-3">
                    {!!funnelRows.length && (
                        <View>
                            <SectionLabel>Guest journey</SectionLabel>
                            {funnelRows.map((row, index) => (
                                <ScoringRow
                                    {...row}
                                    key={row.id}
                                    connectUp={index !== 0}
                                    connectDown={index !== funnelRows.length - 1}
                                />
                            ))}
                        </View>
                    )}

                    {!!otherRows.length && (
                        <View className={cn(!!funnelRows.length && 'border-t border-border/60 pt-2 mt-1')}>
                            <SectionLabel>Ongoing</SectionLabel>
                            {otherRows.map(row => (
                                <ScoringRow {...row} key={row.id} />
                            ))}
                        </View>
                    )}

                    <View className="flex-row items-start gap-2.5 rounded-xl p-3 border-l-4 border-l-yellow-400 bg-yellow-50 dark:bg-yellow-300/20">
                        <View className="mt-0.5">
                            <Info size={14} color={THEME_CONFIG.warning} />
                        </View>
                        <Text className="flex-1 text-xs native:text-xs leading-5 text-foreground line-clamp-none">
                            Points are only awarded for updates made in the app - a call, visit, or stage change that
                            isn't logged here won't count.
                        </Text>
                    </View>
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
};

export default ScoringGuide;
