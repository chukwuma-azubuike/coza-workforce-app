import {
    ICampus,
    IDepartment,
    IDepartmentReportResponse,
    ILog,
    IReportStatus,
    IService,
    IUser,
} from '@store/types';
import { IStatus } from '@store/types';

export type IReportFormProps = Pick<IDepartmentReportResponse['departmentalReport']['report'], '_id'> &
    ILog & {
        departmentName: IDepartment['departmentName'];
        departmentId: IDepartment['_id'];
        status: IReportStatus | IStatus;
        serviceId: IService['_id'];
        campusId: ICampus['_id'];
        userId: IUser['userId'];
        pastorComment: string;
    };
