import React from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectCurrentUser } from '../../store/services/users';
import { useAuth } from '../auth';

enum ROLES {
    HOD = 'HOD',
    AHOD = 'AHOD',
    admin = 'Admin',
    worker = 'Worker',
    superAdmin = 'Super  Admins',
    campusPastor = 'Campus Pastor',
    globalPastor = 'Global Pastor',
    campusCoordinator = 'Campus Coordinator',
}

enum DEPARTMENTS {
    PCU = 'PCU',
    QC = 'Quality Control',
    ushery = 'Ushery Board',
    witty = 'Witty Inventions',
    CTS = 'COZA Transfer Service',
    ME = 'Monitoring & Evaluation',
    childcare = 'Children Ministry',
    programs = 'Programme Coordinator',
    PRU = 'Public Relations Unit (PRU)',
    security = 'Digital Surveillance Security',
}

const useRole = () => {
    const currentUser = useAppSelector(store => selectCurrentUser(store));

    const roleName = currentUser?.role?.name;
    const departmentName = currentUser?.department?.departmentName;

    const { logOut } = useAuth();

    React.useEffect(() => {
        if (!!currentUser._id && !!currentUser.userId) {
            logOut();
        }
    }, []);

    return {
        // User Object
        user: {
            ...currentUser,
            _id: currentUser.userId || currentUser._id,
            userId: currentUser.userId || currentUser._id,
        },

        // Roles
        isHOD: roleName === ROLES.AHOD,
        isAHOD: roleName === ROLES.HOD,
        isAdmin: roleName === ROLES.admin,
        isWorker: roleName === ROLES.worker,
        isSuperAdmin: roleName === ROLES.superAdmin,
        isGlobalPastor: roleName === ROLES.globalPastor,
        isCampusPastor: roleName === ROLES.campusPastor || roleName === ROLES.campusCoordinator,

        // Departments
        isCTS: departmentName === DEPARTMENTS.CTS,
        isPCU: departmentName === DEPARTMENTS.PCU,
        isPRU: departmentName === DEPARTMENTS.PRU,
        isUshery: departmentName === DEPARTMENTS.ushery,
        isPrograms: departmentName === DEPARTMENTS.programs,
        isSecurity: departmentName === DEPARTMENTS.security,
        isChildcare: departmentName === DEPARTMENTS.childcare,
        isQC: departmentName === DEPARTMENTS.QC || departmentName === DEPARTMENTS.ME,
    };
};

export default useRole;
