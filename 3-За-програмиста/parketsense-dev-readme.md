# PARKETSENSE ERP - Developer Guide

## 🚀 Quick Start за модул "Клиенти"

### 1. Database Setup

```bash
# Създаване на базата данни
createdb parketsense_erp

# Изпълнение на migrations (вижте схемата в документацията)
psql -d parketsense_erp -f migrations/001_users.sql
psql -d parketsense_erp -f migrations/002_clients.sql
psql -d parketsense_erp -f migrations/003_audit_log.sql
```

### 2. Backend Setup (Node.js вариант)

```bash
# Инициализация
npm init -y
npm install express postgresql-client jsonwebtoken bcrypt cors dotenv
npm install -D nodemon typescript @types/node @types/express

# Структура на проекта
backend/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   └── clientsController.js
│   ├── models/
│   │   └── Client.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validateRequest.js
│   ├── routes/
│   │   └── clients.js
│   └── app.js
├── .env
└── package.json
```

### 3. Frontend Setup (React)

```bash
# Създаване на React app
npx create-react-app parketsense-frontend --template typescript
cd parketsense-frontend

# Инсталиране на dependencies
npm install axios react-router-dom @tanstack/react-query
npm install -D @types/react-router-dom
```

## 📋 Ключови изисквания за модул "Клиенти"

### Бизнес правила
1. **Уникални телефони** - ВСЕКИ телефон е уникален, няма дубликати
2. **Максимум 3 контактни лица** - валидация при добавяне
3. **Само админи могат да трият** - проверка на роля
4. **История на промените** - автоматичен audit log

### Валидации
```javascript
// Пример валидация за телефон
const validatePhone = (phone) => {
  // Премахваме интервали и специални символи
  const cleaned = phone.replace(/\s+/g, '');
  
  // Проверка за български формат
  const bgPhoneRegex = /^(\+359|0)[87-9]\d{8}$/;
  return bgPhoneRegex.test(cleaned);
};

// Проверка за дубликат
const checkDuplicate = async (phone) => {
  const result = await db.query(
    'SELECT id, first_name, last_name FROM clients WHERE phone = $1 AND deleted_at IS NULL',
    [phone]
  );
  return result.rows[0];
};
```

### API Response формати

**Успешен отговор:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Грешка:**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_PHONE",
    "message": "Клиент с този телефон вече съществува",
    "details": { ... }
  }
}
```

## 🔐 Authentication & Authorization

```javascript
// Middleware за проверка на роля
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'INSUFFICIENT_PERMISSIONS',
        message: 'Само администратори имат достъп'
      }
    });
  }
  next();
};

// Използване в routes
router.delete('/clients/:id', authenticate, requireAdmin, deleteClient);
```

## 📊 Audit Log Implementation

```javascript
// При всяка промяна
const updateClient = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Вземаме старите данни
  const oldData = await Client.findById(id);
  
  // Обновяваме
  const newData = await Client.update(id, updates);
  
  // Записваме в audit log
  await AuditLog.create({
    table_name: 'clients',
    record_id: id,
    action: 'update',
    old_values: oldData,
    new_values: newData,
    changed_fields: Object.keys(updates),
    user_id: req.user.id
  });
  
  res.json({ success: true, data: newData });
};
```

## 🎨 UI Components Structure

```typescript
// components/clients/
├── ClientsList.tsx          // Главна таблица
├── ClientForm.tsx          // Модал за създаване/редактиране
├── ClientFilters.tsx       // Филтри и търсене
├── ClientStats.tsx         // Статистики cards
├── ContactPersonForm.tsx   // Форма за контактни лица
└── ClientHistory.tsx       // История на промените
```

## 🔄 React Query за data fetching

```typescript
// hooks/useClients.ts
export const useClients = (filters) => {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: () => api.getClients(filters)
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.createClient,
    onSuccess: () => {
      queryClient.invalidateQueries(['clients']);
    }
  });
};
```

## ⚡ Performance оптимизации

1. **Индекси в базата** - вече добавени в схемата
2. **Pagination** - задължително за списъка
3. **Debounce за търсене** - 300ms delay
4. **Lazy loading** за история на промените

## 🧪 Тестови данни

```sql
-- Добавяне на тестови клиенти
INSERT INTO clients (client_type, first_name, last_name, phone, email, is_architect, commission_percent)
VALUES 
  ('individual', 'Тест', 'Архитект', '+359888000001', 'architect@test.com', true, 15),
  ('company', 'Тестова', 'Фирма', '+359888000002', 'company@test.com', false, null),
  ('individual', 'Обикновен', 'Клиент', '+359888000003', 'client@test.com', false, null);
```

## 📝 Следващи стъпки

1. Имплементирайте базовото CRUD за клиенти
2. Добавете валидациите и проверка за дубликати
3. Имплементирайте audit log
4. Създайте UI компонентите според wireframe
5. Тествайте с различни сценарии

## ❓ Въпроси към Product Owner

- Как да форматираме телефонните номера? (+359 88 888 8888 или +359888888888)
- Искате ли нотификации при създаване на нов клиент?
- Трябва ли да експортваме клиенти в Excel?

---

За въпроси: Свържете се с Product Owner