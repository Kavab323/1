// ============================================
// PARTNER.JS — Логика для партнеров
// ============================================

// ============================================
// ОБЩИЕ ФУНКЦИИ
// ============================================

function getBookings() {
    var saved = localStorage.getItem('bookings');
    return saved ? JSON.parse(saved) : [];
}

function saveBookings(data) {
    localStorage.setItem('bookings', JSON.stringify(data));
}

function getCurrentPartner() {
    var saved = sessionStorage.getItem('partnerSession');
    return saved ? JSON.parse(saved) : null;
}

function setCurrentPartner(data) {
    sessionStorage.setItem('partnerSession', JSON.stringify(data));
}

function clearCurrentPartner() {
    sessionStorage.removeItem('partnerSession');
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ============================================
// СТРАНИЦА ВХОДА / РЕГИСТРАЦИИ
// ============================================

function initPartnerAuth() {
    // Проверка — если уже залогинен, редирект в дашборд
    if (getCurrentPartner()) {
        window.location.href = 'dashboard.html';
        return;
    }

    var errorEl = document.getElementById('partnerError');

    // ===== ВХОД =====
    document.getElementById('partnerLoginBtn').addEventListener('click', function() {
        var login = document.getElementById('partnerLogin').value.trim();
        var password = document.getElementById('partnerPassword').value.trim();

        if (!login || !password) {
            showPartnerError('Заполните все поля');
            return;
        }

        var businesses = getBusinesses();
        var biz = businesses.find(function(b) {
            return b.code === login && b.password === password;
        });

        if (biz) {
            setCurrentPartner({
                businessId: biz.id,
                businessCode: biz.code,
                businessName: biz.name
            });
            window.location.href = 'dashboard.html';
        } else {
            showPartnerError('Неверный код бизнеса или пароль');
        }
    });

    // Вход по Enter
    document.getElementById('partnerPassword').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('partnerLoginBtn').click();
        }
    });

    // ===== ПОКАЗАТЬ РЕГИСТРАЦИЮ =====
    document.getElementById('partnerShowRegister').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('partnerRegisterSection').classList.add('show');
        errorEl.classList.remove('show');
    });

    document.getElementById('partnerRegisterCancel').addEventListener('click', function() {
        document.getElementById('partnerRegisterSection').classList.remove('show');
    });

    // ===== РЕГИСТРАЦИЯ =====
    document.getElementById('partnerRegisterBtn').addEventListener('click', function() {
        var name = document.getElementById('regBizName').value.trim();
        var code = document.getElementById('regBizCode').value.trim();
        var password = document.getElementById('regBizPassword').value.trim();
        var address = document.getElementById('regBizAddress').value.trim();
        var phone = document.getElementById('regBizPhone').value.trim();
        var servicesRaw = document.getElementById('regBizServices').value.trim();
        var mastersRaw = document.getElementById('regBizMasters').value.trim();

        // Проверка обязательных полей
        if (!name || !code || !password || !address) {
            alert('Заполните все поля, отмеченные *');
            return;
        }

        // Проверка кода (только цифры, 5-10 символов)
        if (!/^\d{5,10}$/.test(code)) {
            alert('Код бизнеса должен содержать только цифры (5-10 символов)');
            return;
        }

        // Проверка пароля
        if (password.length < 6) {
            alert('Пароль должен быть не менее 6 символов');
            return;
        }

        // Проверка уникальности кода
        var businesses = getBusinesses();
        if (businesses.some(function(b) { return b.code === code; })) {
            alert('Такой код бизнеса уже существует! Придумайте другой.');
            return;
        }

        // Парсим услуги
        var services = [];
        if (servicesRaw) {
            servicesRaw.split('\n').forEach(function(line) {
                line = line.trim();
                if (line) {
                    var parts = line.split('|').map(function(s) { return s.trim(); });
                    services.push({
                        id: 'service_' + Date.now().toString(36) + '_' + services.length,
                        name: parts[0] || 'Услуга',
                        price: parseInt(parts[1]) || 0,
                        duration: parseInt(parts[2]) || 30
                    });
                }
            });
        }

        // Если услуги не добавлены — добавляем заглушку
        if (services.length === 0) {
            services.push({ id: 'service_' + Date.now().toString(36), name: 'Услуга', price: 0, duration: 30 });
        }

        // Парсим мастеров
        var masters = [];
        if (mastersRaw) {
            var emojis = ['👩', '🧑', '👩‍🦰', '👨', '👩‍🦱', '🧔', '👴', '👵'];
            mastersRaw.split(',').forEach(function(name, index) {
                name = name.trim();
                if (name) {
                    masters.push({
                        id: 'master_' + Date.now().toString(36) + '_' + masters.length,
                        name: name,
                        emoji: emojis[index % emojis.length],
                        bio: '',
                        photo: ''
                    });
                }
            });
        }

        // Если мастеров нет — добавляем заглушку
        if (masters.length === 0) {
            masters.push({ id: 'master_' + Date.now().toString(36), name: 'Мастер', emoji: '👤', bio: '', photo: '' });
        }

        // Создаем бизнес
        var newBiz = {
            id: 'biz_' + Date.now().toString(36),
            code: code,
            password: password,
            name: name,
            address: address,
            phone: phone || '',
            services: services,
            masters: masters,
            createdAt: new Date().toISOString()
        };

        businesses.push(newBiz);
        saveBusinesses(businesses);

        alert('✅ Бизнес успешно зарегистрирован!\nТеперь вы можете войти.');

        // Очищаем форму и закрываем регистрацию
        document.getElementById('regBizName').value = '';
        document.getElementById('regBizCode').value = '';
        document.getElementById('regBizPassword').value = '';
        document.getElementById('regBizAddress').value = '';
        document.getElementById('regBizPhone').value = '';
        document.getElementById('regBizServices').value = '';
        document.getElementById('regBizMasters').value = '';
        document.getElementById('partnerRegisterSection').classList.remove('show');
    });

    // ===== ВСПОМОГАТЕЛЬНЫЕ =====
    function showPartnerError(msg) {
        var el = document.getElementById('partnerError');
        el.textContent = msg;
        el.classList.add('show');
    }
}

