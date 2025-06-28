// /api/controllers/creditNotesController.js

const { v4: uuidv4 } = require('uuid');
const CreditNotesService = require('../services/creditNotesService');
const PDFService = require('../services/pdfService');
const EmailService = require('../services/emailService');
const { validationResult } = require('express-validator');

class CreditNotesController {
  
  /**
   * Създаване на кредитно известие
   * POST /api/invoices/variant/:variant_id/credit-note
   */
  async createCreditNote(req, res) {
    try {
      // Проверка за валидационни грешки
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Невалидни данни',
          errors: errors.array()
        });
      }

      const { variant_id } = req.params;
      const { 
        original_invoice_id, 
        mode, // 'amount' | 'items'
        amount, 
        items, 
        reason,
        currency = 'BGN'
      } = req.body;
      
      const userId = req.user.id;

      // 1. Валидация на данните
      const validationResult = await CreditNotesService.validateCreditNoteData({
        original_invoice_id,
        variant_id,
        mode,
        amount,
        items,
        reason
      });

      if (!validationResult.valid) {
        return res.status(400).json({
          success: false,
          message: validationResult.message,
          errors: validationResult.errors
        });
      }

      // 2. Получаване на оригиналната фактура
      const originalInvoice = await CreditNotesService.getOriginalInvoice(original_invoice_id);
      
      if (!originalInvoice) {
        return res.status(404).json({
          success: false,
          message: 'Оригиналната фактура не е намерена'
        });
      }

      // 3. Изчисляване на сумите за кредитното известие
      const creditAmounts = await CreditNotesService.calculateCreditAmounts(
        originalInvoice, 
        { mode, amount, items }
      );

      // 4. Създаване на кредитното известие в транзакция
      const creditNote = await CreditNotesService.createCreditNote({
        variant_id,
        original_invoice_id,
        mode,
        reason,
        currency,
        amounts: creditAmounts,
        items: mode === 'items' ? items : null,
        created_by: userId
      });

      // 5. Генериране на PDF
      const pdfPath = await PDFService.generateCreditNotePDF(creditNote);
      
      // Обновяване с PDF path
      await CreditNotesService.updateCreditNotePDF(creditNote.id, pdfPath);

      // 6. Логиране на дейността
      await CreditNotesService.logCreditNoteActivity(creditNote.id, 'created', userId);

      // 7. Response
      res.status(201).json({
        success: true,
        message: 'Кредитното известие е създадено успешно',
        data: {
          credit_note: {
            ...creditNote,
            pdf_url: `/api/invoices/credit-note/${creditNote.id}/pdf`
          }
        }
      });

    } catch (error) {
      console.error('Error creating credit note:', error);
      res.status(500).json({
        success: false,
        message: 'Възникна грешка при създаването на кредитното известие',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Списък с кредитни известия за вариант
   * GET /api/invoices/variant/:variant_id/credit-notes
   */
  async getCreditNotesByVariant(req, res) {
    try {
      const { variant_id } = req.params;
      const { 
        page = 1, 
        limit = 10, 
        status,
        date_from,
        date_to,
        search 
      } = req.query;

      const filters = {
        variant_id,
        status,
        date_from,
        date_to,
        search
      };

      const result = await CreditNotesService.getCreditNotesByVariant(filters, {
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: {
          credit_notes: result.credit_notes,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(result.total / limit),
            total_records: result.total,
            has_next: page * limit < result.total,
            has_prev: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Error fetching credit notes:', error);
      res.status(500).json({
        success: false,
        message: 'Възникна грешка при зареждането на кредитните известия'
      });
    }
  }

  /**
   * Детайли за конкретно кредитно известие
   * GET /api/invoices/credit-note/:id
   */
  async getCreditNoteDetails(req, res) {
    try {
      const { id } = req.params;

      const creditNote = await CreditNotesService.getCreditNoteDetails(id);

      if (!creditNote) {
        return res.status(404).json({
          success: false,
          message: 'Кредитното известие не е намерено'
        });
      }

      // Проверка на права за достъп
      const hasAccess = await CreditNotesService.checkUserAccess(req.user.id, creditNote);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Нямате права за достъп до това кредитно известие'
        });
      }

      res.json({
        success: true,
        data: {
          credit_note: creditNote
        }
      });

    } catch (error) {
      console.error('Error fetching credit note details:', error);
      res.status(500).json({
        success: false,
        message: 'Възникна грешка при зареждането на детайлите'
      });
    }
  }

  /**
   * Изпращане на кредитно известие по email
   * POST /api/invoices/credit-note/:id/send
   */
  async sendCreditNote(req, res) {
    try {
      const { id } = req.params;
      const { 
        email_to, 
        email_subject, 
        email_body,
        send_copy_to 
      } = req.body;
      
      const userId = req.user.id;

      // Получаване на кредитното известие
      const creditNote = await CreditNotesService.getCreditNoteDetails(id);
      
      if (!creditNote) {
        return res.status(404).json({
          success: false,
          message: 'Кредитното известие не е намерено'
        });
      }

      // Проверка на права
      const hasAccess = await CreditNotesService.checkUserAccess(userId, creditNote);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Нямате права за изпращане на това кредитно известие'
        });
      }

      // Валидация на email данните
      if (!email_to || !email_subject) {
        return res.status(400).json({
          success: false,
          message: 'Email адресът и subject са задължителни'
        });
      }

      // Изпращане на email
      const emailResult = await EmailService.sendCreditNote({
        credit_note: creditNote,
        to: email_to,
        subject: email_subject,
        body: email_body,
        copy_to: send_copy_to,
        sent_by: userId
      });

      if (emailResult.success) {
        // Логиране на изпращането
        await CreditNotesService.logEmailActivity(id, {
          email_to,
          email_subject,
          sent_at: new Date(),
          sent_by: userId,
          email_id: emailResult.email_id
        });

        res.json({
          success: true,
          message: 'Кредитното известие е изпратено успешно',
          data: {
            email_sent_to: email_to,
            sent_at: new Date().toISOString()
          }
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Възникна грешка при изпращането на email',
          error: emailResult.error
        });
      }

    } catch (error) {
      console.error('Error sending credit note:', error);
      res.status(500).json({
        success: false,
        message: 'Възникна грешка при изпращането на кредитното известие'
      });
    }
  }

  /**
   * Генериране/изтегляне на PDF
   * GET /api/invoices/credit-note/:id/pdf
   */
  async downloadCreditNotePDF(req, res) {
    try {
      const { id } = req.params;
      const { regenerate = false } = req.query;

      const creditNote = await CreditNotesService.getCreditNoteDetails(id);
      
      if (!creditNote) {
        return res.status(404).json({
          success: false,
          message: 'Кредитното известие не е намерено'
        });
      }

      // Проверка на права
      const hasAccess = await CreditNotesService.checkUserAccess(req.user.id, creditNote);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Нямате права за достъп до този документ'
        });
      }

      let pdfPath = creditNote.pdf_path;

      // Регенериране на PDF ако е поискано или не съществува
      if (regenerate || !pdfPath || !await PDFService.fileExists(pdfPath)) {
        pdfPath = await PDFService.generateCreditNotePDF(creditNote);
        await CreditNotesService.updateCreditNotePDF(id, pdfPath);
      }

      // Изпращане на PDF файла
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="credit-note-${creditNote.invoice_number}.pdf"`);
      
      const pdfBuffer = await PDFService.readPDFFile(pdfPath);
      res.send(pdfBuffer);

    } catch (error) {
      console.error('Error downloading credit note PDF:', error);
      res.status(500).json({
        success: false,
        message: 'Възникна грешка при генерирането на PDF'
      });
    }
  }

  /**
   * Отмяна на кредитно известие (само draft статус)
   * DELETE /api/invoices/credit-note/:id
   */
  async cancelCreditNote(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const creditNote = await CreditNotesService.getCreditNoteDetails(id);
      
      if (!creditNote) {
        return res.status(404).json({
          success: false,
          message: 'Кредитното известие не е намерено'
        });
      }

      // Проверка дали може да се отмени
      if (creditNote.status !== 'draft') {
        return res.status(400).json({
          success: false,
          message: 'Може да се отменят само кредитни известия в статус "Чернова"'
        });
      }

      // Проверка на права
      const hasAccess = await CreditNotesService.checkUserAccess(userId, creditNote);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Нямате права за отмяна на това кредитно известие'
        });
      }

      // Отмяна на кредитното известие
      await CreditNotesService.cancelCreditNote(id, userId);

      // Логиране
      await CreditNotesService.logCreditNoteActivity(id, 'cancelled', userId);

      res.json({
        success: true,
        message: 'Кредитното известие е отменено успешно'
      });

    } catch (error) {
      console.error('Error cancelling credit note:', error);
      res.status(500).json({
        success: false,
        message: 'Възникна грешка при отмяната на кредитното известие'
      });
    }
  }

  /**
   * Статистики за кредитни известия
   * GET /api/invoices/variant/:variant_id/credit-notes/stats
   */
  async getCreditNotesStats(req, res) {
    try {
      const { variant_id } = req.params;

      const stats = await CreditNotesService.getCreditNotesStats(variant_id);

      res.json({
        success: true,
        data: {
          stats
        }
      });

    } catch (error) {
      console.error('Error fetching credit notes stats:', error);
      res.status(500).json({
        success: false,
        message: 'Възникна грешка при зареждането на статистиките'
      });
    }
  }
}

module.exports = new CreditNotesController();