import { columnDataType, HeaderParams } from '~/components/Kanban/types';
import { Guest } from '~/store/types';

export const assimilationStages: columnDataType<Guest, HeaderParams>[] = [
    { _id: '', header: { title: 'invited', subtitle: '', count: 0, position: 1 }, items: [] },
    { _id: '', header: { title: 'attended 1st', subtitle: '', count: 0, position: 2 }, items: [] },
    { _id: '', header: { title: 'attended 2nd', subtitle: '', count: 0, position: 3 }, items: [] },
    { _id: '', header: { title: 'attended 3rd', subtitle: '', count: 0, position: 4 }, items: [] },
    { _id: '', header: { title: 'attended 4th', subtitle: '', count: 0, position: 5 }, items: [] },
    { _id: '', header: { title: 'attended 5th', subtitle: '', count: 0, position: 6 }, items: [] },
    { _id: '', header: { title: 'attended 6th', subtitle: '', count: 0, position: 7 }, items: [] },
    { _id: '', header: { title: 'MGI', subtitle: '', count: 0, position: 8 }, items: [] },
    { _id: '', header: { title: 'joined workforce', subtitle: '', count: 0, position: 9 }, items: [] },
];
