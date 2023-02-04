import React from 'react';
import { Box, FormControl, HStack, VStack } from 'native-base';
import ViewWrapper from '../../../components/layout/viewWrapper';
import ButtonComponent from '../../../components/atoms/button';
import TextAreaComponent from '../../../components/atoms/text-area';
import {
    SelectComponent,
    SelectItemComponent,
} from '../../../components/atoms/select';
import { DateTimePickerComponent } from '../../../components/composite/date-picker';
import useModal from '../../../hooks/modal/useModal';
import { useNavigation } from '@react-navigation/native';
import { ItemValue } from '@react-native-picker/picker/typings/Picker';

const RequestPermission: React.FC = () => {
    const [icon, setIcon] = React.useState<{ name: string; type: string }>({
        type: 'ionicon',
        name: 'briefcase-outline',
    });

    const { goBack } = useNavigation();

    const [loading, setLoading] = React.useState<boolean>(false); //Just for 3P testing
    const [selectedValue, setSelectedValue] = React.useState<ItemValue>('work');

    const selectCategoryIcons = (key: string) => {
        setSelectedValue(key);
        switch (key) {
            case 'work':
                setIcon({
                    type: 'ionicon',
                    name: 'briefcase-outline',
                });
                break;
            case 'education':
                setIcon({
                    type: 'ionicon',
                    name: 'school-outline',
                });
                break;
            case 'medical':
                setIcon({
                    type: 'ionicon',
                    name: 'medical-outline',
                });
                break;
            case 'vacation':
                setIcon({
                    type: 'material-community',
                    name: 'beach',
                });
                break;
            case 'maternity':
                setIcon({
                    type: 'material-community',
                    name: 'mother-nurse',
                });
                break;
            case 'other':
                setIcon({
                    type: 'font-awesome',
                    name: 'sticky-note-o',
                });
                break;
            default:
                break;
        }
    };

    const { setModalState } = useModal();

    const handleSubmit = () => {
        setLoading(true);
    };

    React.useEffect(() => {
        if (loading) {
            setTimeout(() => {
                setLoading(false);
                setModalState({
                    message: 'Your request has been sent',
                    defaultRender: true,
                    status: 'success',
                });
                goBack();
            }, 2000);
        }
    }, [loading]);

    return (
        <ViewWrapper>
            <>
                <VStack space="lg" alignItems="flex-start" w="100%" px={4}>
                    <Box alignItems="center" w="100%">
                        <FormControl>
                            <VStack w="100%" space={1}>
                                <HStack justifyContent="space-between">
                                    <DateTimePickerComponent
                                        label="Start date"
                                        minimumDate={new Date()}
                                    />
                                    <DateTimePickerComponent
                                        label="End date"
                                        minimumDate={new Date()}
                                    />
                                </HStack>
                                <FormControl.Label>Category</FormControl.Label>
                                <SelectComponent
                                    selectedValue={selectedValue}
                                    onValueChange={value =>
                                        setSelectedValue(value as string)
                                    }
                                >
                                    <SelectItemComponent
                                        label="Medical"
                                        value="medical"
                                        icon={{
                                            type: 'antdesign',
                                            name: 'medicinebox',
                                        }}
                                    />
                                    <SelectItemComponent
                                        label="Education"
                                        value="education"
                                        icon={{
                                            type: 'ionicon',
                                            name: 'school-outline',
                                        }}
                                    />
                                    <SelectItemComponent
                                        label="Work"
                                        value="work"
                                        icon={{
                                            type: 'ionicon',
                                            name: 'briefcase-outline',
                                        }}
                                    />
                                    <SelectItemComponent
                                        label="Maternity"
                                        value="maternity"
                                        icon={{
                                            type: 'material-community',
                                            name: 'mother-nurse',
                                        }}
                                    />
                                    <SelectItemComponent
                                        label="Vacation"
                                        value="vacation"
                                        icon={{
                                            type: 'material-community',
                                            name: 'beach',
                                        }}
                                    />
                                    <SelectItemComponent
                                        label="Other"
                                        value="other"
                                        icon={{
                                            type: 'material-community',
                                            name: 'beach',
                                        }}
                                    />
                                </SelectComponent>
                                <FormControl.Label>
                                    Description
                                </FormControl.Label>
                                <TextAreaComponent
                                    placeholder="Brief description"
                                    isRequired
                                />
                                <ButtonComponent
                                    mt={4}
                                    isLoading={loading}
                                    onPress={handleSubmit}
                                >
                                    Submit for Approval
                                </ButtonComponent>
                            </VStack>
                        </FormControl>
                    </Box>
                </VStack>
            </>
        </ViewWrapper>
    );
};

export default RequestPermission;
