/**
 * Every user-visible Roast engagement string, in one file.
 *
 * A notification body written inline at the call site is a string nobody reviews and
 * nobody can find again — the Workforce catalog learned this the hard way and answered it
 * with `INFRA-13`. This is the Roast half of the same discipline: copy lives here,
 * screens and schedulers import it, and a wording change is one diff in one place.
 *
 * **Voice.** Warm, direct, second person, present tense. It names the guest. It never
 * guilts, never says "should", and never counts items at the worker when it could name
 * the work — "3 guests need you today", not "you have 3 pending items".
 *
 * ⚠️ **Pronouns.** `Guest.gender` is optional and is frequently absent on a guest captured
 * in a hurry. Absent means **they/them** — never inferred from a first name. `pronounFor`
 * below is the only place that decision is made.
 */

/** Third-person pronouns for a guest, in the three cases the copy actually uses. */
export interface IPronouns {
    /** they / she / he */
    subject: string;
    /** them / her / him */
    object: string;
    /** their / her / his */
    possessive: string;
}

const THEY: IPronouns = { subject: 'they', object: 'them', possessive: 'their' };
const SHE: IPronouns = { subject: 'she', object: 'her', possessive: 'her' };
const HE: IPronouns = { subject: 'he', object: 'him', possessive: 'his' };

/**
 * Pronouns for a guest.
 *
 * Anything other than a recorded `'male'` or `'female'` — absent, empty, a value this
 * build has not seen — resolves to they/them. That is the safe direction: a guest
 * addressed as "they" reads as neutral, while a guest addressed with the wrong gendered
 * pronoun in a push notification is a mistake the worker sees on their lock screen.
 */
export const pronounFor = (gender?: string | null): IPronouns =>
    gender === 'female' ? SHE : gender === 'male' ? HE : THEY;

/** Sentence-cases a pronoun for use at the start of a line. */
export const capitalise = (value: string): string => value.charAt(0).toUpperCase() + value.slice(1);

/** A notification's two halves, kept together so neither can be reworded alone. */
export interface ICopy {
    title: string;
    body: string;
}

/**
 * Joins names the way a person would: "A", "A and B", "A, B and C".
 *
 * Truncates past `max` with a count rather than an ellipsis — "Ada, Bola and 4 others"
 * tells the worker how much is waiting; "Ada, Bola…" tells them nothing.
 */
export const joinNames = (names: string[], max = 3): string => {
    const shown = names.slice(0, max);
    const remaining = names.length - shown.length;

    if (remaining > 0) {
        return `${shown.join(', ')} and ${remaining} other${remaining === 1 ? '' : 's'}`;
    }

    if (shown.length <= 1) {
        return shown[0] ?? '';
    }

    return `${shown.slice(0, -1).join(', ')} and ${shown[shown.length - 1]}`;
};

/** `1 day` / `3 days` — the unit agreeing with the number, everywhere. */
export const pluralise = (count: number, singular: string, plural = `${singular}s`): string =>
    `${count} ${count === 1 ? singular : plural}`;

export const ROAST_COPY = {
    /**
     * The Morning Roast, in the four shapes it takes.
     *
     * Composed server-side (the digest job owns the send), and here too — the in-app row
     * and the push body must not drift, and the only way to guarantee that is one source
     * for both. See `02_BACKEND_SPEC.md §4`.
     */
    digest: {
        singleCall: (name: string, gender?: string | null): ICopy => ({
            title: `${name} is due for a call today`,
            body: `${capitalise(pronounFor(gender).subject)}${pronounFor(gender).subject === 'they' ? "'ve" : "'s"} been waiting to hear from you.`,
        }),

        singleFollowUp: (name: string, days: number): ICopy => ({
            title: `${name} needs a follow-up`,
            body: `${pluralise(days, 'day')} since you last spoke.`,
        }),

        few: (count: number, names: string[]): ICopy => ({
            title: `${count} guests need you today`,
            body: `${joinNames(names)} — tap to see what's due.`,
        }),

        many: (count: number, overdue: number, firstName: string): ICopy => ({
            title: `${count} guests need you today`,
            body: `${overdue} overdue. Start with ${firstName}.`,
        }),

        evening: (name: string): ICopy => ({
            title: `How did the call with ${name} go?`,
            body: "Add a note while it's fresh.",
        }),
    },

    invite: (count: number): ICopy => ({
        title: 'Invite your guests to Sunday service',
        body: `${count} of yours haven't been asked yet.`,
    }),

    /**
     * A reminder the worker wrote themselves.
     *
     * The title is the guest's name and the body is their own note, verbatim — this is
     * the one notification in the set with nothing to say that the worker did not
     * already say. Adding a system voice on top of it would only get in the way.
     */
    reminder: (guestName: string, note?: string): ICopy => ({
        title: guestName,
        body: note?.trim() || 'Time to follow up.',
    }),

    streak: {
        /**
         * The afternoon pass, at 16:00.
         *
         * Aimed at the worker who has not engaged all day. Encouraging rather than urgent
         * — there are still hours left, and there is a second pass behind this one.
         */
        atRisk: (days: number): ICopy => ({
            title: `🔥 ${pluralise(days, 'Day')} on! Keep the fire going`,
            body: "You haven't roasted your game today. Check in now to keep your streak.",
        }),

        /**
         * The evening pass, at 19:00.
         *
         * Deliberately **not** the same words as `atRisk`. The two passes catch different
         * people — this one catches the worker who meant to and did not — and the same
         * notification arriving twice, three hours apart, word for word, reads as a glitch
         * rather than a last call.
         *
         * It is also the last thing anybody hears before the streak goes, so it says so.
         */
        atRiskFinal: (days: number): ICopy => ({
            title: `🔥 Last call — ${pluralise(days, 'day')} on the line`,
            body: 'Your streak ends at midnight. One check-in is all it takes.',
        }),

        milestone: (days: number): ICopy => ({
            title: `${days}-day streak!`,
            body:
                days === 7
                    ? 'You showed up all week.'
                    : days === 30
                      ? 'A full month of showing up.'
                      : 'You keep showing up.',
        }),

        saved: (freezesLeft: number): ICopy => ({
            title: 'Your streak was saved',
            body: `A freeze covered yesterday. ${freezesLeft} left.`,
        }),
    },

    widget: {
        empty: 'All roasted for today 🔥',
        footerHealthy: (days: number) => `${pluralise(days, 'day')} on — keep the fire going.`,
        footerAtRisk: 'Roast your game today 🔥',
        signedOut: 'Sign in to see your guests',
    },

    today: {
        emptyTitle: 'All roasted for today',
        emptyBody: "Nothing is due. You're ahead of it.",
        /** Shown above a feed served from cache, so a stale list never looks live. */
        stale: (relative: string) => `Last updated ${relative}`,
        offline: "You're offline — showing what we last had.",
    },

    reminders: {
        emptyUpcoming: 'No reminders set',
        emptyUpcomingBody: 'Set one from a guest and it will show up here.',
        emptyCompleted: 'Nothing completed yet',
        pastTime: "That's already passed — pick a later time.",
        created: 'Reminder set',
        completed: 'Marked done',
        snoozed: 'Snoozed',
        deleted: 'Reminder deleted',
        /** Shown when the OS will not let us schedule anything. */
        permissionDenied: 'Turn on notifications to be reminded at the time you set.',
    },
} as const;

export default ROAST_COPY;
