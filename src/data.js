const BASE_URL = 'https://webinars.webdev.education-services.ru/sp7-api';

// Кеш для индексов
let sellers = null;
let customers = null;

// Кеш для результатов запросов
let lastResult = null;
let lastQuery = null;

// Мок-данные на случай ошибки
const mockSellers = {
    "seller_1": "Alexey Petrov",
    "seller_2": "Mikhail Nikolaev",
    "seller_3": "Ivan Petrov",
    "seller_4": "Petr Alekseev",
    "seller_5": "Nikolai Ivanov"
};

const mockCustomers = {
    "customer_1": "Andrey Alekseev",
    "customer_2": "Petr Smirnov",
    "customer_3": "Sergey Andreev",
    "customer_4": "Petr Sidorov",
    "customer_5": "Ivan Volkov",
    "customer_6": "Oleg Petrov",
    "customer_7": "Alexey Petrov",
    "customer_8": "Andrey Volkov",
    "customer_9": "Oleg Alekseev",
    "customer_10": "Vladimir Fedorov"
};

// Функция для преобразования записей в нужный формат
const mapRecords = (data) => {
    if (!sellers || !customers) {
        return data.map(item => ({
            id: item.receipt_id,
            date: item.date,
            seller: `Продавец ${item.seller_id}`,
            customer: `Покупатель ${item.customer_id}`,
            total: item.total_amount
        }));
    }
    
    return data.map(item => ({
        id: item.receipt_id,
        date: item.date,
        seller: sellers[item.seller_id] || `Продавец ${item.seller_id}`,
        customer: customers[item.customer_id] || `Покупатель ${item.customer_id}`,
        total: item.total_amount
    }));
};

// Функция получения индексов с сервера
const getIndexes = async () => {
    if (!sellers || !customers) {
        try {
            console.log('🔄 Загружаем индексы с сервера...');
            
            [sellers, customers] = await Promise.all([
                fetch(`${BASE_URL}/sellers`).then(res => {
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    return res.json();
                }),
                fetch(`${BASE_URL}/customers`).then(res => {
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    return res.json();
                })
            ]);
            
            console.log('✅ Индексы загружены с сервера');
            console.log('👤 Продавцов:', Object.keys(sellers).length);
            console.log('👥 Покупателей:', Object.keys(customers).length);
            
        } catch (error) {
            console.error('⚠️ Ошибка загрузки индексов, используем мок-данные:', error);
            sellers = mockSellers;
            customers = mockCustomers;
        }
    }
    
    return { sellers, customers };
};

// Функция получения записей с сервера
const getRecords = async (query = {}, isUpdated = false) => {
    const qs = new URLSearchParams(query);
    const nextQuery = qs.toString();
    
    if (lastQuery === nextQuery && !isUpdated && lastResult) {
        console.log('📦 Возвращаем из кеша');
        return lastResult;
    }
    
    try {
        const url = `${BASE_URL}/records${nextQuery ? '?' + nextQuery : ''}`;
        console.log('🚀 Запрос к серверу:', url);
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const records = await response.json();
        console.log(`✅ Получено записей: ${records.total}`);
        
        lastQuery = nextQuery;
        lastResult = {
            total: records.total,
            items: mapRecords(records.items)
        };
        
        return lastResult;
    } catch (error) {
        console.error('⚠️ Ошибка загрузки записей:', error);
        return {
            total: 0,
            items: []
        };
    }
};

export function initData() {
    return {
        getIndexes,
        getRecords
    };
}