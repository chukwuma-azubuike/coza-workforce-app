/**
 * Every route this build actually contains, as the set a push notification is allowed
 * to open.
 *
 * Why an allowlist at all, when the plan says to keep no `type → route` table on the
 * client: this is not a copy of the catalog and carries no notification knowledge. It
 * answers one question — *does this build have that screen?* — which only the build can
 * answer. New notification types ship server-side before the app that handles them, so
 * an unrecognised `url` is the expected steady state, not an error; §7.2 rule 5 says it
 * opens the notification centre rather than dumping the user on `/+not-found`.
 *
 * ⚠️ Generated. Regenerate after adding or renaming any route:
 *
 *   grep -o '`[^`]*`' .expo/types/router.d.ts | tr -d '`' \
 *     | grep '^/' | grep -v '\${' | sort -u
 *
 * Staleness fails soft — a route missing here sends the user to the centre, where the
 * row is still readable — but it is a real papercut, so keep it in step with the union.
 *
 * Auth routes are deliberately excluded: a target is only ever flushed for a signed-in
 * user, so `/login` and friends are never a legitimate destination.
 */
export const KNOWN_NOTIFICATION_ROUTES: ReadonlySet<string> = new Set([
    '/',
    '/admin/groups',
    '/admin/groups/create-group',
    '/admin/groups/group-detail',
    '/assign-group-head',
    '/attendance',
    '/congress',
    '/congress/congress-attendance',
    '/congress/congress-details',
    '/congress/congress-feedback',
    '/congress/congress-report',
    '/congress/congress-resources',
    '/congress/create-congress',
    '/congress/create-instant-message',
    '/export-data',
    '/gh-approvals',
    '/gh-approvals/report-detail',
    '/gh-reports-history',
    '/gh-tab-approvals',
    '/gh-workforce',
    '/group-head-campus',
    '/group-head-campus/group-head-campuses',
    '/group-head-campus/group-head-department-activities',
    '/group-head-campus/group-head-departments',
    '/group-head-service-report',
    '/group-head-service-report/group-head-service-summary',
    '/group-head-service-report/submit-report-summary',
    '/gsp/approvals',
    '/gsp/campus',
    '/gsp/campus-review',
    '/gsp/completeness',
    '/gsp/metric',
    '/gsp/service-report',
    '/gsp/services',
    '/gsp/worker',
    '/gsp/workforce-departments',
    '/gsp/workforce-workers',
    '/manual-clock-in',
    '/more',
    '/notifications',
    '/permissions',
    '/permissions/permission-details',
    '/permissions/request-permission',
    '/profile',
    '/profile/edit-profile',
    '/profile/status',
    '/reports',
    '/reports/attendance-report',
    '/reports/campus-report',
    '/reports/childcare-report',
    '/reports/guest-report',
    '/reports/incident-report',
    '/reports/internship-report',
    '/reports/protocol-report',
    '/reports/pru-report',
    '/reports/security-report',
    '/reports/service-report',
    '/reports/transfer-report',
    '/reports/welfare-report',
    '/reports/witty-report',
    '/roast-crm',
    '/roast-crm/global-dashboard',
    '/roast-crm/guests/profile',
    '/roast-crm/leaderboards',
    '/roast-crm/my-guests',
    '/roast-crm/notifications',
    '/roast-crm/settings',
    '/roast-crm/worker-profile',
    '/roast-crm/zone-dashboard',
    '/roast-crm/zone-guests',
    '/roast-crm/zone-workers',
    '/service-management',
    '/service-management/create-congress-session',
    '/service-management/create-service',
    '/service-management/update-service',
    '/tickets',
    '/tickets/issue-ticket',
    '/tickets/ticket-details',
    '/workforce-summary',
    '/workforce-summary/campus-workforce',
    '/workforce-summary/create-campus',
    '/workforce-summary/create-department',
    '/workforce-summary/create-user',
    '/workforce-summary/global-workforce',
    '/workforce-summary/user-profile',
    '/workforce-summary/user-report',
    '/workforce-summary/user-report-details',
    '/workforce-summary/worker-status-report',
    '/workforce-summary/workforce-management',
]);

/**
 * Where an unroutable notification lands. The inbox row always exists — push is only a
 * hint that it changed — so the centre can render a type this build has never heard of.
 */
export const NOTIFICATION_FALLBACK_ROUTE = '/notifications' as const;

/**
 * ⚠️ **`/` is ambiguous in this app and must never be navigated to directly.**
 *
 * Three files claim it — `app/index.tsx` (the Welcome screen), `app/(auth)/index.tsx`
 * and `app/(tabs)/index.tsx` — so `router.push('/')` is a coin toss that can drop a
 * signed-in user onto the sign-in landing page. `components/Routing.tsx` has always
 * sidestepped this by naming the group explicitly, and so does everything here: a
 * target of `/` is rewritten to `/(tabs)` before it reaches the router.
 *
 * This matters directly to the catalog — clock-in and clock-out notifications point at
 * the home tab, because that is where the CTA lives.
 */
export const NOTIFICATION_HOME_ROUTE = '/(tabs)' as const;

/**
 * Strips Expo Router group segments — `/(stack)/tickets/x` → `/tickets/x`.
 *
 * Groups are organisational and never appear in a URL, so the same screen has two
 * legitimate spellings. The allowlist stores the plain one; this is what lets the
 * group-qualified spelling match it without duplicating all ninety entries — and it is
 * also what lets a target be compared against `usePathname()`, which always reports the
 * stripped form.
 */
export const stripRouteGroups = (pathname: string): string => {
    const stripped = (pathname.split(/[?#]/)[0] ?? '')
        .split('/')
        .filter(segment => !(segment.startsWith('(') && segment.endsWith(')')))
        .join('/');

    return stripped === '' ? '/' : stripped;
};

/**
 * True when this build can actually navigate to `pathname`.
 *
 * The query string is dropped before comparison: the generated union admits a
 * `${string}` suffix on every route and the backend has no reason to send one, but a
 * stray `?` must not cost the user their destination.
 */
export const isKnownNotificationRoute = (pathname: string): boolean =>
    KNOWN_NOTIFICATION_ROUTES.has(stripRouteGroups(pathname));

/**
 * The path to hand the router: the caller's own spelling, except that a bare `/` is
 * disambiguated to the home tab. The group-qualified spelling is preserved rather than
 * normalised away — it is the *only* unambiguous way to name the index of a group.
 */
export const toNavigableRoute = (pathname: string): string =>
    stripRouteGroups(pathname) === '/' ? NOTIFICATION_HOME_ROUTE : pathname;
