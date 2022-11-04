// General types
export interface ILog {
    dateCreated: string;
    dateUpdated: string;
}

// Authentication
export interface IAuthParams extends Omit<IUser, 'id' | 'imageUrl'> {
    password: string;
}

export type ILogin = Pick<IAuthParams, 'email' | 'password'>;

export type IRegister = IAuthParams;

// Users
export interface IUser {
    id: string;
    email: string;
    phoneNumber: string;
    imageUrl: string;
    firstName: string;
    lastName: string;
    address: string;
    nextOfKin: {
        name: string;
        phoneNumber: string;
    };
    occupation: string;
    placeOfWork: string;
    gender: 'MALE' | 'FEMALE';
    maritalStatus: string;
    birthday: string;
    socialMedia: {
        facebook: string;
        instagram: string;
        twitter: string;
    };
}

// Attendance
export interface IAttendance {
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
