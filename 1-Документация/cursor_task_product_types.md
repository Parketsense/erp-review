# 🏗️ CURSOR ЗАДАЧА: Database-First Development за PARKETSENSE ERP

**Файл за референция:** `apps/frontend/docs/cursor-tasks/TASK-database-first-approach.md`  
**Статус:** КРИТИЧНО - нов structured подход  
**Estimated time:** 3-4 дни  
**Последно актуализирано:** 27.06.2025

---

## 🎯 **НОВА СТРАТЕГИЯ: BOTTOM-UP DEVELOPMENT**

### **Проблем с текущия подход:**
- Cursor се объркваше от едновременни промени в database, API и frontend
- Mock данни не съответстват на database constraints
- Unique constraint грешки поради несинхронизирани слоеве
- Твърде много променливи наведнъж

### **Решение: Database-First архитектура:**
```
СТАБИЛНА БАЗА ДАННИ → TESTED API → FRONTEND ИНТЕГРАЦИЯ → UI POLISH
       ↓                    ↓              ↓              ↓
   Няма промени         Няма промени    Няма промени    Само UI
```

### **Ключови принципи:**
1. **Database-first:** Изгради пълната схема с данни първо
2. **No moving targets:** Веднъж готова, базата данни НЕ СЕ ПРОМЕНЯ
3. **One layer at a time:** Фокус върху един слой наведнъж
4. **Test everything:** Всяка фаза е напълно тествана преди следващата

---

## 📋 **ФАЗА 1: СТАБИЛНА DATABASE FOUNDATION (Ден 1-2)**

### **ЗАДАЧА 1A: Complete Database Schema**

**ЦЕЛ:** Изгради финалната database схема с всички данни

#### **1A.1 ProductTypes - Пълни данни:**
```sql
INSERT INTO ProductType (id, name, nameEn, icon, displayOrder, isActive) VALUES:
('pt_parquet', 'Паркет', 'Parquet', '🏠', 1, true),
('pt_doors', 'Врати', 'Doors', '🚪', 2, true),
('pt_furniture', 'Мебели', 'Furniture', '🪑', 3, true),
('pt_wall_coverings', 'Стенни облицовки', 'Wall Coverings', '🧱', 4, true),
('pt_installation_services', 'Услуги за монтаж', 'Installation Services', '🔧', 5, true),
('pt_installation_materials', 'Материали за монтаж', 'Installation Materials', '🛠️', 6, true),
('pt_decking_siding', 'Декинг и сайдинг', 'Decking & Siding', '🏡', 7, true);
```

#### **1A.2 Manufacturers - Реални данни:**
```sql
INSERT INTO Manufacturer (id, name, website, isActive) VALUES:
-- Паркет производители
('mf_foglie_doro', 'Foglie d''Oro', 'https://fogliedor.it', true),
('mf_salis', 'Salis', 'https://salis.it', true), 
('mf_weitzer', 'Weitzer', 'https://weitzer.com', true),
('mf_friulparchet', 'Friulparchet', 'https://friulparchet.it', true),
('mf_berti', 'Berti', 'https://berti.net', true),
-- Врати
('mf_bluinterni', 'Bluinterni', 'https://bluinterni.it', true),
-- Мебели
('mf_arte_brotto', 'Arte Brotto', 'https://artebrotto.it', true),
('mf_sicis', 'Sicis', 'https://sicis.com', true),
('mf_talenti', 'Talenti', 'https://talentisrl.com', true),
('mf_decastelli', 'Decastelli', 'https://decastelli.it', true),
-- Декинг и други
('mf_ravaioli', 'Ravaioli', 'https://ravaioli.it', true),
('mf_uzin', 'Uzin', 'https://uzin-utz.com', true),
('mf_parketsense_pro', 'Паркетсенс ПРО', 'https://parketsense.bg', true);
```

#### **1A.3 AttributeTypes - За всички ProductTypes:**

**За Паркет (pt_parquet):**
```sql
INSERT INTO AttributeType (id, name, nameEn, type, productTypeId, isRequired, displayOrder) VALUES:
('at_parquet_wood_type', 'Дървесина', 'Wood Type', 'SELECT', 'pt_parquet', true, 1),
('at_parquet_construction', 'Тип конструкция', 'Construction Type', 'SELECT', 'pt_parquet', true, 2),
('at_parquet_thickness', 'Дебелина', 'Thickness', 'SELECT', 'pt_parquet', true, 3),
('at_parquet_width', 'Ширина', 'Width', 'SELECT', 'pt_parquet', true, 4),
('at_parquet_length', 'Дължина', 'Length', 'SELECT', 'pt_parquet', true, 5),
('at_parquet_color', 'Цвят', 'Color', 'COLOR', 'pt_parquet', true, 6),
('at_parquet_finish', 'Финиш', 'Finish', 'SELECT', 'pt_parquet', true, 7),
('at_parquet_selection', 'Селекция', 'Selection', 'SELECT', 'pt_parquet', false, 8),
('at_parquet_collection', 'Колекция', 'Collection', 'SELECT', 'pt_parquet', false, 9);
```

