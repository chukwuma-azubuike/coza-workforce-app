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
    zonalCoordinator = 'Zonal Coordinator',
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
    'Zonal Coordinator': 'zonalCoordinator',
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
    'Welfare and Special Needs Assignment': 'welfare',
    Protocol: 'protocol',
};

export enum ROLE_HEIRARCHY {
    'worker' = 1,
    'zonalCoordinator' = 2,
    'AHOD' = 3,
    'HOD' = 3,
    'internshipHOD' = 3, // Frontend generated
    // 'qcHOD' = 1, // Frontend generated
    'groupHead' = 5,
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
    welfare = 'Welfare and Special Needs Assignment',
    protocol = 'Protocol',
}

const ROAST_ALPHA_TESTERS = [
    'samueldaniels501@gmail.com',
    'seun4olaku@gmail.com',
    'oyinkansolaabifarin@gmail.com',
    'tomiwasotubo@gmail.com',
    'bamideleristch@gmail.com',
    'gazagodiyajoy@gmail.com',
    'jeldi2000@yahoo.com',
    'dthreeng@yahoo.com',
    'shegcyus@yahoo.com',
    'badewumi2015@gmail.com',
    'ov.ademola@gmail.com',
    'ajibikeolamide1@gmail.com',
    'abiwopelumi@gmail.com',
    'ijeomaserena@gmail.com',
    'tabithaaoye@gmail.com',
    'keazort@gmail.com',
    'abbeyrotimi86@gmail.com',
    'ichullblessing@gmail.com',
    'abexkem85@gmail.com',
    'charitykalu825@gmail.com',
    'oyindamolaoketola@gmail.com',
    'mos4luv@yahoo.com',
    'danieltofunmi21@gmail.com',
    'praised314@gmail.com',
    'bestyole9@gmail.com',
    'graciaubi@gmail.com',
    'toydonduke@gmail.com',
    'samuelayomide889@gmail.com',
    'olayinks7@gmail.com',
    'rallylawalson@gmail.com',
    'mfon.peter418@gmail.com',
    'funmilayomoses19@gmail.com',
    'suzanneojeifoidris@gmail.com',
    'pojosonia91@gmail.com',
    'adeyemotemitope1@gmail.com',
    'lolaajiboyejones@gmail.com',
    'preciousoguntona@gmail.com',
    'princehollarmedey@gmail.com',
    'ehixgux@gmail.com',
    'chiomajaneonyema@gmail.com',
    'oreofebeloved@gmail.com',
    'pastorflow@yahoo.com',
    'soflarity@hotmail.com',
    'chukwumaazubuike@gmail.com',
    'rereloluwathomas@gmail.com',
    'victorkadiri@gmail.com',
    'mailoge@gmail.com',
    'oladayojones@gmail.com',
    'tundebukoye@gmail.com',
    'kenoham@yahoo.com',
    'graceanti91@gmail.com',
    'ginyoro@gmail.com',
    'taiwogcfr@gmail.com',
    'abujadeolaide@yahoo.com',
    'jequez85@gmail.com',
    'cyril.onih@gmail.com',
    'aderinoyedarasimi2@gmail.com',
    'deleodefunsho@gmail.com',
    'chiomasalewa@gmail.com',
    'oluwatobiadeyemo@gmail.com',
    'obajiuroro@gmail.com',
    'gworkings07@gmail.com',
    'salako956@gmail.com',
    'adeyemoolalekan.a@gmail.com',
    'sola.latunji@gmail.com',
    'mosesoridedi@yahoo.com',
    'odeyemitolu@gmail.com',
    'akpan.idorenyin@gmail.com',
    'writetracyolisa@gmail.com',
    'gaziem@gmail.com',
    'adeolabamiji1@gmail.com',
    'adeolaoluseyi579@gmail.com',
    'sijigangan@yahoo.com',
    'wealsegun@gmail.com',
    'kristyogunwale93@gmail.com',
    'olafabtech@gmail.com',
];

const useRole = () => {
    const dispatch = useAppDispatch();
    const storedUser = useAppSelector(userSelectors.selectCurrentUser);
    const {
        data: latestUser,
        refetch,
        isFetching,
    } = useGetUserByIdQuery(storedUser?.userId as string, {
        skip: !storedUser?.userId,
        refetchOnMountOrArgChange: false,
    });
    const currentUser = latestUser ?? storedUser;

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
        (async () => {
            if (!currentUser?.userId) {
                await logOut();
            }
        })();
    }, []);

    React.useEffect(() => {
        if (latestUser) {
            dispatch(userActions.updateSession(latestUser));
        }
    }, [latestUser]);

    const isAlphaTester = React.useMemo(
        () => (currentUser?.email ? ROAST_ALPHA_TESTERS.includes(currentUser?.email) : null),
        [currentUser?.email]
    );

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

        role: roleName,

        // Roles
        isHOD: roleName === ROLES.HOD,
        isAHOD: roleName === ROLES.AHOD,
        isAdmin: roleName === ROLES.admin,
        isWorker: roleName === ROLES.worker || roleName === ROLES.zonalCoordinator,
        isZonalCoordinator: roleName === ROLES.zonalCoordinator,
        isGroupHead: roleName === ROLES.groupHead,
        isSuperAdmin: roleName === ROLES.superAdmin,
        isGlobalPastor: roleName === ROLES.globalPastor,
        isGSP: roleName === ROLES.globalPastor,
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
        isWitty: departmentName === DEPARTMENTS.witty,
        isInternship: departmentName === DEPARTMENTS.internship || departmentName === 'Internship',
        isWelfare: departmentName === DEPARTMENTS.welfare,
        isProtocol: departmentName === DEPARTMENTS.protocol,
        isQC: departmentName === DEPARTMENTS.QC || departmentName === DEPARTMENTS.ME,

        // Role Creation
        rolesPermittedToCreate,

        // Alpha Testers
        isAlphaTester,
    };
};

export default useRole;
