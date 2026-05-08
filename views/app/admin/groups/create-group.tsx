import React, { memo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';

import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { useGetCampusesQuery } from '@store/services/campus';
import { useCreateGroupMutation, ICreateGroupPayload } from '@store/services/group';

interface CampusOption {
    _id: string;
    campusName: string;
}

const SectionLabel: React.FC<{ children: string }> = ({ children }) => (
    <Text className="!text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{children}</Text>
);

const AdminCreateGroup: React.FC = () => {
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCampusId, setSelectedCampusId] = useState<string | null>(null);

    const { data: campuses = [] } = useGetCampusesQuery();
    const [createGroup, { isLoading }] = useCreateGroupMutation();

    const autoSlug = (text: string) =>
        text
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

    const handleNameChange = (text: string) => {
        setName(text);
        setSlug(autoSlug(text));
    };

    const canSubmit = name.trim().length >= 2 && slug.trim().length >= 2 && !!selectedCampusId;

    const handleCreate = async () => {
        if (!canSubmit) return;
        const payload: ICreateGroupPayload = {
            name: name.trim(),
            slug: slug.trim(),
            campusId: selectedCampusId as string,
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
                    {/* Basic info */}
                    <Card className="p-4 gap-3">
                        <SectionLabel>Basic info</SectionLabel>
                        <View className="gap-1.5">
                            <Text className="!text-[12px] text-muted-foreground font-medium">Group name *</Text>
                            <Input
                                placeholder="e.g. Worship Cluster"
                                value={name}
                                onChangeText={handleNameChange}
                                autoCapitalize="words"
                            />
                        </View>
                        <View className="gap-1.5">
                            <Text className="!text-[12px] text-muted-foreground font-medium">Slug *</Text>
                            <Input
                                placeholder="e.g. worship-cluster"
                                value={slug}
                                onChangeText={setSlug}
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                            <Text className="!text-[11px] text-muted-foreground">
                                Auto-generated from name. Used in URLs.
                            </Text>
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

                    {/* Campus selection */}
                    <Card className="p-4 gap-3">
                        <SectionLabel>Campus *</SectionLabel>
                        {campuses.length === 0 ? (
                            <Text className="!text-sm text-muted-foreground">Loading campuses…</Text>
                        ) : (
                            <View className="gap-2">
                                {(campuses as CampusOption[]).map(campus => {
                                    const isSelected = selectedCampusId === campus._id;
                                    return (
                                        <Button
                                            key={campus._id}
                                            variant={isSelected ? 'default' : 'outline'}
                                            size="sm"
                                            onPress={() => setSelectedCampusId(campus._id)}
                                            className="justify-start"
                                        >
                                            {campus.campusName}
                                        </Button>
                                    );
                                })}
                            </View>
                        )}
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
