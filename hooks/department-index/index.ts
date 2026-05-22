import { useMemo } from 'react';
import { useGetDepartmentsQuery } from '@store/services/department';

export type DepartmentIndex = Record<string, string>;

const useDepartmentIndex = (): DepartmentIndex => {
    const { data: departments } = useGetDepartmentsQuery();

    return useMemo(() => {
        const index: DepartmentIndex = {};
        (departments ?? []).forEach(d => {
            if (d?._id) index[d._id] = d.departmentName;
        });
        return index;
    }, [departments]);
};

export default useDepartmentIndex;
