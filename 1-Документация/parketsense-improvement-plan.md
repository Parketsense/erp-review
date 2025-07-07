# 🎯 PARKETSENSE ERP - ПЛАН ЗА ПОДОБРЕНИЯ
## Cursor Implementation Guide v1.0

#### 3.5 Typography Implementation
```css
/* apps/frontend/src/styles/typography.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap');

body {
  font-family: var(--font-family);
}

.display-sm {
  font-size: var(--display-sm-size);
  font-weight: var(--display-sm-weight);
  line-height: var(--display-sm-line);
  text-transform: capitalize; /* First letter of each word */
}

.heading {
  font-size: var(--heading-size);
  font-weight: var(--heading-weight);
  line-height: var(--heading-line);
  /* Sentence case - no transform needed */
}

.body {
  font-size: var(--body-size);
  font-weight: var(--body-weight);
  line-height: var(--body-line);
  /* Sentence case - no transform needed */
}

.caption {
  font-size: var(--caption-size);
  font-weight: var(--caption-weight);
  line-height: var(--caption-line);
  text-transform: uppercase; /* ALL CAPS */
}
```

#### 3.6 Component Implementation Examples

**Grid System Implementation**
```css
/* apps/frontend/src/styles/grid.css */
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--grid-gutter);
}

.grid {
  display: grid;
  grid-template-columns: repeat(var(--grid-columns), 1fr);
  gap: var(--grid-gutter);
}

.col-span-1 { grid-column: span 1; }
.col-span-2 { grid-column: span 2; }
.col-span-3 { grid-column: span 3; }
.col-span-4 { grid-column: span 4; }
.col-span-6 { grid-column: span 6; }
.col-span-12 { grid-column: span 12; }
```

**Icon Usage Example**
```typescript
// apps/frontend/src/components/ui/IconButton.tsx
import { LucideIcon } from 'lucide-react';

interface IconButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  size?: number;
}

export const IconButton: React.FC<IconButtonProps> = ({ 
  icon: Icon, 
  onClick,
  size = 20 
}) => {
  return (
    <button onClick={onClick} className="icon-button">
      <Icon 
        size={size} 
        strokeWidth={1.5} // ERP Design System standard
        color="currentColor"
      />
    </button>
  );
};
```

**Chip Component Implementation**
```typescript
// apps/frontend/src/components/ui/Chip/Chip.tsx
import React from 'react';
import { X } from 'lucide-react';
import { ChipProps } from './Chip.types';
import styles from './Chip.module.css';

export const Chip: React.FC<ChipProps> = ({
  variant = 'default',
  size = 'md',
  children,
  onRemove,
}) => {
  const variantStyles = {
    success: { backgroundColor: 'var(--color-success-light)', color: 'var(--color-neutral-700)' },
    warning: { backgroundColor: 'var(--color-warning-light)', color: 'var(--color-neutral-700)' },
    default: { backgroundColor: 'var(--color-bg)', color: 'var(--color-primary)' },
  };

  return (
    <span 
      className={`chip chip-${variant} chip-${size}`}
      style={variantStyles[variant]}
    >
      {children}
      {onRemove && (
        <button onClick={onRemove} className="chip-remove">
          <X size={14} />
        </button>
      )}
    </span>
  );
};
```

**StatusIndicator Component Implementation**
```typescript
// apps/frontend/src/components/ui/StatusIndicator/StatusIndicator.tsx
import React from 'react';
import { StatusIndicatorProps } from './StatusIndicator.types';

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status = 'active',
  size = 'sm',
  pulse = false,
}) => {
  const sizes = {
    sm: '8px',
    md: '12px',
  };

  const colors = {
    active: 'var(--color-info-indicator)',
    inactive: 'var(--color-neutral-500)',
    pending: 'var(--color-warning)',
  };

  return (
    <span
      className={`status-indicator ${pulse ? 'pulse' : ''}`}
      style={{
        width: sizes[size],
        height: sizes[size],
        backgroundColor: colors[status],
        borderRadius: '50%',
        display: 'inline-block',
      }}
    />
  );
};
```

### 🎯 ЗАДАЧА 5: Dashboard Header Redesign
**Приоритет:** ВИСОК | **Време:** 4-5 часа | **Сложност:** Средна

> **Note:** Имплементация на новия dashboard дизайн съгласно ERP Design System v1.0

#### 5.1 Нов Header Design
Имплементиране на професионален header базиран на ERP Design System v1.0:

> **Замества:** Лилавия градиент header с модерен черен дизайн и навигационни карти

**Header структура:**
```typescript
// apps/frontend/src/components/layout/Header.tsx
interface HeaderProps {
  user?: User;
  stats?: DashboardStats;
}

// Header с черен фон (#000000) и бял текст
// Включва: Logo + Brand name + Version badge
```

**Компоненти за създаване:**
```
apps/frontend/src/components/
├── layout/
│   ├── Header/
│   │   ├── Header.tsx
│   │   ├── Header.module.css
│   │   └── Header.types.ts
│   └── StatsCards/
│       ├── StatsCards.tsx
│       ├── StatCard.tsx
│       └── StatsCards.types.ts
└── dashboard/
    ├── NavigationGrid/
    │   ├── NavigationGrid.tsx
    │   ├── NavCard.tsx
    │   └── NavigationGrid.types.ts
    └── DashboardLayout.tsx
```

#### 5.1 Нов Header Design
Имплементиране на професионален header базиран на ERP Design System v1.0:

