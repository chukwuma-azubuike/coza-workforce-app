import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
    Guest,
    User,
    Engagement,
    MilestoneStatus,
    ContactChannel,
    Zone,
    AssimilationStage,
    GuestFormData,
    Role,
    NotificationProps,
    NotificationType,
    NotificationPriority,
    GlobalAnalytics,
    TrendDirection,
    WorkerLeaderboardEntry,
    ZoneLeaderboardEntry,
    Achievement,
    AchievementRarity,
    PipelineStage,
    NotificationRule,
    REST_API_VERBS,
} from '../types';
import APP_VARIANT from '~/config/envConfig';

// Helper to get current ISO timestamp
const now = () => new Date();
const uuid = () => Math.random().toString(36).substring(2, 10);

// Mock Data Generator
const generateMockGuest = (overrides: Partial<Guest> = {}): Guest => ({
    id: uuid(),
    _id: uuid(),
    gender: 'male',
    name: 'John Doe',
    lastName: 'John',
    firstName: 'Doe',
    phone: '+2348012345678',
    zoneId: 'zone-1',
    assignedToId: 'user-worker-1',
    createdById: 'user-worker-1',
    createdAt: now(),
    lastContact: now(),
    preferredChannel: ContactChannel.WHATSAPP,
    comment: 'Pray for new job',
    address: 'Lagos',
    nextAction: 'Follow up via call',
    assimilationStage: AssimilationStage.INVITED,
    milestones: [
        {
            _id: uuid(),
            title: 'Initial Contact',
            description: 'First contact with guest',
            weekNumber: 1,
            status: MilestoneStatus.PENDING,
            completedAt: null,
        },
        {
            _id: uuid(),
            title: 'First Service',
            description: 'Attended first service',
            weekNumber: 2,
            status: MilestoneStatus.COMPLETED,
            completedAt: now(),
        },
        {
            _id: uuid(),
            title: 'Second Service',
            description: 'Attended second service',
            weekNumber: 3,
            status: MilestoneStatus.COMPLETED,
            completedAt: now(),
        },
    ],
    meta: {},
    ...overrides,
});

// Initial Mock Data
const mockGuests: Guest[] = [
    generateMockGuest({
        name: 'Remi Lawal',
        assignedToId: 'user-worker-1',
        assimilationStage: AssimilationStage.INVITED,
        lastContact: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    }),
    generateMockGuest({
        name: 'Chidi Uba',
        assignedToId: 'user-worker-2',
        assimilationStage: AssimilationStage.ATTENDED1,
        lastContact: now(),
    }),
    generateMockGuest({
        name: 'Ngozi Udo',
        assignedToId: 'user-worker-3',
        assimilationStage: AssimilationStage.ATTENDED1,
    }),
    generateMockGuest({
        name: 'Usman Jankin',
        assignedToId: 'user-worker-3',
        assimilationStage: AssimilationStage.ATTENDED2,
    }),
    generateMockGuest({
        name: 'Remi Lawal',
        assignedToId: 'user-worker-1',
        assimilationStage: AssimilationStage.ATTENDED2,
        lastContact: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    }),
    generateMockGuest({
        name: 'Chidi Uba',
        assignedToId: 'user-worker-2',
        assimilationStage: AssimilationStage.ATTENDED3,
        lastContact: now(),
    }),
    generateMockGuest({
        name: 'Ngozi Udo',
        assignedToId: 'user-worker-3',
        assimilationStage: AssimilationStage.ATTENDED5,
    }),
    generateMockGuest({
        name: 'Usman Jankin',
        assignedToId: 'user-worker-3',
        assimilationStage: AssimilationStage.ATTENDED6,
    }),
    generateMockGuest({
        name: 'Remi Lawal',
        assignedToId: 'user-worker-1',
        assimilationStage: AssimilationStage.MGI,
        lastContact: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    }),
    generateMockGuest({
        name: 'Chidi Uba',
        assignedToId: 'user-worker-2',
        assimilationStage: AssimilationStage.MGI,
        lastContact: now(),
    }),
    generateMockGuest({
        name: 'Ngozi Udo',
        assignedToId: 'user-worker-3',
        assimilationStage: AssimilationStage.JOINED,
    }),
];

