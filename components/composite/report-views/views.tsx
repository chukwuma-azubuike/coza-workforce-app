import React from 'react';
import { View } from 'react-native';
import dayjs from 'dayjs';

import {
    AttachmentImage,
    DataTable,
    HeroStat,
    InfoChip,
    LinkButton,
    NoteBlock,
    ReportSection,
    StatTile,
    num,
} from './primitives';

// Report data is dynamically shaped per department; intentionally untyped here.
type AnyReport = any;

const fmtTime = (v?: string) => {
    if (!v) return '--:--';
    const d = dayjs(v);
    return d.isValid() ? d.format('h:mm A') : v;
};

// ─── Children Ministry ──────────────────────────────────────────────────────
const AGE_BANDS: { key: string; label: string }[] = [
    { key: 'age1_2', label: 'Age 1 – 2' },
    { key: 'age3_5', label: 'Age 3 – 5' },
    { key: 'age6_11', label: 'Age 6 – 11' },
    { key: 'age12_above', label: 'Age 12 & above' },
];

export const ChildCareReportView: React.FC<{ data: AnyReport }> = ({ data }) => {
    const rows = AGE_BANDS.map(({ key, label }) => {
        const male = num(data?.[key]?.male);
        const female = num(data?.[key]?.female);
        return [label, male, female, male + female];
    });
    const grandTotal = data?.grandTotal != null ? num(data.grandTotal) : rows.reduce((s, r) => s + (r[3] as number), 0);

    return (
        <>
            <HeroStat label="Grand total" value={grandTotal} sublabel="children present" />
            <ReportSection title="Age breakdown">
                <DataTable headers={['Age band', 'Male', 'Female', 'Total']} rows={rows} />
            </ReportSection>
            <NoteBlock label="Other information" text={data?.otherInfo} />
            <AttachmentImage url={data?.imageUrl} />
        </>
    );
};

// ─── Ushery Board (attendance) ──────────────────────────────────────────────
export const AttendanceReportView: React.FC<{ data: AnyReport }> = ({ data }) => {
    const male = num(data?.maleGuestCount);
    const female = num(data?.femaleGuestCount);
    const infants = num(data?.infants);
    const total = data?.total != null ? num(data.total) : male + female + infants;

    return (
        <>
            <ReportSection title="Attendance">
                <View className="flex-row gap-2">
                    <StatTile label="Male" value={male} containerClass="bg-blue-100 dark:bg-blue-900/20" textClass="text-blue-700 dark:text-blue-400" />
                    <StatTile label="Female" value={female} containerClass="bg-pink-100 dark:bg-pink-900/20" textClass="text-pink-700 dark:text-pink-400" />
                    <StatTile label="Infants" value={infants} containerClass="bg-amber-100 dark:bg-amber-900/20" textClass="text-amber-700 dark:text-amber-400" />
                    <StatTile label="Total" value={total} containerClass="bg-green-100 dark:bg-green-900/20" textClass="text-green-700 dark:text-green-400" />
                </View>
            </ReportSection>
            <NoteBlock label="Other information" text={data?.otherInfo} />
            <AttachmentImage url={data?.imageUrl} />
        </>
    );
};

// ─── PCU (guests) ───────────────────────────────────────────────────────────
export const GuestReportView: React.FC<{ data: AnyReport }> = ({ data }) => (
    <>
        <ReportSection title="Guests">
            <View className="flex-row gap-2">
                <StatTile
                    label="First timers"
                    value={num(data?.firstTimersCount)}
                    containerClass="bg-indigo-100 dark:bg-indigo-900/20"
                    textClass="text-indigo-700 dark:text-indigo-400"
                />
                <StatTile
                    label="New converts"
                    value={num(data?.newConvertsCount)}
                    containerClass="bg-green-100 dark:bg-green-900/20"
                    textClass="text-green-700 dark:text-green-400"
                />
            </View>
        </ReportSection>
        <NoteBlock label="Other information" text={data?.otherInfo} />
        <AttachmentImage url={data?.imageUrl} />
    </>
);

// ─── Traffic & Security ─────────────────────────────────────────────────────
export const SecurityReportView: React.FC<{ data: AnyReport }> = ({ data }) => {
    const locations: AnyReport[] = Array.isArray(data?.locations) ? data.locations : [];
    const rows = locations.map(l => [l?.name || '—', num(l?.carCount)]);
    const total =
        data?.totalCarCount != null ? num(data.totalCarCount) : locations.reduce((s, l) => s + num(l?.carCount), 0);

    return (
        <>
            <HeroStat label="Total cars" value={total} sublabel="across all car parks" />
            <ReportSection title="Car parks">
                <DataTable headers={['Car park', 'Cars']} rows={rows} />
            </ReportSection>
            <NoteBlock label="Other information" text={data?.otherInfo} />
            <AttachmentImage url={data?.imageUrl} />
        </>
    );
};

// ─── COZA Transfer Service ──────────────────────────────────────────────────
export const TransferReportView: React.FC<{ data: AnyReport }> = ({ data }) => {
    const locations: AnyReport[] = Array.isArray(data?.locations) ? data.locations : [];
    const rows = locations.map(l => {
        const adults = num(l?.adultCount);
        const minors = num(l?.minorCount);
        return [l?.name || '—', adults, minors, adults + minors];
    });
    const adults = data?.total?.adults != null ? num(data.total.adults) : locations.reduce((s, l) => s + num(l?.adultCount), 0);
    const minors = data?.total?.minors != null ? num(data.total.minors) : locations.reduce((s, l) => s + num(l?.minorCount), 0);

    return (
        <>
            <HeroStat label="Total transferred" value={adults + minors} sublabel={`${adults} adults · ${minors} minors`} />
            <ReportSection title="Pick-up locations">
                <DataTable headers={['Location', 'Adults', 'Minors', 'Total']} rows={rows} />
            </ReportSection>
            <NoteBlock label="Other information" text={data?.otherInfo} />
            <AttachmentImage url={data?.imageUrl} />
        </>
    );
};

// ─── Programme Coordination (service) ───────────────────────────────────────
export const ServiceReportView: React.FC<{ data: AnyReport }> = ({ data }) => (
    <>
        <ReportSection title="Service times">
            <View className="flex-row gap-2">
                <InfoChip label="Start" value={fmtTime(data?.serviceStartTime)} />
                <InfoChip label="End" value={fmtTime(data?.serviceEndTime)} />
            </View>
            {data?.serviceReportLink ? (
                <LinkButton label="Open service report" url={data.serviceReportLink} />
            ) : null}
        </ReportSection>
        <NoteBlock label="Observations" text={data?.observations} />
        <AttachmentImage url={data?.imageUrl} />
    </>
);

// ─── Incident ───────────────────────────────────────────────────────────────
export const IncidentReportView: React.FC<{ data: AnyReport }> = ({ data }) => (
    <>
        {data?.incident ? (
            <ReportSection title="Incident">
                <InfoChip label="Type" value={data.incident} />
            </ReportSection>
        ) : null}
        <NoteBlock label="Details" text={data?.details} />
        <AttachmentImage url={data?.imageUrl} />
    </>
);
