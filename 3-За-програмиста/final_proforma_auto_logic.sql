-- Подобрена функция за изчисляване на окончателна сума
-- Автоматично намира и отчита ВСИЧКИ фактури в потока
CREATE OR REPLACE FUNCTION calculate_variant_invoice_flow(
    p_variant_id UUID
) RETURNS TABLE (
    total_variant_value DECIMAL(12,2),
    advance_amount DECIMAL(12,2),
    interim_amount DECIMAL(12,2), 
    credit_amount DECIMAL(12,2),
    remaining_amount DECIMAL(12,2),
    currency invoice_currency_enum,
    flow_summary JSONB,
    can_create_final BOOLEAN,
    validation_message TEXT
) AS $
DECLARE
    v_advance_data record;
    v_advance_amount DECIMAL(12,2) := 0;
    v_interim_amount DECIMAL(12,2) := 0;
    v_credit_amount DECIMAL(12,2) := 0;
    v_total_variant_value DECIMAL(12,2) := 0;
    v_currency invoice_currency_enum;
    v_flow_summary JSONB := '{}';
    v_can_create_final BOOLEAN := false;
    v_validation_message TEXT := '';
    v_invoice record;
    v_advance_invoices JSONB := '[]';
    v_interim_invoices JSONB := '[]';
    v_credit_notes JSONB := '[]';
    v_final_proformas JSONB := '[]';
BEGIN
    -- 1. Намиране на първата (основната) авансова фактура
    SELECT * INTO v_advance_data
    FROM find_advance_invoice_for_variant(p_variant_id)
    LIMIT 1;
    
    IF NOT FOUND THEN
        v_validation_message := 'Не е намерена авансова фактура за този вариант';
        v_can_create_final := false;
    ELSE
        -- 2. Изчисляване на общата стойност на варианта (от авансовата)
        SELECT COALESCE(SUM(ii.subtotal), 0)
        INTO v_total_variant_value
        FROM invoice_items ii
        WHERE ii.invoice_id = v_advance_data.advance_invoice_id;
        
        v_currency := v_advance_data.currency;
        
        -- 3. Събиране на ВСИЧКИ авансови фактури
        FOR v_invoice IN
            SELECT i.*, 
                   (i.status = 'paid' OR i.status = 'original_generated') as is_paid
            FROM invoices i
            WHERE i.variant_id = p_variant_id
              AND i.invoice_category = 'proforma'
              AND i.invoice_type = 'advance'
            ORDER BY i.created_at ASC
        LOOP
            v_advance_invoices := v_advance_invoices || jsonb_build_object(
                'id', v_invoice.id,
                'number', v_invoice.invoice_number,
                'amount', v_invoice.total_amount,
                'is_paid', v_invoice.is_paid,
                'created_at', v_invoice.created_at
            );
            
            IF v_invoice.is_paid THEN
                v_advance_amount := v_advance_amount + v_invoice.total_amount;
            END IF;
        END LOOP;
        
        -- 4. Събиране на ВСИЧКИ междинни фактури
        FOR v_invoice IN
            SELECT i.*, 
                   (i.status = 'paid' OR i.status = 'original_generated') as is_paid
            FROM invoices i
            WHERE i.variant_id = p_variant_id
              AND i.invoice_category = 'proforma'
              AND i.invoice_type = 'interim'
            ORDER BY i.created_at ASC
        LOOP
            v_interim_invoices := v_interim_invoices || jsonb_build_object(
                'id', v_invoice.id,
                'number', v_invoice.invoice_number,
                'amount', v_invoice.total_amount,
                'is_paid', v_invoice.is_paid,
                'created_at', v_invoice.created_at
            );
            
            IF v_invoice.is_paid THEN
                v_interim_amount := v_interim_amount + v_invoice.total_amount;
            END IF;
        END LOOP;
        
        -- 5. Събиране на ВСИЧКИ кредитни известия
        FOR v_invoice IN
            SELECT i.*
            FROM invoices i
            WHERE i.variant_id = p_variant_id
              AND i.invoice_category = 'credit_note'
              AND i.status = 'sent'
            ORDER BY i.created_at ASC
        LOOP
            v_credit_notes := v_credit_notes || jsonb_build_object(
                'id', v_invoice.id,
                'number', v_invoice.invoice_number,
                'amount', ABS(v_invoice.total_amount),
                'created_at', v_invoice.created_at,
                'reason', v_invoice.notes
            );
            
            v_credit_amount := v_credit_amount + ABS(v_invoice.total_amount);
        END LOOP;
        
        -- 6. Проверка за съществуващи окончателни проформи
        FOR v_invoice IN
            SELECT i.*
            FROM invoices i
            WHERE i.variant_id = p_variant_id
              AND i.invoice_category = 'proforma'
              AND i.invoice_type = 'final'
            ORDER BY i.created_at ASC
        LOOP
            v_final_proformas := v_final_proformas || jsonb_build_object(
                'id', v_invoice.id,
                'number', v_invoice.invoice_number,
                'amount', v_invoice.total_amount,
                'status', v_invoice.status,
                'created_at', v_invoice.created_at
            );
        END LOOP;
        
        -- 7. Валидация за създаване на окончателна проформа
        IF jsonb_array_length(v_final_proformas) > 0 THEN
            v_validation_message := 'Вече съществува окончателна проформа за този вариант';
            v_can_create_final := false;
        ELSIF NOT v_advance_data.is_paid THEN
            v_validation_message := 'Авансовата фактура още не е платена';
            v_can_create_final := false;
        ELSIF (v_total_variant_value - v_advance_amount - v_interim_amount + v_credit_amount) <= 0 THEN
            v_validation_message := 'Няма остатъчна сума за окончателна фактура';
            v_can_create_final := false;
        ELSE
            v_validation_message := 'Готово за създаване на окончателна проформа';
            v_can_create_final := true;
        END IF;
        
        -- 8. Изграждане на обобщението на потока
        v_flow_summary := jsonb_build_object(
            'advance_invoices', v_advance_invoices,
            'interim_invoices', v_interim_invoices,
            'credit_notes', v_credit_notes,
            'final_proformas', v_final_proformas,
            'totals', jsonb_build_object(
                'variant_value', v_total_variant_value,
                'paid_advances', v_advance_amount,
                'paid_interims', v_interim_amount,
                'credits_applied', v_credit_amount,
                'remaining_amount', v_total_variant_value - v_advance_amount - v_interim_amount + v_credit_amount
            )
        );
    END IF;
    
    -- Връщане на резултата
    RETURN QUERY
    SELECT 
        v_total_variant_value,
        v_advance_amount,
        v_interim_amount,
        v_credit_amount,
        v_total_variant_value - v_advance_amount - v_interim_amount + v_credit_amount,
        v_currency,
        v_flow_summary,
        v_can_create_final,
        v_validation_message;
