# Mama Path — мобильное приложение (Flutter)

Отдельное нативное приложение для iOS и Android. Использует тот же бэкенд, что и веб (`web/` → API `/api/v1/*`).

## Что внутри

- **Главная** — обзор и быстрые переходы
- **Курсы** — 27 бесплатных глав для мамы и папы
- **Роддома** — поиск, фильтр по городу, карточки и детали
- **Помощь** — срочные рекомендации (когда звонить 103)
- Шрифт **Onest**, цвета как на сайте, нижняя навигация Material 3

## Требования

1. Flutter SDK — у вас уже распакован в `~/development/flutter`, PATH добавлен в `~/.zshrc`
2. Для **iPhone / macOS**: установите [Xcode](https://apps.apple.com/app/xcode/id497799835) из App Store, затем:
   ```bash
   sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
   sudo xcodebuild -runFirstLaunch
   ```
3. Для **Android**: установите [Android Studio](https://developer.android.com/studio) и SDK через мастер настройки
4. Запущенный веб-сервер с API:

```bash
cd ../web
docker compose -f ../docker-compose.yml up -d postgres
npm run dev
```

## Первый запуск

```bash
cd mobile

# Создаёт папки android/ и ios/ (один раз)
flutter create . --project-name mama_path

flutter pub get
flutter run
```

## Адрес API

По умолчанию: `http://localhost:3000`

| Платформа | Адрес для эмулятора |
|-----------|-------------------|
| iOS Simulator | `http://localhost:3000` |
| Android Emulator | `http://10.0.2.2:3000` |
| Реальный телефон | `http://<IP вашего Mac>:3000` |

```bash
# Android эмулятор
flutter run --dart-define=API_BASE=http://10.0.2.2:3000

# Телефон в той же Wi‑Fi сети
flutter run --dart-define=API_BASE=http://192.168.1.10:3000
```

## Сборка релиза

```bash
flutter build apk          # Android
flutter build ios          # iOS (нужен Mac + Xcode)
```

## Дальше

- [ ] Карта роддомов (flutter_map)
- [ ] Офлайн-кэш курсов
- [ ] Авторизация и прогресс
- [ ] Push-уведомления
- [ ] Публикация в App Store / Google Play
