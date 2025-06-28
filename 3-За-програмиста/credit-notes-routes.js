const express = require('express');
const router = express.Router();
const { body, param, query, validationResult } = require('express-validator');
const creditNotesController = require('../controllers/creditNotesController');
const auth = require('../middleware/auth');
const checkPermissions = require('../middleware/checkPermissions');

// ==============================================
// VALIDATION RULES
// ==============================================

/**
 * Валидация за създаване на кредитно известие
 */
const createCreditNoteValidation = [
  param('variant_id')
    .isUUID()
    .withMessage('Невалиден ID на варианта'),
  
  body('original_invoice_id')
    .isUUID()
    .withMessage('Невалиден ID на оригиналната фактура'),
  
  body('mode')
    .isIn(['amount', 'items'])
    .withMessage('Режимът трябва да е "amount" или "items"'),
  
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Причината трябва да е между 10 и 500 символа'),
  
  // Условни валидации за amount режим
  body('amount')
    .if(body('mode').equals('amount'))
    .isFloat({ min: 0.01 })
    .withMessage('Сумата трябва да е положително число'),
  
  // Условни валидации за items режим
  body('items')
    .if(body('mode').equals('items'))
    .isArray({ min: 1 })
    .withMessage('Трябва да изберете поне един артикул'),
  
  body('items.*.product_id')
    .if(body('mode').equals('items'))
    .isUUID()
    .withMessage('Невалиден ID на продукт'),
  
  body('items.*.quantity')
    .if(body('mode').equals('items'))
    .isFloat({ min: 0.01 })
    .withMessage('Количеството трябва да е положително число'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Бележките не могат да надвишават 1000 символа')
];

/**
 * Валидация за изпращане на кредитно известие
 */
const sendCreditNoteValidation = [
  param('id')
    .isUUID()
    .withMessage('Невалиден ID на кредитно известие'),
  
  body('email_to')
    .isEmail()
    .normalizeEmail()
    .withMessage('Невалиден email адрес за получаване'),
  
  body('email_subject')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Темата трябва да е между 5 и 200 символа'),
  
  body('email_body')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Съдържанието не може да надвишава 5000 символа'),
  
  body('send_copy_to')
    .optional()
    .isArray()
    .withMessage('Копието трябва да е масив с email адреси'),
  
  body('send_copy_to.*')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Невалиден email адрес в копието')
];

/**
 * Валидация за пагинация и филтри
 */
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Страницата трябва да е положително число'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Лимитът трябва да е между 1 и 100'),
  
  query('status')
    .optional()
    .isIn(['draft', 'sent', 'cancelled'])
    .withMessage('Невалиден статус'),
  
  query('date_from')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Невалидна начална дата'),
  
  query('date_to')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Невалидна крайна дата'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Търсенето трябва да е между 2 и 100 символа')
];

/**
 * Валидация за PDF параметри
 */
const pdfValidation = [
  param('id')
    .isUUID()
    .withMessage('Невалиден ID на кредитно известие'),
  
  query('regenerate')
    .optional()
    .isBoolean()
    .withMessage('Параметърът regenerate трябва да е boolean')
];

/**
 * Валидация за ID параметри
 */
const idValidation = [
  param('id')
    .isUUID()
    .withMessage('Невалиден ID на кредитно известие')
];

/**
 * Валидация за variant ID
 */
const variantIdValidation = [
  param('variant_id')
    .isUUID()
    .withMessage('Невалиден ID на варианта')
];

// ==============================================
// MIDDLEWARE ФУНКЦИИ
// ==============================================

/**
 * Middleware за обработка на валидационни грешки
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Невалидни данни',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

/**
 * Middleware за проверка на достъп до варианта
 */
const checkVariantAccess = async (req, res, next) => {
  try {
    const { variant_id } = req.params;
    const userId = req.user.id;
    
    // Тук трябва да проверим дали потребителят има достъп до този вариант
    // Това зависи от конкретната бизнес логика на приложението
    // За сега приемаме че имат достъп
    
    next();
  } catch (error) {
    console.error('Error checking variant access:', error);
    return res.status(500).json({
      success: false,
      message: 'Грешка при проверка на достъпа'
    });
  }
};

/**
 * Middleware за rate limiting (опционално)
 */
const rateLimitMiddleware = (req, res, next) => {
  // Може да се добави rate limiting за PDF генериране
  // За да се предотврати злоупотреба с ресурсите
  next();
};

// ==============================================
// ROUTES DEFINITIONS
// ==============================================

/**
 * @route   POST /api/invoices/variant/:variant_id/credit-note
 * @desc    Създаване на кредитно известие
 * @access  Private (requires: credit_notes.create)
 */
