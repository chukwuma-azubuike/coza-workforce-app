import React, { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import { useGetRolesQuery } from '@store/services/role';
import { useAuth } from '../auth';
import { userActions, userSelectors } from '~/store/actions/users';
import { IUser } from '~/store/types';
import { useGetUserByIdQuery } from '~/store/services/account';

export enum ROLES {
    HOD = 'HOD',
    AHOD = 'AHOD',
    admin = 'Admin',
    worker = 'Worker',
    groupHead = 'Group Head',
    superAdmin = 'Super Admin',
    globalAdmin = 'Global Admin',
    campusPastor = 'Campus Pastor',
    globalPastor = 'Global Pastor',
    campusCoordinator = 'Campus Coordinator',
}

export const roles = {
    HOD: 'HOD',
    AHOD: 'AHOD',
    Admin: 'admin',
    Worker: 'worker',
    'Group Head': 'groupHead',
    'Super Admin': 'superAdmin',
    'Global Admin': 'globalAdmin',
    'Campus Pastor': 'campusPastor',
    'Global Pastor': 'globalPastor',
    'Campus Coordinator': 'campusCoordinator',
};

export const departments = {
    PCU: 'PCU',
    'Quality Control': 'QC',
    'Ushery Board': 'ushery',
    'Witty Inventions': 'witty',
    'COZA Transfer Service': 'CTS',
    'Monitoring & Evaluation': 'ME',
    'Children Ministry': 'childcare',
    'Programme Coordination': 'programs',
    'Public Relations Unit (PRU)': 'PRU',
    'Traffic & Security': 'security',
    'COZA Internship': 'internship',
};

export enum ROLE_HEIRARCHY {
    'worker' = 1,
    'AHOD' = 2,
    'HOD' = 2,
    'internshipHOD' = 2, // Frontend generated
    // 'qcHOD' = 1, // Frontend generated
    'campusCoordinator' = 5,
    'campusPastor' = 5,
    'admin' = 6,
    'globalAdmin' = 7,
    'globalPastor' = 8,
    'superAdmin' = 9,
}

export enum DEPARTMENTS {
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
    const dispatch = useAppDispatch();
    const storedUser = useAppSelector(store => userSelectors.selectCurrentUser(store));
    const {
        data: latestUser,
        refetch,
        isFetching,
    } = useGetUserByIdQuery(storedUser?.userId as string, {
        skip: !storedUser?.userId,
        refetchOnMountOrArgChange: false,
    });
    const currentUser = latestUser || storedUser;

    const { data: roleObjects } = useGetRolesQuery(undefined, { refetchOnMountOrArgChange: false });
    const leaderRoleIds = React.useMemo(
        () =>
            roleObjects
                ?.filter(roleObject => roleObject.name === ROLES.HOD || roleObject.name === ROLES.AHOD)
                .map(roleObject => roleObject._id),
        [roleObjects]
    );

    const roleName = currentUser?.role?.name;
    const departmentName = currentUser?.department?.departmentName;

    const roleHeirarchy = useCallback(
        (roleName: keyof typeof roles, departmentName: keyof typeof departments) => {
            const roleKey = roles[roleName] as keyof typeof ROLE_HEIRARCHY;

            if (!roleKey) {
                return -1;
            }
            if (!ROLE_HEIRARCHY[roleKey]) {
                return -1;
            }

            // if (roleName === ROLES.HOD && departmentName === DEPARTMENTS.QC) {
            //     return ROLE_HEIRARCHY.qcHOD;
            // }

            if (roleName === ROLES.HOD && departmentName === DEPARTMENTS.internship) {
                return ROLE_HEIRARCHY.internshipHOD;
            }

            return ROLE_HEIRARCHY[roleKey];
        },
        [roles, departments, ROLE_HEIRARCHY, ROLES, DEPARTMENTS]
    );

    const rolesPermittedToCreate = useCallback(() => {
        return roleObjects?.filter(
            roleObject =>
                roleHeirarchy(roleName as keyof typeof roles, departmentName as keyof typeof departments) >
                ROLE_HEIRARCHY[roles[roleObject.name as keyof typeof roles] as keyof typeof ROLE_HEIRARCHY]
        );
    }, [roleObjects, roleName, roles, departmentName, ROLE_HEIRARCHY]);

    const { logOut } = useAuth();

    React.useEffect(() => {
        if (!!currentUser?._id && !!currentUser?.userId) {
            logOut();
        }
    }, []);

    React.useEffect(() => {
        if (latestUser) {
            dispatch(userActions.updateSession(latestUser));
        }
    }, [latestUser]);

    return {
        // User Object
        user: {
            roleName,
            ...currentUser,
            _id: currentUser?.userId || currentUser?._id,
            userId: currentUser?.userId || currentUser?._id,
        } as IUser,

        refetch,
        isFetching,

        //Status
        isCGWCApproved: currentUser?.isCGWCApproved,

        //Role IDs
        leaderRoleIds,

        // Roles
        isHOD: roleName === ROLES.AHOD,
        isAHOD: roleName === ROLES.HOD,
        isAdmin: roleName === ROLES.admin,
        isWorker: roleName === ROLES.worker,
        isGroupHead: roleName === ROLES.groupHead,
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

        // Role Creation
        rolesPermittedToCreate,
    };
};

export default useRole;
