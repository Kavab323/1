// ============================================
// ПОИСК БИЗНЕСОВ
// ============================================

var businesses = [];

function loadBusinesses() {
    businesses = getBusinesses();
}

function searchBusinesses(query) {
    query = query.trim().toLowerCase();
    if (!query) return [];
    return businesses.filter(function(biz) {
        var matchName = biz.name.toLowerCase().includes(query);
        var matchCode = biz.code === query;
        return matchName || matchCode;
    });
}

function renderResults(results) {
    var container = document.getElementById('resultsContainer');
    var list = document.getElementById('resultsList');
    var count = document.getElementById('resultsCount');

    if (businesses.length === 0) {
        container.classList.add('active');
        count.textContent = '';
        list.innerHTML =
            '<div class="empty-state">' +
            '<span class="big-icon">🏢</span>' +
            '<h3>Пока нет организаций</h3>' +
            '<p>Станьте первым партнером и<br>зарегистрируйте свой бизнес!</p>' +
            '</div>';
        return;
    }

    if (results.length === 0) {
        container.classList.add('active');
        count.textContent = '';
        list.innerHTML =
            '<div class="no-results">' +
            '<span class="big-icon">🔍</span>' +
            'Ничего не найдено<br>' +
            '<span style="font-size:14px;color:#4A4A6A;">Попробуйте изменить запрос</span>' +
            '</div>';
        return;
    }

    container.classList.add('active');
    count.textContent = 'Найдено: ' + results.length;

    var html = '';
    results.forEach(function(biz) {
        var heroMaster = biz.masters && biz.masters.length > 0 ? biz.masters[0] : null;
        var avatar = heroMaster && heroMaster.photo ? '<img src="' + heroMaster.photo + '" alt="' + heroMaster.name + '">' : (heroMaster && heroMaster.emoji ? heroMaster.emoji : '🏢');
        var mastersCount = biz.masters ? biz.masters.length : 0;
        var servicesCount = biz.services ? biz.services.length : 0;
        html +=
            '<div class="business-card" data-id="' + biz.id + '">' +
            '<div class="avatar">' + avatar + '</div>' +
            '<div class="info">' +
            '<h3>' + biz.name + '</h3>' +
            '<div class="address">📍 ' + biz.address + '</div>' +
            '<span class="code">Код: ' + biz.code + '</span>' +
            '<div class="business-meta">' + servicesCount + ' услуг • ' + mastersCount + ' маст.' + '</div>' +
            '</div>' +
            '<div class="arrow">›</div>' +
            '</div>';
    });
    list.innerHTML = html;

    list.querySelectorAll('.business-card').forEach(function(el) {
        el.addEventListener('click', function() {
            var id = el.dataset.id;
            var biz = businesses.find(function(b) { return b.id === id; });
            if (biz) openBusinessModal(biz);
        });
    });
}

function openBusinessModal(biz) {
    var modal = document.getElementById('businessModal');
    document.getElementById('modalTitle').textContent = biz.name;
    document.getElementById('modalAddress').textContent = '📍 ' + biz.address;
    document.getElementById('modalPhone').textContent = '📞 ' + (biz.phone || 'Не указан');
    document.getElementById('modalCode').textContent = 'Код: ' + biz.code;

    var heroMaster = biz.masters && biz.masters.length > 0 ? biz.masters[0] : null;
    var modalTitle = document.getElementById('modalTitle');
    if (heroMaster) {
        modalTitle.textContent = biz.name + ' • ' + heroMaster.name;
    }

    var servicesContainer = document.getElementById('modalServices');
    if (biz.services && biz.services.length > 0) {
        var sHtml = '';
        biz.services.forEach(function(s) {
            sHtml +=
                '<div class="service-item">' +
                '<span class="name">' + s.name + '</span>' +
                '<span><span class="duration">⏱' + s.duration + 'мин</span><span class="price">' + s.price + ' ₽</span></span>' +
                '</div>';
        });
        servicesContainer.innerHTML = sHtml;
    } else {
        servicesContainer.innerHTML = '<div style="color:#4A4A6A;font-size:14px;padding:8px;">Услуги не добавлены</div>';
    }

    var mastersContainer = document.getElementById('modalMasters');
    if (biz.masters && biz.masters.length > 0) {
        var mHtml = '';
        biz.masters.forEach(function(m) {
            mHtml +=
                '<div class="master-item">' +
                '<span class="avatar">' + (m.photo ? '<img src="' + m.photo + '" alt="' + m.name + '">' : (m.emoji || '👤')) + '</span>' +
                '<span class="text">' +
                '<span class="name">' + m.name + '</span>' +
                (m.bio ? '<span class="bio">' + m.bio + '</span>' : '') +
                '</span>' +
                '</div>';
        });
        mastersContainer.innerHTML = mHtml;
    } else {
        mastersContainer.innerHTML = '<div style="color:#4A4A6A;font-size:14px;padding:8px;">Мастера не добавлены</div>';
    }

    document.getElementById('modalBookBtn').onclick = function() {
        modal.classList.remove('show');
        sessionStorage.setItem('selectedBusiness', JSON.stringify(biz));
        window.location.href = 'booking/index.html?business=' + encodeURIComponent(biz.name);
    };

    openModal('businessModal');
}

function performSearch() {
    var query = document.getElementById('searchInput').value;
    var results = searchBusinesses(query);
    renderResults(results);
}

function initSearch() {
    loadBusinesses();

    document.getElementById('searchBtn')?.addEventListener('click', performSearch);
    document.getElementById('searchInput')?.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });

    document.getElementById('exampleCode')?.addEventListener('click', function() {
        var biz = businesses.find(function(b) { return b.code === '12345'; });
        if (biz) {
            document.getElementById('searchInput').value = '12345';
            performSearch();
        } else {
            alert('🔍 Организация с кодом 12345 не найдена.\nЗарегистрируйте свой бизнес в разделе "Партнер"');
        }
    });

    renderResults(businesses);
    console.log('🔍 Поиск загружен, бизнесов:', businesses.length);
}

document.addEventListener('DOMContentLoaded', initSearch);