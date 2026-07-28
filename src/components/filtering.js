export function initFiltering(elements) {
    const updateIndexes = (elements, indexes) => {
        Object.keys(indexes).forEach((elementName) => {
            const select = elements[elementName];
            if (!select) return;
            
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            const values = Object.values(indexes[elementName]);
            values.forEach(value => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = value;
                select.appendChild(option);
            });
        });
    };

    const applyFiltering = (query, state, action) => {
        // Обрабатываем очистку полей
        if (action && action.name === 'clear') {
            const parent = action.closest('.filter-wrapper');
            if (parent) {
                const input = parent.querySelector('input');
                if (input) {
                    input.value = '';
                    const fieldName = input.name;
                    if (fieldName && state) {
                        state[fieldName] = '';
                    }
                }
            }
        }

        const filter = {};
        
        Object.keys(elements).forEach(key => {
            const element = elements[key];
            if (!element) return;
            
            if (['INPUT', 'SELECT'].includes(element.tagName) && element.value && element.value.trim() !== '') {
                if (element.tagName === 'SELECT' && element.options[0] && element.value === element.options[0].value) {
                    return;
                }
                
                const fieldName = element.name;
                const value = element.value.trim();
                
                // ДЛЯ ДАТЫ
                if (fieldName === 'date') {
                    if (/^\d{4}$/.test(value)) {
                        filter[`filter[date_from]`] = `${value}-01-01`;
                        filter[`filter[date_to]`] = `${value}-12-31`;
                    } else if (/^\d{4}-\d{2}$/.test(value)) {
                        const [year, month] = value.split('-');
                        const lastDay = new Date(year, month, 0).getDate();
                        filter[`filter[date_from]`] = `${year}-${month}-01`;
                        filter[`filter[date_to]`] = `${year}-${month}-${lastDay}`;
                    } else {
                        filter[`filter[date]`] = value;
                    }
                    return;
                }
                
                // ДЛЯ СУММЫ (total from/to) - ПРОБУЕМ ДРУГОЙ ФОРМАТ
                if (fieldName === 'totalFrom') {
                    filter[`total_min`] = value;  // пробуем total_min
                    return;
                }
                if (fieldName === 'totalTo') {
                    filter[`total_max`] = value;  // пробуем total_max
                    return;
                }
                
                // ДЛЯ ОСТАЛЬНЫХ ПОЛЕЙ
                filter[`filter[${fieldName}]`] = value;
            }
        });

        console.log('📤 Отправляем фильтры:', filter);

        return Object.keys(filter).length ? Object.assign({}, query, filter) : query;
    };

    return {
        updateIndexes,
        applyFiltering
    };
}