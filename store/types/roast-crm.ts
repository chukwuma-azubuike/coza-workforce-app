import { ROLES } from '~/hooks/role';
import { IPaginationParams, IUser } from '.';

// Core types
export type ID = string;

export enum AssimilationStage {
    INVITED = 'INVITED',
    ATTENDED = 'ATTENDED',
    BEING_DISCIPLED = 'BEING_DISCIPLED',
    ASSIMILATED = 'ASSIMILATED',
}

export enum AssimilationStagePosition {
    invited,
    'attended 1st',
    'attended 2nd',
    'attended 3rd',
    'attended 4th',
    'attended 5th',
    'attended 6th',
    MGI,
    'joined workforce',
}

export enum ContactChannel {
    CALL = 'CALL',
    WHATSAPP = 'WHATSAPP',
    SMS = 'SMS',
    VISIT = 'VISIT',
}

export enum MilestoneStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    SKIPPED = 'SKIPPED',
}

// Base interfaces
export interface User {
    _id: ID;
    name: string;
    phone?: string;
    email?: string;
    role: ROLES;
    zoneName?: string;
    guestCount?: number;
    zoneIds?: ID[]; // zones they coordinate
    isActive?: boolean;
}

export interface Milestone {
    _id: ID;
    title: string;
    description?: string;
    weekNumber?: number;
    status: MilestoneStatus;
    completedAt?: string | Date | null;
}

export interface Zone {
    _id: ID;
    name: string;
    coordinates: {
        long: number;
        lat: number;
    };
    address: string;
    departments: {
        id: string;
        _id: string;
        name: string;
        description: string;
    }[];
    descriptions: string;
    campusId: string;
    createdAt: string;
}

export type CreateZonePayload = Omit<Zone, '_id' | 'createdAt'>;

export interface Timeline {
    _id: ID;
    guestId: string;
    assignedToId: string;
    title?: string;
    notes?: string;
    createdBy: string;
    createdAt: string | Date;
    channel: ContactChannel;
}

export interface Guest {
    id: ID;
    _id: ID;
    phoneNumber: string;
    zoneId: ID;
    gender: 'male' | 'female';
    assignedToId?: ID | null;
    campusId?: ID;
    createdById?: ID;
    createdAt: string | Date; // ISO string format
    lastContact?: string | Date; // ISO string format
    preferredChannel?: ContactChannel;
    preferredChannelId?: string;
    completedAt?: string | Date | null;
    comment?: string | null;
    address?: string | null;
    assimilationStageId: string;
    assimilationSubStageId: string;
    nextAction?: string;
    milestones?: Milestone[];
    meta?: Record<string, any>;
    firstName: string;
    lastName: string;
    email?: string;
    timeline?: Timeline[];
}

export interface Engagement {
    _id: ID;
    guestId: ID;
    workerId: ID;
    type: ContactChannel;
    notes?: string;
    timestamp: string | Date;
}

// Form and request/response types
export interface GuestFormData extends Omit<Guest, '_id' | 'createdAt' | 'milestones'> {
    milestones?: Partial<Omit<Milestone, '_id'>>[];
}

// Component props interfaces
export interface GuestProfileProps {
    guestId: ID;
    onClose: () => void;
}

export enum NotificationType {
    FOLLOW_UP = 'follow_up',
    STAGNANT = 'stagnant',
    MILESTONE = 'milestone',
    WELCOME = 'welcome',
    REMINDER = 'reminder',
    ASSIGNMENT = 'assignment',
}

export enum NotificationPriority {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
}

export interface NotificationProps {
    _id: ID;
    type: NotificationType;
    title: string;
    message: string;
    guestName?: string;
    guestId?: ID;
    createdAt: string; // ISO string format
    isRead: boolean;
    priority: NotificationPriority;
    actionRequired: boolean;
}

// Navigation and view types
export enum View {
    CAPTURE = 'capture',
    MY_GUESTS = 'myGuests',
    PROFILE = 'profile',
    ZONE = 'zone',
    GLOBAL = 'global',
    LEADERBOARDS = 'leaderboards',
    NOTIFICATIONS = 'notifications',
    PIPELINE_SETTINGS = 'pipelineSettings',
}

