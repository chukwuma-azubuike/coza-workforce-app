import { AssimilationStage, Guest } from '~/store/types';

export const getStageColor = (stage: Guest['assimilationStage'], type: 'bg' | 'badge' | 'card' = 'bg') => {
    const colors = {
        [AssimilationStage.INVITED]: {
            bg: 'bg-blue-500',
            badge: 'bg-blue-100 text-blue-800',
            card: 'border-blue-200 bg-blue-50',
        },
        [AssimilationStage.ATTENDED1]: {
            bg: 'bg-green-500',
            badge: 'bg-green-100 text-green-800',
            card: 'border-green-200 bg-green-50',
        },
        [AssimilationStage.ATTENDED2]: {
            bg: 'bg-green-500',
            badge: 'bg-green-100 text-green-800',
            card: 'border-green-200 bg-green-50',
        },
        [AssimilationStage.ATTENDED3]: {
            bg: 'bg-green-500',
            badge: 'bg-green-100 text-green-800',
            card: 'border-green-200 bg-green-50',
        },
        [AssimilationStage.ATTENDED4]: {
            bg: 'bg-green-500',
            badge: 'bg-green-100 text-green-800',
            card: 'border-green-200 bg-green-50',
        },
        [AssimilationStage.ATTENDED5]: {
            bg: 'bg-green-500',
            badge: 'bg-green-100 text-green-800',
            card: 'border-green-200 bg-green-50',
        },
        [AssimilationStage.ATTENDED6]: {
            bg: 'bg-green-500',
            badge: 'bg-green-100 text-green-800',
            card: 'border-green-200 bg-green-50',
        },
        [AssimilationStage.MGI]: {
            bg: 'bg-purple-500',
            badge: 'bg-purple-100 text-purple-800',
            card: 'border-purple-200 bg-purple-50',
        },
        [AssimilationStage.JOINED]: {
            bg: 'bg-gray-500',
            badge: 'bg-gray-100 text-gray-800',
            card: 'border-gray-200 bg-gray-50',
        },
    };

    return colors[stage][type];
};

export const getStageText = (stage: Guest['assimilationStage']) => {
    const texts = {
        [AssimilationStage.INVITED]: 'Invited',
        [AssimilationStage.ATTENDED1]: 'Attended 1st',
        [AssimilationStage.ATTENDED2]: 'Attended 2nd',
        [AssimilationStage.ATTENDED3]: 'Attended 3rd',
        [AssimilationStage.ATTENDED4]: 'Attended 4th',
        [AssimilationStage.ATTENDED5]: 'Attended 5th',
        [AssimilationStage.ATTENDED6]: 'Attended 6th',
        [AssimilationStage.MGI]: 'MGI',
        [AssimilationStage.JOINED]: 'Joined Workforce',
    };

    return texts[stage];
};
