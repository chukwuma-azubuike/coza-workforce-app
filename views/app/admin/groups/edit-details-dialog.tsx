import React, { useEffect, useState } from 'react';
import { Alert, View } from 'react-native';

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '~/components/ui/dialog';
import { Text } from '~/components/ui/text';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { useUpdateGroupMutation } from '@store/services/group';
import { extractApiError } from '@utils/index';

interface IProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groupId: string;
    initialName: string;
    initialDescription?: string;
    onSaved?: () => void;
}

const EditGroupDetailsDialog: React.FC<IProps> = ({
    open,
    onOpenChange,
    groupId,
    initialName,
    initialDescription,
    onSaved,
}) => {
    const [name, setName] = useState(initialName);
    const [description, setDescription] = useState(initialDescription ?? '');
    const [updateGroup, { isLoading }] = useUpdateGroupMutation();

    useEffect(() => {
        if (open) {
            setName(initialName);
            setDescription(initialDescription ?? '');
        }
    }, [open, initialName, initialDescription]);

    const trimmed = name.trim();
    const dirty = trimmed !== initialName.trim() || description.trim() !== (initialDescription ?? '').trim();
    const canSave = trimmed.length >= 2 && dirty;

    const handleSave = async () => {
        if (!canSave) return;
        try {
            await updateGroup({
                id: groupId,
                name: trimmed,
                description: description.trim() || undefined,
            }).unwrap();
            onSaved?.();
            onOpenChange(false);
        } catch (err) {
            Alert.alert('Error', extractApiError(err, 'Could not update group. Please try again.'));
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[90%] max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit group details</DialogTitle>
                </DialogHeader>

                <View className="gap-3">
                    <View className="gap-1.5">
                        <Text className="!text-[12px] text-muted-foreground font-medium">Group name *</Text>
                        <Input
                            value={name}
                            onChangeText={setName}
                            placeholder="e.g. Worship Cluster"
                            autoCapitalize="words"
                        />
                    </View>
                    <View className="gap-1.5">
                        <Text className="!text-[12px] text-muted-foreground font-medium">Description</Text>
                        <Input
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Brief description (optional)"
                            multiline
                            numberOfLines={3}
                            style={{ minHeight: 72, textAlignVertical: 'top', paddingTop: 10 }}
                        />
                    </View>
                </View>

                <DialogFooter>
                    <View className="flex-row gap-2 justify-end">
                        <Button variant="outline" size="sm" onPress={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button size="sm" onPress={handleSave} disabled={!canSave} isLoading={isLoading}>
                            Save
                        </Button>
                    </View>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditGroupDetailsDialog;
