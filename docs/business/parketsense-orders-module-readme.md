# PARKETSENSE - Модул Поръчки

## 📋 Общ преглед

Модулът за поръчки е централна част от PARKETSENSE ERP системата, управляваща целия жизнен цикъл на поръчките от създаване до доставка.

## 🏗️ Архитектура

### Backend (NestJS)
- **OrdersModule** - основен модул
- **OrdersController** - API endpoints
- **OrdersService** - бизнес логика
- **DTOs** - валидация на данни

### Frontend (React + TypeScript)
- **OrdersPage** - списък с поръчки
- **OrderDetails** - детайлен преглед
- **OrderForm** - създаване/редакция
- **OrderStatus** - управление на статуси

### Database (PostgreSQL)
- **orders** - основна таблица
- **supplier_orders** - поръчки към доставчици
- **order_payments** - плащания
- **order_deliveries** - доставки
- **order_status_history** - история на статусите

## 🔄 Тристепенен статус система

### 1. Информационен статус
- `not_confirmed` - Непотвърдена
- `confirmed` - Потвърдена

### 2. Платежен статус
- `not_paid` - Неплатена
- `advance_paid` - Авансово платена
- `fully_paid` - Напълно платена

### 3. Статус на доставка
- `pending` - Чакаща доставка
- `partial` - Частично доставена
- `completed` - Напълно доставена

## 📊 Ключови функционалности

### Управление на поръчки
- ✅ Създаване на поръчки от варианти
- ✅ Редакция на поръчки
- ✅ Проследяване на статуси
- ✅ История на промените

### Финансово управление
- ✅ Изчисляване на суми
- ✅ Проследяване на плащания
- ✅ Автоматично изчисляване на печалба
- ✅ Управление на аванси

### Доставки
- ✅ Планиране на доставки
- ✅ Проследяване на статус
- ✅ Множествени доставки
- ✅ Документи за доставка

### Комуникация
- ✅ Email уведомления
- ✅ Автоматични съобщения
- ✅ Шаблони за имейли
- ✅ История на комуникацията

## 🔗 Интеграции

### Вътрешни модули
- **Clients** - клиентска информация
- **Projects** - проектни данни
- **Variants** - варианти на оферти
- **Products** - продуктов каталог

### Външни системи
- **Email** - SMTP интеграция
- **File Storage** - документи и файлове
- **Payment Gateway** - онлайн плащания

## 📈 Аналитика и отчети

### Ключови метрики
- Общ брой поръчки
- Потвърдени поръчки
- Платени поръчки
- Доставени поръчки

### Финансови отчети
- Общ оборот
- Печалба по поръчки
- Просрочени плащания
- Анализ по периоди

## 🚀 API Endpoints

### Основни операции
```
GET    /orders              - Списък с поръчки
POST   /orders              - Създаване на поръчка
GET    /orders/:id          - Детайли на поръчка
PATCH  /orders/:id          - Редакция на поръчка
DELETE /orders/:id          - Изтриване на поръчка
```

### Статус операции
```
PATCH  /orders/:id/status   - Промяна на статус
GET    /orders/statistics   - Статистика
```

### Плащания
```
GET    /orders/:id/payments - Плащания по поръчка
POST   /orders/:id/payments - Добавяне на плащане
```

### Доставки
```
GET    /orders/:id/deliveries - Доставки по поръчка
POST   /orders/:id/deliveries - Добавяне на доставка
```

## 📝 Документация

### Техническа документация
- [Database Schema](./technical/orders-database-schema.sql)
- [Backend API](./technical/orders-backend-api.js)
- [Frontend Components](./technical/orders-frontend-components.js)
- [Email Templates](./technical/orders-routes-email-templates.js)

### Дизайн файлове
- [Frontend Prototype](./designs/orders-frontend-prototype.html)

## 🔧 Конфигурация

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password

# File Storage
UPLOAD_PATH=/uploads
MAX_FILE_SIZE=10485760
```

### Настройки на поръчки
```typescript
// Default values
const ORDER_CONFIG = {
  defaultAdvancePercent: 70,
  defaultCurrency: 'BGN',
  autoCalculateProfit: true,
  sendConfirmationEmail: true,
  requireConfirmation: false
};
```

## 🧪 Тестване

### Unit Tests
```bash
# Backend tests
npm run test orders

# Frontend tests
npm run test orders
```

### Integration Tests
```bash
# API tests
npm run test:e2e orders
```

## 📦 Deployment

### Backend
```bash
# Build
npm run build

# Start
npm run start:prod
```

### Frontend
```bash
# Build
npm run build

# Deploy
npm run deploy
```

## 🔄 Миграции

### Database
```bash
# Generate migration
npx prisma migrate dev --name add_orders_module

# Apply migration
npx prisma migrate deploy
```

## 📞 Поддръжка

За въпроси и проблеми свързани с модула за поръчки:
- **Email**: support@parketsense.com
- **Documentation**: [Wiki](https://wiki.parketsense.com/orders)
- **Issues**: [GitHub Issues](https://github.com/parketsense/erp/issues)

---

**Версия**: 1.0.0  
**Последна актуализация**: 2024-12-24  
**Автор**: PARKETSENSE Development Team 