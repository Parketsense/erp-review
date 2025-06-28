# PARKETSENSE - Backend Integration Files

## 📁 Файлова структура за бекенд интеграция

```
backend-integration/
├── database/
│   ├── migrations/
│   │   ├── 001_create_manufacturers.sql
│   │   ├── 002_create_product_types.sql
│   │   ├── 003_create_product_attributes.sql
│   │   ├── 004_create_attribute_values.sql
│   │   ├── 005_create_products.sql
│   │   ├── 006_create_product_attribute_values.sql
│   │   └── 007_create_product_media.sql
│   ├── seeds/
│   │   ├── manufacturers_seed.sql
│   │   ├── product_types_seed.sql
│   │   └── attributes_seed.sql
│   └── legacy_migration/
│       ├── data_mapping.sql
│       └── legacy_import.sql
├── api/
│   ├── routes/
│   │   ├── manufacturers.js
│   │   ├── product-types.js
│   │   ├── attributes.js
│   │   └── products.js
│   └── models/
│       ├── Manufacturer.js
│       ├── ProductType.js
│       ├── Attribute.js
│       └── Product.js
└── documentation/
    ├── migration-guide.md
    ├── api-endpoints.md
    └── data-mapping.md
```

---

## 🗄️ Database Migration Files

### 001_create_manufacturers.sql
```sql
-- Таблица за производители
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE manufacturers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL UNIQUE,
    country VARCHAR(100),
    discount_percent DECIMAL(5,2) DEFAULT 0,
    contact_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    logo_url VARCHAR(500),
    website VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_manufacturers_name ON manufacturers(name);
CREATE INDEX idx_manufacturers_active ON manufacturers(is_active);

-- Тригер за updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_manufacturers_updated_at 
    BEFORE UPDATE ON manufacturers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 002_create_product_types.sql
```sql
-- Таблица за типове продукти
CREATE TABLE product_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_bg VARCHAR(200) NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(50), -- Unicode emoji или font icon class
    color_scheme VARCHAR(20) DEFAULT '#3498db',
    description_bg TEXT,
    description_en TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    seo_title_bg VARCHAR(255),
    seo_title_en VARCHAR(255),
    seo_description_bg TEXT,
    seo_description_en TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_types_slug ON product_types(slug);
CREATE INDEX idx_product_types_active ON product_types(is_active);
CREATE INDEX idx_product_types_sort ON product_types(sort_order);

CREATE TRIGGER update_product_types_updated_at 
    BEFORE UPDATE ON product_types 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 003_create_product_attributes.sql
```sql
-- Таблица за атрибути на продукти
CREATE TABLE product_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_type_id UUID REFERENCES product_types(id) ON DELETE CASCADE,
    name_bg VARCHAR(200) NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    data_type VARCHAR(50) DEFAULT 'select', -- select, multi_select, text, number, boolean
    is_required BOOLEAN DEFAULT FALSE,
    is_filterable BOOLEAN DEFAULT TRUE,
    is_searchable BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    validation_rules JSONB DEFAULT '{}', -- regex, min, max, etc.
    help_text_bg TEXT,
    help_text_en TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(product_type_id, slug)
);

CREATE INDEX idx_attributes_product_type ON product_attributes(product_type_id);
CREATE INDEX idx_attributes_slug ON product_attributes(product_type_id, slug);
CREATE INDEX idx_attributes_sort ON product_attributes(sort_order);

CREATE TRIGGER update_product_attributes_updated_at 
    BEFORE UPDATE ON product_attributes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 004_create_attribute_values.sql
```sql
-- Таблица за стойности на атрибути
CREATE TABLE attribute_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attribute_id UUID REFERENCES product_attributes(id) ON DELETE CASCADE,
    manufacturer_id UUID REFERENCES manufacturers(id) ON DELETE SET NULL, -- NULL = универсална стойност
    value_bg VARCHAR(500) NOT NULL,
    value_en VARCHAR(500) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    color_code VARCHAR(7), -- HEX color за визуализация
    image_url VARCHAR(500), -- За цветове, текстури и т.н.
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(attribute_id, manufacturer_id, slug)
);

