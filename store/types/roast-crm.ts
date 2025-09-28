import { IPaginationParams } from '.';

// Core types
export type ID = string;

// Enums
export enum Role {
    ADMIN = 'ADMIN',
    ZONAL_COORDINATOR = 'ZONAL_COORDINATOR',
    WORKER = 'WORKER',
    PASTOR = 'PASTOR',
}

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
    role: Role;
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
    campusId: string;
    coordinator?: ID;
    workers?: ID[];
    guestCounts?: {
        invited: number;
        attended: number;
        discipled: number;
        joined: number;
    };
}

export interface Timeline {
    _id: ID;
    guestId: string;
    assignedToId: string;
    title?: string;
    notes?: string;
    createdBy: string;
    createdAt: string | Date;
    type: ContactChannel;
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

export interface WorkerLeaderboardEntry {
    id: ID;
    name: string;
    zone: string;
    avatar: string;
    stats: WorkerStats;
    badges: string[];
    trend: TrendDirection;
    points: number;
}

export interface ZoneStats {
    totalGuests: number;
    conversions: number;
    conversionRate: number;
    activeWorkers: number;
    avgResponseTime: string;
}

export interface ZoneLeaderboardEntry {
    zone: string;
    coordinator: string;
    stats: ZoneStats;
    points: number;
    trend: TrendDirection;
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
    zone: string;
    conversions: number;
    trend: TrendDirection;
}

export interface GlobalAnalytics {
    totalGuests: number;
    conversionRate: number;
    avgTimeToConversion: number;
    activeWorkers: number;
    monthlyTrends: MonthlyTrend[];
    zonePerformance: ZonePerformance[];
    stageDistribution: StageDistributionItem[];
    dropOffAnalysis: DropOffAnalysis[];
    topPerformers: TopPerformer[];
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
    description: string;
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
    description: string;
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

export type GetGuestPayload = Partial<Pick<Guest, 'campusId' | 'assignedToId' | 'zoneId'>> & IPaginationParams;

export interface GuestCount {
    assimilationStageId: string;
    stageName: string;
    count: number;
}
export interface GuestCountResponse {
    count: Array<GuestCount>;
}
