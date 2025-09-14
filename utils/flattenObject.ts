/**
 *
 * @param arrayOfObjects
 * @returns flattened object
 */

const flattenedObject = (arrayOfObjects: { [key: string]: number }[]) => {
    const flattened: { [key: string]: any } = {};

    for (const item of arrayOfObjects) {
        const key = Object.keys(item)[0];
        flattened[key] = item[key];
    }

    return flattened;
};

export default flattenedObject;
