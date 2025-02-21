/**
 *
 * @param obj1 reference object
 * @param obj2 compared object
 * @returns boolean
 */

const compareObjectValueByKey = (obj1: any, obj2: any) => {
    // Get the keys of obj1
    const obj1Keys = Object.keys(obj1);

    // Iterate over the keys
    for (let key of obj1Keys) {
        // Check if the corresponding key exists in obj2 and if their values are the same
        if (obj2.hasOwnProperty(key) && obj1[key] === obj2[key]) {
            continue;
        } else {
            return false;
        }
    }

    // If all corresponding keys have the same values, return true
    return true;
};

export default compareObjectValueByKey;
