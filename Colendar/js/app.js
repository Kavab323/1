// ============================================
// ГЛАВНАЯ ЛОГИКА
// ============================================

function initNavigation() {
    document.getElementById('navSearchTab')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.search-section')?.scrollIntoView({ behavior: 'smooth' });
    });

    document.getElementById('navChatTab')?.addEventListener('click', function(e) {
        e.preventDefault();
        if (window.currentUser) {
            alert('💬 Чат с поддержкой\n\nСкоро здесь появится возможность общаться с мастерами и службой поддержки!');
        } else {
            alert('💬 Чтобы начать чат, войдите в аккаунт');
            openModal('authModal');
        }
    });

    document.getElementById('navPartnerTab')?.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = 'partner/index.html';
    });
}

function initApp() {
    console.log('🚀 ЗаписьPro загружена!');
    initNavigation();
}

document.addEventListener('DOMContentLoaded', initApp);