import { UserCheck, X } from 'lucide-react-native';
import { Button } from '~/components/ui/button';
import { IUser } from '~/store/types';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import PickerSelect from '~/components/ui/picker-select';

interface BulkActionsProps {
    bulkReassignMode: boolean;
    selectedGuests: string[];
    workers: IUser[];
    onBulkReassignStart: () => void;
    onBulkReassignCancel: () => void;
    onWorkerSelect: (workerId: string) => void;
}

export function BulkActions({
    bulkReassignMode,
    selectedGuests,
    workers,
    onBulkReassignStart,
    onBulkReassignCancel,
    onWorkerSelect,
}: BulkActionsProps) {
    if (!bulkReassignMode) {
        return (
            <Button variant="outline" size='sm' className='!h-10' icon={<UserCheck className="w-4 h-4" />} onPress={onBulkReassignStart}>
                Bulk Reassign
            </Button>
        );
    }

    return (
        <View className="flex-row items-center gap-2">
            <Text className="text-muted-foreground">{selectedGuests.length} selected</Text>
            <PickerSelect
                valueKey="_id"
                items={workers}
                labelKey="firstName"
                // value={stageFilter}
                className="!w-44 !h-10"
                placeholder="Select stage"
                onValueChange={onWorkerSelect}
                customLabel={user => `${user?.firstName} ${user.lastName}`}
            />
            <Button variant="outline" className="!h-10 w-12" size="sm" onPress={onBulkReassignCancel}>
                <X className="w-4 h-4" />
            </Button>
        </View>
    );
}
