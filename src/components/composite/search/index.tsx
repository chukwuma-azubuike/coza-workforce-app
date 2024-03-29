import React from 'react';
import { FloatButton } from '@components/atoms/button';
import { InputComponent } from '@components/atoms/input';
import { IUser } from '@store/types';
import { HStack, IconButton, Modal, Text, VStack } from 'native-base';
import { Alert, KeyboardAvoidingView, ListRenderItemInfo, TouchableHighlight, View } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import StatusTag from '@components/atoms/status-tag';
import Utils from '@utils/index';
import dynamicSearch from '@utils/dynamicSearch';
import { FlatList } from 'react-native';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import useDevice from '@hooks/device';
import { Icon } from '@rneui/themed';
import useAppColorMode from '@hooks/theme/colorMode';
import { THEME_CONFIG } from '@config/appConfig';
import { ScreenHeight } from '@rneui/base';
import debounce from 'lodash/debounce';
import Loading from '@components/atoms/loading';

interface IUseSearchProps<D> {
    data?: Array<D>;
    loading?: boolean;
    disable?: boolean;
    searchFields: Array<string>;
    onPress: (params: IUser) => void;
}

function DynamicSearch<D = IUser>(props: IUseSearchProps<D>) {
    const { data, searchFields, onPress, loading, disable } = props;
    const [openSearchBar, setSearchBar] = React.useState<boolean>(false);
    const [searchResults, setSearchResults] = React.useState<Array<D> | undefined>(data);
    const [text, setText] = React.useState<string>('');

    const handleSearchBar = () => {
        if (typeof data === 'undefined' && !loading) {
            Alert.alert('Select a campus', 'Please select a campus to proceed with your search');
            return;
        }
        setSearchBar(true);
    };

    const handlePress = (id: IUser) => () => {
        setText('');
        onPress(id);
        setSearchBar(false);
    };

    const handleCancel = () => {
        setText('');
        setSearchBar(false);
    };

    const handleChange = React.useCallback(
        (searchText: string) => {
            setText(searchText);

            const fn = () => setSearchResults(dynamicSearch({ data, searchText, searchFields }));

            debounce(fn, 500)();
        },
        [data, searchFields]
    );

    const sortedSearchResults = React.useMemo(
        () => Utils.sortStringAscending(searchResults, 'firstName'),
        [searchResults]
    );

    const { isAndroidOrBelowIOSTenOrTab } = useDevice();
    const { isDarkMode } = useAppColorMode();

    return (
        <>
            <KeyboardAvoidingView enabled={openSearchBar}>
                <Modal isOpen={openSearchBar} width="100%" height="100%" animationPreset="slide">
                    <Modal.Content
                        w="94%"
                        position="absolute"
                        top={isAndroidOrBelowIOSTenOrTab ? 62 : 110}
                        _dark={{ opacity: 0.9 }}
                    >
                        <HStack justifyContent="space-between" alignItems="center" flex={1}>
                            <InputComponent
                                flex={1}
                                autoFocus
                                variant="outline"
                                clearButtonMode="always"
                                value={text}
                                onChangeText={handleChange}
                                placeholder={`Search by ${searchFields?.join(', ')}`}
                            />
                            <IconButton
                                p={0}
                                width={10}
                                height={10}
                                borderRadius="full"
                                alignItems="center"
                                onPress={handleCancel}
                                justifyContent="center"
                                icon={
                                    <Icon
                                        size={24}
                                        name="close"
                                        type="ant-design"
                                        color={isDarkMode ? 'white' : 'black'}
                                    />
                                }
                            />
                        </HStack>
                        <FlatList
                            data={sortedSearchResults}
                            ListEmptyComponent={
                                <Text textAlign="center" py={2}>
                                    {loading
                                        ? 'Loading...'
                                        : !!data?.length && !searchResults?.length
                                        ? 'No data found'
                                        : ''}
                                </Text>
                            }
                            keyExtractor={item => item?._id}
                            getItemLayout={(data, index) => ({
                                length: ScreenHeight / 10, // Assuming a constant item height
                                offset: (ScreenHeight / 10) * index,
                                index,
                            })}
                            windowSize={20}
                            initialNumToRender={20}
                            removeClippedSubviews={true}
                            renderItem={({ item: elm, index: key, separators }: ListRenderItemInfo<any>) => {
                                return loading ? (
                                    <Text textAlign="center" py={2}>
                                        Loading...
                                    </Text>
                                ) : (
                                    <TouchableHighlight
                                        key={key}
                                        delayPressIn={0}
                                        activeOpacity={0.2}
                                        style={{ flex: 1 }}
                                        onPress={handlePress(elm as any)}
                                        onShowUnderlay={separators.highlight}
                                        onHideUnderlay={separators.unhighlight}
                                        underlayColor={
                                            isDarkMode ? THEME_CONFIG.darkGray : THEME_CONFIG.transparentGray
                                        }
                                    >
                                        <HStack
                                            py={2}
                                            px={3}
                                            flex={1}
                                            w="full"
                                            alignItems="center"
                                            justifyContent="space-between"
                                        >
                                            <HStack space={3} alignItems="center" flex={1}>
                                                <AvatarComponent imageUrl={elm?.pictureUrl || AVATAR_FALLBACK_URL} />
                                                <VStack justifyContent="space-between" flex={1}>
                                                    <Text
                                                        _dark={{ color: 'gray.200' }}
                                                        _light={{ color: 'gray.800' }}
                                                        fontSize="md"
                                                        bold
                                                        noOfLines={1}
                                                        ellipsizeMode="tail"
                                                    >
                                                        {`${Utils.capitalizeFirstChar(
                                                            elm?.firstName
                                                        )} ${Utils.capitalizeFirstChar(elm?.lastName)}`}
                                                    </Text>
                                                    <Text
                                                        _dark={{ color: 'gray.300' }}
                                                        _light={{ color: 'gray.700' }}
                                                        fontSize="sm"
                                                        noOfLines={1}
                                                        ellipsizeMode="tail"
                                                    >
                                                        {elm?.departmentName}
                                                    </Text>
                                                    <Text
                                                        _dark={{ color: 'gray.300' }}
                                                        _light={{ color: 'gray.700' }}
                                                        fontSize="sm"
                                                        noOfLines={1}
                                                        ellipsizeMode="tail"
                                                    >
                                                        {elm?.email}
                                                    </Text>
                                                </VStack>
                                            </HStack>
                                            <StatusTag>{(elm?.gender === 'M' ? 'Male' : 'Female') as any}</StatusTag>
                                        </HStack>
                                    </TouchableHighlight>
                                );
                            }}
                        />
                    </Modal.Content>
                </Modal>
            </KeyboardAvoidingView>

            <FloatButton buttom={16} iconName="search1" iconType="ant-design" onPress={handleSearchBar} />
        </>
    );
}

export default DynamicSearch;
