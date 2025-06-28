# ParketSense ERP - Offers Module

## Общ преглед

Модулът за оферти в ParketSense ERP предоставя пълна функционалност за управление на оферти и проформи в паркетната индустрия. Системата поддържа различни типове оферти - от авансови до окончателни проформи, включително специални оферти за монтаж и луксозни продукти.

## Архитектура

### Backend (NestJS)

```
apps/backend/src/offers/
├── offers.module.ts          # Основен модул
├── offers.controller.ts      # REST API endpoints
├── offers.service.ts         # Бизнес логика
└── dto/
    ├── create-offer.dto.ts   # DTO за създаване
    └── update-offer.dto.ts   # DTO за обновяване
```

### Frontend (React + TypeScript)

```
apps/frontend/src/
├── pages/offers/
│   ├── index.tsx             # Списък с оферти
│   ├── create.tsx            # Създаване на оферта
│   ├── [id].tsx              # Детайли на оферта
│   └── [id]/edit.tsx         # Редактиране на оферта
├── services/offersApi.ts     # API комуникация
├── hooks/useOffers.ts        # React Query hooks
└── types/offers.ts           # TypeScript типове
```

### Database Schema (Prisma)

```sql
model Offer {
  id          String      @id @default(cuid())
  offerNumber String      @unique
  type        OfferType
  status      OfferStatus @default(DRAFT)
  projectId   String
  variantId   String
  roomId      String
  clientId    String
  totalAmount Decimal     @db.Decimal(10,2)
  currency    String      @default("EUR")
  validUntil  DateTime?
  notes       String?
  terms       String?
  conditions  String?
  issuedBy    String?
  issuedAt    DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  // Relations
  project     Project     @relation(fields: [projectId], references: [id])
  variant     ProjectVariant @relation(fields: [variantId], references: [id])
  room        ProjectRoom @relation(fields: [roomId], references: [id])
  client      Client      @relation(fields: [clientId], references: [id])
  items       OfferItem[]
}

model OfferItem {
  id          String   @id @default(cuid())
  offerId     String
  productName String
  quantity    Decimal  @db.Decimal(10,2)
  unitPrice   Decimal  @db.Decimal(10,2)
  totalPrice  Decimal  @db.Decimal(10,2)
  description String?
  unit        String?  @default("м²")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  offer       Offer    @relation(fields: [offerId], references: [id], onDelete: Cascade)
}
```

## Типове оферти

### 1. Авансови оферти (ADVANCE)
- За предварително плащане на материали
- Обикновено 30-50% от общата стойност
- Номер: PF2025-001512

### 2. Междинни оферти (INTERIM)
- За междинни плащания по време на проекта
- След доставка на определени материали
- Номер: IF2025-001678

### 3. Окончателни оферти (FINAL)
- За финално плащане
- След завършване на проекта
- Номер: FF2025-001789

### 4. Кредитни оферти (CREDIT)
- За връщане на суми
- При промяна на спецификации
- Номер: CR2025-000023

### 5. Монтажни оферти (MONTAGE)
- За монтажни услуги
- Отделно от материалите
- Номер: MO2025-000045

### 6. Луксозни оферти (LUXURY)
- За премиум продукти
- Специални условия
- Номер: LX2025-000012

## Статуси на оферти

- **DRAFT** - Чернова
- **SENT** - Изпратена
- **ACCEPTED** - Приета
- **REJECTED** - Отхвърлена
- **EXPIRED** - Изтекла

## API Endpoints

### GET /offers
Получаване на всички оферти с филтри

**Query параметри:**
- `type` - Тип оферта
- `projectId` - ID на проект
- `variantId` - ID на вариант
- `status` - Статус на оферта

### GET /offers/:id
Получаване на конкретна оферта

### POST /offers
Създаване на нова оферта

### PATCH /offers/:id
Обновяване на оферта

### DELETE /offers/:id
Изтриване на оферта

### GET /offers/stats
Статистики за офертите

### POST /offers/generate-number
Генериране на номер на оферта

## Функционалности

### 1. Създаване на оферти
- Автоматично генериране на номера
- Избор на проект, вариант и стая
- Добавяне на позиции с количества и цени
- Автоматично изчисляване на общите суми

### 2. Управление на позиции
- Добавяне/премахване на продукти
- Редактиране на количества и цени
- Автоматично изчисляване на отстъпки
- Поддръжка на различни мерни единици

### 3. Филтриране и търсене
- По тип оферта
- По статус
- По проект/клиент
- По дата на създаване

### 4. Статистики
- Общ брой оферти
- Приети оферти
- Обща стойност
- Статистики по тип

### 5. Експорт и печат
- Генериране на PDF
- Печат на оферти
- Изпращане по имейл

## Интеграция с други модули

### Проекти
- Офертите са свързани с конкретни проекти
- Автоматично наследяване на данни за клиент
- Проследяване на всички оферти за проект

### Клиенти
- Автоматично попълване на данни за клиент
- История на офертите по клиент
- Статистики по клиент

### Продукти
- Интеграция с продуктов каталог
- Автоматично попълване на цени
- Проследяване на наличности

## Workflow

### 1. Създаване на оферта
```
Проект → Фаза → Вариант → Стая → Създаване на оферта
```

### 2. Процес на одобрение
```
Чернова → Изпратена → Приета/Отхвърлена
```

### 3. Фактуриране
```
Авансова оферта → Междинна оферта → Окончателна оферта
```

## Бизнес правила

### 1. Номериране
- Автоматично генериране на номера
- Формат: [ТИП][ГОДИНА]-[ПОРЕДЪК]
- Пример: PF2025-001512

### 2. Валидност
- Офертите имат срок на валидност
- Автоматично маркиране като изтекли
- Възможност за удължаване

### 3. Цени
- Поддръжка на различни валути
- Автоматично изчисляване на ДДС
- Прилагане на отстъпки

### 4. Условия
- Стандартни условия за плащане
- Условия за доставка
- Гаранционни условия

## Бъдещи разширения

### 1. Автоматизация
- Автоматично създаване на оферти
- Интеграция с продуктов каталог
- Автоматично изчисляване на цени

### 2. Аналитика
- Детайлни отчети
- Анализ на ефективността
- Прогнозиране на продажби

### 3. Интеграции
- Интеграция с счетоводни системи
- Електронно подписване
- Автоматично изпращане по имейл

### 4. Мобилно приложение
- Мобилен достъп до оферти
- Създаване на оферти в полето
- Сканиране на QR кодове

## Технически изисквания

### Backend
- Node.js 18+
- NestJS 10+
- Prisma ORM
- PostgreSQL 14+

### Frontend
- React 18+
- TypeScript 5+
- React Query
- Tailwind CSS

### Database
- PostgreSQL 14+
- Поддръжка на JSON полета
- Индекси за бързо търсене

## Разработка

### Стартиране на разработка

```bash
# Backend
cd apps/backend
pnpm install
pnpm run start:dev

# Frontend
cd apps/frontend
pnpm install
pnpm run dev
```

### Миграции

```bash
# Генериране на миграция
cd apps/backend
npx prisma migrate dev --name add_offers

# Прилагане на миграции
npx prisma migrate deploy
```

### Тестване

```bash
# Backend тестове
cd apps/backend
pnpm run test

# Frontend тестове
cd apps/frontend
pnpm run test
```

## Поддръжка

За въпроси и поддръжка, моля свържете се с екипа за разработка на ParketSense ERP. 