import './fonts/ys-display/fonts.css';
import './style.css';

import { initData } from "./data.js";
import { processFormData } from "./lib/utils.js";
import { initTable } from "./components/table.js";
import { initPagination } from "./components/pagination.js";
import { initSorting } from "./components/sorting.js";
import { initFiltering } from "./components/filtering.js";
import { initSearching } from "./components/searching.js";

// Инициализируем API
const api = initData();

// Создаем таблицу
const sampleTable = initTable({
    tableTemplate: 'table',
    rowTemplate: 'row',
    before: ['search', 'header', 'filter'],
    after: ['pagination']
}, render);

// Инициализация пагинации
const { applyPagination, updatePagination } = initPagination(
    sampleTable.pagination.elements,
    (el, page, isCurrent) => {
        const input = el.querySelector('input');
        const label = el.querySelector('span');
        input.value = page;
        input.checked = isCurrent;
        label.textContent = page;
        return el;
    }
);

// Инициализация сортировки
const applySorting = initSorting([
    sampleTable.header.elements.sortByDate,
    sampleTable.header.elements.sortByTotal
]);

// Инициализация фильтрации
const { applyFiltering, updateIndexes } = initFiltering(sampleTable.filter.elements);

// Инициализация поиска
const applySearching = initSearching('search');

/**
 * Сбор и обработка полей из таблицы
 * @returns {Object}
 */
function collectState() {
    const state = processFormData(new FormData(sampleTable.container));
    
    const rowsPerPage = parseInt(state.rowsPerPage) || 10;
    const page = parseInt(state.page) || 1;
    
    return {
        ...state,
        rowsPerPage,
        page: page
    };
}

/**
 * Перерисовка состояния таблицы при любых изменениях
 * @param {HTMLButtonElement?} action
 */
async function render(action) {
    let state = collectState();
    let query = {};
    
    // Применяем модули в правильном порядке:
    // 1. Сначала поиск
    query = applySearching(query, state, action);
    
    // 2. Потом фильтрация
    query = applyFiltering(query, state, action);
    
    // 3. Потом сортировка
    query = applySorting(query, state, action);
    
    // 4. И только потом пагинация
    query = applyPagination(query, state, action);

    console.log('🔍 Запрос к серверу:', query);

    const { total, items } = await api.getRecords(query);
    
    updatePagination(total, query);
    sampleTable.render(items);
}

// Обработчик для кнопки сброса
sampleTable.container.addEventListener('reset', function(e) {
    const inputs = sampleTable.container.querySelectorAll('input');
    const selects = sampleTable.container.querySelectorAll('select');
    
    inputs.forEach(input => {
        input.value = '';
    });
    
    selects.forEach(select => {
        select.selectedIndex = 0;
    });
    
    setTimeout(() => {
        render();
    }, 0);
});

// Инициализация приложения
async function init() {
    try {
        const indexes = await api.getIndexes();
        
        // Обновляем фильтры
        updateIndexes(sampleTable.filter.elements, {
            searchBySeller: indexes.sellers
        });
        
        console.log('✅ Приложение инициализировано');
    } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
    }
}

const appRoot = document.querySelector('#app');
appRoot.appendChild(sampleTable.container);

// Запускаем приложение
init().then(() => render());