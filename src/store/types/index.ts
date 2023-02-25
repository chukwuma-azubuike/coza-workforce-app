import { IReportFormProps } from '../../views/app/reports/forms/types';

// General types
export interface ILog {
    dateCreated?: string;
    createdAt?: string;
    dateUpdated?: string;
    updatedAt?: string;
}

export enum REST_API_VERBS {
    GET = 'GET',
    PUT = 'PUT',
    POST = 'POST',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
}

export interface IDefaultResponse<D = unknown> {
    status: number;
    message: string;
    isError: boolean;
    isSuccessful: boolean;
    data: D;
}

export interface IDefaultErrorResponse<D = null> {
    status: number;
    message: string;
    isError: boolean;
    isSuccessful: boolean;
    data: D;
}

export type IStatus = 'APPROVED' | 'DECLINED' | 'PENDING';

export type IReportStatus = 'SUBMITTED' | 'PENDING' | 'REVIEW_REQUESTED';

// Authentication
export interface IAuthParams extends Omit<IUser, 'id' | 'campus' | 'role' | 'isVerified' | 'isActivated'> {
    password: string;
}

export interface IToken {
    token: string;
    refreshToken: string;
    expiresIn: number;
}

export type ILoginPayload = Pick<IAuthParams, 'email' | 'password'>;

export interface IRegisterPayload extends Omit<IUser, 'id' | 'campus' | 'role' | 'isVerified' | 'isActivated'> {
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
    _id: string;
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

export interface ICampusAttendanceSummary {
    leadersPresent: number;
    allLeadersCount: number;
    workersPresent: number;
    allWorkersCount: number;
}

// Compliance
export interface ITicket extends ILog {
    // _id: string;
    // departmentId: string;
    // campusId: ICampus['id'];
    // userId: IUser['userId'];
    // categoryId: string;
    // isDepartment: boolean;
    // isIndividual: boolean;
    // ticketSummary: string;
    // isRetracted: boolean;
    createdAt: string;

    // Proposed
    _id: string;
    user: IUser;
    remarks: string;
    isRetracted: boolean;
    ticketSummary: string;
    status: ITicketStatus;
    contestComment: string;
    department: IDepartment;
    category: ITicketCategory;
    contestReplyComment: string;
    ticketType: 'INDIVIDUAL' | 'DEPARTMENTAL';
}

export interface ITicketCategory {
    _id: string;
    categoryName: string;
    description: string;
    createdAt: string;
}

export interface ICampusTicketsSummary {
    ticketsIssued: number;
}

export interface ICreateTicketPayload {
    departmentId: IDepartment['_id'];
    campusId: ICampus['id'];
    userId?: IUser['userId'];
    categoryId: string;
    isDepartment: boolean;
    isIndividual: boolean;
    isRetracted: boolean;
    ticketSummary: string;
    status: ITicketStatus;
    ticketType: 'INDIVIDUAL' | 'DEPARTMENTAL';
}

export type ITicketStatus = 'ISSUED' | 'CONTESTED' | 'RETRACTED' | 'ACKNOWLEGDED';

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
export interface IRequestPermissionPayload {
    startDate: string;
    endDate: string;
    dateCreated: string;
    category: string;
    description: string;
    status: IStatus;
    requestor: IUser['userId'];
}

// Department

export interface IRequestDepartmentPayload {
    _id: string;
    campusId: string;
    createdAt: string;
    description: string;
    departmentName: string;
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

export interface IIncidentReportPayload extends Omit<IReportFormProps, '_id'> {
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