const mockZones: Zone[] = [
    { _id: 'zone-1', campusId: 'coza-lagos', name: 'Central Zone' },
    { _id: 'zone-2', campusId: 'coza-lagos', name: 'North Zone' },
    { _id: 'zone-3', campusId: 'coza-lagos', name: 'South Zone' },
    { _id: 'zone-4', campusId: 'coza-lagos', name: 'East Zone' },
    { _id: 'zone-5', campusId: 'coza-lagos', name: 'West Zone' },
];

const mockUsers: User[] = [
    { _id: 'user-worker-1', name: 'Worker 1', role: Role.WORKER },
    { _id: 'user-worker-2', name: 'Worker 2', role: Role.WORKER },
    { _id: 'user-coord-1', name: 'Coordinator', role: Role.ZONAL_COORDINATOR, zoneIds: ['zone-1'] },
];

const mockEngagements: Record<string, Engagement[]> = {};

// Mock current user for development
const mockCurrentUser: User = {
    _id: 'current-user',
    name: 'John Doe',
    email: 'john@church.org',
    phone: '+2348012345678',
    role: Role.WORKER,
    zoneName: 'Central Zone',
    guestCount: 12,
    isActive: true,
    zoneIds: ['zone-1'],
};

// Mock analytics data
const mockStageDistribution = [
    { name: 'Invited', value: 212, color: '#3B82F6' },
    { name: 'Attended', value: 148, color: '#10B981' },
    { name: 'Discipled', value: 85, color: '#8B5CF6' },
    { name: 'Joined', value: 54, color: '#6B7280' },
];

// Mock notification data
const mockNotifications: NotificationProps[] = [
    {
        _id: uuid(),
        type: NotificationType.FOLLOW_UP,
        title: 'Follow-up Due',
        message: "Sarah Johnson needs a follow-up call - it's been 2 days since last contact",
        guestName: 'Sarah Johnson',
        guestId: 'guest1',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        isRead: false,
        priority: NotificationPriority.HIGH,
        actionRequired: true,
    },
    {
        _id: uuid(),
        type: NotificationType.MILESTONE,
        title: 'Milestone Completed',
        message: 'Mike Chen completed "First Visit" milestone',
        guestName: 'Mike Chen',
        guestId: 'guest2',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        isRead: false,
        priority: NotificationPriority.MEDIUM,
        actionRequired: false,
    },
    {
        _id: uuid(),
        type: NotificationType.STAGNANT,
        title: 'Guest Needs Attention',
        message: "Emily Rodriguez hasn't had contact in 7 days and may be losing interest",
        guestName: 'Emily Rodriguez',
        guestId: 'guest3',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        isRead: true,
        priority: NotificationPriority.HIGH,
        actionRequired: true,
    },
    {
        _id: uuid(),
        type: NotificationType.ASSIGNMENT,
        title: 'New Guest Assigned',
        message: 'Lisa Zhang has been assigned to you for follow-up',
        guestName: 'Lisa Zhang',
        guestId: 'guest5',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        isRead: true,
        priority: NotificationPriority.MEDIUM,
        actionRequired: true,
    },
    {
        _id: uuid(),
        type: NotificationType.REMINDER,
        title: 'Weekly Report Due',
        message: 'Your weekly guest activity report is due tomorrow',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        isRead: true,
        priority: NotificationPriority.MEDIUM,
        actionRequired: true,
    },
    {
        _id: uuid(),
        type: NotificationType.WELCOME,
        title: 'Welcome Message Sent',
        message: 'Welcome message sent to David Kim via WhatsApp',
        guestName: 'David Kim',
        guestId: 'guest4',
        createdAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // 1.5 days ago
        isRead: true,
        priority: NotificationPriority.LOW,
        actionRequired: false,
    },
];

