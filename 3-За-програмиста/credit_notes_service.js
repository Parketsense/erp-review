// /api/services/creditNotesService.js

const { v4: uuidv4 } = require('uuid');
const db = require('../database/connection');
const InvoiceSequenceService = require('./invoiceSequenceService');

class CreditNotesService {

  /**
   * Валидация на данните за кредитно известие
   */
  async validateCreditNoteData(data) {
    const { original_invoice_id, variant_id, mode, amount, items, reason } = data;
    const errors = [];

    try {
      // 1. Проверка на основните полета
      if (!original_invoice_id) {
        errors.push('Оригиналната фактура е задължителна');
      }

      if (!variant_id) {
        errors.push('Вариантът е задължителен');
      }

      if (!mode || !['amount', 'items'].includes(mode)) {
        errors.push('Режимът трябва да е "amount" или "items"');
      }

      if (!reason || reason.trim().length < 5) {
        errors.push('Причината трябва да е поне 5 символа');
      }

      // 2. Валидация според режима
      if (mode === 'amount') {
        if (!amount || amount <= 0) {
          errors.push('Сумата трябва да е положително число');
        }
      } else if (mode === 'items') {
        if (!items || !Array.isArray(items) || items.length === 0) {
          errors.push('Трябва да има поне един артикул за кредитиране');
        }

        // Валидация на всеки артикул
        items.forEach((item, index) => {
          if (!item.product_id) {
            errors.push(`Артикул ${index + 1}: липсва product_id`);
          }
          if (!item.quantity || item.quantity <= 0) {
            errors.push(`Артикул ${index + 1}: количеството трябва да е положително число`);
          }
          if (!item.reason || item.reason.trim().length < 3) {
            errors.push(`Артикул ${index + 1}: причината трябва да е поне 3 символа`);
          }
        });
      }

      if (errors.length > 0) {
        return {
          valid: false,
          message: 'Грешки във валидацията',
          errors
        };
      }

      // 3. Проверка на оригиналната фактура
      const originalInvoice = await this.getOriginalInvoice(original_invoice_id);
      if (!originalInvoice) {
        return {
          valid: false,
          message: 'Оригиналната фактура не е намерена'
        };
      }

      // 4. Проверка дали фактурата може да се кредитира
      if (originalInvoice.invoice_category !== 'original') {
        return {
          valid: false,
          message: 'Могат да се кредитират само оригинални фактури'
        };
      }

      if (originalInvoice.status === 'cancelled') {
        return {
          valid: false,
          message: 'Не може да се кредитира отменена фактура'
        };
      }

      // 5. Проверка за съществуващи кредитни известия
      const existingCredits = await this.getExistingCreditNotes(original_invoice_id);
      const totalCreditedAmount = existingCredits.reduce((sum, credit) => sum + credit.total_amount, 0);

      if (mode === 'amount') {
        if (totalCreditedAmount + amount > originalInvoice.total_amount) {
          return {
            valid: false,
            message: `Общата кредитирана сума (${totalCreditedAmount + amount}) не може да надвишава оригиналната фактура (${originalInvoice.total_amount})`
          };
        }
      }

      // 6. За items режим - проверка на количествата
      if (mode === 'items') {
        const originalItems = await this.getOriginalInvoiceItems(original_invoice_id);
        const creditedItems = await this.getCreditedItemsQuantities(original_invoice_id);

        for (const item of items) {
          const originalItem = originalItems.find(oi => oi.product_id === item.product_id);
          if (!originalItem) {
            return {
              valid: false,
              message: `Артикулът ${item.product_id} не съществува в оригиналната фактура`
            };
          }

          const alreadyCredited = creditedItems[item.product_id] || 0;
          if (alreadyCredited + item.quantity > originalItem.quantity) {
            return {
              valid: false,
              message: `За артикул ${originalItem.description}: общото кредитирано количество (${alreadyCredited + item.quantity}) не може да надвишава оригиналното (${originalItem.quantity})`
            };
          }
        }
      }

      return { valid: true };

    } catch (error) {
      console.error('Validation error:', error);
      return {
        valid: false,
        message: 'Възникна грешка при валидацията'
      };
    }
  }

