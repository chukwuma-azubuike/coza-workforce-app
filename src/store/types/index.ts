import { IReportFormProps } from '../../views/app/reports/forms/types';
import store from '..';

// General types
export interface ILog {
    dateCreated?: string;
    createdAt?: string;
    dateUpdated?: string;
    updatedAt?: string;
}

export enum CREATE_SERVICE_ENUM {
    LONG = 7.505862981744857,
    LAT = 9.005452823370131,
    RANGE_TO_CLOCKIN = 100,
}

export enum IAttendanceStatus {
    LATE = 'LATE',
    ABSENT = 'ABSENT',
    PRESENT = 'PRESENT',
    ABSENT_WITH_PERMISSION = 'ABSENT_WITH_PERMISSION',
}

export type IUserReportType = IAttendanceStatus;

export enum REST_API_VERBS {
    GET = 'GET',
    PUT = 'PUT',
    POST = 'POST',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
}
export interface IDefaultQueryParams {
    departmentId?: IDepartment['_id'];
    serviceId?: IService['_id'];
    startDate?: number | string;
    endDate?: number | string;
    campusId?: ICampus['_id'];
    requestor?: IUser['_id'];
    userId?: IUser['_id'];
    roleId?: IRole['_id'];
    limit?: number;
    page?: number;
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

export type IStatus = 'APPROVED' | 'DECLINED' | 'PENDING' | 'REVIEW_REQUESTED' | 'REJECTED';

export enum IReportStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    SUBMITTED = 'SUBMITTED',
    GSP_SUBMITTED = 'GSP_SUBMITTED',
    REVIEW_REQUESTED = 'REVIEW_REQUESTED',
}

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
    confirmPassword?: string;
    departmentId: string;
    departmentName?: string;
    nextOfKinPhoneNo: string;
}

// Users
export interface IUser {
    _id: string;
    userId: string;
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
    qrCodeUrl: string;
    placeOfWork: string;
    role: IRole;
    roleId: IRole['_id'];
    department: IDepartment;
    campus: ICampus;
    status: IUserStatus;
    socialMedia: {
        facebook: string;
        instagram: string;
        twitter: string;
    };
}

export type IEditProfilePayload = Partial<Omit<IUser, 'email' | 'password'>>;

export interface IUserReport extends Pick<IAttendance, 'user'>, Pick<ITicket, 'user'> {}

export type IUserStatus = 'ACTIVE' | 'DORMANT' | 'INACTIVE' | 'HOD' | 'AHOD';

export interface ICreateUserPayload {
    firstName: string;
    lastName: string;
    email: string;
    campusId: string;
    departmentId: string | undefined;
    roleId: string | undefined;
    registeredBy: string;
    isRegistered: boolean;
}

export interface ICreateDepartmentPayload {
    name: string;
    campusId: string;
    description: string;
}

export interface IReAssignUserPayload {
    _id: IUser['_id'];
    roleId: IUser['roleId'];
    campusId: IUser['campus']['_id'];
    departmentId: IUser['campus']['_id'];
}

// Attendance
export interface IAttendance extends ILog {
    _id: string;
    userId: string;
    clockIn: string;
    clockOut: string;
    serviceId: string;
    coordinates: {
        latitude: string;
        longitude: string;
    };
    campusName: string;
    departmentName: string;
    createdAt: string;
    updatedAt: string;
    user: IUser;
    service: IService;
    campus: Pick<ICampus, '_id' | 'campusName'>;
}

export interface ICampusAttendanceSummary {
    leadersPresent: number;
    allLeadersCount: number;
    workersPresent: number;
    allWorkersCount: number;
}

// Compliance
export interface ITicket extends ILog {
    _id: string;
    user: IUser;
    remarks: string;
    issuedBy?: string;
    createdAt: string;
    isRetracted: boolean;
    ticketSummary: string;
    status: ITicketStatus;
    isDepartment: boolean;
    isIndividual: boolean;
    contestComment: string;
    department: IDepartment;
    category: ITicketCategory;
    departmentName: string;
    contestReplyComment: string;
    campus: Pick<ICampus, '_id' | 'campusName'>;
}

export interface ITicketUpdatePayload {
    userId: IUser['_id'];
    _id: ITicket['_id'];
    comment: string;
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
    _id?: string;
    serviceId: IService['_id'];
    departmentId: IDepartment['_id'];
    campusId: ICampus['_id'];
    userId?: IUser['_id'];
    categoryId: string;
    isCampus: boolean;
    isDepartment: boolean;
    isIndividual: boolean;
    isRetracted: boolean;
    ticketSummary: string;
    status?: ITicketStatus;
    issuedBy: IUser['_id'];
}

