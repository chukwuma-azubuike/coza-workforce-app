import { IUser } from './../../store/types/index';
import React from 'react';
import Utils from '../../utils';

enum ROLES {
    worker = 'Worker',
    QC = 'QC',
    HOD = 'HoD',
    AHOD = 'AHoD',
    campusPastor = 'Campus Pastor',
    globalPastor = 'Global Pastor',
    admin = 'Admin',
    superAdmin = 'Super  Admin',
}

const useRole = () => {
    const currentData = async () => Utils.retrieveCurrentUserData();

    const [user, setUser] = React.useState<IUser>();

    const [isQC, setIsQC] = React.useState<boolean>(false);
    const [isWorker, setIsWorker] = React.useState<boolean>(false);
    const [isCampusPastor, setIsCampusPastor] = React.useState<boolean>(false);
    const [isHOD, setIsHOD] = React.useState<boolean>(false);
    const [isAHOD, setIsAHOD] = React.useState<boolean>(false);
    const [isGlobalPastor, setIsGlobalPastor] = React.useState<boolean>(false);
    const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
    const [isSuperAdmin, setIsSuperAdmin] = React.useState<boolean>(false);

    const [userRole, setUserRole] = React.useState<string>();

    React.useEffect(() => {
        currentData().then(res => {
            setUserRole(res.role.name);
            setUser(res);
        });
    }, []);

    React.useEffect(() => {
        switch (userRole) {
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
            case ROLES.globalPastor:
                setIsGlobalPastor(true);
            case ROLES.superAdmin:
                setIsSuperAdmin(true);
            default:
                break;
        }
    }, [userRole]);

    return {
        user,
        isQC,
        isHOD,
        isAHOD,
        isAdmin,
        isWorker,
        isSuperAdmin,
        isGlobalPastor,
        isCampusPastor,
    };
};

export default useRole;