**Header структура:**
```typescript
// apps/frontend/src/components/layout/Header.tsx
interface HeaderProps {
  user?: User;
  stats?: DashboardStats;
}

// Header с черен фон (#000000) и бял текст
// Включва: Logo + Brand name + Version badge
```

**Компоненти за създаване:**
```
apps/frontend/src/components/
├── layout/
│   ├── Header/
│   │   ├── Header.tsx
│   │   ├── Header.module.css
│   │   └── Header.types.ts
│   └── StatsCards/
│       ├── StatsCards.tsx
│       ├── StatCard.tsx
│       └── StatsCards.types.ts
└── dashboard/
    ├── NavigationGrid/
    │   ├── NavigationGrid.tsx
    │   ├── NavCard.tsx
    │   └── NavigationGrid.types.ts
    └── DashboardLayout.tsx
```

#### 5.2 Stats Cards Implementation
```typescript
// Статистически карти с "издигнат" ефект от хедъра
interface StatCard {
  label: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'purple' | 'green' | 'orange';
}

// Позициониране: margin-top: -48px за overlap ефект
// Карти: бял фон, 12px radius, elevation-card shadow
// Grid: 4 колони desktop, 2 колони mobile
```

#### 5.3 Navigation Cards Grid
```typescript
// 8 навигационни карти за основните модули
interface NavCard {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string; // background color за иконата
}

const modules = [
  { title: 'Клиенти', icon: Users, color: '#E3F2FD' },
  { title: 'Архитекти', icon: Bookmark, color: '#F3E5F5' },
  { title: 'Проекти', icon: FileText, color: '#EDE7F6' },
  { title: 'Продукти', icon: Tag, color: '#E8F5E9' },
  { title: 'Оферти', icon: FileText, color: '#FFF3E0' },
  { title: 'Поръчки', icon: Package, color: '#FFEBEE' },
  { title: 'Фактури', icon: FileCode, color: '#E0F2F1' },
  { title: 'Анализи', icon: BarChart3, color: '#F3E5F5' }
];

// Всички икони са от lucide-react със strokeWidth={1.5}
```

#### 5.4 Layout Specifications
```css
/* Header */
- Height: auto (padding: 32px 0)
- Background: var(--color-primary) /* #000000 */
- Logo: 48x48px, white background, 8px radius
- Logo text: "PS" centered, 24px bold
- Title: 24px/600 (display-sm)
- Subtitle: 14px/400, opacity: 0.8
- Version badge: 12px uppercase, rgba(255,255,255,0.1) bg

/* Stats Cards */
- Card size: min-width 250px
- Icon container: 48x48px, colored background
- Value: 32px/600 font size
- Label: 12px uppercase
- Hover: translateY(-2px) + shadow increase

/* Navigation Cards */
- Min-width: 280px
- Padding: 32px
- Icon: 64x64px colored container, 32px icon
- Title: 18px/600
- Description: 14px/400
- Hover: lift effect + border color change
```

#### 5.5 Implementation Checklist
- [ ] Create Header component with black background
- [ ] Implement StatsCards with overlap effect
- [ ] Build NavigationGrid with 8 module cards
- [ ] Add hover animations (translateY)
- [ ] Implement responsive breakpoints
- [ ] Connect to real data from API
- [ ] Add loading states for stats
- [ ] Test on mobile devices
- [ ] Add keyboard navigation support
- [ ] Implement route highlighting

#### 3.1.3 Example: Safe Button Migration
```typescript
// BEFORE: Old button using --brand-primary
export const Button = ({ variant = 'primary', ...props }) => {
  return (
    <button 
      className={`parketsense-btn parketsense-btn-${variant}`}
      {...props}
    />
  );
};

// MIGRATION STEP 1: Add new classes without removing old
export const Button = ({ variant = 'primary', useNewDesign = false, ...props }) => {
  const baseClass = useNewDesign ? 'btn' : 'parketsense-btn';
  const variantClass = useNewDesign ? `btn-${variant}` : `parketsense-btn-${variant}`;
  
  return (
    <button 
      className={`${baseClass} ${variantClass}`}
      {...props}
    />
  );
};

// MIGRATION STEP 2: New CSS classes
.btn-primary {
  background-color: var(--color-primary); /* black */
  color: var(--color-on-primary);
  height: var(--size-btn); /* 40px */
  padding: 0 var(--space-btn-x);
  border-radius: var(--radius-btn);
}

// MIGRATION STEP 3: Test with useNewDesign={true}
<Button variant="primary" useNewDesign={true}>Test New Design</Button>

// MIGRATION STEP 4: After testing, make new design default
export const Button = ({ variant = 'primary', ...props }) => {
  return (
    <button 
      className={`btn btn-${variant}`}
      {...props}
    />
  );
};
```

## 🎨 DESIGN SYSTEM QUICK REFERENCE

| Елемент | Стойност | Старо | Ново | ⚠️ Конфликт |
|---------|----------|-------|------|-------------|
| **Primary Color** | #000000 | #2563eb (син) | #000000 (черен) | globals.css: --brand-primary |
| **Success Color** | #91C479 | #10b981 | #91C479 | - |
| **Button Height** | 40px | 36px | 40px | - |
| **Button Radius** | 8px | 6px | 8px | - |
| **Card Radius** | 12px | 8px | 12px | - |
| **Table Row** | 44px | 48px | 44px | - |
| **Font Family** | Inter | system-ui | Inter | - |
| **Theme Color** | #000000 | #2563eb | #000000 | layout.tsx meta tag |
| **Logo** | Solid | Gradient | Solid black | CSS gradient |
| **Nav Active** | Black | Blue | Black | .active class |
| **New Components** | - | - | Chip, StatusIndicator, Tabs | - |
| **Dashboard** | Gradient | Black header | Navigation cards | - |

