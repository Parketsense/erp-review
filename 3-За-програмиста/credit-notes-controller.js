const creditNotesService = require('../services/creditNotesService');
const { validationResult } = require('express-validator');
const fs = require('fs').promises;
const path = require('path');

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
      const userId = req.user.id;
      const creditData = req.body;
      
      // Валидация на variant_id
      if (!variant_id) {
        return res.status(400).json({
          success: false,
          message: 'ID на варианта е задължителен'
        });
      }
      
      // Проверка на права
      if (!req.user.permissions?.includes('credit_notes.create')) {
        return res.status(403).json({
          success: false,
          message: 'Нямате права за създаване на кредитни известия'
        });
      }
      
      // Създаване на кредитното известие
      const result = await creditNotesService.createCreditNote(creditData, variant_id, userId);
      
      return res.status(201).json({
        success: true,
        message: result.message,
        data: {
          creditNote: result.creditNote
        }
      });
      
    } catch (error) {
      console.error('Error in createCreditNote:', error);
      
      // Специфични грешки
      if (error.message.includes('не съществува') || error.message.includes('не принадлежи')) {
        return res.status(404).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message.includes('кредитирана') || error.message.includes('надвишава')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Грешка при създаване на кредитно известие',
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
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Невалидни параметри',
          errors: errors.array()
        });
      }
      
      const { variant_id } = req.params;
      const filters = req.query;
      
      // Проверка на права
      if (!req.user.permissions?.includes('credit_notes.read')) {
        return res.status(403).json({
          success: false,
          message: 'Нямате права за преглед на кредитни известия'
        });
      }
      
      const result = await creditNotesService.getCreditNotesByVariant(variant_id, filters);
      
      return res.status(200).json({
        success: true,
        data: result
      });
      
    } catch (error) {
      console.error('Error in getCreditNotesByVariant:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Грешка при получаване на списъка с кредитни известия',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Детайли за кредитно известие
   * GET /api/invoices/credit-note/:id
   */
  async getCreditNoteDetails(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Невалиден ID',
          errors: errors.array()
        });
      }
      
      const { id } = req.params;
      
      // Проверка на права
      if (!req.user.permissions?.includes('credit_notes.read')) {
        return res.status(403).json({
          success: false,
          message: 'Нямате права за преглед на кредитни известия'
        });
      }
      
      const creditNote = await creditNotesService.getCreditNoteById(id);
      
      return res.status(200).json({
        success: true,
        data: {
          creditNote
        }
      });
      
    } catch (error) {
      console.error('Error in getCreditNoteDetails:', error);
      
      if (error.message.includes('не е намерено')) {
        return res.status(404).json({
          success: false,
          message: 'Кредитното известие не е намерено'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Грешка при получаване на детайлите',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Изпращане на кредитно известие по email
   * POST /api/invoices/credit-note/:id/send
   */
  async sendCreditNote(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Невалидни данни за email',
          errors: errors.array()
        });
      }
      
      const { id } = req.params;
      const emailData = req.body;
      const userId = req.user.id;
      
      // Проверка на права
      if (!req.user.permissions?.includes('credit_notes.send')) {
        return res.status(403).json({
          success: false,
          message: 'Нямате права за изпращане на кредитни известия'
        });
      }
      
      // Валидация на email данните
      if (!emailData.email_to) {
        return res.status(400).json({
          success: false,
          message: 'Email адресът за получаване е задължителен'
        });
      }
      
      const result = await creditNotesService.sendCreditNote(id, emailData, userId);
      
      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'Кредитното известие е изпратено успешно',
          data: {
            sentTo: emailData.email_to,
            sentAt: new Date().toISOString()
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Грешка при изпращане на email',
          error: result.error
        });
      }
      
    } catch (error) {
      console.error('Error in sendCreditNote:', error);
      
      if (error.message.includes('не е намерено')) {
        return res.status(404).json({
          success: false,
          message: 'Кредитното известие не е намерено'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Грешка при изпращане на кредитното известие',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Генериране/изтегляне на PDF
   * GET /api/invoices/credit-note/:id/pdf
   */
  async downloadCreditNotePDF(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Невалидни параметри',
          errors: errors.array()
        });
      }
      
      const { id } = req.params;
      const { regenerate = false } = req.query;
      
      // Проверка на права
      if (!req.user.permissions?.includes('credit_notes.read')) {
        return res.status(403).json({
          success: false,
          message: 'Нямате права за преглед на кредитни известия'
        });
      }
      
      // Генериране на PDF
      const pdfResult = await creditNotesService.generateCreditNotePDF(id, regenerate === 'true');
      
      if (!pdfResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Грешка при генериране на PDF',
          error: pdfResult.error
        });
      }
      
      // Проверка дали файлът съществува
      try {
        await fs.access(pdfResult.filePath);
      } catch (err) {
        return res.status(404).json({
          success: false,
          message: 'PDF файлът не е намерен'
        });
      }
      
      // Задаване на headers за download
      const filename = path.basename(pdfResult.filePath);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-cache');
      
      // Изпращане на файла
      return res.sendFile(path.resolve(pdfResult.filePath));
      
    } catch (error) {
      console.error('Error in downloadCreditNotePDF:', error);
      
      if (error.message.includes('не е намерено')) {
        return res.status(404).json({
          success: false,
          message: 'Кредитното известие не е намерено'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Грешка при генериране на PDF',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Статистики за кредитни известия
   * GET /api/invoices/variant/:variant_id/credit-notes/stats
   */
  async getCreditNotesStats(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Невалиден ID на варианта',
          errors: errors.array()
        });
      }
      
      const { variant_id } = req.params;
      
      // Проверка на права
      if (!req.user.permissions?.includes('credit_notes.read')) {
        return res.status(403).json({
          success: false,
          message: 'Нямате права за преглед на статистики'
        });
      }
      
      const stats = await creditNotesService.getCreditNotesStats(variant_id);
      
      return res.status(200).json({
        success: true,
        data: {
          stats
        }
      });
      
    } catch (error) {
      console.error('Error in getCreditNotesStats:', error);
      
      return res.status(500).json({
        success: false,
        message: 'Грешка при получаване на статистиките',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Отмяна на кредитно известие (само draft статус)
   * DELETE /api/invoices/credit-note/:id
   */
  async cancelCreditNote(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Невалиден ID',
          errors: errors.array()
        });
      }
      
      const { id } = req.params;
      const userId = req.user.id;
      
      // Проверка на права
      if (!req.user.permissions?.includes('credit_notes.delete')) {
        return res.status(403).json({
          success: false,
          message: 'Нямате права за отмяна на кредитни известия'
        });
      }
      
      // Получаване на кредитното известие
      const creditNote = await creditNotesService.getCreditNoteById(id);
      
      // Проверка дали може да бъде отменено
      if (creditNote.status !== 'draft') {
        return res.status(400).json({
          success: false,
          message: 'Могат да се отменят само кредитни известия в статус "Чернова"'
        });
      }
      
      // Отмяна на кредитното известие
      const result = await creditNotesService.cancelCreditNote(id, userId);
      
      return res.status(200).json({
        success: true,
        message: 'Кредитното известие е отменено успешно',
        data: {
          creditNote: result.creditNote
        }
      });
      
    } catch (error) {
      console.error('Error in cancelCreditNote:', error);
      
      if (error.message.includes('не е намерено')) {
        return res.status(404).json({
          success: false,
          message: 'Кредитното известие не е намерено'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Грешка при отмяна на кредитното известие',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Преглед на кредитно известие в PDF формат (в браузъра)
   * GET /api/invoices/credit-note/:id/preview
   */
  async previewCreditNotePDF(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Невалиден ID',
          errors: errors.array()
        });
      }
      
      const { id } = req.params;
      
      // Проверка на права
      if (!req.user.permissions?.includes('credit_notes.read')) {
        return res.status(403).json({
          success: false,
          message: 'Нямате права за преглед на кредитни известия'
        });
      }
      
      // Генериране на PDF
      const pdfResult = await creditNotesService.generateCreditNotePDF(id, false);
      
      if (!pdfResult.success) {
        return res.status(500).json({
          success: false,
          message: 'Грешка при генериране на PDF',
          error: pdfResult.error
        });
      }
      
      // Проверка дали файлът съществува
      try {
        await fs.access(pdfResult.filePath);
      } catch (err) {
        return res.status(404).json({
          success: false,
          message: 'PDF файлът не е намерен'
        });
      }
      
      // Задаване на headers за preview (не download)
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Cache-Control', 'no-cache');
      
      // Изпращане на файла за преглед
      return res.sendFile(path.resolve(pdfResult.filePath));
      
    } catch (error) {
      console.error('Error in previewCreditNotePDF:', error);
      
      if (error.message.includes('не е намерено')) {
        return res.status(404).json({
          success: false,
          message: 'Кредитното известие не е намерено'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Грешка при преглед на PDF',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * Получаване на историята на кредитно известие
   * GET /api/invoices/credit-note/:id/history
   */
  async getCreditNoteHistory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Невалиден ID',
          errors: errors.array()
        });
      }
      
      const { id } = req.params;
      
      // Проверка на права
      if (!req.user.permissions?.includes('credit_notes.read')) {
        return res.status(403).json({
          success: false,
          message: 'Нямате права за преглед на историята'
        });
      }
      
      const history = await creditNotesService.getCreditNoteHistory(id);
      
      return res.status(200).json({
        success: true,
        data: {
          history
        }
      });
      
    } catch (error) {
      console.error('Error in getCreditNoteHistory:', error);
      
      if (error.message.includes('не е намерено')) {
        return res.status(404).json({
          success: false,
          message: 'Кредитното известие не е намерено'
        });
      }
      
      return res.status(500).json({
        success: false,
        message: 'Грешка при получаване на историята',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new CreditNotesController();