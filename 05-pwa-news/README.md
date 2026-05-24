<div align="center">

# 📰 PWA News Aggregator — Прогрессивное новостное приложение

### Лабораторная работа №5 · Progressive Web Apps (PWA)

<br/>

![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![Service Worker](https://img.shields.io/badge/Service%20Worker-Offline-FF6F00?style=for-the-badge&logo=googlechrome&logoColor=white)
![Manifest](https://img.shields.io/badge/Web%20App-Manifest-0F172A?style=for-the-badge&logo=webmanifest&logoColor=white)
![Push API](https://img.shields.io/badge/Push%20API-Notifications-2563EB?style=for-the-badge&logo=firebase&logoColor=white)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white)

<br/>

> Прогрессивное веб-приложение для агрегации новостей с поддержкой  
> **установки на устройство, офлайн-режима, кэширования, IndexedDB и push-уведомлений**,  
> реализованное на **HTML/CSS/JavaScript + Node.js/Express**.

</div>

---

## 1. Цели и задачи лабораторной работы

**Цель работы:** получить практические навыки разработки прогрессивного веб-приложения (PWA), изучить ключевые механизмы Web App Manifest, Service Worker, Cache API, IndexedDB и Push API, а также научиться превращать обычный веб-сайт в устанавливаемое приложение с офлайн-доступом.

**Задачи:**

- Изучить архитектурные принципы **Progressive Web Apps** и требования к приложению, которое может быть установлено на мобильное устройство как самостоятельная программа.
- Освоить структуру **Web App Manifest**: метаданные приложения, режим отображения `standalone`, иконки, ярлыки, ориентацию и стартовый URL.
- Реализовать **Service Worker** с несколькими стратегиями кэширования: `Cache-First`, `Network-First`, `Stale-While-Revalidate`.
- Организовать **офлайн-режим** с помощью Cache API и отображения ранее сохранённых новостей при отсутствии сети.
- Реализовать серверную часть на **Node.js + Express** для проксирования NewsAPI и обслуживания Push API.
- Освоить механизм **push-уведомлений** через VAPID-ключи, `PushManager.subscribe()` и `web-push`.
- Реализовать сохранение отдельных статей в **IndexedDB** для офлайн-чтения и очистку устаревших данных.
- Проверить соответствие приложения критериям PWA в **Lighthouse** и добиться высокой оценки по категории Progressive Web App.

---

## 2. Стек технологий

| Компонент | Технология | Назначение |
|---|---|---|
| Клиентская часть | HTML5 / CSS3 / JavaScript | UI и логика фронтенда |
| Сервер | Node.js + Express | API-прокси, push-уведомления |
| HTTP-клиент | Axios | Запросы к NewsAPI |
| PWA-манифест | Web App Manifest | Установка приложения |
| Офлайн-режим | Service Worker + Cache API | Кэширование ресурсов и API |
| Локальное хранилище | IndexedDB | Сохранение статей офлайн |
| Уведомления | Push API + web-push | Push-рассылка |
| Источник данных | NewsAPI.org | Новости по категориям и поиску |

---

## 3. Архитектура и файловая структура

Проект разделён на **серверную** и **клиентскую** части. Клиент отвечает за отображение новостей, регистрацию Service Worker, установку PWA и сохранение данных. Сервер обеспечивает проксирование NewsAPI, хранение push-подписок и отправку уведомлений.

```text
pwa-news/
├── public/                                      ← Клиентская часть PWA
│   ├── css/
│   │   └── styles.css                           # Стили интерфейса
│   ├── js/
│   │   ├── app.js                               # Основная логика: загрузка, кэш, IndexedDB
│   │   └── pwa.js                               # Регистрация SW, install prompt, push
│   ├── icons/
│   │   ├── icon-72x72.png
│   │   ├── icon-96x96.png
│   │   ├── icon-128x128.png
│   │   ├── icon-144x144.png
│   │   ├── icon-152x152.png
│   │   ├── icon-192x192.png
│   │   ├── icon-384x384.png
│   │   ├── icon-512x512.png
│   │   ├── badge-72x72.png
│   │   └── news-placeholder.jpg
│   ├── screenshots/
│   │   ├── home.jpg
│   │   └── mobile.jpg
│   ├── index.html                               # Главная страница приложения
│   ├── manifest.json                            # Web App Manifest
│   ├── service-worker.js                        # Service Worker, кэширование, push
│   └── offline.html                             # Офлайн-страница
│
├── server/
│   └── index.js                                 # Express API + VAPID + маршруты новостей
│
├── .env                                         # Ключи NewsAPI и VAPID
├── package.json                                 # npm-скрипты и зависимости
├── .gitignore
└── README.md
```

### Архитектурная схема

```text
                         ┌──────────────────────────────┐
                         │          NewsAPI.org         │
                         │   /top-headlines /everything │
                         └──────────────┬───────────────┘
                                        │
                                axios / HTTP
                                        │
                    ┌───────────────────▼───────────────────┐
                    │         Node.js + Express API         │
                    │                                       │
                    │  /api/news                            │
                    │  /api/news/search                     │
                    │  /api/categories                      │
                    │  /api/news/archive                    │
                    │  /api/subscribe / send-notification   │
                    └───────────────────┬───────────────────┘
                                        │
                                   fetch / JSON
                                        │
          ┌─────────────────────────────▼─────────────────────────────┐
          │                      Клиентское PWA                       │
          │                                                           │
          │  index.html + styles.css + app.js + pwa.js                │
          │  - категории                                               │
          │  - поиск                                                   │
          │  - offline UI                                              │
          │  - install prompt                                          │
          │  - push subscribe                                          │
          └───────────────────────┬───────────────────────────────────┘
                                  │
                  ┌───────────────▼───────────────┐
                  │       Service Worker          │
                  │                               │
                  │  Cache API                    │
                  │  offline fallback             │
                  │  push event                   │
                  │  notificationclick            │
                  └───────────────┬───────────────┘
                                  │
                    ┌─────────────▼─────────────┐
                    │     IndexedDB / Cache     │
                    │ savedArticles / news-cache│
                    └───────────────────────────┘
```

---

## 4. Технический разбор ключевых компонентов

### 4.1 `manifest.json` — превращение сайта в устанавливаемое приложение

Файл `manifest.json` описывает метаданные PWA, необходимые браузеру для установки приложения на домашний экран, показа splash screen и запуска в режиме отдельного окна.

```json
{
    "name": "PWA Новости - прогрессивное новостное приложение",
    "short_name": "PWA News",
    "description": "Новостное приложение с поддержкой офлайн-режима и push-уведомлений",
    "theme_color": "#0F172A",
    "background_color": "#F8FAFC",
    "display": "standalone",
    "display_override": ["window-controls-overlay", "standalone"],
    "scope": "/",
    "start_url": "/",
    "orientation": "portrait-primary",
    "lang": "ru",
    "icons": [
        {
            "src": "/icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/icons/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any maskable"
        }
    ]
}
```

### Что здесь важно

- `display: "standalone"` убирает адресную строку браузера и делает интерфейс похожим на нативное приложение.
- `start_url` определяет, с какого маршрута приложение стартует после установки.
- `scope` ограничивает область действия установленного приложения.
- `theme_color` и `background_color` используются для системной окраски splash screen.
- `icons` обязательны для корректной установки и отображения ярлыка на устройстве.

---

### 4.2 `service-worker.js` — офлайн-режим и стратегии кэширования

Service Worker является центральным компонентом PWA. Он запускается в отдельном контексте браузера, перехватывает сетевые запросы и реализует стратегию кэширования в зависимости от типа ресурса.

```javascript
const CACHE_NAME = 'pwa-news-v1';
const API_CACHE_NAME = 'api-cache-v1';
const STATIC_CACHE_NAME = 'static-v1';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/js/pwa.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/icons/news-placeholder.jpg',
    '/icons/badge-72x72.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (
                        cacheName !== CACHE_NAME &&
                        cacheName !== API_CACHE_NAME &&
                        cacheName !== STATIC_CACHE_NAME
                    ) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});
```

### Используемые стратегии

- **Static assets** (`CSS`, `JS`, иконки): стратегия **Cache-First** — сначала берём из кэша, затем из сети.
- **API-запросы**: стратегия **Network-First / Stale-While-Revalidate** — стараемся получить свежие данные, а при сбое используем кэш.
- **Навигационные HTML-запросы**: **Network-First** с офлайн-fallback.

Обработка запросов:

```javascript
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    if (url.pathname.startsWith('/api/')) {
        event.respondWith(handleApiRequest(request));
        return;
    }

    if (isStaticAsset(request)) {
        event.respondWith(handleStaticRequest(request));
        return;
    }

    if (request.mode === 'navigate') {
        event.respondWith(handleNavigationRequest(request));
        return;
    }

    event.respondWith(handleGenericRequest(request));
});
```

---

### 4.3 Реализация обязательных API-endpoint’ов на сервере

Одно из обязательных заданий — дописать эндпоинты категорий и архивных новостей в `server/index.js`.

```javascript
app.get('/api/categories', (req, res) => {
    const categories = [
        { id: 'general', name: 'Главное', icon: '📰' },
        { id: 'technology', name: 'Технологии', icon: '💻' },
        { id: 'science', name: 'Наука', icon: '🔬' },
        { id: 'sports', name: 'Спорт', icon: '⚽' },
        { id: 'entertainment', name: 'Культура', icon: '🎭' },
        { id: 'business', name: 'Бизнес', icon: '💼' },
        { id: 'health', name: 'Здоровье', icon: '🏥' }
    ];

    res.json(categories);
});

app.get('/api/news/archive', async (req, res) => {
    try {
        const { date, category = 'general' } = req.query;

        if (!date) {
            return res.status(400).json({ error: 'Date parameter required' });
        }

        const response = await axios.get(`${process.env.NEWS_API_URL}/everything`, {
            params: {
                q: category === 'general' ? 'news' : category,
                from: date,
                to: date,
                sortBy: 'publishedAt',
                apiKey: process.env.NEWS_API_KEY,
                pageSize: 50,
                language: 'ru'
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Archive API error:', error.message);
        res.status(500).json({ error: 'Failed to fetch archive news' });
    }
});
```

### Архитектурный смысл

- `/api/categories` избавляет клиент от жёсткого хардкода всех категорий.
- `/api/news/archive` позволяет реализовать логику просмотра новостей по конкретной дате.
- Сервер выступает как **безопасная прокси-прослойка**: API-ключ NewsAPI не раскрывается в браузере.

---

### 4.4 `app.js` — сохранение статей в IndexedDB

Для полноценного офлайн-чтения недостаточно только Cache API, потому что пользователь может захотеть сохранять **отдельные статьи** как пользовательские данные. Для этого применяется IndexedDB.

```javascript
function saveArticleForOffline(article) {
    if (!('indexedDB' in window)) {
        alert('IndexedDB не поддерживается вашим браузером');
        return;
    }

    const request = indexedDB.open('NewsDB', 1);

    request.onerror = (event) => {
        console.error('IndexedDB error:', event.target.error);
    };

    request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains('savedArticles')) {
            const store = db.createObjectStore('savedArticles', { keyPath: 'url' });
            store.createIndex('savedAt', 'savedAt', { unique: false });
        }
    };

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['savedArticles'], 'readwrite');
        const store = transaction.objectStore('savedArticles');

        const articleToSave = {
            ...article,
            savedAt: Date.now(),
            _cached: true
        };

        store.put(articleToSave);

        transaction.oncomplete = () => {
            showNotification('Статья сохранена для офлайн-чтения');
            updateArticleCardForOffline(article.url);
        };

        transaction.onerror = (error) => {
            console.error('Error saving article:', error);
            showNotification('Ошибка при сохранении статьи', 'error');
        };

        db.close();
    };
}
```

Загрузка сохранённых статей:

```javascript
async function loadSavedArticles() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('NewsDB', 1);

        request.onerror = () => reject(request.error);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['savedArticles'], 'readonly');
            const store = transaction.objectStore('savedArticles');
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => {
                resolve(getAllRequest.result);
                db.close();
            };

            getAllRequest.onerror = () => {
                reject(getAllRequest.error);
                db.close();
            };
        };
    });
}
```

### Почему здесь нужен именно IndexedDB

- Cache API хорошо подходит для **сетевых ответов**, но хуже подходит для управления пользовательскими сущностями.
- IndexedDB позволяет хранить структурированные объекты, индексы и метки времени.
- Можно реализовать очистку старых записей и локальный список «сохранённых статей».

---

### 4.5 Push-уведомления: клиент + сервер + Service Worker

Push в PWA состоит из трёх частей:

1. Клиент запрашивает разрешение и подписку через `PushManager`.
2. Сервер хранит push-подписки и отправляет уведомления через `web-push`.
3. Service Worker принимает push-событие и показывает системное уведомление.

**Клиентская подписка:**

```javascript
async function subscribeToPush() {
    try {
        const response = await fetch('/api/vapid-public-key');
        const { publicKey } = await response.json();

        const registration = await navigator.serviceWorker.ready;

        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey)
        });

        await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
        });

        console.log('Subscription sent to server');
    } catch (error) {
        console.error('Push subscription error:', error);
    }
}
```

**Серверная отправка:**

```javascript
app.post('/api/send-notification', async (req, res) => {
    const { title, body, url } = req.body;

    const payload = JSON.stringify({
        title: title || 'Новости PWA',
        body: body || 'Есть новые статьи для вас',
        url: url || '/',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png'
    });

    const notifications = [];

    subscriptions.forEach(subscription => {
        notifications.push(
            webPush.sendNotification(subscription, payload)
                .catch(error => {
                    if (error.statusCode === 410) {
                        subscriptions = subscriptions.filter(sub =>
                            sub.endpoint !== subscription.endpoint
                        );
                    }
                })
        );
    });

    await Promise.all(notifications);
    res.json({ message: `Notifications sent to ${subscriptions.length} subscribers` });
});
```

**Обработка push в Service Worker:**

```javascript
self.addEventListener('push', (event) => {
    let data = {};

    if (event.data) {
        try {
            data = event.data.json();
        } catch (e) {
            data = {
                title: 'Новости PWA',
                body: event.data.text(),
                url: '/'
            };
        }
    }

    const options = {
        body: data.body || 'Есть новые новости',
        icon: data.icon || '/icons/icon-192x192.png',
        badge: data.badge || '/icons/badge-72x72.png',
        vibrate: ,
        data: {
            url: data.url || '/',
            dateOfArrival: Date.now()
        },
        actions: [
            { action: 'open', title: 'Открыть' },
            { action: 'close', title: 'Закрыть' }
        ],
        tag: 'news-notification',
        renotify: true,
        requireInteraction: true
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Новости PWA', options)
    );
});
```

---

### 4.6 Фоновая синхронизация и custom caching strategy

В дополнительной части работы реализована фоновая синхронизация и стратегия `Network-First` с таймаутом.

```javascript
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-articles') {
        event.waitUntil(syncArticles());
    }
});

async function handleNetworkFirstWithTimeout(request, timeout = 3000) {
    const timeoutPromise = new Promise((resolve) => {
        setTimeout(async () => {
            const cached = await caches.match(request);
            resolve(cached || new Response('Request timeout', { status: 408 }));
        }, timeout);
    });

    const fetchPromise = fetch(request.clone())
        .then(async (response) => {
            if (response.ok) {
                const cache = await caches.open(STATIC_CACHE_NAME);
                cache.put(request, response.clone());
            }
            return response;
        })
        .catch(async () => {
            const cached = await caches.match(request);
            return cached || new Response('Network failed', { status: 503 });
        });

    return Promise.race([fetchPromise, timeoutPromise]);
}
```

Эта стратегия особенно полезна для **критических ресурсов**, где желательно получить свежую версию, но нельзя слишком долго ждать ответа сети.

---

## 5. Результаты тестирования и сценарии работы

### Сценарий 1 — Первый запуск приложения и загрузка новостей

После загрузки `index.html` выполняется `initApp()`, которое вызывает `loadNews(state.currentCategory)`. Клиент отправляет запрос на `/api/news?category=general`, Express-приложение проксирует его в NewsAPI и возвращает JSON со списком статей. Карточки новостей рендерятся через `createNewsCard(article)`, а затем результаты сохраняются в Cache API для последующего офлайн-доступа.

<p align="center">
  <img src="./screenshots/Снимок экрана 2026-05-24 121129.png" width="420" alt="Главный экран PWA с загруженными новостями"/>
  &nbsp;&nbsp;
  <img src="./screenshots/Снимок экрана 2026-05-24 121156.png" width="420" alt="Офлайн-режим с кэшированными новостями"/>
</p>
<p align="center"><i>Слева: главный экран приложения с карточками новостей и навигацией по категориям. Справа: офлайн-режим — отображение ранее кэшированных статей при отсутствии сети.</i></p>

---

### Сценарий 2 — Работа Service Worker и офлайн-режим

После первой загрузки браузер регистрирует `service-worker.js`, который кэширует статические ресурсы и API-ответы. При отключении интернета событие `offline` вызывает `handleOffline()`, интерфейс показывает индикатор офлайн-режима, а клиент пытается восстановить статьи из `news-cache`. Если ответ в кэше найден, пользователь продолжает работать с приложением без доступа к сети.

<p align="center">
  <img src="./screenshots/Снимок экрана 2026-05-24 121410.png" width="420" alt="Установка PWA или Lighthouse PWA отчет"/>
</p>
<p align="center"><i>Скриншот демонстрирует PWA-функциональность: установку приложения на устройство или результат проверки в Lighthouse по категории Progressive Web App.</i></p>

---

### Сценарий 3 — Установка приложения на устройство

Когда браузер генерирует событие `beforeinstallprompt`, стандартный системный prompt перехватывается, сохраняется в `deferredPrompt`, а кнопка `installBtn` становится видимой. После нажатия пользователь получает диалог установки. При успешной установке событие `appinstalled` скрывает кнопку и подтверждает, что сайт теперь работает как отдельное приложение в режиме `standalone`.

---

### Сценарий 4 — Push-уведомления

Через 5 секунд после загрузки интерфейс предлагает пользователю разрешить уведомления. После подтверждения браузер создаёт push-подписку и отправляет её на сервер. Сервер хранит подписки в массиве `subscriptions` и может отправлять уведомления через `/api/send-notification`. Service Worker обрабатывает событие `push` и показывает системное уведомление даже при закрытом клиентском окне.

---

### Сценарий 5 — Сохранение статей в IndexedDB

При выборе команды «сохранить статью» вызывается `saveArticleForOffline(article)`. Объект статьи записывается в хранилище `savedArticles` базы `NewsDB`, а интерфейс маркирует карточку как локально сохранённую. При следующем открытии приложения пользователь может загрузить список сохранённых записей даже без интернет-соединения.

---

## 6. Теоретический базис для защиты работы

<details>
<summary><strong>❓ Вопрос 1: В чём разница между стратегиями Cache-First и Network-First?</strong></summary>

**Ответ:**

Стратегии кэширования определяют, откуда приложение пытается получить ресурс — сначала из кэша или сначала из сети.

| Стратегия | Принцип | Плюсы | Минусы | Когда применять |
|---|---|---|---|---|
| **Cache-First** | Сначала кэш, потом сеть | Очень быстро, работает офлайн | Можно получить устаревшие данные | CSS, JS, иконки, изображения |
| **Network-First** | Сначала сеть, потом кэш | Более свежие данные | При медленной сети ответ дольше | HTML, API, динамический контент |
| **Stale-While-Revalidate** | Сначала кэш, параллельно обновление из сети | Быстро и относительно свежо | Сложнее логика | API-ответы и часто обновляемый контент |

В проекте:
- статические ресурсы обрабатываются по **Cache-First**;
- API и навигационные запросы — по **Network-First** или смешанной логике с fallback на кэш.

</details>

<details>
<summary><strong>❓ Вопрос 2: Как Service Worker обеспечивает работу приложения в офлайн-режиме?</strong></summary>

**Ответ:**

Service Worker — это специальный фоновый скрипт браузера, который может перехватывать сетевые запросы и возвращать данные не из интернета, а из локального кэша.

### Жизненный цикл:

1. **Регистрация** — через `navigator.serviceWorker.register('/service-worker.js')`.
2. **Установка** — событие `install`, где выполняется предварительное кэширование.
3. **Активация** — событие `activate`, где очищаются старые кэши.
4. **Работа** — событие `fetch`, где SW решает, откуда вернуть ресурс.

### Механизм офлайн-работы:

- CSS, JS, HTML и изображения сохраняются в Cache API при первой загрузке.
- Когда пользователь теряет интернет, `fetch()` к реальной сети падает.
- Service Worker перехватывает ошибку и возвращает кэшированную версию ресурса.
- Для новостей дополнительно используется кэш API-ответов и IndexedDB для отдельных статей.

Именно поэтому приложение продолжает работать даже после полного отключения сети.

</details>

<details>
<summary><strong>❓ Вопрос 3: Какие данные хранит Web App Manifest и зачем нужен каждый параметр?</strong></summary>

**Ответ:**

`manifest.json` — это конфигурационный файл, который сообщает браузеру, как должно выглядеть и запускаться устанавливаемое веб-приложение.

### Основные параметры:

| Поле | Назначение |
|---|---|
| `name` | Полное имя приложения в системных UI |
| `short_name` | Короткое имя под иконкой |
| `description` | Описание приложения |
| `start_url` | Стартовая страница после запуска |
| `scope` | Область маршрутов приложения |
| `display` | Режим отображения (`standalone`, `fullscreen`, `browser`) |
| `theme_color` | Цвет интерфейса системы / браузера |
| `background_color` | Цвет splash screen |
| `orientation` | Предпочтительная ориентация экрана |
| `icons` | Иконки разных размеров для установки |
| `shortcuts` | Быстрые действия по долгому нажатию |
| `screenshots` | Скриншоты для магазина / install-prompt UI |

Без корректного манифеста приложение не сможет полноценно устанавливаться и запускаться в режиме, похожем на нативный.

</details>

<details>
<summary><strong>❓ Вопрос 4: Как работают push-уведомления в PWA и чем они отличаются от нативных?</strong></summary>

**Ответ:**

Push-уведомления в PWA строятся на Web Push архитектуре.

### Этапы работы:

1. Клиент получает разрешение от пользователя:  
   `Notification.requestPermission()`
2. Браузер создаёт push-подписку через `PushManager.subscribe(...)`.
3. Подписка отправляется на сервер.
4. Сервер шифрует payload с помощью VAPID и отправляет push через `web-push`.
5. Браузер доставляет событие `push` в Service Worker.
6. Service Worker показывает системное уведомление.

### Отличие от нативных приложений:

| Аспект | PWA Push | Нативные push |
|---|---|---|
| Транспорт | Web Push protocol | Firebase APNs / FCM / APNs |
| Зависимость от браузера | Высокая | Нет |
| Поддержка iOS | Ограниченная и позднее добавленная | Полная |
| Фоновая логика | Ограничена SW | Шире |
| Доступ к системным API | Ограничен | Максимальный |

То есть PWA может показывать уведомления почти как нативное приложение, но всё же имеет ограничения по платформенной интеграции.

</details>

<details>
<summary><strong>❓ Вопрос 5: Какие ограничения есть у PWA по сравнению с нативными приложениями?</strong></summary>

**Ответ:**

PWA даёт высокую доступность и быстрый time-to-market, но уступает нативным приложениям по глубине интеграции с ОС.

### Основные ограничения:

- Ограниченный доступ к системному оборудованию и некоторым API устройства.
- Зависимость от браузера и его поддержки стандартов.
- Push-уведомления и background-сценарии работают не одинаково на всех платформах.
- Нет полноценного доступа к App Store / Google Play как у нативных приложений, если не использовать дополнительные упаковщики.
- Производительность сложных интерфейсов и графики обычно ниже, чем у нативных Android/iOS приложений.
- Ограничения на длительные фоновые процессы, Bluetooth/NFC/расширенную работу с файловой системой.

Тем не менее для новостных сервисов, каталогов, контентных платформ и сервисов чтения PWA часто оказывается очень эффективным компромиссом между стоимостью и функциональностью.

</details>

---

## 7. Ключевые фрагменты исходного кода

### `server/index.js`

```javascript
const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const webPush = require('web-push');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
```

### `package.json`

```json
{
  "name": "pwa-news",
  "version": "1.0.0",
  "description": "Progressive Web App для новостей",
  "main": "server/index.js",
  "scripts": {
    "start": "node server/index.js",
    "dev": "nodemon server/index.js",
    "build": "echo 'Сборка статических файлов...'"
  }
}
```

### `.env`

```env
PORT=3000
NEWS_API_KEY=your_api_key_here
NEWS_API_URL=https://newsapi.org/v2
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
CONTACT_EMAIL=admin@example.com
```

---

## 8. Запуск и проверка проекта

```bash
# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Production запуск
npm start

# Проверка PWA через Lighthouse
# Chrome DevTools → Lighthouse → Progressive Web App → Generate report

# Генерация VAPID ключей
npm install -g web-push
web-push generate-vapid-keys
```

### Проверка функциональности

```bash
# Тест push-уведомления
curl -X POST http://localhost:3000/api/send-notification \
  -H "Content-Type: application/json" \
  -d '{"title":"Тест","body":"Тестовое уведомление","url":"/"}'
```

---

<div align="center">

**Лабораторная работа №5** · Дисциплина: Мобильная разработка  
СКФУ · Прикладная информатика в экономике · 2026

</div>