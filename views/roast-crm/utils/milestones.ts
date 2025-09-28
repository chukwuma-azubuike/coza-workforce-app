import { Guest, MilestoneStatus } from '~/store/types';

export const getProgressPercentage = (milestones: Guest['milestones']) => {
    // TODO: Random value for testing
    return Math.round(Math.random() * 100);
    // if (!milestones || milestones.length === 0) return 0;
    // const completed = milestones.filter(m => m.status === MilestoneStatus.COMPLETED).length;
    // return Math.round((completed / milestones.length) * 100);
};

export const getDaysSinceContact = (lastContact: Date | undefined | null) => {
    if (!lastContact) return null;
    const today = new Date();
    const contactDate = new Date(lastContact);
    const diffTime = today.getTime() - contactDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};
