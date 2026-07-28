import { getPages } from "../lib/utils.js";

export const initPagination = ({ pages, fromRow, toRow, totalRows }, createPage) => {
    let pageCount = 0;

    const pageTemplate = pages.firstElementChild.cloneNode(true);
    pages.firstElementChild.remove();
    pages.innerHTML = '';

    const applyPagination = (query, state, action) => {
        const rowsPerPage = parseInt(state.rowsPerPage) || 10;
        let page = parseInt(state.page) || 1;

        if (action) {
            switch(action.name) {
                case 'prev':
                    page = Math.max(1, page - 1);
                    break;
                case 'next':
                    page = Math.min(pageCount, page + 1);
                    break;
                case 'first':
                    page = 1;
                    break;
                case 'last':
                    page = pageCount;
                    break;
            }
        }

        return Object.assign({}, query, {
            limit: rowsPerPage,
            page: page
        });
    };

    const updatePagination = (total, query) => {
        const rowsPerPage = parseInt(query.limit) || 10;
        const currentPage = parseInt(query.page) || 1;
        
        pageCount = Math.ceil(total / rowsPerPage) || 1;

        const visiblePages = getPages(currentPage, pageCount, 5);
        
        pages.replaceChildren(...visiblePages.map(pageNumber => {
            const el = pageTemplate.cloneNode(true);
            return createPage(el, pageNumber, pageNumber === currentPage);
        }));

        const startRow = (currentPage - 1) * rowsPerPage + 1;
        const endRow = Math.min(currentPage * rowsPerPage, total);
        
        fromRow.textContent = startRow;
        toRow.textContent = endRow;
        totalRows.textContent = total;

        const prevBtn = document.querySelector('[data-name="previousPage"]');
        const nextBtn = document.querySelector('[data-name="nextPage"]');
        const firstBtn = document.querySelector('[data-name="firstPage"]');
        const lastBtn = document.querySelector('[data-name="lastPage"]');

        if (prevBtn) prevBtn.disabled = currentPage <= 1;
        if (nextBtn) nextBtn.disabled = currentPage >= pageCount;
        if (firstBtn) firstBtn.disabled = currentPage <= 1;
        if (lastBtn) lastBtn.disabled = currentPage >= pageCount;

        const rowsPerPageSelect = document.querySelector('[name="rowsPerPage"]');
        if (rowsPerPageSelect) {
            rowsPerPageSelect.value = rowsPerPage;
        }
    };

    return {
        applyPagination,
        updatePagination
    };
};