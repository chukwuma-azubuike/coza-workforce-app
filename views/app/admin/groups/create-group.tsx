import React, { memo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';

import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { useCreateGroupMutation } from '@store/services/group';

const SectionLabel: React.FC<{ children: string }> = ({ children }) => (
    <Text className="!text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{children}</Text>
);

const AdminCreateGroup: React.FC = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const [createGroup, { isLoading }] = useCreateGroupMutation();

    const canSubmit = name.trim().length >= 2;

    const handleCreate = async () => {
        if (!canSubmit) return;
        const payload = {
            name: name.trim(),
            ...(description.trim() ? { description: description.trim() } : {}),
        };
        try {
            await createGroup(payload).unwrap();
            Alert.alert('Group created', `"${payload.name}" has been created successfully.`, [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch {
            Alert.alert('Error', 'Could not create group. Please try again.');
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView className="flex-1 bg-background" keyboardShouldPersistTaps="handled">
                <View className="px-4 pt-4 pb-10 gap-4">
                    <Card className="p-4 gap-3">
                        <SectionLabel>Basic info</SectionLabel>
                        <View className="gap-1.5">
                            <Text className="!text-[12px] text-muted-foreground font-medium">Group name *</Text>
                            <Input
                                placeholder="e.g. Worship Cluster"
                                value={name}
                                onChangeText={setName}
                                autoCapitalize="words"
                            />
                        </View>
                        <View className="gap-1.5">
                            <Text className="!text-[12px] text-muted-foreground font-medium">Description</Text>
                            <Input
                                placeholder="Brief description (optional)"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={3}
                                style={{ minHeight: 72, textAlignVertical: 'top', paddingTop: 10 }}
                            />
                        </View>
                    </Card>

                    <Separator />

                    <Button
                        variant="default"
                        onPress={handleCreate}
                        disabled={!canSubmit}
                        isLoading={isLoading}
                    >
                        Create Group
                    </Button>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

export default memo(AdminCreateGroup);
