import { IReportFormProps } from '@views/app/reports/forms/types';
import APP_VARIANT from '~/config/envConfig';
export * from './roast-crm';

// General types
export interface ILog {
    dateCreated?: string;
    createdAt?: string;
    dateUpdated?: string;
    updatedAt?: string;
}

export enum ERROR {
    NETWORK_CONNECTION_ERROR = 'TypeError: Network request failed',
}

export enum CREATE_SERVICE_ENUM {
    LONG = 7.505862981744857,
    LAT = 9.005452823370131,
}

export const DEFAULT_RANGES_TO_CLOCKIN = APP_VARIANT.isProd ? '200' : '100000';

export const RANGES_TO_CLOKIN = [
    { id: '100', label: '100m' },
    { id: '200', label: '200m' },
    { id: '500', label: '500m' },
    { id: '1000', label: '1000m' },
    { id: '2000', label: '2000m' },
    { id: '5000', label: '5000m' },
    { id: '10000', label: '10000m' },
    { id: '100000', label: '100000m' },
];

export const SERVICE_TAGS = [
    { id: 'COZA_SUNDAYS', value: 'COZA Sundays' },
    { id: 'COZA_TUESDAYS', value: 'COZA Tuesdays' },
    { id: 'COZA_WEDNESDAYS', value: 'COZA Wednesdays' },
    { id: 'DPE', value: 'DPE' },
    { id: 'DOMINION_HOUR', value: 'Dominion Hour' },
    { id: 'HOME_TRAINING', value: 'Home Training' },
    { id: 'LEADERS_MEETING', value: 'Leaders Meeting' },
    { id: '12DG', value: '12DG' },
    { id: '7DG', value: '7DG' },
    { id: 'OTHERS', value: 'Others' },
];

export const Congress_SESSION_TAGS = [
    { id: 'Congress_MORNING_SESSION', value: 'Morning Session' },
    { id: 'Congress_EVENING_SESSION', value: 'Evening Session' },
    { id: 'Congress_AFTERNOON_SESSION', value: 'Afternoon Session' },
    { id: 'Congress_HANGOUT_SESSION', value: 'Hangout Session' },
    { id: 'Congress_DINNER_SESSION', value: 'Dinner Session' },
    { id: 'Congress_LADIES_SESSION', value: 'Ladies Session' },
    { id: 'Congress_EVANGELISM_SESSION', value: 'Evangelism Session' },
    { id: 'Congress_BREAKOUT_SESSION', value: 'Breakout Session' },
];

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
    CGWCId?: string;
    cgwcId?: string;
    limit?: number;
    page?: number;
    isGH?: boolean;
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

export type IStatus = 'APPROVED' | 'DECLINED' | 'PENDING' | 'REVIEW_REQUESTED' | 'REJECTED' | 'SUBMITTED';

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
export interface ILogoutPayload {
    expoPushToken: string;
    userId: string;
}

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
    isCGWCApproved?: boolean;
    nextOfKinPhoneNo: string;
    occupation: string;
    phoneNumber: string;
    pictureUrl: string;
    qrCodeUrl: string;
    placeOfWork: string;
    role: IRole;
    roleId: IRole['_id'];
    departmentId?: string;
    campusId?: string;
    department: IDepartment;
    departmentName?: string;
    campus: ICampus;
    campusName?: string;
    status: IUserStatus;
    socialMedia: {
        facebook: string;
        instagram: string;
        twitter: string;
    };
}

export type IEditProfilePayload = Partial<Omit<IUser, 'email' | 'password'>>;

export interface IUserReport extends Pick<IAttendance, 'user'>, Pick<ITicket, 'user'> {}

export type IUserStatus = 'ACTIVE' | 'DORMANT' | 'INACTIVE' | 'HOD' | 'AHOD' | 'UNAPPROVED' | 'BLACKLISTED';

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
    serviceId?: string;
    coordinates: {
        latitude: string;
        longitude: string;
    };
    campusName: string;
    departmentName: string;
    createdAt: string;
    updatedAt: string;
    user: IUser;
    score?: number;
    service: IService;
    CongressId?: string;
    name: string;
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
    CongressId?: string;
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
    // screen: { name: string; value: string } | undefined;
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
    ticketType?: string;
    isDepartment: boolean;
    isIndividual: boolean;
    isRetracted: boolean;
    ticketSummary: string;
    status?: ITicketStatus;
    issuedBy: IUser['_id'];
}