export type ViewType = `${View}`;

// Leaderboard types
export interface WorkerStats {
    guestsCaptured: number;
    conversions: number;
    callsMade: number;
    visitsMade: number;
    milestoneCompletions: number;
    consistency: number;
}

export interface ZoneUsersPayload extends IPaginationParams {
    zoneId?: string;
    campusId?: string;
}

export interface ZoneUsersResponse {
    users: {
        profile: Pick<IUser, '_id' | 'firstName' | 'lastName' | 'phoneNumber' | 'email' | 'pictureUrl'>;
    }[];
}
export interface LeaderboardPayload extends IPaginationParams {
    startDate?: number; // epoch milliseconds
    endDate?: number; // epoch milliseconds
    zoneId?: string;
    campusId?: string;
}

// Verified 2026-07-19 against a live response from
// GET /leaderboards/zone/:zoneId/worker-profile/:workerId.
export interface WorkerStageBreakdownEntry {
    count: number;
    points: number;
}

export interface WorkerStageBreakdown {
    invited?: WorkerStageBreakdownEntry;
    attended?: WorkerStageBreakdownEntry;
    discipled?: WorkerStageBreakdownEntry;
    assimilated?: WorkerStageBreakdownEntry;
}

export interface WorkerProfileResponse {
    workerId: string;
    name?: string;
    department?: string;
    campus?: string;
    role?: string;
    pictureUrl?: string;
    zone?: string;
    rank?: number;
    score?: number;
    stageBreakdown?: WorkerStageBreakdown;
    totalGuests?: number;
    guestsInPeriod?: number;
    conversions?: number;
    timelines?: number;
}

export interface WorkerProfilePayload {
    zoneId: string;
    workerId: string;
    startDate?: number;
    endDate?: number;
}

export interface WorkerGuestsPayload extends IPaginationParams {
    workerId: string;
    stageId: string;
    zoneId?: string;
    startDate?: number;
    endDate?: number;
}

// Verified 2026-07-19 against live responses from /zone-users/zone-summary/:zoneId/active-workers,
// .../inactive-workers, and /zone-users/zero-engagement-workers.
export interface ZoneWorkerEntry {
    workerId?: string;
    _id?: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    department?: string;
    role?: string;
    pictureUrl?: string;
    zoneId?: string;
    zoneName?: string;
    lastActive?: string | null;
    daysSinceActive?: number | null;
}

export interface ZoneWorkersPeriodPayload {
    zoneId: string;
    startDate?: number;
    endDate?: number;
}

export interface ZeroEngagementWorkersPayload {
    zoneId?: string;
    campusId?: string;
    weeks?: number;
    startDate?: number;
    endDate?: number;
}

// GET /analytics - verified 2026-07-19 against a live response, except workerLeaderboardTrend and
// activeVsInactiveTrend, which came back empty in the sample (no engagement-snapshot history yet -
// per the docs both "require snapshot data"). Their per-week point shapes are a best-effort guess
// following the same weekLabel/weekStart convention as the other verified weekly series below.
export interface StageFunnelPoint {
    stage?: string;
    label?: string;
    count?: number;
    conversionRate?: number | null;
    dropOffRate?: number | null;
}

export interface WeeklyGuestTrendPoint {
    weekLabel?: string;
    weekStart?: string;
    year?: number;
    week?: number;
    invited?: number;
    attended?: number;
    discipled?: number;
    joined?: number;
    total?: number;
}

export interface WeeklyConversionTrendPoint {
    weekLabel?: string;
    weekStart?: string;
    year?: number;
    week?: number;
    total?: number;
    converted?: number;
    conversionRate?: number;
}

export interface WorkerTrendSeriesPoint {
    weekLabel?: string;
    weekStart?: string;
    score?: number;
}

export interface WorkerTrendSeries {
    workerId?: string;
    name?: string;
    pictureUrl?: string;
    points?: WorkerTrendSeriesPoint[];
}

// Unverified (empty sample) - real response is `{ workers: [], weeks: [] }`, not a bare array.
export interface WorkerLeaderboardTrend {
    workers?: WorkerTrendSeries[];
    weeks?: string[];
}

