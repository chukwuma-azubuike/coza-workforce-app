import { useGetRolesQuery } from '@store/services/role';

const useRoleName = (roleId: string) => {
    const { data: roles } = useGetRolesQuery();

    return roles?.find(role => role._id === roleId);
};

export default useRoleName;
