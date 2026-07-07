# Структура проекта Colendar

## Верхний уровень
- [index.html](index.html) — главная страница поиска, авторизации и профиля.
- [booking/](booking) — отдельный сценарий записи клиента.
- [partner/](partner) — вход партнера и админ-панель бизнеса.
- [css/](css) — общие стили интерфейса.
- [js/](js) — общая клиентская логика.
- [data/](data) — данные проекта и заготовки для бизнесов.

## Главная страница
- [js/data.js](js/data.js) — общее хранилище, стартовые бизнесы и работа с `localStorage`.
- [js/search.js](js/search.js) — поиск бизнеса и открытие карточки.
- [js/auth.js](js/auth.js) — вход, регистрация и профиль пользователя.
- [js/profile.js](js/profile.js) — список личных записей.
- [js/ui.js](js/ui.js) — модалки, табы и общие UI-действия.
- [js/app.js](js/app.js) — навигация нижнего меню.

## Запись
- [booking/index.html](booking/index.html) — пошаговая запись клиента.
- [booking/js/booking.js](booking/js/booking.js) — отдельная версия логики записи, пока не подключена к основному сценарию страницы.
- [booking/css/booking.css](booking/css/booking.css) — стили записи.

## Партнерская часть
- [partner/index.html](partner/index.html) — вход и регистрация бизнеса.
- [partner/dashboard.html](partner/dashboard.html) — дашборд управления бизнесом.
- [partner/js/partner.js](partner/js/partner.js) — вся логика партнерского кабинета.
- [partner/css/partner.css](partner/css/partner.css) — стили партнерской части.

## Текущий поток данных
- Пользователи хранятся в `localStorage`.
- Бизнесы хранятся в `localStorage` и инициализируются из [js/data.js](js/data.js).
- Текущий партнер хранится в `sessionStorage`.
- Выбранный бизнес для записи передается через `sessionStorage` и используется на [booking/index.html](booking/index.html).