const db = require('../config/database');
const pdfService = require('./pdfService');
const emailService = require('./emailService');
const auditService = require('./auditService');
const { v4: uuidv4 } = require('uuid');
const moment = require('moment');

class CreditNotesService {
  
  /**
   * Валидация на данните за кредитно известие
   * @param {Object} data - Данни за кредитното известие
   * @param {string} variantId - ID на варианта 
   * @returns {Promise<Object>} - Резултат от валидацията
   */
  async validateCreditNoteData(data, variantId) {
    const errors = [];
    
    try {
      const { original_invoice_id, mode, amount, items, reason } = data;
      
      // 1. Проверка дали оригиналната фактура съществува
      const originalInvoice = await db.query(`
        SELECT i.*, 
               COALESCE(SUM(cn.total_amount), 0) as total_credited
        FROM invoices i
        LEFT JOIN invoices cn ON cn.original_invoice_id = i.id 
                              AND cn.invoice_category = 'credit_note'
                              AND cn.status != 'cancelled'
        WHERE i.id = ? AND i.variant_id = ? AND i.invoice_category = 'original'
        GROUP BY i.id
      `, [original_invoice_id, variantId]);
      
      if (!originalInvoice || originalInvoice.length === 0) {
        errors.push('Оригиналната фактура не съществува или не принадлежи на този вариант');
        return { isValid: false, errors };
      }
      
      const invoice = originalInvoice[0];
      const remainingAmount = invoice.total_amount - (invoice.total_credited || 0);
      
      // 2. Проверка дали не е вече кредитирана напълно
      if (remainingAmount <= 0) {
        errors.push('Фактурата е вече изцяло кредитирана');
        return { isValid: false, errors };
      }
      
      // 3. Валидация на причината
      if (!reason || reason.trim().length < 10) {
        errors.push('Причината трябва да е поне 10 символа');
      }
      
      // 4. Валидация по режим
      if (mode === 'amount') {
        // Amount mode валидации
        if (!amount || amount <= 0) {
          errors.push('Сумата трябва да е положително число');
        } else if (amount > remainingAmount) {
          errors.push(`Сумата не може да надвишава остатъка от ${remainingAmount.toFixed(2)} лв.`);
        }
      } else if (mode === 'items') {
        // Items mode валидации
        if (!items || !Array.isArray(items) || items.length === 0) {
          errors.push('Трябва да изберете поне един артикул');
        } else {
          // Проверка на артикулите от оригиналната фактура
          const originalItems = await db.query(`
            SELECT * FROM invoice_items WHERE invoice_id = ?
          `, [original_invoice_id]);
          
          const originalItemsMap = {};
          originalItems.forEach(item => {
            originalItemsMap[item.product_id] = item;
          });
          
          let totalCreditAmount = 0;
          
          for (const item of items) {
            const originalItem = originalItemsMap[item.product_id];
            
            if (!originalItem) {
              errors.push(`Артикул ${item.product_name} не съществува в оригиналната фактура`);
              continue;
            }
            
            if (item.quantity <= 0) {
              errors.push(`Количеството за ${item.product_name} трябва да е положително`);
              continue;
            }
            
            if (item.quantity > originalItem.quantity) {
              errors.push(`Количеството за ${item.product_name} не може да надвишава оригиналното (${originalItem.quantity})`);
              continue;
            }
            
            // Изчисляване на сумата за този артикул
            const itemTotal = item.quantity * originalItem.unit_price;
            totalCreditAmount += itemTotal;
          }
          
          if (totalCreditAmount > remainingAmount) {
            errors.push(`Общата сума на артикулите (${totalCreditAmount.toFixed(2)} лв.) надвишава остатъка`);
          }
        }
      } else {
        errors.push('Невалиден режим. Позволени са: amount, items');
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        originalInvoice: invoice,
        remainingAmount
      };
      
    } catch (error) {
      console.error('Error validating credit note data:', error);
      return {
        isValid: false,
        errors: ['Грешка при валидация на данните']
      };
    }
  }
  
