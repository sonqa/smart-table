import { cloneTemplate } from "../lib/utils.js";

export function initTable(settings, onAction) {
    const { tableTemplate, rowTemplate, before, after } = settings;
    const root = cloneTemplate(tableTemplate);

    if (before && before.length > 0) {
        [...before].reverse().forEach(subName => {
            root[subName] = cloneTemplate(subName);
            root.container.prepend(root[subName].container);
        });
    }

    if (after && after.length > 0) {
        after.forEach(subName => {
            root[subName] = cloneTemplate(subName);
            root.container.append(root[subName].container);
        });
    }

    root.container.addEventListener('change', function(e) {
        onAction();
    });

    root.container.addEventListener('input', function(e) {
        if (e.target && e.target.type === 'text' && e.target.name === 'search') {
            onAction();
        }
    });

    root.container.addEventListener('reset', function(e) {
        setTimeout(() => {
            onAction();
        }, 0);
    });

    root.container.addEventListener('submit', function(e) {
        e.preventDefault();
        onAction(e.submitter);
    });

    const render = (data) => {
        if (!data || !Array.isArray(data)) {
            console.warn('Нет данных для отображения');
            root.elements.rows.replaceChildren();
            return;
        }

        const nextRows = data.map(item => {
            const row = cloneTemplate(rowTemplate);
            
            Object.keys(item).forEach(key => {
                if (row.elements[key]) {
                    row.elements[key].textContent = item[key];
                }
            });
            
            return row.container;
        });
        
        root.elements.rows.replaceChildren(...nextRows);
    };

    return { ...root, render };
}