import React from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectCurrentUser } from '../../store/services/users';

enum ROLES {
    QC = 'QC',
    HOD = 'HoD',
    AHOD = 'AHoD',
    admin = 'Admin',
    worker = 'Worker',
    superAdmin = 'Super  Admins',
    campusPastor = 'Campus Pastor',
    globalPastor = 'Global Pastor',
}

enum DEPARTMENTS {
    PCU = 'PCU',
    ushery = 'Ushery Board',
    witty = 'Witty Inventions',
    CTS = 'COZA Transfer Service',
    childcare = 'Children Ministry',
    programs = 'Programme Coordinator',
    security = 'Digital Surveillance Security',
}

const useRole = () => {
    const currentUser = useAppSelector(store => selectCurrentUser(store));

    const {
        role: { name: roleName },
        department: { departmentName },
    } = currentUser;

    return {
        // User Object
        user: currentUser,

        // Roles
        isQC: roleName === ROLES.QC,
        isHOD: roleName === ROLES.AHOD,
        isAHOD: roleName === ROLES.HOD,
        isAdmin: roleName === ROLES.admin,
        isWorker: roleName === ROLES.worker,
        isSuperAdmin: roleName === ROLES.superAdmin,
        isGlobalPastor: roleName === ROLES.globalPastor,
        isCampusPastor: roleName === ROLES.campusPastor,

        // Departments
        isCTS: departmentName === DEPARTMENTS.CTS,
        isPCU: departmentName === DEPARTMENTS.PCU,
        isUshery: departmentName === DEPARTMENTS.ushery,
        isPrograms: departmentName === DEPARTMENTS.programs,
        isSecurity: departmentName === DEPARTMENTS.security,
        isChildcare: departmentName === DEPARTMENTS.childcare,
    };
};

export default useRole;