export interface ICreateServicePayload {
    serviceType: 'global' | 'local';
    serviceDate: Date | string;
    clockInStartTime: string;
    coordinates: {
        long: number;
        lat: number;
    };
    isGlobalService: boolean;
    leadersLateStartTime: string;
    name: string;
    rangeToClockIn: number;
    serviceEndTime: string;
    serviceTime: string;
    tag: string;
    workersLateStartTime: string;
}

export interface IUpdateServicePayload extends ICreateServicePayload {
    _id: string;
}

export interface IAssignGroupHead {
    department: string;
    campus: string;
    worker: string;
    role: string;
}

export type ITicketStatus = 'ISSUED' | 'CONTESTED' | 'RETRACTED' | 'ACKNOWLEGDED';

// Permissions
export interface IPermission extends ILog {
    _id: string;
    CongressId?: string;
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
    campus: Pick<ICampus, '_id' | 'campusName'>;
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

export interface IGHCampus extends ILog {
    userId: string;
    email: string;
    campuses: {
        id: string;
        campusName: string;
        departmentCount: number;
    }[];
}

//Role
export interface IRole {
    _id: string;
    name: string;
    description: string;
    createdAt: string;
    __v: number;
}

export interface IAssignSecondaryRole {
    departments: {
        campusId: string;
        departmentId: string;
    }[];
    email?: string;
    userId: string;
    roleId: string;
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

export interface IGHDepartment {
    userId: string;
    email: string;
    campusId: string;
    campusName: string;
    campuses: {
        id: string;
        departmentName: string;
        userCount: number;
    }[];
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
    CGWCId?: string;
    isCongress?: boolean;
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

export interface ICongressParams {
    isCongress: boolean;
    CongressId: string;
}

export interface ICongress {
    _id: string;
    name: string;
    startDate: string;
    endDate: string;
    createdAt: string;
}

export interface ICongressPayload {
    name: string;
    endDate: number;
    startDate: number;
    registrationStartDate: number;
    registrationEndDate: number;
}

export interface ICongressInstantMessage {
    _id: string;
    title: string;
    CongressId: string;
    message: string;
    status: IStatus;
    imageUrl: string;
    createdAt: string;
    messageLink: string;
}

export interface ICongressFeedbackPayload {
    userId: string;
    CongressId: string;
    rating: number;
    comment: string;
}
export interface ICongressFeedback extends ICongressFeedbackPayload {
    _id: string;
}

export interface ICongressInstantMessagePayload {
    title: string;
    CongressId?: string;
    cgwcId: string;
    message: string;
    status: IStatus;
    messageLink: string;
}
export interface ICreateService {
    name: string;
    coordinates: {
        long: number;
        lat: number;
    };
    CongressId?: string;
    isCongress?: boolean;
    tag: string[];
    serviceTime: string | null;
    clockInStartTime: string | null;
    workersLateStartTime: string | null;
    leadersLateStartTime: string | null;
    serviceEndTime: string | null;
    rangeToClockIn: number;
    isGlobalService: boolean;
}

export interface IUpdateService extends ICreateService {
    _id: string;
}

// Score

export interface IScore {
    cutOffPoint: number;
    accruedPoint: number;
}

// Reports

export interface IGHSubmittedReportForGSP {
    id: string;
    firstName: string;
    lastName: string;
    campusId: string;
    campusName: string;
    departmentId: string;
    departmentName: string;
    submittedReport: string;
    status: string;
    gspComment: string;
    serviceName: string;
    serviceTime: string;
}

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

type IGraphAttendanceReportItem = Array<{
    campusName: string;
    value: number;
    status: string;
}>;

export interface IGraphAttendanceReports {
    present: IGraphAttendanceReportItem;
    late: IGraphAttendanceReportItem;
    absent: IGraphAttendanceReportItem;
    total: IGraphAttendanceReportItem;
    ticket: IGraphAttendanceReportItem;
    ticketCategory: {
        campusName: string;
        value: {
            name: string;
            campusTicketCount: number;
        }[];
        status: string;
    }[];
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
    blacklistedUser: number;
    intendingWorkerUser: number;
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
    startDate?: number;
    endDate?: number;
}

// Score Mapping

export interface IScoreMapping {
    userId: string;
    lastName: string;
    firstName: string;
    email: string;
    pictureUrl: string;
    isEligible: boolean;
    isCGWCApproved: boolean;
    totalMaxPoints: boolean;
    totalScore: number;
    cummulativeScore: number;
}