const mockLeaderBoard: WorkerLeaderboardEntry[] = [
    {
        id: 'worker1',
        name: 'John Worker',
        zone: 'Central',
        avatar: 'JW',
        stats: {
            guestsCaptured: 28,
            conversions: 8,
            callsMade: 156,
            visitsMade: 24,
            milestoneCompletions: 45,
            consistency: 95,
        },
        badges: ['Top Evangelist', 'Consistent Caller', 'Conversion King'],
        trend: TrendDirection.UP,
        points: 2850,
    },
    {
        id: 'worker2',
        name: 'Mary Helper',
        zone: 'South',
        avatar: 'MH',
        stats: {
            guestsCaptured: 25,
            conversions: 7,
            callsMade: 142,
            visitsMade: 31,
            milestoneCompletions: 42,
            consistency: 88,
        },
        badges: ['Visit Champion', 'Faithful Follower'],
        trend: TrendDirection.UP,
        points: 2720,
    },
    {
        id: 'worker3',
        name: 'Paul Evangelist',
        zone: 'North',
        avatar: 'PE',
        stats: {
            guestsCaptured: 32,
            conversions: 6,
            callsMade: 134,
            visitsMade: 19,
            milestoneCompletions: 38,
            consistency: 92,
        },
        badges: ['Guest Magnet', 'Street Warrior'],
        trend: TrendDirection.STABLE,
        points: 2680,
    },
    {
        id: 'worker4',
        name: 'Sarah Minister',
        zone: 'East',
        avatar: 'SM',
        stats: {
            guestsCaptured: 22,
            conversions: 5,
            callsMade: 118,
            visitsMade: 16,
            milestoneCompletions: 35,
            consistency: 85,
        },
        badges: ['Rising Star'],
        trend: TrendDirection.UP,
        points: 2420,
    },
    {
        id: 'worker5',
        name: 'David Pastor',
        zone: 'West',
        avatar: 'DP',
        stats: {
            guestsCaptured: 19,
            conversions: 5,
            callsMade: 95,
            visitsMade: 22,
            milestoneCompletions: 32,
            consistency: 78,
        },
        badges: ['Steady Eddie'],
        trend: TrendDirection.DOWN,
        points: 2180,
    },
];

const mockCurrentUserAchievements: Achievement[] = [
    {
        id: 'first_guest',
        title: 'First Guest',
        description: 'Capture your first guest',
        rarity: AchievementRarity.COMMON,
        points: 100,
    },
    {
        id: 'conversion_master',
        title: 'Conversion Master',
        description: 'Convert 10 guests to workforce',
        rarity: AchievementRarity.LEGENDARY,
        points: 1000,
    },
    {
        id: 'consistent_caller',
        title: 'Consistent Caller',
        description: 'Make calls for 30 days straight',
        rarity: AchievementRarity.RARE,
        points: 500,
    },
    {
        id: 'visit_champion',
        title: 'Visit Champion',
        description: 'Complete 50 home visits',
        rarity: AchievementRarity.EPIC,
        points: 750,
    },
];

const mockZoneLeaderboard: ZoneLeaderboardEntry[] = [
    {
        zone: 'South Zone',
        coordinator: 'Pastor Mike',
        stats: {
            totalGuests: 89,
            conversions: 24,
            conversionRate: 27,
            activeWorkers: 6,
            avgResponseTime: '2.3 hours',
        },
        points: 8950,
        trend: TrendDirection.UP,
    },
    {
        zone: 'Central Zone',
        coordinator: 'Elder Sarah',
        stats: {
            totalGuests: 76,
            conversions: 19,
            conversionRate: 25,
            activeWorkers: 5,
            avgResponseTime: '1.8 hours',
        },
        points: 8200,
        trend: TrendDirection.UP,
    },
    {
        zone: 'North Zone',
        coordinator: 'Deacon John',
        stats: {
            totalGuests: 68,
            conversions: 16,
            conversionRate: 24,
            activeWorkers: 4,
            avgResponseTime: '3.1 hours',
        },
        points: 7680,
        trend: TrendDirection.STABLE,
    },
    {
        zone: 'East Zone',
        coordinator: 'Minister Lisa',
        stats: {
            totalGuests: 62,
            conversions: 14,
            conversionRate: 23,
            activeWorkers: 4,
            avgResponseTime: '2.7 hours',
        },
        points: 7020,
        trend: TrendDirection.DOWN,
    },
    {
        zone: 'West Zone',
        coordinator: 'Pastor David',
        stats: {
            totalGuests: 55,
            conversions: 12,
            conversionRate: 22,
            activeWorkers: 3,
            avgResponseTime: '4.2 hours',
        },
        points: 6240,
        trend: TrendDirection.DOWN,
    },
];

