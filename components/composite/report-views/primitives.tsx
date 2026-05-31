import React from 'react';
import { View, Image, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { cn } from '~/lib/utils';
import { capitalize } from 'lodash';

export const num = (v: unknown): number => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
};

export const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <Text className="!text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{children}</Text>
);

// Card-wrapped section to sit consistently among the other detail cards.
export const ReportSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <Card className="p-4 gap-3">
        <SectionLabel>{title}</SectionLabel>
        {children}
    </Card>
);

// Big number + label tile (matches the attendance stat style used on the detail screen).
export const StatTile: React.FC<{
    label: string;
    value: React.ReactNode;
    containerClass?: string;
    textClass?: string;
}> = ({ label, value, containerClass = 'bg-secondary', textClass = 'text-foreground' }) => (
    <View className={cn('flex-1 rounded-xl p-3 pt-4 items-center', containerClass)}>
        <Text className={cn('text-2xl font-bold leading-none', textClass)}>{value}</Text>
        <Text className={cn('text-sm font-semibold mt-1 text-center', textClass)}>{label}</Text>
    </View>
);

// Full-width emphasized hero figure for the headline metric of a report.
export const HeroStat: React.FC<{ label: string; value: React.ReactNode; sublabel?: string }> = ({
    label,
    value,
    sublabel,
}) => (
    <View className="rounded-2xl bg-primary/10 dark:bg-primary/20 p-4 items-center">
        <Text className="text-sm font-bold uppercase tracking-widest text-primary">{label}</Text>
        <Text className="text-5xl font-extrabold leading-tight text-primary">{value}</Text>
        {sublabel ? <Text className="text-sm text-muted-foreground mt-0.5">{capitalize(sublabel)}</Text> : null}
    </View>
);

// Plain data table: header row + body rows. Cells accept strings/numbers/nodes.
export const DataTable: React.FC<{ headers: string[]; rows: React.ReactNode[][] }> = ({ headers, rows }) => {
    if (!rows.length) {
        return <Text className="!text-[13px] text-muted-foreground">None</Text>;
    }
    return (
        <View className="rounded-xl overflow-hidden border border-border">
            <View className="flex-row bg-secondary">
                {headers.map((h, i) => (
                    <View key={`${h}-${i}`} className={cn('py-3 px-2.5', i === 0 ? 'flex-[2.5]' : 'flex-1 items-center')}>
                        <Text className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{h}</Text>
                    </View>
                ))}
            </View>
            {rows.map((row, ri) => (
                <View
                    key={`row-${ri}`}
                    className={cn('flex-row', ri % 2 === 1 && 'bg-muted-background', ri > 0 && 'border-t border-border')}
                >
                    {row.map((cell, ci) => (
                        <View key={ci} className={cn('p-2.5', ci === 0 ? 'flex-[2.5]' : 'flex-1 items-center')}>
                            <Text
                                className={cn(
                                    'text-foreground',
                                    ci === 0 ? 'font-medium' : 'font-semibold'
                                )}
                            >
                                {cell as React.ReactNode}
                            </Text>
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
};

// Free-text note (otherInfo / observations / incident details).
export const NoteBlock: React.FC<{ label: string; text?: string | null }> = ({ label, text }) => {
    if (!text) return null;
    return (
        <ReportSection title={label}>
            <Text className="text-foreground leading-relaxed">{text}</Text>
        </ReportSection>
    );
};

// Tappable attachment thumbnail; opens the asset in the device's default handler.
export const AttachmentImage: React.FC<{ url?: string | null }> = ({ url }) => {
    if (!url) return null;
    return (
        <ReportSection title="Attachment">
            <TouchableOpacity activeOpacity={0.85} onPress={() => Linking.openURL(url)}>
                <Image source={{ uri: url }} resizeMode="cover" className="w-full h-48 rounded-xl bg-secondary" />
                <View className="flex-row items-center gap-1.5 mt-2">
                    <Ionicons name="open-outline" size={13} color="#71717a" />
                    <Text className="!text-[11px] text-muted-foreground">Tap to open full size</Text>
                </View>
            </TouchableOpacity>
        </ReportSection>
    );
};

// Outbound link (service report link, etc.).
export const LinkButton: React.FC<{ label: string; url?: string | null }> = ({ label, url }) => {
    if (!url) return null;
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Linking.openURL(url)}
            className="flex-row items-center justify-center gap-2 rounded-xl border border-primary/40 bg-primary/5 px-4 py-3"
        >
            <Ionicons name="link-outline" size={15} color="#6d28d9" />
            <Text className="!text-[13px] font-semibold text-primary">{label}</Text>
        </TouchableOpacity>
    );
};

// Small labelled chip (time values, incident type).
export const InfoChip: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <View className="flex-1 rounded-xl bg-secondary p-3 gap-0.5">
        <Text className="!text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</Text>
        <Text className="!text-[15px] font-bold text-foreground">{value}</Text>
    </View>
);
