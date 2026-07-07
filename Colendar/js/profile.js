// ============================================
// ПРОФИЛЬ
// ============================================

function renderProfileBookings() {
    var container = document.getElementById('profileBookingsList');

    if (!window.currentUser) {
        container.innerHTML =
            '<div class="booking-empty">' +
            '<span class="emoji">🔒</span>' +
            '<div class="title">Войдите в аккаунт</div>' +
            '<div class="subtitle">Чтобы увидеть свои записи</div>' +
            '</div>';
        return;
    }

    var bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    var userBookings = bookings.filter(function(b) { return b.clientPhone === window.currentUser.phone; });

    if (userBookings.length === 0) {
        container.innerHTML =
            '<div class="booking-empty">' +
            '<span class="emoji">😢</span>' +
            '<div class="title">Нет записей</div>' +
            '<div class="subtitle">Пора записаться к мастеру!</div>' +
            '<button class="btn-book-now" onclick="closeProfilePage(); setTimeout(function(){ document.querySelector(\'.search-section\')?.scrollIntoView({behavior:\'smooth\'}); }, 300);">' +
            '📅 Записаться' +
            '</button>' +
            '</div>';
        return;
    }

    var today = new Date().toISOString().split('T')[0];
    var active = userBookings.filter(function(b) { return b.date >= today; });
    var completed = userBookings.filter(function(b) { return b.date < today; });

    var html = '';

    if (active.length > 0) {
        html += '<div style="margin-bottom:12px;"><strong style="font-size:14px;color:#1A1A2E;">🟢 Активные</strong></div>';
        active.forEach(function(b) {
            html +=
                '<div class="booking-item-profile">' +
                '<div class="service">' + b.service + '</div>' +
                '<div class="detail">' + b.master + ' • ' + b.date + ' в ' + b.time + '</div>' +
                '<span class="status active">Активна</span>' +
                '</div>';
        });
    }

    if (completed.length > 0) {
        html += '<div style="margin:12px 0 8px;"><strong style="font-size:14px;color:#4A4A6A;">✅ Завершенные</strong></div>';
        completed.forEach(function(b) {
            html +=
                '<div class="booking-item-profile">' +
                '<div class="service">' + b.service + '</div>' +
                '<div class="detail">' + b.master + ' • ' + b.date + ' в ' + b.time + '</div>' +
                '<span class="status completed">Завершена</span>' +
                '</div>';
        });
    }

    container.innerHTML = html;
}

function initProfile() {
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

    document.getElementById('navProfileTab')?.addEventListener('click', function(e) {
        e.preventDefault();
        if (window.currentUser) {
            openProfilePage();
        } else {
            openModal('authModal');
        }
    });

    console.log('👤 Профиль загружен');
}

document.addEventListener('DOMContentLoaded', initProfile);