**За Врати (pt_doors):**
```sql
INSERT INTO AttributeType (id, name, nameEn, type, productTypeId, isRequired, displayOrder) VALUES:
('at_doors_type', 'Тип врата', 'Door Type', 'SELECT', 'pt_doors', true, 1),
('at_doors_frame_material', 'Материал каса', 'Frame Material', 'SELECT', 'pt_doors', true, 2),
('at_doors_finish_push', 'Финиш пуш страна', 'Push Side Finish', 'SELECT', 'pt_doors', true, 3),
('at_doors_finish_pull', 'Финиш пул страна', 'Pull Side Finish', 'SELECT', 'pt_doors', true, 4),
('at_doors_lock_type', 'Вид брава', 'Lock Type', 'SELECT', 'pt_doors', true, 5),
('at_doors_opening', 'Посока отваряне', 'Opening Direction', 'SELECT', 'pt_doors', true, 6),
('at_doors_height', 'Височина', 'Height', 'SELECT', 'pt_doors', true, 7),
('at_doors_width', 'Ширина', 'Width', 'SELECT', 'pt_doors', true, 8),
('at_doors_collection', 'Колекция', 'Collection', 'SELECT', 'pt_doors', false, 9);
```

**[Продължи за всички останали ProductTypes...]**

#### **1A.4 AttributeValues - Хиляди записи:**

**Пример за Wood Type атрибут:**
```sql
INSERT INTO AttributeValue (id, nameBg, nameEn, icon, attributeTypeId, manufacturerId, displayOrder) VALUES:
('av_wood_oak_all', 'Дъб', 'Oak', '🌳', 'at_parquet_wood_type', null, 1),
('av_wood_beech_all', 'Бук', 'Beech', '🌳', 'at_parquet_wood_type', null, 2),
('av_wood_walnut_all', 'Орех', 'Walnut', '🌰', 'at_parquet_wood_type', null, 3),
('av_wood_ash_all', 'Ясен', 'Ash', '🌳', 'at_parquet_wood_type', null, 4),
('av_wood_bamboo_all', 'Бамбук', 'Bamboo', '🎋', 'at_parquet_wood_type', null, 5);
```

**За цветове:**
```sql
INSERT INTO AttributeValue (id, nameBg, nameEn, colorCode, attributeTypeId, displayOrder) VALUES:
('av_color_natural', 'Натурален', 'Natural', '#D2B48C', 'at_parquet_color', 1),
('av_color_dark_oak', 'Тъмен дъб', 'Dark Oak', '#8B4513', 'at_parquet_color', 2),
('av_color_walnut', 'Орех', 'Walnut', '#654321', 'at_parquet_color', 3),
('av_color_white', 'Бял', 'White', '#F5F5DC', 'at_parquet_color', 4),
('av_color_grey', 'Сив', 'Grey', '#808080', 'at_parquet_color', 5);
```

### **ТЕСТВАНЕ НА ЗАДАЧА 1A:**
```bash
# Провери че всички данни са в базата
npx prisma studio  # Разгледай данните визуално
npm run seed       # Изпълни seed script-а
```

**КРИТЕРИИ ЗА УСПЕХ:**
- ✅ 8 ProductTypes в базата данни
- ✅ 13+ Manufacturers с реални данни  
- ✅ 50+ AttributeTypes за всички продукти
- ✅ 500+ AttributeValues със стойности, икони, цветове
- ✅ Всички relationships работят правилно
- ✅ Няма constraint грешки
- ✅ Prisma studio показва всички данни

**СПРИ ТУК! НЕ ПРОДЪЛЖАВАЙ ДОКАТО ЗАДАЧА 1A НЕ Е 100% ЗАВЪРШЕНА!**

---

## 📋 **ФАЗА 2: API ENDPOINTS TESTING (Ден 2-3)**

### **ЗАДАЧА 2A: Complete API Implementation**

**ЦЕЛ:** Всички API endpoints работят перфектно с реалната база данни

#### **2A.1 ProductTypes API Testing:**
```bash
# Тествай всички endpoints с cURL или Postman
GET http://localhost:4000/api/product-types
GET http://localhost:4000/api/product-types/pt_parquet
GET http://localhost:4000/api/product-types/pt_parquet/attributes
```