export interface ICreateServicePayload {
    serviceType: string;
    serviceName: string;
    serviceTag: string;
    startTime: string | Date;
    startDate: string | Date;
    endTime: string | Date;
    clockinTime: string | Date;
    leaderLateTime: string | Date;
    workerLateTime: string | Date;
}

export type ITicketStatus = 'ISSUED' | 'CONTESTED' | 'RETRACTED' | 'ACKNOWLEGDED';

// Permissions
export interface IPermission extends ILog {
    _id: string;
    startDate: string;
    endDate: string;
    dateCreated: string;
    dateUpdated: string;
    category: IPermissionCategory;
    departmentName: string;
    categoryName: string;
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
    approvedBy: string;
    campusId: ICampus['_id'];
    dateApproved: string;
    department: IDepartment;
    rejectedBy: string;
    rejectedOn: number;
}

export interface IPermissionCategory {
    _id: string;
    name: string;
    createdAt: string;
    description: string;
}

export interface IUpdatePermissionPayload {
    _id: IPermission['_id'];
    comment: string;
    status: IStatus;
}
export interface IRequestPermissionPayload {
    startDate: string | number;
    endDate: string | number;
    dateCreated: string;
    category: string;
    description: string;
    status: IStatus;
    requestor: IUser['_id'];
    categoryId: string;
    departmentId: string;
    campusId: ICampus['_id'];
    approvedBy: IUser['_id'];
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

// Campus
export interface ICampus extends ILog {
    coordinates: {
        long: number;
        lat: number;
    };
    _id: string;
    campusName: string;
    description: string;
    address: string;
    LGA: string;
    state: string;
    country: string;
    dateOfBirth: null | string;
    createdAt: string;
}

export interface ICreateCampusPayload {
    campusName: string;
    description: string;
    address: string;
    LGA: string;
    state: string;
    country: string;
    coordinates: {
        long: number;
        lat: number;
    };
    dateOfBirth: string;
}

//Role
export interface IRole {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
    __v: number;
}

// Services
export interface IService {
    _id: string;
    name: string;
    campusId: string;
    coordinates: {
        long: number;
        lat: number;
    };
    tag: string[];
    serviceTime: string;
    clockInStartTime: string;
    clockInEndTime: string;
    workersLateStartTime: string;
    leadersLateStartTime: string;
    serviceEndTime: string;
    rangeToClockIn: number;
    createdAt: string;
    isGlobalService: boolean;
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
export interface ICreateService {
    _id?: string;
    name: string;
    coordinates: {
        long: number;
        lat: number;
    };
    tag: string[];
    serviceTime: number | null;
    clockInStartTime: number | null;
    workersLateStartTime: number | null;
    leadersLateStartTime: number | null;
    serviceEndTime: number | null;
    rangeToClockIn: number;
    isGlobalService: boolean;
}

// Score

export interface IScore {
    cutOffPoint: number;
    accruedPoint: number;
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

export interface IIncidentReportPayload extends IReportFormProps {
    details: string;
    imageUrl: string;
    incident: string;
}

export interface IDepartmentReportResponse {
    departmentName: string;
    departmentalReport: {
        departmentId: IDepartment['_id'];
        departmentName: string;
        report: {
            _id: string;
        };
    };
    incidentReport: unknown[];
}

export interface IAllService {
    tag: [];
    _id: string;
    name: string;
    coordinates: {
        long: number;
        lat: number;
    };
    serviceTime: string;
    workersLateStartTime: string;
    leadersLateStartTime: string;
    serviceEndTime: string;
    clockInStartTime: string;
    clockInEndTime: string;
    rangeToClockIn: number;
    isGlobalService: boolean;
    createdAt: string;
}
export interface ICampusUserData {
    campusId: string;
    campusName: string;
    departments: number;
    totalUser: number;
    activeUser: number;
    dormantUser: number;
    inactiveUser: number;
    departmentCount: {
        departmentId: string;
        departmentName: string;
        userCount: number;
    }[];
}
export interface IExportFilters {
    campusId: string;
    departmentId: string | undefined;
    serviceId: string | undefined;
    data: string;
}

export interface IReportDownloadPayload {
    campusId?: string;
    serviceId?: string;
    departmentId?: string;
}
