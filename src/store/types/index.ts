import { IReportFormProps } from '../../views/app/reports/forms/types';

// General types
export interface ILog {
    dateCreated: string;
    dateUpdated: string;
}

export interface IDefaultResponse<D> {
    status: number;
    message: string;
    isError: boolean;
    isSuccessful: boolean;
    data: D;
}

export interface IDefaultErrorResponse {
    data: {
        data: null;
        isError: boolean;
        isSuccessful: boolean;
        message: string;
        status: number;
    };
    status: number;
}

export type IStatus = 'APPROVED' | 'DECLINED' | 'PENDING';

// Authentication
export interface IAuthParams
    extends Omit<
        IUser,
        'id' | 'campus' | 'role' | 'isVerified' | 'isActivated'
    > {
    password: string;
}

export interface IToken {
    token: string;
    refreshToken: string;
    expiresIn: number;
}

export type ILoginPayload = Pick<IAuthParams, 'email' | 'password'>;

export interface IRegisterPayload
    extends Omit<
        IUser,
        'id' | 'campus' | 'role' | 'isVerified' | 'isActivated'
    > {
    roleId: string;
    campusId: string;
    password: string;
    departmentId: string;
    nextOfKinPhoneNo: string;
}

// Users
export interface IUser {
    address: string;
    birthDay: string;
    createdAt: string;
    email: string;
    firstName: string;
    gender: 'M' | 'F';
    isActivated: boolean;
    isVerified: boolean;
    lastName: string;
    maritalStatus: string;
    nextOfKin: string;
    nextOfKinPhoneNo: string;
    occupation: string;
    phoneNumber: string;
    pictureUrl: string;
    placeOfWork: string;
    userId: string;
    role: IRole;
    department: IDepartment;
    campus: ICampus;
    socialMedia: {
        facebook: string;
        instagram: string;
        twitter: string;
    };
}

// Attendance
export interface IAttendance extends ILog {
    _id: string;
    id: string;
    userId: string;
    clockIn: string;
    clockOut: string;
    serviceId: string;
    coordinates: {
        latitude: string;
        longitude: string;
    };
    createdAt: string;
    updatedAt: string;
}

// Compliance
export interface ITicket extends ILog {
    ticketId: string;
    category: string;
    remarks: string;
    code: string;
    contestComment: string;
    contestReplyComment: string;
}

// Permissions
export interface IPermission extends ILog {
    _id: string;
    startDate: string;
    endDate: string;
    dateCreated: string;
    dateUpdated: string;
    category: string;
    description: string;
    status: IStatus;
    comment: string;
    updatedBy: {
        lastName: string;
        firstName: string;
        role: string;
        department: { id: string; name: string };
    };
    requestor: IUser;
}

// Campus
export interface ICampus extends ILog {
    location: {
        long: number;
        lat: number;
    };
    id: string;
    campusName: string;
    description: string;
    address: string;
    LGA: string;
    state: string;
    country: string;
    dateOfBirth: null | string;
    createdAt: string;
}

//Role
export interface IRole {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
    __v: number;
}

// Department
export interface IDepartment {
    _id: string;
    departmentName: string;
    campusId: string;
    description: string;
    createdAt: string;
    __v: number;
}

// Services
export interface IService {
    id: string;
    name: string;
    campusId: string;
    coordinates: {
        long: number;
        lat: number;
    };
    clockInStartTime: number;
    clockInEndTime: number;
    rangeToClockIn: number;
    createdAt: string;
    __v: number;
    campus: {
        LGA: string;
        __v: number;
        _id: string;
        address: string;
        campusName: string;
        country: string;
        createdAt: string;
        dateOfBirth: string | null;
        description: string;
        state: string;
        updatedAt: string;
    };
}

// Reports

export interface IChildCareReportPayload extends IReportFormProps {
    age1_2: {
        male: number;
        female: number;
    };
    age3_5: {
        male: number;
        female: number;
    };
    age6_11: {
        male: number;
        female: number;
    };
    age12_above: {
        male: number;
        female: number;
    };
    subTotal: {
        male: number;
        female: number;
    };
    grandTotal: number;
    otherInfo: string | null;
    imageUrl: string | null;
}

export interface IAttendanceReportPayload extends IReportFormProps {
    maleGuestCount: number;
    femaleGuestCount: number;
    infants: number;
    total: number;
    otherInfo: string | null;
    imageUrl: string | null;
}

export interface IGuestReportPayload extends IReportFormProps {
    firstTimersCount: number;
    newConvertsCount: number;
    otherInfo: string | null;
    imageUrl: string | null;
}

export interface ISecurityReportPayload extends IReportFormProps {
    locations: { name: string; carCount: number }[];
    totalCarCount: number;
    otherInfo: string | null;
    imageUrl: string | null;
}

export interface ITransferReportPayload extends IReportFormProps {
    locations: { name: string; adultCount: number; minorCount: number }[];
    total: { adults: number; minors: number };
    otherInfo: string | null;
    imageUrl: string | null;
}

export interface IServiceReportPayload extends IReportFormProps {
    serviceStartTime: string;
    serviceEndTime: string;
    serviceReportLink: string;
    observations: string | null;
    imageUrl: string | null;
}

export interface IIncidentReportPayload {
    details: string;
    imageUrl: string;
}

export interface IDepartmentReportResponse {
    departmentalReport: {
        departmentId: IDepartment['_id'];
        departmentName: string;
        report: {
            _id: string;
        };
    };
    incidentReport: unknown[];
}
