import React from 'react';

export interface IUserReportContext {
    userId: string;
    setUserId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const UserReportContext = React.createContext({} as IUserReportContext);

const UserReportProvider: React.FC = ({ children }) => {
    const [userId, setUserId] = React.useState<string>();

    const initialValues: IUserReportContext = {
        setUserId,
        userId: userId as string,
    };

    return <UserReportContext.Provider value={initialValues}>{children}</UserReportContext.Provider>;
};

export { UserReportContext, UserReportProvider };
