import { has, isNumber } from 'lodash';

/**
 *
 * @param text string
 * @param numberLimit number
 * @returns
 */

const hasNumberBelow = (text: string, numberLimit: number) => {
    // Loop through each character in the string

    const textArray = text.split(' ');
    for (const char of textArray) {
        // Check if the character is a digit (0-9)
        if (isNumber(+char)) {
            // Convert the character to a number
            const number = parseInt(char, 10);
            // Check if the number is less than 11
            if (number < numberLimit) {
                return true;
            }
        }
    }
    // If no number less than 11 is found, return false
    return false;
};

export default hasNumberBelow;
