class Utils {
    static splitString(char: string, separator: string = ' ') {
        return char.split(separator).join(' ');
    }

    static capitalizeFirstChar(char: string, separator: string = ' ') {
        let splitChar = this.splitString(char, separator);
        let firstChar = splitChar.charAt(0).toUpperCase();
        let restChar = splitChar.slice(1, splitChar.length);

        return `${firstChar}${restChar}`;
    }
}

export default Utils;