### 🚨 MIGRATION WARNINGS:
1. **DO NOT** delete old CSS variables immediately
2. **DO NOT** use global find & replace for colors
3. **TEST** each component individually
4. **USE** migration phases approach

---

## 📊 ОБЩА ИНФОРМАЦИЯ

**Проект:** PARKETSENSE ERP v2.0  
**Технологии:** Next.js 15.3.4, NestJS, Prisma ORM, TypeScript  
**Design System:** ERP UI v1.0 (официални токени от реалния интерфейс)  
**Dashboard:** Professional Header Redesign включен  
**Цел:** Подобряване на performance, UX и добавяне на advanced features  
**Времева рамка:** 7-9 седмици (удължена с 1 седмица за Dashboard Redesign)  

---

## ✅ TRACKING CHECKLIST

### ФАЗА 1: Critical Improvements (1-2 седмици)
- [ ] State Management с Zustand
- [ ] React Query Integration  
- [ ] Design System Components
- [ ] Batch Operations API
- [ ] Dashboard Header Redesign (NEW)

### ФАЗА 2: Performance & UX (3-4 седмици)
- [ ] Database Query Optimization
- [ ] Virtual Scrolling
- [ ] Real-time Updates
- [ ] Progressive Form Enhancement

### ФАЗА 3: Advanced Features (1-2 месеца)
- [ ] Analytics Dashboard
- [ ] Mobile-Responsive Enhancements
- [ ] AI Integration (Optional)
- [ ] PWA Support (Optional)

---

## 📋 ФАЗА 1: CRITICAL IMPROVEMENTS

### 🎯 ЗАДАЧА 1: State Management с Zustand
**Приоритет:** ВИСОК | **Време:** 4-6 часа | **Сложност:** Средна

#### 1.1 Инсталация
```bash
cd apps/frontend
npm install zustand
npm install --save-dev @types/zustand
```

#### 1.2 Файлова структура
```
apps/frontend/src/
├── stores/
│   ├── projectStore.ts      # Главен store за проекти
│   ├── uiStore.ts          # UI state (modals, loading)
│   └── userStore.ts        # User session и preferences
└── hooks/
    ├── useProjectStore.ts  # Typed hook за project store
    └── useUIStore.ts       # Typed hook за UI store
```

#### 1.3 Project Store Implementation
```typescript
// apps/frontend/src/stores/projectStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProjectStore {
  // State
  projects: Project[];
  selectedProject: Project | null;
  phases: Phase[];
  variants: Variant[];
  rooms: Room[];
  loading: boolean;
  error: string | null;

  // Actions
  loadProject: (id: string) => Promise<void>;
  updateRoom: (roomId: string, data: Partial<Room>) => void;
  calculateProjectTotals: () => ProjectTotals;
  applyBulkDiscount: (roomIds: string[], discount: number) => void;
  cloneVariant: (variantId: string, targetPhaseId: string) => Promise<void>;
  
  // Computed values
  get totalProjectValue(): number;
  get roomsByVariant(): Map<string, Room[]>;
}
```

#### 1.4 Integration Checklist
- [ ] Създай projectStore.ts с пълен TypeScript interface
- [ ] Добави persist middleware за local storage
- [ ] Създай useProjectStore hook с proper typing
- [ ] Замени useState в следните компоненти:
  - [ ] ProjectsList.tsx
  - [ ] ProjectDetails.tsx  
  - [ ] PhasesManager.tsx
  - [ ] VariantsManager.tsx
  - [ ] RoomsManager.tsx
- [ ] Добави error handling в store actions
- [ ] Тествай с Chrome DevTools

---

### 🎯 ЗАДАЧА 2: React Query Integration
**Приоритет:** ВИСОК | **Време:** 3-4 часа | **Сложност:** Средна

#### 2.1 Инсталация и Setup
```bash
cd apps/frontend
npm install @tanstack/react-query
npm install --save-dev @tanstack/react-query-devtools
```

#### 2.2 Query Client Configuration
```typescript
// apps/frontend/src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

#### 2.3 Custom Hooks Structure
```
apps/frontend/src/hooks/queries/
├── useProjects.ts       # Projects CRUD
├── usePhases.ts        # Phases operations
├── useVariants.ts      # Variants with reordering
├── useRooms.ts         # Rooms with products
└── useProducts.ts      # Products search
```

#### 2.4 Implementation Example
```typescript
// apps/frontend/src/hooks/queries/useProjects.ts
export const useProjects = (filters?: ProjectFilters) => {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: () => projectsApi.getAll(filters),
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: projectsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['projects']);
      toast.success('Проектът е създаден успешно');
    },
    onError: (error) => {
      toast.error('Грешка при създаване на проект');
    },
  });
};
```

#### 2.5 Integration Checklist
- [ ] Wrap app в QueryClientProvider
- [ ] Add React Query DevTools in development
- [ ] Create custom hooks за всички API endpoints
- [ ] Implement optimistic updates за:
  - [ ] Room discount changes
  - [ ] Variant reordering
  - [ ] Product quantity updates
- [ ] Add loading states с Suspense boundaries
- [ ] Test offline behavior

---

### 🎯 ЗАДАЧА 3: Design System Components (ERP UI v1.0)
**Приоритет:** ВИСОК | **Време:** 6-8 часа | **Сложност:** Средна

> **Note:** Базирано на официалния ERP Design System документ с точни стойности от реалния интерфейс.

### ⚠️ КРИТИЧНО ПРЕДУПРЕЖДЕНИЕ: Цветова миграция
Cursor откри следните конфликти в текущия код:
- `globals.css`: `--brand-primary: #2563eb` (син)
- `layout.tsx`: `<meta name="theme-color" content="#2563eb">`
- Всички компоненти използват `var(--brand-primary)`

