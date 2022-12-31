export type BusCountType = {
    headers: string[];
    rows: {
        location: string;
        adults: number;
        children: number;
        total: number;
    }[];
};

export type ChildCareType = {
    headers: string[];
    rows: {
        age: string;
        male: number;
        female: number;
        total: number;
    }[];
};

export type ServiceAttendanceType = {
    headers: string[];
    rows: {
        male: number;
        female: number;
        infants: number;
        total: number;
    }[];
};

export type WorkersAttendanceType = {
    headers: string[];
    rows: {
        active: number;
        present: number;
        late: number;
        absent: number;
    }[];
};

export type GuestsAttendanceType = {
    headers: string[];
    column: {
        firstTimers: number;
        newConverts: number;
    };
};
export type CarCountType = {
    headers: string[];
    column: {
        mainCarPark: number;
        extension: number;
        total: number;
    };
};

export type ServiceObservationsType = {
    headers: string[];
    rows: {
        observations: string;
    }[];
};

export type IncidentReportType = {
    headers: string[];
    rows: {
        department: string;
        indident: string;
    }[];
};
