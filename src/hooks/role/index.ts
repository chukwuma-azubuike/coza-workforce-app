import React from 'react';
import { useAppSelector } from '../../store/hooks';
import { selectCurrentUser } from '../../store/services/users';

enum ROLES {
    HOD = 'HOD',
    AHOD = 'AHOD',
    admin = 'Admin',
    worker = 'Worker',
    superAdmin = 'Super  Admins',
    campusPastor = 'Campus Pastor',
    globalPastor = 'Global Pastor',
}

enum DEPARTMENTS {
    PCU = 'PCU',
    QC = 'Quality Control',
    ushery = 'Ushery Board',
    witty = 'Witty Inventions',
    CTS = 'COZA Transfer Service',
    childcare = 'Children Ministry',
    programs = 'Programme Coordinator',
    security = 'Digital Surveillance Security',
}

const useRole = () => {
    const currentUser = useAppSelector(store => selectCurrentUser(store));

    const roleName = currentUser?.role?.name;
    const departmentName = currentUser?.department?.departmentName;

    return {
        // User Object
        user: currentUser,

        // Roles
        isHOD: roleName === ROLES.AHOD,
        isAHOD: roleName === ROLES.HOD,
        isAdmin: roleName === ROLES.admin,
        isWorker: roleName === ROLES.worker,
        isSuperAdmin: roleName === ROLES.superAdmin,
        isGlobalPastor: roleName === ROLES.globalPastor,
        isCampusPastor: roleName === ROLES.campusPastor,

        // Departments
        isQC: departmentName === DEPARTMENTS.QC,
        isCTS: departmentName === DEPARTMENTS.CTS,
        isPCU: departmentName === DEPARTMENTS.PCU,
        isUshery: departmentName === DEPARTMENTS.ushery,
        isPrograms: departmentName === DEPARTMENTS.programs,
        isSecurity: departmentName === DEPARTMENTS.security,
        isChildcare: departmentName === DEPARTMENTS.childcare,
    };
};

export default useRole;