  /**
   * Изчисляване на суми за кредитно известие
   * @param {Object} originalInvoice - Оригиналната фактура
   * @param {Object} creditData - Данни за кредитното известие
   * @returns {Promise<Object>} - Изчислените суми
   */
  async calculateCreditAmounts(originalInvoice, creditData) {
    try {
      const { mode, amount, items } = creditData;
      let creditItems = [];
      let subtotal = 0;
      
      if (mode === 'amount') {
        // За amount mode - пропорционално разпределяне по артикули
        const originalItems = await db.query(`
          SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id
        `, [originalInvoice.id]);
        
        const originalSubtotal = originalItems.reduce((sum, item) => 
          sum + (item.quantity * item.unit_price), 0
        );
        
        // Пропорционално разпределяне
        for (const originalItem of originalItems) {
          const itemOriginalTotal = originalItem.quantity * originalItem.unit_price;
          const proportion = itemOriginalTotal / originalSubtotal;
          const creditAmount = amount * proportion;
          
          creditItems.push({
            product_id: originalItem.product_id,
            product_name: originalItem.product_name,
            product_code: originalItem.product_code,
            quantity: originalItem.quantity, // Показваме оригиналното количество
            unit_price: originalItem.unit_price,
            credit_amount: creditAmount,
            discount_percentage: originalItem.discount_percentage || 0,
            total_amount: creditAmount
          });
          
          subtotal += creditAmount;
        }
        
      } else if (mode === 'items') {
        // За items mode - директно от избраните артикули
        const originalItems = await db.query(`
          SELECT * FROM invoice_items WHERE invoice_id = ?
        `, [originalInvoice.id]);
        
        const originalItemsMap = {};
        originalItems.forEach(item => {
          originalItemsMap[item.product_id] = item;
        });
        
        for (const item of items) {
          const originalItem = originalItemsMap[item.product_id];
          const itemTotal = item.quantity * originalItem.unit_price;
          
          creditItems.push({
            product_id: item.product_id,
            product_name: originalItem.product_name,
            product_code: originalItem.product_code,
            quantity: item.quantity,
            unit_price: originalItem.unit_price,
            credit_amount: itemTotal,
            discount_percentage: originalItem.discount_percentage || 0,
            total_amount: itemTotal
          });
          
          subtotal += itemTotal;
        }
      }
      
      // ДДС изчисления
      const vatRate = originalInvoice.vat_rate || 20;
      const vatAmount = subtotal * (vatRate / 100);
      const totalAmount = subtotal + vatAmount;
      
      return {
        items: creditItems,
        subtotal,
        vatRate,
        vatAmount,
        totalAmount
      };
      
    } catch (error) {
      console.error('Error calculating credit amounts:', error);
      throw new Error('Грешка при изчисляване на суми');
    }
  }
  
