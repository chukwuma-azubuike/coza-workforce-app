import { mergeObjectsByKey } from '@utils/mergeObjectsByKey';

describe('mergeObjectsByKey', () => {
    it('should merge objects in two arrays by key', () => {
        const array1 = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
        ];
        const array2 = [
            { id: 1, age: 30 },
            { id: 2, age: 25 },
        ];
        const result = mergeObjectsByKey(array1, array2);

        expect(result).toEqual([
            { id: 1, name: 'Alice', age: 30 },
            { id: 2, name: 'Bob', age: 25 },
        ]);
    });

    it('should handle non-object elements gracefully', () => {
        const array1 = [1, 'string', true];
        const array2 = [{ id: 1 }, null, undefined];
        const result = mergeObjectsByKey(array1, array2);

        expect(result).toEqual([1, null, undefined]);
    });

    it('should return an empty array when either input is empty', () => {
        const array1: any[] = [];
        const array2 = [{ id: 1 }, { id: 2 }];
        const result = mergeObjectsByKey(array1, array2);

        expect(result).toEqual([]);
    });

    it('should return an empty array when both inputs are empty', () => {
        const array1: any[] = [];
        const array2: any[] = [];
        const result = mergeObjectsByKey(array1, array2);

        expect(result).toEqual([]);
    });

    it('should return a new array and not modify the input arrays', () => {
        const array1 = [{ id: 1 }];
        const array2 = [{ id: 1, age: 30 }];
        const result = mergeObjectsByKey(array1, array2);

        expect(result).toEqual([{ id: 1, age: 30 }]);
        expect(array1).toEqual([{ id: 1 }]);
        expect(array2).toEqual([{ id: 1, age: 30 }]);
    });
});
