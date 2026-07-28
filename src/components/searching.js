export function initSearching(searchField) {
    return (query, state, action) => {
        const searchText = state[searchField];
        
        if (!searchText || searchText.trim() === '') {
            return query;
        }
        
        return Object.assign({}, query, {
            search: searchText.trim()
        });
    };
}