**СТРАТЕГИЯ ЗА БЕЗОПАСНА МИГРАЦИЯ:**
```css
/* apps/frontend/src/styles/design-tokens.css */
:root {
  /* ФАЗА 1: Запазваме стария primary за обратна съвместимост */
  --brand-primary: #2563eb; /* OLD - не махай! */
  --brand-primary-new: #000000; /* NEW - ERP Design System */
  
  /* ФАЗА 2: Постепенно преминаваме към новата система */
  --primary: var(--brand-primary-new);
  
  /* Останалите токени от ERP Design System */
  --color-primary: #000000;
  --color-on-primary: #FFFFFF;
  /* ... rest of tokens ... */
}
```

**Migration Checklist:**
- [ ] Създай нови CSS променливи БЕЗ да махаш старите
- [ ] Тествай всеки компонент поотделно
- [ ] Актуализирай meta theme-color в layout.tsx
- [ ] Мигрирай компонентите един по един
- [ ] След пълна миграция - премахни старите променливи

#### 3.1 Design Tokens Implementation
```css
/* apps/frontend/src/styles/design-tokens.css */

/* MIGRATION PHASE 1: Compatibility Mode */
:root {
  /* Keep old variables for backward compatibility */
  --brand-primary: #2563eb; /* OLD BLUE - DO NOT REMOVE YET */
  --brand-secondary: #64748b; /* OLD GRAY */
  
  /* New ERP Design System Colors */
  --color-primary: #000000;
  --color-on-primary: #FFFFFF;
  --color-bg: #F4F5F6;
  --color-surface: #FFFFFF;
  --color-border: #E0E0E0;
  --color-neutral-500: #A1A3A5;
  --color-neutral-700: #686869;
  --color-success: #91C479;
  --color-success-light: #C7F8D3;
  --color-warning-light: #FFE7C1;
  --color-danger: #FF4F4F;
  --color-info-indicator: #2ECC71;
  
  /* Typography - Inter font system */
  --font-family: "Inter", sans-serif;
  
  /* Font Sizes & Line Heights */
  --display-sm-size: 24px;
  --display-sm-line: 32px;
  --display-sm-weight: 600;
  
  --heading-size: 16px;
  --heading-line: 24px;
  --heading-weight: 600;
  
  --body-size: 14px;
  --body-line: 22px;
  --body-weight: 400;
  
  --caption-size: 12px;
  --caption-line: 16px;
  --caption-weight: 400;
  
  /* Spacing Scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  
  /* Component Tokens */
  --radius-btn: 8px;
  --radius-card: 12px;
  --radius-chip: 16px;
  --size-btn: 40px;
  --space-btn-x: 20px;
  --table-row-height: 44px;
  
  /* Elevation (Shadows) - 3 levels */
  --elevation-0: none;
  --elevation-1: 0 1px 2px rgba(0,0,0,0.05); /* Buttons, inputs */
  --elevation-2: 0 4px 8px rgba(0,0,0,0.08); /* Modals, dropdowns */
  --elevation-card: 0 1px 3px rgba(0,0,0,0.06); /* Cards specific */
  --shadow-btn: var(--elevation-1);
  
  /* Grid System */
  --grid-columns: 12;
  --grid-gutter: 24px;
  
  /* Icons */
  --icon-stroke: 1.5px; /* Feather/Lucide standard */
  
  /* States */
  --hover-overlay: rgba(255,255,255,0.08);
  --active-overlay: rgba(255,255,255,0.12);
  --disabled-opacity: 0.5;
}

/* MIGRATION PHASE 2: Component-specific overrides */
/* Use these classes to gradually migrate components */
.new-design-system {
  --primary: var(--color-primary);
  --on-primary: var(--color-on-primary);
  --success: var(--color-success);
  --danger: var(--color-danger);
}
```

#### 3.1.1 Components to Update
**Priority order за миграция:**
1. **Logo** - gradient от черен до сив може да изглежда странно
2. **Navigation active state** - черни активни линкове
3. **Primary buttons** - всички ще станат черни
4. **Theme color meta tag** - в layout.tsx
5. **All hardcoded #2563eb** - search & replace внимателно

