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

export type IStatus = 'APPROVED' | 'DECLINED' | 'PENDING';

// Authentication
export interface IAuthParams
    extends Omit<
        IUser,
        'id' | 'campus' | 'role' | 'isVerified' | 'isActivated'
    > {
    password: string;
}

export type ILoginPayload = Pick<IAuthParams, 'email' | 'password'>;

export type IRegisterPayload = IAuthParams;

// Users
export interface IUser {
    id: string;
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    address: string;
    nextOfKin: {
        name: string;
        phoneNumber: string;
    };
    occupation: string;
    placeOfWork: string;
    gender: 'M' | 'F';
    maritalStatus: string;
    socialMedia: {
        facebook: string;
        instagram: string;
        twitter: string;
    };
    department: {
        id: string;
        name: string;
    };
    campus: {
        id: string;
        name: string;
    };
    role: {
        id: string;
        name: string;
    };
    birthDay: string;
    pictureUrl: string;
    isVerified: boolean;
    isActivated: boolean;
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
    category: string;
    description: string;
    status: IStatus;
    comment: string;
    requestor: IUser;
}

// Campus
export interface ICampus extends ILog {
    location: {
        coordinates: number[];
    };
    _id: string;
    campusName: string;
    description: string;
    address: string;
    LGA: string;
    state: string;
    country: string;
    dateOfBirth: string;
    __v: number;
}
