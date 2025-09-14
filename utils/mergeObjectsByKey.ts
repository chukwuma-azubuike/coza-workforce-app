/**
 *
 * @param array1 - array with object having a common
 * @param array2 - array with object having a common
 * @returns merged array of objects with common key
 */

export const mergeObjectsByKey = (array1: any[], array2: any[]) => {
    return array1.map((item, i) => {
        if (typeof item === 'object') {
            return Object.assign({}, item, array2[i]);
        }
    });
};
