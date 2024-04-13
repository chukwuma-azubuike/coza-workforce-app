/**
 *
 * @param item - Object or string
 * @param path - String must include "." as the separator indicating recursive path navigation of object
 * @returns
 */

const getDeepField = (item: string | { [key: string]: any }, path: Array<string> | string = []): string | null => {
    if (!item) return '';
    // Base case: If item is a string (assumed label) or null, return it
    if (typeof path === 'string' && !path.includes('.')) return path;
    if (typeof item === 'string') return item;

    // Check if path is empty (initial call) or a string path
    if (typeof path === 'string') {
        path = path.split('.'); // Convert string path to an array
    }

    if (path.length === 0) {
        console.warn('No path provided for getDeepField0. Using default path "label".');
        path = ['label']; // Default path if none provided
    }

    // Recursive navigation based on the current path segment
    const currentField = path[0];
    const nextPath = path.slice(1); // Remaining path segments

    // Check if the current field exists in the object
    if (!item.hasOwnProperty(currentField)) {
        console.warn(`Field "${currentField}" not found in object for path "${path.join('.')}".`);
        return ''; // Handle missing fields gracefully
    }

    return getDeepField(item[currentField], nextPath);
};

export default getDeepField;