CREATE INDEX idx_values_attribute ON attribute_values(attribute_id);
CREATE INDEX idx_values_manufacturer ON attribute_values(manufacturer_id);
CREATE INDEX idx_values_slug ON attribute_values(attribute_id, slug);

CREATE TRIGGER update_attribute_values_updated_at 
    BEFORE UPDATE ON attribute_values 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 005_create_products.sql
```sql
-- Главна таблица за продукти
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Йерархия и класификация
    product_type_id UUID REFERENCES product_types(id) NOT NULL,
    manufacturer_id UUID REFERENCES manufacturers(id) NOT NULL,
    collection_id UUID, -- За future use
    
    -- Основни данни
    name_bg VARCHAR(500) NOT NULL,
    name_en VARCHAR(500) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    description_bg TEXT,
    description_en TEXT,
    
    -- Ценова информация
    cost_eur DECIMAL(10,2),
    cost_bgn DECIMAL(10,2),
    price_eur DECIMAL(10,2),
    price_bgn DECIMAL(10,2),
    auto_pricing BOOLEAN DEFAULT TRUE,
    margin_percent DECIMAL(5,2) DEFAULT 30.0,
    
    -- Логистична информация
    unit VARCHAR(20) DEFAULT 'кв.м.',
    package_size DECIMAL(10,2) DEFAULT 1.0,
    min_order_quantity DECIMAL(10,2) DEFAULT 1.0,
    lead_time_days INTEGER DEFAULT 14,
    weight_kg DECIMAL(8,2),
    
    -- Складови данни
    current_stock DECIMAL(10,2) DEFAULT 0,
    reserved_stock DECIMAL(10,2) DEFAULT 0,
    min_stock_level DECIMAL(10,2) DEFAULT 0,
    
    -- SEO полета
    seo_title_bg VARCHAR(255),
    seo_title_en VARCHAR(255),
    seo_description_bg TEXT,
    seo_description_en TEXT,
    seo_keywords_bg TEXT,
    seo_keywords_en TEXT,
    
    -- Статуси и метаданни
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    popularity_score INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID, -- REFERENCES users(id)
    updated_by UUID  -- REFERENCES users(id)
);

-- Индекси за производителност
CREATE INDEX idx_products_type ON products(product_type_id);
CREATE INDEX idx_products_manufacturer ON products(manufacturer_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_price_bgn ON products(price_bgn);

-- Full-text search индекс
CREATE INDEX idx_products_search ON products USING gin(
    to_tsvector('bulgarian', 
        coalesce(name_bg, '') || ' ' || 
        coalesce(description_bg, '') || ' ' || 
        coalesce(sku, '')
    )
);

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 006_create_product_attribute_values.sql
```sql
-- Junction таблица за връзка продукти-атрибути-стойности
CREATE TABLE product_attribute_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    attribute_id UUID REFERENCES product_attributes(id) ON DELETE CASCADE,
    value_id UUID REFERENCES attribute_values(id) ON DELETE CASCADE,
    custom_value TEXT, -- За случаи когато стойността не е предефинирана
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(product_id, attribute_id, value_id)
);

CREATE INDEX idx_product_attr_values_product ON product_attribute_values(product_id);
CREATE INDEX idx_product_attr_values_attribute ON product_attribute_values(attribute_id);
CREATE INDEX idx_product_attr_values_value ON product_attribute_values(value_id);
```

### 007_create_product_media.sql
```sql
-- Таблица за медийно съдържание
CREATE TABLE product_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- image, document, video, texture, 3d_model
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    original_filename VARCHAR(255),
    file_size_mb DECIMAL(8,2),
    mime_type VARCHAR(100),
    alt_text_bg VARCHAR(255),
    alt_text_en VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}', -- dimensions, colors, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_product_media_product ON product_media(product_id);
