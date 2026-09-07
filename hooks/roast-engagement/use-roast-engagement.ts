import useEngagementPing from './use-engagement-ping';
import useOutboxFlush from './use-outbox-flush';
import useReminderMirror from './use-reminder-mirror';
import useReminderScheduler from './use-reminder-scheduler';
import useRoastNotificationActions from './use-roast-notification-actions';
import useStreak from './use-streak';
import useWidgetSnapshot from './use-widget-snapshot';

/**
 * Mounts the whole engagement runtime. Called once, from `app/roast-crm/_layout.tsx`.
 *
 * These seven have to run above every Roast screen and below the session, and they have to
 * run **exactly once**: two mounted schedulers would reconcile against the same ledger
 * concurrently, and two mounted action handlers would each complete the same reminder. A
 * single composed hook with a single call site is the cheapest way to keep that true as
 * screens are added.
 *
 * `useReminderMirror` is the reconcile half only. Screens that need to *write* a mirror
 * use `useMirrorTarget` from the same file, which has no effects and can be mounted
 * anywhere.
 *
 * The order matters in one place only — the scheduler reads the reminder cache that the
 * outbox flush may be about to change — and it resolves itself: the flush invalidates,
 * RTK Query re-fetches, and the scheduler reconciles off the new list.
 */
const useRoastEngagement = () => {
    useOutboxFlush();
    useReminderScheduler();
    useReminderMirror();
    useRoastNotificationActions();
    useEngagementPing();
    useStreak();
    useWidgetSnapshot();
};

export default useRoastEngagement;
