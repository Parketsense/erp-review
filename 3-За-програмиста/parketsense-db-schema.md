# PARKETSENSE ERP - Database Schema

## Модул "Потребители и права"

### Таблица: `users`
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('admin', 'manager', 'user') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица: `user_permissions`
```sql
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    module VARCHAR(50) NOT NULL, -- 'clients', 'products', 'offers', etc.
    can_view BOOLEAN DEFAULT TRUE,
    can_create BOOLEAN DEFAULT FALSE,
    can_edit BOOLEAN DEFAULT FALSE,
    can_delete BOOLEAN DEFAULT FALSE,
    UNIQUE(user_id, module)
);
```

## Модул "Клиенти"

### Таблица: `clients`
```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Основни данни (винаги се попълват)
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20), -- Не е задължителен
    email VARCHAR(100),
    address TEXT,
    
    -- Фирмени данни (опционални - може да се добавят по-късно)
    has_company BOOLEAN DEFAULT FALSE,
    company_name VARCHAR(200),
    eik_bulstat VARCHAR(20) UNIQUE,
    vat_number VARCHAR(20),
    company_address TEXT,
    company_phone VARCHAR(20),
    company_email VARCHAR(100),
    
    -- Архитект/Дизайнер
    is_architect BOOLEAN DEFAULT FALSE,
    commission_percent DECIMAL(5,2) DEFAULT 10.00,
    
    -- Метаданни
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    deleted_at TIMESTAMP, -- Soft delete
    deleted_by UUID REFERENCES users(id),
    
    -- Индекси
    INDEX idx_name (first_name, last_name),
    INDEX idx_phone (phone),
    INDEX idx_email (email),
    INDEX idx_company_name (company_name),
    INDEX idx_eik (eik_bulstat),
    INDEX idx_is_architect (is_architect),
    INDEX idx_deleted (deleted_at)
);
```

### Таблица: `audit_log` (за история на промените)
```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    action ENUM('create', 'update', 'delete') NOT NULL,
    old_values JSON,
    new_values JSON,
    changed_fields TEXT[], -- Масив с имената на променените полета
    user_id UUID REFERENCES users(id),
    user_ip VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Индекси
    INDEX idx_table_record (table_name, record_id),
    INDEX idx_user (user_id),
    INDEX idx_created (created_at)
);
```

### Тригер за автоматичен audit log
```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $
BEGIN
    INSERT INTO audit_log (
        table_name,
        record_id,
        action,
        old_values,
        new_values,
        changed_fields,
        user_id
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END,
        CASE 
            WHEN TG_OP = 'UPDATE' THEN 
                ARRAY(SELECT jsonb_object_keys(to_jsonb(NEW) - to_jsonb(OLD)))
            ELSE NULL 
        END,
        current_setting('app.current_user_id', true)::UUID
    );
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Прилагане на тригера към таблицата clients
CREATE TRIGGER clients_audit_trigger
AFTER INSERT OR UPDATE OR DELETE ON clients
FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

### Таблица: `projects`
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    name VARCHAR(200) NOT NULL,
    project_type ENUM('apartment', 'house', 'office', 'other'),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);
```

### Таблица: `project_contacts`
```sql
CREATE TABLE project_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    position VARCHAR(100),
    receives_offers BOOLEAN DEFAULT TRUE,
    receives_invoices BOOLEAN DEFAULT TRUE,
    is_primary BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Индекси
    INDEX idx_project (project_id),
    INDEX idx_email (email)
);
```

## Модул "Продукти"

### Таблица: `manufacturers`
```sql
CREATE TABLE manufacturers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL UNIQUE,
    country VARCHAR(100),
    discount_percent DECIMAL(5,2) DEFAULT 0,
    contact_info JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица: `collections`
```sql
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manufacturer_id UUID REFERENCES manufacturers(id),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(manufacturer_id, name)
);
```

### Таблица: `products`
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- Йерархия
    manufacturer_id UUID REFERENCES manufacturers(id),
    collection_id UUID REFERENCES collections(id),
    
    -- Основни данни
    name_bg VARCHAR(500) NOT NULL,
    name_en VARCHAR(500) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    product_type ENUM('flooring', 'furniture', 'wall_covering', 'glass', 'decoration', 'door', 'service'),
    
    -- Параметри (JSON за гъвкавост)
    parameters JSON, -- {color, size, thickness, material, finish, etc.}
    
    -- Цени
    purchase_price_eur DECIMAL(10,2),
    purchase_price_bgn DECIMAL(10,2),
    sale_price_eur DECIMAL(10,2),
    sale_price_bgn DECIMAL(10,2),
    
    -- Други
    unit_of_measure VARCHAR(20) DEFAULT 'кв.м.',
    min_order_quantity DECIMAL(10,2),
    lead_time_days INT,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Метаданни
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Индекси
    INDEX idx_manufacturer (manufacturer_id),
    INDEX idx_collection (collection_id),
    INDEX idx_product_type (product_type),
    INDEX idx_sku (sku),
    FULLTEXT idx_search (name_bg, name_en)
);
```

