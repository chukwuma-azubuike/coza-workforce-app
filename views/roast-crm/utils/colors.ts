import { AssimilationStage } from '~/store/types';

export const getStageColor = (stage: AssimilationStage) => {
    switch (stage) {
        case AssimilationStage.INVITED:
            return 'bg-blue-100 text-blue-800';
        case AssimilationStage.ATTENDED:
            return 'bg-green-100 text-green-800';
        case AssimilationStage.BEING_DISCIPLED:
            return 'bg-purple-100 text-purple-800';
        case AssimilationStage.ASSIMILATED:
            return 'bg-gray-100 text-gray-800';
    }
};

export const getStageColumnColor = (stage: string) => {
    switch (stage) {
        case AssimilationStage.INVITED:
            return 'border-blue-200 dark:border-blue-200/10 bg-blue-50 dark:bg-blue-500/10';
        case AssimilationStage.ATTENDED:
            return 'border-green-200 dark:border-green-200/10 bg-green-50 dark:bg-green-500/10';
        case AssimilationStage.BEING_DISCIPLED:
            return 'border-purple-200 dark:border-purple-200/10 bg-purple-50 dark:bg-purple-500/10';
        case AssimilationStage.ASSIMILATED:
            return 'border-gray-200 dark:border-gray-200/10 bg-gray-50 dark:bg-gray-500/10';
    }
};

export const getStageText = (stage: AssimilationStage) => {
    switch (stage) {
        case AssimilationStage.INVITED:
            return 'Invited';
        case AssimilationStage.ATTENDED:
            return 'Attended';
        case AssimilationStage.BEING_DISCIPLED:
            return 'Discipled';
        case AssimilationStage.ASSIMILATED:
            return 'Joined Workforce';
    }
};

export const getBadgeColor = (stage: AssimilationStage) => {
    switch (stage) {
        case AssimilationStage.INVITED:
            return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-800';
        case AssimilationStage.ATTENDED:
            return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-800';
        case AssimilationStage.BEING_DISCIPLED:
            return 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-800';
        case AssimilationStage.ASSIMILATED:
            return 'bg-gray-100 dark:bg-gray-900/40 text-gray-800 dark:text-gray-800';
    }
};
