<div align="center">

# 🏃 Activity Tracker — Трекинг физической активности

### Лабораторная работа №3 · Кроссплатформенная разработка с Flutter

<br/>

![Flutter](https://img.shields.io/badge/Flutter-3.16.0-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![Dart](https://img.shields.io/badge/Dart-3.2.0-0175C2?style=for-the-badge&logo=dart&logoColor=white)
![Provider](https://img.shields.io/badge/State-Provider-7B1FA2?style=for-the-badge&logo=flutter&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-sqflite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)
![Architecture](https://img.shields.io/badge/Architecture-MVVM--Provider-009688?style=for-the-badge&logo=googlecloud&logoColor=white)

<br/>

> Кроссплатформенное мобильное приложение для трекинга физической активности,  
> реализованное на **Flutter** с философией **«Everything is a Widget»**,  
> кастомным движком рендеринга, Provider-архитектурой и нативными датчиками устройства.

</div>

---

## 1. Цели и задачи лабораторной работы

**Цель работы:** получить практические навыки разработки кроссплатформенных мобильных приложений на фреймворке Flutter с использованием виджет-ориентированного подхода, реактивного управления состоянием через паттерн Provider, локального хранилища данных на базе SQLite (sqflite), нативных сенсоров устройства и кастомной векторной графики через механизм `CustomPainter`.

**Задачи:**

- Изучить философию Flutter **«Everything is a Widget»**: принципы компоновки декларативного дерева виджетов, разграничение `StatelessWidget` и `StatefulWidget`, концепцию Composition over Inheritance.
- Освоить архитектурный паттерн **Provider** для разделения состояния приложения на независимые `ChangeNotifier`-провайдеры (`ActivityProvider`, `ThemeProvider`, `SensorProvider`) и их внедрение через `MultiProvider`.
- Реализовать полноценный **CRUD-цикл** через ORM-прослойку sqflite: сериализацию моделей (`toMap` / `fromMap`), создание схемы таблиц в `onCreate`, выборку с упорядочиванием и удаление по первичному ключу.
- Интегрировать **нативные датчики** устройства (шагомер `pedometer`, геолокацию `location`, акселерометр `sensors_plus`) через систему плагинов Flutter Platform Channels.
- Реализовать алгоритм **определения типа активности** на основе магнитуды вектора ускорения акселерометра.
- Создать кастомный анимированный виджет **ProgressRing** с использованием `CustomPainter` и `AnimationController` для демонстрации возможностей собственного движка рендеринга Skia/Impeller.
- Освоить **жизненный цикл виджетов** Flutter: корректную инициализацию и освобождение ресурсов в `initState` / `dispose` для предотвращения утечек подписок на потоки сенсоров.

---

## 2. Стек технологий

| Компонент | Технология | Версия |
|---|---|---|
| Фреймворк | Flutter SDK | 3.16.0 |
| Язык программирования | Dart | 3.2.0 |
| Управление состоянием | Provider (ChangeNotifier) | ^6.1.1 |
| Локальная БД (ORM) | sqflite + path | ^2.3.0 / ^1.9.0 |
| Навигация | go_router | ^13.0.0 |
| Шагомер | pedometer | ^4.0.0 |
| Геолокация | location | ^5.0.0 |
| Акселерометр / IMU | sensors_plus | ^4.0.0 |
| Графики | fl_chart | ^0.66.0 |
| Анимации (Lottie) | lottie | ^2.7.0 |
| Форматирование дат | intl | ^0.18.1 |
| Движок рендеринга | Skia / Impeller | встроен в Flutter |

---

## 3. Архитектура и файловая структура

Приложение следует многослойной архитектуре с разделением ответственности: **Models → Services → Providers → Screens/Widgets**.
activity_tracker/
├── lib/
│ │
│ ├── 📂 models/ ← Доменные модели данных
│ │ ├── activity.dart # ActivityRecord (Entity), ActivityType (enum), LatLng
│ │ └── user_stats.dart # UserStats, DailyStats (агрегированная статистика)
│ │
│ ├── 📂 services/ ← Слой доступа к данным и аппаратуре
│ │ ├── database_service.dart # Singleton: sqflite, CRUD-операции, SQL-схема
│ │ └── sensor_service.dart # ChangeNotifier: шагомер, GPS, акселерометр
│ │
│ ├── 📂 providers/ ← Слой состояния (Provider / ChangeNotifier)
│ │ ├── activity_provider.dart # CRUD-состояние тренировок + текущая сессия
│ │ ├── sensor_provider.dart # Обёртка SensorService для Provider-дерева
│ │ └── theme_provider.dart # ThemeMode (light / dark / system)
│ │
│ ├── 📂 screens/ ← Экраны приложения (Stateless Composable)
│ │ ├── home_screen.dart # Главный экран: список тренировок / текущая сессия
│ │ └── stats_screen.dart # Экран статистики с GridView и BarChart
│ │
│ ├── 📂 widgets/ ← Переиспользуемые виджеты
│ │ ├── activity_card.dart # Карточка тренировки (StatelessWidget)
│ │ ├── stats_chart.dart # Обёртка fl_chart — столбчатые диаграммы
│ │ └── progress_ring.dart # Анимированное кольцо (CustomPainter + AnimationController)
│ │
│ └── main.dart # Точка входа: MultiProvider + MaterialApp + NavigationBar
│
├── android/app/src/main/AndroidManifest.xml # Разрешения: ACTIVITY_RECOGNITION, LOCATION
├── ios/Runner/Info.plist # NSLocationWhenInUseUsageDescription, NSMotionUsage
├── pubspec.yaml # Зависимости: provider, sqflite, sensors_plus...
└── README.md

text

### Схема потока данных (Data Flow)
┌──────────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER │
│ │
│ HomeScreen StatsScreen │
│ (Consumer2<ActivityProvider, (Consumer<ActivityProvider>) │
│ SensorProvider>) │
│ ↕ context.watch / Consumer │
└──────────────────┬──────────────────────┬───────────────────────┘
│ │
┌──────────────────▼──────┐ ┌────────────▼──────────────────────┐
│ ActivityProvider │ │ SensorProvider │
│ (ChangeNotifier) │ │ (ChangeNotifier) │
│ - _activities: List │ │ - _stepCount: int │
│ - _currentActivity │ │ - _route: List<LocationData> │
│ - notifyListeners() │ │ - _accelerometerMagnitude │
└──────────┬──────────────┘ └──────────────────────────────────┘
│
┌──────────▼──────────────────────────────────────────────────────┐
│ DATA / SERVICE LAYER │
│ │
│ DatabaseService (Singleton) SensorService │
│ sqflite → activities table pedometer / location / │
│ INSERT / SELECT / DELETE sensors_plus streams │
└─────────────────────────────────────────────────────────────────┘

text

---

## 4. Технический разбор ключевых компонентов

### 4.1 `activity.dart` — Сериализация модели для SQLite

Методы `toMap()` и `fromMap()` обеспечивают двунаправленное преобразование между Dart-объектом и плоской Map-структурой, которую принимает sqflite. Маршрут GPS хранится в колонке `TEXT` как JSON-строка с использованием `jsonEncode` / `jsonDecode`.

```dart
// Вычисляемое свойство: темп в мин/км
double get pace {
  if (distance == 0 || duration.inMinutes == 0) return 0;
  return duration.inMinutes / distance;
}

// Сериализация в Map для INSERT / UPDATE в sqflite
Map<String, dynamic> toMap() {
  return {
    'id':              id,
    'type':            type.index,                      // enum → int
    'startTime':       startTime.millisecondsSinceEpoch,
    'endTime':         endTime?.millisecondsSinceEpoch,  // nullable
    'steps':           steps,
    'distance':        distance,
    'calories':        calories,
    'averageHeartRate': averageHeartRate,
    // GPS-маршрут сериализуется в JSON-строку
    'route': route != null
        ? jsonEncode(route!.map((p) => p.toJson()).toList())
        : null,
  };
}

// Десериализация из Map при SELECT из sqflite
factory ActivityRecord.fromMap(Map<String, dynamic> map) {
  return ActivityRecord(
    id:       map['id'],
    type:     ActivityType.values[map['type']],          // int → enum
    startTime: DateTime.fromMillisecondsSinceEpoch(map['startTime']),
    endTime:  map['endTime'] != null
        ? DateTime.fromMillisecondsSinceEpoch(map['endTime'])
        : null,
    steps:    map['steps'],
    distance: map['distance'],
    calories: map['calories'],
    averageHeartRate: map['averageHeartRate'],
    route:    map['route'] != null
        ? (jsonDecode(map['route']) as List)
              .map((p) => LatLng.fromJson(p))
              .toList()
        : null,
  );
}
```

---

### 4.2 `database_service.dart` — Singleton SQLite через sqflite

`DatabaseService` реализован как **Singleton** через приватный именованный конструктор. Схема БД создаётся в колбэке `onCreate`, SQL-запрос к таблице проверяется `sqflite` при открытии файла базы. Метод удаления использует параметризованный `WHERE id = ?` для защиты от SQL-инъекций.

```dart
// Удаление тренировки по первичному ключу (параметризованный запрос)
Future<void> deleteActivity(String id) async {
  final db = await database;
  await db.delete(
    'activities',
    where: 'id = ?',
    whereArgs: [id],    // sqflite экранирует аргументы автоматически
  );
}

// Агрегированная статистика — обход всех записей в памяти
Future<UserStats> getUserStats() async {
  final db = await database;
  final List<Map<String, dynamic>> maps = await db.query('activities');

  int totalSteps = 0;
  double totalDistance = 0.0;
  int totalCalories = 0;
  double totalPace = 0.0;

  for (var map in maps) {
    totalSteps    += map['steps'] as int;
    totalDistance += map['distance'] as double;
    totalCalories += (map['calories'] as double).toInt();

    if (map['endTime'] != null) {
      final duration = DateTime.fromMillisecondsSinceEpoch(map['endTime'])
          .difference(DateTime.fromMillisecondsSinceEpoch(map['startTime']));
      if (duration.inMinutes > 0 && (map['distance'] as double) > 0) {
        totalPace += duration.inMinutes / (map['distance'] as double);
      }
    }
  }

  return UserStats(
    totalSteps:    totalSteps,
    totalDistance: totalDistance,
    totalCalories: totalCalories,
    totalWorkouts: maps.length,
    averagePace:   maps.isNotEmpty ? totalPace / maps.length : 0,
  );
}
```

---

### 4.3 `sensor_service.dart` — Определение типа активности и расчёт калорий

Алгоритм классификации активности использует **магнитуду вектора ускорения** `|a| = |ax| + |ay| + |az|` из акселерометра как простой, но эффективный признак для разграничения уровней интенсивности.

```dart
// Автоматическое определение типа активности по акселерометру
ActivityType detectActivityType() {
  if (_accelerometerMagnitude < 3) {
    return ActivityType.gym;     // статическая нагрузка / покой
  } else if (_accelerometerMagnitude < 6) {
    return ActivityType.walking; // ходьба — умеренные колебания
  } else if (_accelerometerMagnitude < 10) {
    return ActivityType.running; // бег — высокие колебания
  } else {
    return ActivityType.cycling; // езда — хаотичные высокочастотные колебания
  }
}

// Расчёт калорий по формуле: W × MET × t(ч)
// MET (Metabolic Equivalent of Task) — метаболический эквивалент задачи
double calculateCalories(int steps, double distance, Duration duration) {
  const double weight = 75.0; // кг (может быть параметром пользователя)

  final double met;
  switch (detectActivityType()) {
    case ActivityType.walking:  met = 3.5; break;
    case ActivityType.running:  met = 8.0; break;
    case ActivityType.cycling:  met = 6.0; break;
    case ActivityType.gym:      met = 4.0; break;
  }

  final double hours = duration.inMinutes / 60.0;
  return weight * met * hours;  // ккал
}
```

---

### 4.4 `progress_ring.dart` — CustomPainter + AnimationController

Виджет демонстрирует ключевое преимущество Flutter: собственный движок рендеринга позволяет **попиксельно управлять отрисовкой** через `Canvas` API без обращения к нативным компонентам платформы. `AnimationController` с кривой `Curves.easeInOut` обеспечивает плавную анимацию при изменении прогресса.

```dart
class _ProgressRingState extends State<ProgressRing>
    with SingleTickerProviderStateMixin {

  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,                                // Ticker привязан к экрану (60/120 FPS)
      duration: const Duration(milliseconds: 1000),
    );
    _animation = Tween<double>(begin: 0, end: widget.progress)
        .animate(CurvedAnimation(parent: _controller, curve: Curves.easeInOut));
    _controller.forward();
  }

  @override
  void didUpdateWidget(ProgressRing old) {
    super.didUpdateWidget(old);
    // При изменении прогресса — перезапускаем анимацию
    if (old.progress != widget.progress) _controller.forward(from: 0);
  }

  @override
  void dispose() {
    _controller.dispose(); // Обязательно освобождаем Ticker — предотвращаем утечку
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) => CustomPaint(
        size: Size(widget.size, widget.size),
        painter: _ProgressRingPainter(
          progress: _animation.value,
          color:    widget.color,
        ),
        child: Center(child: widget.child),
      ),
    );
  }
}

class _ProgressRingPainter extends CustomPainter {
  final double progress;
  final Color color;
  _ProgressRingPainter({required this.progress, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    const strokeWidth = 12.0;
    final radius = size.width / 2 - strokeWidth / 2;

    // 1. Фоновая дорожка (серая)
    canvas.drawCircle(
      center, radius,
      Paint()
        ..color = Colors.grey.withOpacity(0.2)
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth,
    );

    // 2. Дуга прогресса (цветная, с закруглёнными концами)
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -90 * (3.14159 / 180),                    // старт с 12 часов
      2 * 3.14159 * progress,                   // дуга пропорционально прогрессу
      false,
      Paint()
        ..color = color
        ..style = PaintingStyle.stroke
        ..strokeWidth = strokeWidth
        ..strokeCap = StrokeCap.round,           // скруглённый конец
    );
  }

  @override
  bool shouldRepaint(covariant _ProgressRingPainter old) =>
      old.progress != progress || old.color != color;
}
```

---

## 5. Результаты тестирования и сценарии работы

### Сценарий 1 — Первый запуск и инициализация БД

При вызове `main()` выполняется `await databaseService.database`, что гарантирует создание файла `activity_tracker.db` до первого рендера UI. `sqflite` вызывает `_onCreate()` и выполняет `CREATE TABLE activities(...)`. Приложение отображает экран с пустым состоянием («Нет тренировок» + подсказка начать первую).

<p align="center">
  <img src="./screenshots/Снимок экрана 2026-05-23 191035.png" width="420" alt="Главный экран со списком тренировок"/>
  &nbsp;&nbsp;
  <img src="./screenshots/Снимок экрана 2026-05-23 191046.png" width="420" alt="Экран текущей тренировки с данными датчиков"/>
</p>
<p align="center"><i>Слева: главный экран — список завершённых тренировок с ActivityCard. Справа: экран активной тренировки с данными акселерометра и шагомера.</i></p>

---

### Сценарий 2 — Запуск и завершение тренировки (полный цикл)

Пользователь нажимает FAB → `_showStartActivityDialog()` отображает `AlertDialog` с `ListView` типов активности → при выборе вызывается `provider.startNewActivity(type)` и `sensorProvider.startTracking()`. На экране появляется виджет текущей тренировки с `ProgressRing`, показывающий прогресс по шагам к цели 10 000. Датчики передают данные в реальном времени через `Stream` → `ChangeNotifier.notifyListeners()` → `Consumer`-перестройка UI. После нажатия STOP вызывается `finishCurrentActivity()`, запись уходит в SQLite через `Dispatchers` фоновый изолят sqflite.

<p align="center">
  <img src="./screenshots/Снимок экрана 2026-05-23 191329.png" width="420" alt="Экран статистики с графиками"/>
  &nbsp;&nbsp;
  <img src="./screenshots/Снимок экрана 2026-05-23 191359.png" width="420" alt="Анимированное кольцо прогресса и структура проекта"/>
</p>
<p align="center"><i>Слева: экран статистики — GridView с суммарными показателями и BarChart за 7 дней. Справа: анимированное кольцо ProgressRing с CustomPainter и общий вид проекта.</i></p>

---

### Сценарий 3 — Определение типа активности по акселерометру

`SensorService` постоянно вычисляет `_accelerometerMagnitude = |ax| + |ay| + |az|`. При начале новой тренировки вызывается `detectActivityType()`, который сопоставляет текущее значение магнитуды с порогами (3 / 6 / 10 м/с²) и возвращает соответствующий `ActivityType`. На экране динамически отображается иконка и цвет, соответствующие определённому типу. При смене режима движения Provider эмитирует `notifyListeners()`, Compose-дерево ре-рендерится только в затронутых узлах.

---

### Сценарий 4 — Экран статистики и агрегация данных

`StatsScreen` через `Consumer<ActivityProvider>` получает актуальный список `_activities`. Метод `_calculateStats()` суммирует шаги, дистанцию и калории за все тренировки. `_prepareChartData()` группирует записи по дням за последние 7 суток и формирует `List<MapEntry<DateTime, int>>` для `fl_chart`. `BarChart` перестраивается реактивно при добавлении новых тренировок.

---

## 6. Теоретический базис для защиты работы

<details>
<summary><strong>❓ Вопрос 1: В чём преимущество собственного движка рендеринга Flutter (Skia / Impeller) перед использованием нативных виджетов?</strong></summary>

**Ответ:**

Flutter **не использует нативные виджеты платформы** (Android View / iOS UIView). Вместо этого он получает холст от операционной системы (`FlutterView`) и полностью рисует весь UI самостоятельно через движок Skia (или Impeller на новых устройствах).

**Ключевые преимущества:**

| Аспект | Нативные виджеты (RN) | Flutter Skia/Impeller |
|---|---|---|
| Пиксельное соответствие | Зависит от платформы | **Идентично на всех ОС** |
| Кастомная графика | Native Module (Java/Swift) | `CustomPainter` на Dart |
| Анимации | Через JS Bridge | Прямой доступ к Canvas |
| Новые API платформы | Ожидание плагинов | Независимость от UI-виджетов |
| FPS при сложных анимациях | Может проседать (Bridge) | **Стабильные 60-120 FPS** |

Как продемонстрировано в `progress_ring.dart`: Flutter позволяет рисовать произвольную векторную графику (`drawArc`, `drawCircle`) и анимировать её с точностью до одного пикселя без каких-либо нативных зависимостей.

</details>

<details>
<summary><strong>❓ Вопрос 2: Как Flutter обеспечивает стабильные 60+ FPS при сложных анимациях?</strong></summary>

**Ответ:**

Flutter достигает высокой частоты кадров за счёт нескольких архитектурных решений:

1. **Отсутствие Bridge.** Нет асинхронной прослойки между UI-логикой и отрисовкой — всё выполняется в рамках единого рендер-пайплайна на C++/Dart без сериализации данных.

2. **Три дерева.** Flutter поддерживает три параллельных дерева: Widget Tree (иммутабельный дескриптор), Element Tree (долгоживущий объект, отслеживает изменения), RenderObject Tree (выполняет layout и paint). Перестройка Widget Tree не означает перестройку RenderObject — дорогостоящие операции layout/paint выполняются только при реальных изменениях.

3. **`shouldRepaint()` в CustomPainter.** Художник вызывается только если метод возвращает `true` — в проекте реализована точная проверка `old.progress != progress || old.color != color`.

4. **`SingleTickerProviderStateMixin`.** `AnimationController` привязан к `vsync` — тику экрана. Это гарантирует, что анимация синхронизирована с реальной частотой обновления дисплея и не тратит ресурсы в скрытых виджетах.

5. **Impeller (на iOS и новых Android).** Новый рендерер Flutter компилирует шейдеры заранее при установке приложения, устраняя задержки первого кадра (jank), характерные для Skia.

</details>

<details>
<summary><strong>❓ Вопрос 3: Чем отличается работа с датчиками в Flutter от нативной Android-разработки?</strong></summary>

**Ответ:**

В нативном Android разработчик работает с Java/Kotlin API напрямую: `SensorManager.registerListener()`, `LocationManager.requestLocationUpdates()`. В Flutter — через **Platform Channels** и плагины.

**Механизм Platform Channels:**
Dart-код (sensors_plus)
↓ MethodChannel / EventChannel
JNI / Java Bridge
↓
Нативный Android API (SensorManager, FusedLocationProvider)
↓
Данные возвращаются обратно как Dart Stream

text

**Разница в практике:**

| Аспект | Нативный Android | Flutter (плагин) |
|---|---|---|
| Язык | Kotlin / Java | Dart |
| Прямой доступ к API | Да, сразу | Через плагин-прослойку |
| Поддержка iOS | Отдельный код (Swift) | Один код на Dart |
| Поддержка новых API | Мгновенная | Зависит от обновления плагина |
| Управление ресурсами | `unregisterListener()` | `StreamSubscription.cancel()` |

В проекте корректное управление ресурсами реализовано в `dispose()`: `_pedometer = null` и `_controller.dispose()` в `ProgressRingState` предотвращают утечки памяти при выходе с экрана.

</details>

<details>
<summary><strong>❓ Вопрос 4: Какие паттерны управления состоянием использованы в приложении и почему именно Provider?</strong></summary>

**Ответ:**

В приложении применены **два уровня управления состоянием**:

1. **Локальное состояние (`setState`)** — для UI-состояния конкретного виджета, которое не нужно разделять. Например, текущий индекс `_currentIndex` в `_MainNavigationState` или поля ввода в диалоге.

2. **Глобальное состояние (`Provider`)** — для данных, которые читаются несколькими экранами:
   - `ActivityProvider` — список тренировок и текущая сессия
   - `SensorProvider` — данные акселерометра и геолокации в реальном времени
   - `ThemeProvider` — выбранная тема оформления

**Почему Provider, а не `setState` для всего?**

`setState` пересоздаёт всё поддерево виджетов. Если состояние шагомера хранить в `HomeScreen` через `setState`, при каждом шаге пользователя весь экран пересобирается. `Consumer<SensorProvider>` же перестраивает **только тот виджет**, который его использует — счётчик шагов — оставляя остальное дерево нетронутым.

**Почему Provider, а не BLoC/Riverpod?**

Provider — минимальная надстройка над `InheritedWidget` с простым API. Для учебного проекта это оптимально: меньше шаблонного кода, прозрачная трассировка потока данных.

</details>

<details>
<summary><strong>❓ Вопрос 5: Что такое StatelessWidget vs StatefulWidget? Когда использовать каждый из них?</strong></summary>

**Ответ:**

| Характеристика | StatelessWidget | StatefulWidget |
|---|---|---|
| Хранит изменяемое состояние | ❌ Нет | ✅ Да (в `State<T>`) |
| Метод обновления | Только при изменении Props | `setState()` + пересборка |
| `initState` / `dispose` | ❌ Нет | ✅ Есть |
| Примеры | ActivityCard, StatsChart | MainNavigation, ProgressRing |

**Правило выбора:**

- `StatelessWidget` — если виджет является **чистой функцией** своих параметров (`build(context)` зависит только от `final`-полей). Таковы `ActivityCard`, `StatsChart` — они получают данные снаружи и ничего не запоминают.

- `StatefulWidget` — если виджет **инициирует ресурсы** (`AnimationController`, подписки на `Stream`, `TextEditingController`) или хранит UI-состояние, изменяемое в ответ на действия пользователя. Таков `ProgressRing` — он создаёт `_controller` в `initState` и освобождает его в `dispose`.

В проекте `ActivityCard` остаётся `StatelessWidget`, что минимизирует накладные расходы Flutter-рантайма при прокрутке длинного списка тренировок в `ListView.builder`.

</details>

---

## 7. Зависимости `pubspec.yaml`

```yaml
dependencies:
  flutter:
    sdk: flutter

  provider:          ^6.1.1   # Управление состоянием (ChangeNotifier)
  go_router:         ^13.0.0  # Декларативная навигация
  sensors_plus:      ^4.0.0   # Акселерометр / гироскоп
  pedometer:         ^4.0.0   # Шагомер
  location:          ^5.0.0   # GPS геолокация
  google_maps_flutter: ^2.5.0 # Карты (требует API-ключ)
  sqflite:           ^2.3.0   # ORM-прослойка SQLite
  path:              ^1.9.0   # Утилита для путей к файлам БД
  fl_chart:          ^0.66.0  # Столбчатые и линейные графики
  lottie:            ^2.7.0   # JSON-анимации Lottie
  intl:              ^0.18.1  # Форматирование дат (DateFormat)
```

---

## 8. Запуск и сборка проекта

```bash
# Проверка окружения Flutter
flutter doctor

# Установка зависимостей
flutter pub get

# Запуск в режиме разработки (debug)
flutter run

# Запуск на конкретной платформе
flutter run -d android
flutter run -d ios

# Запуск с профилированием производительности (DevTools)
flutter run --profile

# Анализ кода (lint)
flutter analyze

# Запуск тестов
flutter test

# Сборка release APK для Android
flutter build apk --release

# Полная пересборка (при проблемах с кешем)
flutter clean && flutter pub get && flutter run
```

---

<div align="center">

**Лабораторная работа №3** · Дисциплина: Мобильная разработка  
СКФУ · Прикладная информатика в экономике · 2026

</div>