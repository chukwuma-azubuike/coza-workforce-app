import React from 'react';
import { useAppSelector } from '../../store/hooks';
import { useGetRolesQuery } from '../../store/services/role';
import { selectCurrentUser } from '../../store/services/users';
import { useAuth } from '../auth';

export enum ROLES {
    HOD = 'HOD',
    AHOD = 'AHOD',
    admin = 'Admin',
    worker = 'Worker',
    superAdmin = 'Super Admin',
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
    programs = 'Programme Coordination',
    PRU = 'Public Relations Unit (PRU)',
    security = 'Traffic & Security',
    internship = 'COZA Internship',
}

const useRole = () => {
    const currentUser = useAppSelector(store => selectCurrentUser(store));

    const { data: roleObjects } = useGetRolesQuery();
    const leaderRoleIds = React.useMemo(
        () =>
            roleObjects
                ?.filter(roleObject => roleObject.name === ROLES.HOD || roleObject.name === ROLES.AHOD)
                .map(roleObject => roleObject._id),
        [roleObjects]
    );

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

        //Role IDs
        leaderRoleIds,

        // Roles
        isHOD: roleName === ROLES.AHOD,
        isAHOD: roleName === ROLES.HOD,
        isAdmin: roleName === ROLES.admin,
        isWorker: roleName === ROLES.worker,
        isSuperAdmin: roleName === ROLES.superAdmin,
        isGlobalPastor: roleName === ROLES.globalPastor,
        isInternshipHOD: roleName === ROLES.HOD && departmentName === DEPARTMENTS.internship,
        isCampusPastor: roleName === ROLES.campusPastor || roleName === ROLES.campusCoordinator,
        isQcHOD: roleName === ROLES.HOD && (departmentName === DEPARTMENTS.QC || departmentName === DEPARTMENTS.ME),

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
