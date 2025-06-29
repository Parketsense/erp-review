# PARKETSENSE ERP - Модул "Проекти" 
## 🏗️ Пълна Developer Guide за Cursor

**Версия:** 1.0  
**Дата:** 29 Юни 2025  
**Статус:** Ready for Implementation  

---

## 📋 **СЪДЪРЖАНИЕ**

1. [Общ преглед](#общ-преглед)
2. [Архитектура и йерархия](#архитектура-и-йерархия)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints) 
5. [Frontend компоненти](#frontend-компоненти)
6. [Бизнес логика](#бизнес-логика)
7. [Implementation Plan](#implementation-plan)
8. [Testing Strategy](#testing-strategy)
9. [Deployment Guide](#deployment-guide)

---

## 🎯 **ОБЩ ПРЕГЛЕД**

### Цел на модула
Модулът "Проекти" е централният компонент на PARKETSENSE ERP, който управлява целия жизнен цикъл на проектите - от създаване до изпращане на оферти.

### Ключови функционалности
- ✅ Създаване и управление на проекти
- ✅ Фази в проекта (етапи)
- ✅ Варианти във всяка фаза
- ✅ Стаи във всеки вариант
- ✅ Продукти в стаите
- ✅ Галерии със снимки
- ✅ Ценообразуване и отстъпки
- ✅ Архитект комисионни
- ✅ Генериране на оферти
- ✅ Email изпращане

### Технологичен стек
```typescript
// Backend
NestJS + Prisma + PostgreSQL
TypeScript + Express
Multer (file uploads)
Nodemailer (emails)

// Frontend  
Next.js + React + TypeScript
Tailwind CSS + Design System
Lucide React (icons)
React Hook Form (форми)
```

---

## 🏗️ **АРХИТЕКТУРА И ЙЕРАРХИЯ**

### Йерархия на данните
```
КЛИЕНТ
└── ПРОЕКТ (Къща Иванови)
    └── ФАЗА (Етаж 1 - Продажба)
        └── ВАРИАНТ (Рибена кост - Дъб натурал)
            └── СТАЯ (Дневна)
                └── ПРОДУКТ (Coswick паркет)
```

### Бизнес Flow
```mermaid
graph TD
    A[Създаване проект] --> B[Избор клиент]
    B --> C[Добавяне контакти]
    C --> D[Създаване фази]
    D --> E[Създаване варианти]
    E --> F[Добавяне стаи]
    F --> G[Добавяне продукти]
    G --> H[Качване снимки]
    H --> I[Настройка цени]
    I --> J[Подготовка оферта]
    J --> K[Изпращане email]
```

---

## 🗄️ **DATABASE SCHEMA**

### 1. Projects Table
```sql
-- projects.sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    
    -- Основна информация
    name VARCHAR(200) NOT NULL,
    project_type ENUM('apartment', 'house', 'office', 'commercial', 'other') NOT NULL,
    address TEXT,
    description TEXT,
    city VARCHAR(100) DEFAULT 'София',
    
    -- Характеристики
    total_area DECIMAL(10,2),
    rooms_count INTEGER,
    floors_count INTEGER,
    estimated_budget DECIMAL(12,2),
    
    -- Дати
    start_date DATE,
    expected_completion_date DATE,
    
    -- Архитект
    architect_type ENUM('none', 'client', 'external') DEFAULT 'none',
    architect_id UUID REFERENCES clients(id),
    architect_name VARCHAR(200),
    architect_commission DECIMAL(5,2) DEFAULT 0,
    architect_phone VARCHAR(20),
    architect_email VARCHAR(100),
    
    -- Статус
    status ENUM('draft', 'active', 'completed', 'archived') DEFAULT 'draft',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_projects_client_id (client_id),
    INDEX idx_projects_status (status),
    INDEX idx_projects_architect_id (architect_id)
);
```

### 2. Project Contacts Table
```sql
-- project_contacts.sql
CREATE TABLE project_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    role ENUM('owner', 'spouse', 'architect', 'accountant', 'builder', 'designer', 'other') DEFAULT 'other',
    
    -- Permissions
    receives_offers BOOLEAN DEFAULT false,
    receives_invoices BOOLEAN DEFAULT false,
    receives_updates BOOLEAN DEFAULT false,
    is_primary BOOLEAN DEFAULT false,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_project_contacts_project_id (project_id)
);
```

### 3. Project Phases Table
```sql
-- project_phases.sql
CREATE TABLE project_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    
    name VARCHAR(200) NOT NULL,
    description TEXT,
    phase_order INTEGER DEFAULT 1,
    
    -- Статус
    status ENUM('created', 'quoted', 'won', 'lost', 'archived') DEFAULT 'created',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_phases_project_id (project_id),
    INDEX idx_phases_status (status),
    UNIQUE KEY unique_phase_order (project_id, phase_order)
);
```

### 4. Phase Variants Table
```sql
-- phase_variants.sql
CREATE TABLE phase_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id UUID NOT NULL REFERENCES project_phases(id) ON DELETE CASCADE,
    
    name VARCHAR(200) NOT NULL,
    description TEXT,
    variant_order INTEGER DEFAULT 1,
    
    -- Персонал
    designer VARCHAR(200),
    architect VARCHAR(200),
    architect_commission DECIMAL(5,2) DEFAULT 0,
    
    -- Настройки
    include_in_offer BOOLEAN DEFAULT true,
    discount_enabled BOOLEAN DEFAULT true,
    variant_discount DECIMAL(5,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_variants_phase_id (phase_id),
    UNIQUE KEY unique_variant_order (phase_id, variant_order)
);
```

### 5. Variant Rooms Table
```sql
-- variant_rooms.sql
CREATE TABLE variant_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID NOT NULL REFERENCES phase_variants(id) ON DELETE CASCADE,
    
    name VARCHAR(200) NOT NULL,
    area DECIMAL(8,2),
    
    -- Ценови настройки
    discount DECIMAL(5,2) DEFAULT 0,
    discount_enabled BOOLEAN DEFAULT true,
    waste_percent DECIMAL(5,2) DEFAULT 10,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_rooms_variant_id (variant_id)
);
```

### 6. Room Products Table
```sql
-- room_products.sql
CREATE TABLE room_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES variant_rooms(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    
    -- Количества и цени
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    
    -- Отстъпки
    discount DECIMAL(5,2) DEFAULT 0,
    discount_enabled BOOLEAN DEFAULT true,
    
    -- Фира
    waste_percent DECIMAL(5,2) DEFAULT 10,
    
    -- Calculated fields
    final_price DECIMAL(10,2) GENERATED ALWAYS AS (
        unit_price * (1 - CASE WHEN discount_enabled THEN discount ELSE 0 END / 100)
    ) STORED,
    total_amount DECIMAL(12,2) GENERATED ALWAYS AS (
        quantity * unit_price * (1 - CASE WHEN discount_enabled THEN discount ELSE 0 END / 100)
    ) STORED,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_room_products_room_id (room_id),
    INDEX idx_room_products_product_id (product_id)
);
```

### 7. Room Images Table
```sql
-- room_images.sql
CREATE TABLE room_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES variant_rooms(id) ON DELETE CASCADE,
    
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255),
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    -- Image metadata
    width INTEGER,
    height INTEGER,
    caption TEXT,
    
    -- Timestamps
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_room_images_room_id (room_id)
);
```

### 8. Offers Table
```sql
-- offers.sql
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    phase_id UUID REFERENCES project_phases(id) ON DELETE SET NULL,
    
    -- Оферта детайли
    offer_number VARCHAR(50) UNIQUE NOT NULL,
    subject VARCHAR(500),
    valid_until DATE,
    
    -- Условия
    conditions TEXT[],
    
    -- Email темплейт
    email_subject VARCHAR(500),
    email_body TEXT,
    
    -- Статус
    status ENUM('draft', 'sent', 'viewed', 'accepted', 'rejected') DEFAULT 'draft',
    
    -- История на изпращане
    sent_count INTEGER DEFAULT 0,
    last_sent_at TIMESTAMP,
    last_sent_to VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_offers_project_id (project_id),
    INDEX idx_offers_phase_id (phase_id),
    INDEX idx_offers_status (status)
);
```

### 9. Offer History Table
```sql
-- offer_history.sql
CREATE TABLE offer_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    
    version INTEGER NOT NULL,
    action ENUM('created', 'sent', 'viewed', 'downloaded') NOT NULL,
    recipient_email VARCHAR(100),
    
    -- Snapshot данни
    snapshot_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_offer_history_offer_id (offer_id),
    INDEX idx_offer_history_action (action)
);
```

---

## 🔌 **API ENDPOINTS**

### Projects Endpoints
```typescript
// projects.controller.ts

// GET /api/projects - Списък проекти с пагинация
interface GetProjectsQuery {
  page?: number;
  limit?: number;
  search?: string;
  client_id?: string;
  status?: 'draft' | 'active' | 'completed' | 'archived';
}

interface GetProjectsResponse {
  data: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// POST /api/projects - Създаване на проект
interface CreateProjectDto {
  clientId: string;
  name: string;
  projectType: 'apartment' | 'house' | 'office' | 'commercial' | 'other';
  address?: string;
  description?: string;
  city?: string;
  totalArea?: number;
  roomsCount?: number;
  floorsCount?: number;
  estimatedBudget?: number;
  startDate?: string;
  expectedCompletionDate?: string;
  architectType: 'none' | 'client' | 'external';
  architectId?: string;
  architectName?: string;
  architectCommission?: number;
  architectPhone?: string;
  architectEmail?: string;
  contacts: CreateContactDto[];
}

interface CreateContactDto {
  name: string;
  phone?: string;
  email?: string;
  role: string;
  receivesOffers: boolean;
  receivesInvoices: boolean;
  receivesUpdates: boolean;
  isPrimary: boolean;
}

// GET /api/projects/:id - Детайли за проект
// PUT /api/projects/:id - Редактиране на проект  
// DELETE /api/projects/:id - Изтриване на проект
```

### Phases Endpoints
```typescript
// phases.controller.ts

// GET /api/projects/:projectId/phases - Фази в проект
// POST /api/projects/:projectId/phases - Създаване на фаза
interface CreatePhaseDto {
  name: string;
  description?: string;
  phaseOrder?: number;
}

// PUT /api/phases/:id - Редактиране на фаза
// DELETE /api/phases/:id - Изтриване на фаза
// POST /api/phases/:id/reorder - Преподреждане на фази
```

### Variants Endpoints
```typescript
// variants.controller.ts

// GET /api/phases/:phaseId/variants - Варианти във фаза
// POST /api/phases/:phaseId/variants - Създаване на вариант
interface CreateVariantDto {
  name: string;
  description?: string;
  designer?: string;
  architect?: string;
  architectCommission?: number;
  includeInOffer?: boolean;
  discountEnabled?: boolean;
  variantDiscount?: number;
}

// PUT /api/variants/:id - Редактиране на вариант
// DELETE /api/variants/:id - Изтриване на вариант
// POST /api/variants/:id/clone - Клониране на вариант
// POST /api/variants/:id/toggle-offer - Включване/изключване от оферта
```

### Rooms Endpoints
```typescript
// rooms.controller.ts

// GET /api/variants/:variantId/rooms - Стаи във вариант
// POST /api/variants/:variantId/rooms - Създаване на стая
interface CreateRoomDto {
  name: string;
  area?: number;
  discount?: number;
  discountEnabled?: boolean;
  wastePercent?: number;
}

// PUT /api/rooms/:id - Редактиране на стая
// DELETE /api/rooms/:id - Изтриване на стая
// POST /api/rooms/:id/clone - Клониране на стая

// GET /api/rooms/:id/products - Продукти в стая
// POST /api/rooms/:id/products - Добавяне на продукт
interface AddProductToRoomDto {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  discountEnabled?: boolean;
  wastePercent?: number;
}

// PUT /api/room-products/:id - Редактиране на продукт
// DELETE /api/room-products/:id - Премахване на продукт
```

### Images Endpoints
```typescript
// images.controller.ts

// POST /api/rooms/:id/images - Качване на снимки
// GET /api/rooms/:id/images - Списък снимки
// DELETE /api/images/:id - Изтриване на снимка
// GET /uploads/rooms/:filename - Serving на снимки
```

### Offers Endpoints
```typescript
// offers.controller.ts

// GET /api/projects/:projectId/offers - Оферти на проект
// POST /api/projects/:projectId/offers - Създаване на оферта
interface CreateOfferDto {
  phaseId?: string;
  subject: string;
  validUntil: string;
  conditions: string[];
  emailSubject: string;
  emailBody: string;
}

// GET /api/offers/:id - Детайли за оферта
// PUT /api/offers/:id - Редактиране на оферта
// POST /api/offers/:id/send - Изпращане на оферта
interface SendOfferDto {
  recipients: string[];
  subject?: string;
  body?: string;
}

// GET /api/offers/:id/history - История на оферта
// GET /api/offers/:id/preview - Преглед на оферта
// GET /api/offers/:id/pdf - Генериране на PDF
```

---

## 🎨 **UI/UX DESIGN SYSTEM & CSS**

### Цветова палитра
```css
/* Primary Colors */
:root {
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-400: #60a5fa;
  --primary-500: #3b82f6;  /* Main primary */
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;

  /* Success Colors */
  --success-50: #ecfdf5;
  --success-100: #d1fae5;
  --success-200: #a7f3d0;
  --success-300: #6ee7b7;
  --success-400: #34d399;
  --success-500: #10b981;
  --success-600: #059669;  /* Main success */
  --success-700: #047857;
  --success-800: #065f46;
  --success-900: #064e3b;

  /* Warning Colors */
  --warning-50: #fff7ed;
  --warning-100: #ffedd5;
  --warning-200: #fed7aa;
  --warning-300: #fdba74;
  --warning-400: #fb923c;
  --warning-500: #f97316;
  --warning-600: #ea580c;
  --warning-700: #c2410c;  /* Main warning */
  --warning-800: #9a3412;
  --warning-900: #7c2d12;

  /* Danger Colors */
  --danger-50: #fef2f2;
  --danger-100: #fee2e2;
  --danger-200: #fecaca;
  --danger-300: #fca5a5;
  --danger-400: #f87171;
  --danger-500: #ef4444;
  --danger-600: #dc2626;  /* Main danger */
  --danger-700: #b91c1c;
  --danger-800: #991b1b;
  --danger-900: #7f1d1d;

  /* Neutral Colors */
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
}
```

### Typography System
```css
/* Font System */
:root {
  --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}

/* Font Sizes */
.text-xs { font-size: 0.75rem; line-height: 1rem; }      /* 12px */
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }  /* 14px */
.text-base { font-size: 1rem; line-height: 1.5rem; }     /* 16px */
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }  /* 18px */
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }   /* 20px */
.text-2xl { font-size: 1.5rem; line-height: 2rem; }      /* 24px */
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; } /* 30px */

/* Font Weights */
.font-light { font-weight: 300; }
.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-semibold { font-weight: 600; }
.font-bold { font-weight: 700; }
.font-extrabold { font-weight: 800; }
```

### Spacing System
```css
/* Spacing Scale (Tailwind-compatible) */
.p-0 { padding: 0; }
.p-1 { padding: 0.25rem; }    /* 4px */
.p-2 { padding: 0.5rem; }     /* 8px */
.p-3 { padding: 0.75rem; }    /* 12px */
.p-4 { padding: 1rem; }       /* 16px */
.p-5 { padding: 1.25rem; }    /* 20px */
.p-6 { padding: 1.5rem; }     /* 24px */
.p-8 { padding: 2rem; }       /* 32px */
.p-10 { padding: 2.5rem; }    /* 40px */
.p-12 { padding: 3rem; }      /* 48px */

/* Margins follow same pattern with m- prefix */
/* Gaps follow same pattern with gap- prefix */
```

### Layout Components CSS

#### 1. Main Container
```css
.main-container {
  min-height: 100vh;
  background-color: var(--gray-50);
  font-family: var(--font-sans);
}

.content-area {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
}

@media (max-width: 768px) {
  .content-area {
    padding: 1rem;
  }
}
```

#### 2. Header Components
```css
.project-header {
  background: white;
  border-bottom: 1px solid var(--gray-200);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1.5rem;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray-500);
  margin-bottom: 0.5rem;
}

.breadcrumb a {
  color: var(--primary-600);
  text-decoration: none;
  font-weight: 500;
}

.breadcrumb a:hover {
  color: var(--primary-800);
  text-decoration: underline;
}

.project-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.project-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--gray-600);
}
```

#### 3. Card Components
```css
.card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid var(--gray-200);
  overflow: hidden;
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  border-color: var(--gray-300);
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0;
}

.card-description {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-top: 0.25rem;
}

.card-body {
  padding: 1.5rem;
}

.card-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--gray-200);
  background: var(--gray-50);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
```

### Button System
```css
/* Base Button */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.25rem;
  border-radius: 0.5rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* Button Sizes */
.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.btn-xl {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* Primary Button */
.btn-primary {
  background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
  color: white;
  border-color: var(--primary-600);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--primary-700), var(--primary-800));
  border-color: var(--primary-700);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
}

/* Success Button */
.btn-success {
  background: linear-gradient(135deg, var(--success-600), var(--success-700));
  color: white;
  border-color: var(--success-600);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.btn-success:hover {
  background: linear-gradient(135deg, var(--success-700), var(--success-800));
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

/* Secondary Button */
.btn-secondary {
  background: white;
  color: var(--gray-700);
  border-color: var(--gray-300);
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.btn-secondary:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
  color: var(--gray-900);
}

/* Outline Button */
.btn-outline {
  background: transparent;
  color: var(--primary-600);
  border-color: var(--primary-300);
}

.btn-outline:hover {
  background: var(--primary-50);
  border-color: var(--primary-400);
  color: var(--primary-700);
}

/* Danger Button */
.btn-danger {
  background: var(--danger-600);
  color: white;
  border-color: var(--danger-600);
}

.btn-danger:hover {
  background: var(--danger-700);
  border-color: var(--danger-700);
}

/* Icon Buttons */
.btn-icon {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  border-radius: 0.5rem;
}

.btn-icon-sm {
  width: 2rem;
  height: 2rem;
}

.btn-icon-lg {
  width: 3rem;
  height: 3rem;
}
```

### Form Components
```css
/* Form Groups */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

.form-label.required::after {
  content: " *";
  color: var(--danger-500);
}

/* Input Fields */
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  background: white;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error {
  border-color: var(--danger-500);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
}

.form-input:disabled {
  background: var(--gray-100);
  color: var(--gray-500);
  cursor: not-allowed;
}

/* Select Fields */
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  background: white url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iOCIgdmlld0JveD0iMCAwIDEyIDgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0xIDFMNiA2TDExIDEiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIxLjUiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K') no-repeat right 0.75rem center;
  background-size: 12px;
  appearance: none;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Textarea */
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 4rem;
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Checkbox & Radio */
.form-checkbox,
.form-radio {
  width: 1rem;
  height: 1rem;
  border: 1px solid var(--gray-300);
  background: white;
  cursor: pointer;
}

.form-checkbox {
  border-radius: 0.25rem;
}

.form-radio {
  border-radius: 50%;
}

.form-checkbox:checked,
.form-radio:checked {
  background: var(--primary-600);
  border-color: var(--primary-600);
}

/* Error Messages */
.form-error {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--danger-600);
}

.form-help {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--gray-500);
}
```

### Modal Components
```css
/* Modal Overlay */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: modalFadeIn 0.2s ease-out;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Modal Container */
.modal {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  animation: modalSlideIn 0.2s ease-out;
}

.modal-lg {
  max-width: 768px;
}

.modal-xl {
  max-width: 1024px;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Modal Header */
.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: between;
}

.modal-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-900);
  flex: 1;
}

.modal-close {
  width: 2rem;
  height: 2rem;
  border: none;
  background: none;
  color: var(--gray-400);
  cursor: pointer;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--gray-100);
  color: var(--gray-600);
}

/* Modal Body */
.modal-body {
  padding: 1.5rem;
  max-height: calc(90vh - 140px);
  overflow-y: auto;
}

/* Modal Footer */
.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--gray-200);
  background: var(--gray-50);
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
```

### Table Components
```css
/* Table Container */
.table-container {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid var(--gray-200);
  overflow: hidden;
}

/* Table */
.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
}

.table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table td {
  padding: 1rem;
  border-bottom: 1px solid var(--gray-200);
  font-size: 0.875rem;
  color: var(--gray-900);
}

.table tbody tr:hover {
  background: var(--gray-50);
}

.table tbody tr:last-child td {
  border-bottom: none;
}

/* Table Actions */
.table-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-action-btn {
  width: 2rem;
  height: 2rem;
  border: none;
  background: none;
  color: var(--gray-400);
  cursor: pointer;
  border-radius: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.table-action-btn:hover {
  background: var(--gray-100);
  color: var(--gray-600);
}

.table-action-btn.danger:hover {
  background: var(--danger-50);
  color: var(--danger-600);
}
```

### Status & Badge Components
```css
/* Status Badges */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge-sm {
  padding: 0.125rem 0.5rem;
  font-size: 0.625rem;
}

.badge-lg {
  padding: 0.375rem 1rem;
  font-size: 0.875rem;
}

/* Badge Variants */
.badge-success {
  background: var(--success-100);
  color: var(--success-800);
  border: 1px solid var(--success-200);
}

.badge-warning {
  background: var(--warning-100);
  color: var(--warning-800);
  border: 1px solid var(--warning-200);
}

.badge-danger {
  background: var(--danger-100);
  color: var(--danger-800);
  border: 1px solid var(--danger-200);
}

.badge-primary {
  background: var(--primary-100);
  color: var(--primary-800);
  border: 1px solid var(--primary-200);
}

.badge-gray {
  background: var(--gray-100);
  color: var(--gray-800);
  border: 1px solid var(--gray-200);
}

/* Badge with Icons */
.badge-icon {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.badge-icon svg {
  width: 0.75rem;
  height: 0.75rem;
}
```

### Statistics Cards
```css
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  border: 1px solid var(--gray-200);
}

.stat-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.stat-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon.primary {
  background: var(--primary-100);
  color: var(--primary-600);
}

.stat-icon.success {
  background: var(--success-100);
  color: var(--success-600);
}

.stat-icon.warning {
  background: var(--warning-100);
  color: var(--warning-600);
}

.stat-content h3 {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-500);
  margin: 0;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.stat-change {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.stat-change.positive {
  color: var(--success-600);
}

.stat-change.negative {
  color: var(--danger-600);
}
```

### Loading States
```css
/* Loading Spinner */
.loading-spinner {
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid var(--gray-200);
  border-top: 2px solid var(--primary-600);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner-sm {
  width: 1rem;
  height: 1rem;
  border-width: 1px;
}

.loading-spinner-lg {
  width: 2rem;
  height: 2rem;
  border-width: 3px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Loading Skeleton */
.skeleton {
  background: linear-gradient(90deg, var(--gray-200) 25%, var(--gray-100) 50%, var(--gray-200) 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 0.25rem;
}

.skeleton-text {
  height: 1rem;
  width: 100%;
}

.skeleton-text-sm {
  height: 0.75rem;
}

.skeleton-text-lg {
  height: 1.25rem;
}

.skeleton-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Loading States */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: var(--gray-600);
}

.loading-state p {
  font-size: 0.875rem;
  margin: 0;
}
```

### Responsive Design Breakpoints
```css
/* Mobile First Breakpoints */
@media (min-width: 640px) {
  /* Small screens and up */
  .sm\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sm\:flex-row { flex-direction: row; }
  .sm\:text-left { text-align: left; }
}

@media (min-width: 768px) {
  /* Medium screens and up */
  .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .md\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .md\:col-span-2 { grid-column: span 2 / span 2; }
}

@media (min-width: 1024px) {
  /* Large screens and up */
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .lg\:grid-cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }
  .lg\:col-span-2 { grid-column: span 2 / span 2; }
  .lg\:col-span-3 { grid-column: span 3 / span 3; }
}

@media (min-width: 1280px) {
  /* Extra large screens and up */
  .xl\:grid-cols-6 { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .xl\:max-w-7xl { max-width: 80rem; }
}

/* Mobile Responsive Adjustments */
@media (max-width: 767px) {
  .content-area {
    padding: 1rem;
  }
  
  .card-header,
  .card-body,
  .card-footer {
    padding: 1rem;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .modal {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
  }
  
  .table-container {
    overflow-x: auto;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}
```

### Animation & Transitions
```css
/* Standard Transitions */
.transition-all {
  transition: all 0.2s ease;
}

.transition-colors {
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}

.transition-transform {
  transition: transform 0.2s ease;
}

/* Hover Effects */
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.hover-scale:hover {
  transform: scale(1.05);
}

.hover-shadow:hover {
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}

/* Page Transitions */
.page-enter {
  opacity: 0;
  transform: translateY(10px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-exit {
  opacity: 1;
  transform: translateY(0);
}

.page-exit-active {
  opacity: 0;
  transform: translateY(-10px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* Focus States */
.focus-ring:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  border-color: var(--primary-500);
}

.focus-ring-danger:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
  border-color: var(--danger-500);
}
```

### Accessibility Features
```css
/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .btn-primary {
    background: var(--primary-700);
    border: 2px solid var(--primary-800);
  }
  
  .form-input {
    border-width: 2px;
  }
  
  .card {
    border-width: 2px;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  :root {
    --gray-50: #1f2937;
    --gray-100: #374151;
    --gray-200: #4b5563;
    --gray-300: #6b7280;
    --gray-900: #f9fafb;
  }
  
  .main-container {
    background-color: var(--gray-900);
    color: var(--gray-100);
  }
  
  .card {
    background: var(--gray-800);
    border-color: var(--gray-700);
  }
}
```

---

## ⚛️ **FRONTEND КОМПОНЕНТИ**

### Файлова структура
```
src/
├── components/
│   ├── ui/                          # Design System
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   ├── Input.tsx
│   │   ├── Table.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── Form.tsx
│   │
│   ├── projects/                    # Projects модул
│   │   ├── ProjectList.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── CreateProjectModal.tsx
│   │   ├── ProjectHeader.tsx
│   │   │
│   │   ├── phases/
│   │   │   ├── PhasesList.tsx
│   │   │   ├── PhaseCard.tsx
│   │   │   ├── CreatePhaseModal.tsx
│   │   │   └── PhaseStats.tsx
│   │   │
│   │   ├── variants/
│   │   │   ├── VariantsList.tsx
│   │   │   ├── VariantCard.tsx
│   │   │   ├── CreateVariantModal.tsx
│   │   │   ├── CloneVariantModal.tsx
│   │   │   └── VariantStats.tsx
│   │   │
│   │   ├── rooms/
│   │   │   ├── RoomsList.tsx
│   │   │   ├── RoomCard.tsx
│   │   │   ├── CreateRoomModal.tsx
│   │   │   ├── RoomProductTable.tsx
│   │   │   ├── AddProductModal.tsx
│   │   │   ├── RoomGallery.tsx
│   │   │   └── ImageUpload.tsx
│   │   │
│   │   └── offers/
│   │       ├── OfferPreparation.tsx
│   │       ├── OfferConditions.tsx
│   │       ├── EmailTemplate.tsx
│   │       ├── SendOfferModal.tsx
│   │       └── OfferHistory.tsx
│   │
│   └── shared/                      # Споделени компоненти
│       ├── SearchInput.tsx
│       ├── Pagination.tsx
│       ├── LoadingSpinner.tsx
│       ├── ErrorBoundary.tsx
│       └── ConfirmDialog.tsx
│
├── pages/                           # Страници
│   ├── projects/
│   │   ├── index.tsx               # Списък проекти
│   │   ├── create.tsx              # Създаване проект
│   │   ├── [id]/
│   │   │   ├── index.tsx           # Преглед проект
│   │   │   ├── phases/
│   │   │   │   ├── index.tsx       # Фази
│   │   │   │   └── [phaseId]/
│   │   │   │       ├── index.tsx   # Варианти
│   │   │   │       └── [variantId]/
│   │   │   │           ├── index.tsx    # Стаи
│   │   │   │           └── offer.tsx    # Оферта
│   │   │   └── settings.tsx        # Настройки проект
│   │   └── api/                    # API routes
│
├── services/                       # API услуги
│   ├── api.ts                      # Base API client
│   ├── projects.service.ts
│   ├── phases.service.ts
│   ├── variants.service.ts
│   ├── rooms.service.ts
│   └── offers.service.ts
│
├── types/                          # TypeScript типове
│   ├── projects.types.ts
│   ├── phases.types.ts
│   ├── variants.types.ts
│   ├── rooms.types.ts
│   └── offers.types.ts
│
└── utils/                          # Utility функции
    ├── calculations.ts
    ├── formatting.ts
    ├── validation.ts
    └── constants.ts
```

### Основни компоненти

#### 1. CreateProjectScreen (готов)
```typescript
// Вече имплементиран в create_project_screen.tsx
// Включва 3-стъпкова форма:
// 1. Основни данни + архитект
// 2. Контакти
// 3. Преглед
```

#### 2. ProjectPhasesScreen (готов)
```typescript
// Вече имплементиран в project_phases_screen.tsx
// Управление на фази с:
// - Статистики
// - Създаване фази
// - Статуси (created, quoted, won)
```

#### 3. PhaseVariantsScreen (готов) 
```typescript
// Вече имплементиран в phase_variants_screen.tsx
// Управление на варианти с:
// - Включване/изключване от оферта
// - Клониране между фази
// - Архитект комисионни
```

#### 4. VariantRoomsScreen (готов)
```typescript
// Вече имплементиран в variant_rooms_screen.tsx
// Управление на стаи с:
// - Продукти в стаи
// - Галерия снимки
// - Цени и отстъпки
// - Клониране стаи
```

#### 5. OfferConditionsEmailScreen (готов)
```typescript
// Вече имплементиран в offer_conditions_email_screen.tsx
// Подготовка оферта с:
// - Условия на офертата
// - Email темплейт
// - История изпращане
```

### TypeScript Types
```typescript
// types/projects.types.ts

export interface Project {
  id: string;
  clientId: string;
  name: string;
  projectType: 'apartment' | 'house' | 'office' | 'commercial' | 'other';
  address?: string;
  description?: string;
  city: string;
  totalArea?: number;
  roomsCount?: number;
  floorsCount?: number;
  estimatedBudget?: number;
  startDate?: string;
  expectedCompletionDate?: string;
  
  // Архитект
  architectType: 'none' | 'client' | 'external';
  architectId?: string;
  architectName?: string;
  architectCommission: number;
  architectPhone?: string;
  architectEmail?: string;
  
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  
  // Relations
  client?: Client;
  contacts?: ProjectContact[];
  phases?: ProjectPhase[];
}

export interface ProjectPhase {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  phaseOrder: number;
  status: 'created' | 'quoted' | 'won' | 'lost' | 'archived';
  createdAt: string;
  updatedAt: string;
  
  // Relations
  project?: Project;
  variants?: PhaseVariant[];
}

export interface PhaseVariant {
  id: string;
  phaseId: string;
  name: string;
  description?: string;
  variantOrder: number;
  designer?: string;
  architect?: string;
  architectCommission: number;
  includeInOffer: boolean;
  discountEnabled: boolean;
  variantDiscount: number;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  phase?: ProjectPhase;
  rooms?: VariantRoom[];
  
  // Calculated
  totalValue?: number;
  roomsCount?: number;
  galleryCount?: number;
}

export interface VariantRoom {
  id: string;
  variantId: string;
  name: string;
  area?: number;
  discount: number;
  discountEnabled: boolean;
  wastePercent: number;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  variant?: PhaseVariant;
  products?: RoomProduct[];
  images?: RoomImage[];
  
  // Calculated
  totalValue?: number;
}

export interface RoomProduct {
  id: string;
  roomId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  discountEnabled: boolean;
  wastePercent: number;
  finalPrice: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  room?: VariantRoom;
  product?: Product;
}
```

---

## 🧠 **БИЗНЕС ЛОГИКА**

### Ценообразуване Logic
```typescript
// utils/calculations.ts

export class PricingCalculator {
  
  // Изчисляване на крайна цена на продукт
  static calculateProductFinalPrice(
    unitPrice: number,
    discount: number,
    discountEnabled: boolean
  ): number {
    const effectiveDiscount = discountEnabled ? discount : 0;
    return unitPrice * (1 - effectiveDiscount / 100);
  }
  
  // Изчисляване на общо количество с фира
  static calculateQuantityWithWaste(
    baseQuantity: number,
    wastePercent: number
  ): number {
    return baseQuantity * (1 + wastePercent / 100);
  }
  
  // Изчисляване на обща сума на продукт
  static calculateProductTotal(
    quantity: number,
    unitPrice: number,
    discount: number,
    discountEnabled: boolean,
    wastePercent: number
  ): number {
    const quantityWithWaste = this.calculateQuantityWithWaste(quantity, wastePercent);
    const finalPrice = this.calculateProductFinalPrice(unitPrice, discount, discountEnabled);
    return quantityWithWaste * finalPrice;
  }
  
  // Изчисляване на обща сума на стая
  static calculateRoomTotal(products: RoomProduct[]): number {
    return products.reduce((sum, product) => sum + product.totalAmount, 0);
  }
  
  // Изчисляване на обща сума на вариант
  static calculateVariantTotal(rooms: VariantRoom[]): number {
    return rooms.reduce((sum, room) => {
      const roomTotal = this.calculateRoomTotal(room.products || []);
      return sum + roomTotal;
    }, 0);
  }
  
  // Изчисляване на архитект комисионна
  static calculateArchitectCommission(
    totalValue: number,
    commissionPercent: number
  ): number {
    return totalValue * commissionPercent / 100;
  }
  
  // Изчисляване на печалба
  static calculateProfit(
    totalValue: number,
    profitMargin: number = 35,
    architectCommission: number = 0
  ): number {
    const grossProfit = totalValue * profitMargin / 100;
    return grossProfit - architectCommission;
  }
}
```

### Валидации
```typescript
// utils/validation.ts

export const projectValidationRules = {
  name: {
    required: true,
    minLength: 3,
    maxLength: 200
  },
  clientId: {
    required: true,
    format: 'uuid'
  },
  projectType: {
    required: true,
    enum: ['apartment', 'house', 'office', 'commercial', 'other']
  },
  totalArea: {
    min: 0,
    max: 10000
  },
  roomsCount: {
    min: 1,
    max: 50
  },
  architectCommission: {
    min: 0,
    max: 50
  }
};

export const contactValidationRules = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 200
  },
  email: {
    format: 'email'
  },
  phone: {
    format: 'phone'
  }
};

export function validateProject(data: Partial<Project>): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!data.name?.trim()) {
    errors.name = 'Името е задължително';
  }
  
  if (!data.clientId) {
    errors.clientId = 'Клиентът е задължителен';
  }
  
  if (data.architectType === 'external' && !data.architectName?.trim()) {
    errors.architectName = 'Името на архитекта е задължително';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
```

### Email Templates
```typescript
// utils/email-templates.ts

export class EmailTemplates {
  
  static getOfferEmailTemplate(project: Project, offer: Offer): string {
    return `
Здравейте {{client.name}},

Радваме се да Ви изпратим нашата оферта за проект "${project.name}".

Офертата включва всички обсъдени продукти и услуги, с детайлни спецификации и цени.

Моля, за да разгледате офертата, последвайте този линк: {{offer.link}}

Офертата е валидна до {{offer.expiresDate}}.

За въпроси или допълнителна информация не се колебайте да се свържете с нас.

С уважение,
{{user.name}}
PARKETSENSE
Телефон: +359 2 123 4567
Email: office@parketsense.bg
    `.trim();
  }
  
  static getMergeFields(): MergeField[] {
    return [
      { key: '{{client.name}}', description: 'Име на клиента' },
      { key: '{{client.company}}', description: 'Фирма на клиента' },
      { key: '{{project.name}}', description: 'Име на проекта' },
      { key: '{{project.address}}', description: 'Адрес на проекта' },
      { key: '{{offer.link}}', description: 'Линк към офертата' },
      { key: '{{offer.expiresDate}}', description: 'Дата на валидност' },
      { key: '{{offer.total}}', description: 'Обща стойност' },
      { key: '{{user.name}}', description: 'Име на потребителя' },
      { key: '{{user.phone}}', description: 'Телефон на потребителя' },
      { key: '{{company.name}}', description: 'Име на фирмата' },
      { key: '{{company.phone}}', description: 'Телефон на фирмата' },
      { key: '{{company.email}}', description: 'Email на фирмата' }
    ];
  }
  
  static replaceMergeFields(
    template: string, 
    data: MergeData
  ): string {
    let result = template;
    
    // Replace client fields
    result = result.replace(/\{\{client\.name\}\}/g, data.client?.name || '');
    result = result.replace(/\{\{client\.company\}\}/g, data.client?.companyName || '');
    
    // Replace project fields
    result = result.replace(/\{\{project\.name\}\}/g, data.project?.name || '');
    result = result.replace(/\{\{project\.address\}\}/g, data.project?.address || '');
    
    // Replace offer fields
    result = result.replace(/\{\{offer\.link\}\}/g, data.offer?.link || '');
    result = result.replace(/\{\{offer\.expiresDate\}\}/g, data.offer?.validUntil || '');
    result = result.replace(/\{\{offer\.total\}\}/g, data.offer?.totalValue?.toLocaleString('bg-BG') || '0');
    
    // Replace user fields
    result = result.replace(/\{\{user\.name\}\}/g, data.user?.name || '');
    result = result.replace(/\{\{user\.phone\}\}/g, data.user?.phone || '');
    
    // Replace company fields
    result = result.replace(/\{\{company\.name\}\}/g, 'PARKETSENSE');
    result = result.replace(/\{\{company\.phone\}\}/g, '+359 2 123 4567');
    result = result.replace(/\{\{company\.email\}\}/g, 'office@parketsense.bg');
    
    return result;
  }
}
```

---

## 📋 **IMPLEMENTATION PLAN**

### Phase 1: Database & Backend (Седмица 1)
```bash
# 1.1 Database Setup
- [ ] Създаване на миграции за всички таблици
- [ ] Добавяне на индекси и constraints
- [ ] Създаване на seed данни
- [ ] Тестване на relations

# 1.2 Backend API
- [ ] Създаване на Prisma schema
- [ ] Имплементиране на Controllers
- [ ] Добавяне на DTOs и валидации
- [ ] Middleware за authentication
- [ ] Error handling
- [ ] Unit тестове за API
```

### Phase 2: Core Frontend (Седмица 2)
```bash
# 2.1 UI Components
- [ ] Адаптиране на Design System
- [ ] Създаване на основни компоненти
- [ ] Form компоненти с валидации
- [ ] Modal компоненти

# 2.2 Project Management
- [ ] Интеграция на CreateProjectScreen
- [ ] Списък проекти с филтри
- [ ] Детайли проект
- [ ] Редактиране проект
```

### Phase 3: Phases & Variants (Седмица 3)
```bash
# 3.1 Phases Management
- [ ] Интеграция на ProjectPhasesScreen
- [ ] API интеграция
- [ ] Статистики и метрики

# 3.2 Variants Management  
- [ ] Интеграция на PhaseVariantsScreen
- [ ] Клониране функционалност
- [ ] Архитект комисионни
```

### Phase 4: Rooms & Products (Седмица 4)
```bash
# 4.1 Rooms Management
- [ ] Интеграция на VariantRoomsScreen
- [ ] Продукти в стаи
- [ ] Ценови калкулации

# 4.2 Gallery System
- [ ] Image upload функционалност
- [ ] Gallery преглед
- [ ] Image optimization
```

### Phase 5: Offers & Email (Седмица 5)
```bash
# 5.1 Offer Generation
- [ ] Интеграция на OfferConditionsEmailScreen
- [ ] PDF генериране
- [ ] Email темплейти

# 5.2 Email System
- [ ] Nodemailer интеграция
- [ ] Email история
- [ ] Tracking на отворени emails
```

---

## 🧪 **TESTING STRATEGY**

### Backend Tests
```typescript
// tests/projects.controller.spec.ts

describe('ProjectsController', () => {
  let controller: ProjectsController;
  let service: ProjectsService;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        {
          provide: ProjectsService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();
    
    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });
  
  describe('create', () => {
    it('should create a project', async () => {
      const createDto: CreateProjectDto = {
        clientId: 'client-id',
        name: 'Test Project',
        projectType: 'apartment',
        architectType: 'none',
        contacts: []
      };
      
      const result = { id: 'project-id', ...createDto };
      jest.spyOn(service, 'create').mockResolvedValue(result);
      
      expect(await controller.create(createDto)).toBe(result);
    });
  });
  
  describe('findAll', () => {
    it('should return paginated projects', async () => {
      const query = { page: 1, limit: 10 };
      const result = {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      };
      
      jest.spyOn(service, 'findAll').mockResolvedValue(result);
      
      expect(await controller.findAll(query)).toBe(result);
    });
  });
});
```

### Frontend Tests
```typescript
// components/projects/__tests__/CreateProjectModal.test.tsx

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateProjectModal from '../CreateProjectModal';

describe('CreateProjectModal', () => {
  const mockOnClose = jest.fn();
  const mockOnCreate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders create project form', () => {
    render(
      <CreateProjectModal 
        isOpen={true} 
        onClose={mockOnClose}
        onCreate={mockOnCreate}
      />
    );
    
    expect(screen.getByText('Създаване на нов проект')).toBeInTheDocument();
    expect(screen.getByLabelText('Име на проект *')).toBeInTheDocument();
    expect(screen.getByLabelText('Тип проект *')).toBeInTheDocument();
  });
  
  it('validates required fields', async () => {
    render(
      <CreateProjectModal 
        isOpen={true} 
        onClose={mockOnClose}
        onCreate={mockOnCreate}
      />
    );
    
    const submitButton = screen.getByText('Създай проект');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Името е задължително')).toBeInTheDocument();
    });
  });
  
  it('calls onCreate when form is valid', async () => {
    render(
      <CreateProjectModal 
        isOpen={true} 
        onClose={mockOnClose}
        onCreate={mockOnCreate}
      />
    );
    
    const nameInput = screen.getByLabelText('Име на проект *');
    fireEvent.change(nameInput, { target: { value: 'Test Project' } });
    
    const submitButton = screen.getByText('Създай проект');
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Project'
        })
      );
    });
  });
});
```

### Тестови данни
```sql
-- database/seeds/test_projects.sql

-- Тестови проекти
INSERT INTO projects (id, client_id, name, project_type, address, city, total_area, architect_type, status) VALUES
('proj-1', 'client-1', 'Къща Иванови', 'house', 'ул. Витоша 123, София', 'София', 120.50, 'none', 'active'),
('proj-2', 'client-2', 'Офис ЕООД', 'office', 'бул. България 45, София', 'София', 85.00, 'external', 'draft'),
('proj-3', 'client-1', 'Апартамент Лозенец', 'apartment', 'ул. Княз Борис I 78', 'София', 65.25, 'client', 'active');

-- Тестови контакти
INSERT INTO project_contacts (id, project_id, name, phone, email, role, receives_offers, receives_invoices, is_primary) VALUES
('contact-1', 'proj-1', 'Иван Петров', '+359888123456', 'ivan@email.com', 'owner', true, true, true),
('contact-2', 'proj-1', 'Мария Петрова', '+359887654321', 'maria@email.com', 'spouse', true, false, false),
('contact-3', 'proj-2', 'Георги Стоянов', '+359888999888', 'g.stoyanov@company.bg', 'owner', true, true, true);

-- Тестови фази
INSERT INTO project_phases (id, project_id, name, description, phase_order, status) VALUES
('phase-1', 'proj-1', 'Етаж 1 - Продажба', 'Продукти за първи етаж', 1, 'created'),
('phase-2', 'proj-1', 'Етаж 1 - Монтаж', 'Монтажни услуги', 2, 'created'),
('phase-3', 'proj-1', 'Етаж 2', 'Втори етаж', 3, 'created');

-- Тестови варианти
INSERT INTO phase_variants (id, phase_id, name, description, variant_order, designer, include_in_offer) VALUES
('variant-1', 'phase-1', 'Рибена кост - Дъб натурал', 'Класически дъб', 1, 'Мария Петрова', true),
('variant-2', 'phase-1', 'Право редене - Орех', 'Американски орех', 2, 'Мария Петрова', true),
('variant-3', 'phase-1', 'Френски паркет - Ясен', 'Ясен във френски стил', 3, 'Елена Георгиева', false);
```

---

## 🚀 **DEPLOYMENT GUIDE**

### Environment Setup
```bash
# .env.production
DATABASE_URL="postgresql://username:password@localhost:5432/parketsense_prod"
JWT_SECRET="production-secret-key-change-this"
JWT_EXPIRY="7d"

# Email settings
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="office@parketsense.bg"
EMAIL_PASS="app-specific-password"

# File uploads
UPLOAD_PATH="/var/www/parketsense/uploads"
MAX_FILE_SIZE="10MB"
ALLOWED_FILE_TYPES="jpg,jpeg,png,pdf"

# PDF generation
PDF_ENGINE="puppeteer"
PDF_OPTIONS='{"format":"A4","margin":{"top":"20px","bottom":"20px"}}'

# Logging
LOG_LEVEL="info"
LOG_FILE="/var/log/parketsense/app.log"
```

### Database Migration
```bash
# Production migration script
#!/bin/bash

echo "Starting database migration..."

# Backup current database
pg_dump parketsense_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
npx prisma migrate deploy

# Seed production data if needed
psql parketsense_prod < database/seeds/production_data.sql

echo "Migration completed successfully!"
```

### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/parketsense
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=parketsense
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### Nginx Configuration
```nginx
# /etc/nginx/sites-available/parketsense
server {
    listen 80;
    server_name app.parketsense.bg;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.parketsense.bg;
    
    # SSL configuration
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    
    # Proxy to Node.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static files
    location /uploads/ {
        alias /var/www/parketsense/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # File upload size
    client_max_body_size 50M;
}
```

### Monitoring & Logging
```javascript
// config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'parketsense-erp' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

---

## ✅ **ГОТОВИ КОМПОНЕНТИ ЗА ИНТЕГРАЦИЯ**

### 1. CreateProjectScreen ✅
```typescript
// Локация: create_project_screen.tsx
// Статус: Готов за интеграция
// Нужни промени: 
// - Интеграция с real API
// - TypeScript типове
// - Error handling
```

### 2. ProjectPhasesScreen ✅
```typescript
// Локация: project_phases_screen.tsx  
// Статус: Готов за интеграция
// Нужни промени:
// - API интеграция
// - Real data loading
// - Navigation логика
```

### 3. PhaseVariantsScreen ✅
```typescript
// Локация: phase_variants_screen.tsx
// Статус: Готов за интеграция  
// Нужни промени:
// - Clone API интеграция
// - Real architect calculations
// - Offer включване/изключване
```

### 4. VariantRoomsScreen ✅
```typescript
// Локация: variant_rooms_screen.tsx
// Статус: Готов за интеграция
// Нужни промени:
// - Product API интеграция
// - Image upload API
// - Price calculations API
// - Clone room functionality
```

### 5. OfferConditionsEmailScreen ✅
```typescript
// Локация: offer_conditions_email_screen.tsx
// Статус: Готов за интеграция
// Нужни промени:
// - Email API интеграция
// - PDF generation
// - Merge fields система
// - Send history tracking
```

---

## 🎯 **КЛЮЧОВИ ОСОБЕНОСТИ ЗА CURSOR**

### 1. Консистентен Design System
```typescript
// Използвайте създадения design system за всички компоненти
import { Button, Modal, Input, Card } from '@/components/ui';

// Цветова схема
const colors = {
  primary: '#2563eb',
  success: '#059669', 
  warning: '#d97706',
  danger: '#dc2626'
};
```

### 2. TypeScript Strict Mode
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true
  }
}
```

### 3. Error Handling Pattern
```typescript
// Използвайте този pattern за всички API calls
const handleApiCall = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const result = await api.projects.create(data);
    setSuccess('Проектът е създаден успешно!');
    return result;
  } catch (error) {
    setError(error.message || 'Възникна грешка');
    console.error('API Error:', error);
  } finally {
    setLoading(false);
  }
};
```

### 4. Form Validation Pattern
```typescript
// Използвайте react-hook-form за всички форми
import { useForm } from 'react-hook-form';

const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
  watch,
  setValue
} = useForm<FormData>({
  mode: 'onChange',
  resolver: zodResolver(validationSchema)
});
```

### 5. Loading States
```typescript
// Всички компоненти трябва да имат loading states
{loading ? (
  <LoadingSpinner />
) : (
  <ComponentContent />
)}
```

---

## 📝 **ЗАКЛЮЧЕНИЕ**

Този документ предоставя пълна roadmap за имплементиране на модул "Проекти" в PARKETSENSE ERP. Всички ключови компоненти са готови и нуждаят от API интеграция и финализиране.

### Следващи стъпки за Cursor:
1. ✅ Създайте database schema според спецификацията
2. ✅ Имплементирайте API endpoints
3. ✅ Интегрирайте готовите frontend компоненти
4. ✅ Добавете error handling и loading states
5. ✅ Напишете тестове
6. ✅ Deployment на staging среда

### Времеви план: 5 седмици
- **Седмица 1:** Database & Backend API
- **Седмица 2:** Core Frontend интеграция  
- **Седмица 3:** Phases & Variants
- **Седмица 4:** Rooms & Products
- **Седмица 5:** Offers & Email система

**Документ подготвен за PARKETSENSE ERP v2.0**  
**Готов за изпълнение от Cursor AI Assistant**