**Очакван резултат:** JSON с всички реални данни от базата

#### **2A.2 Manufacturers API Testing:**
```bash
GET http://localhost:4000/api/manufacturers
GET http://localhost:4000/api/manufacturers/mf_foglie_doro
```

#### **2A.3 AttributeValues API Testing:**
```bash
GET http://localhost:4000/api/attribute-values
GET http://localhost:4000/api/attribute-values/by-manufacturer/mf_foglie_doro
POST http://localhost:4000/api/attribute-values
PUT http://localhost:4000/api/attribute-values/av_wood_oak_all  
DELETE http://localhost:4000/api/attribute-values/test_id
```

#### **2A.4 Attributes API Testing:**
```bash
GET http://localhost:4000/api/attributes
POST http://localhost:4000/api/attributes
PUT http://localhost:4000/api/attributes/at_parquet_wood_type
DELETE http://localhost:4000/api/attributes/test_id
```

### **CRITICAL ERROR RESOLUTION:**
**Реши всички constraint грешки, validation issues, missing fields**

### **ТЕСТВАНЕ НА ЗАДАЧА 2A:**
- Всички GET endpoints връщат реални данни
- Всички POST endpoints създават записи успешно  
- Всички PUT endpoints обновяват данни
- Всички DELETE endpoints правят soft delete
- Няма database constraint грешки
- Proper error handling за invalid requests

**КРИТЕРИИ ЗА УСПЕХ:**
- ✅ 25+ API endpoints работят без грешки
- ✅ Full CRUD functionality за всички ресурси
- ✅ Proper validation и error handling
- ✅ Consistent JSON response format
- ✅ No database constraint violations
- ✅ Postman collection готова за тестване

**СПРИ ТУК! НЕ ПРОДЪЛЖАВАЙ ДОКАТО ВСИЧКИ API ENDPOINTS НЕ РАБОТЯТ!**

---

## 📋 **ФАЗА 3: FRONTEND INTEGRATION (Ден 3-4)**

### **ЗАДАЧА 3A: API Services Creation**

**ЦЕЛ:** Премахни всички mock данни, използвай само реални API calls

#### **3A.1 Създай API Services:**

**attributeService.ts:**
```typescript
import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

interface ProductType {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  displayOrder: number;
}

interface AttributeType {
  id: string;
  name: string;
  nameEn: string;
  type: 'SELECT' | 'COLOR' | 'TEXT' | 'NUMBER';
  isRequired: boolean;
  displayOrder: number;
  attributeValues: AttributeValue[];
}

interface AttributeValue {
  id: string;
  nameBg: string;
  nameEn: string;
  icon?: string;
  colorCode?: string;
  manufacturerId?: string;
}

export const attributeService = {
  // ProductTypes
  async getProductTypes(): Promise<ProductType[]> {
    const response = await axios.get(`${BASE_URL}/product-types`);
    return response.data;
  },

  async getProductTypeAttributes(productTypeId: string): Promise<AttributeType[]> {
    const response = await axios.get(`${BASE_URL}/product-types/${productTypeId}/attributes`);
    return response.data;
  },

  // Manufacturers  
  async getManufacturers(): Promise<Manufacturer[]> {
    const response = await axios.get(`${BASE_URL}/manufacturers`);
    return response.data;
  },

  // AttributeValues
  async createAttributeValue(data: CreateAttributeValueDto): Promise<AttributeValue> {
    const response = await axios.post(`${BASE_URL}/attribute-values`, data);
    return response.data;
  },

  async getAttributeValuesByManufacturer(manufacturerId: string): Promise<AttributeValue[]> {
    const response = await axios.get(`${BASE_URL}/attribute-values/by-manufacturer/${manufacturerId}`);
    return response.data;
  },

  // Attributes
  async createAttributeType(data: CreateAttributeTypeDto): Promise<AttributeType> {
    const response = await axios.post(`${BASE_URL}/attributes`, data);
    return response.data;
  }
};
```

#### **3A.2 Update Frontend Components:**

**AttributeManagement.tsx:**
```typescript
// ПРЕМАХНИ всички mock данни
// ПРЕМАХНИ import от mockAttributes.ts
// ДОБАВИ:
import { attributeService } from '../services/attributeService';

const [productTypes, setProductTypes] = useState<ProductType[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const loadData = async () => {
    try {
      setLoading(true);
      const types = await attributeService.getProductTypes();
      setProductTypes(types);
    } catch (err) {
      setError('Грешка при зареждане на данните');
    } finally {
      setLoading(false);
    }
  };
  
  loadData();
}, []);
```

