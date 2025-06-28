# 📋 PARKETSENSE ERP - Developer Checklist

## 🚀 Начало на проекта

### 1. Setup на средата
- [ ] Клониране на repository
- [ ] Инсталиране на Node.js 18+
- [ ] Инсталиране на PostgreSQL 14+
- [ ] Създаване на `.env` файл (копирайте `.env.example`)
- [ ] Инсталиране на dependencies (`npm install`)
- [ ] Създаване на database
- [ ] Изпълнение на migrations

### 2. Прочитане на документация
- [ ] `README.md` - общ преглед
- [ ] `PROJECT-OVERVIEW.md` - бизнес контекст
- [ ] `docs/technical/01-architecture.md` - техническа архитектура
- [ ] Wireframes в `wireframes/html-prototypes/`

### 3. Разбиране на бизнес логиката
- [ ] Как работи процесът на офериране
- [ ] Йерархия: Клиент → Проект → Фаза → Вариант → Стая → Продукт
- [ ] Специфики: контактите са към проект, не към клиент
- [ ] Роли и права (само админ може да трие)

## 🏗️ За всеки нов модул

### Преди да започнете кодирането

#### 📚 Прочетете документацията на модула
- [ ] `docs/modules/[module]/README.md` - обзор
- [ ] `business-logic.md` - бизнес правила
- [ ] `database-schema.sql` - таблици
- [ ] `api-endpoints.md` - API спецификация
- [ ] `ui-specifications.md` - UI изисквания

#### 💾 Database
- [ ] Създайте migration файл с правилен номер
- [ ] Добавете всички индекси от спецификацията
- [ ] Добавете foreign keys и constraints
- [ ] Тествайте migration up и down
- [ ] Добавете тестови данни в `database/seeds/`

#### 🔌 Backend (API)
- [ ] Създайте routes файл
- [ ] Имплементирайте всички endpoints от спецификацията
- [ ] Добавете валидации (Joi, express-validator, etc.)
- [ ] Добавете error handling
- [ ] Имплементирайте pagination където е нужно
- [ ] Добавете authentication/authorization middleware
- [ ] Напишете unit tests

#### ⚛️ Frontend (React)
- [ ] Създайте папка за модула в `src/modules/[module]/`
- [ ] Имплементирайте компонентите според wireframes
- [ ] Използвайте TypeScript за type safety
- [ ] Добавете form валидации
- [ ] Имплементирайте loading states
- [ ] Добавете error handling
- [ ] Направете responsive design
- [ ] Тествайте с различни браузъри

## ✅ Checklist за модул "Клиенти"

### Database
- [ ] Таблица `clients` с всички полета
- [ ] Таблица `audit_log` за история
- [ ] Тригер за автоматичен audit log
- [ ] Уникален индекс на `eik_bulstat`
- [ ] Soft delete функционалност

### API Endpoints
- [ ] `GET /api/clients` - списък с пагинация
- [ ] `GET /api/clients/:id` - детайли
- [ ] `POST /api/clients` - създаване
- [ ] `PUT /api/clients/:id` - редактиране
- [ ] `DELETE /api/clients/:id` - изтриване (само админ)
- [ ] `GET /api/clients/:id/history` - история
- [ ] `PUT /api/clients/:id/add-company` - добавяне на фирма
- [ ] `POST /api/clients/check-duplicate-eik` - проверка за дубликат

### Frontend компоненти
- [ ] `ClientsList` - таблица със статистики
- [ ] `ClientForm` - създаване/редактиране
- [ ] `ClientDetails` - детайлна страница
- [ ] `ClientHistory` - история на промените
- [ ] Search и филтри
- [ ] Валидации в реално време

### Бизнес логика
- [ ] Име и фамилия са задължителни
- [ ] Телефонът НЕ е задължителен
- [ ] ЕИК е уникален (ако има фирма)
- [ ] Може да се добави фирма по-късно
- [ ] Само админ може да трие
- [ ] Всички промени в audit log

### Тестване
- [ ] Създаване на клиент без телефон
- [ ] Добавяне на фирма към съществуващ клиент
- [ ] Опит за дублиран ЕИК - трябва да гърми
- [ ] Изтриване като обикновен user - трябва да е забранено
- [ ] История показва всички промени

## 🧪 Тестване

### За всеки модул тествайте:

#### Happy Path
- [ ] Създаване на нов запис
- [ ] Редактиране на съществуващ
- [ ] Изтриване (ако е позволено)
- [ ] Търсене и филтриране
- [ ] Пагинация

#### Edge Cases
- [ ] Празни/null стойности
- [ ] Много дълги стойности
- [ ] Специални символи
- [ ] Конкурентни заявки
- [ ] Големи обеми данни

#### Errors
- [ ] Невалидни данни
- [ ] Липсващи задължителни полета
- [ ] Дубликати където не трябва
- [ ] Недостатъчни права
- [ ] Network errors

## 📦 Преди deployment

### Code Quality
- [ ] Няма `console.log` в production код
- [ ] Няма hardcoded стойности
- [ ] Всички TODO коментари са адресирани
- [ ] Кодът е форматиран (Prettier/ESLint)
- [ ] TypeScript няма грешки

### Security
- [ ] Всички endpoints изискват authentication
- [ ] Проверка на права където е нужно
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] Валидация на всички входни данни

### Performance
- [ ] Database queries използват индекси
- [ ] N+1 query проблеми са решени
- [ ] Pagination за големи списъци
- [ ] Lazy loading за изображения
- [ ] Bundle size е оптимизиран

### Documentation
- [ ] API endpoints са документирани
- [ ] Сложна бизнес логика е коментирана
- [ ] README е обновен ако е нужно
- [ ] Changelog е попълнен

## 🚢 Deployment Checklist

### Pre-deployment
- [ ] Всички tests минават
- [ ] Build процесът е успешен
- [ ] Environment variables са setup-нати
- [ ] Database migrations са готови
- [ ] Backup на текущата database

### Post-deployment
- [ ] Проверка на основните функционалности
- [ ] Monitoring за грешки
- [ ] Performance метрики
- [ ] Проверка на logs
- [ ] Smoke tests

## 📞 Комуникация

### При проблеми питайте за:
1. **Бизнес логика** - Product Owner
2. **UI/UX** - проверете wireframes или питайте
3. **Технически решения** - документирайте защо сте избрали X вместо Y
4. **Промени в изискванията** - винаги актуализирайте документацията

### Редовни updates:
- [ ] Daily standup - какво сте свършили/ще правите
- [ ] Блокажи - съобщавайте веднага
- [ ] Готови features - demo за feedback
- [ ] Технически дълг - документирайте за по-късно

---

**Успех! 🚀**

Ако нещо не е ясно - питайте! По-добре да питате сега, отколкото да преправяте после.