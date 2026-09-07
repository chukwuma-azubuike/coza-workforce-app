import { useGetGroupForCurrentUserQuery } from '@store/services/group';
import useRole from '@hooks/role';

export interface ICanActRecord {
    department?: { groupId?: string };
    departmentId?: string;
}

const useGroup = () => {
    const { user, isGroupHead } = useRole();
    const groupId = user?.groupId;

    const {
        data: group,
        isLoading,
        isError,
        refetch,
    } = useGetGroupForCurrentUserQuery(undefined, {
        skip: !isGroupHead || !groupId,
    });

    const departments = group?.departments ?? [];
    const groupHeads = group?.groupHeads ?? [];

    const departmentIds = new Set(departments.map(d => d._id));

    const canAct = (record: ICanActRecord): boolean => {
        if (!isGroupHead || !groupId) return false;
        const recGroupId = record.department?.groupId;
        if (recGroupId) return recGroupId === groupId;
        // fallback: check if department is in our Group
        const recDeptId = record.department?._id ?? record.departmentId;
        return recDeptId ? departmentIds.has(recDeptId) : false;
    };

    const hasGroup = !!groupId;
    const isFirstTimeGH = isGroupHead && !groupId;

    return {
        groupId,
        group,
        departments,
        groupHeads,
        hasGroup,
        isFirstTimeGH,
        isLoading,
        isError,
        refetch,
        canAct,
    };
};

export default useGroup;
