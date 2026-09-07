/**
 * Format a “local” phone (with or without spaces) to E.164.
 *
 * Idempotent: a value that is already in E.164 (starts with “+”) is returned
 * untouched apart from whitespace stripping, so running this twice — e.g. when a
 * user navigates back and forward through the register stepper — never corrupts
 * the number.
 *
 * @param localNumber e.g. "070 3234 1364", "07032341364" or "+2347032341364"
 * @param countryDialCode e.g. "+234"/"234" for Nigeria, "+1"/"1" for USA, etc.
 */
const formatToE164 = (localNumber?: string | null, countryDialCode: string = '+234'): string => {
    if (!localNumber) return '';

    const trimmed = `${localNumber}`.trim();

    // Already E.164 — only normalise whitespace.
    if (trimmed.startsWith('+')) {
        return trimmed.replace(/\s+/g, '');
    }

    // 1) strip out everything but digits
    const digits = trimmed.replace(/\D+/g, '');
    if (!digits) return '';

    // 2) drop leading zero if present
    const national = digits.startsWith('0') ? digits.slice(1) : digits;

    // 3) normalise the dial code to a single leading “+”
    const code = `+${`${countryDialCode}`.replace(/\D+/g, '')}`;

    return `${code}${national}`;
};

export default formatToE164;