  /**
   * Получаване на оригиналната фактура
   */
  async getOriginalInvoice(invoiceId) {
    const query = `
      SELECT i.*, c.name as client_name, p.name as project_name, v.name as variant_name
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN projects p ON i.project_id = p.id  
      LEFT JOIN variants v ON i.variant_id = v.id
      WHERE i.id = $1
    `;
    
    const result = await db.query(query, [invoiceId]);
    return result.rows[0];
  }

  /**
   * Изчисляване на сумите за кредитното известие
   */
  async calculateCreditAmounts(originalInvoice, creditData) {
    const { mode, amount, items } = creditData;
    
    let subtotal = 0;
    let vatAmount = 0;
    let totalAmount = 0;

    if (mode === 'amount') {
      // Директно използване на въведената сума
      totalAmount = amount;
      // Изчисляване на subtotal и VAT (обратно изчисление)
      const vatPercent = originalInvoice.vat_percent || 20;
      subtotal = totalAmount / (1 + vatPercent / 100);
      vatAmount = totalAmount - subtotal;
      
    } else if (mode === 'items') {
      // Изчисляване на базата на артикулите
      const originalItems = await this.getOriginalInvoiceItems(originalInvoice.id);
      
      for (const creditItem of items) {
        const originalItem = originalItems.find(oi => oi.product_id === creditItem.product_id);
        if (originalItem) {
          const itemSubtotal = originalItem.unit_price * creditItem.quantity;
          subtotal += itemSubtotal;
        }
      }
      
      // Изчисляване на VAT
      const vatPercent = originalInvoice.vat_percent || 20;
      vatAmount = subtotal * (vatPercent / 100);
      totalAmount = subtotal + vatAmount;
    }

    return {
      subtotal: Number(subtotal.toFixed(2)),
      vat_percent: originalInvoice.vat_percent || 20,
      vat_amount: Number(vatAmount.toFixed(2)),
      total_amount: Number(totalAmount.toFixed(2))
    };
  }

