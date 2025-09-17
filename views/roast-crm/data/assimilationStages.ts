import { columnDataType, HeaderParams } from '~/components/Kanban/types';
import { Guest } from '~/store/types';

export const assimilationStages: columnDataType<Guest, HeaderParams>[] = [
    {
        header: { title: 'invited', subtitle: '', count: 0, position: 1 },
        items: [],
    },
    {
        header: { title: 'attended 1st', subtitle: '', count: 0, position: 2 },
        items: [],
    },
    {
        header: { title: 'attended 2nd', subtitle: '', count: 0, position: 3 },
        items: [],
    },
    {
        header: { title: 'attended 3rd', subtitle: '', count: 0, position: 4 },
        items: [],
    },
    {
        header: { title: 'attended 4th', subtitle: '', count: 0, position: 5 },
        items: [],
    },
    {
        header: { title: 'attended 5th', subtitle: '', count: 0, position: 6 },
        items: [],
    },
    {
        header: { title: 'attended 6th', subtitle: '', count: 0, position: 7 },
        items: [],
    },
    {
        header: { title: 'MGI', subtitle: '', count: 0, position: 8 },
        items: [],
    },
    {
        header: { title: 'joined workforce', subtitle: '', count: 0, position: 9 },
        items: [],
    },
];
