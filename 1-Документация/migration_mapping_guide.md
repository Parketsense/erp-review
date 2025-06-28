# 🔄 PARKETSENSE - Migration & Mapping Guide

## 📋 Преглед на миграцията

Тази инструкция описва стъп-по-стъпка процеса за миграция на съществуващите продуктови данни към новата структура с динамични атрибути.

---

## 🎯 1. Подготовка и анализ

### Стъпка 1.1: Анализ на съществуващи данни
```sql
-- Проверете какви данни имате в момента
SELECT 
    COUNT(*) as total_products,
    COUNT(DISTINCT manufacturer) as manufacturers_count,
    COUNT(DISTINCT category) as categories_count,
    STRING_AGG(DISTINCT category, ', ') as all_categories
FROM current_products;

-- Проверете структурата на данните
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'current_products'
ORDER BY ordinal_position;
```

### Стъпка 1.2: Създайте backup
```bash
# Пълен backup на текущата база данни
pg_dump -h localhost -U your_user -d current_database > backup_$(date +%Y%m%d).sql

# Backup само на продуктовите таблици
pg_dump -h localhost -U your_user -d current_database -t current_products -t manufacturers > products_backup.sql
```

---

## 🏗️ 2. Настройка на новата структура

### Стъпка 2.1: Изпълнете миграциите
```bash
# Създайте нова база данни
createdb parketsense_erp

# Изпълнете миграциите по ред
psql -d parketsense_erp -f database/migrations/001_create_manufacturers.sql
psql -d parketsense_erp -f database/migrations/002_create_product_types.sql
psql -d parketsense_erp -f database/migrations/003_create_product_attributes.sql
psql -d parketsense_erp -f database/migrations/004_create_attribute_values.sql
psql -d parketsense_erp -f database/migrations/005_create_products.sql
psql -d parketsense_erp -f database/migrations/006_create_product_attribute_values.sql
psql -d parketsense_erp -f database/migrations/007_create_product_media.sql
```

### Стъпка 2.2: Заредете началните данни
```bash
psql -d parketsense_erp -f database/seeds/manufacturers_seed.sql
psql -d parketsense_erp -f database/seeds/product_types_seed.sql
psql -d parketsense_erp -f database/seeds/attributes_seed.sql
```

---

## 🗺️ 3. Мапиране на данни

### Стъпка 3.1: Мапиране на категории към типове продукти

Създайте mapping table за категориите:

```sql
-- Temporary mapping table
CREATE TABLE category_mapping (
    old_category VARCHAR(255),
    new_type_slug VARCHAR(100),
    new_type_id UUID
);

-- Попълнете мапинга спрямо вашите данни
INSERT INTO category_mapping (old_category, new_type_slug) VALUES
('Паркет', 'parquet'),
('Parquet', 'parquet'),
('Ламинат', 'parquet'),
('Laminate', 'parquet'),
('Врати', 'doors'),
('Doors', 'doors'),
('Интериорни врати', 'doors'),
('Мебели', 'furniture'),
('Furniture', 'furniture'),
('Шкафове', 'furniture'),
('Стенни покрития', 'wall-coverings'),
('Стъкла', 'glass'),
('Декорации', 'decorations');

-- Обновете ID-тата
UPDATE category_mapping cm 
SET new_type_id = pt.id 
FROM product_types pt 
WHERE cm.new_type_slug = pt.slug;

-- Проверете резултата
SELECT * FROM category_mapping;
```

### Стъпка 3.2: Мапиране на производители

```sql
-- Проверете какви производители имате
SELECT DISTINCT manufacturer_name, COUNT(*) as product_count
FROM current_products 
WHERE manufacturer_name IS NOT NULL
GROUP BY manufacturer_name
ORDER BY product_count DESC;

-- Мапиране на производители
INSERT INTO manufacturers (name, discount_percent, is_active)
SELECT DISTINCT 
    manufacturer_name,
    CASE 
        WHEN manufacturer_name ILIKE '%hickx%' THEN 30.0
        WHEN manufacturer_name ILIKE '%bauwerk%' THEN 25.0
        WHEN manufacturer_name ILIKE '%kahrs%' THEN 22.0
        WHEN manufacturer_name ILIKE '%tarkett%' THEN 18.0
        ELSE 20.0
    END as discount_percent,
    true
FROM current_products 
WHERE manufacturer_name IS NOT NULL
AND manufacturer_name NOT IN (SELECT name FROM manufacturers);
```

---

## 📦 4. Миграция на продукти

### Стъпка 4.1: Основни данни за продукти

