<div align="center">

# 💸 Expense Tracker — Калькулятор расходов

### Лабораторная работа №4 · Kotlin Multiplatform Mobile (KMM)

<br/>

![KMM](https://img.shields.io/badge/Kotlin%20Multiplatform-Mobile-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white)
![Kotlin](https://img.shields.io/badge/Kotlin-1.9+-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white)
![SQLDelight](https://img.shields.io/badge/SQLDelight-2.0.2-0F6CBD?style=for-the-badge&logo=sqlite&logoColor=white)
![Compose](https://img.shields.io/badge/Android-Jetpack%20Compose-4285F4?style=for-the-badge&logo=jetpackcompose&logoColor=white)
![SwiftUI](https://img.shields.io/badge/iOS-SwiftUI-0D96F6?style=for-the-badge&logo=swift&logoColor=white)

<br/>

> Кроссплатформенное приложение для учёта личных расходов,  
> в котором **общая бизнес-логика, база данных, форматирование и ViewModel** вынесены в `shared`-модуль на Kotlin,  
> а пользовательский интерфейс реализован **нативно**: **Jetpack Compose** на Android и **SwiftUI** на iOS.

</div>

---

## 1. Цели и задачи лабораторной работы

**Цель работы:** получить практические навыки разработки мобильного приложения с общей бизнес-логикой на основе **Kotlin Multiplatform Mobile**, освоить вынос переиспользуемого кода в `shared`-модуль, применение механизма `expect/actual`, типобезопасную работу с локальной базой данных через SQLDelight и интеграцию общей логики с нативным UI двух платформ.

**Задачи:**

- Изучить архитектурный подход **KMM**, при котором доменная логика, работа с БД, форматирование и состояние приложения реализуются в общем Kotlin-модуле, а UI остаётся платформенно-нативным.
- Освоить механизм **`expect` / `actual`** для разделения платформо-независимого и платформо-зависимого кода на примере фабрики драйвера БД и форматтера валют/дат.
- Реализовать типобезопасную локальную БД через **SQLDelight**, включая описание схемы таблиц, генерацию Kotlin API по `.sq`-скриптам и реактивное получение данных через `Flow`.
- Построить общий слой состояния на основе **Kotlin Coroutines + StateFlow** в `ExpensesViewModel` и подключить его к Android Compose и iOS SwiftUI.
- Реализовать агрегацию статистики по категориям, управление бюджетами по месяцам и вычисляемые производные свойства состояния.
- Изучить особенности **interop** между Kotlin/Native и SwiftUI: обёртки `ObservableObject`, отписка от coroutine-state и преобразование Kotlin StateFlow в наблюдаемое состояние iOS.
- Проверить, что общая логика работает идентично на Android и iOS, обеспечивая переиспользование кода без потери нативного UX.

---

## 2. Стек технологий

| Компонент | Технология | Версия |
|---|---|---|
| Общий модуль | Kotlin Multiplatform Mobile | 1.9+ |
| Язык | Kotlin | 1.9+ |
| Асинхронность | Kotlin Coroutines | 1.8.0 |
| Работа с датами | kotlinx-datetime | 0.5.0 |
| DI | Koin Core | 3.5.3 |
| База данных | SQLDelight | 2.0.2 |
| Android UI | Jetpack Compose | актуальный BOM |
| iOS UI | SwiftUI | iOS 16+ |
| Android SQL driver | AndroidSqliteDriver | 2.0.2 |
| iOS SQL driver | NativeSqliteDriver | 2.0.2 |

---

## 3. Архитектура и файловая структура

Проект разделён на три крупные части: **shared**, **androidApp** и **iosApp**. Модуль `shared` содержит всю переиспользуемую бизнес-логику, а клиентские приложения отвечают только за нативное представление данных.

```text
ExpenseTracker/
├── shared/                                        ← Общий KMM-модуль
│   ├── src/
│   │   ├── commonMain/                            ← Общая логика для Android + iOS
│   │   │   ├── kotlin/com/example/expensetracker/
│   │   │   │   ├── models/
│   │   │   │   │   ├── Expense.kt                # Category, Expense, Budget, CategoryStats
│   │   │   │   ├── db/
│   │   │   │   │   ├── Database.kt               # SQLDelight-обёртка, Flow-запросы, CRUD
│   │   │   │   │   └── DatabaseDriverFactory.kt  # expect class
│   │   │   │   ├── viewmodels/
│   │   │   │   │   └── ExpensesViewModel.kt      # StateFlow + Coroutines + общий state
│   │   │   │   └── utils/
│   │   │   │       └── CurrencyFormatter.kt      # expect class
│   │   │   └── sqldelight/com/example/expensetracker/db/
│   │   │       └── ExpenseDatabase.sq            # SQL-схема category / expense / budget
│   │   │
│   │   ├── androidMain/                           ← Android actual-реализации
│   │   │   └── kotlin/com/example/expensetracker/
│   │   │       ├── db/DatabaseDriverFactory.kt   # AndroidSqliteDriver
│   │   │       └── utils/CurrencyFormatter.kt    # ICU NumberFormat / DateFormat
│   │   │
│   │   └── iosMain/                               ← iOS actual-реализации
│   │       └── kotlin/com/example/expensetracker/
│   │           ├── db/DatabaseDriverFactory.kt   # NativeSqliteDriver
│   │           └── utils/CurrencyFormatter.kt    # NSDateFormatter / NSNumberFormatter
│   │
│   └── build.gradle.kts
│
├── androidApp/                                    ← Нативное Android-приложение
│   ├── src/main/java/com/example/expensetracker/android/
│   │   ├── MainActivity.kt                        # Точка входа в Compose UI
│   │   ├── ui/
│   │   │   ├── ExpenseTrackerApp.kt              # remember(database) + tab navigation
│   │   │   ├── ExpensesScreen.kt                 # Список расходов
│   │   │   ├── StatsScreen.kt                    # Круговая диаграмма и бюджеты
│   │   │   └── SettingsScreen.kt                 # Экран настроек
│   │   └── viewmodel/
│   │       └── ExpensesViewModelFactory.kt
│
├── iosApp/                                        ← Нативное iOS-приложение
│   ├── Sources/iosApp/
│   │   ├── iosApp.swift                          # Инициализация shared-модуля
│   │   ├── ContentView.swift                     # TabView
│   │   ├── ExpensesScreen.swift                  # Список расходов
│   │   ├── AddExpenseSheet.swift                 # Форма создания расхода
│   │   └── StatsScreen.swift                     # Экран статистики в SwiftUI
│   ├── iosApp.xcodeproj
│   └── Podfile
│
├── build.gradle.kts
└── settings.gradle.kts
```

### Архитектурная схема взаимодействия слоёв

```text
                 ┌────────────────────────────────────────────┐
                 │                SHARED MODULE               │
                 │                                            │
                 │   models/      db/        viewmodels/      │
                 │  Expense.kt  Database.kt  ExpensesViewModel│
                 │      │            │               │         │
                 │      └─────── SQLDelight ────────┘         │
                 │                                            │
                 └───────────────┬───────────────┬────────────┘
                                 │               │
                 expect/actual   │               │   expect/actual
                                 │               │
        ┌────────────────────────▼───┐      ┌────▼──────────────────────┐
        │        ANDROID APP         │      │         IOS APP           │
        │                            │      │                           │
        │ Jetpack Compose UI         │      │ SwiftUI UI                │
        │ MainActivity               │      │ iosApp.swift              │
        │ ExpensesScreen             │      │ ExpensesScreen            │
        │ StatsScreen                │      │ AddExpenseSheet           │
        └────────────────────────────┘      └───────────────────────────┘
```

---

## 4. Технический разбор ключевых компонентов

### 4.1 `DatabaseDriverFactory` — механизм `expect / actual`

Одной из ключевых особенностей KMM является возможность объявить **ожидаемый** API в `commonMain`, а затем предоставить его **фактическую** реализацию в `androidMain` и `iosMain`. В проекте этот подход используется для создания SQLDelight-драйвера, который зависит от конкретной платформы.

**Общий контракт (`commonMain`)**:

```kotlin
package com.example.expensetracker.db

import app.cash.sqldelight.db.SqlDriver

expect class DatabaseDriverFactory {
    fun createDriver(): SqlDriver
}
```

**Android-реализация (`androidMain`)**:

```kotlin
package com.example.expensetracker.db

import android.content.Context
import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.android.AndroidSqliteDriver
import com.example.expensetracker.ExpenseDatabase

actual class DatabaseDriverFactory(
    private val context: Context
) {
    actual fun createDriver(): SqlDriver {
        return AndroidSqliteDriver(
            schema = ExpenseDatabase.Schema,
            name = "expense.db",
            context = context
        )
    }
}
```

**iOS-реализация (`iosMain`)**:

```kotlin
package com.example.expensetracker.db

import app.cash.sqldelight.db.SqlDriver
import app.cash.sqldelight.driver.native.NativeSqliteDriver
import com.example.expensetracker.ExpenseDatabase

actual class DatabaseDriverFactory {
    actual fun createDriver(): SqlDriver {
        return NativeSqliteDriver(
            schema = ExpenseDatabase.Schema,
            name = "expense.db"
        )
    }
}
```

Такой подход позволяет вызывать `DatabaseDriverFactory().createDriver()` из общего кода, не зная, работает приложение на Android или iOS. Выбор платформенного драйвера происходит на этапе компиляции, а не через `if/else` в runtime.

---

### 4.2 `Database.kt` — реактивный слой доступа к данным через SQLDelight

Класс `Database` выступает как абстрактный слой над сгенерированными SQLDelight-запросами. Он преобразует низкоуровневые query-результаты в доменные модели `Category`, `Expense` и `Budget`, а также предоставляет реактивные `Flow`-потоки.

```kotlin
class Database(
    private val driver: SqlDriver
) {
    private val db = ExpenseDatabase(driver)

    fun getAllCategories(): Flow<List<Category>> {
        return db.categoryQueries.selectAll()
            .asFlow()
            .mapToList(Dispatchers.IO)
            .map { list ->
                list.map { category ->
                    Category(
                        id = category.id,
                        name = category.name,
                        color = category.color,
                        icon = category.icon,
                        isDefault = category.isDefault == 1L
                    )
                }
            }
    }

    fun getExpensesForMonth(year: Int, month: Int): Flow<List<Expense>> {
        val startOfMonth = LocalDate(year, month, 1)
            .atStartOfDay(TimeZone.currentSystemDefault())
        val endOfMonth = LocalDate(year, month, 1)
            .plusMonths(1)
            .atStartOfDay(TimeZone.currentSystemDefault())

        return db.expenseQueries.selectByDateRange(
            start = startOfMonth.toEpochMilliseconds(),
            end = endOfMonth.toEpochMilliseconds()
        ).asFlow().mapToList(Dispatchers.IO).map { list ->
            list.map { expense ->
                Expense(
                    id = expense.id,
                    amount = expense.amount,
                    categoryId = expense.categoryId,
                    description = expense.description,
                    date = Instant.fromEpochMilliseconds(expense.date),
                    isSynced = expense.isSynced == 1L
                )
            }
        }
    }

    suspend fun insertExpense(expense: Expense) {
        db.expenseQueries.insert(
            amount = expense.amount,
            categoryId = expense.categoryId,
            description = expense.description,
            date = expense.date.toEpochMilliseconds(),
            isSynced = if (expense.isSynced) 1 else 0
        )
    }

    suspend fun deleteExpense(id: Long) {
        db.expenseQueries.deleteById(id)
    }
}
```

### Почему SQLDelight здесь особенно важен

- SQL-запросы пишутся в `.sq` файле и **проверяются на этапе компиляции**.
- Результаты автоматически типизируются — меньше риска ошибок преобразования.
- `asFlow()` позволяет реактивно получать обновления таблиц и автоматически обновлять UI на обеих платформах.
- База данных остаётся общей, а значит алгоритмы агрегации и фильтрации не дублируются отдельно для Android и iOS.

---

### 4.3 `ExpensesViewModel.kt` — общий StateFlow для двух платформ

Главный слой бизнес-логики сосредоточен в `ExpensesViewModel`. Он создаёт собственный `CoroutineScope`, подписывается на несколько источников данных одновременно через `combine(...)` и публикует итоговое состояние как `StateFlow<ExpensesState>`.

```kotlin
class ExpensesViewModel(
    private val database: Database
) {
    private val viewModelScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

    private val _state = MutableStateFlow(ExpensesState())
    val state: StateFlow<ExpensesState> = _state.asStateFlow()

    private var _currentMonth = MutableStateFlow(
        LocalDate(currentLocalDate.year, currentLocalDate.monthNumber, 1)
    )

    init {
        loadData()
    }

    private fun loadData() {
        combine(
            database.getAllCategories(),
            _currentMonth.flatMapLatest { date ->
                database.getExpensesForMonth(date.year, date.monthNumber)
            },
            _currentMonth.flatMapLatest { date ->
                database.getBudgetForMonth(date.year, date.monthNumber)
            }
        ) { categories, expenses, budgets ->
            _state.update {
                it.copy(
                    categories = categories,
                    expenses = expenses,
                    budgets = budgets,
                    isLoading = false
                )
            }
        }.catch { error ->
            _state.update {
                it.copy(
                    error = error.message,
                    isLoading = false
                )
            }
        }.launchIn(viewModelScope)
    }

    fun addExpense(amount: Double, categoryId: Long, description: String?) {
        viewModelScope.launch {
            val expense = Expense(
                id = 0,
                amount = amount,
                categoryId = categoryId,
                description = description,
                date = Clock.System.now()
            )
            database.insertExpense(expense)
        }
    }

    fun deleteExpense(id: Long) {
        viewModelScope.launch {
            database.deleteExpense(id)
        }
    }

    fun onCleared() {
        viewModelScope.cancel()
    }
}
```

### Что здесь важно с архитектурной точки зрения

- `combine(...)` объединяет **категории**, **расходы текущего месяца** и **бюджеты текущего месяца** в единый state.
- Android и iOS читают один и тот же `state`, поэтому логика агрегации полностью общая.
- `SupervisorJob()` предотвращает каскадную отмену всего scope при падении одной дочерней корутины.
- `onCleared()` обязателен, иначе на iOS можно получить утечку активного coroutine scope.

---

### 4.4 Реализация статистики по категориям

Одним из обязательных заданий лабораторной является дописывание метода `getCategoryStats`. Он формирует агрегированную статистику на основе общего набора категорий, расходов за месяц и месячных бюджетов.

```kotlin
data class CategoryStats(
    val category: Category,
    val totalSpent: Double,
    val budget: Double?,
    val transactionCount: Int
)

suspend fun getCategoryStats(year: Int, month: Int): List<CategoryStats> {
    val categories = getAllCategories().first()
    val expenses = getExpensesForMonth(year, month).first()
    val budgets = getBudgetForMonth(year, month).first()

    val expensesByCategory = expenses.groupBy { it.categoryId }

    return categories.map { category ->
        val categoryExpenses = expensesByCategory[category.id] ?: emptyList()
        val totalSpent = categoryExpenses.sumOf { it.amount }
        val budget = budgets.find { it.categoryId == category.id }

        CategoryStats(
            category = category,
            totalSpent = totalSpent,
            budget = budget?.amount,
            transactionCount = categoryExpenses.size
        )
    }
}
```

Это решение полностью платформонезависимо: Android Compose и SwiftUI получают уже готовые вычисленные данные, не реализуя дублирующую агрегацию на стороне UI.

---

### 4.5 Управление бюджетами в общем ViewModel

Второе обязательное задание — реализация установки бюджета в `ExpensesViewModel`. Логика также вынесена в `shared`, поэтому и Android, и iOS используют один и тот же алгоритм.

```kotlin
fun setBudget(categoryId: Long, amount: Double) {
    viewModelScope.launch {
        val existingBudget = _state.value.budgets.find { it.categoryId == categoryId }

        if (existingBudget != null) {
            val updatedBudget = existingBudget.copy(amount = amount)
            database.updateBudget(updatedBudget)
        } else {
            val newBudget = Budget(
                id = 0,
                categoryId = categoryId,
                amount = amount,
                month = _currentMonth.value.atStartOfDay(TimeZone.currentSystemDefault())
            )
            database.insertBudget(newBudget)
        }
    }
}
```

Дополнительно в `ExpensesState` удобно разместить вычисляемое свойство для top-категорий:

```kotlin
val topCategories: List<Pair<Category, Double>>
    get() {
        val categoryTotals = expenses.groupBy { it.categoryId }
            .mapValues { (_, list) -> list.sumOf { it.amount } }

        return categories.mapNotNull { category ->
            categoryTotals[category.id]?.let { total ->
                category to total
            }
        }.sortedByDescending { it.second }
            .take(3)
    }
```

---

### 4.6 `CurrencyFormatter` — кроссплатформенное форматирование дат и валют

Ещё один важный пример использования `expect/actual` — форматтер, который использует нативные системные API каждой платформы для корректной локализации.

**Общий интерфейс:**

```kotlin
expect class CurrencyFormatter {
    fun formatAmount(amount: Double): String
    fun formatDate(timestamp: Instant): String
    fun formatMonth(year: Int, month: Int): String
}
```

**Android actual:**

```kotlin
actual class CurrencyFormatter {
    private val currencyFormat = NumberFormat.getCurrencyInstance(Locale.getDefault())
    private val dateFormat = DateFormat.getDateInstance(DateFormat.MEDIUM)
    private val monthFormat = DateFormat.getDateInstance(DateFormat.LONG)

    actual fun formatAmount(amount: Double): String {
        return currencyFormat.format(amount)
    }

    actual fun formatDate(timestamp: Instant): String {
        return dateFormat.format(java.util.Date(timestamp.toEpochMilliseconds()))
    }

    actual fun formatMonth(year: Int, month: Int): String {
        val calendar = java.util.Calendar.getInstance()
        calendar.set(year, month - 1, 1)
        return monthFormat.format(calendar.time)
    }
}
```

**iOS actual:**

```kotlin
actual class CurrencyFormatter {
    private val numberFormatter = NSNumberFormatter().apply {
        numberStyle = NSNumberFormatterCurrencyStyle
        locale = NSLocale.currentLocale
    }

    private val dateFormatter = NSDateFormatter().apply {
        dateStyle = NSDateFormatterMediumStyle
    }

    private val monthFormatter = NSDateFormatter().apply {
        dateFormat = "MMMM yyyy"
    }

    actual fun formatAmount(amount: Double): String {
        return numberFormatter.stringFromNumber(amount) ?: "$amount"
    }

    actual fun formatDate(timestamp: Instant): String {
        val date = NSDate(timestamp.toEpochMilliseconds() / 1000.0)
        return dateFormatter.stringFromDate(date) ?: timestamp.toString()
    }

    actual fun formatMonth(year: Int, month: Int): String {
        val calendar = platform.Foundation.NSCalendar.currentCalendar
        val components = platform.Foundation.NSDateComponents().apply {
            this.year = year
            this.month = month
            this.day = 1
        }
        val date = calendar.dateFromComponents(components) ?: return ""
        return monthFormatter.stringFromDate(date) ?: ""
    }
}
```

Это даёт важное преимущество: общий модуль задаёт контракт, а отображение суммы и даты выглядит естественно для пользователя каждой платформы.

---

## 5. Результаты тестирования и сценарии работы

### Сценарий 1 — Инициализация общего модуля и базы данных

При запуске Android-приложения через `MainActivity` и iOS-приложения через `iosApp.swift` создаётся `DatabaseDriverFactory`, после чего инициализируется объект `Database(driver)` из `shared`-модуля. SQLDelight создаёт схему `expense.db`, включая таблицы `category`, `expense`, `budget`, а также автоматически вставляет стандартные категории расходов. После этого `ExpensesViewModel` подписывается на `Flow`-запросы и начинает поставлять единое состояние в Android Compose и iOS SwiftUI.

<p align="center">
  <img src="./screenshots/Снимок экрана 2026-05-23 212347.png" width="420" alt="Android главный экран с расходами"/>
  &nbsp;&nbsp;
  <img src="./screenshots/Снимок экрана 2026-05-23 212824.png" width="420" alt="Android экран статистики с диаграммой"/>
</p>
<p align="center"><i>Слева: Android-экран со списком расходов и общей суммой за месяц. Справа: Android-экран статистики с круговой диаграммой и блоками бюджетов по категориям.</i></p>

---

### Сценарий 2 — Добавление расхода и синхронное обновление состояния

Пользователь открывает экран добавления расхода, вводит сумму, выбирает категорию и сохраняет запись. Вызов `viewModel.addExpense(...)` происходит в общем KMM-модуле, где создаётся объект `Expense` и выполняется `database.insertExpense(expense)`. После вставки SQLDelight триггерит обновление reactive-query, `StateFlow` получает новый список, и UI обеих платформ автоматически пересчитывает сумму месяца, список расходов и распределение по категориям.

<p align="center">
  <img src="./screenshots/Снимок экрана 2026-05-23 212831.png" width="420" alt="iOS главный экран со списком расходов"/>
  &nbsp;&nbsp;
  <img src="./screenshots/Снимок экрана 2026-05-23 213049.png" width="420" alt="iOS экран добавления расхода"/>
</p>
<p align="center"><i>Слева: iOS-экран со списком расходов в SwiftUI List. Справа: iOS-форма добавления нового расхода через sheet с выбором категории и валидацией ввода.</i></p>

---

### Сценарий 3 — Удаление записи без дублирования бизнес-логики

На Android удаление инициируется из `IconButton` в `ExpenseItem`, на iOS — через `.onDelete` у `List`. Однако в обоих случаях вызывается один и тот же метод общего ViewModel: `deleteExpense(id: Long)`. Благодаря этому SQL-операция удаления реализуется только один раз, а клиентские приложения отвечают только за UX-вызов и визуальное подтверждение действия.

---

### Сценарий 4 — Переключение месяца и реактивная фильтрация

`MonthSelector` на Android и `MonthSelectorView` на iOS изменяют `_currentMonth` внутри общего `ExpensesViewModel`. Это автоматически перезапускает `flatMapLatest`-запросы к `getExpensesForMonth(...)` и `getBudgetForMonth(...)`. В результате UI не требует ручного вызова `reload()` — достаточно изменить состояние месяца, и общий модуль пересоберёт данные сам.

---

### Сценарий 5 — Работа бюджетов и статистики по категориям

После задания месячного бюджета для выбранной категории вызов `setBudget(categoryId, amount)` обновляет или создаёт запись в таблице `budget`. Вычисляемые свойства `expensesByCategory`, `topCategories` и `CategoryStats` позволяют на обоих клиентах строить круговые диаграммы, прогресс-бары бюджета и рейтинг категорий без дублирования логики агрегации в Compose и SwiftUI.

---

## 6. Теоретический базис для защиты работы

<details>
<summary><strong>❓ Вопрос 1: В чём преимущество KMM перед другими кроссплатформенными решениями?</strong></summary>

**Ответ:**

KMM занимает промежуточную позицию между полностью нативной и классической кроссплатформенной разработкой. В отличие от Flutter и React Native, Kotlin Multiplatform **не навязывает единый UI-фреймворк**, а предлагает выносить только общую бизнес-логику.

### Основные преимущества KMM:

| Критерий | KMM | Flutter / React Native |
|---|---|---|
| UI | Полностью нативный | Общий UI |
| Общая логика | Да | Да |
| Доступ к платформенным UX-паттернам | Максимальный | Ограниченный фреймворком |
| Переиспользование кода | Логика, БД, форматирование, сеть | Почти весь код |
| Интеграция в существующий проект | Очень удобна | Часто сложнее |

**Главное преимущество:** можно переиспользовать сложную бизнес-логику, БД, форматирование, валидацию и состояние, сохранив при этом **нативный UX** на Android и iOS. Для приложений, где важна «родная» платформа, это особенно ценно.

</details>

<details>
<summary><strong>❓ Вопрос 2: Как работает механизм `expect` / `actual` в Kotlin Multiplatform?</strong></summary>

**Ответ:**

Механизм `expect` / `actual` позволяет объявить в общем модуле интерфейс платформенной зависимости, а затем реализовать его отдельно для каждой ОС.

### Принцип работы:

1. В `commonMain` объявляется **ожидаемый** API:
   ```kotlin
   expect class DatabaseDriverFactory {
       fun createDriver(): SqlDriver
   }
   ```

2. В `androidMain` создаётся **actual**-реализация:
   ```kotlin
   actual class DatabaseDriverFactory(private val context: Context) {
       actual fun createDriver(): SqlDriver = AndroidSqliteDriver(...)
   }
   ```

3. В `iosMain` создаётся своя **actual**-реализация:
   ```kotlin
   actual class DatabaseDriverFactory {
       actual fun createDriver(): SqlDriver = NativeSqliteDriver(...)
   }
   ```

### Что это даёт:

- общий код может работать с платформенной абстракцией;
- компилятор гарантирует, что для каждого `expect` есть `actual`;
- не требуется писать условный код вида `if (platform == Android)`.

Это особенно полезно для БД, форматирования дат/валют, файловой системы, криптографии и других API, зависящих от платформы.

</details>

<details>
<summary><strong>❓ Вопрос 3: Какие сложности возникают при интеграции общего модуля с iOS?</strong></summary>

**Ответ:**

Интеграция KMM с iOS обычно сложнее, чем с Android, потому что Android нативно использует Kotlin, а iOS — Swift/Objective-C.

### Основные сложности:

1. **Interop Kotlin/Native ↔ Swift.**  
   Kotlin-классы экспортируются в Swift не всегда в том виде, в каком хочется. Например, `StateFlow` нельзя использовать как обычный SwiftUI `@StateObject` без дополнительной обёртки.

2. **Нужна ObservableObject-обёртка.**  
   В проекте для этого используется `ExpensesObservableViewModel`, который хранит ссылку на `ExpensesViewModel`, подписывается на его состояние и прокидывает изменения через `@Published`.

3. **Управление жизненным циклом подписок.**  
   Если не выполнить корректную отписку (`stateDisposable?.dispose()`), возможны утечки памяти или «висящие» корутины.

4. **Сборка XCFramework и настройка Xcode.**  
   Перед запуском iOS-приложения нужно собрать shared-фреймворк:
   ```bash
   ./gradlew shared:assembleSharedXCFramework
   ```
   а затем правильно подключить его в Xcode / CocoaPods.

5. **Потоки и корутины.**  
   Kotlin coroutines на iOS требуют аккуратной интеграции, особенно если состояние обновляется из background-потоков.

Именно поэтому KMM даёт сильные преимущества, но требует аккуратной архитектуры на границе общего Kotlin-кода и SwiftUI.

</details>

<details>
<summary><strong>❓ Вопрос 4: Как обеспечивается потокобезопасность при работе с общей базой данных?</strong></summary>

**Ответ:**

Потокобезопасность достигается комбинацией нескольких механизмов:

### 1. SQLDelight Driver
SQLDelight использует платформенный `SqlDriver`, который инкапсулирует безопасную работу с SQLite на Android и iOS.

### 2. Coroutines + Dispatchers
Реактивные запросы выполняются через:
```kotlin
.asFlow().mapToList(Dispatchers.IO)
```
Это гарантирует, что чтение из БД и преобразование query-result происходит не на главном UI-потоке.

### 3. ViewModel Scope
Все операции записи (`insertExpense`, `deleteExpense`, `updateBudget`) выполняются внутри:
```kotlin
viewModelScope.launch { ... }
```
Это изолирует side effects и предотвращает блокировку интерфейса.

### 4. Reactive StateFlow
UI не читает БД напрямую. Вместо этого он подписывается на `StateFlow`, а значит любые изменения проходят через единый слой состояния. Это снижает риск гонок данных между представлением и источником данных.

### 5. SupervisorJob
Использование `SupervisorJob()` делает корутинный scope устойчивым: ошибка одной операции не «роняет» все остальные фоновые задачи.

Таким образом, UI двух платформ получает уже готовое, потокобезопасное состояние, а низкоуровневая работа с базой данных остаётся скрытой в общем модуле.

</details>

<details>
<summary><strong>❓ Вопрос 5: Почему в KMM выгодно оставлять UI нативным, а не делать общий интерфейс?</strong></summary>

**Ответ:**

В мобильной разработке UX-паттерны Android и iOS заметно различаются: навигация, анимации, поведение списков, системные кнопки и визуальные ожидания пользователей не совпадают. Если пытаться унифицировать всё на уровне UI, приложение часто начинает выглядеть «не по-платформенному».

### Преимущества нативного UI в KMM:

- Android использует **Jetpack Compose** и Material-паттерны.
- iOS использует **SwiftUI** и Human Interface Guidelines.
- Пользователь получает ожидаемое поведение приложения в своей экосистеме.
- Команда может использовать платформенно-специфичные сильные стороны UI-фреймворков.
- При этом сложная бизнес-логика, БД и состояние не дублируются.

Именно это делает KMM сильным архитектурным компромиссом: **общая логика + нативный интерфейс**.

</details>

---

## 7. Ключевые зависимости `shared/build.gradle.kts`

```kotlin
kotlin {
    androidTarget()
    iosX64()
    iosArm64()
    iosSimulatorArm64()

    sourceSets {
        val commonMain by getting {
            dependencies {
                implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.8.0")
                implementation("org.jetbrains.kotlinx:kotlinx-datetime:0.5.0")

                implementation("io.insert-koin:koin-core:3.5.3")
                implementation("io.insert-koin:koin-compose:1.1.2")

                implementation("app.cash.sqldelight:coroutines-extensions:2.0.2")
                implementation("app.cash.sqldelight:runtime:2.0.2")
            }
        }

        val androidMain by getting {
            dependencies {
                implementation("app.cash.sqldelight:android-driver:2.0.2")
            }
        }

        val iosMain by getting {
            dependencies {
                implementation("app.cash.sqldelight:native-driver:2.0.2")
            }
        }
    }
}

sqldelight {
    databases {
        create("ExpenseDatabase") {
            packageName.set("com.example.expensetracker.db")
            srcDirs("src/commonMain/sqldelight")
        }
    }
}
```

---

## 8. Команды для сборки и запуска

```bash
# Сборка всего проекта
./gradlew build

# Сборка общего модуля
./gradlew shared:build

# Запуск Android-приложения
./gradlew installDebug

# Сборка iOS XCFramework
./gradlew shared:assembleSharedXCFramework

# Запуск тестов общего модуля
./gradlew shared:test

# Открыть iOS-проект в Xcode
open iosApp/iosApp.xcodeproj

# Очистка проекта
./gradlew clean

# Линтинг
./gradlew ktlintCheck
./gradlew ktlintFormat
```

---

<div align="center">

**Лабораторная работа №4** · Дисциплина: Мобильная разработка  
СКФУ · Прикладная информатика в экономике · 2026

</div>