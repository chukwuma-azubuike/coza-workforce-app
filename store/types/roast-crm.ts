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
    startDate?: string;
    endDate?: string;
    zoneId?: string;
    campusId?: string;
}

export interface WorkerLeaderboardEntry {
    worker: {
        _id: string;
        lastName: string;
        firstName: string;
        phoneNumber: string;
        pictureUrl: string;
    };
    zone: {
        _id: string;
        name: string;
    };
    role: {
        _id: string;
        name: string;
    };
    createdBy: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        pictureUrl: string;
    };
    position: number;
    points: number;
    guestCount: number;
    callsCounts: number;
    consistency: number;
    conversion: number;
    visitsCounts: number;
    trend: TrendDirection;
    achievement: {
        title: string;
        date: string;
    }[];
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
}

export interface ZoneLeaderboardEntry {
    position: number;
    points: number;
    zoneId: string;
    zoneName: string;
    campusId: string;
    coordinators: any[]; // If you have a structure for coordinators, replace `any` with it
    workersCount: number;
    workers: Worker[];
    totalGuests: number;
    conversion: number;
    calls: number;
    visits: number;
    conversionRates: ConversionRates;
    trend: string; // e.g. "up"
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
    converted: number;
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
}

export interface RoastDashboardPayload {
    startDate?: string;
    endDate?: string;
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
    Pick<Guest, 'campusId' | 'assignedToId' | 'zoneId' | 'preferredChannelId' | 'assimilationStageId'>
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