export interface ActiveVsInactiveTrendPoint {
    weekLabel?: string;
    weekStart?: string;
    active?: number;
    inactive?: number;
}

export interface StageDropOffPoint {
    from?: string;
    to?: string;
    fromCount?: number;
    toCount?: number;
    retained?: number;
    dropOff?: number;
    dropOffRate?: number;
    conversionRate?: number;
}

export interface AnalyticsResponse {
    period?: { start?: string; end?: string };
    scoringLegend?: ScoringLegend;
    stageFunnel?: StageFunnelPoint[];
    weeklyGuestTrend?: WeeklyGuestTrendPoint[];
    weeklyConversionTrend?: WeeklyConversionTrendPoint[];
    workerLeaderboardTrend?: WorkerLeaderboardTrend;
    activeVsInactiveTrend?: ActiveVsInactiveTrendPoint[];
    stageDropOff?: StageDropOffPoint[];
}

export interface AnalyticsPayload {
    zoneId?: string;
    campusId?: string;
    startDate?: number;
    endDate?: number;
}

// Verified 2026-07-19 - present on both /leaderboards/global-top-performing-workers and /analytics.
export interface ScoringLegendEntry {
    label: string;
    pointsPerGuest: number;
}

export interface ScoringLegend {
    invited?: ScoringLegendEntry;
    attended?: ScoringLegendEntry;
    discipled?: ScoringLegendEntry;
    assimilated?: ScoringLegendEntry;
}

export interface WorkerLeaderboardEntry {
    conversions: number;
    position: number;
    name: string;
    scores: number;
    workerId: string;
    zone: string;
    pictureUrl: string;
    campus: string;
    department: string;
    timelines: number;
    role: string;
    trend: TrendDirection;
    guest: number;
    // worker: {
    //     _id: string;
    //     lastName: string;
    //     firstName: string;
    //     phoneNumber: string;
    //     pictureUrl: string;
    // };
    // zone: {
    //     _id: string;
    //     name: string;
    // };
    // role: {
    //     _id: string;
    //     name: string;
    // };
    // createdBy: {
    //     _id: string;
    //     firstName: string;
    //     lastName: string;
    //     email: string;
    //     pictureUrl: string;
    // };
    // position: number;
    // points: number;
    // guestCount: number;
    // callsCounts: number;
    // consistency: number;
    // conversion: number;
    // visitsCounts: number;
    // trend: TrendDirection;
    // achievement: {
    //     title: string;
    //     date: string;
    // }[];
}

export interface ZoneStats {
    totalGuests: number;
    conversions: number;
    conversionRate: number;
    activeWorkers: number;
    avgResponseTime: string;
}

// TODO: Suspended from legacy
// export interface ZoneLeaderboardEntry {
//     zone: string;
//     coordinator: string;
//     stats: ZoneStats;
//     points: number;
//     position: number;
//     trend: TrendDirection;
// }

export interface Worker {
    _id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    pictureUrl: string;
}

export interface ConversionBreakdown {
    invitedCount: number;
    attendedCount: number;
    discipleCount: number;
    joinedCount: number;
    totalGuests: number;
}

export interface ConversionRates {
    invitedToAttended: number;
    attendedToDisciple: number;
    discipleToJoined: number;
    attendedToJoined: number;
    breakdown: ConversionBreakdown;
    totalInvitedToJoined?: number;
    averageConversion: number;
}

export interface ZoneLeaderboardEntry {
    // position: number;
    // points: number;
    // zoneId: string;
    // zoneName: string;
    // campusId: string;
    // coordinators: any[]; // If you have a structure for coordinators, replace `any` with it
    // workersCount: number;
    // workers: Worker[];
    // totalGuests: number;
    // conversion: number;
    // calls: number;
    // visits: number;
    position: number;
    campus: string;
    trend: TrendDirection;
    attended: number;
    conversions: number;
    discipled: number;
    invited: number;
    joined: number;
    scores: number;
    zone: string;
}

export enum AchievementRarity {
    COMMON = 'common',
    RARE = 'rare',
    EPIC = 'epic',
    LEGENDARY = 'legendary',
}