// ============================================
// ДАШБОРД (ЛИЧНЫЙ КАБИНЕТ)
// ============================================

function initDashboard() {
    var session = getCurrentPartner();
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    var businesses = getBusinesses();
    var biz = businesses.find(function(b) { return b.id === session.businessId; });

    if (!biz) {
        alert('Бизнес не найден. Войдите заново.');
        clearCurrentPartner();
        window.location.href = 'index.html';
        return;
    }

    var serviceEditorState = {
        editIndex: null
    };
    var masterEditorState = {
        editIndex: null,
        photoData: ''
    };

    // ===== ОБНОВЛЕНИЕ ДАШБОРДА =====
    function updateDashboard() {
        // Шапка
        document.getElementById('dashBizName').textContent = biz.name;
        document.getElementById('dashBizCode').textContent = 'Код: ' + biz.code;

        // Статистика
        document.getElementById('statServices').textContent = biz.services.length;
        document.getElementById('statMasters').textContent = biz.masters.length;

        var bookings = getBookings();
        var bizBookings = bookings.filter(function(b) { return b.businessCode === biz.code; });
        document.getElementById('statBookings').textContent = bizBookings.length;

        // Рендерим табы
        renderServices(biz);
        renderMasters(biz);
        renderBookings(bizBookings);

        // Настройки
        document.getElementById('settingName').value = biz.name;
        document.getElementById('settingAddress').value = biz.address;
        document.getElementById('settingPhone').value = biz.phone || '';
        document.getElementById('managerWorkStartInput').value = biz.managerHours && biz.managerHours.start ? biz.managerHours.start : '09:00';
        document.getElementById('managerWorkEndInput').value = biz.managerHours && biz.managerHours.end ? biz.managerHours.end : '21:00';

        document.querySelectorAll('.manager-workday').forEach(function(input) {
            var days = (biz.managerHours && biz.managerHours.days) || [1, 2, 3, 4, 5, 6, 0];
            input.checked = days.indexOf(parseInt(input.value, 10)) !== -1;
        });

        renderMasterServicesPicker();
    }

    function renderMasterServicesPicker() {
        var picker = document.getElementById('masterServicesPicker');
        if (!picker) return;

        if (!biz.services || biz.services.length === 0) {
            picker.innerHTML = '<div style="color:#4A4A6A;font-size:13px;">Сначала добавьте услуги бизнеса</div>';
            return;
        }

        var master = masterEditorState.editIndex !== null ? biz.masters[masterEditorState.editIndex] : null;
        var selectedNames = master && Array.isArray(master.services) ? master.services.map(function(item) { return typeof item === 'string' ? item : item.name; }) : biz.services.map(function(s) { return s.name; });

        picker.innerHTML = biz.services.map(function(service) {
            var checked = selectedNames.indexOf(service.name) !== -1 ? 'checked' : '';
            return '<label><input type="checkbox" class="master-service-item" value="' + service.name + '" ' + checked + '> ' + service.name + '</label>';
        }).join('');
    }

    function getServiceEditorValues() {
        return {
            name: document.getElementById('serviceNameInput').value.trim(),
            price: parseInt(document.getElementById('servicePriceInput').value, 10),
            duration: parseInt(document.getElementById('serviceDurationInput').value, 10)
        };
    }

    function setServiceEditorValues(service) {
        document.getElementById('serviceNameInput').value = service ? service.name : '';
        document.getElementById('servicePriceInput').value = service ? service.price : '';
        document.getElementById('serviceDurationInput').value = service ? service.duration : '';
    }

    function updateServiceEditorMode() {
        var title = document.getElementById('serviceEditorTitle');
        var hint = document.getElementById('serviceEditorHint');
        var button = document.getElementById('saveServiceBtn');

        if (serviceEditorState.editIndex === null) {
            title.textContent = 'Редактор услуги';
            hint.textContent = 'Создайте новую услугу или выберите существующую для редактирования';
            button.textContent = '💾 Сохранить услугу';
        } else {
            title.textContent = 'Редактирование услуги';
            hint.textContent = 'Измените параметры и нажмите сохранение';
            button.textContent = '💾 Обновить услугу';
        }
    }

    function resetServiceEditor() {
        serviceEditorState.editIndex = null;
        setServiceEditorValues(null);
        updateServiceEditorMode();
    }

    function getMasterEditorValues() {
        return {
            name: document.getElementById('masterNameInput').value.trim(),
            bio: document.getElementById('masterBioInput').value.trim(),
            emoji: document.getElementById('masterEmojiInput').value.trim() || '👤',
            photoUrl: document.getElementById('masterPhotoUrlInput').value.trim()
        };
    }

    function setMasterEditorPreview(master) {
        var preview = document.getElementById('masterEditorPreview');
        var photo = master && master.photo ? master.photo : '';
        var emoji = master && master.emoji ? master.emoji : '👤';

        if (photo) {
            preview.innerHTML = '<img src="' + photo + '" alt="Фото мастера">';
        } else {
            preview.textContent = emoji;
        }
    }

    function setMasterEditorValues(master) {
        document.getElementById('masterNameInput').value = master ? master.name : '';
        document.getElementById('masterBioInput').value = master ? (master.bio || '') : '';
        document.getElementById('masterEmojiInput').value = master ? (master.emoji || '👤') : '';
        document.getElementById('masterPhotoUrlInput').value = master ? (master.photo || '') : '';
        masterEditorState.photoData = master && master.photo ? master.photo : '';
        setMasterEditorPreview(master);
        var hours = master && master.workingHours ? master.workingHours : { start: '09:00', end: '21:00', days: [1, 2, 3, 4, 5, 6, 0] };
        document.getElementById('masterWorkStartInput').value = hours.start || '09:00';
        document.getElementById('masterWorkEndInput').value = hours.end || '21:00';

        document.querySelectorAll('.master-workday').forEach(function(input) {
            input.checked = (hours.days || [1, 2, 3, 4, 5, 6, 0]).indexOf(parseInt(input.value, 10)) !== -1;
        });
        renderMasterServicesPicker();
    }

    function updateMasterEditorMode() {
        var title = document.getElementById('masterEditorTitle');
        var hint = document.getElementById('masterEditorHint');
        var button = document.getElementById('saveMasterBtn');

        if (masterEditorState.editIndex === null) {
            title.textContent = 'Редактор мастера';
            hint.textContent = 'Добавьте фото, имя и профиль мастера';
            button.textContent = '💾 Сохранить мастера';
        } else {
            title.textContent = 'Редактирование мастера';
            hint.textContent = 'Обновите фото или описание и сохраните';
            button.textContent = '💾 Обновить мастера';
        }
    }

    function resetMasterEditor() {
        masterEditorState.editIndex = null;
        masterEditorState.photoData = '';
        setMasterEditorValues(null);
        updateMasterEditorMode();
    }

    function getSelectedMasterServices() {
        var items = [];
        document.querySelectorAll('.master-service-item:checked').forEach(function(input) {
            items.push(input.value);
        });
        return items;
    }

    function getSelectedWorkDays(selector) {
        var days = [];
        document.querySelectorAll(selector + ':checked').forEach(function(input) {
            days.push(parseInt(input.value, 10));
        });
        return days;
    }

    function toDataUrl(file, callback) {
        var reader = new FileReader();
        reader.onload = function() {
            callback(reader.result);
        };
        reader.readAsDataURL(file);
    }

    // ===== РЕНДЕРИНГ УСЛУГ =====
    function renderServices(biz) {
        var container = document.getElementById('servicesList');
        if (biz.services.length === 0) {
            container.innerHTML = '<div class="empty-state-card">Услуг пока нет. Добавьте первую услугу через редактор выше.</div>';
            return;
        }

        var html = '';
        biz.services.forEach(function(s, i) {
            html +=
                '<div class="service-item">' +
                '<div class="info">' +
                '<div class="name">' + s.name + '</div>' +
                '<div class="detail">' + s.price + ' ₽ • ' + s.duration + ' мин</div>' +
                '</div>' +
                '<div class="actions">' +
                '<button class="btn-edit" onclick="editService(' + i + ')">✏️</button>' +
                '<button class="btn-delete" onclick="deleteService(' + i + ')">🗑️</button>' +
                '</div>' +
                '</div>';
        });
        container.innerHTML = html;
    }

    // ===== РЕНДЕРИНГ МАСТЕРОВ =====
    function renderMasters(biz) {
        var container = document.getElementById('mastersList');
        if (biz.masters.length === 0) {
            container.innerHTML = '<div class="empty-state-card">Мастеров пока нет. Добавьте первого мастера через редактор выше.</div>';
            return;
        }

        var html = '';
        biz.masters.forEach(function(m, i) {
            html +=
                '<div class="master-item">' +
                '<div class="info">' +
                '<span class="avatar">' + (m.photo ? '<img src="' + m.photo + '" alt="' + m.name + '">' : (m.emoji || '👤')) + '</span>' +
                '<span class="meta">' +
                '<span class="name">' + m.name + '</span>' +
                (m.bio ? '<span class="bio">' + m.bio + '</span>' : '') +
                '<span class="bio">' + ((m.services && m.services.length) ? ('Услуг: ' + m.services.length) : 'Услуг: 0') + '</span>' +
                '<span class="bio">' + ((m.workingHours && m.workingHours.start) ? (m.workingHours.start + '–' + m.workingHours.end) : '09:00–21:00') + '</span>' +
                '</span>' +
                '</div>' +
                '<div class="actions">' +
                '<button class="btn-edit" onclick="editMaster(' + i + ')">✏️</button>' +
                '<button class="btn-delete" onclick="deleteMaster(' + i + ')">🗑️</button>' +
                '</div>' +
                '</div>';
        });
        container.innerHTML = html;
    }

    // ===== РЕНДЕРИНГ ЗАПИСЕЙ =====
    function renderBookings(bookings) {
        var container = document.getElementById('bookingsList');
        if (bookings.length === 0) {
            container.innerHTML = '<div class="bookings-list-empty">📋 Записей пока нет</div>';
            return;
        }

        var html = '';
        bookings.forEach(function(b) {
            html +=
                '<div class="booking-item">' +
                '<div class="client">' + b.clientName + ' — ' + b.service + '</div>' +
                '<div class="detail">📅 ' + b.date + ' в ' + b.time + ' • ' + b.master + ' • ' + b.price + ' ₽</div>' +
                '<div class="booking-actions">' +
                '<button class="btn-cancel" onclick="deleteBooking(\'' + b.id + '\')">Отменить</button>' +
                '</div>' +
                '</div>';
        });
        container.innerHTML = html;
    }

    // ===== УПРАВЛЕНИЕ УСЛУГАМИ =====
    window.deleteService = function(index) {
        if (!confirm('Удалить услугу?')) return;
        biz.services.splice(index, 1);
        if (serviceEditorState.editIndex === index) {
            resetServiceEditor();
        }
        var all = getBusinesses();
        all = all.map(function(b) { return b.id === biz.id ? biz : b; });
        saveBusinesses(all);
        updateDashboard();
    };

    window.editService = function(index) {
        serviceEditorState.editIndex = index;
        setServiceEditorValues(biz.services[index]);
        updateServiceEditorMode();
        document.getElementById('serviceNameInput').focus();
    };

    document.getElementById('cancelServiceBtn').addEventListener('click', function() {
        resetServiceEditor();
    });

    document.getElementById('saveServiceBtn').addEventListener('click', function() {
        var values = getServiceEditorValues();
        var name = values.name;
        var price = values.price;
        var duration = values.duration;

        if (!name) { alert('Введите название'); return; }
        if (isNaN(price) || price < 0) { alert('Введите цену'); return; }
        if (isNaN(duration) || duration < 0) { alert('Введите длительность'); return; }

        var service = { name: name, price: price, duration: duration };
        service.id = service.id || name.toLowerCase().replace(/[^a-zа-я0-9]+/gi, '_') + '_' + Date.now().toString(36);

        if (serviceEditorState.editIndex === null) {
            biz.services.push(service);
        } else {
            biz.services[serviceEditorState.editIndex] = service;
        }

        var all = getBusinesses();
        all = all.map(function(b) { return b.id === biz.id ? biz : b; });
        saveBusinesses(all);
        resetServiceEditor();
        updateDashboard();
    });

    document.getElementById('addServiceBtn').addEventListener('click', function() {
        resetServiceEditor();
        document.getElementById('serviceNameInput').focus();
    });

    // ===== УПРАВЛЕНИЕ МАСТЕРАМИ =====
    window.deleteMaster = function(index) {
        if (!confirm('Удалить мастера?')) return;
        biz.masters.splice(index, 1);
        var all = getBusinesses();
        all = all.map(function(b) { return b.id === biz.id ? biz : b; });
        saveBusinesses(all);
        updateDashboard();
    };

    window.editMaster = function(index) {
        masterEditorState.editIndex = index;
        setMasterEditorValues(biz.masters[index]);
        updateMasterEditorMode();
        document.getElementById('masterNameInput').focus();
    };

    document.getElementById('addMasterBtn').addEventListener('click', function() {
        resetMasterEditor();
        document.getElementById('masterNameInput').focus();
    });

    document.getElementById('masterPhotoInput').addEventListener('change', function() {
        var file = this.files && this.files[0];
        if (!file) return;

        if (!file.type || file.type.indexOf('image/') !== 0) {
            alert('Выберите изображение');
            this.value = '';
            return;
        }

        toDataUrl(file, function(dataUrl) {
            masterEditorState.photoData = dataUrl;
            setMasterEditorPreview({ photo: dataUrl, emoji: document.getElementById('masterEmojiInput').value.trim() || '👤' });
        });
    });

    document.getElementById('masterEmojiInput').addEventListener('input', function() {
        if (!masterEditorState.photoData) {
            setMasterEditorPreview({ emoji: this.value.trim() || '👤' });
        }
    });

    document.getElementById('masterPhotoUrlInput').addEventListener('input', function() {
        var value = this.value.trim();
        if (value) {
            masterEditorState.photoData = value;
            setMasterEditorPreview({ photo: value, emoji: document.getElementById('masterEmojiInput').value.trim() || '👤' });
        }
    });

    document.getElementById('cancelMasterBtn').addEventListener('click', function() {
        resetMasterEditor();
    });

    document.getElementById('saveMasterBtn').addEventListener('click', function() {
        var values = getMasterEditorValues();
        var name = values.name;
        var bio = values.bio;
        var emoji = values.emoji;
        var photo = masterEditorState.photoData || values.photoUrl;
        var services = getSelectedMasterServices();
        var workingHours = {
            start: document.getElementById('masterWorkStartInput').value || '09:00',
            end: document.getElementById('masterWorkEndInput').value || '21:00',
            days: getSelectedWorkDays('.master-workday')
        };

        if (!name) { alert('Введите имя мастера'); return; }
        if (!workingHours.start || !workingHours.end) { alert('Укажите рабочие часы'); return; }
        if (workingHours.days.length === 0) { alert('Выберите хотя бы один рабочий день'); return; }

        var master = {
            name: name,
            emoji: emoji,
            bio: bio,
            photo: photo || '' ,
            services: services,
            workingHours: workingHours
        };

        if (masterEditorState.editIndex === null) {
            biz.masters.push(master);
        } else {
            biz.masters[masterEditorState.editIndex] = master;
        }

        var all = getBusinesses();
        all = all.map(function(b) { return b.id === biz.id ? biz : b; });
        saveBusinesses(all);
        resetMasterEditor();
        updateDashboard();
    });

    // ===== УПРАВЛЕНИЕ ЗАПИСЯМИ =====
    window.deleteBooking = function(id) {
        if (!confirm('Отменить запись?')) return;
        var bookings = getBookings();
        bookings = bookings.filter(function(b) { return b.id !== id; });
        saveBookings(bookings);
        updateDashboard();
    };

    // ===== НАСТРОЙКИ =====
    document.getElementById('saveSettingsBtn').addEventListener('click', function() {
        var name = document.getElementById('settingName').value.trim();
        var address = document.getElementById('settingAddress').value.trim();
        var phone = document.getElementById('settingPhone').value.trim();
        var managerHours = {
            start: document.getElementById('managerWorkStartInput').value || '09:00',
            end: document.getElementById('managerWorkEndInput').value || '21:00',
            days: getSelectedWorkDays('.manager-workday')
        };

        if (!name || !address) { alert('Заполните название и адрес'); return; }
        if (managerHours.days.length === 0) { alert('Выберите хотя бы один рабочий день для менеджера'); return; }

        biz.name = name;
        biz.address = address;
        biz.phone = phone;
        biz.managerHours = managerHours;

        var all = getBusinesses();
        all = all.map(function(b) { return b.id === biz.id ? biz : b; });
        saveBusinesses(all);
        updateDashboard();
        alert('✅ Настройки сохранены!');
    });

    // ===== ТАБЫ =====
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
            btn.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(function(t) { t.classList.remove('active'); });
            document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
        });
    });

    // ===== ВЫХОД =====
    document.getElementById('dashExitBtn').addEventListener('click', function() {
        if (confirm('Выйти из аккаунта?')) {
            clearCurrentPartner();
            window.location.href = 'index.html';
        }
    });

    // ===== ЗАПУСК =====
    resetServiceEditor();
    resetMasterEditor();
    updateDashboard();
    console.log('📊 Дашборд загружен для:', biz.name);
}

// ============================================
// ОПРЕДЕЛЕНИЕ СТРАНИЦЫ И ЗАПУСК
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Определяем, на какой странице мы находимся
    var path = window.location.pathname;
    var page = path.split('/').pop();

    if (page === 'dashboard.html' || page === '') {
        initDashboard();
    } else {
        initPartnerAuth();
    }
});