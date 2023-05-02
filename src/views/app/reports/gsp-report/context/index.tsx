import React from 'react';

interface IGlobalReportContext {
    serviceId: string;
    setServiceId: React.Dispatch<React.SetStateAction<string | undefined>>;
}

const GlobalReportContext = React.createContext({} as IGlobalReportContext);

const GlobalReportProvider: React.FC = ({ children }) => {
    const [serviceId, setServiceId] = React.useState<string>();

    const initialValues: IGlobalReportContext = {
        serviceId: serviceId as string,
        setServiceId,
    };

    return <GlobalReportContext.Provider value={initialValues}>{children}</GlobalReportContext.Provider>;
};

export { GlobalReportContext, GlobalReportProvider };
