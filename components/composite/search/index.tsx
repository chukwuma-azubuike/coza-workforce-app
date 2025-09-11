import React, { useCallback, useMemo } from 'react';
import { Alert, ListRenderItemInfo, TouchableOpacity, View } from 'react-native';
import debounce from 'lodash/debounce';
import Loading from '@components/atoms/loading';
import { THEME_CONFIG } from '@config/appConfig';
import dynamicSearch from '@utils/dynamicSearch';
import { IPermission, ITicket, IUser } from '@store/types';
import useAppColorMode from '@hooks/theme/colorMode';
import { Text } from '~/components/ui/text';
import AvatarComponent from '@components/atoms/avatar';
import { AVATAR_FALLBACK_URL } from '@constants/index';
import StatusTag from '@components/atoms/status-tag';
import Utils from '@utils/index';
import { FlatList } from 'react-native';
import { FloatButton } from '@components/atoms/button';
import { cn } from '~/lib/utils';
import ModalComponent from '../modal';
import { Input } from '~/components/ui/input';

interface IUseSearchProps<D> {
    data?: Array<D>;
    loading?: boolean;
    disable?: boolean;
    className?: string;
    searchFields: Array<string>;
    onPress: (params: IUser) => void;
}

// Separate SearchResult component for better performance
const SearchResult = React.memo(({ item, onPress, backgroundColor }: any) => {
    const handlePress = useCallback(() => {
        onPress(item);
    }, [item, onPress]);

    return (
        <TouchableOpacity
            delayPressIn={0}
            activeOpacity={0.6}
            onPress={handlePress}
            style={{
                flex: 1,
                paddingVertical: 10,
                borderBottomWidth: 1,
                paddingHorizontal: 10,
                borderBottomColor: THEME_CONFIG.transparentGray,
                backgroundColor,
            }}
        >
            <View className="flex-row gap-6 justify-between">
                <View className="gap-6 flex-row items-center flex-1">
                    <AvatarComponent
                        alt="avatar"
                        className="w-20 h-20"
                        imageUrl={item?.pictureUrl || item?.user?.pictureUrl || AVATAR_FALLBACK_URL}
                    />
                    <View className="flex-1">
                        <Text className="text-18 font-bold text-foreground">
                            {`${Utils.capitalizeFirstChar(
                                item?.firstName || item?.user?.firstName
                            )} ${Utils.capitalizeFirstChar(item?.lastName || item?.user?.lastName)}`}
                        </Text>
                        <Text className="text-16 text-muted-foreground">{item?.departmentName}</Text>
                        <Text className="text-14 text-muted-foreground">
                            {item?.categoryName || item?.email || item?.user?.email}
                        </Text>
                    </View>
                </View>
                <View className="w-max">
                    <StatusTag>{item?.status || ((item?.gender === 'M' ? 'Male' : 'Female') as any)}</StatusTag>
                </View>
            </View>
        </TouchableOpacity>
    );
});

function DynamicSearch<D extends Partial<IUser> | Partial<ITicket> | Partial<IPermission>>(props: IUseSearchProps<D>) {
    const { data, searchFields, onPress, loading, className, disable } = props;
    const [openSearchBar, setSearchBar] = React.useState<boolean>(false);
    const [searchText, setSearchText] = React.useState<string>('');
    const [searchResults, setSearchResults] = React.useState<Array<D> | undefined>(data);

    const { backgroundColor } = useAppColorMode();

    const handleSearchBar = useCallback(() => {
        if (disable) return;

        if (typeof data === 'undefined' && !loading) {
            Alert.alert('Select a campus', 'Please select a campus to proceed with your search');
            return;
        }
        setSearchBar(true);
    }, [data, loading, disable]);

    const handleCancel = useCallback(() => {
        setSearchBar(false);
    }, []);

    // Memoize search function
    const performSearch = useMemo(
        () =>
            debounce((searchText: string) => {
                if (!!searchText) {
                    setSearchResults(dynamicSearch({ data, searchText, searchFields }));
                } else {
                    setSearchResults(data);
                }
            }, 300),
        [data, searchFields]
    );

    const handleTextChange = useCallback(
        (text: string) => {
            setSearchText(text);
            performSearch(text);
        },
        [performSearch]
    );

    // Cleanup debounce on unmount
    React.useEffect(() => {
        return () => {
            performSearch.cancel();
        };
    }, [performSearch]);

    const sortedSearchResults = useMemo(() => {
        return searchText === '' ? data : searchResults;
    }, [data, searchResults, searchText]);

    const renderItem = useCallback(
        ({ item }: ListRenderItemInfo<any>) => {
            const handlePress = () => {
                onPress(item);
                handleCancel();
            };
            return loading ? (
                <Loading style={{ paddingVertical: 44 }} />
            ) : (
                <SearchResult item={item} onPress={handlePress} backgroundColor={backgroundColor} />
            );
        },
        [loading, onPress, backgroundColor]
    );

    return (
        <>
            <ModalComponent
                isOpen={openSearchBar}
                onClose={handleCancel}
                header={
                    <Input
                        autoFocus
                        clearButtonMode="always"
                        placeholder="Search"
                        onChangeText={handleTextChange}
                        style={{
                            padding: 4,
                            borderWidth: 1,
                            borderColor: THEME_CONFIG.primaryLight,
                        }}
                    />
                }
                className={cn('w-full h-full pb-2', className)}
            >
                <View className="w-full">
                    <FlatList
                        data={sortedSearchResults}
                        renderItem={renderItem}
                        keyExtractor={(item: any) => item?._id?.toString()}
                        ListEmptyComponent={
                            <View style={{ padding: 16 }}>
                                <Text className="w-100% text-center text-muted-foreground">No data found</Text>
                            </View>
                        }
                        getItemLayout={(_, index) => ({
                            length: 80,
                            offset: 80 * index,
                            index,
                        })}
                        windowSize={5}
                        maxToRenderPerBatch={10}
                        initialNumToRender={10}
                        removeClippedSubviews={true}
                        style={{ backgroundColor: backgroundColor, marginBottom: 36 }}
                    />
                </View>
            </ModalComponent>
            <FloatButton
                iconName="search1"
                iconType="ant-design"
                onPress={handleSearchBar}
                className={cn('bottom-16 shadow-md !rounded-full', className)}
                disabled={disable}
            />
        </>
    );
}

export default React.memo(DynamicSearch);
