import { AssimilationStage } from '~/store/types';

export const getStageColor = (stage: AssimilationStage) => {
    switch (stage) {
        case AssimilationStage.INVITED:
            return 'bg-blue-100 text-blue-800';
        case AssimilationStage.ATTENDED1:
        case AssimilationStage.ATTENDED2:
        case AssimilationStage.ATTENDED3:
        case AssimilationStage.ATTENDED4:
        case AssimilationStage.ATTENDED5:
        case AssimilationStage.ATTENDED6:
            return 'bg-green-100 text-green-800';
        case AssimilationStage.MGI:
            return 'bg-purple-100 text-purple-800';
        case AssimilationStage.JOINED:
            return 'bg-gray-100 text-gray-800';
    }
};

export const getStageColumnColor = (stage: AssimilationStage) => {
    switch (stage) {
        case AssimilationStage.INVITED:
            return 'border-blue-200 dark:border-blue-200/10 bg-blue-50 dark:bg-blue-500/10';
        case AssimilationStage.ATTENDED1:
        case AssimilationStage.ATTENDED2:
        case AssimilationStage.ATTENDED3:
        case AssimilationStage.ATTENDED4:
        case AssimilationStage.ATTENDED5:
        case AssimilationStage.ATTENDED6:
            return 'border-green-200 dark:border-green-200/10 bg-green-50 dark:bg-green-500/10';
        case AssimilationStage.MGI:
            return 'border-purple-200 dark:border-purple-200/10 bg-purple-50 dark:bg-purple-500/10';
        case AssimilationStage.JOINED:
            return 'border-gray-200 dark:border-gray-200/10 bg-gray-50 dark:bg-gray-500/10';
    }
};

export const getStageText = (stage: AssimilationStage) => {
    switch (stage) {
        case AssimilationStage.INVITED:
            return 'Invited';
        case AssimilationStage.ATTENDED1:
        case AssimilationStage.ATTENDED2:
        case AssimilationStage.ATTENDED3:
        case AssimilationStage.ATTENDED4:
        case AssimilationStage.ATTENDED5:
        case AssimilationStage.ATTENDED6:
            return 'Attended';
        case AssimilationStage.MGI:
            return 'Discipled';
        case AssimilationStage.JOINED:
            return 'Joined Workforce';
    }
};

export const getBadgeColor = (stage: AssimilationStage) => {
    switch (stage) {
        case AssimilationStage.INVITED:
            return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-800';
        case AssimilationStage.ATTENDED1:
        case AssimilationStage.ATTENDED2:
        case AssimilationStage.ATTENDED3:
        case AssimilationStage.ATTENDED4:
        case AssimilationStage.ATTENDED5:
        case AssimilationStage.ATTENDED6:
            return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-800';
        case AssimilationStage.MGI:
            return 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-800';
        case AssimilationStage.JOINED:
            return 'bg-gray-100 dark:bg-gray-900/40 text-gray-800 dark:text-gray-800';
    }
};