#### 3.1.2 Safe Migration Steps
```typescript
// STEP 1: Update layout.tsx theme color
<meta name="theme-color" content="#000000" />

// STEP 2: Update Logo component
// От: background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))
// Към: background: var(--color-primary)

// STEP 3: Update navigation active states
// .parketsense-nav-item.active {
//   color: var(--color-primary);
//   border-color: var(--color-primary);
// }

// STEP 4: Update buttons gradually
// .parketsense-btn-primary {
//   background: var(--color-primary);
//   color: var(--color-on-primary);
// }
```
```

#### 3.2 Component Library Structure
```
apps/frontend/src/components/ui/
├── Button/
│   ├── Button.tsx
│   ├── Button.types.ts
│   ├── Button.module.css
│   └── Button.stories.tsx
├── Input/
├── Select/
├── Modal/
├── Card/
├── Table/
├── Badge/
├── Chip/           # NEW: За статуси и тагове
├── StatusIndicator/ # NEW: За малки индикатори
├── Tabs/           # NEW: За навигация между секции
└── Toast/
```

#### 3.3 Component Examples

**Button Component**
```typescript
// apps/frontend/src/components/ui/Button/Button.types.ts
export interface ButtonProps {
  variant?: 'primary' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

// Button specifications from ERP Design System:
// - Height: 40px (--size-btn)
// - Border radius: 8px (--radius-btn)
// - Padding X: 20px (--space-btn-x)
// - Font: 14px/400 Inter
```

**Chip Component**
```typescript
// apps/frontend/src/components/ui/Chip/Chip.types.ts
export interface ChipProps {
  variant?: 'success' | 'warning' | 'default';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  onRemove?: () => void;
}

// Chip specifications:
// - Border radius: 16px (pill shape)
// - Padding: 6px 12px
// - Font: 12px uppercase (caption style)
// - Colors: success-light (#C7F8D3), warning-light (#FFE7C1)
```

**StatusIndicator Component**
```typescript
// apps/frontend/src/components/ui/StatusIndicator/StatusIndicator.types.ts
export interface StatusIndicatorProps {
  status?: 'active' | 'inactive' | 'pending';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

// StatusIndicator specifications:
// - Size: 8px diameter (default)
// - Color: #2ECC71 (--color-info-indicator)
// - Shape: perfect circle
```

**Avatar Component**
```typescript
// Avatar specifications from ERP Design System:
// - Shape: perfect circle
// - Size: 24-32px diameter
// - Can contain initials or icons
```

**Card Component**
```typescript
// Card specifications from ERP Design System:
// - Border radius: 12px (--radius-card)
// - Border: 1px solid #E0E0E0
// - Shadow: 0 1px 3px rgba(0,0,0,0.06) (--elevation-card)
// - Padding: 24px internal
// - Background: white (--color-surface)
```

**Table Component**
```typescript
// Table specifications:
// - Header background: #F4F5F6 (--color-bg)
// - Row height: 44px (--table-row-height)
// - Border-bottom: 1px solid #E0E0E0
// - Font: 14px for body, 16px/600 for headers
```

#### 3.4 Implementation Checklist
- [ ] ⚠️ **ПЪРВО:** Прочети migration warnings и backup CSS файловете
- [ ] Create design tokens CSS с ДВЕТЕ системи (стара + нова)
- [ ] Import Inter font from Google Fonts
- [ ] Install Feather/Lucide icons: `npm install lucide-react`
- [ ] Update `layout.tsx` theme-color meta tag към #000000
- [ ] Fix Logo component - премахни gradient, използвай solid color
- [ ] Migrate navigation active states от --brand-primary към --color-primary
- [ ] Update primary buttons постепенно (тествай всеки)
- [ ] Search за hardcoded #2563eb и замени внимателно
- [ ] Setup 12-column grid system with 24px gutter
- [ ] Build base components:
  - [ ] Button (primary, success, danger, outline variants)
  - [ ] Input (with validation states)
  - [ ] Select (with search functionality)
  - [ ] Modal (with 12px radius, elevation-2)
  - [ ] Card (12px radius, 24px padding, elevation-card shadow)
  - [ ] Table (44px rows, #F4F5F6 header)
  - [ ] Badge (for counts and labels)
  - [ ] Chip (success/warning variants, pill shape)
  - [ ] StatusIndicator (8px circle, pulse animation)
  - [ ] Tabs (with underline indicator)
  - [ ] Toast (notification system)
  - [ ] Modal (12px radius, elevation-2 shadow for prominence)
- [ ] Implement typography classes:
  - [ ] .display-sm (24px/600, capitalize)
  - [ ] .heading (16px/600)
  - [ ] .body (14px/400)
  - [ ] .caption (12px/400, uppercase)
- [ ] Add interactive states:
  - [ ] Hover: 8% white overlay on colored surfaces
  - [ ] Active: 12% white overlay + translateY(1px)
  - [ ] Disabled: 50% opacity + cursor not-allowed
  - [ ] Focus: proper focus rings for accessibility
- [ ] Create Storybook stories for all components
- [ ] Replace all inline styles in existing code
- [ ] Test with Feather/Lucide icons (1.5px stroke weight)
- [ ] Configure icons to inherit currentColor
- [ ] Validate color contrast for accessibility
- [ ] Test grid system responsiveness (12 columns)

---

### 🎯 ЗАДАЧА 4: Batch Operations API
**Приоритет:** ВИСОК | **Време:** 4-5 часа | **Сложност:** Висока

#### 4.1 Backend API Endpoints
```typescript
// New endpoints to add:
POST   /api/rooms/bulk-update
POST   /api/rooms/bulk-delete  
POST   /api/variants/bulk-clone
POST   /api/projects/:id/apply-discount
PATCH  /api/phases/:id/bulk-update-variants
```

#### 4.2 DTOs Creation
```typescript
// apps/backend/src/modules/rooms/dto/bulk-update-rooms.dto.ts
export class BulkUpdateRoomsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  roomIds: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  discount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  waste?: number;

  @IsOptional()
  @IsBoolean()
  discountEnabled?: boolean;
}
```

#### 4.3 Service Implementation
```typescript
// apps/backend/src/modules/rooms/rooms.service.ts
async bulkUpdateRooms(dto: BulkUpdateRoomsDto): Promise<BulkOperationResult> {
  const results = await this.prisma.$transaction(async (tx) => {
    const updates = dto.roomIds.map(id =>
      tx.variantRoom.update({
        where: { id },
        data: {
          ...(dto.discount !== undefined && { discount: dto.discount }),
          ...(dto.waste !== undefined && { waste: dto.waste }),
          ...(dto.discountEnabled !== undefined && { discountEnabled: dto.discountEnabled }),
        },
      })
    );
    
    return Promise.all(updates);
  });

  return {
    success: true,
    updated: results.length,
    ids: dto.roomIds,
  };
}
```

#### 4.4 Frontend Integration
```typescript
// apps/frontend/src/services/batchOperations.ts
export const batchOperations = {
  async updateRoomDiscounts(roomIds: string[], discount: number) {
    const response = await fetch('/api/rooms/bulk-update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomIds, discount }),
    });
    return response.json();
  },
  
