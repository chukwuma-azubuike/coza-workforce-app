interface IDynamicSearch {
    data?: Array<any>;
    searchText: string;
    searchFields: Array<string>;
}

const dynamicSearch = ({ data = [], searchText, searchFields }: IDynamicSearch) => {
    const filtered = data?.filter(item => {
        const searchTermLower = searchText?.toLowerCase();

        // Search by multiple fields
        const itemText = searchFields?.map(field => item[field]?.toLowerCase())?.join(' ');

        return itemText?.includes(searchTermLower);
    });

    return filtered;
};

export default dynamicSearch;