CREATE INDEX idx_product_media_type ON product_media(type);
CREATE INDEX idx_product_media_primary ON product_media(is_primary);
```

---

## 🌱 Seed Data Files

### manufacturers_seed.sql
```sql
-- Основни производители
INSERT INTO manufacturers (id, name, country, discount_percent, is_active) VALUES
(uuid_generate_v4(), 'Hickx', 'България', 30.0, true),
(uuid_generate_v4(), 'Bauwerk', 'Австрия', 25.0, true),
(uuid_generate_v4(), 'Bolefloor', 'Холандия', 20.0, true),
(uuid_generate_v4(), 'Kahrs', 'Швеция', 22.0, true),
(uuid_generate_v4(), 'Tarkett', 'Франция', 18.0, true),
(uuid_generate_v4(), 'Quick-Step', 'Белгия', 20.0, true),
(uuid_generate_v4(), 'Egger', 'Австрия', 15.0, true);
```

### product_types_seed.sql
```sql
-- Типове продукти с емоджи икони
INSERT INTO product_types (id, name_bg, name_en, slug, icon, color_scheme, sort_order) VALUES
(uuid_generate_v4(), 'Паркет', 'Parquet', 'parquet', '🪵', '#8B4513', 1),
(uuid_generate_v4(), 'Врати', 'Doors', 'doors', '🚪', '#654321', 2),
(uuid_generate_v4(), 'Мебели', 'Furniture', 'furniture', '🪑', '#DEB887', 3),
(uuid_generate_v4(), 'Стенни облицовки', 'Wall Coverings', 'wall-coverings', '🧱', '#A0522D', 4),
(uuid_generate_v4(), 'Стъкла', 'Glass', 'glass', '🪟', '#87CEEB', 5),
(uuid_generate_v4(), 'Декорации', 'Decorations', 'decorations', '🎨', '#FF6347', 6);
```

### attributes_seed.sql
```sql
-- Атрибути за паркет
DO $$
DECLARE
    parquet_type_id UUID;
    attr_id UUID;