export interface Achievement {
    id: ID;
    title: string;
    description: string;
    rarity: AchievementRarity;
    points: number;
    isUnlocked?: boolean;
    unlockedAt?: string;
}

// Analytics and Dashboard types
export enum TrendDirection {
    UP = 'up',
    DOWN = 'down',
    STABLE = 'stable',
}

export interface ZonePerformance {
    zone: string;
    zoneId?: string;
    invited: number;
    attended: number;
    discipled: number;
    joined: number;
    conversion: number;
}

export interface MonthlyTrend {
    month: string;
    newGuests: number;
    invited: number;
    attended: number;
    discipled: number;
    joined: number;
}

export interface StageDistributionItem {
    name: string;
    value: number;
    color: string;
}

export interface DropOffAnalysis {
    stage: string;
    dropOff: number;
    reason: string;
    percentage: number;
}

export interface TopPerformer {
    name: string;
    zone?: string;
    zoneId?: string;
    conversions: number;
    trend: TrendDirection;
}

export interface GlobalAnalytics {
    totalGuests: number;
    totalConversions?: number;
    totalActiveUsers?: number;
    totalWorker?: number;
    conversionRate?: number;
    avgTimeToConversion?: number;
    conversionRates?: ConversionRates;
    monthlyTrends: MonthlyTrend[];
    zonePerformance: ZonePerformance[];
    stageDistribution: StageDistributionItem[];
    dropOffAnalysis: DropOffAnalysis[];
    topPerformingWorkers: TopPerformer[];
    topPerformingZones: TopPerformer[];
    topPerformers: TopPerformer[];
}

export type DropOffAnalyticsResponse = { dropOffAnalysis: DropOffAnalysis[] };

export interface Recommendation {
    title: string;
    description: string;
    type: 'info' | 'success' | 'warning';
}

export type RecommendationsResponse = { recommendations: Recommendation[] };

export interface RoastDashboardPayload {
    startDate?: number; // epoch milliseconds
    endDate?: number; // epoch milliseconds
    zoneId?: string;
    campusId?: string;
}

export interface ZoneDashboardResponse {
    zoneId: string;
    zoneName: string;
    totalGuests: number;
    totalConversations: number;
    totalActiveUsers: number;
    totalWorker: number;
    trend: TrendDirection;
    conversionRates: {
        invitedToAttended: number;
        attendedToDisciple: number;
        discipleToJoined: number;
        attendedToJoined: number;
        breakdown: {
            invitedCount: number;
            attendedCount: number;
            discipleCount: number;
            joinedCount: number;
            totalGuests: number;
        };
    };
}

// Pipeline and Notification Types
export interface PipelineMilestone {
    id: string;
    title: string;
    description: string;
    required: boolean;
    order: number;
}

export interface PipelineStage {
    _id: string;
    name: string;
    label: AssimilationStage;
    descriptions: string;
    order: number;
    color: string;
    isDefault: boolean;
    milestones: PipelineMilestone[];
}

export interface PipelineSubStage {
    _id: string;
    name: string;
    assimilationStageId: string;
    label: AssimilationStage;
    descriptions: string;
    order: number;
    color: string;
    isDefault: boolean;
    milestones: PipelineMilestone[];
}

export interface NotificationRule {
    id: string;
    name: string;
    description: string;
    triggerEvent: 'stagnant_guest' | 'milestone_completed' | 'stage_transition' | 'new_assignment';
    conditions: {
        daysSinceContact?: number;
        stage?: string;
        priority?: 'low' | 'medium' | 'high';
    };
    recipients: ('worker' | 'coordinator' | 'admin')[];
    isActive: boolean;
}

// Utils
export interface FetchCache<P = any, R = any> {
    payload: P;
    cacheKey: string;
    fn: (payload: P) => Promise<R>;
}

export type GetGuestPayload = Partial<
    Pick<
        Guest,
        'campusId' | 'assignedToId' | 'zoneId' | 'preferredChannelId' | 'assimilationStageId' | 'assimilationSubStageId'
    >
> &
    IPaginationParams & { search?: string };

export interface GuestCount {
    assimilationStageId: string;
    stageName: string;
    count: number;
}
export interface GuestCountResponse {
    count: Array<GuestCount>;
}
