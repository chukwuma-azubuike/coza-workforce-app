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
    INVITED = 'invited',
    ATTENDED = 'attended',
    DISCIPLED = 'discipled',
    JOINED = 'joined',
}

export enum ContactChannel {
    CALL = 'CALL',
    WHATSAPP = 'WHATSAPP',
    SMS = 'SMS',
    EMAIL = 'EMAIL',
    VISIT = 'VISIT',
    MEETING = 'MEETING',
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
    title?: string;
    notes?: string;
    createdBy: string;
    description?: string;
    createdAt: string | Date;
    type: 'note' | 'call' | 'visit';
}

export interface Guest {
    _id: ID;
    phone: string;
    zoneId: ID;
    assignedToId?: ID | null;
    campusId?: ID;
    createdById?: ID;
    createdAt: string | Date; // ISO string format
    lastContact?: string | Date; // ISO string format
    preferredChannel?: ContactChannel;
    completedAt?: string | Date | null;
    prayerRequest?: string | null;
    address?: string | null;
    assimilationStage: AssimilationStage;
    nextAction?: string;
    milestones: Milestone[];
    meta?: Record<string, any>;
    name: string;
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
export interface GuestFormData extends Omit<Guest, '_id' | 'createdAt' | 'milestones' | 'name' | 'stage'> {
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
    id: string;
    name: string;
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
