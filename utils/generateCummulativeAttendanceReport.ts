import moment from 'moment';
import Utils from '.';

export const cummulativeAttendanceReport = (data: any[]) => {
    const flatAttendance = data?.map(attendance => {
        return {
            ...attendance,
            [`${attendance.clockIn?.split('T')[0]}_${attendance.service}`]: attendance?.clockIn,
            userId: `${attendance.firstName}-${attendance.lastName}`,
        };
    });
    return Utils.groupListByKey(flatAttendance, 'userId', 'values');
};

export const cummulativeIndividualReport = (report: any[]) => {
    // Create an empty object to store the merged data
    const mergedData: any = {};

    // Iterate through the data array
    report.forEach(entry => {
        const userId = entry.userId;

        // Check if the userId already exists in the mergedData object
        if (!mergedData[userId]) {
            // If it doesn't exist, create a new entry
            mergedData[userId] = {
                firstName: entry.firstName,
                lastName: entry.lastName,
                campus: entry.campus,
                role: entry.role,
                department: entry.department,
                userId: userId,
            };
        }

        // Add or update the date field
        mergedData[userId][`${entry.clockIn.split('T')[0]}_${entry.service}`] = moment(entry.clockIn).format('LTS');
    });

    // Convert the mergedData object to an array of objects
    return Object.values(mergedData)[0];
};

export const generateCummulativeAttendanceReport = (reportData: any[]) =>
    cummulativeAttendanceReport(reportData).map(report => cummulativeIndividualReport(report));
