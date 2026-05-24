<div align="center">

# 📱 Cross-Platform Mobile Labs

### Лабораторные работы по дисциплине «Мобильная разработка»

<br/>

![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-0F172A?style=for-the-badge&logo=android&logoColor=white)
![Kotlin](https://img.shields.io/badge/Kotlin-Native%20Android-7F52FF?style=for-the-badge&logo=kotlin&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-Cross--Platform-61DAFB?style=for-the-badge&logo=react&logoColor=0A0A0A)
![Flutter](https://img.shields.io/badge/Flutter-Google%20UI-02569B?style=for-the-badge&logo=flutter&logoColor=white)
![KMM](https://img.shields.io/badge/KMM-Kotlin%20Multiplatform-8A2BE2?style=for-the-badge&logo=kotlin&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Offline%20Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

<br/>

> Репозиторий содержит комплект лабораторных работ, посвящённых  
> **нативной, кроссплатформенной и прогрессивной мобильной разработке**.

</div>

---

## 📖 О проекте

В данном репозитории собраны лабораторные работы по современным подходам к мобильной разработке: от **нативного Android на Kotlin и Jetpack Compose** до **React Native**, **Flutter**, **Kotlin Multiplatform Mobile** и **Progressive Web Apps**.

Каждая лабораторная работа оформлена в виде отдельного модуля с собственным исходным кодом, структурой проекта, скриншотами, архитектурным описанием и подробным техническим отчётом в `README.md`.

---

## 🗂️ Содержание репозитория

```text
crossplatform-mobile-labs/
├── 01-jetpack-compose-notes/      # Нативный Android: Notes App на Kotlin + Jetpack Compose
├── 02-react-native-4/             # React Native: кроссплатформенное мобильное приложение
├── 03-flutter-5/                  # Flutter: UI-приложение на Dart
├── 04-kmm-6/                      # Kotlin Multiplatform Mobile: shared logic + native UI
├── 05-pwa-news/                   # Progressive Web App: новостное приложение с offline/push
└── README.md                      # Главное оглавление репозитория
```

---

## 🚀 Лабораторные работы

| № | Лабораторная работа | Технологии | Краткое описание | Ссылка |
|---|---|---|---|---|
| 1 | **Notes App — Персональный менеджер заметок** | Kotlin, Jetpack Compose, Room, Coroutines, MVVM | Нативное Android-приложение для создания, редактирования и удаления заметок с локальной БД SQLite через Room. | [Перейти к README](./01-jetpack-compose-notes/README.md) |
| 2 | **React Native App** | React Native, JavaScript / TypeScript, Navigation | Кроссплатформенное мобильное приложение, реализованное на React Native с единым JavaScript-кодом для Android и iOS. | [Перейти к README](./02-react-native-4/README.md) |
| 3 | **Flutter App** | Flutter, Dart, Material UI | Кроссплатформенное приложение на Flutter с декларативным UI и единым рендерингом для разных платформ. | [Перейти к README](./03-flutter-5/README.md) |
| 4 | **KMM App** | Kotlin Multiplatform Mobile, Compose, SwiftUI / UIKit | Проект с общей бизнес-логикой на Kotlin и нативным пользовательским интерфейсом под Android и iOS. | [Перейти к README](./04-kmm-6/README.md) |
| 5 | **PWA News Aggregator** | HTML, CSS, JavaScript, Node.js, Service Worker, Push API | Прогрессивное веб-приложение для чтения новостей с поддержкой офлайн-режима, установки на устройство и push-уведомлений. | [Перейти к README](./05-pwa-news/README.md) |

---

## 🧩 Навигация по работам

### 1. Нативная мобильная разработка
- [📒 Лабораторная работа №1 — Jetpack Compose Notes App](./01-jetpack-compose-notes/README.md)

### 2. Кроссплатформенные фреймворки
- [⚛️ Лабораторная работа №2 — React Native](./02-react-native-4/README.md)
- [🦋 Лабораторная работа №3 — Flutter](./03-flutter-5/README.md)
- [🧬 Лабораторная работа №4 — Kotlin Multiplatform Mobile](./04-kmm-6/README.md)

### 3. Прогрессивные веб-приложения
- [🌐 Лабораторная работа №5 — PWA News Aggregator](./05-pwa-news/README.md)

---

## 🏗️ Используемые технологии

<div align="center">

| Направление | Стек |
|---|---|
| Нативная Android-разработка | Kotlin, Jetpack Compose, Room, StateFlow, MVVM |
| JavaScript-кроссплатформа | React Native, Navigation, Components API |
| Dart-кроссплатформа | Flutter, Material Widgets, Stateful / Stateless Widgets |
| Shared Mobile Logic | Kotlin Multiplatform Mobile (KMM) |
| Web / Mobile Hybrid | PWA, Service Worker, Cache API, Push API, Manifest |

</div>

---

## 🎯 Цель репозитория

Репозиторий демонстрирует сравнительный практический подход к изучению мобильной разработки в нескольких технологических парадигмах:

- **Нативная разработка** — максимальный контроль над платформой и производительностью.
- **Кроссплатформенная разработка** — единая кодовая база для Android и iOS.
- **Гибридный / web-first подход** — приложение на веб-стеке с возможностью установки и офлайн-работы.

Такое построение репозитория позволяет на практике проследить различия в архитектуре, инструментах, модели UI, работе с состоянием и способах доставки приложений пользователю.

---

## 📌 Структура README внутри каждой работы

Каждый модуль содержит собственный `README.md`, в котором обычно представлены:

- цель и задачи лабораторной работы;
- описание архитектуры;
- дерево структуры проекта;
- технический разбор ключевых компонентов;
- листинги кода;
- скриншоты интерфейса;
- результаты тестирования;
- теоретический базис для защиты.

---

## 🔗 Быстрые ссылки

- [📁 Репозиторий целиком](https://github.com/akkariq/crossplatform-mobile-labs)
- [📒 Jetpack Compose Notes](./01-jetpack-compose-notes/README.md)
- [⚛️ React Native Lab](./02-react-native-4/README.md)
- [🦋 Flutter Lab](./03-flutter-5/README.md)
- [🧬 KMM Lab](./04-kmm-6/README.md)
- [🌐 PWA Lab](./05-pwa-news/README.md)

---

<div align="center">

**Cross-Platform Mobile Labs**  
Учебный репозиторий по дисциплине «Мобильная разработка»

</div>