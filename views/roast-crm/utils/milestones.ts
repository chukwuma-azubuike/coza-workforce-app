export const getProgressPercentage = (position: number, subStageCount = 7) => {
    return Number((((position + 1) / subStageCount) * 100).toFixed(0) ?? 0);
};

export const getDaysSinceContact = (lastContact: Date | undefined | null) => {
    if (!lastContact) return null;
    const today = new Date();
    const contactDate = new Date(lastContact);
    const diffTime = today.getTime() - contactDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};
