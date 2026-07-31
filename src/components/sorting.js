import { sortMap } from "../lib/sort.js";

export function initSorting(columns) {
    return (query, state, action) => {
        let field = null;
        let order = null;

        if (action && action.name === 'sort') {
            const currentValue = action.dataset.value || 'none';
            const newValue = sortMap[currentValue] || 'up';
            action.dataset.value = newValue;
            
            field = action.dataset.field;
            order = newValue;

            columns.forEach(column => {
                if (column.dataset.field !== action.dataset.field) {
                    column.dataset.value = 'none';
                }
            });
        } else {
            columns.forEach(column => {
                if (column.dataset.value && column.dataset.value !== 'none') {
                    field = column.dataset.field;
                    order = column.dataset.value;
                }
            });
        }

        columns.forEach(column => {
            const fieldName = column.dataset.field;
            let text = column.textContent.replace(/[↑↓]/g, '').trim();
            
            if (fieldName === field && order && order !== 'none') {
                const arrow = order === 'up' ? ' ↑' : ' ↓';
                text += arrow;
            }
            column.textContent = text;
        });

        if (field && order && order !== 'none') {
            const serverField = field === 'total' ? 'total' : field;
            return Object.assign({}, query, {
                sort: `${serverField}:${order}`
            });
        }

        return query;
    };
}