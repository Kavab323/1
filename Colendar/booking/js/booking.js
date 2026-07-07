// ====== ДАННЫЕ ======

const SERVICES = [
    { id: 1, name: '💇 Мужская стрижка', price: 1500, duration: 30 },
    { id: 2, name: '💆 Женская стрижка', price: 2500, duration: 60 },
    { id: 3, name: '🎨 Окрашивание', price: 4000, duration: 120 },
    { id: 4, name: '🌀 Укладка', price: 2000, duration: 45 },
    { id: 5, name: '✂️ Детская стрижка', price: 1200, duration: 30 },
    { id: 6, name: '🧔 Борода/усы', price: 800, duration: 20 },
];

const MASTERS = [
    { id: 1, name: 'Анна', emoji: '👩' },
    { id: 2, name: 'Дмитрий', emoji: '🧑' },
    { id: 3, name: 'Елена', emoji: '👩‍🦰' },
    { id: 4, name: 'Максим', emoji: '👨' },
];

// Рабочие часы
const WORK_START = 9;   // 9:00
const WORK_END = 21;    // 21:00
const SLOT_INTERVAL = 30; // минуты

// ====== СОСТОЯНИЕ ======

let state = {
    selectedService: null,
    selectedMaster: null,
    selectedDate: new Date(),
    selectedTime: null,
    clientName: '',
    clientPhone: '',
    clientComment: '',
    bookings: [],
};

// ====== ЗАГРУЗКА/СОХРАНЕНИЕ ======

function loadBookings() {
    const saved = localStorage.getItem('bookings');
    if (saved) {
        try {
            state.bookings = JSON.parse(saved);
        } catch (e) {
            state.bookings = [];
        }
    }
}

function saveBookings() {
    localStorage.setItem('bookings', JSON.stringify(state.bookings));
}

function generateBookingId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ====== ОТОБРАЖЕНИЕ УСЛУГ ======

function renderServices() {
    const grid = document.getElementById('serviceGrid');
    grid.innerHTML = '';
    SERVICES.forEach(service => {
        const card = document.createElement('div');
        card.className = 'service-card';
        card.dataset.id = service.id;
        card.innerHTML = `
            ${service.name}
            <span class="price">${service.price} ₽</span>
            <span class="duration">⏱ ${service.duration} мин</span>
        `;
        card.addEventListener('click', () => selectService(service.id));
        grid.appendChild(card);
    });
}

function selectService(id) {
    state.selectedService = SERVICES.find(s => s.id === id);
    document.querySelectorAll('.service-card').forEach(el => {
        el.classList.toggle('selected', parseInt(el.dataset.id) === id);
    });
    document.getElementById('toStep2').disabled = false;
}

// ====== ОТОБРАЖЕНИЕ МАСТЕРОВ ======

function renderMasters() {
    const grid = document.getElementById('masterGrid');
    grid.innerHTML = '';
    MASTERS.forEach(master => {
        const card = document.createElement('div');
        card.className = 'master-card';
        card.dataset.id = master.id;
        card.innerHTML = `
            <span class="emoji">${master.emoji}</span>
            ${master.name}
        `;
        card.addEventListener('click', () => selectMaster(master.id));
        grid.appendChild(card);
    });
}

function selectMaster(id) {
    state.selectedMaster = MASTERS.find(m => m.id === id);
    document.querySelectorAll('.master-card').forEach(el => {
        el.classList.toggle('selected', parseInt(el.dataset.id) === id);
    });
    renderDates();
    checkStep2Ready();
}

// ====== ДАТЫ ======

function renderDates() {
    const dateSpan = document.getElementById('currentDate');
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    dateSpan.textContent = state.selectedDate.toLocaleDateString('ru-RU', options);
    renderTimeSlots();
}

function changeDate(delta) {
    const newDate = new Date(state.selectedDate);
    newDate.setDate(newDate.getDate() + delta);
    // Не даем выбрать прошедшие даты
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate < today) return;
    state.selectedDate = newDate;
    state.selectedTime = null;
    renderDates();
    checkStep2Ready();
}

// ====== ВРЕМЯ ======

function renderTimeSlots() {
    const grid = document.getElementById('timeGrid');
    grid.innerHTML = '';

    const slots = generateTimeSlots();
    const dateKey = getDateKey(state.selectedDate);
    const dayBookings = state.bookings.filter(b => b.date === dateKey);

    slots.forEach(time => {
        const slot = document.createElement('div');
        slot.className = 'time-slot';
        slot.textContent = time;

        // Проверка занятости
        const isBooked = dayBookings.some(b => {
            const slotEnd = addMinutes(time, state.selectedService?.duration || 30);
            return isTimeOverlap(time, slotEnd, b.time, addMinutes(b.time, b.duration || 30));
        });

        if (isBooked) {
            slot.classList.add('booked');
        } else {
            slot.addEventListener('click', () => selectTime(time));
        }

        grid.appendChild(slot);
    });
}

