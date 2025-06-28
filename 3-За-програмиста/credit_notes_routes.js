// /api/routes/creditNotes.js

const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();

const creditNotesController = require('../controllers/creditNotesController');
const auth = require('../middleware/auth');
const checkPermissions = require('../middleware/checkPermissions');

// Валидационни схеми
const createCreditNoteValidation = [
  param('variant_id').isUUID().withMessage('Невалиден ID на вариант'),
  
  body('original_invoice_id')
    .isUUID()
    .withMessage('Невалиден ID на оригинална фактура'),
  
  body('mode')
    .isIn(['amount', 'items'])
    .withMessage('Режимът трябва да е "amount" или "items"'),
  
  body('reason')
    .isLength({ min: 5, max: 500 })
    .withMessage('Причината трябва да е между 5 и 500 символа'),
  
  body('currency')
    .optional()
    .isIn(['BGN', 'EUR'])
    .withMessage('Валутата трябва да е BGN или EUR'),
  
  // Условна валидация за amount режим
  body('amount')
    .if(body('mode').equals('amount'))
    .isFloat({ min: 0.01 })
    .withMessage('Сумата трябва да е положително число'),
  
  // Условна валидация за items режим  
  body('items')
    .if(body('mode').equals('items'))
    .isArray({ min: 1 })
    .withMessage('Трябва да има поне един артикул'),
  
  body('items.*.product_id')
    .if(body('mode').equals('items'))
    .isUUID()
    .withMessage('Невалиден product_id'),
  
  body('items.*.quantity')
    .if(body('mode').equals('items'))
    .isFloat({ min: 0.01 })
    .withMessage('Количеството трябва да е положително число'),
  
  body('items.*.reason')
    .if(body('mode').equals('items'))
    .isLength({ min: 3, max: 200 })
    .withMessage('Причината за артикула трябва да е между 3 и 200 символа')
];

const sendCreditNoteValidation = [
  param('id').isUUID().withMessage('Невалиден ID на кредитно известие'),
  
  body('email_to')
    .isEmail()
    .withMessage('Невалиден email адрес'),
  
  body('email_subject')
    .isLength({ min: 5, max: 200 })
    .withMessage('Subject трябва да е между 5 и 200 символа'),
  
  body('email_body')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Съдържанието не може да надвишава 2000 символа'),
  
  body('send_copy_to')
    .optional()
    .isArray()
    .withMessage('send_copy_to трябва да е масив'),
  
  body('send_copy_to.*')
    .optional()
    .isEmail()
    .withMessage('Невалиден email адрес в copy списъка')
];

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
    .withMessage('Невалидна начална дата'),
  
  query('date_to')
    .optional()
    .isISO8601()
    .withMessage('Невалидна крайна дата')
];

// ==============================================
// ROUTES
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
    param('variant_id').isUUID().withMessage('Невалиден ID на вариант'),
    ...paginationValidation
  ],
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
  [param('variant_id').isUUID().withMessage('Невалиден ID на вариант')],
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
  [param('id').isUUID().withMessage('Невалиден ID на кредитно известие')],
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
  creditNotesController.sendCreditNote
);

/**
 * @route   GET /api/invoices/credit-note/:id/pdf
 * @desc    Генериране/изтегляне на PDF
 * @access  Private (requires: credit_notes.read)
 */
router.get('/credit-note/:id/pdf',
  auth.required,
  checkPermissions('credit_notes.read'),
  [
    param('id').isUUID().withMessage('Невалиден ID на кредитно известие'),
    query('regenerate').optional().isBoolean().withMessage('regenerate трябва да е boolean')
  ],
  creditNotesController.downloadCreditNotePDF
);

/**
 * @route   DELETE /api/invoices/credit-note/:id
 * @desc    Отмяна на кредитно известие (само draft статус)
 * @access  Private (requires: credit_notes.delete)
 */
router.delete('/credit-note/:id',
  auth.required,
  checkPermissions('credit_notes.delete'),
  [param('id').isUUID().withMessage('Невалиден ID на кредитно известие')],
  creditNotesController.cancelCreditNote
);

// ==============================================
// MIDDLEWARE ЗА ПРОВЕРКА НА ПРАВА
// ==============================================

// /api/middleware/checkPermissions.js
function checkPermissions(requiredPermission) {
  return (req, res, next) => {
    const userPermissions = req.user.permissions || [];
    
    // Проверка дали потребителят има нужното право
    if (!userPermissions.includes(requiredPermission) && !userPermissions.includes('admin')) {
      return res.status(403).json({
        success: false,
        message: 'Нямате права за тази операция',
        required_permission: requiredPermission
      });
    }
    
    next();
  };
}

// ==============================================
// ERROR HANDLER MIDDLEWARE
// ==============================================

// Middleware за обработка на грешки при валидация
router.use((error, req, res, next) => {
  if (error.type === 'validation') {
    return res.status(400).json({
      success: false,
      message: 'Грешки във валидацията',
      errors: error.errors
    });
  }
  
  // Други типове грешки
  console.error('Credit Notes Route Error:', error);
  res.status(500).json({
    success: false,
    message: 'Възникна сървърна грешка'
  });
});

module.exports = router;

// ==============================================
// ПРИМЕРИ ЗА ИЗПОЛЗВАНЕ
// ==============================================

/*
// 1. Създаване на кредитно известие по сума
POST /api/invoices/variant/123e4567-e89b-12d3-a456-426614174000/credit-note
{
  "original_invoice_id": "123e4567-e89b-12d3-a456-426614174001",
  "mode": "amount",
  "amount": 150.50,
  "reason": "Грешка в цената на продукта",
  "currency": "BGN"
}

// 2. Създаване на кредитно известие по артикули
POST /api/invoices/variant/123e4567-e89b-12d3-a456-426614174000/credit-note
{
  "original_invoice_id": "123e4567-e89b-12d3-a456-426614174001",
  "mode": "items",
  "reason": "Върнати продукти от клиента",
  "items": [
    {
      "product_id": "123e4567-e89b-12d3-a456-426614174002",
      "quantity": 2,
      "reason": "Дефектен продукт"
    },
    {
      "product_id": "123e4567-e89b-12d3-a456-426614174003", 
      "quantity": 1,
      "reason": "Неподходящ цвят"
    }
  ]
}

// 3. Изпращане на кредитно известие
POST /api/invoices/credit-note/123e4567-e89b-12d3-a456-426614174004/send
{
  "email_to": "client@example.com",
  "email_subject": "Кредитно известие CN2025-001513",
  "email_body": "Моля, намерете приложеното кредитно известие...",
  "send_copy_to": ["accounting@company.com"]
}

// 4. Списък с кредитни известия
GET /api/invoices/variant/123e4567-e89b-12d3-a456-426614174000/credit-notes?page=1&limit=10&status=sent

// 5. Изтегляне на PDF
GET /api/invoices/credit-note/123e4567-e89b-12d3-a456-426614174004/pdf?regenerate=true
*/