BEGIN
    -- Вземаме ID на типа "паркет"
    SELECT id INTO parquet_type_id FROM product_types WHERE slug = 'parquet';
    
    -- Дървесина/Материал
    INSERT INTO product_attributes (id, product_type_id, name_bg, name_en, slug, sort_order) 
    VALUES (uuid_generate_v4(), parquet_type_id, 'Дървесина/Материал', 'Wood/Material', 'wood-material', 1)
    RETURNING id INTO attr_id;
    
    INSERT INTO attribute_values (attribute_id, value_bg, value_en, slug, sort_order) VALUES
    (attr_id, 'Дъб', 'Oak', 'oak', 1),
    (attr_id, 'Ясен', 'Ash', 'ash', 2),
    (attr_id, 'Бук', 'Beech', 'beech', 3),
    (attr_id, 'Орех', 'Walnut', 'walnut', 4),
    (attr_id, 'Череша', 'Cherry', 'cherry', 5),
    (attr_id, 'Клен', 'Maple', 'maple', 6),
    (attr_id, 'Бамбук', 'Bamboo', 'bamboo', 7),
    (attr_id, 'Ламинат', 'Laminate', 'laminate', 8),
    (attr_id, 'SPC', 'SPC', 'spc', 9),
    (attr_id, 'LVT', 'LVT', 'lvt', 10);
    
    -- Тип конструкция
    INSERT INTO product_attributes (id, product_type_id, name_bg, name_en, slug, sort_order) 
    VALUES (uuid_generate_v4(), parquet_type_id, 'Тип конструкция', 'Construction Type', 'construction-type', 2)
    RETURNING id INTO attr_id;
    
    INSERT INTO attribute_values (attribute_id, value_bg, value_en, slug, sort_order) VALUES
    (attr_id, 'Масив', 'Solid', 'solid', 1),
    (attr_id, 'Инженерен', 'Engineered', 'engineered', 2),
    (attr_id, 'Ламинат', 'Laminate', 'laminate', 3),
    (attr_id, 'Винилов', 'Vinyl', 'vinyl', 4),
    (attr_id, 'SPC', 'SPC', 'spc', 5);
    
    -- Селекция
    INSERT INTO product_attributes (id, product_type_id, name_bg, name_en, slug, sort_order) 
    VALUES (uuid_generate_v4(), parquet_type_id, 'Селекция', 'Grade', 'grade', 3)
    RETURNING id INTO attr_id;
    
    INSERT INTO attribute_values (attribute_id, value_bg, value_en, slug, sort_order) VALUES
    (attr_id, 'Натур', 'Nature', 'nature', 1),
    (attr_id, 'Рустик', 'Rustic', 'rustic', 2),
    (attr_id, 'Маркант', 'Markant', 'markant', 3),
    (attr_id, 'ABC', 'ABC', 'abc', 4),
    (attr_id, 'Прайм', 'Prime', 'prime', 5),
    (attr_id, 'Елегант', 'Elegant', 'elegant', 6);
    
    -- Дебелина
    INSERT INTO product_attributes (id, product_type_id, name_bg, name_en, slug, data_type, sort_order) 
    VALUES (uuid_generate_v4(), parquet_type_id, 'Дебелина', 'Thickness', 'thickness', 'select', 4)
    RETURNING id INTO attr_id;
    
    INSERT INTO attribute_values (attribute_id, value_bg, value_en, slug, sort_order) VALUES
    (attr_id, '8mm', '8mm', '8mm', 1),
    (attr_id, '10mm', '10mm', '10mm', 2),
    (attr_id, '12mm', '12mm', '12mm', 3),
    (attr_id, '14mm', '14mm', '14mm', 4),
    (attr_id, '15mm', '15mm', '15mm', 5),
    (attr_id, '20mm', '20mm', '20mm', 6),
    (attr_id, '22mm', '22mm', '22mm', 7);
    
END $$;
```

---

## 🔄 Legacy Migration Files

### data_mapping.sql
```sql
-- Функция за мапиране на стари категории към нови типове
CREATE OR REPLACE FUNCTION map_legacy_category_to_type(legacy_category VARCHAR)
RETURNS UUID AS $$
DECLARE
    type_id UUID;
BEGIN
    SELECT id INTO type_id FROM product_types 
    WHERE slug = CASE 
        WHEN legacy_category ILIKE '%паркет%' OR legacy_category ILIKE '%parquet%' THEN 'parquet'
        WHEN legacy_category ILIKE '%врата%' OR legacy_category ILIKE '%door%' THEN 'doors'
        WHEN legacy_category ILIKE '%мебел%' OR legacy_category ILIKE '%furniture%' THEN 'furniture'
        WHEN legacy_category ILIKE '%стена%' OR legacy_category ILIKE '%wall%' THEN 'wall-coverings'
        WHEN legacy_category ILIKE '%стъкло%' OR legacy_category ILIKE '%glass%' THEN 'glass'
        ELSE 'decorations'
    END;
    
    RETURN type_id;
END;
$$ LANGUAGE plpgsql;

-- Функция за парсиране на атрибути от име на продукт
CREATE OR REPLACE FUNCTION extract_attributes_from_name(product_name VARCHAR)
RETURNS JSONB AS $$
DECLARE
    attributes JSONB := '{}';