### Таблица: `product_images`
```sql
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Модул "Оферти"

### Таблица: `projects`
```sql
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id),
    name VARCHAR(200) NOT NULL,
    project_type ENUM('apartment', 'house', 'office', 'other'),
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);
```

### Таблица: `project_phases`
```sql
CREATE TABLE project_phases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    sort_order INT DEFAULT 0,
    status ENUM('created', 'offered', 'won', 'lost') DEFAULT 'created',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица: `offer_variants`
```sql
CREATE TABLE offer_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id UUID REFERENCES project_phases(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    designer_id UUID REFERENCES clients(id), -- Architect/Designer
    is_active BOOLEAN DEFAULT TRUE,
    is_selected BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    selected_at TIMESTAMP,
    confirmed_at TIMESTAMP,
    confirmed_by UUID REFERENCES users(id)
);
```

### Таблица: `variant_rooms`
```sql
CREATE TABLE variant_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID REFERENCES offer_variants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    area_sqm DECIMAL(10,2),
    discount_percent DECIMAL(5,2) DEFAULT 0,
    waste_percent DECIMAL(5,2) DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица: `room_products`
```sql
CREATE TABLE room_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES variant_rooms(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    category ENUM('floor', 'wall', 'furniture', 'other'),
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    final_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    notes TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица: `variant_galleries`
```sql
CREATE TABLE variant_galleries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    variant_id UUID REFERENCES offer_variants(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    caption TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица: `offer_conditions`
```sql
CREATE TABLE offer_conditions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id UUID REFERENCES project_phases(id) ON DELETE CASCADE,
    conditions JSON, -- [{type: 'delivery', text: '...'}, {type: 'payment', text: '...'}]
    email_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица: `offer_communications`
```sql
CREATE TABLE offer_communications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phase_id UUID REFERENCES project_phases(id),
    communication_type ENUM('offer_sent', 'offer_viewed', 'variant_selected', 'reminder_sent'),
    recipient_email VARCHAR(200),
    jwt_token VARCHAR(500),
    snapshot_data JSON, -- Снимка на офертата в момента на изпращане
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    viewed_at TIMESTAMP,
    selected_variant_id UUID REFERENCES offer_variants(id)
);
```

## Модул "Поръчки"

### Таблица: `orders`
```sql
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    variant_id UUID REFERENCES offer_variants(id),
    manufacturer_id UUID REFERENCES manufacturers(id),
    
    -- Статуси
    info_status ENUM('not_confirmed', 'confirmed') DEFAULT 'not_confirmed',
    payment_status ENUM('not_paid', 'partial', 'paid') DEFAULT 'not_paid',
    delivery_status ENUM('pending', 'in_transit', 'delivered') DEFAULT 'pending',
    
    -- Данни от производителя
    manufacturer_order_number VARCHAR(100),
    expected_delivery_date DATE,
    
    -- Суми
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Метаданни
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    delivered_at TIMESTAMP
);
```

### Таблица: `order_items`
```sql
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    ordered_quantity DECIMAL(10,2) NOT NULL,
    delivered_quantity DECIMAL(10,2),
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL
);
```

### Таблица: `order_payments`
```sql
CREATE TABLE order_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    swift_file_url VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Индекси и оптимизации

```sql
-- Оптимизация за търсене на клиенти
CREATE INDEX idx_clients_search ON clients USING gin(
    to_tsvector('bulgarian', 
        coalesce(first_name, '') || ' ' || 
        coalesce(last_name, '') || ' ' || 
        coalesce(company_name, '')
    )
);

-- Оптимизация за продукти
CREATE INDEX idx_products_params ON products USING gin(parameters);

-- Оптимизация за статуси на поръчки
CREATE INDEX idx_orders_statuses ON orders(info_status, payment_status, delivery_status);
```