  // Add progress tracking with EventSource
  trackBulkOperation(operationId: string) {
    const eventSource = new EventSource(`/api/operations/${operationId}/progress`);
    return eventSource;
  },
};
```

#### 4.5 Implementation Checklist
- [ ] Create DTOs with validation
- [ ] Add transaction support
- [ ] Implement progress tracking
- [ ] Add error handling
- [ ] Create unit tests
- [ ] Add rate limiting
- [ ] Document API endpoints
- [ ] Test with large datasets

---

## 📋 ФАЗА 2: PERFORMANCE & UX IMPROVEMENTS

### 🎯 ЗАДАЧА 6: Database Query Optimization
**Приоритет:** СРЕДЕН | **Време:** 3-4 часа | **Сложност:** Висока

#### 5.1 Identify N+1 Queries
```typescript
// ❌ BAD: N+1 query problem
const project = await prisma.project.findUnique({
  where: { id },
  include: {
    phases: {
      include: {
        variants: {
          include: {
            rooms: {
              include: {
                products: {
                  include: {
                    product: true // This creates N+1
                  }
                }
              }
            }
          }
        }
      }
    }
  }
});

// ✅ GOOD: Optimized queries
const [project, products] = await Promise.all([
  prisma.project.findUnique({ where: { id } }),
  prisma.product.findMany({
    where: {
      roomProducts: {
        some: {
          room: {
            variant: {
              phase: { projectId: id }
            }
          }
        }
      }
    }
  })
]);
```

#### 5.2 Add Database Indexes
```sql
-- apps/backend/prisma/migrations/add_performance_indexes.sql
CREATE INDEX idx_project_phases_project_id ON project_phases(project_id);
CREATE INDEX idx_phase_variants_phase_id ON phase_variants(phase_id);
CREATE INDEX idx_variant_rooms_variant_id ON variant_rooms(variant_id);
CREATE INDEX idx_room_products_room_id ON room_products(room_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
```

#### 5.3 Implementation Checklist
- [ ] Run query analysis with EXPLAIN
- [ ] Identify slow queries in logs
- [ ] Add missing indexes
- [ ] Implement query result caching
- [ ] Use select instead of include where possible
- [ ] Add query performance monitoring
- [ ] Test with 1000+ records
- [ ] Document optimization decisions

---

### 🎯 ЗАДАЧА 6: Virtual Scrolling Implementation
**Приоритет:** СРЕДЕН | **Време:** 2-3 часа | **Сложност:** Средна

#### 6.1 Installation
```bash
cd apps/frontend
npm install @tanstack/react-virtual
```

#### 7.1 Installation
```bash
cd apps/frontend
npm install @tanstack/react-virtual
```

#### 7.2 Implementation Example
```typescript
// apps/frontend/src/components/products/VirtualProductList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export const VirtualProductList: React.FC<{ products: Product[] }> = ({ products }) => {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Estimated row height
    overscan: 5, // Render 5 items outside visible area
  });

  return (
    <div ref={parentRef} className="h-[600px] overflow-auto">
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ProductRow product={products[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### 7.3 Implementation Checklist
- [ ] Identify lists with >50 items
- [ ] Implement virtual scrolling for:
  - [ ] Products list
  - [ ] Projects list
  - [ ] Room products list
  - [ ] Search results
- [ ] Add loading placeholders
- [ ] Preserve scroll position on navigation
- [ ] Test performance improvements
- [ ] Add scroll-to-top button

---

### 🎯 ЗАДАЧА 8: Real-time Updates с Socket.io
**Приоритет:** СРЕДЕН | **Време:** 6-8 часа | **Сложност:** Висока

#### 8.1 Backend Setup
```bash
cd apps/backend
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

#### 8.1 Backend Setup
```bash
cd apps/backend
npm install @nestjs/websockets @nestjs/platform-socket.io socket.io
```

#### 8.2 Gateway Implementation
```typescript
// apps/backend/src/modules/projects/projects.gateway.ts
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },
})
export class ProjectsGateway {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('project.join')
  handleJoinProject(client: Socket, projectId: string) {
    client.join(`project:${projectId}`);
    return { event: 'joined', data: projectId };
  }

  @SubscribeMessage('room.update')
  handleRoomUpdate(client: Socket, payload: UpdateRoomDto) {
    // Broadcast to all clients in the project room
    client.to(`project:${payload.projectId}`).emit('room.updated', payload);
    return { event: 'update.success', data: payload };
  }

  // Emit from service
  emitProjectUpdate(projectId: string, data: any) {
    this.server.to(`project:${projectId}`).emit('project.updated', data);
  }
}
```

#### 8.3 Frontend Integration
```typescript
// apps/frontend/src/services/socketService.ts
import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  
  connect(token: string) {
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }

  joinProject(projectId: string) {
    this.socket?.emit('project.join', projectId);
  }

  onRoomUpdate(callback: (data: any) => void) {
    this.socket?.on('room.updated', callback);
  }

  updateRoom(data: UpdateRoomDto) {
    this.socket?.emit('room.update', data);
  }
}

