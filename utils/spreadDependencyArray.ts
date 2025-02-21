/**
 *
 * @param array array to be watched for change
 * @param key property of object in array
 * @returns Make sure to spread the result in your dependency array. Eg ...spreadDependencyArray(array, 'id')
 */

const spreadDependencyArray = (array: Array<any> = [], key?: string) => {
    if (Array.isArray(array)) {
        let dependencyArray = [];
        dependencyArray = [array?.length];

        if (typeof array[0] === 'object') {
            if (!!key && array[0].hasOwnProperty(key)) {
                dependencyArray.push(array[0][key]);
            }
        }

        return dependencyArray;
    }

    return array;
};

export default spreadDependencyArray;