function generateTimeSlots() {
    const slots = [];
    let current = WORK_START * 60; // в минутах
    const end = WORK_END * 60;
    while (current < end) {
        const hours = Math.floor(current / 60);
        const minutes = current % 60;
        slots.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`);
        current += SLOT_INTERVAL;
    }
    return slots;
}

function addMinutes(timeStr, minutes) {
    const [h, m] = timeStr.split(':').map(Number);
    const total = h * 60 + m + minutes;
    const hours = Math.floor(total / 60);
    const mins = total % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function isTimeOverlap(start1, end1, start2, end2) {
    return start1 < end2 && start2 < end1;
}

function selectTime(time) {
    state.selectedTime = time;
    document.querySelectorAll('.time-slot').forEach(el => {
        el.classList.toggle('selected', el.textContent === time && !el.classList.contains('booked'));
    });
    checkStep2Ready();
}

function getDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// ====== ПРОВЕРКА ГОТОВНОСТИ ШАГА 2 ======

function checkStep2Ready() {
    const btn = document.getElementById('toStep3');
    btn.disabled = !(state.selectedMaster && state.selectedTime);
}

// ====== НАВИГАЦИЯ ПО ШАГАМ ======

function showStep(stepId) {
    document.querySelectorAll('.step').forEach(el => el.classList.add('hidden'));
    document.getElementById(stepId).classList.remove('hidden');
}

document.getElementById('toStep2').addEventListener('click', () => {
    if (!state.selectedService) return;
    showStep('stepMaster');
    renderMasters();
    renderDates();
});

document.getElementById('toStep3').addEventListener('click', () => {
    if (!state.selectedMaster || !state.selectedTime) return;
    showStep('stepForm');
    updateSummary();
});

document.getElementById('backToStep2').addEventListener('click', () => {
    showStep('stepMaster');
});

document.getElementById('prevDate').addEventListener('click', () => changeDate(-1));
document.getElementById('nextDate').addEventListener('click', () => changeDate(1));

// ====== ОБНОВЛЕНИЕ ИТОГА ======

function updateSummary() {
    const summary = document.getElementById('bookingSummary');
    const service = state.selectedService;
    const master = state.selectedMaster;
    const date = state.selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });

    summary.innerHTML = `
        <strong>Услуга:</strong> ${service.name}<br>
        <strong>Мастер:</strong> ${master.emoji} ${master.name}<br>
        <strong>Дата:</strong> ${date}<br>
        <strong>Время:</strong> ${state.selectedTime}<br>
        <strong>Длительность:</strong> ${service.duration} мин<br>
        <strong>Цена:</strong> ${service.price} ₽
    `;
}

// ====== ОТПРАВКА ЗАПИСИ ======

document.getElementById('bookingForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('clientName').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const comment = document.getElementById('clientComment').value.trim();

    if (!name || !phone) {
        alert('Пожалуйста, заполните имя и телефон');
        return;
    }

    const booking = {
        id: generateBookingId(),
        service: state.selectedService.name,
        master: state.selectedMaster.name,
        date: getDateKey(state.selectedDate),
        time: state.selectedTime,
        duration: state.selectedService.duration,
        price: state.selectedService.price,
        clientName: name,
        clientPhone: phone,
        comment: comment || '',
        createdAt: new Date().toISOString(),
    };

    state.bookings.push(booking);
    saveBookings();

    // Показать успех
    showStep('stepSuccess');
    document.getElementById('successMessage').innerHTML = `
        <strong>${name}</strong>, вы записаны на <strong>${state.selectedService.name}</strong><br>
        к <strong>${state.selectedMaster.name}</strong> на <strong>${state.selectedDate.toLocaleDateString('ru-RU')} в ${state.selectedTime}</strong>
    `;
});

// ====== НОВАЯ ЗАПИСЬ ======

document.getElementById('newBooking').addEventListener('click', () => {
    resetBooking();
    showStep('stepService');
});

function resetBooking() {
    state.selectedService = null;
    state.selectedMaster = null;
    state.selectedTime = null;
    state.selectedDate = new Date();
    document.querySelectorAll('.service-card, .master-card, .time-slot').forEach(el => {
        el.classList.remove('selected');
    });
    document.getElementById('toStep2').disabled = true;
    document.getElementById('toStep3').disabled = true;
    document.getElementById('clientName').value = '';
    document.getElementById('clientPhone').value = '';
    document.getElementById('clientComment').value = '';
}

// ====== МОИ ЗАПИСИ ======

document.getElementById('viewMyBookings').addEventListener('click', () => {
    showMyBookings();
});

document.getElementById('closeMyBookings').addEventListener('click', () => {
    document.getElementById('myBookingsModal').classList.add('hidden');
});

function showMyBookings() {
    const modal = document.getElementById('myBookingsModal');
    const list = document.getElementById('myBookingsList');
    modal.classList.remove('hidden');

    const phone = document.getElementById('clientPhone').value.trim();
    if (!phone) {
        list.innerHTML = '<p style="color:#4A4A6A;">Введите номер телефона, чтобы увидеть свои записи</p>';
        return;
    }

    const myBookings = state.bookings.filter(b => b.clientPhone === phone);
    if (myBookings.length === 0) {
        list.innerHTML = '<p style="color:#4A4A6A;">У вас нет записей</p>';
        return;
    }

    list.innerHTML = myBookings.map(b => `
        <div class="booking-item">
            <strong>${b.service}</strong> — ${b.master}<br>
            ${b.date} в ${b.time} (${b.duration} мин, ${b.price} ₽)
            <span class="delete-booking" data-id="${b.id}">✕</span>
        </div>
    `).join('');

    // Удаление записи
    list.querySelectorAll('.delete-booking').forEach(el => {
        el.addEventListener('click', () => {
            if (confirm('Отменить запись?')) {
                state.bookings = state.bookings.filter(b => b.id !== el.dataset.id);
                saveBookings();
                showMyBookings();
            }
        });
    });
}

// ====== ИНИЦИАЛИЗАЦИЯ ======

loadBookings();
renderServices();

// Кнопки навигации для дат
document.getElementById('prevDate').addEventListener('click', () => changeDate(-1));
document.getElementById('nextDate').addEventListener('click', () => changeDate(1));

console.log('💇 Система записи к парикмахеру загружена!');