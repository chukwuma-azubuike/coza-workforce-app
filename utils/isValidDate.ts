/**
 *
 * @param value string | number
 * @returns
 */

const isValidDate = (value: string | number): boolean => {
    // Convert number to string if necessary
    if (value === null || typeof value === 'undefined') {
        return false;
    }

    const dateString = typeof value === 'string' ? value : value.toString();

    // Create a Date object from the string
    const date = new Date(dateString);

    // Check if the parsed date is valid (not "Invalid Date")
    // Additionally you can use date.getTime() !== NaN for more robustness
    return !isNaN(date.getTime());
};

export default isValidDate;
