import dayjs from 'dayjs';

export interface Section<T> {
    title: string;
    data: T[];
}

function transformToSections<T>(
    array: T[] = [],
    key: keyof T = 'createdAt' as keyof T,
    format: string = 'MMMM DD, YYYY'
): Section<T>[] {
    if (!array || array.length === 0) return [];

    const groups = array.reduce((acc, item) => {
        // Get the raw timestamp. You can check for its existence if necessary.
        let timestamp = (item as any)[key];

        // Format it if grouping by "createdAt"
        let groupKey = dayjs(timestamp).format(format);

        if (!acc[groupKey]) {
            acc[groupKey] = [];
        }
        acc[groupKey].push(item);
        return acc;
    }, {} as Record<string, T[]>);

    // Convert the groups object into an array of sections.
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
}

export default transformToSections;
