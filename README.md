# Mama Path

MVP экосистемы для будущих родителей в Казахстане.

## Что уже есть

- Python-парсер роддомов из [YDoc](https://ydoc.kz) и [103.kz](https://www.103.kz)
- Объединение карточек по адресу + геокодинг OpenStreetMap
- **Курсы** для мамы и папы: roadmap, главы, мини-тесты, прогресс в браузере
- **Каталог товаров** — 7 категорий, 41 позиция, фильтры по этапу и поиск (seed-данные)
- **Календарь беременности** (`/tracker`) — 4–40 неделя: размер малыша, самочувствие мамы, совет недели, ссылки на главы курса
- **Чек-лист сумки в роддом** (`/checklist`) — 34 пункта, прогресс в браузере, печать
- **Срочная помощь** — ориентир по симптомам, экстренные номера и «красные флаги»
- Web-приложение Next.js
- **Мобильное приложение Flutter** (`mobile/`) — отдельный нативный UI для iOS/Android

## Быстрый старт

### 1. Собрать данные

```bash
cd scraper
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

### 2. Запустить PostgreSQL

```bash
docker compose up -d postgres
```

По умолчанию:
- host: `127.0.0.1:5432`
- db/user/password: `mamapath`

### 3. Запустить web + backend

Backend встроен в Next.js (`/api/v1/*`) и использует PostgreSQL.

```bash
cd web
npm install
cp ../.env.example .env.local   # при необходимости
npm run dev
```

Открыть: http://localhost:3000

### 4. Мобильное приложение (Flutter)

```bash
# Установите Flutter: https://docs.flutter.dev/get-started/install
cd mobile
flutter create . --project-name mama_path
flutter pub get
flutter run --dart-define=API_BASE=http://10.0.2.2:3000   # Android эмулятор
```

Подробнее: [mobile/README.md](mobile/README.md)

### 5. Миграции и seed

```bash
cd web
npm run db:setup      # migrate + seed
```

Полный сброс dev-базы:

```bash
npm run db:reset
```

#### Как добавить новую миграцию

1. Изменить схему в `web/db/schema.ts`
2. `npm run db:generate -- --name add_feature`
3. `npm run db:migrate`
4. При необходимости обновить `scripts/seed.ts`

Схема описана в Drizzle (`web/db/schema.ts`), SQL-миграции лежат в `web/db/migrations/`.

## Структура

```text
mama-path/
  api/              # FastAPI backend (auth, progress, REST)
  scraper/          # парсеры и CLI
  data/             # JSON + SQLite после запуска парсера
  web/              # Next.js приложение
  mobile/           # Flutter приложение (iOS + Android)
```

## API endpoints

- `GET /api/v1/hospitals` — роддома
- `GET /api/v1/courses` — курсы
- `GET /api/v1/products` — товары
- `POST /api/v1/auth/register` — регистрация
- `POST /api/v1/auth/login` — вход
- `GET /api/v1/progress` — прогресс (JWT)
- `PUT /api/v1/progress/{track}/{chapter}` — сохранить главу (JWT)

## Важно

- Парсер делает паузу между запросами и помечает User-Agent.
- Данные предназначены для MVP/исследования. Перед продакшеном нужны:
  - геокодинг адресов
  - ручная модерация
  - проверка актуальности цен
  - юридический дисклеймер по источникам

## Следующие шаги

1. Парсер товаров (Kaspi) + UGC-отзывы
2. AI triage (срочные вопросы)
3. Backend + auth + подписка
4. Доработка Flutter: карта, офлайн, auth, публикация в сторах