BEGIN
    -- Извличане на дебелина
    IF product_name ~ '\d+mm' THEN
        attributes := attributes || jsonb_build_object(
            'thickness', 
            (regexp_matches(product_name, '(\d+)mm'))[1] || 'mm'
        );
    END IF;
    
    -- Извличане на размери
    IF product_name ~ '\d+x\d+' THEN
        attributes := attributes || jsonb_build_object(
            'dimensions', 
            (regexp_matches(product_name, '(\d+x\d+)'))[1]
        );
    END IF;
    
    -- Извличане на дървесина
    IF product_name ILIKE '%дъб%' OR product_name ILIKE '%oak%' THEN
        attributes := attributes || jsonb_build_object('wood', 'oak');
    ELSIF product_name ILIKE '%ясен%' OR product_name ILIKE '%ash%' THEN
        attributes := attributes || jsonb_build_object('wood', 'ash');
    ELSIF product_name ILIKE '%бук%' OR product_name ILIKE '%beech%' THEN
        attributes := attributes || jsonb_build_object('wood', 'beech');
    END IF;
    
    RETURN attributes;
END;
$$ LANGUAGE plpgsql;
```

### legacy_import.sql
```sql
-- Миграционен скрипт за внос на стари данни
DO $$
DECLARE
    rec RECORD;
    new_product_id UUID;
    manufacturer_id UUID;
    product_type_id UUID;
    extracted_attrs JSONB;
BEGIN
    
    -- Итерация през всички стари продукти
    FOR rec IN 
        SELECT * FROM legacy_products 
        WHERE active = true
    LOOP
        -- Намиране или създаване на производител
        SELECT id INTO manufacturer_id 
        FROM manufacturers 
        WHERE name = rec.manufacturer_name;
        
        IF manufacturer_id IS NULL THEN
            INSERT INTO manufacturers (name, is_active) 
            VALUES (rec.manufacturer_name, true)
            RETURNING id INTO manufacturer_id;
        END IF;
        
        -- Мапиране на тип продукт
        product_type_id := map_legacy_category_to_type(rec.category);
        
        -- Извличане на атрибути от името
        extracted_attrs := extract_attributes_from_name(rec.product_name);
        
        -- Създаване на новия продукт
        INSERT INTO products (
            product_type_id,
            manufacturer_id,
            name_bg,
            name_en,
            sku,
            cost_eur,
            price_bgn,
            unit,
            is_active
        ) VALUES (
            product_type_id,
            manufacturer_id,
            rec.product_name,
            COALESCE(rec.product_name_en, rec.product_name),
            rec.product_code,
            rec.cost_price_eur,
            rec.selling_price_bgn,
            COALESCE(rec.unit_measure, 'кв.м.'),
            rec.active
        ) RETURNING id INTO new_product_id;
        
        -- Запазване на атрибутите (ако има извлечени)
        -- Тук може да добавите логика за автоматично мапиране на атрибути
        
        RAISE NOTICE 'Мигриран продукт: % -> %', rec.product_name, new_product_id;
        
    END LOOP;
    
END $$;
```

---

## 🛠️ API Endpoints

### routes/products.js
```javascript
const express = require('express');
const router = express.Router();

