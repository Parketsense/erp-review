# PARKETSENSE ERP - Файлова структура на проекта

## 📁 Препоръчителна организация

```
PARKETSENSE-ERP/
├── 📄 README.md                    # Главен файл с обща информация
├── 📋 PROJECT-OVERVIEW.md          # Визия и бизнес контекст
│
├── 📁 docs/                        # Цялата документация
│   ├── 📁 business/               # Бизнес документация
│   │   ├── 01-business-processes.md
│   │   ├── 02-user-stories.md
│   │   ├── 03-requirements.md
│   │   └── 04-future-vision.md
│   │
│   ├── 📁 technical/              # Техническа документация
│   │   ├── 01-architecture.md
│   │   ├── 02-database-schema.sql
│   │   ├── 03-api-documentation.md
│   │   └── 04-deployment-guide.md
│   │
│   └── 📁 modules/                # Документация по модули
│       ├── 📁 clients/
│       │   ├── README.md
│       │   ├── business-logic.md
│       │   ├── api-endpoints.md
│       │   ├── database-schema.sql
│       │   └── ui-specifications.md
│       │
│       ├── 📁 products/
│       │   └── ... (същата структура)
│       │
│       ├── 📁 offers/
│       │   └── ... (същата структура)
│       │
│       └── 📁 orders/
│           └── ... (същата структура)
│
├── 📁 wireframes/                  # UI прототипи и дизайни
│   ├── 📁 html-prototypes/
│   │   ├── clients-list.html
│   │   ├── client-create.html
│   │   └── client-edit.html
│   │
│   └── 📁 screenshots/            # Скрийншоти от текущата система
│       ├── current-system/
│       └── new-designs/
│
├── 📁 diagrams/                    # Диаграми и схеми
│   ├── process-flows/
│   │   ├── offer-process.mermaid
│   │   └── order-workflow.png
│   │
│   └── architecture/
│       ├── system-architecture.png
│       └── database-erd.png
│
├── 📁 api/                         # API спецификации
│   ├── postman/                   # Postman колекции
│   │   └── PARKETSENSE-API.postman_collection.json
│   │
│   └── openapi/                   # OpenAPI/Swagger файлове
│       └── parketsense-api.yaml
│
├── 📁 database/                    # Database файлове
│   ├── 📁 migrations/             # SQL миграции
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_clients.sql
│   │   ├── 003_create_products.sql
│   │   └── ...
│   │
│   ├── 📁 seeds/                  # Тестови данни
│   │   ├── test_clients.sql
│   │   └── test_products.sql
│   │
│   └── backup/                    # Backup скриптове
│
└── 📁 project-management/          # Проектна документация
    ├── roadmap.md
    ├── priorities.md
    ├── meeting-notes/
    └── decisions/
```

## 📝 Съдържание на ключовите файлове

### 1. **README.md** (главен файл)
```markdown
# PARKETSENSE ERP

## 🎯 За проекта
Кратко описание на системата и целите

## 🚀 Quick Start
- Къде да започне програмистът
- Основни технологии
- Инсталация

## 📚 Документация
- Линкове към важните документи
- Структура на папките

## 🛠️ Технологичен стек
- Frontend: React
- Backend: Node.js
- Database: PostgreSQL

## 📞 Контакти
- Product Owner: [Вашето име]
- Developer: [Име на програмиста]
```

### 2. **docs/modules/clients/README.md**
```markdown
# Модул "Клиенти"

## Обзор
Кратко описание на модула

## Файлове в този модул
- `business-logic.md` - Бизнес правила и процеси
- `api-endpoints.md` - API документация
- `database-schema.sql` - Таблици и релации
- `ui-specifications.md` - UI/UX изисквания

## Ключови функционалности
1. Създаване на клиент (физическо лице + опционална фирма)
2. Търсене и филтриране
3. История на промените
4. ...

## Зависимости
- Този модул се използва от: Проекти, Оферти
- Зависи от: Users (за audit log)
```

## 🏷️ Конвенции за именуване

### Файлове
- **Използвайте номера** за подредба: `01-business-processes.md`
- **Kebab-case** за имена: `client-create-form.html`
- **Описателни имена**: `offer-workflow-diagram.png`

### SQL файлове
```
001_create_users.sql
002_create_clients.sql
003_add_audit_log.sql
004_create_projects.sql
```

### Версиониране на документи
```
offer-process-v1.md      # Първа версия
offer-process-v2.md      # Обновена версия
offer-process-CURRENT.md # Символен линк към текущата
```

## 🔧 Инструменти и формати

### Markdown (.md)
- За цялата текстова документация
- Поддържа се от GitHub/GitLab
- Лесно се чете и редактира

### Mermaid диаграми
- За процесни диаграми
- Рендират се автоматично в GitHub
- Могат да се редактират като текст

### SQL файлове
- Чист SQL без специфични за платформа команди
- Коментари за обяснение на сложна логика
- Консистентно форматиране

## 💡 Практически съвети

### 1. **Започнете с README**
Във всяка папка сложете README.md, който обяснява какво има вътре

### 2. **Версионирайте всичко**
Използвайте Git за проследяване на промените

### 3. **Screenshots са важни**
Запазвайте скрийншоти на текущата система за референция

### 4. **Пазете примери**
- Примерни API заявки/отговори
- Примерни данни
- Примерни use cases

### 5. **Документирайте решенията**
```
project-management/decisions/
├── 001-why-react-over-angular.md
├── 002-database-choice.md
└── 003-api-architecture.md
```

## 📋 Checklist за всеки модул

- [ ] README с обзор на модула
- [ ] Бизнес логика и правила
- [ ] Database схема (SQL)
- [ ] API endpoints документация
- [ ] UI wireframes/прототипи
- [ ] Тестови сценарии
- [ ] Примерни данни

## 🚀 За програмиста

### Препоръчителен ред на четене:
1. **Главен README.md**
2. **PROJECT-OVERVIEW.md** - за контекст
3. **docs/technical/01-architecture.md**
4. **docs/modules/[module]/README.md** - за конкретен модул
5. **wireframes/** - за визуална представа

### Къде да намери какво:
- **Бизнес логика** → `docs/business/` или `docs/modules/[module]/business-logic.md`
- **Технически детайли** → `docs/technical/`
- **API спецификации** → `api/` или в модула
- **Database** → `database/migrations/`
- **UI дизайни** → `wireframes/`

## 🔄 Поддръжка на документацията

### При всяка промяна:
1. Обновете съответния документ
2. Добавете дата на промяна
3. Ако е major промяна - запазете старата версия
4. Обновете README файловете ако е нужно

### Формат за changelog:
```markdown
## Промени

### 2025-04-23
- Добавена логика за фирмени клиенти
- Премахнато изискването за задължителен телефон

### 2025-04-20
- Първоначална версия
```