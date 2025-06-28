-- =============================================
-- PARKETSENSE - МОДУЛ ПОРЪЧКИ
-- Database Schema
-- =============================================

-- Основна таблица за поръчки
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    
    -- Връзки
    variant_id UUID NOT NULL REFERENCES offer_variants(id),
    client_id UUID NOT NULL REFERENCES clients(id),
    project_id UUID NOT NULL REFERENCES projects(id),
    phase_id UUID NOT NULL REFERENCES project_phases(id),
    
    -- Основна информация
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    
    -- Тристепенен статус според PARKETSENSE логиката
    info_status ENUM('not_confirmed', 'confirmed') DEFAULT 'not_confirmed',
    payment_status ENUM('not_paid', 'advance_paid', 'fully_paid') DEFAULT 'not_paid',
    delivery_status ENUM('pending', 'partial', 'completed') DEFAULT 'pending',
    
    -- Статус метаданни (за показване на последния обновен)
    last_status_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_status_type ENUM('info', 'payment', 'delivery') DEFAULT 'info',
    
    -- Оригинални данни от варианта (запазват се при създаване)
    original_total_amount_bgn DECIMAL(12,2) NOT NULL,
    original_total_amount_eur DECIMAL(12,2),
    original_quantity_sqm DECIMAL(10,3),
    original_quantity_lm DECIMAL(10,3),
    original_unit_price_eur DECIMAL(10,2),
    original_total_price_eur DECIMAL(10,2),
    
    -- Актуални данни (за окончателна фактура и печалба)
    current_total_amount_bgn DECIMAL(12,2) NOT NULL,
    current_total_amount_eur DECIMAL(12,2),
    current_quantity_sqm DECIMAL(10,3), -- за окончателна фактура
    current_quantity_lm DECIMAL(10,3),  -- за окончателна фактура
    current_unit_price_eur DECIMAL(10,2), -- за изчисляване на печалба
    current_total_price_eur DECIMAL(10,2), -- за изчисляване на печалба
    
    -- Изчислени полета за печалба
    profit_amount_eur DECIMAL(10,2), -- current_total_amount_eur - current_total_price_eur
    profit_percentage DECIMAL(5,2),  -- (profit_amount_eur / current_total_amount_eur) * 100
    
    -- Финансова информация
    advance_amount_bgn DECIMAL(12,2),
    advance_percent DECIMAL(5,2) DEFAULT 70.00,
    paid_amount_bgn DECIMAL(12,2) DEFAULT 0,
    remaining_amount_bgn DECIMAL(12,2),
    
    -- Доставка
    delivery_address TEXT,
    delivery_notes TEXT,
    delivery_contact_name VARCHAR(200),
    delivery_contact_phone VARCHAR(20),
    
    -- Документи и файлове
    confirmation_document_url VARCHAR(500),
    attachment_file_url VARCHAR(500),
    attachment_filename VARCHAR(255),
    
    -- Специални условия
    special_conditions TEXT,
    internal_notes TEXT,
    additional_info TEXT, -- Допълнителна информация за поръчката
    
    -- Email логика
    confirmation_email_sent BOOLEAN DEFAULT FALSE,
    confirmation_email_sent_at TIMESTAMP,
    confirmation_email_recipient VARCHAR(255),
    
    -- Мета данни
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Поръчки към производители/доставчици
CREATE TABLE supplier_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    supplier_id UUID REFERENCES suppliers(id),
    manufacturer_id UUID REFERENCES manufacturers(id),
    
    -- Информация за поръчката
    supplier_order_number VARCHAR(100),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    
    -- Статус
    status ENUM('draft', 'sent', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled') DEFAULT 'draft',
    
    -- Данни от производителя
    manufacturer_order_number VARCHAR(100),
    expected_delivery_date_manufacturer DATE,
    
    -- Суми
    total_amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0,
    
    -- Контактна информация
    contact_person VARCHAR(200),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    
    -- Мета данни
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP,
    delivered_at TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Продукти в поръчки към доставчици
CREATE TABLE supplier_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    supplier_order_id UUID NOT NULL REFERENCES supplier_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    
    -- Количества
    ordered_quantity DECIMAL(10,3) NOT NULL,
    delivered_quantity DECIMAL(10,3) DEFAULT 0,
    unit_price_bgn DECIMAL(10,2) NOT NULL,
    unit_price_eur DECIMAL(10,2),
    line_total_bgn DECIMAL(12,2) NOT NULL,
    
    -- Статус на артикула
    item_status ENUM('pending', 'confirmed', 'in_production', 'shipped', 'delivered') DEFAULT 'pending',
    
    -- Мета данни
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- История на статусите
CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Статус промяна
    status_type ENUM('info_status', 'payment_status', 'delivery_status') NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    
    -- Детайли
    notes TEXT,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Плащания по поръчки
CREATE TABLE order_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Тип плащане
    payment_type ENUM('advance', 'final', 'partial') NOT NULL,
    payment_method ENUM('bank_transfer', 'cash', 'card', 'check') DEFAULT 'bank_transfer',
    
    -- Сума
    amount_bgn DECIMAL(12,2) NOT NULL,
    amount_eur DECIMAL(12,2),
    
    -- Дата и референции
    payment_date DATE NOT NULL,
    reference_number VARCHAR(100),
    bank_reference VARCHAR(100),
    swift_file_url VARCHAR(500),
    
    -- Статус
    status ENUM('pending', 'confirmed', 'failed') DEFAULT 'pending',
    
    -- Бележки и допълнителна информация
    notes TEXT,
    additional_info VARCHAR(500), -- Допълнителна информация (авансово, финално, доплащане и т.н.)
    
    -- Мета данни
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Доставки (може да има множество доставки за една поръчка)
CREATE TABLE order_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    
    -- Информация за доставката
    delivery_number VARCHAR(100),
    delivery_date DATE NOT NULL,
    delivery_address TEXT,
    transport_company VARCHAR(255),
    
    -- Количества
    delivered_quantity_sqm DECIMAL(10,2),
    delivered_packages INT,
    
    -- Статус
    status ENUM('scheduled', 'in_transit', 'delivered', 'failed') DEFAULT 'scheduled',
    
    -- Допълнителна информация
    tracking_number VARCHAR(100),
    delivery_notes TEXT,
    received_by VARCHAR(200),
    
    -- Мета данни
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Документи за доставки
CREATE TABLE delivery_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    delivery_id UUID NOT NULL REFERENCES order_deliveries(id) ON DELETE CASCADE,
    
    -- Информация за документа
    document_number VARCHAR(100),
    document_type ENUM('delivery_note', 'invoice', 'certificate', 'other') NOT NULL,
    document_url VARCHAR(500),
    filename VARCHAR(255),
    
    -- Мета данни
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by UUID REFERENCES users(id)
);