// GET /api/products - Списък продукти с филтри
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            product_type_id,
            manufacturer_id,
            search,
            attributes = {}
        } = req.query;
        
        let query = `
            SELECT 
                p.*,
                pt.name_bg as product_type_name,
                m.name as manufacturer_name,
                array_agg(
                    json_build_object(
                        'attribute_id', pa.id,
                        'attribute_name', pa.name_bg,
                        'value_id', av.id,
                        'value_name', av.value_bg
                    )
                ) as attributes
            FROM products p
            JOIN product_types pt ON p.product_type_id = pt.id
            JOIN manufacturers m ON p.manufacturer_id = m.id
            LEFT JOIN product_attribute_values pav ON p.id = pav.product_id
            LEFT JOIN product_attributes pa ON pav.attribute_id = pa.id
            LEFT JOIN attribute_values av ON pav.value_id = av.id
            WHERE p.is_active = true
        `;
        
        const params = [];
        let paramCount = 0;
        
        if (product_type_id) {
            paramCount++;
            query += ` AND p.product_type_id = $${paramCount}`;
            params.push(product_type_id);
        }
        
        if (manufacturer_id) {
            paramCount++;
            query += ` AND p.manufacturer_id = $${paramCount}`;
            params.push(manufacturer_id);
        }
        
        if (search) {
            paramCount++;
            query += ` AND (
                p.name_bg ILIKE $${paramCount} OR 
                p.sku ILIKE $${paramCount}
            )`;
            params.push(`%${search}%`);
        }
        
        query += `
            GROUP BY p.id, pt.name_bg, m.name
            ORDER BY p.name_bg
            LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `;
        
        const result = await db.query(query, params);
        
        res.json({
            products: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: result.rowCount
            }
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/products - Създаване на продукт
router.post('/', async (req, res) => {
    const client = await db.getClient();
    
    try {
        await client.query('BEGIN');
        
        const {
            product_type_id,
            manufacturer_id,
            name_bg,
            name_en,
            sku,
            cost_eur,
            price_bgn,
            unit,
            attributes = [],
            media = []
        } = req.body;
        
        // Създаване на продукта
        const productResult = await client.query(`
            INSERT INTO products (
                product_type_id, manufacturer_id, name_bg, name_en, 
                sku, cost_eur, price_bgn, unit
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id
        `, [product_type_id, manufacturer_id, name_bg, name_en, sku, cost_eur, price_bgn, unit]);
        
        const productId = productResult.rows[0].id;
        
        // Добавяне на атрибути
        for (const attr of attributes) {
            await client.query(`
                INSERT INTO product_attribute_values (product_id, attribute_id, value_id)
                VALUES ($1, $2, $3)
            `, [productId, attr.attribute_id, attr.value_id]);
        }
        
        // Добавяне на медийни файлове
        for (const mediaItem of media) {
            await client.query(`
                INSERT INTO product_media (product_id, type, url, alt_text_bg)
                VALUES ($1, $2, $3, $4)
            `, [productId, mediaItem.type, mediaItem.url, mediaItem.alt_text]);
        }
        
        await client.query('COMMIT');
        
        res.status(201).json({ 
            message: 'Продуктът е създаден успешно',
            product_id: productId 
        });
        
    } catch (error) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    } finally {
        client.release();
    }
});

module.exports = router;
```

---

## 📋 Migration Guide

### 1. Подготовка на базата данни
```bash
# Изпълнение на миграциите в правилен ред
psql -d parketsense_db -f database/migrations/001_create_manufacturers.sql
psql -d parketsense_db -f database/migrations/002_create_product_types.sql
psql -d parketsense_db -f database/migrations/003_create_product_attributes.sql
psql -d parketsense_db -f database/migrations/004_create_attribute_values.sql
psql -d parketsense_db -f database/migrations/005_create_products.sql
psql -d parketsense_db -f database/migrations/006_create_product_attribute_values.sql
psql -d parketsense_db -f database/migrations/007_create_product_media.sql
```

### 2. Заредяване на начални данни
```bash
psql -d parketsense_db -f database/seeds/manufacturers_seed.sql
psql -d parketsense_db -f database/seeds/product_types_seed.sql
psql -d parketsense_db -f database/seeds/attributes_seed.sql
```

### 3. Миграция на стари данни
```bash
# Първо анализирайте старите данни
psql -d parketsense_db -f database/legacy_migration/data_mapping.sql

# После мигрирайте данните
psql -d parketsense_db -f database/legacy_migration/legacy_import.sql
```

### 4. Валидация
```sql
-- Проверка че всички продукти имат тип
SELECT COUNT(*) FROM products WHERE product_type_id IS NULL;

-- Проверка че всички продукти имат производител
SELECT COUNT(*) FROM products WHERE manufacturer_id IS NULL;

-- Статистика по типове продукти
SELECT 
    pt.name_bg,
    COUNT(p.id) as product_count
