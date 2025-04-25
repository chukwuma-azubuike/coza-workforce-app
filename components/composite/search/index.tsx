import { Text } from '~/components/ui/text';
import React from 'react';
import { FloatButton } from '@components/atoms/button';
import { IPermission, ITicket, IUser } from '@store/types';
import { Alert, ListRenderItemInfo, View, FlatList, TouchableOpacity } from 'react-native';
import AvatarComponent from '@components/atoms/avatar';
import StatusTag from '@components/atoms/status-tag';
import Utils from '@utils/index';
import dynamicSearch from '@utils/dynamicSearch';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import useAppColorMode from '@hooks/theme/colorMode';
import debounce from 'lodash/debounce';
import ModalComponent from '../modal';
import { THEME_CONFIG } from '@config/appConfig';
import Loading from '@components/atoms/loading';
import { Input } from '~/components/ui/input';

interface IUseSearchProps<D> {
    data?: Array<D>;
    loading?: boolean;
    disable?: boolean;
    searchFields: Array<string>;
    onPress: (params: IUser) => void;
}

function DynamicSearch<D extends Partial<IUser> | Partial<ITicket> | Partial<IPermission>>(props: IUseSearchProps<D>) {
    const { data, searchFields, onPress, loading, disable } = props;
    const [openSearchBar, setSearchBar] = React.useState<boolean>(false);
    const [searchText, setSearchText] = React.useState<string>('');
    const [searchResults, setSearchResults] = React.useState<Array<D> | undefined>(data);
    const inputRef = React.useRef();

    const handleSearchBar = () => {
        if (typeof data === 'undefined' && !loading) {
            Alert.alert('Select a campus', 'Please select a campus to proceed with your search');
            return;
        }
        setSearchBar(true);
    };

    const handlePress = (id: IUser) => () => {
        onPress(id);
        setSearchBar(false);
    };

    const handleCancel = () => {
        setSearchBar(false);
    };

    const handleTextChange = React.useCallback(
        debounce((searchText: string) => {
            setSearchText(searchText);
            if (!!searchText) {
                setSearchResults(dynamicSearch({ data, searchText, searchFields }));
            }
            if (searchText === '') {
                setSearchResults(data);
            }
        }, 500),
        [data, searchFields]
    );

    const sortedSearchResults = React.useMemo(() => {
        return Utils.sortStringAscending(searchText === '' ? data : searchResults, 'firstName');
    }, [data, searchResults, searchText]);

    const { textColor, backgroundColor } = useAppColorMode();

    return (
        <>
            <ModalComponent
                isOpen={openSearchBar}
                onClose={handleCancel}
                header={
                    <Input
                        autoFocus
                        // ref={inputRef} TODO: TBD

                        clearButtonMode="always"
                        leftIcon={{
                            name: 'search1',
                            type: 'antdesign',
                        }}
                        className="flex-1"
                        onChangeText={handleTextChange}
                        style={{
                            flex: 1,
                            height: 40,
                            padding: 0,
                            fontSize: 18,
                            paddingTop: 0,
                            color: textColor,
                            paddingVertical: 0,
                        }}
                        placeholder="Search"
                    />
                }
            >
                <FlatList
                    data={sortedSearchResults}
                    ListEmptyComponent={
                        <View style={{ padding: 16 }}>
                            <Text
                                numberOfLines={1}
                                lineBreakMode="tail"
                                ellipsizeMode="tail"
                                className="text-18 w-100% text-center"
                            >
                                No data found
                            </Text>
                        </View>
                    }
                    keyExtractor={item => item?._id}
                    getItemLayout={(data, index) => ({
                        length: 80,
                        offset: 80 * index,
                        index,
                    })}
                    windowSize={20}
                    initialNumToRender={20}
                    removeClippedSubviews={true}
                    style={{ backgroundColor: backgroundColor, marginBottom: 36 }}
                    renderItem={({ item: elm, index: key }: ListRenderItemInfo<any>) => {
                        return loading ? (
                            <Loading style={{ paddingVertical: 44 }} />
                        ) : (
                            <TouchableOpacity
                                key={key}
                                delayPressIn={0}
                                activeOpacity={0.6}
                                onPress={handlePress(elm as any)}
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    borderBottomWidth: 1,
                                    paddingHorizontal: 10,
                                    borderBottomColor: THEME_CONFIG.transparentGray,
                                }}
                            >
                                <View>
                                    <View className="gap-12">
                                        <AvatarComponent
                                            alt="avatar"
                                            className="w-8 h-8"
                                            imageUrl={elm?.pictureUrl || elm?.user?.pictureUrl || AVATAR_FALLBACK_URL}
                                        />
                                        <View>
                                            <Text
                                                numberOfLines={1}
                                                lineBreakMode="tail"
                                                ellipsizeMode="tail"
                                                className="text-18 font-bold"
                                            >
                                                {`${Utils.capitalizeFirstChar(
                                                    elm?.firstName || elm?.user?.firstName
                                                )} ${Utils.capitalizeFirstChar(elm?.lastName || elm?.user?.lastName)}`}
                                            </Text>
                                            <Text
                                                numberOfLines={1}
                                                lineBreakMode="tail"
                                                ellipsizeMode="tail"
                                                className="text-16"
                                            >
                                                {elm?.departmentName}
                                            </Text>
                                            <Text
                                                numberOfLines={1}
                                                lineBreakMode="tail"
                                                ellipsizeMode="tail"
                                                className="text-14"
                                            >
                                                {elm?.categoryName || elm?.email || elm?.user?.email}
                                            </Text>
                                        </View>
                                    </View>
                                    <StatusTag>
                                        {elm?.status || ((elm?.gender === 'M' ? 'Male' : 'Female') as any)}
                                    </StatusTag>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            </ModalComponent>
            <FloatButton
                iconName="search1"
                iconType="ant-design"
                onPress={handleSearchBar}
                className="bottom-16 shadow-md !rounded-full"
            />
        </>
    );
}

export default React.memo(DynamicSearch);