router.post('/variant/:variant_id/credit-note',
  auth.required,
  checkPermissions('credit_notes.create'),
  createCreditNoteValidation,
  handleValidationErrors,
  checkVariantAccess,
  creditNotesController.createCreditNote
);

/**
 * @route   GET /api/invoices/variant/:variant_id/credit-notes
 * @desc    Списък с кредитни известия за вариант
 * @access  Private (requires: credit_notes.read)
 */
router.get('/variant/:variant_id/credit-notes',
  auth.required,
  checkPermissions('credit_notes.read'),
  [
    ...variantIdValidation,
    ...paginationValidation
  ],
  handleValidationErrors,
  checkVariantAccess,
  creditNotesController.getCreditNotesByVariant
);

/**
 * @route   GET /api/invoices/variant/:variant_id/credit-notes/stats
 * @desc    Статистики за кредитни известия
 * @access  Private (requires: credit_notes.read)
 */
router.get('/variant/:variant_id/credit-notes/stats',
  auth.required,
  checkPermissions('credit_notes.read'),
  variantIdValidation,
  handleValidationErrors,
  checkVariantAccess,
  creditNotesController.getCreditNotesStats
);

/**
 * @route   GET /api/invoices/credit-note/:id
 * @desc    Детайли за кредитно известие
 * @access  Private (requires: credit_notes.read)
 */
router.get('/credit-note/:id',
  auth.required,
  checkPermissions('credit_notes.read'),
  idValidation,
  handleValidationErrors,
  creditNotesController.getCreditNoteDetails
);

/**
 * @route   POST /api/invoices/credit-note/:id/send
 * @desc    Изпращане на кредитно известие по email
 * @access  Private (requires: credit_notes.send)
 */
router.post('/credit-note/:id/send',
  auth.required,
  checkPermissions('credit_notes.send'),
  sendCreditNoteValidation,
  handleValidationErrors,
  creditNotesController.sendCreditNote
);

/**
 * @route   GET /api/invoices/credit-note/:id/pdf
 * @desc    Изтегляне на PDF файл
 * @access  Private (requires: credit_notes.read)
 */
router.get('/credit-note/:id/pdf',
  auth.required,
  checkPermissions('credit_notes.read'),
  pdfValidation,
  handleValidationErrors,
  rateLimitMiddleware,
  creditNotesController.downloadCreditNotePDF
);

/**
 * @route   GET /api/invoices/credit-note/:id/preview
 * @desc    Преглед на PDF в браузъра
 * @access  Private (requires: credit_notes.read)
 */
router.get('/credit-note/:id/preview',
  auth.required,
  checkPermissions('credit_notes.read'),
  pdfValidation,
  handleValidationErrors,
  rateLimitMiddleware,
  creditNotesController.previewCreditNotePDF
);

/**
 * @route   GET /api/invoices/credit-note/:id/history
 * @desc    История на кредитно известие
 * @access  Private (requires: credit_notes.read)
 */
router.get('/credit-note/:id/history',
  auth.required,
  checkPermissions('credit_notes.read'),
  idValidation,
  handleValidationErrors,
  creditNotesController.getCreditNoteHistory
);

/**
 * @route   DELETE /api/invoices/credit-note/:id
 * @desc    Отмяна на кредитно известие (само draft статус)
 * @access  Private (requires: credit_notes.delete)
 */
router.delete('/credit-note/:id',
  auth.required,
  checkPermissions('credit_notes.delete'),
  idValidation,
  handleValidationErrors,
  creditNotesController.cancelCreditNote
);

// ==============================================
// ERROR HANDLING MIDDLEWARE
// ==============================================

/**
 * Middleware за обработка на грешки в routes
 */
router.use((error, req, res, next) => {
  console.error('Credit Notes Route Error:', error);
  
  // Валидационни грешки
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Невалидни данни',
      errors: Object.values(error.errors).map(err => err.message)
    });
  }
  
  // Database грешки
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Записът вече съществува'
    });
  }
  
  if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({
      success: false,
      message: 'Невалидна връзка към друг запис'
    });
  }
  
  // JWT грешки
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Невалиден токен за достъп'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Токенът за достъп е изтекъл'
    });
  }
  
  // File system грешки
  if (error.code === 'ENOENT') {
    return res.status(404).json({
      success: false,
      message: 'Файлът не е намерен'
    });
  }
  
  if (error.code === 'EACCES') {
    return res.status(500).json({
      success: false,
      message: 'Няма права за достъп до файла'
    });
  }
  
  // Default грешка
  return res.status(500).json({
    success: false,
    message: 'Вътрешна грешка на сървъра',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// ==============================================
// EXPORT ROUTER
// ==============================================

module.exports = router;