**ProductCreateForm.tsx:**
```typescript
// ПРЕМАХНИ hardcoded productAttributes object
// ДОБАВИ реално API loading:
const loadAttributesForType = async (productTypeId: string) => {
  try {
    setLoading(true);
    const attributes = await attributeService.getProductTypeAttributes(productTypeId);
    setDynamicAttributes(attributes);
  } catch (error) {
    setError('Грешка при зареждане на атрибутите');
  } finally {
    setLoading(false);
  }
};
```

#### **3A.3 Real API Integration Testing:**

**ТЕСТВАЙ НА LOCALHOST:3000:**
- AttributeManagement показва реални данни от API
- ProductCreateForm зарежда реални атрибути
- AddAttributeModal създава реални AttributeValues
- AddProductTypeModal създава реални ProductTypes
- Manufacturer филтрирането работи
- Няма console errors

### **КРИТЕРИИ ЗА УСПЕХ НА ЗАДАЧА 3A:**
- ✅ НУЛА mock данни в кода
- ✅ Всички компоненти използват реални API calls
- ✅ Loading states навсякъде  
- ✅ Error handling за всички API заявки
- ✅ Реални данни се показват в UI
- ✅ CRUD операции работят през UI
- ✅ Синхронизирани данни между компонентите

**СПРИ ТУК! НЕ ПРОДЪЛЖАВАЙ ДОКАТО FRONTEND НЕ РАБОТИ 100% С РЕАЛНИТЕ API!**

---

## 📋 **ФАЗА 4: UI POLISH & FEATURES (Ongoing)**

### **ЗАДАЧА 4A: Visual Polish**

**ЦЕЛ:** Подобри user experience без промени в database или API

- Loading skeletons
- Better error messages  
- Success notifications
- Improved validation
- Mobile responsiveness
- Accessibility improvements

### **ВАЖНО:** В тази фаза **НЕ СЕ ПРОМЕНЯТ database schema или API endpoints!**

---

## ⚠️ **КРИТИЧНИ ПРАВИЛА ЗА CURSOR**

### **MANDATORY principles:**
1. **Една фаза наведнъж** - не смесвай фазите
2. **Database-first** - базата данни се изгражда първо и НЕ СЕ ПРОМЕНЯ
3. **Test everything** - всяка фаза трябва да е 100% функционална
4. **No moving targets** - веднъж готово, не се пипа
5. **Documentation** - документирай всички API endpoints

### **CHECKPOINT system:**
- **След всяка задача** - СПРИ и тествай
- **При грешки** - поправи преди да продължиш
- **Fresh session** - ако се объркаш, рестартирай

### **FILE PRIORITIES:**
```
ФАЗА 1: Само backend/database файлове
ФАЗА 2: Само backend API файлове  
ФАЗА 3: Само frontend service файлове
ФАЗА 4: Само frontend UI файлове
```

---

## ✅ **SUCCESS METRICS**

### **ФАЗА 1 ГОТОВА:**
- ✅ Пълна база данни с всички ProductTypes, Manufacturers, AttributeTypes, AttributeValues
- ✅ Няма constraint грешки
- ✅ Prisma studio показва всички данни правилно

### **ФАЗА 2 ГОТОВА:**
- ✅ Всички API endpoints работят без грешки  
- ✅ Postman testing пас за всички endpoints
- ✅ CRUD операции функционират перфектно

### **ФАЗА 3 ГОТОВА:**
- ✅ Frontend работи само с реални API данни
- ✅ Нула mock данни в кода
- ✅ Всички UI компоненти интегрирани с API

### **ФАЗА 4 ГОТОВА:**
- ✅ Professional UI/UX
- ✅ Production-ready система
- ✅ Пълна MVP функционалност

---

## 🚀 **СТАРТИРАНЕ НА НОВИЯ ПОДХОД**

### **Cursor prompt за започване:**
```
@apps/backend/prisma ЗАПОЧНИ: Database-First Development

Прочети инструкциите в @docs/cursor-tasks/TASK-database-first-approach.md

ЗАПОЧНИ С ФАЗА 1, ЗАДАЧА 1A: Complete Database Schema

ЦЕЛ: Изгради пълната база данни с всички ProductTypes, Manufacturers, AttributeTypes и AttributeValues

НЕ ЗАСЯГАЙ frontend файлове в тази фаза!
ФОКУС САМО ВЪРХУ: schema.prisma, seed.ts, migrations

ЗАПОЧНИ С ProductTypes seed данните!
```

---

**🎯 Този подход ще елиминира объркването и ще доведе до стабилна, production-ready система!**

*Estimated total time: 3-4 дни за пълна MVP готовност*  
*Much more predictable and stable than the current chaotic approach*