const mockPipelineStages: PipelineStage[] = [
    {
        id: 'invited',
        name: 'Invited',
        description: 'Guest has been invited to church but has not yet attended',
        order: 1,
        color: '#3B82F6',
        isDefault: true,
        milestones: [
            {
                id: 'm1',
                title: 'Initial Contact',
                description: 'First interaction with guest',
                required: true,
                order: 1,
            },
            {
                id: 'm2',
                title: 'Phone Call',
                description: 'Follow-up phone call made',
                required: true,
                order: 2,
            },
            {
                id: 'm3',
                title: 'Service Invitation',
                description: 'Guest invited to attend service',
                required: true,
                order: 3,
            },
        ],
    },
    {
        id: 'attended',
        name: 'Attended',
        description: 'Guest has attended at least one church service',
        order: 2,
        color: '#10B981',
        isDefault: true,
        milestones: [
            {
                id: 'm4',
                title: 'First Visit',
                description: 'Guest attended their first service',
                required: true,
                order: 1,
            },
            {
                id: 'm5',
                title: 'Welcome Meeting',
                description: 'Met with welcome team',
                required: false,
                order: 2,
            },
            {
                id: 'm6',
                title: 'Small Group Invitation',
                description: 'Invited to join small group',
                required: true,
                order: 3,
            },
        ],
    },
    {
        id: 'discipled',
        name: 'Discipled',
        description: 'Guest is actively participating in discipleship activities',
        order: 3,
        color: '#8B5CF6',
        isDefault: true,
        milestones: [
            {
                id: 'm7',
                title: 'Small Group Attendance',
                description: 'Regularly attending small group',
                required: true,
                order: 1,
            },
            {
                id: 'm8',
                title: 'Bible Study Started',
                description: 'Enrolled in Bible study program',
                required: true,
                order: 2,
            },
            {
                id: 'm9',
                title: 'Baptism Preparation',
                description: 'Preparing for baptism',
                required: false,
                order: 3,
            },
        ],
    },
    {
        id: 'joined',
        name: 'Joined Workforce',
        description: 'Guest has become an active member and joined ministry',
        order: 4,
        color: '#6B7280',
        isDefault: true,
        milestones: [
            {
                id: 'm10',
                title: 'Baptism Completed',
                description: 'Guest has been baptized',
                required: false,
                order: 1,
            },
            {
                id: 'm11',
                title: 'Ministry Assignment',
                description: 'Assigned to a ministry team',
                required: true,
                order: 2,
            },
            {
                id: 'm12',
                title: 'Leadership Training',
                description: 'Completed leadership training',
                required: false,
                order: 3,
            },
        ],
    },
];

const mockNotificationRules: NotificationRule[] = [
    {
        id: 'n1',
        name: 'Stagnant Guest Alert',
        description: "Alert coordinator when a guest hasn't been contacted in 7 days",
        triggerEvent: 'stagnant_guest',
        conditions: { daysSinceContact: 7 },
        recipients: ['coordinator'],
        isActive: true,
    },
    {
        id: 'n2',
        name: 'Milestone Celebration',
        description: 'Notify team when important milestones are completed',
        triggerEvent: 'milestone_completed',
        conditions: { priority: 'high' },
        recipients: ['worker', 'coordinator'],
        isActive: true,
    },
    {
        id: 'n3',
        name: 'Stage Transition Alert',
        description: 'Alert admin when guests move to final stage',
        triggerEvent: 'stage_transition',
        conditions: { stage: 'joined' },
        recipients: ['admin'],
        isActive: true,
    },
];