```sql
-- Миграция на основните продукти
INSERT INTO products (
    product_type_id,
    manufacturer_id,
    name_bg,
    name_en,
    sku,
    cost_eur,
    cost_bgn,
    price_eur,
    price_bgn,
    unit,
    is_active
)
SELECT 
    pt.id as product_type_id,
    m.id as manufacturer_id,
    cp.product_name as name_bg,
    COALESCE(cp.product_name_en, cp.product_name) as name_en,
    cp.product_code as sku,
    cp.cost_price_eur,
    cp.cost_price_bgn,
    cp.sell_price_eur,
    cp.sell_price_bgn,
    COALESCE(cp.unit, 'кв.м.') as unit,
    COALESCE(cp.is_active, true)
FROM current_products cp
JOIN category_mapping cm ON cp.category = cm.old_category
JOIN product_types pt ON cm.new_type_id = pt.id
JOIN manufacturers m ON cp.manufacturer_name = m.name
WHERE cp.product_name IS NOT NULL;
```

### Стъпка 4.2: Извличане и мапиране на атрибути

```sql
-- Функция за извличане на атрибути от име на продукт
CREATE OR REPLACE FUNCTION extract_and_assign_attributes(
    p_product_id UUID,
    p_product_name VARCHAR,
    p_product_type_id UUID
) RETURNS VOID AS $$
DECLARE
    thickness_value VARCHAR;
    wood_value VARCHAR;
    attr_id UUID;
    value_id UUID;
BEGIN
    -- Извличане на дебелина (8mm, 10mm, etc.)
    thickness_value := (regexp_matches(p_product_name, '(\d+)mm', 'i'))[1];
    IF thickness_value IS NOT NULL THEN
        -- Намери атрибута "Дебелина"
        SELECT id INTO attr_id 
        FROM product_attributes 
        WHERE product_type_id = p_product_type_id 
        AND slug = 'thickness';
        
        -- Намери или създай стойността
        SELECT id INTO value_id 
        FROM attribute_values 
        WHERE attribute_id = attr_id 
        AND value_bg = thickness_value || 'mm';
        
        IF value_id IS NULL THEN
            INSERT INTO attribute_values (attribute_id, value_bg, value_en, slug)
            VALUES (attr_id, thickness_value || 'mm', thickness_value || 'mm', thickness_value || 'mm')
            RETURNING id INTO value_id;
        END IF;
        
        -- Свържи продукта с атрибута
        INSERT INTO product_attribute_values (product_id, attribute_id, value_id)
        VALUES (p_product_id, attr_id, value_id)
        ON CONFLICT DO NOTHING;
    END IF;
    
    -- Извличане на дървесина
    IF p_product_name ILIKE '%дъб%' OR p_product_name ILIKE '%oak%' THEN
        wood_value := 'oak';
    ELSIF p_product_name ILIKE '%ясен%' OR p_product_name ILIKE '%ash%' THEN
        wood_value := 'ash';
    ELSIF p_product_name ILIKE '%бук%' OR p_product_name ILIKE '%beech%' THEN
        wood_value := 'beech';
    ELSIF p_product_name ILIKE '%орех%' OR p_product_name ILIKE '%walnut%' THEN
        wood_value := 'walnut';
    END IF;
    
    IF wood_value IS NOT NULL THEN
        -- Намери атрибута "Дървесина"
        SELECT id INTO attr_id 
        FROM product_attributes 
        WHERE product_type_id = p_product_type_id 
        AND slug = 'wood-material';
        
        -- Намери стойността
        SELECT id INTO value_id 
        FROM attribute_values 
        WHERE attribute_id = attr_id 
        AND slug = wood_value;
        
        IF value_id IS NOT NULL THEN
            INSERT INTO product_attribute_values (product_id, attribute_id, value_id)
            VALUES (p_product_id, attr_id, value_id)
            ON CONFLICT DO NOTHING;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Приложете функцията към всички продукти
DO $$
DECLARE
    product_rec RECORD;
BEGIN
    FOR product_rec IN 
        SELECT id, name_bg, product_type_id 
        FROM products 
    LOOP
        PERFORM extract_and_assign_attributes(
            product_rec.id,
            product_rec.name_bg,
            product_rec.product_type_id
        );
    END LOOP;
END $$;
```

---

## 🖼️ 5. Миграция на изображения

### Стъпка 5.1: Копиране на файлове

```bash
# Създайте структура за новите файлове
mkdir -p uploads/products/images
mkdir -p uploads/products/documents

# Копирайте съществуващите изображения
# (адаптирайте пътищата според вашата структура)
cp -r old_system/product_images/* uploads/products/images/

# Преименувайте файловете ако е необходимо
cd uploads/products/images
for file in *; do
    if [[ "$file" == *" "* ]]; then
        mv "$file" "${file// /_}"
    fi
done
```

### Стъпка 5.2: Обновяване на базата данни

```sql
-- Ако имате таблица със стари URLs на изображения
INSERT INTO product_media (product_id, type, url, is_primary, sort_order)
SELECT 
    p.id as product_id,
    'image' as type,
    '/uploads/products/images/' || replace_spaces_with_underscores(oi.filename) as url,
    oi.is_primary,
    oi.sort_order
FROM old_images oi
JOIN products p ON p.sku = oi.product_code
WHERE oi.filename IS NOT NULL;

-- Функция за заместване на интервали
CREATE OR REPLACE FUNCTION replace_spaces_with_underscores(input_text VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    RETURN REPLACE(input_text, ' ', '_');
END;
$$ LANGUAGE plpgsql;
```

