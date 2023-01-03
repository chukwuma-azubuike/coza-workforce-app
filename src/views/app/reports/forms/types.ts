import {
    ICampus,
    IDepartment,
    IDepartmentReportResponse,
    IService,
    IUser,
} from '../../../../store/types';

export type IReportFormProps = Pick<
    IDepartmentReportResponse['departmentalReport']['report'],
    '_id'
> & {
    departmentName: IDepartment['departmentName'];
    departmentId: IDepartment['_id'];
    serviceId: IService['id'];
    campusId: ICampus['id'];
    userId: IUser['userId'];
};