FROM product_types pt
LEFT JOIN products p ON pt.id = p.product_type_id
GROUP BY pt.id, pt.name_bg;
```

---

## 🎯 Ключови моменти за имплементация

### Производителност
- Използвайте индекси за всички fulltext търсения
- Кеширайте често използваните атрибути
- Използвайте пагинация за големи резултати

### Сигурност
- Валидирайте всички входни данни
- Използвайте параметризирани заявки
- Добавете rate limiting за API endpoints

### Поддръжка
- Логвайте всички промени в продуктите
- Създайте backup процедури
- Документирайте всички нестандартни решения

---

## 🐳 Docker Configuration

### Dockerfile
```dockerfile
# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: parketsense_erp
      POSTGRES_USER: parketsense
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/migrations:/docker-entrypoint-initdb.d
    ports:
      - "5432:5432"

  backend:
    build: .
    depends_on:
      - postgres
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: parketsense_erp
      DB_USER: parketsense
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"
    volumes:
      - uploads:/app/uploads

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend

volumes:
  postgres_data:
  uploads:
```

### .env.example
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=parketsense_erp
DB_USER=parketsense
DB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_256_bits_long
JWT_EXPIRY=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@company.com
EMAIL_PASS=your-app-password

# File Upload Configuration
UPLOAD_PATH=/uploads
MAX_FILE_SIZE=10MB
ALLOWED_EXTENSIONS=jpg,jpeg,png,pdf,doc,docx

# External Services
OPENAI_API_KEY=your_openai_key
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_BUCKET_NAME=parketsense-uploads

# Application Configuration
APP_URL=https://your-domain.com
CLIENT_URL=https://clients.your-domain.com
NODE_ENV=production
PORT=3000
```

---

## 📝 Deployment Scripts

### deploy.sh
```bash
#!/bin/bash

echo "🚀 Starting PARKETSENSE Backend Deployment..."

# Pull latest code
git pull origin main

# Stop existing containers
docker-compose down

# Build new images
docker-compose build --no-cache

# Run database migrations
docker-compose run --rm backend npm run migrate

# Start services
docker-compose up -d

# Check health
sleep 30
curl -f http://localhost:3000/health || exit 1

echo "✅ Deployment completed successfully!"
```

### backup.sh
```bash
#!/bin/bash

# Create backup directory
BACKUP_DIR="/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p $BACKUP_DIR

# Database backup
docker exec parketsense_postgres pg_dump -U parketsense parketsense_erp > $BACKUP_DIR/database.sql

# Files backup
docker cp parketsense_backend:/app/uploads $BACKUP_DIR/

# Create archive
tar -czf $BACKUP_DIR.tar.gz $BACKUP_DIR
rm -rf $BACKUP_DIR

echo "✅ Backup created: $BACKUP_DIR.tar.gz"
```

---

## 🔧 Configuration Files

### config/database.js
```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool
};
```

### config/multer.js
```javascript
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let subDir = 'general';
    
    if (file.fieldname === 'product_images') {
      subDir = 'products/images';
    } else if (file.fieldname === 'product_documents') {
      subDir = 'products/documents';
    }
    
    const fullPath = path.join(uploadDir, subDir);
    fs.mkdirSync(fullPath, { recursive: true });
    cb(null, fullPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = (process.env.ALLOWED_EXTENSIONS || 'jpg,jpeg,png,pdf,doc,docx').split(',');
  const fileExtension = path.extname(file.originalname).slice(1).toLowerCase();
  
  if (allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`File type .${fileExtension} is not allowed`), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
  fileFilter: fileFilter
});

module.exports = upload;
```

---

## 🧪 Testing Configuration

