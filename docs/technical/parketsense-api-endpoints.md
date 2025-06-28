# PARKETSENSE ERP - API Endpoints

## Модул "Клиенти"

### GET /api/clients
Връща списък с клиенти с пагинация и филтриране

**Query параметри:**
- `page` (int): Номер на страницата (default: 1)
- `limit` (int): Брой резултати на страница (default: 20)
- `search` (string): Търсене по име, телефон, email, фирма
- `has_company` (boolean): Филтър само клиенти с фирми
- `is_architect` (boolean): Филтър само архитекти
- `sort` (string): Сортиране - `name`, `created_at`, `last_activity`
- `order` (string): Посока - `asc`, `desc`

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "first_name": "Иван",
      "last_name": "Сивков",
      "full_name": "Иван Сивков",
      "phone": "+359888123456",
      "email": "ivan@example.com",
      "has_company": true,
      "company_name": "Архитектурно студио Сивков ЕООД",
      "is_architect": true,
      "commission_percent": 10,
      "projects_count": 3,
      "last_activity": "2025-04-24T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1247,
    "pages": 63
  }
}
```

### GET /api/clients/stats
Връща статистики за клиентите

**Response:**
```json
{
  "total_clients": 1247,
  "individuals": 892,
  "companies": 355,
  "architects": 47,
  "active_last_30_days": 156
}
```

### GET /api/clients/:id
Връща детайли за конкретен клиент

**Response:**
```json
{
  "id": "uuid",
  "client_type": "individual",
  "first_name": "Иван",
  "last_name": "Сивков",
  "phone": "+359888123456",
  "email": "ivan@example.com",
  "address": "София, ул. Витоша 15",
  "is_architect": true,
  "commission_percent": 10,
  "contacts": [
    {
      "id": "uuid",
      "name": "Мария Иванова",
      "phone": "+359888999000",
      "email": "maria@example.com",
      "receives_offers": true,
      "receives_invoices": false,
      "is_primary": true
    }
  ],
  "projects": [
    {
      "id": "uuid",
      "name": "Къща Бояна",
      "type": "house",
      "status": "active",
      "created_at": "2025-03-15T10:00:00Z"
    }
  ],
  "created_at": "2024-01-15T09:30:00Z",
  "updated_at": "2025-04-20T14:20:00Z"
}
```

### POST /api/clients
Създава нов клиент

**Request body:**
```json
{
  "first_name": "Петър",
  "last_name": "Петров",
  "phone": "+359899123456",
  "email": "petar@example.com",
  "address": "Пловдив, ул. Главна 25",
  "has_company": true,
  "company_name": "Петров Дизайн ЕООД",
  "eik_bulstat": "123456789",
  "vat_number": "BG123456789",
  "company_address": "Пловдив, ул. Бизнес 10",
  "company_phone": "+35932123456",
  "company_email": "office@petrovdesign.bg",
  "is_architect": true,
  "commission_percent": 15,
  "notes": "Препоръчан от Иван Иванов"
}
```

**Валидации:**
- `first_name` и `last_name` са задължителни
- `phone` не е задължителен
- Ако `has_company` е true, тогава `company_name` и `eik_bulstat` са задължителни
- `eik_bulstat` трябва да е уникален в системата

**Error Response (409 Conflict):**
```json
{
  "error": "duplicate_eik",
  "message": "Фирма с този ЕИК вече съществува",
  "existing_client": {
    "id": "uuid",
    "name": "Иван Иванов",
    "company_name": "Друга фирма ЕООД"
  }
}
```

### PUT /api/clients/:id
Обновява данните на клиент

**Специални случаи:**
- Може да се добави фирма към съществуващ клиент (промяна на `has_company` от false на true)
- Автоматично записване в audit log

### PUT /api/clients/:id/add-company
Добавя фирмени данни към съществуващ клиент

**Request body:**
```json
{
  "company_name": "Нова фирма ООД",
  "eik_bulstat": "987654321",
  "vat_number": "BG987654321",
  "company_address": "София, ул. Бизнес 20",
  "company_phone": "+3592987654",
  "company_email": "info@novafirma.bg"
}
```

### DELETE /api/clients/:id
Изтрива клиент (soft delete)

**Изисквания:**
- Само потребители с роля 'admin'
- Soft delete (запазва се в базата с deleted_at timestamp)

**Response (403 Forbidden):**
```json
{
  "error": "insufficient_permissions",
  "message": "Само администратори могат да изтриват клиенти"
}
```

### GET /api/clients/:id/history
Връща история на промените за клиент

**Response:**
```json
{
  "history": [
    {
      "id": "uuid",
      "action": "update",
      "changed_fields": ["phone", "email"],
      "old_values": {
        "phone": "+359888111222",
        "email": "old@email.com"
      },
      "new_values": {
        "phone": "+359888333444",
        "email": "new@email.com"
      },
      "user": {
        "id": "uuid",
        "name": "Анатоли Миланов"
      },
      "created_at": "2025-04-20T14:30:00Z"
    }
  ]
}
```

### GET /api/clients/:id/history
Връща история на промените за клиент

**Response:**
```json
{
  "history": [
    {
      "id": "uuid",
      "action": "update",
      "changed_fields": ["phone", "email"],
      "old_values": {
        "phone": "+359888111222",
        "email": "old@email.com"
      },
      "new_values": {
        "phone": "+359888333444",
        "email": "new@email.com"
      },
      "user": {
        "id": "uuid",
        "name": "Анатоли Миланов"
      },
      "created_at": "2025-04-20T14:30:00Z"
    }
  ]
}
```

### POST /api/clients/check-duplicate-eik
Проверява за дублиращ се ЕИК преди създаване

**Request body:**
```json
{
  "eik": "123456789"
}
```

**Response:**
```json
{
  "is_duplicate": true,
  "existing_client": {
    "id": "uuid",
    "name": "Иван Сивков",
    "company_name": "Съществуваща фирма ЕООД"
  }
}
```

## Модул "Проекти"

### POST /api/projects
Създава нов проект за клиент

**Request body:**
```json
{
  "client_id": "uuid",
  "name": "Апартамент Витоша",
  "project_type": "apartment",
  "address": "София, ул. Витоша 123",
  "notes": "3-стаен апартамент, 120 кв.м."
}
```

### POST /api/projects/:id/contacts
Добавя контактно лице към проект

**Request body:**
```json
{
  "name": "Мария Петрова",
  "phone": "+359888999000",
  "email": "maria@example.com",
  "position": "Управител на проекта",
  "receives_offers": true,
  "receives_invoices": false,
  "is_primary": true
}
```

### GET /api/projects/:id/contacts
Връща всички контактни лица за проект

**Response:**
```json
{
  "contacts": [
    {
      "id": "uuid",
      "name": "Петър Петров",
      "phone": "+359888123456",
      "email": "petar@example.com",
      "position": "Собственик",
      "receives_offers": true,
      "receives_invoices": true,
      "is_primary": true
    },
    {
      "id": "uuid", 
      "name": "Мария Петрова",
      "phone": "+359888999000",
      "email": "maria@example.com",
      "position": "Управител",
      "receives_offers": true,
      "receives_invoices": false,
      "is_primary": false
    }
  ]
}
```

### POST /api/clients/:id/contacts
Добавя ново лице за контакт

**Request body:**
```json
{
  "name": "Стефан Стефанов",
  "phone": "+359877111222",
  "email": "stefan@company.com",
  "position": "Финансов директор",
  "receives_offers": false,
  "receives_invoices": true
}
```

### GET /api/clients/search
Бързо търсене за autocomplete

**Query параметри:**
- `q` (string): Текст за търсене (минимум 2 символа)

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "label": "Иван Сивков (Архитект)",
      "type": "individual",
      "phone": "+359888123456"
    }
  ]
}
```

