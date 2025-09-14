import { ICampus, IDepartment, IService } from '~/store/types';

interface IGenerateReportName {
    serviceId?: string;
    campusId?: string;
    dataType?: string;
    departmentId?: string;
    campuses?: ICampus[];
    services?: IService[];
    campusDepartments?: IDepartment[];
}

export const generateReportName: (args: IGenerateReportName) => string = ({
    campusId,
    dataType,
    services,
    campuses,
    serviceId,
    departmentId,
    campusDepartments,
}) => {
    return `${campusDepartments?.find(department => department._id === departmentId)?.departmentName || ''}_${
        campuses?.find(campus => campus._id === campusId)?.campusName || ''
    }_${services?.find(service => service._id === serviceId)?.name || ''}_${dataType}_report`;
};
