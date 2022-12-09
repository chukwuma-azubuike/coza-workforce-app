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
    xCoordinate: number;
    yCoordinate: number;
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