export const socketService = new SocketService();
```

#### 8.4 Implementation Checklist
- [ ] Setup Socket.io в NestJS
- [ ] Create gateway за projects
- [ ] Add authentication middleware
- [ ] Implement event types:
  - [ ] Project updates
  - [ ] Room price changes
  - [ ] Variant reordering
  - [ ] User presence
- [ ] Frontend socket service
- [ ] Auto-reconnect logic
- [ ] Connection status indicator
- [ ] Test with multiple users

---

### 🎯 ЗАДАЧА 9: Progressive Form Enhancement
**Приоритет:** СРЕДЕН | **Време:** 4-5 часа | **Сложност:** Средна

#### 9.1 Form Wizard Structure
```typescript
// apps/frontend/src/components/projects/wizard/ProjectWizard.tsx
interface WizardStep {
  id: string;
  title: string;
  component: React.ComponentType<StepProps>;
  validation: yup.Schema;
  isOptional?: boolean;
  condition?: (data: FormData) => boolean;
}

const projectWizardSteps: WizardStep[] = [
  {
    id: 'client',
    title: 'Избор на клиент',
    component: ClientSelectionStep,
    validation: clientSchema,
  },
  {
    id: 'details',
    title: 'Детайли на проекта',
    component: ProjectDetailsStep,
    validation: detailsSchema,
  },
  {
    id: 'architect',
    title: 'Архитект',
    component: ArchitectStep,
    validation: architectSchema,
    condition: (data) => data.hasArchitect,
  },
  {
    id: 'contacts',
    title: 'Контакти',
    component: ContactsStep,
    validation: contactsSchema,
    isOptional: true,
  },
];
```

#### 9.2 Auto-save Implementation
```typescript
// apps/frontend/src/hooks/useAutoSave.ts
export const useAutoSave = (data: any, saveFunction: (data: any) => Promise<void>) => {
  const [saving, setSaving] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await saveFunction(data);
        toast.success('Автоматично запазено', { duration: 1000 });
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setSaving(false);
      }
    }, 2000); // 2 seconds debounce

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, saveFunction]);

  return { saving };
};
```

#### 9.3 Implementation Checklist
- [ ] Create wizard component structure
- [ ] Add step validation
- [ ] Implement conditional fields
- [ ] Add progress indicator
- [ ] Auto-save functionality
- [ ] Field dependencies logic
- [ ] Smooth animations between steps
- [ ] Keyboard navigation (Tab, Enter)
- [ ] Mobile swipe support
- [ ] Error recovery mechanism

---

## 📋 ФАЗА 3: ADVANCED FEATURES

### 🎯 ЗАДАЧА 10: Analytics Dashboard
**Приоритет:** НИСЪК | **Време:** 8-10 часа | **Сложност:** Висока

#### 10.1 Backend Analytics Service
```typescript
// apps/backend/src/modules/analytics/analytics.service.ts
@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getProjectProfitability(startDate: Date, endDate: Date) {
    const projects = await this.prisma.project.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        phases: {
          include: {
            variants: {
              include: {
                rooms: {
                  include: {
                    products: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return projects.map(project => ({
      id: project.id,
      name: project.name,
      revenue: this.calculateRevenue(project),
      costs: this.calculateCosts(project),
      profit: this.calculateProfit(project),
      margin: this.calculateMargin(project),
    }));
  }

  async getTopClients(limit: number = 10) {
    // Implementation
  }

  async getProductPerformance(productId: string) {
    // Implementation
  }
}
```

#### 10.2 Frontend Charts
```bash
cd apps/frontend
npm install recharts date-fns
```

```typescript
// apps/frontend/src/components/analytics/ProfitChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export const ProfitChart: React.FC<{ data: ProfitData[] }> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <h3>Рентабилност по проекти</h3>
      </CardHeader>
      <CardBody>
        <LineChart width={800} height={400} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip formatter={(value) => `${value} лв`} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="#10b981" 
            name="Приходи" 
          />
          <Line 
            type="monotone" 
            dataKey="profit" 
            stroke="#3b82f6" 
            name="Печалба" 
          />
        </LineChart>
      </CardBody>
    </Card>
  );
};
```

#### 10.3 Implementation Checklist
- [ ] Create analytics module structure
- [ ] Backend endpoints:
  - [ ] Project profitability
  - [ ] Client rankings
  - [ ] Product performance
  - [ ] Architect commissions
  - [ ] Monthly trends
- [ ] Frontend dashboard page
- [ ] Chart components:
  - [ ] Line charts for trends
  - [ ] Bar charts for comparisons
  - [ ] Pie charts for distribution
  - [ ] KPI cards
- [ ] Date range picker
- [ ] Export functionality (PDF/Excel)
- [ ] Real-time updates
- [ ] Performance optimization

---

### 🎯 ЗАДАЧА 11: Mobile-Responsive Enhancements
**Приоритет:** НИСЪК | **Време:** 6-8 часа | **Сложност:** Средна

#### 11.1 Breakpoint Hook
```typescript
// apps/frontend/src/hooks/useBreakpoint.ts
export const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setBreakpoint('mobile');
      } else if (window.innerWidth < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
  };
};
```

#### 11.2 Responsive Table Component
```typescript
// apps/frontend/src/components/common/ResponsiveTable.tsx
export const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ 
  columns, 
  data,
  mobileCard 
}) => {
  const { isMobile } = useBreakpoint();

  if (isMobile && mobileCard) {
    return (
      <div className="space-y-4">
        {data.map((item, index) => (
          <Card key={index}>
            {mobileCard(item)}
          </Card>
        ))}
      </div>
    );
  }

  return (
    <table className="min-w-full">
      {/* Regular table for desktop */}
    </table>
  );
};
```

#### 11.3 Touch Gestures
```typescript
// apps/frontend/src/hooks/useSwipe.ts
export const useSwipe = (onSwipeLeft?: () => void, onSwipeRight?: () => void) => {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number } | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    touchEnd.current = null;
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const onTouchMove = (e: TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;

    const distanceX = touchStart.current.x - touchEnd.current.x;
    const distanceY = touchStart.current.y - touchEnd.current.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;

    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      if (isLeftSwipe && onSwipeLeft) {
        onSwipeLeft();
      }
      if (isRightSwipe && onSwipeRight) {
        onSwipeRight();
      }
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
};
```

#### 11.4 Implementation Checklist
- [ ] Create breakpoint detection hook
- [ ] Mobile navigation menu
- [ ] Responsive tables → cards
- [ ] Touch-optimized buttons (min 44px)
- [ ] Swipe gestures for:
  - [ ] Navigation
  - [ ] Delete actions
  - [ ] Tab switching
- [ ] Pull-to-refresh
- [ ] Offline mode indicator
- [ ] Mobile-specific layouts
- [ ] Test on real devices
- [ ] Performance on slow networks

---

## 🛠️ GENERAL IMPLEMENTATION GUIDELINES

### ⚠️ ВАЖНО: Design System Migration Strategy
```
ПРОБЛЕМ: Текущата система използва син primary (#2563eb)
РЕШЕНИЕ: Постепенна миграция към черен primary (#000000)

СТЪПКИ:
1. НЕ МАХАЙ старите CSS променливи веднага
2. Добави новите паралелно със старите
3. Тествай всеки компонент поотделно
4. Използвай .new-design-system клас за testing
5. След пълна миграция - cleanup на старите променливи
```

### ⚠️ ВАЖНО: Design System Специфики
```
Primary цвят: #000000 (ЧЕРЕН, не син!)
Success цвят: #91C479 (светло зелен)
Danger цвят: #FF4F4F (червен)
Font: Inter (не system-ui)
Button height: 40px (не 36px)
Table row height: 44px (не 48px)
Card radius: 12px (не 8px)
```

### Code Quality Standards
```typescript
// ✅ GOOD: Clear, typed, documented
/**
 * Calculate total price for a room including discounts and waste
 * @param room - Room data with products
 * @returns Total price in BGN
 */
export const calculateRoomTotal = (room: Room): number => {
  return room.products.reduce((total, product) => {
    const quantity = product.quantity * (1 + room.waste / 100);
    const discount = product.discountEnabled ? product.discount : 0;
    const price = product.unitPrice * (1 - discount / 100);
    return total + (quantity * price);
  }, 0);
};

// ❌ BAD: No types, no comments, unclear
export const calc = (r) => {
  return r.p.reduce((t, p) => t + p.q * p.pr, 0);
};
```

### Error Handling Pattern
```typescript
// Consistent error handling across the app
try {
  setLoading(true);
  const result = await apiCall();
  // Handle success
} catch (error) {
  console.error(`[${MODULE_NAME}] Operation failed:`, error);
  
  if (error instanceof ValidationError) {
    toast.error('Моля проверете въведените данни');
  } else if (error instanceof NetworkError) {
    toast.error('Няма връзка със сървъра');
  } else {
    toast.error('Възникна неочаквана грешка');
  }
} finally {
  setLoading(false);
}
```

### Testing Approach
```typescript
// For each new feature, test:
describe('FeatureName', () => {
  it('works with empty data', () => {});
  it('works with large datasets (1000+ items)', () => {});
  it('handles network errors gracefully', () => {});
  it('preserves state on page refresh', () => {});
  it('is accessible with keyboard navigation', () => {});
  it('works on mobile devices', () => {});
});
```

---

## 📊 SUCCESS METRICS & VALIDATION

### Performance Benchmarks
- [ ] Page load time < 2 seconds
- [ ] API response time < 500ms
- [ ] Time to interactive < 3 seconds
- [ ] Lighthouse score > 90
- [ ] Dashboard stats refresh < 1 second

### User Experience Metrics
- [ ] Clicks reduced by 30% for common tasks
- [ ] Form completion time reduced by 25%
- [ ] Error rate < 1%
- [ ] User satisfaction score > 4.5/5
- [ ] Dashboard navigation time < 2 clicks to any module

### Code Quality Metrics
- [ ] TypeScript coverage > 95%
- [ ] Test coverage > 80%
- [ ] ESLint warnings = 0
- [ ] Bundle size < 500KB

---

## 🚀 DEPLOYMENT CHECKLIST

Before deploying improvements:
- [ ] All tests passing
- [ ] Performance benchmarks met
- [ ] Security audit completed
- [ ] Database migrations tested
- [ ] Rollback plan prepared
- [ ] Monitoring configured
- [ ] Documentation updated

---

## 📝 NOTES FOR CURSOR

1. **Always backup before major changes**
2. **Test incrementally - small changes, frequent tests**
3. **Follow existing code patterns**
4. **Add TypeScript types for everything**
5. **Write meaningful commit messages**
6. **Document complex business logic**
7. **Consider mobile users**
8. **Think about edge cases**

---

**Document Version:** 1.3  
**Last Updated:** 2025-01-22  
**Design System:** ERP UI v1.0 (с migration strategy)  
**Dashboard:** New Header Design Added  
**Critical Update:** Safe color migration strategy added  
**Next Review:** After Phase 1 completion