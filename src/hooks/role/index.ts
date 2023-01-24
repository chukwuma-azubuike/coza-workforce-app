import React from 'react';
import { useSelector } from 'react-redux';
import { IStore } from '../../store';
import { selectCurrentUser } from '../../store/services/users';

enum ROLES {
    worker = 'Worker',
    QC = 'QC',
    HOD = 'HoD',
    AHOD = 'AHoD',
    campusPastor = 'Campus Pastor',
    globalPastor = 'Global Pastor',
    admin = 'Admin',
    superAdmin = 'Super  Admins',
}

enum DEPARTMENTS {
    childcare = 'Children Ministry',
    security = 'Digital Surveillance Security',
    pcu = 'PCU',
    programs = 'Programme Coordinator',
    ushery = 'Ushery Board',
    CTS = 'COZA Transfer Service',
    witty = 'Witty Inventions',
}

const useRole = () => {
    const currentUser = useSelector((store: IStore) =>
        selectCurrentUser(store)
    );

    const [isQC, setIsQC] = React.useState<boolean>(false);
    const [isWorker, setIsWorker] = React.useState<boolean>(false);
    const [isCampusPastor, setIsCampusPastor] = React.useState<boolean>(false);
    const [isHOD, setIsHOD] = React.useState<boolean>(false);
    const [isAHOD, setIsAHOD] = React.useState<boolean>(false);
    const [isGlobalPastor, setIsGlobalPastor] = React.useState<boolean>(false);
    const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
    const [isSuperAdmin, setIsSuperAdmin] = React.useState<boolean>(false);

    const [isCTS, setIsCTS] = React.useState<boolean>(false);
    const [isUshery, setIsUshery] = React.useState<boolean>(false);
    const [isPrograms, setIsPrograms] = React.useState<boolean>(false);
    const [isPCU, setIsPCU] = React.useState<boolean>(false);
    const [isSecurity, setIsSecurity] = React.useState<boolean>(false);
    const [isChildcare, setIsChildcare] = React.useState<boolean>(false);
    const [isWitty, setIsWitty] = React.useState<boolean>(false);

    React.useEffect(() => {
        switch (currentUser?.role?.name) {
            case ROLES.worker:
                setIsWorker(true);
                break;
            case ROLES.QC:
                setIsQC(true);
                break;
            case ROLES.HOD:
                setIsHOD(true);
                break;
            case ROLES.AHOD:
                setIsAHOD(true);
                break;
            case ROLES.campusPastor:
                setIsCampusPastor(true);
                break;
            case ROLES.admin:
                setIsAdmin(true);
                break;
            case ROLES.globalPastor:
                setIsGlobalPastor(true);
                break;
            case ROLES.superAdmin:
                setIsSuperAdmin(true);
                break;
            default:
                break;
        }
    }, [currentUser?.role?.name]);

    React.useEffect(() => {
        switch (currentUser?.department?.departmentName) {
            case DEPARTMENTS.CTS:
                setIsCTS(true);
                break;
            case DEPARTMENTS.childcare:
                setIsChildcare(true);
                break;
            case DEPARTMENTS.pcu:
                setIsPCU(true);
                break;
            case DEPARTMENTS.programs:
                setIsPrograms(true);
                break;
            case DEPARTMENTS.security:
                setIsSecurity(true);
                break;
            case DEPARTMENTS.ushery:
                setIsUshery(true);
                break;
            case DEPARTMENTS.witty:
                setIsWitty(true);
                break;
            default:
                break;
        }
    }, [currentUser?.department?.departmentName]);

    return {
        // User Object
        user: currentUser,

        // Roles
        isQC,
        isHOD,
        isAHOD,
        isWitty,
        isAdmin,
        isWorker,
        isSuperAdmin,
        isGlobalPastor,
        isCampusPastor,

        // Departments
        isCTS,
        isPCU,
        isUshery,
        isPrograms,
        isSecurity,
        isChildcare,
    };
};

export default useRole;
