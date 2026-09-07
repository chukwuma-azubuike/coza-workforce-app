/**
 * Pulls a human-readable message out of an RTK Query error.
 *
 * The API returns `data.message` as either a string or an array of strings
 * (validation errors); transport-level failures surface as `error` instead.
 *
 * @param error unknown error from an RTK Query response
 * @param fallback message to show when nothing usable is found
 * @returns a string safe to render to the user
 */
const getErrorMessage = (error: unknown, fallback: string): string => {
    const data = (error as any)?.data;

    if (typeof data?.message === 'string') return data.message;
    if (Array.isArray(data?.message)) return data.message.filter(Boolean).join('\n');
    if (typeof (error as any)?.error === 'string') return (error as any).error;

    return fallback;
};

export default getErrorMessage;
