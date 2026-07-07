// ============================================
// АВТОРИЗАЦИЯ И РЕГИСТРАЦИЯ
// ============================================

// ====== ПРОВЕРКА EMAIL ======
function isValidEmail(email) {
    var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ====== ФОРМАТИРОВАНИЕ ТЕЛЕФОНА ======
function formatPhone(value) {
    var digits = value.replace(/\D/g, '');
    if (!digits) return '';
    if (digits.startsWith('8') || digits.startsWith('7')) {
        digits = '7' + digits.substring(1);
    }
    if (digits.length > 11) {
        digits = digits.substring(0, 11);
    }
    var result = '+7';
    if (digits.length > 1) {
        result += ' (' + digits.substring(1, 4);
    }
    if (digits.length > 4) {
        result += ') ' + digits.substring(4, 7);
    }
    if (digits.length > 7) {
        result += '-' + digits.substring(7, 9);
    }
    if (digits.length > 9) {
        result += '-' + digits.substring(9, 11);
    }
    return result;
}

// ====== ЗАГРУЗКА ПОЛЬЗОВАТЕЛЕЙ ======
function getUsers() {
    var saved = localStorage.getItem('users');
    return saved ? JSON.parse(saved) : [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// ====== РЕГИСТРАЦИЯ ======
function registerUser() {
    var name = document.getElementById('regName').value.trim();
    var phoneInput = document.getElementById('regPhone');
    var phone = phoneInput.value.trim();
    var email = document.getElementById('regEmail').value.trim();
    var password = document.getElementById('regPassword').value;

    var isValid = true;

    if (!name || name.length < 2) {
        alert('Введите ваше имя');
        return;
    }

    var cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 11 || !(cleanPhone.startsWith('7') || cleanPhone.startsWith('8'))) {
        document.getElementById('regPhoneError').textContent = 'Введите корректный номер (11 цифр)';
        document.getElementById('regPhoneError').classList.add('show');
        document.getElementById('regPhone').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('regPhoneError').classList.remove('show');
        document.getElementById('regPhone').classList.remove('error');
    }

    if (!isValidEmail(email)) {
        document.getElementById('regEmailError').classList.add('show');
        document.getElementById('regEmail').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('regEmailError').classList.remove('show');
        document.getElementById('regEmail').classList.remove('error');
    }

    if (password.length < 6) {
        document.getElementById('regPasswordError').classList.add('show');
        document.getElementById('regPassword').classList.add('error');
        isValid = false;
    } else {
        document.getElementById('regPasswordError').classList.remove('show');
        document.getElementById('regPassword').classList.remove('error');
    }

    if (!isValid) return;

    var users = getUsers();
    if (users.some(function(u) { return u.email === email; })) {
        alert('Пользователь с таким email уже существует');
        return;
    }
    if (users.some(function(u) { return u.phone === cleanPhone; })) {
        alert('Пользователь с таким телефоном уже существует');
        return;
    }

    var newUser = {
        id: Date.now().toString(36),
        name: name,
        phone: cleanPhone,
        email: email,
        password: password,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    alert('✅ Регистрация успешна! Теперь войдите в аккаунт.');
    document.querySelector('.auth-tab[data-tab="login"]')?.click();

    document.getElementById('regName').value = '';
    document.getElementById('regPhone').value = '';
    document.getElementById('regEmail').value = '';
    document.getElementById('regPassword').value = '';
}

// ====== ВХОД ======
function loginUser() {
    var login = document.getElementById('loginEmail').value.trim();
    var password = document.getElementById('loginPassword').value;

    if (!login || !password) {
        alert('Заполните все поля');
        return;
    }

    var users = getUsers();
    var user = null;
    var cleanLogin = login.replace(/\D/g, '');

    if (isValidEmail(login)) {
        user = users.find(function(u) { return u.email === login && u.password === password; });
    } else if (cleanLogin.length === 11) {
        user = users.find(function(u) { return u.phone === cleanLogin && u.password === password; });
    }

    if (user) {
        window.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        alert('✅ Добро пожаловать, ' + user.name + '!');
        closeModal('authModal');
        updateProfileUI();
        updateNavProfileIcon(true);
    } else {
        document.getElementById('loginError').textContent = 'Неверный логин или пароль';
        document.getElementById('loginError').classList.add('show');
    }
}

// ====== ВЫХОД ======
function logoutUser() {
    if (confirm('Выйти из аккаунта?')) {
        window.currentUser = null;
        localStorage.removeItem('currentUser');
        closeProfilePage();
        closeBurgerMenu();
        updateProfileUI();
        updateNavProfileIcon(false);
        alert('Вы вышли из аккаунта');
    }
}

// ====== ОБНОВЛЕНИЕ UI ======
function updateProfileUI() {
    var user = window.currentUser;
    var avatar = document.getElementById('profileUserAvatar');
    var name = document.getElementById('profileUserName');
    var email = document.getElementById('profileUserEmail');
    var burgerAvatar = document.getElementById('burgerAvatar');
    var burgerName = document.getElementById('burgerName');
    var burgerEmail = document.getElementById('burgerEmailText');

    if (user) {
        var initial = user.name.charAt(0).toUpperCase();
        avatar.textContent = initial;
        name.textContent = user.name;
        email.textContent = user.email;
        burgerAvatar.textContent = initial;
        burgerName.textContent = user.name;
        burgerEmail.textContent = user.email;
    } else {
        avatar.textContent = '👤';
        name.textContent = 'Гость';
        email.textContent = 'Не авторизован';
        burgerAvatar.textContent = '👤';
        burgerName.textContent = 'Гость';
        burgerEmail.textContent = 'Войдите в аккаунт';
    }
    renderProfileBookings();
}

// ====== ОБНОВЛЕНИЕ ИКОНКИ ======
function updateNavProfileIcon(isAuth) {
    var profileTab = document.getElementById('navProfileTab');
    if (profileTab) {
        var icon = profileTab.querySelector('.icon');
        var label = profileTab.querySelector('.label');
        icon.textContent = isAuth ? '👤' : '👤';
        label.textContent = 'Профиль';
    }
}

// ====== ОТКРЫТИЕ/ЗАКРЫТИЕ ПРОФИЛЯ ======
function openProfilePage() {
    var page = document.getElementById('profilePage');
    page.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateProfileUI();
}

function closeProfilePage() {
    var page = document.getElementById('profilePage');
    page.classList.remove('open');
    document.body.style.overflow = '';
}

// ====== БУРГЕР-МЕНЮ ======
function openBurgerMenu() {
    document.getElementById('burgerMenu').classList.add('open');
    document.getElementById('burgerOverlay').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeBurgerMenu() {
    document.getElementById('burgerMenu').classList.remove('open');
    document.getElementById('burgerOverlay').classList.remove('open');
    document.body.style.overflow = '';
}

// ====== ИНИЦИАЛИЗАЦИЯ ======
function initAuth() {
    var saved = localStorage.getItem('currentUser');
    if (saved) {
        try {
            window.currentUser = JSON.parse(saved);
            updateProfileUI();
            updateNavProfileIcon(true);
        } catch (e) {
            window.currentUser = null;
        }
    }

    // Телефон
    var phoneInput = document.getElementById('regPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            var digits = this.value.replace(/\D/g, '');
            this.value = digits;
        });
        phoneInput.addEventListener('blur', function() {
            var value = this.value;
            if (value && (value.startsWith('7') || value.startsWith('8'))) {
                this.value = formatPhone(value);
            }
        });
        phoneInput.addEventListener('focus', function() {
            var digits = this.value.replace(/\D/g, '');
            if (digits) {
                this.value = digits;
            }
        });
    }

    document.getElementById('loginBtn')?.addEventListener('click', loginUser);
    document.getElementById('loginPassword')?.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') loginUser();
    });

    document.getElementById('registerBtn')?.addEventListener('click', registerUser);
    document.getElementById('regPassword')?.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') registerUser();
    });

    document.getElementById('profileLogoutBtn')?.addEventListener('click', logoutUser);
    document.getElementById('burgerLogout')?.addEventListener('click', logoutUser);

    document.getElementById('burgerBtnInside')?.addEventListener('click', openBurgerMenu);
    document.getElementById('burgerClose')?.addEventListener('click', closeBurgerMenu);
    document.getElementById('burgerOverlay')?.addEventListener('click', closeBurgerMenu);

    document.getElementById('navProfileTab')?.addEventListener('click', function(e) {
        e.preventDefault();
        if (window.currentUser) {
            openProfilePage();
        } else {
            openModal('authModal');
        }
    });

    document.getElementById('burgerChangeAvatar')?.addEventListener('click', function() {
        alert('🖼️ Функция изменения аватарки будет доступна в ближайшее время');
        closeBurgerMenu();
    });

    document.getElementById('burgerSupport')?.addEventListener('click', function() {
        alert('💬 Служба поддержки: support@zapispro.ru\n\nМы ответим в течение 24 часов');
        closeBurgerMenu();
    });

    document.getElementById('profileSupportLink')?.addEventListener('click', function(e) {
        e.preventDefault();
        alert('💬 Служба поддержки: support@zapispro.ru\n\nМы ответим в течение 24 часов');
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (document.getElementById('profilePage').classList.contains('open')) {
                closeProfilePage();
            }
            if (document.getElementById('burgerMenu').classList.contains('open')) {
                closeBurgerMenu();
            }
        }
    });

    console.log('🔐 Авторизация загружена');
}

document.addEventListener('DOMContentLoaded', initAuth);