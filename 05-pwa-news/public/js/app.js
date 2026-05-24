const newsContainer = document.getElementById('news-container');
const categoriesNav = document.getElementById('categories-nav');
const searchInput = document.getElementById('search-input');
const archiveDate = document.getElementById('archive-date');
const searchBtn = document.getElementById('search-btn');
const pushBtn = document.getElementById('push-btn');
const offlineBadge = document.getElementById('offline-badge');

let currentCategory = 'general';
let isSubscribed = false;
let swRegistration = null;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadNews();
    initServiceWorker();
    
    // Мониторинг сети онлайн/офлайн
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    updateOnlineStatus();
});

// Проверка статуса сети
function updateOnlineStatus() {
    if (navigator.onLine) {
        offlineBadge.style.display = 'none';
    } else {
        offlineBadge.style.display = 'block';
    }
}

// 1. Загрузка категорий из API
async function loadCategories() {
    try {
        const res = await fetch('/api/categories');
        const categories = await res.json();
        
        categoriesNav.innerHTML = categories.map(cat => `
            <span class="category-chip ${cat.id === currentCategory ? 'active' : ''}" 
                  data-id="${cat.id}">
                ${cat.icon} ${cat.name}
            </span>
        `).join('');

        // Клики по категориям
        document.querySelectorAll('.category-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                currentCategory = e.target.dataset.id;
                loadNews();
            });
        });
    } catch (err) {
        console.error('Ошибка загрузки категорий, возможно мы офлайн');
    }
}

// 2. Отрисовка новостей на экране
async function loadNews(url = `/api/news?category=${currentCategory}`) {
    newsContainer.innerHTML = '<div class="loader">Загрузка свежих новостей...</div>';
    try {
        const res = await fetch(url);
        const data = await res.json();
        
        if (!data.articles || data.articles.length === 0) {
            newsContainer.innerHTML = '<p style="padding:20px;">По вашему запросу ничего не найдено или проверьте сеть.</p>';
            return;
        }

        newsContainer.innerHTML = data.articles.map(article => `
            <article class="news-card">
                ${article.urlToImage ? `<img src="${article.urlToImage}" alt="news">` : '<div style="height:180px; background:#ddd;"></div>'}
                <div class="news-content">
                    <h3>${article.title}</h3>
                    <p>${article.description || 'Описание отсутствует'}</p>
                    <a href="${article.url}" target="_blank">Читать полностью →</a>
                </div>
            </article>
        `).join('');
    } catch (err) {
        newsContainer.innerHTML = '<p style="padding:20px; color: #1976d2; font-weight:bold;">Вы просматриваете сохраненный офлайн-кэш новостей.</p>';
    }
}

// 3. Поиск и Архив по датам (Задание А из методички)
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    const date = archiveDate.value;

    if (date) {
        loadNews(`/api/news/archive?date=${date}&category=${currentCategory}`);
    } else if (query) {
        loadNews(`/api/news/search?q=${encodeURIComponent(query)}`);
    } else {
        loadNews();
    }
});

// --- РЕГИСТРАЦИЯ SERVICE WORKER ---
async function initServiceWorker() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
            swRegistration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker успешно зарегистрирован!');
            initPushSubscription();
        } catch (error) {
            console.error('Ошибка регистрации Service Worker:', error);
        }
    } else {
        pushBtn.textContent = 'Push не поддерживается';
        pushBtn.disabled = true;
    }
}

// --- НАСТРОЙКА PUSH-УВЕДОМЛЕНИЙ ---
async function initPushSubscription() {
    const subscription = await swRegistration.pushManager.getSubscription();
    isSubscribed = !(subscription === null);

    updatePushButton();

    pushBtn.addEventListener('click', async () => {
        pushBtn.disabled = true;
        if (isSubscribed) {
            await unsubscribeUser();
        } else {
            await subscribeUser();
        }
        pushBtn.disabled = false;
    });
}

function updatePushButton() {
    if (isSubscribed) {
        pushBtn.textContent = 'Отключить уведомления';
        pushBtn.style.backgroundColor = '#e0e0e0';
        pushBtn.style.color = '#333';
    } else {
        pushBtn.textContent = 'Включить уведомления';
        pushBtn.style.backgroundColor = '#fff';
        pushBtn.style.color = '#1976d2';
    }
}

async function subscribeUser() {
    try {
        const response = await fetch('/api/vapid-public-key');
        const { publicKey } = await response.json();
        const convertedKey = urlBase64ToUint8Array(publicKey);
        
        const subscription = await swRegistration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: convertedKey
        });

        await fetch('/api/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
        });

        isSubscribed = true;
        updatePushButton();
    } catch (err) {
        console.error('Не удалось подписать пользователя на пуши:', err);
    }
}

async function unsubscribeUser() {
    try {
        const subscription = await swRegistration.pushManager.getSubscription();
        if (subscription) {
            await subscription.unsubscribe();
            await fetch('/api/unsubscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ endpoint: subscription.endpoint })
            });
        }
        isSubscribed = false;
        updatePushButton();
    } catch (err) {
        console.error('Ошибка при отписке:', err);
    }
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}