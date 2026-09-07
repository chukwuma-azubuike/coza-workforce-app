import { createApi } from '@reduxjs/toolkit/query/react';
import {
    Guest,
    User,
    Zone,
    GuestFormData,
    GlobalAnalytics,
    WorkerLeaderboardEntry,
    ZoneLeaderboardEntry,
    Achievement,
    AchievementRarity,
    PipelineStage,
    REST_API_VERBS,
    IDefaultResponse,
    GetGuestPayload,
    PipelineSubStage,
    GuestCountResponse,
    IDefaultQueryParams,
    Timeline,
    CreateZonePayload,
    RoastDashboardPayload,
    ZoneDashboardResponse,
    LeaderboardPayload,
    ZoneUsersPayload,
    ZoneUsersResponse,
    DropOffAnalyticsResponse,
    RecommendationsResponse,
    IPaginationParams,
    WorkerProfileResponse,
    WorkerProfilePayload,
    WorkerGuestsPayload,
    ZoneWorkerEntry,
    ZoneWorkersPeriodPayload,
    ZeroEngagementWorkersPayload,
    AnalyticsResponse,
    AnalyticsPayload,
    ScoringLegend,
    UserZoneDetailsResponse,
} from '../types';
import Utils from '~/utils';
import { roastBaseQuery } from './fetch-utils';
import { ROLES } from '~/hooks/role';