### GET /api/clients/architects
Връща само архитекти/дизайнери

**Response:** същото като /api/clients но филтрирано

### POST /api/clients/import
Масово импортиране на клиенти от CSV/Excel

**Request:** multipart/form-data с файл

**Response:**
```json
{
  "imported": 45,
  "skipped": 3,
  "errors": [
    {
      "row": 23,
      "error": "Невалиден телефонен номер"
    }
  ]
}
```

## Общи HTTP статус кодове

- `200 OK` - Успешна операция
- `201 Created` - Успешно създаден ресурс
- `400 Bad Request` - Невалидни данни
- `401 Unauthorized` - Липсва authentication
- `403 Forbidden` - Няма права за операцията
- `404 Not Found` - Ресурсът не е намерен
- `422 Unprocessable Entity` - Валидационни грешки
- `500 Internal Server Error` - Сървърна грешка

## Валидационни правила

### Клиенти
- `phone`: задължително, валиден телефонен номер
- `email`: валиден email формат (ако е попълнен)
- `commission_percent`: между 0 и 100 (ако е архитект)
- За юридически лица: `company_name` и `eik_bulstat` са задължителни

## AI Endpoints (бъдещи)

### POST /api/clients/ai/suggestions
Предлага продукти базирани на историята на клиента

### POST /api/clients/ai/risk-score
Изчислява risk score за неплащане

### GET /api/clients/ai/insights/:id
Връща AI-генерирани insights за клиента