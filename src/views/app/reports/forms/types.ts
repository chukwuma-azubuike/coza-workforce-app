import {
    ICampus,
    IDepartment,
    IDepartmentReportResponse,
    ILog,
    IReportStatus,
    IService,
    IUser,
} from '../../../../store/types';

export type IReportFormProps = Pick<IDepartmentReportResponse['departmentalReport']['report'], '_id'> &
    ILog & {
        departmentName: IDepartment['departmentName'];
        departmentId: IDepartment['_id'];
        serviceId: IService['_id'];
        campusId: ICampus['_id'];
        userId: IUser['userId'];
        status: IReportStatus;
        pastorComment: string;
    };