---

## ✅ 6. Валидация и тестване

### Стъпка 6.1: Проверки за целостност

```sql
-- Проверка за продукти без тип
SELECT COUNT(*) as products_without_type
FROM products 
WHERE product_type_id IS NULL;

-- Проверка за продукти без производител
SELECT COUNT(*) as products_without_manufacturer
FROM products 
WHERE manufacturer_id IS NULL;

-- Проверка за дублирани SKU
SELECT sku, COUNT(*) as count
FROM products 
WHERE sku IS NOT NULL
GROUP BY sku 
HAVING COUNT(*) > 1;

-- Статистика по типове
SELECT 
    pt.name_bg,
    COUNT(p.id) as product_count,
    COUNT(pav.id) as attributes_count
FROM product_types pt
LEFT JOIN products p ON pt.id = p.product_type_id
LEFT JOIN product_attribute_values pav ON p.id = pav.product_id
GROUP BY pt.id, pt.name_bg
ORDER BY product_count DESC;
```

### Стъпка 6.2: Тестване на функционалност

```sql
-- Тест за търсене на продукти
SELECT 
    p.name_bg,
    pt.name_bg as type_name,
    m.name as manufacturer_name,
    array_agg(av.value_bg) as attributes
FROM products p
JOIN product_types pt ON p.product_type_id = pt.id
JOIN manufacturers m ON p.manufacturer_id = m.id
LEFT JOIN product_attribute_values pav ON p.id = pav.product_id
LEFT JOIN attribute_values av ON pav.value_id = av.id
WHERE p.name_bg ILIKE '%дъб%'
GROUP BY p.id, p.name_bg, pt.name_bg, m.name
LIMIT 5;
```

---

## 🧹 7. Почистване

### Стъпка 7.1: Премахване на временни данни

```sql
-- Изтрийте временните таблици
DROP TABLE IF EXISTS category_mapping;
DROP FUNCTION IF EXISTS extract_and_assign_attributes;
DROP FUNCTION IF EXISTS replace_spaces_with_underscores;

-- Актуализирайте статистиките на базата данни
ANALYZE;
```

### Стъпка 7.2: Финални оптимизации

```sql
-- Създайте допълнителни индекси ако е необходимо
CREATE INDEX CONCURRENTLY idx_products_name_search 
ON products USING gin(to_tsvector('bulgarian', name_bg));

-- Обновете статистиките
VACUUM ANALYZE products;
VACUUM ANALYZE product_attribute_values;
```

---

## 📊 8. Отчет за миграцията

### Генериране на отчет

```sql
-- Създайте отчет за миграцията
SELECT 
    'Общо продукти' as metric,
    COUNT(*)::text as value
FROM products

UNION ALL

SELECT 
    'Производители' as metric,
    COUNT(*)::text as value
FROM manufacturers

UNION ALL

SELECT 
    'Типове продукти' as metric,
    COUNT(*)::text as value
FROM product_types

UNION ALL

SELECT 
    'Общо атрибути' as metric,
    COUNT(*)::text as value
FROM product_attributes

UNION ALL

SELECT 
    'Продукти с атрибути' as metric,
    COUNT(DISTINCT product_id)::text as value
FROM product_attribute_values

UNION ALL

SELECT 
    'Изображения' as metric,
    COUNT(*)::text as value
FROM product_media
WHERE type = 'image';
```

---

## 🚨 Troubleshooting

### Чести проблеми и решения

**Проблем**: Дублирани производители
```sql
-- Намерете дубликати
SELECT name, COUNT(*) 
FROM manufacturers 
GROUP BY name 
HAVING COUNT(*) > 1;

-- Merge дубликати
UPDATE products SET manufacturer_id = 'correct_id' 
WHERE manufacturer_id = 'duplicate_id';
DELETE FROM manufacturers WHERE id = 'duplicate_id';
```

**Проблем**: Липсващи атрибути
```sql
-- Намерете продукти без атрибути
SELECT p.name_bg, pt.name_bg as type
FROM products p
JOIN product_types pt ON p.product_type_id = pt.id
LEFT JOIN product_attribute_values pav ON p.id = pav.product_id
WHERE pav.id IS NULL;
```

**Проблем**: Невалидни URLs на изображения
```sql
-- Проверете липсващи файлове
SELECT url FROM product_media WHERE type = 'image' 
AND NOT EXISTS (
    SELECT 1 FROM pg_stat_file('/path/to/uploads' || url)
);
```

---

## 📋 Финален Checklist

### След миграцията проверете:

- [ ] Всички продукти са мигрирани успешно
- [ ] Производителите са правилно свързани
- [ ] Атрибутите са правилно извлечени и присвоени
- [ ] Изображенията са достъпни
- [ ] API endpoints работят правилно
- [ ] Търсенето функционира
- [ ] Филтрирането по атрибути работи
- [ ] Backup на старите данни е направен
- [ ] Документацията е актуализирана

### Готово! 🎉

Миграцията е завършена. Новата система с динамични атрибути е готова за използване.