// Helper to get current ISO timestamp
const mockUsers: User[] = [
    { _id: 'user-worker-1', name: 'Worker 1', role: ROLES.worker },
    { _id: 'user-worker-2', name: 'Worker 2', role: ROLES.worker },
    { _id: 'user-coord-1', name: 'Coordinator', role: ROLES.zonalCoordinator, zoneIds: ['zone-1'] },
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

// The newer worker-list endpoints (active/inactive/zero-engagement workers) don't publish a
// response schema, and in practice don't consistently wrap the list as `{ data: [...] }` like
// the rest of the API - some nest it under a `workers` key instead. Try the plausible shapes and
// always fall back to `[]` so a mismatched envelope degrades to "no workers" instead of crashing
// `.map`/`.length` call sites.
const extractWorkerList = (res: unknown): ZoneWorkerEntry[] => {
    if (Array.isArray(res)) return res;
    const data = (res as { data?: unknown } | undefined)?.data;
    if (Array.isArray(data)) return data;
    const nested = (data as { workers?: unknown } | undefined)?.workers;
    if (Array.isArray(nested)) return nested;
    const resWorkers = (res as { workers?: unknown } | undefined)?.workers;
    if (Array.isArray(resWorkers)) return resWorkers;
    return [];
};

// Same undocumented-envelope problem as extractWorkerList above, for the newer
// /zone-users/worker-guests/:workerId endpoint - try the plausible shapes for both the guest
// list and its pagination metadata, and always return something safe to `.map`/`.length` over.
const extractGuestListResponse = (res: unknown): { pagination?: IPaginationParams; data: Guest[] } => {
    const asRecord = (value: unknown): Record<string, unknown> | undefined =>
        value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined;

    const root = asRecord(res);
    const dataField = root?.['data'];
    const dataRecord = asRecord(dataField);

    const rawGuests: unknown = Array.isArray(res)
        ? res
        : Array.isArray(dataField)
          ? dataField
          : Array.isArray(dataRecord?.['guests'])
            ? dataRecord?.['guests']
            : Array.isArray(root?.['guests'])
              ? root?.['guests']
              : [];

    const pagination = (root?.['pagination'] ?? dataRecord?.['pagination']) as IPaginationParams | undefined;

    return {
        pagination,
        data: (rawGuests as Guest[]).map(guest => ({ ...guest, id: guest._id })),
    };
};

const SERVICE_URL = 'roast-crm';

export const roastCrmApi = createApi({
    reducerPath: SERVICE_URL,

    // Shared with `roastEngagementApi` rather than declared inline. Two services now sit
    // on this base URL, and a second copy of `prepareHeaders` is a second place for the
    // session shape to go stale.
    baseQuery: roastBaseQuery,

    tagTypes: [
        'Guest',
        'GuestList',
        'Zone',
        'User',
        'Timeline',
        'CurrentUser',
        'Analytics',
        'Leaderboard',
        'Pipeline',
        'PipelineStages',
        'ZoneDashboard',
        'CampusDashboard',
        'GlobalDashboard',
        'DropoffAnalytics',
        'Recommendations',
    ],

    refetchOnFocus: true,
    refetchOnReconnect: true,
    refetchOnMountOrArgChange: true,
    keepUnusedDataFor: 60 * 60 * 48, // Cache or 48 hours

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

        getGuests: builder.query<{ pagination: IPaginationParams; data: Guest[] }, GetGuestPayload>({
            query: ({ page = 1, limit = 20, ...params }) => ({
                url: `/guests/filter`,
                method: REST_API_VERBS.GET,
                params: { ...params, page, limit },
            }),

            transformResponse: (res: IDefaultResponse<Guest[]>) => {
                return {
                    pagination: res.pagination,
                    data: res.data.map(guest => {
                        return { ...guest, id: guest._id };
                    }),
                };
            },

            providesTags: result =>
                result
                    ? [
                          ...result.data.map(({ _id }) => ({ type: 'Guest' as const, _id })),
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
                                const guest = draft.data.find(g => g._id === _id);
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

        deleteGuest: builder.mutation<void, string>({
            query: _id => ({
                url: `/guests/${_id}`,
                method: REST_API_VERBS.DELETE,
            }),
            invalidatesTags: (_result, _error, _id) => [
                { type: 'Guest', _id },
                { type: 'GuestList', _id: 'LIST' },
            ],
        }),

        reassignGuest: builder.mutation<Guest, { guestId: string; toWorkerId: string }>({
            query: ({ guestId, toWorkerId }) => ({
                url: `/guests/${guestId}/reassign`,
                method: REST_API_VERBS.PATCH,
                body: { toWorkerId },
            }),
            invalidatesTags: (_result, _error, { guestId }) => [
                { type: 'Guest', _id: guestId },
                { type: 'GuestList', _id: 'LIST' },
            ],
        }),

        // Zone Queries
        getZones: builder.query<Zone[], IDefaultQueryParams>({
            query: params => ({
                url: `/zones`,
                method: REST_API_VERBS.GET,
                params,
            }),
            transformResponse: (res: IDefaultResponse<{ data: Zone[] }>) =>
                Utils.sortStringAscending(res.data.data, 'name'),
            providesTags: result =>
                result
                    ? [...result.map(({ _id }) => ({ type: 'Zone' as const, _id }))]
                    : [{ type: 'Zone', _id: 'LIST' }],
        }),

        addZone: builder.mutation<Zone, CreateZonePayload>({
            query: body => ({
                url: '/zones',
                method: REST_API_VERBS.POST,
                body,
            }),
            invalidatesTags: ['Zone'],
        }),

        updateZone: builder.mutation<Zone, Zone>({
            query: ({ _id, ...body }) => ({
                url: `/zones/${_id}`,
                method: REST_API_VERBS.PUT,
                body,
            }),
            invalidatesTags: ['Zone'],
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

        // Users Query
        getZoneUsers: builder.query<Array<ZoneUsersResponse['users'][0]['profile']>, ZoneUsersPayload>({
            query: params => ({
                url: `/zone-users`,
                method: REST_API_VERBS.GET,
                params,
            }),

            providesTags: ['Zone'],

            transformResponse: (res: IDefaultResponse<ZoneUsersResponse>) =>
                Utils.sortStringAscending<ZoneUsersResponse['users'][0]['profile']>(
                    res.data.users?.map(worker => ({ ...worker.profile })),
                    'firstName'
                ),
        }),

        getActiveWorkers: builder.query<ZoneWorkerEntry[], ZoneWorkersPeriodPayload>({
            query: ({ zoneId, ...params }) => ({
                url: `/zone-users/zone-summary/${zoneId}/active-workers`,
                method: REST_API_VERBS.GET,
                params,
            }),

            transformResponse: extractWorkerList,

            providesTags: ['Zone'],
        }),

        getInactiveWorkers: builder.query<ZoneWorkerEntry[], ZoneWorkersPeriodPayload>({
            query: ({ zoneId, ...params }) => ({
                url: `/zone-users/zone-summary/${zoneId}/inactive-workers`,
                method: REST_API_VERBS.GET,
                params,
            }),

            transformResponse: extractWorkerList,

            providesTags: ['Zone'],
        }),

        getZeroEngagementWorkers: builder.query<ZoneWorkerEntry[], ZeroEngagementWorkersPayload>({
            query: params => ({
                url: `/zone-users/zero-engagement-workers`,
                method: REST_API_VERBS.GET,
                params,
            }),

            transformResponse: extractWorkerList,

            providesTags: ['Zone'],
        }),

        getUserZoneDetails: builder.query<UserZoneDetailsResponse, string>({
            query: userId => ({
                url: `/zone-users/user-zone-details/${userId}`,
                method: REST_API_VERBS.GET,
            }),

            // No published response schema - tolerate either a `{ data: {...} }` envelope or a bare object.
            transformResponse: (res: IDefaultResponse<UserZoneDetailsResponse> | UserZoneDetailsResponse) =>
                (res as IDefaultResponse<UserZoneDetailsResponse>)?.data ?? (res as UserZoneDetailsResponse) ?? {},

            providesTags: ['Zone'],
        }),

        // Leaderboard Queries
        getWorkerLeaderboard: builder.query<
            { entries: WorkerLeaderboardEntry[]; scoringLegend?: ScoringLegend },
            LeaderboardPayload
        >({
            query: params => ({
                url: `/leaderboards/global-top-performing-workers`,
                params,
                method: REST_API_VERBS.GET,
            }),

            transformResponse: (
                res: IDefaultResponse<{ leaderboard: WorkerLeaderboardEntry[]; scoringLegend?: ScoringLegend }>
            ) => ({
                entries: res.data?.leaderboard ?? [],
                scoringLegend: res.data?.scoringLegend,
            }),

            providesTags: ['Leaderboard'],
        }),

        getWorkerProfile: builder.query<WorkerProfileResponse, WorkerProfilePayload>({
            query: ({ zoneId, workerId, ...params }) => ({
                url: `/leaderboards/zone/${zoneId}/worker-profile/${workerId}`,
                method: REST_API_VERBS.GET,
                params,
            }),

            transformResponse: (res: IDefaultResponse<WorkerProfileResponse>) => res.data,

            providesTags: ['Leaderboard'],
        }),

        getWorkerGuestsByStage: builder.query<{ pagination?: IPaginationParams; data: Guest[] }, WorkerGuestsPayload>({
            query: ({ workerId, ...params }) => ({
                url: `/zone-users/worker-guests/${workerId}`,
                method: REST_API_VERBS.GET,
                params,
            }),

            transformResponse: extractGuestListResponse,

            providesTags: ['GuestList'],
        }),

        getZoneLeaderboard: builder.query<ZoneLeaderboardEntry[], LeaderboardPayload>({
            query: params => ({
                url: `/leaderboards/global-top-performing-zones`,
                method: REST_API_VERBS.GET,
                params,
            }),
            transformResponse: (res: IDefaultResponse<ZoneLeaderboardEntry[]>) => res.data,

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

        updatePipelineStage: builder.mutation<PipelineStage, Partial<PipelineStage> & { id: string }>({
            query: ({ id, ...patch }) => ({
                url: `/assimilation-stages/${id}`,
                method: REST_API_VERBS.PUT,
                body: patch,
            }),
            invalidatesTags: ['Pipeline'],
        }),

        createPipelineStage: builder.mutation<PipelineStage, Omit<PipelineStage, 'id'>>({
            query: stage => ({
                url: `/assimilation-stages`,
                method: REST_API_VERBS.POST,
                body: stage,
            }),
            invalidatesTags: ['Pipeline'],
        }),

        deletePipelineStage: builder.mutation<void, string>({
            query: id => ({
                url: `/assimilation-stages/${id}`,
                method: REST_API_VERBS.DELETE,
            }),
            invalidatesTags: ['Pipeline'],
        }),

        // Dashboard
        getZoneDashboard: builder.query<ZoneDashboardResponse, RoastDashboardPayload>({
            query: params => ({
                url: `/zone-users/dashboard`,
                method: REST_API_VERBS.GET,
                params,
            }),
            transformResponse: (res: IDefaultResponse<ZoneDashboardResponse>) => res.data,
            providesTags: ['ZoneDashboard'],
        }),

        getGlobalDashboard: builder.query<ZoneDashboardResponse[], RoastDashboardPayload>({
            query: params => ({
                url: `/zone-users/reports`,
                method: REST_API_VERBS.GET,
                params,
            }),
            transformResponse: (res: IDefaultResponse<ZoneDashboardResponse[]>) => res.data,
            providesTags: ['GlobalDashboard'],
        }),

        // Analytics Queries
        getGlobalAnalytics: builder.query<GlobalAnalytics, RoastDashboardPayload>({
            query: params => ({
                url: `/dashboard/global-reports`,
                method: REST_API_VERBS.GET,
                params,
            }),
            transformResponse(res: IDefaultResponse<GlobalAnalytics>) {
                return res.data;
                //  ?? GlobalAnalyticsPayload;
            },
            providesTags: ['Analytics'],
        }),

        getAnalytics: builder.query<AnalyticsResponse, AnalyticsPayload>({
            query: params => ({
                url: `/analytics`,
                method: REST_API_VERBS.GET,
                params,
            }),
            transformResponse: (res: IDefaultResponse<AnalyticsResponse>) => res.data,
            providesTags: ['Analytics'],
        }),

        getDropoffAnalytics: builder.query<DropOffAnalyticsResponse, RoastDashboardPayload>({
            query: params => ({
                url: `/leaderboards/drop-offs`,
                method: REST_API_VERBS.GET,
                params,
            }),
            transformResponse(res: IDefaultResponse<DropOffAnalyticsResponse>) {
                return res.data;
            },
            providesTags: ['DropoffAnalytics'],
        }),

        getRecommendations: builder.query<RecommendationsResponse, RoastDashboardPayload>({
            query: params => ({
                url: `/leaderboards/recommendations`,
                method: REST_API_VERBS.GET,
                params,
            }),
            transformResponse(res: IDefaultResponse<RecommendationsResponse>) {
                return res.data;
            },
            providesTags: ['Recommendations'],
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
    useDeleteGuestMutation,
    useReassignGuestMutation,
    useGetZonesQuery,
    useAddZoneMutation,
    useUpdateZoneMutation,
    useGetUsersQuery,
    useGetTimelineQuery,
    useAddTimelineMutation,
    useUpdateTimelineMutation,
    useGetZoneUsersQuery,
    useGetActiveWorkersQuery,
    useGetInactiveWorkersQuery,
    useGetZeroEngagementWorkersQuery,
    useGetUserZoneDetailsQuery,
    useGetGlobalDashboardQuery,
    useGetGlobalAnalyticsQuery,
    useGetAnalyticsQuery,
    useGetWorkerLeaderboardQuery,
    useGetWorkerProfileQuery,
    useGetWorkerGuestsByStageQuery,
    useGetZoneLeaderboardQuery,
    useGetAchievementsQuery,
    useGetAssimilationStagesQuery,
    useGetAssimilationSubStagesQuery,
    useUpdatePipelineStageMutation,
    useCreatePipelineStageMutation,
    useDeletePipelineStageMutation,
    useGetZoneDashboardQuery,
    useGetDropoffAnalyticsQuery,
    useGetRecommendationsQuery,
} = roastCrmApi;
