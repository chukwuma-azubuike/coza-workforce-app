/**
 * Format a “local” phone (with or without spaces) to E.164.
 *
 * @param localNumber e.g. "070 3234 1364" or "07032341364"
 * @param countryDialCode e.g. "234" for Nigeria, "1" for USA, etc.
 */
const formatToE164 = (localNumber: string, countryDialCode: string): string => {
    // 1) strip out everything but digits
    const digits = localNumber.replace(/\D+/g, '');
    // 2) drop leading zero if present
    const national = digits.startsWith('0') ? digits.slice(1) : digits;
    // 3) prefix +<countryDialCode>
    return `${countryDialCode}${national}`;
};

export default formatToE164;
