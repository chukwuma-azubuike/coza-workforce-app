# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
yarn dev:start          # Start Expo dev client
yarn dev:android        # Start with Android target
yarn android            # Reinstall Android dev client
yarn ios                # Reinstall iOS dev client
yarn clear:cache        # Start with Metro cache cleared
yarn clean              # Remove .expo and node_modules
yarn prebuild           # Regenerate native android/ios directories
```

### Formatting / Health Checks
```bash
yarn format             # Prettier (4-space tabs, 120 print width, single quotes)
yarn doctor             # Expo dependency health check
yarn check:fix          # Fix Expo dependency mismatches
```

There is no test runner or lint script configured in `package.json`. ESLint is configured (`.eslintrc.js`) but only runs via editor integration.

### Builds & Deployment (EAS)
```bash
yarn eas:build-android-dev    # Internal dev Android build
yarn eas:build-ios-dev        # Internal dev iOS build
yarn eas:build-preview        # Staging build
yarn eas:build-prod           # Production build (auto-submits)
yarn submit:preview           # Submit preview build to stores
yarn submit:prod              # Submit production build to stores
yarn update:preview           # OTA update — preview channel
yarn update:prod              # OTA update — production channel
yarn workflow:dev             # GitHub Actions: dev workflow
yarn workflow:preview         # GitHub Actions: staging deploy
yarn workflow:production      # GitHub Actions: production deploy
```

The `APP_VARIANT` env var (`development` | `preview` | `production`) drives bundle ID suffixes, app name, and channel selection in `app.config.js`.

## Architecture

### Routing — Expo Router (file-based)
All routes live in `app/`. Group folders use parentheses without affecting URL paths:
- `app/(auth)/` — login, register, forgot/reset password, verify-email
- `app/(tabs)/` — main bottom-tab interface
- `app/(stack)/` — stack-based detail screens
- `app/roast-crm/` — separate Roast CRM module

The root layout `app/_layout.tsx` wraps the app with Redux `Provider`, `PersistGate`, theme provider, and Sentry. Use `router.push()` / `router.replace()` and `useLocalSearchParams<T>()` from `expo-router`.

### State — Redux Toolkit + RTK Query
Store config lives in `store/index.ts`. Persisted slices (via redux-persist + AsyncStorage):
- `userStateSlice` — current user, session, auth
- `appStateSlice` — dark mode, app variant
- `notificationsSlice` — push notification state
- `roastCRMState` — CRM-specific state

Always use `useAppSelector` / `useAppDispatch` from `store/hooks.ts` (typed wrappers). Do not import raw `useSelector`/`useDispatch`.

### API Layer
Two base URLs (env-driven):
- **Main API** (`EXPO_PUBLIC_API_BASE_URL`) — attendance, permissions, tickets, reports, account, campus, department, etc.
- **Roast CRM API** (`EXPO_PUBLIC_ROAST_API_BASE_URL`) — CRM guests, zones, leaderboards, analytics

One RTK Query service per resource in `store/services/`. All services use the shared `fetchUtils.baseQuery`, which injects the Bearer token from AsyncStorage automatically. Standard pattern:

```ts
export const fooServiceSlice = createApi({
    reducerPath: 'foo',
    baseQuery: fetchUtils.baseQuery,
    tagTypes: ['foo'],
    refetchOnFocus: true,
    refetchOnReconnect: true,
    endpoints: endpoint => ({
        getItems: endpoint.query<IResponse, IPayload>({
            query: params => ({ url: '/foo', params }),
            providesTags: ['foo'],
        }),
    }),
});
```

Each new service must be registered in the root reducer and middleware list in `store/index.ts`.

### Component Hierarchy
- `components/ui/` — base headless primitives (rn-primitives) — Input, Button, Dialog, Tabs, etc.
- `components/atoms/` — single-responsibility display pieces (Logo, Avatar, StatusBar)
- `components/composite/` — composed components (modals, ErrorBoundary, Tabs)
- `components/layout/` — screen-level layout wrappers
- `views/app/`, `views/auth/`, `views/roast-crm/` — feature screens (most UI logic lives here, not in `app/`)

The `app/` route files generally re-export from `views/`. Put feature logic in `views/`, keep `app/` files thin.

### Role-Based Access Control
`hooks/useRole.ts` exposes role/department flags (`isWorker`, `isQC`, `isCampusPastor`, `isHOD`, `isCGWCApproved`, etc.). Route visibility is declared in `config/navigation.ts` via the `users` field on each `IAppRoute` entry — both ROLES and DEPARTMENTS arrays. Use `useRole()` for all access checks; do not hardcode role string comparisons.

### Styling
NativeWind (Tailwind CSS for React Native) is the styling system. Use `className` with Tailwind utilities. Theme colors and the `THEME_CONFIG` palette live in `tailwind.config.js`. Dark mode is driven by `useColorScheme()`. Avoid inline `style` props unless NativeWind doesn't cover the case (the ESLint config bans most inline styles).

### Forms — Formik + Yup
Validation schemas live in `utils/schemas/`. Standard pattern:

```tsx
<Formik<IPayload>
    validateOnChange
    onSubmit={onSubmit}
    initialValues={...}
    validationSchema={Schema}
>
    {({ errors, touched, handleChange, handleSubmit }) => (...)}
</Formik>
```

### Cross-cutting Utilities
- `utils/index.ts` exports a `Utils` class with session storage (`storeUserSession`, `clearStorage`, `retrieveUserSession`), formatting helpers, and sorting utilities.
- `useAuth()` hook handles logout (clears AsyncStorage + dispatches `clearSession`).
- `useUpload` hook handles AWS S3 uploads with progress.
- `useInfiniteData` / `useFetchMoreData` for paginated lists (used with `@shopify/flash-list`).
- File downloads via `utils/downloadFile`; reports use `xlsx` for Excel generation.
- `useExpoUpdate` checks for OTA updates on launch.

### TypeScript
Strict mode is enabled (`noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, etc.). Path aliases `~/*` and `@*` are configured in `tsconfig.json`. Interface types use the `I` prefix (`IUser`, `ILoginResponse`); enums for constants (`ROLES`, `REST_API_VERBS`).

## Environment Variables

Required in `.env.local`:
| Variable | Purpose |
|---|---|
| `APP_VARIANT` | `development` \| `preview` \| `production` |
| `EXPO_PUBLIC_API_BASE_URL` | Main workforce API base URL |
| `EXPO_PUBLIC_ROAST_API_BASE_URL` | Roast CRM API base URL |
| `EXPO_PUBLIC_API_KEY` | API key |
| `EXPO_PUBLIC_SUPPORT_EMAIL` | Support contact email |
| `EXPO_PUBLIC_AWS_S3_BUCKET_NAME` | S3 bucket for uploads |
| `EXPO_PUBLIC_AWS_REGION` | AWS region |
| `EXPO_PUBLIC_AWS_ACCESS_KEY_ID` | AWS access key |
| `EXPO_PUBLIC_AWS_SECRET_ACCESS_KEY` | AWS secret key |

## Notes

- Bundle IDs differ by variant: `com.cozaworkforceapp` (prod) / `.staging` (dev/preview) on iOS; `com.cozaglobalworkforceapp` / `.staging` on Android.
- Sentry (`@sentry/react`) is wired in for production error tracking; the root `ErrorBoundary` provides fallback UI.
- Redux Logger middleware is active in development only.
- Node 20.x is required (declared in `package.json` engines).
