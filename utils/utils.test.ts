import compareObjectValueByKey from './compareObjectValuesByKey';

describe('Compare Object Value By Key', () => {
    // Test case 1: Objects with same key-value pairs
    test('should return true for objects with same key-value pairs', () => {
        const obj1 = { a: 1, b: 2, c: 3 };
        const obj2 = { a: 1, b: 2, c: 3 };

        expect(compareObjectValueByKey(obj1, obj2)).toBe(true);
    });

    // Test case 2: Objects with different key-value pairs
    test('should return false for objects with different key-value pairs', () => {
        const obj3 = { a: 1, b: 2, c: 3 };
        const obj4 = { a: 1, b: 4, c: 3 };

        expect(compareObjectValueByKey(obj3, obj4)).toBe(false);
    });

    // Test case 3: Objects with extra keys
    test('should return true for objects with extra keys', () => {
        const obj5 = { a: 1, b: 2, c: 3 };
        const obj6 = { a: 1, b: 2, c: 3, d: 4 };

        expect(compareObjectValueByKey(obj5, obj6)).toBe(true);
    });

    // Test case 4: Empty objects
    test('should return true for empty objects', () => {
        const obj7 = {};
        const obj8 = {};

        expect(compareObjectValueByKey(obj7, obj8)).toBe(true);
    });

    // Test case 5: One object is empty, the other has key-value pairs
    test('should return false when one object is empty and the other has key-value pairs', () => {
        const obj9 = { a: 1, b: 2, c: 3 };
        const obj10 = {};

        expect(compareObjectValueByKey(obj9, obj10)).toBe(false);
    });

    // Test case 6: Objects with different values for the same keys
    test('should return false for objects with different values for the same keys', () => {
        const obj11 = { a: 1, b: 2, c: 3 };
        const obj12 = { a: 2, b: 2, c: 3 };

        expect(compareObjectValueByKey(obj11, obj12)).toBe(false);
    });
});