const SERVICE_URL = 'roast-crm';

export const roastCrmApi = createApi({
    reducerPath: SERVICE_URL,

    baseQuery: fetchBaseQuery({
        baseUrl: APP_VARIANT.API_BASE_URL ?? 'https://localhost:4000/api',
        prepareHeaders: headers => {
            return headers;
        },
    }),

    tagTypes: [
        'Guest',
        'GuestList',
        'Zone',
        'User',
        'Engagement',
        'Notification',
        'CurrentUser',
        'Analytics',
        'Leaderboard',
        'Pipeline',
    ],

    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,

    endpoints: builder => ({
        // Guest Queries
        getGuests: builder.query<Guest[], { campusId?: string; workerId?: string; zoneId?: string }>({
            query: params => ({
                url: `/role/getRoles`,
                // url: `/${SERVICE_URL}/guests`,
                method: REST_API_VERBS.GET,
                params,
            }),
            transformResponse: () => {
                return mockGuests;
            },
            providesTags: result =>
                result
                    ? [
                          ...result.map(({ _id }) => ({ type: 'Guest' as const, _id })),
                          { type: 'GuestList', _id: 'LIST' },
                      ]
                    : [{ type: 'GuestList', _id: 'LIST' }],
        }),

        getGuestById: builder.query<Guest, string>({
            query: _id => ({
                url: `/role/getRoles`,
                // url: `${SERVICE_URL}/guests/${_id}`,
                method: REST_API_VERBS.GET,
            }),
            transformResponse(_res: any, _meta, arg) {
                return mockGuests.find(g => g._id === arg) ?? mockGuests[0];
            },
            providesTags: (_result, _err, _id) => [{ type: 'Guest', _id }],
        }),

        createGuest: builder.mutation<Guest, GuestFormData>({
            query: guest => ({
                url: `/role/getRoles`,
                // url: `${SERVICE_URL}/guests`,
                method: REST_API_VERBS.POST,
                body: guest,
            }),
            transformResponse(_res: any, _meta, arg) {
                const newGuest = generateMockGuest({
                    ...arg,
                    createdAt: now(),
                    lastContact: now(),
                    milestones:
                        arg.milestones?.map(m => ({
                            _id: uuid(),
                            title: m.title || '',
                            description: m.description,
                            weekNumber: m.weekNumber,
                            status: m.status || MilestoneStatus.PENDING,
                            completedAt: m.completedAt,
                        })) || [],
                });
                mockGuests.unshift(newGuest);
                return newGuest;
            },
            invalidatesTags: [{ type: 'GuestList', id: 'LIST' }],
        }),

        updateGuest: builder.mutation<Guest, Partial<Guest> & { _id: string }>({
            query: ({ _id, ...patch }) => ({
                url: `/role/getRoles`,
                // url: `${SERVICE_URL}/guests/${_id}`,
                method: REST_API_VERBS.GET,
                // method: REST_API_VERBS.PATCH,
                // body: patch,
            }),
            transformResponse(_res: any, _meta, arg) {
                const idx = mockGuests.findIndex(g => g._id === arg._id);
                if (idx >= 0) {
                    const updated = { ...mockGuests[idx], ...arg };
                    mockGuests[idx] = updated;
                    return updated;
                }
                throw new Error('Guest not found');
            },
            invalidatesTags: (_result, _error, { _id }) => [
                { type: 'Guest', _id },
                { type: 'GuestList', _id: 'LIST' },
            ],
        }),

        // Zone Queries
        getZones: builder.query<Zone[], void>({
            query: () => ({
                url: `/role/getRoles`,
                // url: `${SERVICE_URL}/zones`,
                method: REST_API_VERBS.GET,
            }),
            transformResponse() {
                return mockZones;
            },
            providesTags: result =>
                result
                    ? [...result.map(({ _id }) => ({ type: 'Zone' as const, _id }))]
                    : [{ type: 'Zone', _id: 'LIST' }],
        }),

        // User Queries
        getUsers: builder.query<User[], { role?: string; zoneId?: string }>({
            query: params => ({
                url: `/role/getRoles`,
                // url: `${SERVICE_URL}/users`,
                method: REST_API_VERBS.GET,
                params,
            }),
            transformResponse() {
                return mockUsers;
            },
            providesTags: result =>
                result
                    ? [...result.map(({ _id }) => ({ type: 'User' as const, _id }))]
                    : [{ type: 'User', _id: 'LIST' }],
        }),

        // Engagement Queries
        getEngagementsForGuest: builder.query<Engagement[], string>({
            query: guestId => ({
                url: `/role/getRoles`,
                // url: `${SERVICE_URL}/guests/${guestId}/engagements`,
                method: REST_API_VERBS.GET,
            }),
            transformResponse(_res: any, _meta, guestId) {
                if (!mockEngagements[guestId]) {
                    mockEngagements[guestId] = [
                        {
                            _id: uuid(),
                            guestId,
                            workerId: 'user-worker-1',
                            type: ContactChannel.CALL,
                            notes: 'Initial contact made',
                            timestamp: now(),
                        },
                        {
                            _id: uuid(),
                            guestId,
                            workerId: 'user-worker-1',
                            type: ContactChannel.WHATSAPP,
                            notes: `She mentioned that she’ll be coming to church whenever she’s around, though sometimes she stays on the island. Sister Joy also spoke to Esther.`,
                            timestamp: now(),
                        },
                        {
                            _id: uuid(),
                            guestId,
                            workerId: 'user-worker-1',
                            type: ContactChannel.VISIT,
                            notes: `She mentioned that she’ll be coming to church whenever she’s around, though sometimes she stays on the island. Sister Joy also spoke to Esther. She has been a member of the church for a long time and recently invited her brother, who just joined (I met him today).`,
                            timestamp: now(),
                        },
                    ];
                }
                return mockEngagements[guestId];
            },
            providesTags: (_result, _error, guestId) => [{ type: 'Engagement', _id: guestId }],
        }),

        addEngagement: builder.mutation<Engagement, Omit<Engagement, '_id' | 'timestamp'>>({
            query: engagement => ({
                url: `/role/getRoles`,
                method: REST_API_VERBS.GET,
                // url: `${SERVICE_URL}/guests/${engagement.guestId}/engagements`,
                // method: REST_API_VERBS.POST,
                // body: engagement,
            }),
            transformResponse(_res: any, _meta, arg) {
                const newEngagement: Engagement = {
                    ...arg,
                    _id: uuid(),
                    timestamp: now(),
                };

                if (!mockEngagements[arg.guestId]) {
                    mockEngagements[arg.guestId] = [];
                }
                mockEngagements[arg.guestId].unshift(newEngagement);

                // Update guest's last contact
                const guestIndex = mockGuests.findIndex(g => g._id === arg.guestId);
                if (guestIndex >= 0) {
                    mockGuests[guestIndex] = {
                        ...mockGuests[guestIndex],
                        lastContact: now(),
                    };
                }

                return newEngagement;
            },
            invalidatesTags: (_result, _error, { guestId }) => [
                { type: 'Engagement', _id: guestId },
                { type: 'Guest', _id: guestId },
            ],
        }),

        // Notification Queries
        getNotifications: builder.query<NotificationProps[], void>({
            query: () => ({
                url: `${SERVICE_URL}/notifications`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse() {
                return mockNotifications;
            },
            providesTags: result =>
                result
                    ? [...result.map(({ _id }) => ({ type: 'Notification' as const, _id }))]
                    : [{ type: 'Notification', _id: 'LIST' }],
        }),

        markNotificationAsRead: builder.mutation<NotificationProps, string>({
            query: _id => ({
                url: `${SERVICE_URL}/notifications/${_id}/read`,
                method: REST_API_VERBS.PATCH,
            }),
            transformResponse(_res: any, _meta, _id) {
                const idx = mockNotifications.findIndex(n => n._id === _id);
                if (idx >= 0) {
                    mockNotifications[idx] = { ...mockNotifications[idx], isRead: true };
                    return mockNotifications[idx];
                }
                throw new Error('Notification not found');
            },
            invalidatesTags: (_result, _error, _id) => [{ type: 'Notification', _id }],
        }),

        // Current User Query
        getCurrentUser: builder.query<User, void>({
            query: () => ({
                url: `${SERVICE_URL}/me`,
                method: REST_API_VERBS.GET,
            }),
            transformResponse() {
                return mockCurrentUser;
            },
            providesTags: ['CurrentUser'],
        }),

        // Leaderboard Queries
        getWorkerLeaderboard: builder.query<WorkerLeaderboardEntry[], string>({
            query: period => ({
                url: `${SERVICE_URL}/leaderboard/workers`,
                params: { period },
                method: REST_API_VERBS.GET,
            }),
            transformResponse() {
                return mockLeaderBoard;
            },
            providesTags: ['Leaderboard'],
        }),

        getZoneLeaderboard: builder.query<ZoneLeaderboardEntry[], string>({
            query: period => ({
                url: `${SERVICE_URL}/leaderboard/zones`,
                params: { period },
                method: REST_API_VERBS.GET,
            }),
            transformResponse() {
                return mockZoneLeaderboard;
            },
            providesTags: ['Leaderboard'],
        }),

        getAchievements: builder.query<Achievement[], void>({
            query: () => ({
                url: `${SERVICE_URL}/achievements`,
                method: REST_API_VERBS.GET,
            }),
            transformResponse() {
                return mockCurrentUserAchievements;
            },
            providesTags: ['Leaderboard'],
        }),

        // Pipeline Settings Queries
        getPipelineStages: builder.query<PipelineStage[], void>({
            query: () => ({
                url: `${SERVICE_URL}/pipeline/stages`,
                method: REST_API_VERBS.GET,
            }),
            transformResponse() {
                return mockPipelineStages;
            },
            providesTags: ['Pipeline'],
        }),

        getNotificationRules: builder.query<NotificationRule[], void>({
            query: () => ({
                url: `${SERVICE_URL}/pipeline/notification-rules`,
                method: REST_API_VERBS.GET,
            }),
            transformResponse() {
                return mockNotificationRules;
            },
            providesTags: ['Pipeline'],
        }),

        updatePipelineStage: builder.mutation<PipelineStage, Partial<PipelineStage> & { id: string }>({
            query: ({ id, ...patch }) => ({
                url: `${SERVICE_URL}/pipeline/stages/${id}`,
                method: REST_API_VERBS.PATCH,
                body: patch,
            }),
            invalidatesTags: ['Pipeline'],
        }),

        createPipelineStage: builder.mutation<PipelineStage, Omit<PipelineStage, 'id'>>({
            query: stage => ({
                url: `${SERVICE_URL}/pipeline/stages`,
                method: REST_API_VERBS.POST,
                body: stage,
            }),
            invalidatesTags: ['Pipeline'],
        }),

        deletePipelineStage: builder.mutation<void, string>({
            query: id => ({
                url: `${SERVICE_URL}/pipeline/stages/${id}`,
                method: REST_API_VERBS.DELETE,
            }),
            invalidatesTags: ['Pipeline'],
        }),

        updateNotificationRule: builder.mutation<NotificationRule, Partial<NotificationRule> & { id: string }>({
            query: ({ id, ...patch }) => ({
                url: `${SERVICE_URL}/pipeline/notification-rules/${id}`,
                method: REST_API_VERBS.PATCH,
                body: patch,
            }),
            invalidatesTags: ['Pipeline'],
        }),

        // Analytics Queries
        getGlobalAnalytics: builder.query<GlobalAnalytics, { startDate: string; endDate: string; zoneId?: string }>({
            query: params => ({
                url: `/role/getRoles`,
                // url: `${SERVICE_URL}/analytics/global`,
                method: REST_API_VERBS.GET,
                params,
            }),
            transformResponse() {
                return {
                    totalGuests: mockStageDistribution.reduce((sum, stage) => sum + stage.value, 0),
                    conversionRate: Math.round(
                        ((mockStageDistribution.find(s => s.name === 'Joined')?.value || 0) /
                            mockStageDistribution.reduce((sum, stage) => sum + stage.value, 0)) *
                            100
                    ),
                    avgTimeToConversion: 42,
                    activeWorkers: 25,
                    monthlyTrends: [
                        { month: 'Jul', newGuests: 28, converted: 5 },
                        { month: 'Aug', newGuests: 35, converted: 8 },
                        { month: 'Sep', newGuests: 42, converted: 12 },
                        { month: 'Oct', newGuests: 38, converted: 10 },
                        { month: 'Nov', newGuests: 45, converted: 15 },
                        { month: 'Dec', newGuests: 52, converted: 18 },
                    ],
                    zonePerformance: [
                        { zone: 'Central', invited: 45, attended: 32, discipled: 18, joined: 12, conversion: 27 },
                        { zone: 'North', invited: 38, attended: 28, discipled: 15, joined: 8, conversion: 21 },
                        { zone: 'South', invited: 52, attended: 35, discipled: 22, joined: 15, conversion: 29 },
                        { zone: 'East', invited: 41, attended: 29, discipled: 16, joined: 10, conversion: 24 },
                        { zone: 'West', invited: 36, attended: 24, discipled: 14, joined: 9, conversion: 25 },
                    ],
                    stageDistribution: [
                        { name: 'Invited', value: 212, color: '#3B82F6' },
                        { name: 'Attended', value: 148, color: '#10B981' },
                        { name: 'Discipled', value: 85, color: '#8B5CF6' },
                        { name: 'Joined', value: 54, color: '#6B7280' },
                    ],
                    dropOffAnalysis: [
                        { stage: 'Invited → Attended', dropOff: 30, reason: 'No follow-up call' },
                        { stage: 'Attended → Discipled', dropOff: 43, reason: 'Not invited to small group' },
                        { stage: 'Discipled → Joined', dropOff: 36, reason: 'Lack of mentorship' },
                    ],
                    topPerformers: [
                        { name: 'John Worker', zone: 'Central', conversions: 8, trend: TrendDirection.UP },
                        { name: 'Mary Helper', zone: 'South', conversions: 7, trend: TrendDirection.UP },
                        { name: 'Paul Evangelist', zone: 'North', conversions: 6, trend: TrendDirection.STABLE },
                        { name: 'Sarah Minister', zone: 'East', conversions: 5, trend: TrendDirection.DOWN },
                        { name: 'David Pastor', zone: 'West', conversions: 5, trend: TrendDirection.UP },
                    ],
                };
            },
            providesTags: ['Analytics'],
        }),
    }),
});

export const {
    useGetGuestsQuery,
    useGetGuestByIdQuery,
    useCreateGuestMutation,
    useUpdateGuestMutation,
    useGetZonesQuery,
    useGetUsersQuery,
    useGetEngagementsForGuestQuery,
    useAddEngagementMutation,
    useGetNotificationsQuery,
    useMarkNotificationAsReadMutation,
    useGetCurrentUserQuery,
    useGetGlobalAnalyticsQuery,
    useGetWorkerLeaderboardQuery,
    useGetZoneLeaderboardQuery,
    useGetAchievementsQuery,
    useGetPipelineStagesQuery,
    useGetNotificationRulesQuery,
    useUpdatePipelineStageMutation,
    useCreatePipelineStageMutation,
    useDeletePipelineStageMutation,
    useUpdateNotificationRuleMutation,
} = roastCrmApi;