  /**
   * Създаване на кредитно известие
   * @param {Object} creditData - Данни за кредитното известие
   * @param {string} variantId - ID на варианта
   * @param {string} userId - ID на потребителя
   * @returns {Promise<Object>} - Създаденото кредитно известие
   */
  async createCreditNote(creditData, variantId, userId) {
    const transaction = await db.beginTransaction();
    
    try {
      // 1. Валидация
      const validation = await this.validateCreditNoteData(creditData, variantId);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      const originalInvoice = validation.originalInvoice;
      
      // 2. Изчисляване на суми
      const calculations = await this.calculateCreditAmounts(originalInvoice, creditData);
      
      // 3. Генериране на номер
      const creditNoteNumber = await this.generateCreditNoteNumber(variantId, transaction);
      
      // 4. Създаване на кредитното известие
      const creditNoteId = uuidv4();
      const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
      
      await db.query(`
        INSERT INTO invoices (
          id, variant_id, invoice_number, invoice_category, invoice_type,
          original_invoice_id, invoice_date, due_date, status,
          client_id, client_name, client_address, client_eik, client_vat_number,
          subtotal, vat_rate, vat_amount, total_amount,
          notes, reason, created_by, created_at, updated_at
        ) VALUES (?, ?, ?, 'credit_note', ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        creditNoteId, variantId, creditNoteNumber, creditData.mode,
        originalInvoice.original_invoice_id || originalInvoice.id, currentDate, currentDate,
        originalInvoice.client_id, originalInvoice.client_name, 
        originalInvoice.client_address, originalInvoice.client_eik, originalInvoice.client_vat_number,
        calculations.subtotal, calculations.vatRate, calculations.vatAmount, calculations.totalAmount,
        creditData.notes || '', creditData.reason, userId, currentDate, currentDate
      ], transaction);
      
      // 5. Създаване на артикулите
      for (const item of calculations.items) {
        await db.query(`
          INSERT INTO invoice_items (
            id, invoice_id, product_id, product_name, product_code,
            quantity, unit_price, discount_percentage, total_amount,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          uuidv4(), creditNoteId, item.product_id, item.product_name, item.product_code,
          item.quantity, item.unit_price, item.discount_percentage, item.total_amount,
          currentDate, currentDate
        ], transaction);
      }
      
      // 6. Обновяване на статуса на оригиналната фактура
      const totalCredited = await this.calculateTotalCredited(originalInvoice.id, transaction);
      const newCreditedAmount = totalCredited + calculations.totalAmount;
      
      let originalStatus = originalInvoice.status;
      if (newCreditedAmount >= originalInvoice.total_amount) {
        originalStatus = 'fully_credited';
      } else if (newCreditedAmount > 0) {
        originalStatus = 'partially_credited';
      }
      
      await db.query(`
        UPDATE invoices SET status = ?, updated_at = ? WHERE id = ?
      `, [originalStatus, currentDate, originalInvoice.id], transaction);
      
      // 7. Audit trail
      await auditService.logActivity({
        action: 'credit_note_created',
        entity: 'invoice',
        entity_id: creditNoteId,
        user_id: userId,
        details: {
          original_invoice: originalInvoice.invoice_number,
          mode: creditData.mode,
          amount: calculations.totalAmount,
          reason: creditData.reason
        }
      }, transaction);
      
      await db.commit(transaction);
      
      // 8. Възвръщане на създаденото кредитно известие
      const creditNote = await this.getCreditNoteById(creditNoteId);
      
      return {
        success: true,
        creditNote,
        message: 'Кредитното известие е създадено успешно'
      };
      
    } catch (error) {
      await db.rollback(transaction);
      console.error('Error creating credit note:', error);
      throw error;
    }
  }
  
  /**
   * Генериране на номер за кредитно известие
   * @param {string} variantId - ID на варианта
   * @param {Object} transaction - Database transaction
   * @returns {Promise<string>} - Номера на кредитното известие
   */
  async generateCreditNoteNumber(variantId, transaction = null) {
    try {
      const currentYear = moment().format('YYYY');
      
      // Намиране на последния номер за годината
      const lastNumber = await db.query(`
        SELECT invoice_number 
        FROM invoices 
        WHERE variant_id = ? 
          AND invoice_category = 'credit_note' 
          AND invoice_number LIKE ?
        ORDER BY invoice_number DESC 
        LIMIT 1
      `, [variantId, `CN${currentYear}-%`], transaction);
      
      let nextNumber = 1;
      
      if (lastNumber && lastNumber.length > 0) {
        const lastNumberStr = lastNumber[0].invoice_number;
        const numberPart = lastNumberStr.split('-')[1];
        nextNumber = parseInt(numberPart) + 1;
      }
      
      return `CN${currentYear}-${nextNumber.toString().padStart(6, '0')}`;
      
    } catch (error) {
      console.error('Error generating credit note number:', error);
      throw new Error('Грешка при генериране на номер');
    }
  }
  
  /**
   * Изчисляване на общо кредитирана сума за фактура
   * @param {string} invoiceId - ID на оригиналната фактура
   * @param {Object} transaction - Database transaction
   * @returns {Promise<number>} - Общо кредитирана сума
   */
  async calculateTotalCredited(invoiceId, transaction = null) {
    try {
      const result = await db.query(`
        SELECT COALESCE(SUM(total_amount), 0) as total_credited
        FROM invoices 
        WHERE original_invoice_id = ? 
          AND invoice_category = 'credit_note'
          AND status != 'cancelled'
      `, [invoiceId], transaction);
      
      return result[0]?.total_credited || 0;
      
    } catch (error) {
      console.error('Error calculating total credited:', error);
      return 0;
    }
  }
  
  /**
   * Получаване на кредитно известие по ID
   * @param {string} creditNoteId - ID на кредитното известие
   * @returns {Promise<Object>} - Кредитното известие с артикули
   */
  async getCreditNoteById(creditNoteId) {
    try {
      // Основни данни за кредитното известие
      const creditNote = await db.query(`
        SELECT cn.*, 
               oi.invoice_number as original_invoice_number,
               oi.invoice_date as original_invoice_date
        FROM invoices cn
        LEFT JOIN invoices oi ON oi.id = cn.original_invoice_id
        WHERE cn.id = ? AND cn.invoice_category = 'credit_note'
      `, [creditNoteId]);
      
      if (!creditNote || creditNote.length === 0) {
        throw new Error('Кредитното известие не е намерено');
      }
      
      // Артикули на кредитното известие
      const items = await db.query(`
        SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id
      `, [creditNoteId]);
      
      return {
        ...creditNote[0],
        items
      };
      
    } catch (error) {
      console.error('Error getting credit note by ID:', error);
      throw error;
    }
  }
  
  /**
   * Получаване на кредитни известия за вариант
   * @param {string} variantId - ID на варианта
   * @param {Object} filters - Филтри
   * @returns {Promise<Object>} - Списък с кредитни известия
   */
  async getCreditNotesByVariant(variantId, filters = {}) {
    try {
      const { page = 1, limit = 10, status, date_from, date_to } = filters;
      const offset = (page - 1) * limit;
      
      let whereClause = 'WHERE cn.variant_id = ? AND cn.invoice_category = ?';
      let queryParams = [variantId, 'credit_note'];
      
      if (status) {
        whereClause += ' AND cn.status = ?';
        queryParams.push(status);
      }
      
      if (date_from) {
        whereClause += ' AND cn.invoice_date >= ?';
        queryParams.push(date_from);
      }
      
      if (date_to) {
        whereClause += ' AND cn.invoice_date <= ?';
        queryParams.push(date_to);
      }
      
      // Общ брой записи
      const totalResult = await db.query(`
        SELECT COUNT(*) as total
        FROM invoices cn
        ${whereClause}
      `, queryParams);
      
      const total = totalResult[0].total;
      
      // Данни с пагинация
      const creditNotes = await db.query(`
        SELECT cn.*,
               oi.invoice_number as original_invoice_number,
               oi.invoice_date as original_invoice_date
        FROM invoices cn
        LEFT JOIN invoices oi ON oi.id = cn.original_invoice_id
        ${whereClause}
        ORDER BY cn.created_at DESC
        LIMIT ? OFFSET ?
      `, [...queryParams, limit, offset]);
      
      return {
        creditNotes,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
      
    } catch (error) {
      console.error('Error getting credit notes by variant:', error);
      throw error;
    }
  }
  
  /**
   * Генериране на PDF за кредитно известие
   * @param {string} creditNoteId - ID на кредитното известие
   * @param {boolean} regenerate - Дали да регенерира PDF-а
   * @returns {Promise<Object>} - PDF данни
   */
  async generateCreditNotePDF(creditNoteId, regenerate = false) {
    try {
      const creditNote = await this.getCreditNoteById(creditNoteId);
      
      // Използване на PDF сервиза
      const pdfResult = await pdfService.generateInvoicePDF(creditNote, {
        template: 'credit_note',
        regenerate
      });
      
      return pdfResult;
      
    } catch (error) {
      console.error('Error generating credit note PDF:', error);
      throw error;
    }
  }
  
  /**
   * Изпращане на кредитно известие по email
   * @param {string} creditNoteId - ID на кредитното известие
   * @param {Object} emailData - Данни за email-а
   * @param {string} userId - ID на потребителя
   * @returns {Promise<Object>} - Резултат от изпращането
   */
  async sendCreditNote(creditNoteId, emailData, userId) {
    try {
      const creditNote = await this.getCreditNoteById(creditNoteId);
      
      // Генериране на PDF ако е нужно
      const pdfResult = await this.generateCreditNotePDF(creditNoteId);
      
      // Подготовка на email данните
      const emailContent = {
        to: emailData.email_to,
        subject: emailData.email_subject || `Кредитно известие ${creditNote.invoice_number}`,
        html: emailData.email_body || this.getDefaultEmailTemplate(creditNote),
        attachments: [
          {
            filename: `credit-note-${creditNote.invoice_number}.pdf`,
            path: pdfResult.filePath
          }
        ]
      };
      
      if (emailData.send_copy_to && emailData.send_copy_to.length > 0) {
        emailContent.cc = emailData.send_copy_to;
      }
      
      // Изпращане на email
      const emailResult = await emailService.sendEmail(emailContent);
      
      if (emailResult.success) {
        // Обновяване на статуса
        await db.query(`
          UPDATE invoices 
          SET status = 'sent', 
              sent_at = ?,
              sent_to = ?,
              updated_at = ?
          WHERE id = ?
        `, [
          moment().format('YYYY-MM-DD HH:mm:ss'),
          emailData.email_to,
          moment().format('YYYY-MM-DD HH:mm:ss'),
          creditNoteId
        ]);
        
        // Audit trail
        await auditService.logActivity({
          action: 'credit_note_sent',
          entity: 'invoice',
          entity_id: creditNoteId,
          user_id: userId,
          details: {
            sent_to: emailData.email_to,
            email_subject: emailContent.subject
          }
        });
      }
      
      return emailResult;
      
    } catch (error) {
      console.error('Error sending credit note:', error);
      throw error;
    }
  }
  
  /**
   * Получаване на шаблон по подразбиране за email
   * @param {Object} creditNote - Кредитното известие
   * @returns {string} - HTML съдържание на email-а
   */
  getDefaultEmailTemplate(creditNote) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Кредитно известие ${creditNote.invoice_number}</h2>
        
        <p>Уважаеми ${creditNote.client_name},</p>
        
        <p>Моля, намерете приложеното кредитно известие относно корекция по фактура ${creditNote.original_invoice_number}.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <strong>Детайли:</strong><br>
          Номер: ${creditNote.invoice_number}<br>
          Дата: ${moment(creditNote.invoice_date).format('DD.MM.YYYY')}<br>
          Сума: ${creditNote.total_amount.toFixed(2)} лв.<br>
          Причина: ${creditNote.reason}
        </div>
        
        <p>При въпроси не се колебайте да се свържете с нас.</p>
        
        <p>С уважение,<br>
        Екипът на Паркетсенс ООД</p>
      </div>
    `;
  }
  
  /**
   * Статистики за кредитни известия
   * @param {string} variantId - ID на варианта
   * @returns {Promise<Object>} - Статистики
   */
  async getCreditNotesStats(variantId) {
    try {
      const stats = await db.query(`
        SELECT 
          COUNT(*) as total_count,
          COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_count,
          COUNT(CASE WHEN status = 'sent' THEN 1 END) as sent_count,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count,
          COALESCE(SUM(total_amount), 0) as total_amount,
          COALESCE(SUM(CASE WHEN status != 'cancelled' THEN total_amount ELSE 0 END), 0) as active_amount
        FROM invoices 
        WHERE variant_id = ? AND invoice_category = 'credit_note'
      `, [variantId]);
      
      return stats[0] || {
        total_count: 0,
        draft_count: 0,
        sent_count: 0,
        cancelled_count: 0,
        total_amount: 0,
        active_amount: 0
      };
      
    } catch (error) {
      console.error('Error getting credit notes stats:', error);
      throw error;
    }
  }
}

module.exports = new CreditNotesService();