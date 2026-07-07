// ============================================
// ОБЩИЕ ДАННЫЕ И ХРАНИЛИЩЕ
// ============================================

var DEFAULT_BUSINESSES = [
    {
        id: 'biz_seed_1',
        code: '12345',
        password: '123456',
        name: 'Стиль и точка',
        address: 'ул. Примерная, 10, Москва',
        phone: '+7 (999) 123-45-67',
        services: [
            { name: 'Мужская стрижка', price: 1500, duration: 30 },
            { name: 'Женская стрижка', price: 2500, duration: 60 },
            { name: 'Укладка', price: 2000, duration: 45 }
        ],
        masters: [
            {
                name: 'Анна',
                emoji: '👩',
                bio: 'Женские и мужские стрижки',
                photo: '',
                services: ['Мужская стрижка', 'Женская стрижка', 'Укладка'],
                workingHours: { start: '09:00', end: '18:00', days: [1, 2, 3, 4, 5, 6] }
            },
            {
                name: 'Дмитрий',
                emoji: '🧑',
                bio: 'Короткие стрижки и уход',
                photo: '',
                services: ['Мужская стрижка', 'Борода/усы'],
                workingHours: { start: '10:00', end: '20:00', days: [1, 2, 3, 4, 5, 6, 0] }
            }
        ],
        managerHours: { start: '09:00', end: '21:00', days: [1, 2, 3, 4, 5, 6, 0] },
        createdAt: '2026-07-04T00:00:00.000Z'
    },
    {
        id: 'biz_seed_2',
        code: '67890',
        password: '678900',
        name: 'Барбер Лофт',
        address: 'просп. Центральный, 24, Санкт-Петербург',
        phone: '+7 (921) 555-44-33',
        services: [
            { name: 'Стрижка бороды', price: 800, duration: 20 },
            { name: 'Бритье', price: 1200, duration: 30 }
        ],
        masters: [
            {
                name: 'Максим',
                emoji: '👨',
                bio: 'Барбер и мужские стрижки',
                photo: '',
                services: ['Стрижка бороды', 'Бритье'],
                workingHours: { start: '11:00', end: '19:00', days: [2, 3, 4, 5, 6, 0] }
            },
            {
                name: 'Елена',
                emoji: '👩‍🦰',
                bio: 'Укладки и окрашивание',
                photo: '',
                services: ['Стрижка бороды', 'Бритье'],
                workingHours: { start: '09:30', end: '18:30', days: [1, 2, 3, 4, 5, 6] }
            }
        ],
        managerHours: { start: '09:00', end: '20:00', days: [1, 2, 3, 4, 5, 6] },
        createdAt: '2026-07-04T00:00:00.000Z'
    }
];

function generateDataId(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function normalizeService(service, index) {
    return {
        id: service.id || generateDataId('service' + index),
        name: service.name || 'Услуга',
        price: typeof service.price === 'number' ? service.price : parseInt(service.price, 10) || 0,
        duration: typeof service.duration === 'number' ? service.duration : parseInt(service.duration, 10) || 30
    };
}

function normalizeMaster(master, index) {
    return {
        id: master.id || generateDataId('master' + index),
        name: master.name || 'Мастер',
        emoji: master.emoji || '👤',
        bio: master.bio || '',
        photo: master.photo || '',
        services: Array.isArray(master.services) ? master.services.slice() : [],
        workingHours: {
            start: master.workingHours && master.workingHours.start ? master.workingHours.start : '09:00',
            end: master.workingHours && master.workingHours.end ? master.workingHours.end : '21:00',
            days: master.workingHours && Array.isArray(master.workingHours.days) ? master.workingHours.days.slice() : [1, 2, 3, 4, 5, 6, 0]
        }
    };
}

function normalizeBusiness(business, index) {
    var normalized = {
        id: business.id || generateDataId('biz' + index),
        code: String(business.code || ''),
        password: business.password || '',
        name: business.name || 'Бизнес',
        address: business.address || '',
        phone: business.phone || '',
        services: (business.services || []).map(function(service, serviceIndex) {
            return normalizeService(service, serviceIndex);
        }),
        masters: (business.masters || []).map(function(master, masterIndex) {
            return normalizeMaster(master, masterIndex);
        }),
        managerHours: {
            start: business.managerHours && business.managerHours.start ? business.managerHours.start : '09:00',
            end: business.managerHours && business.managerHours.end ? business.managerHours.end : '21:00',
            days: business.managerHours && Array.isArray(business.managerHours.days) ? business.managerHours.days.slice() : [1, 2, 3, 4, 5, 6, 0]
        },
        createdAt: business.createdAt || new Date().toISOString()
    };

    return normalized;
}

function getBusinesses() {
    var saved = localStorage.getItem('businesses');

    if (!saved) {
        var seeded = DEFAULT_BUSINESSES.map(function(business, index) {
            return normalizeBusiness(business, index);
        });
        localStorage.setItem('businesses', JSON.stringify(seeded));
        return seeded;
    }

    try {
        var parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
            var normalized = parsed.map(function(business, index) {
                return normalizeBusiness(business, index);
            });
            localStorage.setItem('businesses', JSON.stringify(normalized));
            return normalized;
        }
    } catch (e) {
        // Если хранилище сломано, вернемся к стартовым данным.
    }

    var fallback = DEFAULT_BUSINESSES.map(function(business, index) {
        return normalizeBusiness(business, index);
    });
    localStorage.setItem('businesses', JSON.stringify(fallback));
    return fallback;
}

function saveBusinesses(data) {
    localStorage.setItem('businesses', JSON.stringify(data));
}

function getBookings() {
    var saved = localStorage.getItem('bookings');
    return saved ? JSON.parse(saved) : [];
}

function saveBookings(data) {
    localStorage.setItem('bookings', JSON.stringify(data));
}