  /**
   * Създаване на кредитно известие
   */
  async createCreditNote(data, transaction = null) {
    const {
      variant_id,
      original_invoice_id,
      mode,
      reason,
      currency,
      amounts,
      items,
      created_by
    } = data;

    const shouldCommit = !transaction;
    if (!transaction) {
      transaction = await db.transaction();
    }

    try {
      // 1. Получаване на оригиналната фактура за наследяване на данни
      const originalInvoice = await this.getOriginalInvoice(original_invoice_id);
      
      // 2. Генериране на номер на кредитното известие
      const invoiceNumber = await InvoiceSequenceService.getNextNumber(
        originalInvoice.company_id, 
        'credit_note'
      );

      // 3. Създаване на кредитното известие
      const creditNoteId = uuidv4();
      const creditNoteQuery = `
        INSERT INTO invoices (
          id, invoice_number, invoice_category, invoice_type, company_id,
          client_id, project_id, variant_id, original_invoice_id,
          invoice_date, currency,
          subtotal, vat_percent, vat_amount, total_amount,
          notes, status, created_by, created_at
        ) VALUES (
          $1, $2, 'credit_note', $3, $4,
          $5, $6, $7, $8,
          CURRENT_DATE, $9,
          $10, $11, $12, $13,
          $14, 'draft', $15, CURRENT_TIMESTAMP
        ) RETURNING *
      `;

      const creditNoteValues = [
        creditNoteId,
        invoiceNumber,
        `credit_${mode}`, // credit_amount или credit_items
        originalInvoice.company_id,
        originalInvoice.client_id,
        originalInvoice.project_id,
        variant_id,
        original_invoice_id,
        currency,
        -amounts.subtotal, // Отрицателни суми за кредитни известия
        amounts.vat_percent,
        -amounts.vat_amount,
        -amounts.total_amount,
        reason,
        created_by
      ];

      const creditNoteResult = await db.query(creditNoteQuery, creditNoteValues, transaction);
      const creditNote = creditNoteResult.rows[0];

      // 4. Създаване на артикулите (ако е items режим)
      if (mode === 'items' && items && items.length > 0) {
        const originalItems = await this.getOriginalInvoiceItems(original_invoice_id);
        
        for (const creditItem of items) {
          const originalItem = originalItems.find(oi => oi.product_id === creditItem.product_id);
          if (originalItem) {
            const itemId = uuidv4();
            const itemQuery = `
              INSERT INTO invoice_items (
                id, invoice_id, product_id, description,
                quantity, unit, unit_price, total_price, notes
              ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9
              )
            `;

            const itemValues = [
              itemId,
              creditNoteId,
              creditItem.product_id,
              originalItem.description,
              -creditItem.quantity, // Отрицателно количество
              originalItem.unit,
              originalItem.unit_price,
              -(originalItem.unit_price * creditItem.quantity),
              creditItem.reason
            ];

            await db.query(itemQuery, itemValues, transaction);
          }
        }
      }

      // 5. Обновяване на статуса на оригиналната фактура
      await this.updateOriginalInvoiceStatus(original_invoice_id, transaction);

      // 6. Логиране на дейността
      await this.logCreditNoteActivity(creditNoteId, 'created', created_by, transaction);

      if (shouldCommit) {
        await transaction.commit();
      }

      // Връщане на пълните данни
      return await this.getCreditNoteDetails(creditNoteId);

    } catch (error) {
      if (shouldCommit) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  /**
   * Получаване на кредитни известия за вариант
   */
  async getCreditNotesByVariant(filters, pagination) {
    const { variant_id, status, date_from, date_to, search } = filters;
    const { page, limit } = pagination;
    const offset = (page - 1) * limit;

    let whereConditions = ['i.variant_id = $1', 'i.invoice_category = $2'];
    let queryParams = [variant_id, 'credit_note'];
    let paramIndex = 3;

    // Добавяне на филтри
    if (status) {
      whereConditions.push(`i.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    if (date_from) {
      whereConditions.push(`i.invoice_date >= $${paramIndex}`);
      queryParams.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      whereConditions.push(`i.invoice_date <= $${paramIndex}`);
      queryParams.push(date_to);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(i.invoice_number ILIKE $${paramIndex} OR i.notes ILIKE $${paramIndex})`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Заявка за данните
    const dataQuery = `
      SELECT 
        i.*,
        c.first_name || ' ' || c.last_name as client_name,
        oi.invoice_number as original_invoice_number,
        oi.total_amount as original_amount,
        CASE 
          WHEN i.email_sent_at IS NOT NULL THEN true 
          ELSE false 
        END as email_sent
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN invoices oi ON i.original_invoice_id = oi.id
      WHERE ${whereClause}
      ORDER BY i.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limit, offset);

    // Заявка за общия брой
    const countQuery = `
      SELECT COUNT(*) as total
      FROM invoices i
      WHERE ${whereClause}
    `;

    const [dataResult, countResult] = await Promise.all([
      db.query(dataQuery, queryParams),
      db.query(countQuery, queryParams.slice(0, -2)) // Без limit и offset
    ]);

    return {
      credit_notes: dataResult.rows,
      total: parseInt(countResult.rows[0].total)
    };
  }

  /**
   * Получаване на детайли за кредитно известие
   */
  async getCreditNoteDetails(creditNoteId) {
    const query = `
      SELECT 
        i.*,
        c.first_name || ' ' || c.last_name as client_name,
        c.email as client_email,
        c.phone as client_phone,
        p.name as project_name,
        v.name as variant_name,
        oi.invoice_number as original_invoice_number,
        oi.total_amount as original_total_amount,
        comp.name as company_name,
        comp.legal_name as company_legal_name,
        comp.eik_bulstat as company_eik,
        comp.vat_number as company_vat_number,
        comp.address as company_address
      FROM invoices i
      LEFT JOIN clients c ON i.client_id = c.id
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN variants v ON i.variant_id = v.id
      LEFT JOIN invoices oi ON i.original_invoice_id = oi.id
      LEFT JOIN companies comp ON i.company_id = comp.id
      WHERE i.id = $1
    `;

    const result = await db.query(query, [creditNoteId]);
    const creditNote = result.rows[0];

    if (!creditNote) {
      return null;
    }

    // Получаване на артикулите
    const itemsQuery = `
      SELECT 
        ii.*,
        p.name as product_name,
        p.code as product_code
      FROM invoice_items ii
      LEFT JOIN products p ON ii.product_id = p.id
      WHERE ii.invoice_id = $1
      ORDER BY ii.created_at
    `;

    const itemsResult = await db.query(itemsQuery, [creditNoteId]);
    creditNote.items = itemsResult.rows;

    // Получаване на email историята
    const emailQuery = `
      SELECT *
      FROM invoice_email_history
      WHERE invoice_id = $1
      ORDER BY sent_at DESC
    `;

    const emailResult = await db.query(emailQuery, [creditNoteId]);
    creditNote.email_history = emailResult.rows;

    return creditNote;
  }

  /**
   * Помощни методи
   */

  async getExistingCreditNotes(originalInvoiceId) {
    const query = `
      SELECT * FROM invoices 
      WHERE original_invoice_id = $1 AND invoice_category = 'credit_note' AND status != 'cancelled'
    `;
    const result = await db.query(query, [originalInvoiceId]);
    return result.rows;
  }

  async getOriginalInvoiceItems(invoiceId) {
    const query = `
      SELECT * FROM invoice_items WHERE invoice_id = $1 ORDER BY created_at
    `;
    const result = await db.query(query, [invoiceId]);
    return result.rows;
  }

  async getCreditedItemsQuantities(originalInvoiceId) {
    const query = `
      SELECT 
        ii.product_id,
        SUM(ABS(ii.quantity)) as credited_quantity
      FROM invoice_items ii
      INNER JOIN invoices i ON ii.invoice_id = i.id
      WHERE i.original_invoice_id = $1 
        AND i.invoice_category = 'credit_note' 
        AND i.status != 'cancelled'
      GROUP BY ii.product_id
    `;
    
    const result = await db.query(query, [originalInvoiceId]);
    const quantities = {};
    result.rows.forEach(row => {
      quantities[row.product_id] = parseFloat(row.credited_quantity);
    });
    return quantities;
  }

  async updateOriginalInvoiceStatus(invoiceId, transaction) {
    // Тук може да се добави логика за автоматично обновяване на статуса
    // на оригиналната фактура според кредитираните суми
    // Засега само логваме промяната
    console.log(`Original invoice ${invoiceId} has been credited`);
  }

  async updateCreditNotePDF(creditNoteId, pdfPath) {
    const query = `
      UPDATE invoices 
      SET pdf_path = $1, pdf_generated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    await db.query(query, [pdfPath, creditNoteId]);
  }

  async logCreditNoteActivity(creditNoteId, action, userId, transaction = null) {
    const query = `
      INSERT INTO audit_log (entity_type, entity_id, action, details, user_id, created_at)
      VALUES ('credit_note', $1, $2, $3, $4, CURRENT_TIMESTAMP)
    `;
    const details = JSON.stringify({ action, timestamp: new Date().toISOString() });
    await db.query(query, [creditNoteId, action, details, userId], transaction);
  }

  async logEmailActivity(creditNoteId, emailData) {
    const query = `
      INSERT INTO invoice_email_history (
        invoice_id, email_to, email_subject, sent_at, sent_by, email_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
    `;
    
    const values = [
      creditNoteId,
      emailData.email_to,
      emailData.email_subject,
      emailData.sent_at,
      emailData.sent_by,
      emailData.email_id
    ];
    
    await db.query(query, values);
  }

  async checkUserAccess(userId, creditNote) {
    // Тук се проверяват правата на потребителя
    // Засега връщаме true, но може да се добави по-сложна логика
    return true;
  }

  async cancelCreditNote(creditNoteId, userId) {
    const query = `
      UPDATE invoices 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP, updated_by = $2
      WHERE id = $1
    `;
    await db.query(query, [creditNoteId, userId]);
  }

  async getCreditNotesStats(variantId) {
    const query = `
      SELECT 
        COUNT(*) as total_credit_notes,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft_count,
        SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent_count,
        SUM(ABS(total_amount)) as total_credited_amount,
        COUNT(DISTINCT original_invoice_id) as credited_invoices_count
      FROM invoices
      WHERE variant_id = $1 AND invoice_category = 'credit_note' AND status != 'cancelled'
    `;
    
    const result = await db.query(query, [variantId]);
    return result.rows[0];
  }
}

module.exports = new CreditNotesService();