-- Индекси за оптимизация
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_project ON orders(project_id);
CREATE INDEX idx_orders_variant ON orders(variant_id);
CREATE INDEX idx_orders_date ON orders(order_date);
CREATE INDEX idx_orders_status_composite ON orders(info_status, payment_status, delivery_status);
CREATE INDEX idx_orders_last_status ON orders(last_status_update, last_status_type);

CREATE INDEX idx_supplier_orders_order ON supplier_orders(order_id);
CREATE INDEX idx_supplier_orders_supplier ON supplier_orders(supplier_id);
CREATE INDEX idx_supplier_orders_manufacturer ON supplier_orders(manufacturer_id);
CREATE INDEX idx_supplier_orders_status ON supplier_orders(status);

CREATE INDEX idx_order_payments_order ON order_payments(order_id);
CREATE INDEX idx_order_payments_date ON order_payments(payment_date);
CREATE INDEX idx_order_payments_type ON order_payments(payment_type);

CREATE INDEX idx_order_deliveries_order ON order_deliveries(order_id);
CREATE INDEX idx_order_deliveries_date ON order_deliveries(delivery_date);

-- Функция за автоматично обновяване на последния статус
CREATE OR REPLACE FUNCTION update_order_last_status() 
RETURNS TRIGGER AS $$
BEGIN
    -- Обновяване на last_status метаданните при промяна на статус
    IF OLD.info_status != NEW.info_status THEN
        NEW.last_status_update = CURRENT_TIMESTAMP;
        NEW.last_status_type = 'info';
    ELSIF OLD.payment_status != NEW.payment_status THEN
        NEW.last_status_update = CURRENT_TIMESTAMP;
        NEW.last_status_type = 'payment';
    ELSIF OLD.delivery_status != NEW.delivery_status THEN
        NEW.last_status_update = CURRENT_TIMESTAMP;
        NEW.last_status_type = 'delivery';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Тригър за автоматично обновяване на последния статус
