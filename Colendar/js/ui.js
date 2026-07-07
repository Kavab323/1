// ============================================
// UI-компоненты (модалки)
// ============================================

// ====== ОТКРЫТИЕ/ЗАКРЫТИЕ МОДАЛОК ======
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// ====== ЗАКРЫТИЕ ПО КЛИКУ ВНЕ МОДАЛКИ ======
function setupModalClose(modalId, closeBtnId) {
    const modal = document.getElementById(modalId);
    const closeBtn = document.getElementById(closeBtnId);

    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            closeModal(modalId);
        });
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal(modalId);
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
            closeModal(modalId);
        }
    });
}

// ====== АКТИВАЦИЯ ТАБОВ ======
function setupAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = {
        login: document.getElementById('formLogin'),
        register: document.getElementById('formRegister')
    };

    tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
            tabs.forEach(function(t) { t.classList.remove('active'); });
            tab.classList.add('active');

            const target = tab.dataset.tab;
            if (target === 'login') {
                forms.login.classList.add('active');
                forms.register.classList.remove('active');
                document.getElementById('authTitle').textContent = 'Добро пожаловать!';
                document.getElementById('authSubtitle').textContent = 'Войдите в свой аккаунт';
            } else {
                forms.register.classList.add('active');
                forms.login.classList.remove('active');
                document.getElementById('authTitle').textContent = 'Создайте аккаунт!';
                document.getElementById('authSubtitle').textContent = 'Зарегистрируйтесь и пользуйтесь сервисом';
            }
        });
    });
}

// ====== ПЕРЕКЛЮЧЕНИЕ МЕЖДУ ФОРМАМИ ======
function setupAuthSwitches() {
    document.getElementById('switchToRegister')?.addEventListener('click', function() {
        document.querySelector('.auth-tab[data-tab="register"]')?.click();
    });

    document.getElementById('switchToLogin')?.addEventListener('click', function() {
        document.querySelector('.auth-tab[data-tab="login"]')?.click();
    });
}

// ====== НИЖНЯЯ НАВИГАЦИЯ ======
function setupBottomNav() {
    const navItems = document.querySelectorAll('.bottom-nav a');
    navItems.forEach(function(item) {
        item.addEventListener('click', function() {
            navItems.forEach(function(i) { i.classList.remove('active'); });
            item.classList.add('active');
        });
    });
}

// ====== ИНИЦИАЛИЗАЦИЯ ======
function initUI() {
    setupModalClose('businessModal', 'modalClose');
    setupModalClose('authModal', 'closeAuthModal');
    setupAuthTabs();
    setupAuthSwitches();
    setupBottomNav();
}

document.addEventListener('DOMContentLoaded', initUI);