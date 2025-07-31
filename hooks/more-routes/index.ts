import { useMemo } from 'react';
import useRole, { DEPARTMENTS, ROLES } from '../role';
import { AppRoutes } from '~/config/navigation';

const useMoreRoutes = () => {
    const { user, isSuperAdmin, isCampusPastor, isCGWCApproved } = useRole();

    const roleName = user?.role?.name;
    const departmentName = user?.department?.departmentName;

    const filteredRoutes = useMemo(
        () =>
            AppRoutes.filter(route => {
                if (!route.inMore) {
                    return;
                }
                if (!isCGWCApproved && !isCampusPastor && !isSuperAdmin && route.name === 'Congress') {
                    return;
                }
                if (!route.users?.length) {
                    return route;
                }
                const rolesAndDepartments = route.users;

                if (
                    rolesAndDepartments.includes(roleName as ROLES) ||
                    rolesAndDepartments.includes(departmentName as DEPARTMENTS)
                ) {
                    return route;
                }
            }),
        [AppRoutes, isCGWCApproved, isSuperAdmin, roleName, departmentName]
    );

    return filteredRoutes;
};

export default useMoreRoutes;
