import React from 'react';

interface IGlobalReportContext {
    serviceId: string;
    campusId: string;
    campusName: string;
    setCampusName: React.Dispatch<React.SetStateAction<string | undefined>>;
    setServiceId: React.Dispatch<React.SetStateAction<string | undefined>>;
    setCampusId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const GlobalReportContext = React.createContext({} as IGlobalReportContext);

const GlobalReportProvider: React.FC = ({ children }) => {
    const [serviceId, setServiceId] = React.useState<string>();
    const [campusId, setCampusId] = React.useState<string>();
    const [campusName, setCampusName] = React.useState<string>();

    const initialValues: IGlobalReportContext = {
        setCampusId,
        setServiceId,
        setCampusName,
        campusId: campusId as string,
        serviceId: serviceId as string,
        campusName: campusName as string,
    };

    return <GlobalReportContext.Provider value={initialValues}>{children}</GlobalReportContext.Provider>;
};

export { GlobalReportContext, GlobalReportProvider };