END;
$ LANGUAGE plpgsql;

-- Подобрена функция за създаване на окончателна проформа
-- Автоматично наследява от първата авансова и отчита всички фактури
CREATE OR REPLACE FUNCTION create_final_proforma_smart(
    p_variant_id UUID,
    p_user_id UUID,
    p_override_items BOOLEAN DEFAULT false,
    p_custom_items JSONB DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS JSONB AS $
DECLARE
    v_flow_data record;
    v_advance_data record;
    v_final_proforma_id UUID;
    v_proforma_number VARCHAR(50);
    v_item record;
    v_sort_order INTEGER := 0;
    v_result JSONB;
BEGIN
    -- 1. Анализ на пълния поток от фактури
    SELECT * INTO v_flow_data
    FROM calculate_variant_invoice_flow(p_variant_id)
    LIMIT 1;
    
    -- 2. Валидация
    IF NOT v_flow_data.can_create_final THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', v_flow_data.validation_message,
            'flow_summary', v_flow_data.flow_summary
        );
    END IF;
    
    -- 3. Намиране на авансовата фактура за наследяване на данни
    SELECT * INTO v_advance_data
    FROM find_advance_invoice_for_variant(p_variant_id)
    LIMIT 1;
    
    -- 4. Генериране на номер за проформата
    v_proforma_number := generate_invoice_number(v_advance_data.company_id, 'proforma');
    
    -- 5. Създаване на окончателната проформа
    INSERT INTO invoices (
        invoice_number,
        invoice_category,
        invoice_type,
        company_id,
        client_id,
        variant_id,
        advance_invoice_id,
        billing_name,
        billing_company_name,
        billing_eik_bulstat,
        billing_address,
        billing_mol,
        currency,
        subtotal,
        vat_percent,
        vat_amount,
        total_amount,
        description,
        notes,
        status,
        created_by,
        metadata
    ) VALUES (
        v_proforma_number,
        'proforma',
        'final',
        v_advance_data.company_id, -- НАСЛЕДЕНО
        v_advance_data.client_id,  -- НАСЛЕДЕНО
        p_variant_id,
        v_advance_data.advance_invoice_id,
        v_advance_data.billing_name,      -- НАСЛЕДЕНО
        v_advance_data.billing_company_name, -- НАСЛЕДЕНО
        v_advance_data.billing_eik_bulstat,  -- НАСЛЕДЕНО
        v_advance_data.billing_address,      -- НАСЛЕДЕНО
        v_advance_data.billing_mol,          -- НАСЛЕДЕНО
        v_flow_data.currency,                -- НАСЛЕДЕНО
        v_flow_data.remaining_amount,
        20.00, -- VAT percent (може да се наследи от авансовата)
        v_flow_data.remaining_amount * 0.20,
        v_flow_data.remaining_amount * 1.20,
        COALESCE(p_notes, 'Окончателна проформа - автоматично отчитане'),
        'Автоматично отчетени фактури: ' || (v_flow_data.flow_summary->>'totals'),
        'draft',
        p_user_id,
        jsonb_build_object(
            'auto_generated', true,
            'source_flow', v_flow_data.flow_summary,
            'inherited_from_advance', v_advance_data.advance_invoice_id
        )
    ) RETURNING id INTO v_final_proforma_id;
    
    -- 6. Добавяне на позициите
    IF p_override_items AND p_custom_items IS NOT NULL THEN
        -- Ръчно въведени позиции
        FOR v_item IN
            SELECT * FROM jsonb_to_recordset(p_custom_items) AS x(
                product_id UUID,
                quantity DECIMAL(10,3),
                unit_price DECIMAL(10,2),
                description TEXT
            )
        LOOP
            v_sort_order := v_sort_order + 1;
            INSERT INTO invoice_items (
                invoice_id,
                product_id,
                quantity,
                unit_price,
                subtotal,
                sort_order,
                description
            ) VALUES (
                v_final_proforma_id,
                v_item.product_id,
                v_item.quantity,
                v_item.unit_price,
                v_item.quantity * v_item.unit_price,
                v_sort_order,
                v_item.description
            );
        END LOOP;
    ELSE
        -- Автоматично копиране на позиции от авансовата фактура
        -- (адаптирани спрямо доставеното количество)
        INSERT INTO invoice_items (
            invoice_id,
            product_id,
            quantity,
            unit_price,
            subtotal,
            sort_order,
            description
        )
        SELECT 
            v_final_proforma_id,
            ii.product_id,
            -- Използваме доставеното количество ако има, иначе оригиналното
            COALESCE(delivered_qty.total_delivered, ii.quantity) as quantity,
            ii.unit_price,
            COALESCE(delivered_qty.total_delivered, ii.quantity) * ii.unit_price,
            ii.sort_order,
            ii.description || 
            CASE 
                WHEN delivered_qty.total_delivered IS NOT NULL AND delivered_qty.total_delivered != ii.quantity 
                THEN ' (доставено: ' || delivered_qty.total_delivered || ')'
                ELSE ''
            END
        FROM invoice_items ii
        LEFT JOIN (
            -- Изчисляване на доставеното количество по продукт
            SELECT 
                oi.product_id,
                SUM(od.delivered_quantity) as total_delivered
            FROM order_items oi
            JOIN order_deliveries od ON oi.order_id = od.order_id 
                AND oi.product_id = od.product_id
            JOIN orders o ON oi.order_id = o.id
            WHERE o.variant_id = p_variant_id
              AND od.status = 'delivered'
            GROUP BY oi.product_id
        ) delivered_qty ON ii.product_id = delivered_qty.product_id
        WHERE ii.invoice_id = v_advance_data.advance_invoice_id
        ORDER BY ii.sort_order;
    END IF;
    
    -- 7. Връщане на резултата
    v_result := jsonb_build_object(
        'success', true,
        'final_proforma_id', v_final_proforma_id,
        'invoice_number', v_proforma_number,
        'remaining_amount', v_flow_data.remaining_amount,
        'flow_summary', v_flow_data.flow_summary,
        'inherited_data', jsonb_build_object(
            'company_id', v_advance_data.company_id,
            'client_id', v_advance_data.client_id,
            'currency', v_flow_data.currency,
            'billing_name', v_advance_data.billing_name
        )
    );
    
    RETURN v_result;
END;
$ LANGUAGE plpgsql;

-- Нов API endpoint (в коментар за приложение във фронтенда)
/*
POST /api/invoices/variant/:variant_id/proforma/final/smart
Body: {
    override_items?: boolean,
    custom_items?: array,
    notes?: string
}

Response: {
    success: boolean,
    final_proforma_id?: UUID,
    invoice_number?: string,
    remaining_amount?: number,
    flow_summary: {
        advance_invoices: [...],
        interim_invoices: [...], 
        credit_notes: [...],
        final_proformas: [...],
        totals: {
            variant_value: number,
            paid_advances: number,
            paid_interims: number,
            credits_applied: number,
            remaining_amount: number
        }
    },
    inherited_data: {
        company_id: UUID,
        client_id: UUID,
        currency: string,
        billing_name: string
    },
    error?: string
}
*/