### tests/setup.js
```javascript
const { Pool } = require('pg');

// Test database configuration
const testPool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: 'parketsense_test',
  user: process.env.DB_USER || 'parketsense',
  password: process.env.DB_PASSWORD,
});

// Setup test database before each test
beforeEach(async () => {
  // Clean all tables
  await testPool.query('TRUNCATE TABLE products, product_attribute_values, attribute_values, product_attributes, product_types, manufacturers CASCADE');
  
  // Insert basic test data
  await testPool.query(`
    INSERT INTO manufacturers (id, name) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Test Manufacturer');
  `);
  
  await testPool.query(`
    INSERT INTO product_types (id, name_bg, name_en, slug) VALUES 
    ('550e8400-e29b-41d4-a716-446655440002', 'Тест Продукт', 'Test Product', 'test-product');
  `);
});

// Cleanup after tests
afterAll(async () => {
  await testPool.end();
});

module.exports = { testPool };
```

### tests/products.test.js
```javascript
const request = require('supertest');
const app = require('../src/app');
const { testPool } = require('./setup');

describe('Products API', () => {
  test('GET /api/products should return products list', async () => {
    const response = await request(app)
      .get('/api/products')
      .expect(200);
    
    expect(response.body).toHaveProperty('products');
    expect(response.body).toHaveProperty('pagination');
  });
  
  test('POST /api/products should create new product', async () => {
    const newProduct = {
      product_type_id: '550e8400-e29b-41d4-a716-446655440002',
      manufacturer_id: '550e8400-e29b-41d4-a716-446655440001',
      name_bg: 'Тест Продукт',
      name_en: 'Test Product',
      sku: 'TEST001',
      price_bgn: 100.00
    };
    
    const response = await request(app)
      .post('/api/products')
      .send(newProduct)
      .expect(201);
    
    expect(response.body).toHaveProperty('product_id');
  });
});
```

---

## 📊 Monitoring & Logging

### config/winston.js
```javascript
const winston = require('winston');
const path = require('path');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'parketsense-backend' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(process.env.LOG_PATH || './logs', 'error.log'), 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: path.join(process.env.LOG_PATH || './logs', 'combined.log') 
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

### middleware/requestLogger.js
```javascript
const logger = require('../config/winston');

const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
  });
  
  next();
};

module.exports = requestLogger;
```

---

## 🎯 Ключови команди за разработка

### Package.json scripts
```json
{
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest --watchAll",
    "test:ci": "jest --coverage --ci",
    "migrate": "node scripts/migrate.js",
    "seed": "node scripts/seed.js",
    "backup": "./scripts/backup.sh",
    "deploy": "./scripts/deploy.sh",
    "lint": "eslint src/",
    "lint:fix": "eslint src/ --fix",
    "format": "prettier --write src/"
  }
}
```

### Makefile
```makefile
.PHONY: help install start test deploy

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $1, $2}'

install: ## Install dependencies
	npm install
	cp .env.example .env

start: ## Start development server
	docker-compose up -d postgres
	npm run dev

test: ## Run tests
	npm run test:ci

migrate: ## Run database migrations
	npm run migrate

seed: ## Seed database with test data
	npm run seed

deploy: ## Deploy to production
	./scripts/deploy.sh

backup: ## Create database backup
	./scripts/backup.sh

clean: ## Clean up containers and volumes
	docker-compose down -v
	docker system prune -f
```

---

## 🚨 Production Checklist

### Security
- [ ] Всички environment variables са настроени
- [ ] JWT secret е генериран сигурно (256+ bits)
- [ ] Database passwords са сложни
- [ ] SSL сертификати са валидни
- [ ] CORS е конфигуриран правилно
- [ ] Rate limiting е активиран
- [ ] Input validation е имплементирана

### Performance
- [ ] Database индекси са създадени
- [ ] Connection pooling е конфигуриран
- [ ] File uploads са оптимизирани
- [ ] Caching е имплементиран където е възможно
- [ ] Compression е активиран

### Monitoring
- [ ] Logging е конфигуриран
- [ ] Health checks работят
- [ ] Error tracking е setup
- [ ] Performance metrics се събират
- [ ] Backup процедури са тествани

Тези файлове са готови за директна имплементация в бекенд системата и ще осигурят пълна функционалност за управление на продукти с динамични атрибути с production-ready настройки.