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
    PCU = 'PCU',
    programs = 'Programme Coordinator',
    ushery = 'Ushery Board',
    CTS = 'COZA Transfer Service',
    witty = 'Witty Inventions',
}

const useRole = () => {
    const currentUser = useSelector((store: IStore) =>
        selectCurrentUser(store)
    );

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