CREATE TRIGGER trigger_update_order_last_status
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_order_last_status();

-- Функция за автоматично пресмятане на остатъчната сума и печалба
CREATE OR REPLACE FUNCTION calculate_order_amounts() 
RETURNS TRIGGER AS $
BEGIN
    -- Изчисляване на остатъчната сума
    NEW.remaining_amount_bgn = NEW.current_total_amount_bgn - COALESCE(NEW.paid_amount_bgn, 0);
    
    -- Изчисляване на печалбата в EUR
    IF NEW.current_total_amount_eur IS NOT NULL AND NEW.current_total_price_eur IS NOT NULL THEN
        NEW.profit_amount_eur = NEW.current_total_amount_eur - NEW.current_total_price_eur;
        
        -- Изчисляване на процент печалба
        IF NEW.current_total_amount_eur > 0 THEN
            NEW.profit_percentage = (NEW.profit_amount_eur / NEW.current_total_amount_eur) * 100;
        ELSE
            NEW.profit_percentage = 0;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Тригър за автоматично пресмятане на остатъчната сума и печалба
CREATE TRIGGER trigger_calculate_order_amounts
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION calculate_order_amounts();

-- View за списъка с поръчки (показва последният актуален статус)
CREATE VIEW orders_list_view AS
SELECT 
    o.id,
    o.order_number,
    o.order_date,
    o.expected_delivery_date,
    o.actual_delivery_date,
    
    -- Проектна информация
    p.name as project_name,
    ph.name as phase_name,
    ov.name as variant_name,
    c.first_name || ' ' || c.last_name as client_name,
    
    -- Последният обновен статус (приоритет: delivery > payment > info)
    CASE 
        WHEN o.last_status_type = 'delivery' THEN 
            CASE o.delivery_status
                WHEN 'pending' THEN 'ОЧАКВАМЕ'
                WHEN 'partial' THEN 'ЧАСТИЧНО'
                WHEN 'completed' THEN 'ДОСТАВЕНА'
            END
        WHEN o.last_status_type = 'payment' OR (o.last_status_type = 'info' AND o.payment_status != 'not_paid') THEN
            CASE o.payment_status
                WHEN 'not_paid' THEN 'НЕПЛАТЕНА'
                WHEN 'advance_paid' THEN 'ЧАСТИЧНО ПЛАТЕНА'
                WHEN 'fully_paid' THEN 'НАПЪЛНО ПЛАТЕНА'
            END
        ELSE
            CASE o.info_status
                WHEN 'not_confirmed' THEN 'НЕПОТВЪРДЕНА'
                WHEN 'confirmed' THEN 'ПОТВЪРДЕНА'
            END
    END as display_status,
    
    -- Всички статуси
    o.info_status,
    o.payment_status,
    o.delivery_status,
    o.last_status_update,
    o.last_status_type,
    
    -- Финансова информация
    o.current_total_amount_bgn,
    o.paid_amount_bgn,
    o.remaining_amount_bgn,
    o.profit_amount_eur,
    o.profit_percentage,
    
    -- Количества за фактуриране
    o.current_quantity_sqm,
    o.current_quantity_lm,
    
    -- Доставчик (вземаме от първия supplier order)
    so.supplier_id,
    s.name as supplier_name,
    m.name as manufacturer_name,
    
    o.created_at,
    o.updated_at

FROM orders o
LEFT JOIN offer_variants ov ON o.variant_id = ov.id
LEFT JOIN project_phases ph ON o.phase_id = ph.id
LEFT JOIN projects p ON o.project_id = p.id
LEFT JOIN clients c ON o.client_id = c.id
LEFT JOIN supplier_orders so ON o.id = so.order_id AND so.id = (
    SELECT MIN(id) FROM supplier_orders WHERE order_id = o.id
)
LEFT JOIN suppliers s ON so.supplier_id = s.id
LEFT JOIN manufacturers m ON so.manufacturer_id = m.id

ORDER BY o.last_status_update DESC;