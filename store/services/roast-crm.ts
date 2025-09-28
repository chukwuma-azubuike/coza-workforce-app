import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {
    Guest,
    User,
    Zone,
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
    IDefaultResponse,
    GetGuestPayload,
    PipelineSubStage,
    GuestCountResponse,
    IDefaultQueryParams,
    Timeline,
} from '../types';
import APP_VARIANT from '~/config/envConfig';
import Utils from '~/utils';

// Helper to get current ISO timestamp
const uuid = () => Math.random().toString(36).substring(2, 10);

const mockUsers: User[] = [
    { _id: 'user-worker-1', name: 'Worker 1', role: Role.WORKER },
    { _id: 'user-worker-2', name: 'Worker 2', role: Role.WORKER },
    { _id: 'user-coord-1', name: 'Coordinator', role: Role.ZONAL_COORDINATOR, zoneIds: ['zone-1'] },
];

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
        baseUrl: APP_VARIANT.CRM_API_BASE_URL,
        prepareHeaders: async headers => {
            const userSession = (await Utils.retrieveUserSession()) || '';
            const token = !!userSession && JSON.parse(userSession)?.token.token;

            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }

            return headers;
        },
    }),

    tagTypes: [
        'Guest',
        'GuestList',
        'Zone',
        'User',
        'Timeline',
        'Notification',
        'CurrentUser',
        'Analytics',
        'Leaderboard',
        'Pipeline',
        'PipelineStages',
    ],

    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,

    endpoints: builder => ({
        // Guest Queries
        getMyGuests: builder.query<Guest[], void>({
            query: () => ({
                url: `/guests`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (res: IDefaultResponse<Guest[]>) =>
                res.data.map(guest => {
                    return { ...guest, id: guest._id };
                }),

            providesTags: result =>
                result
                    ? [
                          ...result.map(({ _id }) => ({ type: 'Guest' as const, _id })),
                          { type: 'GuestList', _id: 'LIST' },
                      ]
                    : [{ type: 'GuestList', _id: 'LIST' }],
        }),

        getMyGuestsCount: builder.query<GuestCountResponse, void>({
            query: () => ({
                url: `/guests/counts`,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (res: IDefaultResponse<GuestCountResponse>) => res.data,

            providesTags: ['GuestList'],
        }),

        getGuests: builder.query<Guest[], GetGuestPayload>({
            query: params => ({
                url: `/guests`,
                method: REST_API_VERBS.GET,
                params,
            }),

            transformResponse: (res: IDefaultResponse<Guest[]>) =>
                res.data.map(guest => {
                    return { ...guest, id: guest._id };
                }),

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
                url: `/guests/${_id}`,
                method: REST_API_VERBS.GET,
            }),
            transformResponse: (res: IDefaultResponse<Guest>) => res.data,

            providesTags: (_result, _err, _id) => [{ type: 'Guest', _id }],
        }),

        createGuest: builder.mutation<Guest, GuestFormData>({
            query: guest => ({
                url: `/guests`,
                method: REST_API_VERBS.POST,
                body: guest,
            }),
            invalidatesTags: ['GuestList'],
        }),

        updateGuest: builder.mutation<Guest, Partial<Guest> & { _id: string }>({
            query: ({ _id, ...patch }) => ({
                url: `/guests/${_id}`,
                method: REST_API_VERBS.PUT,
                body: patch,
            }),
            async onQueryStarted({ _id, ...patch }, { dispatch, queryFulfilled, getState }) {
                // Optimistically update myGuests list cache
                const patchMyGuestsResult = dispatch(
                    roastCrmApi.util.updateQueryData('getMyGuests', undefined, draft => {
                        const guest = draft.find(g => g._id === _id);
                        if (guest) {
                            Object.assign(guest, patch);
                        }
                    })
                );

                // Get all existing getGuests queries from the cache
                const state = getState() as any;
                const guestsQueries = state[SERVICE_URL].queries;

                const patchGuestsResults = Object.entries(guestsQueries)
                    .filter(([key]) => key.startsWith('getGuests'))
                    .map(([_, query]: [string, any]) => {
                        const arg = query.originalArgs;
                        return dispatch(
                            roastCrmApi.util.updateQueryData('getGuests', arg, draft => {
                                const guest = draft.find(g => g._id === _id);
                                if (guest) {
                                    Object.assign(guest, patch);
                                }
                            })
                        );
                    });

                // Optimistically update the individual guest cache
                const patchResult = dispatch(
                    roastCrmApi.util.updateQueryData('getGuestById', _id, draft => {
                        Object.assign(draft, patch);
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    // If the mutation fails, undo all optimistic updates
                    patchResult.undo();
                    patchMyGuestsResult.undo();
                    patchGuestsResults.forEach(patchResult => patchResult.undo());
                }
            },
            invalidatesTags: (_result, _error, { _id }) => [
                { type: 'Guest', _id },
                { type: 'GuestList', _id: 'LIST' },
            ],
        }),

        // Zone Queries
        getZones: builder.query<Zone[], IDefaultQueryParams | void>({
            query: () => ({
                url: `/zones`,
                method: REST_API_VERBS.GET,
            }),
            transformResponse: (res: IDefaultResponse<{ data: Zone[] }>) => res.data.data,
            providesTags: result =>
                result
                    ? [...result.map(({ _id }) => ({ type: 'Zone' as const, _id }))]
                    : [{ type: 'Zone', _id: 'LIST' }],
        }),

        // User Queries
        getUsers: builder.query<User[], { role?: string; zoneId?: string }>({
            query: params => ({
                url: `/role/getRoles`,
                // url: `/users`,
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
        getTimeline: builder.query<Timeline[], { guestId: string }>({
            query: params => ({
                url: '/timelines',
                method: REST_API_VERBS.GET,
                params,
            }),

            transformResponse: (res: IDefaultResponse<Timeline[]>) => res.data,
            providesTags: (_result, _error, guestId) => [{ type: 'Timeline', _id: guestId }],
        }),

        addTimeline: builder.mutation<Timeline, Omit<Timeline, '_id' | 'createdAt' | 'createdBy'>>({
            query: timeline => ({
                url: '/timelines',
                method: REST_API_VERBS.POST,
                body: timeline,
            }),
            invalidatesTags: (_result, _error, { guestId }) => [
                { type: 'Timeline', _id: guestId },
                { type: 'Guest', _id: guestId },
            ],
        }),

        updateTimeline: builder.mutation<Timeline, Partial<Timeline> & { _id: string }>({
            query: ({ _id, ...timeline }) => ({
                url: `/timelines/${_id}`,
                method: REST_API_VERBS.PUT,
                body: timeline,
            }),
            invalidatesTags: (_result, _error, { guestId }) => [
                { type: 'Timeline', _id: guestId },
                { type: 'Guest', _id: guestId },
            ],
        }),

        // Notification Queries
        getNotifications: builder.query<NotificationProps[], void>({
            query: () => ({
                url: `/notifications`,
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
                url: `/notifications/${_id}/read`,
                method: REST_API_VERBS.PATCH,
            }),
            invalidatesTags: (_result, _error, _id) => [{ type: 'Notification', _id }],
        }),

        // Current User Query
        getCurrentUser: builder.query<User, void>({
            query: () => ({
                url: `/me`,
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
                url: `/leaderboard/workers`,
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
                url: `/leaderboard/zones`,
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
                url: `/achievements`,
                method: REST_API_VERBS.GET,
            }),
            transformResponse() {
                return mockCurrentUserAchievements;
            },
            providesTags: ['Leaderboard'],
        }),

        // Pipeline Settings Queries
        getAssimilationStages: builder.query<PipelineStage[], void>({
            query: () => ({
                url: `/assimilation-stages`,
                method: REST_API_VERBS.GET,
            }),
            transformResponse: (res: IDefaultResponse<PipelineStage[]>) => res.data,
            providesTags: ['Pipeline'],
        }),

        getAssimilationSubStages: builder.query<PipelineSubStage[], void>({
            query: () => ({
                url: `/assimilation-sub-stages`,
                method: REST_API_VERBS.GET,
            }),
            transformResponse: (res: IDefaultResponse<PipelineSubStage[]>) => res.data,

            providesTags: ['PipelineStages'],
        }),

        getNotificationRules: builder.query<NotificationRule[], void>({
            query: () => ({
                url: `/pipeline/notification-rules`,
                method: REST_API_VERBS.GET,
            }),
            transformResponse() {
                return mockNotificationRules;
            },
            providesTags: ['Pipeline'],
        }),

        updatePipelineStage: builder.mutation<PipelineStage, Partial<PipelineStage> & { id: string }>({
            query: ({ id, ...patch }) => ({
                url: `/pipeline/stages/${id}`,
                method: REST_API_VERBS.PATCH,
                body: patch,
            }),
            invalidatesTags: ['Pipeline'],
        }),

        createPipelineStage: builder.mutation<PipelineStage, Omit<PipelineStage, 'id'>>({
            query: stage => ({
                url: `/pipeline/stages`,
                method: REST_API_VERBS.POST,
                body: stage,
            }),
            invalidatesTags: ['Pipeline'],
        }),

        deletePipelineStage: builder.mutation<void, string>({
            query: id => ({
                url: `/pipeline/stages/${id}`,
                method: REST_API_VERBS.DELETE,
            }),
            invalidatesTags: ['Pipeline'],
        }),

        updateNotificationRule: builder.mutation<NotificationRule, Partial<NotificationRule> & { id: string }>({
            query: ({ id, ...patch }) => ({
                url: `/pipeline/notification-rules/${id}`,
                method: REST_API_VERBS.PATCH,
                body: patch,
            }),
            invalidatesTags: ['Pipeline'],
        }),

        // Analytics Queries
        getGlobalAnalytics: builder.query<GlobalAnalytics, { startDate: string; endDate: string; zoneId?: string }>({
            query: params => ({
                url: `/role/getRoles`,
                // url: `/analytics/global`,
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
    useGetMyGuestsQuery,
    useGetMyGuestsCountQuery,
    useGetGuestByIdQuery,
    useCreateGuestMutation,
    useUpdateGuestMutation,
    useGetZonesQuery,
    useGetUsersQuery,
    useGetTimelineQuery,
    useAddTimelineMutation,
    useUpdateTimelineMutation,
    useGetNotificationsQuery,
    useMarkNotificationAsReadMutation,
    useGetCurrentUserQuery,
    useGetGlobalAnalyticsQuery,
    useGetWorkerLeaderboardQuery,
    useGetZoneLeaderboardQuery,
    useGetAchievementsQuery,
    useGetAssimilationStagesQuery,
    useGetAssimilationSubStagesQuery,
    useGetNotificationRulesQuery,
    useUpdatePipelineStageMutation,
    useCreatePipelineStageMutation,
    useDeletePipelineStageMutation,
    useUpdateNotificationRuleMutation,
} = roastCrmApi;
