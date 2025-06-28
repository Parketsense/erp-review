// =============================================
// PARKETSENSE - ORDERS MODULE
// Routes & Email Templates
// =============================================

// ============= ROUTES =============

// routes/orders.js
const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validateOrder, validateOrderStatus } = require('../middleware/validation');

// ========== CRUD Operations ==========

/**
 * @route GET /api/orders
 * @desc Get all orders with filters
 * @access Private
 * @query {string} [status] - Status filter (format: statusType:statusValue)
 * @query {string} [clientId] - Filter by client
 * @query {string} [projectId] - Filter by project
 * @query {string} [dateFrom] - Date range start (YYYY-MM-DD)
 * @query {string} [dateTo] - Date range end (YYYY-MM-DD)
 * @query {string} [search] - Search term
 */
router.get('/', authenticateToken, OrderController.getOrders);

/**
 * @route GET /api/orders/:id
 * @desc Get order details with full relations
 * @access Private
 */
router.get('/:id', authenticateToken, OrderController.getOrderDetails);

/**
 * @route POST /api/orders/from-variant/:variantId
 * @desc Create new order from approved variant
 * @access Private
 * @body {object} orderData - Order creation data
 */
router.post('/from-variant/:variantId', 
    authenticateToken, 
    validateOrder, 
    OrderController.createOrderFromVariant
);

/**
 * @route PUT /api/orders/:id/quantities-prices
 * @desc Update order quantities and prices
 * @access Private
 * @body {object} updateData - New quantities and prices
 */
router.put('/:id/quantities-prices', 
    authenticateToken, 
    OrderController.updateOrderQuantitiesAndPrices
);

/**
 * @route GET /api/orders/:id/profit-analysis
 * @desc Get profit analysis for order
 * @access Private
 */
router.get('/:id/profit-analysis', 
    authenticateToken, 
    OrderController.getProfitAnalysis
);

/**
 * @route PUT /api/orders/:id
 * @desc Update order details
 * @access Private
 */
router.put('/:id', 
    authenticateToken, 
    validateOrder, 
    OrderController.updateOrder
);

/**
 * @route DELETE /api/orders/:id
 * @desc Delete order (only if status is draft)
 * @access Admin
 */
router.delete('/:id', 
    authenticateToken, 
    requireRole(['admin']), 
    OrderController.deleteOrder
);

// ========== Status Management ==========

/**
 * @route PUT /api/orders/:id/status/:statusType
 * @desc Update order status (info/payment/delivery)
 * @access Private
 * @body {string} newStatus - New status value
 * @body {string} [notes] - Optional notes for status change
 */
router.put('/:id/status/:statusType', 
    authenticateToken, 
    validateOrderStatus, 
    OrderController.updateOrderStatus
);

/**
 * @route POST /api/orders/:id/confirm
 * @desc Confirm order and send email to suppliers
 * @access Private
 * @body {object} [attachmentData] - Optional file attachment
 */
router.post('/:id/confirm', 
    authenticateToken, 
    OrderController.confirmOrder
);

/**
 * @route GET /api/orders/:id/status-history
 * @desc Get order status change history
 * @access Private
 */
router.get('/:id/status-history', 
    authenticateToken, 
    OrderController.getStatusHistory
);

// ========== Financial Operations ==========

/**
 * @route POST /api/orders/:id/payments
 * @desc Add payment to order
 * @access Private
 * @body {object} paymentData - Payment details with additional info
 */
router.post('/:id/payments', 
    authenticateToken, 
    validatePayment,
    OrderController.addPayment
);

/**
 * @route GET /api/orders/:id/payments
 * @desc Get all payments for order
 * @access Private
 */
router.get('/:id/payments', 
    authenticateToken, 
    OrderController.getPayments
);

/**
 * @route PUT /api/orders/:id/payments/:paymentId
 * @desc Update payment details
 * @access Private
 */
router.put('/:id/payments/:paymentId', 
    authenticateToken, 
    validatePayment,
    OrderController.updatePayment
);

/**
 * @route DELETE /api/orders/:id/payments/:paymentId
 * @desc Delete payment
 * @access Admin
 */
router.delete('/:id/payments/:paymentId', 
    authenticateToken, 
    requireRole(['admin']), 
    OrderController.deletePayment
);

// ========== Delivery Operations ==========

/**
 * @route POST /api/orders/:id/deliveries
 * @desc Add delivery to order
 * @access Private
 * @body {object} deliveryData - Delivery details
 */
router.post('/:id/deliveries', 
    authenticateToken, 
    OrderController.addDelivery
);

/**
 * @route GET /api/orders/:id/deliveries
 * @desc Get all deliveries for order
 * @access Private
 */
router.get('/:id/deliveries', 
    authenticateToken, 
    OrderController.getDeliveries
);

/**
 * @route PUT /api/orders/:id/deliveries/:deliveryId
 * @desc Update delivery details
 * @access Private
 */
router.put('/:id/deliveries/:deliveryId', 
    authenticateToken, 
    OrderController.updateDelivery
);

// ========== Supplier Order Operations ==========

/**
 * @route POST /api/orders/:id/supplier-orders
 * @desc Add supplier order
 * @access Private
 * @body {object} supplierOrderData - Supplier order details
 */
router.post('/:id/supplier-orders', 
    authenticateToken, 
    OrderController.addSupplierOrder
);

/**
 * @route PUT /api/orders/:id/supplier-orders/:supplierOrderId
 * @desc Update supplier order
 * @access Private
 */
router.put('/:id/supplier-orders/:supplierOrderId', 
    authenticateToken, 
    OrderController.updateSupplierOrder
);

/**
 * @route POST /api/orders/:id/supplier-orders/:supplierOrderId/send-email
 * @desc Send confirmation email to supplier
 * @access Private
 */
router.post('/:id/supplier-orders/:supplierOrderId/send-email', 
    authenticateToken, 
    OrderController.sendSupplierEmail
);

// ========== Reporting & Analytics ==========

/**
 * @route GET /api/orders/reports/summary
 * @desc Get orders summary statistics
 * @access Private
 * @query {string} [period] - Time period (month/quarter/year)
 * @query {string} [clientId] - Filter by client
 */
router.get('/reports/summary', 
    authenticateToken, 
    OrderController.getOrdersSummary
);

/**
 * @route GET /api/orders/reports/financial
 * @desc Get financial report for orders
 * @access Private
 * @query {string} [dateFrom] - Date range start
 * @query {string} [dateTo] - Date range end
 */
router.get('/reports/financial', 
    authenticateToken, 
    OrderController.getFinancialReport
);

/**
 * @route GET /api/orders/reports/delivery-status
 * @desc Get delivery status report
 * @access Private
 */
router.get('/reports/delivery-status', 
    authenticateToken, 
    OrderController.getDeliveryReport
);

// ========== Export & Import ==========

/**
 * @route GET /api/orders/export/excel
 * @desc Export orders to Excel
 * @access Private
 * @query {object} filters - Same filters as orders list
 */
router.get('/export/excel', 
    authenticateToken, 
    OrderController.exportToExcel
);

/**
 * @route GET /api/orders/:id/generate-pdf
 * @desc Generate order confirmation PDF
 * @access Private
 */
router.get('/:id/generate-pdf', 
    authenticateToken, 
    OrderController.generateOrderPDF
);

module.exports = router;

// ============= MIDDLEWARE =============

// middleware/validation.js (Order validation functions)

const { body, param, validationResult } = require('express-validator');

const validateOrder = [
    body('orderDate')
        .optional()
        .isISO8601()
        .withMessage('Неправилен формат на дата'),
    
    body('expectedDeliveryDate')
        .optional()
        .isISO8601()
        .withMessage('Неправилен формат на дата за доставка'),
    
    body('currentTotalAmountBgn')
        .optional()
        .isNumeric()
        .withMessage('Общата сума трябва да бъде число')
        .isFloat({ min: 0 })
        .withMessage('Общата сума не може да бъде отрицателна'),

    body('currentQuantitySqm')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Количеството в кв.м. трябва да бъде положително число'),

    body('currentQuantityLm')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Количеството в л.м. трябва да бъде положително число'),

    body('currentUnitPriceEur')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Единичната цена трябва да бъде положително число'),

    body('currentTotalPriceEur')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Общата цена трябва да бъде положително число'),
    
    body('advancePercent')
        .optional()
        .isFloat({ min: 5, max: 100 })
        .withMessage('Процентът за авансово плащане трябва да бъде между 5% и 100%'),
    
    body('deliveryAddress')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Адресът за доставка е твърде дълъг'),

    body('additionalInfo')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Допълнителната информация е твърде дълга'),
    
    body('supplierOrders')
        .optional()
        .isArray()
        .withMessage('Поръчките към доставчици трябва да бъдат масив'),
    
    body('supplierOrders.*.totalAmount')
        .if(body('supplierOrders').exists())
        .isNumeric()
        .withMessage('Сумата за доставчик трябва да бъде число'),
    
    body('supplierOrders.*.contactEmail')
        .if(body('supplierOrders').exists())
        .optional()
        .isEmail()
        .withMessage('Неправилен email формат'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Грешка при валидация на данните',
                errors: errors.array()
            });
        }
        next();
    }
];

// Validation for payment with additional info
const validatePayment = [
    body('amountBgn')
        .isNumeric()
        .withMessage('Сумата трябва да бъде число')
        .isFloat({ min: 0.01 })
        .withMessage('Сумата трябва да бъде положителна'),
    
    body('paymentDate')
        .isISO8601()
        .withMessage('Неправилен формат на дата за плащане'),
    
    body('paymentType')
        .isIn(['advance', 'final', 'partial'])
        .withMessage('Неправилен тип плащане'),
    
    body('additionalInfo')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Допълнителната информация е твърде дълга'),
    
    body('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Бележките са твърде дълги'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Грешка при валидация на плащането',
                errors: errors.array()
            });
        }
        next();
    }
];

const validateOrderStatus = [
    param('statusType')
        .isIn(['info', 'payment', 'delivery'])
        .withMessage('Неправилен тип статус'),
    
    body('newStatus')
        .notEmpty()
        .withMessage('Новият статус е задължителен'),
    
    body('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Бележките са твърде дълги'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Грешка при валидация на статуса',
                errors: errors.array()
            });
        }
        next();
    }
];

// ============= EMAIL TEMPLATES =============

// templates/emails/order_confirmation_en.hbs
const orderConfirmationTemplateEN = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - {{orderNumber}}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        
        .header {
            background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 300;
        }
        
        .header .order-number {
            font-size: 14px;
            opacity: 0.8;
            margin-top: 5px;
        }
        
        .content {
            background: white;
            padding: 40px;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .greeting {
            font-size: 18px;
            margin-bottom: 30px;
            color: #2c3e50;
        }
        
        .order-details {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
            border-left: 4px solid #007bff;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .detail-label {
            font-weight: 600;
            color: #495057;
            flex: 1;
        }
        
        .detail-value {
            flex: 2;
            text-align: right;
            color: #212529;
        }

        .quantities-section {
            background: #e8f4f8;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }

        .quantities-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        .quantities-table th,
        .quantities-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }

        .quantities-table th {
            background-color: #f1f3f4;
            font-weight: 600;
        }

        .profit-info {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
        }
        
        .important-note {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
        }
        
        .important-note h3 {
            color: #856404;
            margin: 0 0 10px 0;
            font-size: 16px;
        }
        
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 30px;
            border-top: 2px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
        }
        
        .company-info {
            background: #e8f4f8;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
        }
        
        .company-info h3 {
            margin: 0 0 15px 0;
            color: #2c3e50;
        }
        
        .attachment-note {
            background: #d1ecf1;
            border: 1px solid #bee5eb;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            font-size: 14px;
        }

        .changes-section {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
        }

        .changes-section h4 {
            color: #721c24;
            margin: 0 0 10px 0;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .content {
                padding: 20px;
            }
            
            .detail-row {
                flex-direction: column;
            }
            
            .detail-value {
                text-align: left;
                margin-top: 5px;
            }

            .quantities-table {
                font-size: 12px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Order Confirmation</h1>
        <div class="order-number">Order #{{orderNumber}}</div>
    </div>
    
    <div class="content">
        <div class="greeting">
            Dear {{supplierName}},
        </div>
        
        <p>We are pleased to confirm our order with the following details:</p>
        
        <div class="order-details">
            <div class="detail-row">
                <span class="detail-label">Order Number:</span>
                <span class="detail-value"><strong>{{orderNumber}}</strong></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Order Date:</span>
                <span class="detail-value">{{formatDate orderDate}}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Requested Delivery Date:</span>
                <span class="detail-value">{{formatDate deliveryDate}}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Contact Person:</span>
                <span class="detail-value">{{contactPerson}}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Total Amount:</span>
                <span class="detail-value"><strong>€{{formatCurrency totalAmount}}</strong></span>
            </div>
        </div>

        {{#if hasQuantityChanges}}
        <div class="changes-section">
            <h4>⚠️ Important: Updated Quantities</h4>
            <p>Please note that the quantities have been updated from the original order:</p>
        </div>
        {{/if}}

        <div class="quantities-section">
            <h3>📋 Order Specifications</h3>
            <table class="quantities-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Original Qty</th>
                        <th>Current Qty</th>
                        <th>Unit Price €</th>
                        <th>Total €</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Linear meters (л.м.)</td>
                        <td>{{originalQuantityLm}}</td>
                        <td><strong>{{currentQuantityLm}}</strong></td>
                        <td>{{formatCurrency currentUnitPriceEur}}</td>
                        <td>{{formatCurrency (multiply currentQuantityLm currentUnitPriceEur)}}</td>
                    </tr>
                    <tr>
                        <td>Square meters (кв.м.)</td>
                        <td>{{originalQuantitySqm}}</td>
                        <td><strong>{{currentQuantitySqm}}</strong></td>
                        <td>{{formatCurrency currentTotalPriceEur}}</td>
                        <td>{{formatCurrency (multiply currentQuantitySqm currentTotalPriceEur)}}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div class="company-info">
            <h3>Project Information</h3>
            <p><strong>Project:</strong> {{projectName}}</p>
            <p><strong>Client:</strong> {{clientName}}</p>
            <p><strong>Delivery Address:</strong> {{deliveryAddress}}</p>
            {{#if additionalInfo}}
            <p><strong>Additional Information:</strong> {{additionalInfo}}</p>
            {{/if}}
        </div>

        {{#if profitInfo}}
        <div class="profit-info">
            <strong>📊 Internal Profit Analysis:</strong><br>
            Expected Profit: €{{formatCurrency profitInfo.amount}} ({{profitInfo.percentage}}%)<br>
            <em>This information is for internal use only and should not be shared with the client.</em>
        </div>
        {{/if}}
        
        {{#if hasAttachment}}
        <div class="attachment-note">
            <strong>📎 Attachment:</strong> Please find the detailed specifications and requirements in the attached document.
        </div>
        {{/if}}
        
        <div class="important-note">
            <h3>⚠️ Important Notes</h3>
            <ul>
                <li>Please confirm receipt of this order within 48 hours</li>
                <li>Any changes to delivery schedule must be communicated immediately</li>
                <li>Quality specifications must be strictly followed as per attached documents</li>
                <li>Delivery must be coordinated in advance with our site manager</li>
                {{#if hasQuantityChanges}}
                <li><strong>ATTENTION: Quantities have been updated - please confirm the new quantities</strong></li>
                {{/if}}
            </ul>
        </div>
        
        <p>Please confirm receipt of this order and provide us with:</p>
        <ul>
            <li>Order confirmation with your internal order number</li>
            <li>Confirmed delivery schedule based on updated quantities</li>
            <li>Contact details of delivery coordinator</li>
            {{#if hasQuantityChanges}}
            <li><strong>Confirmation of the updated quantities and pricing</strong></li>
            {{/if}}
        </ul>
        
        <p>Should you have any questions regarding this order, please do not hesitate to contact us immediately.</p>
        
        <p>Thank you for your continued partnership.</p>
        
        <div class="footer">
            <p><strong>PARKETSENSE</strong></p>
            <p>Professional Flooring Solutions</p>
            <p>📧 orders@parketsense.bg | 📞 +359 888 123 456</p>
            <p>🌐 www.parketsense.bg</p>
        </div>
    </div>
</body>
</html>
`;

// templates/emails/order_confirmation_bg.hbs (Bulgarian version)
const orderConfirmationTemplateBG = `
<!DOCTYPE html>
<html lang="bg">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Потвърждение за поръчка - {{orderNumber}}</title>
    <style>
        /* Same styles as English version */
    </style>
</head>
<body>
    <div class="header">
        <h1>Потвърждение за поръчка</h1>
        <div class="order-number">Поръчка №{{orderNumber}}</div>
    </div>
    
    <div class="content">
        <div class="greeting">
            Уважаеми {{supplierName}},
        </div>
        
        <p>С удоволствие потвърждаваме нашата поръчка със следните детайли:</p>
        
        <div class="order-details">
            <div class="detail-row">
                <span class="detail-label">Номер на поръчка:</span>
                <span class="detail-value"><strong>{{orderNumber}}</strong></span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Дата на поръчка:</span>
                <span class="detail-value">{{formatDate orderDate}}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Искана дата за доставка:</span>
                <span class="detail-value">{{formatDate deliveryDate}}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Контактно лице:</span>
                <span class="detail-value">{{contactPerson}}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Обща сума:</span>
                <span class="detail-value"><strong>€{{formatCurrency totalAmount}}</strong></span>
            </div>
        </div>
        
        <!-- Rest of Bulgarian template content -->
    </div>
</body>
</html>
`;

// ============= EMAIL SERVICE INTEGRATION =============

// services/OrderEmailService.js (Order-specific methods)
class OrderEmailService {
    
    /**
     * Send order confirmation email to supplier with updated quantities and prices
     * @param {Object} orderData - Order information
     * @param {Object} supplierData - Supplier information
     * @param {Array} attachments - File attachments
     * @param {string} language - Email language (en/bg)
     */
    async sendOrderConfirmation(orderData, supplierData, attachments = [], language = 'en') {
        try {
            const template = language === 'bg' ? 'order_confirmation_bg' : 'order_confirmation_en';
            const subject = language === 'bg' 
                ? `Потвърждение за поръчка - ${orderData.orderNumber}`
                : `Order Confirmation - ${orderData.orderNumber}`;

            // Check if quantities or prices have been changed
            const hasQuantityChanges = this.hasQuantityOrPriceChanges(orderData);
            
            // Calculate profit information (for internal use)
            const profitInfo = this.calculateProfitInfo(orderData);

            const emailData = {
                to: supplierData.contactEmail,
                cc: process.env.ORDER_CC_EMAIL, // Optional CC to internal team
                subject,
                template,
                data: {
                    orderNumber: orderData.orderNumber,
                    supplierName: supplierData.name || supplierData.contactPerson,
                    orderDate: orderData.orderDate,
                    deliveryDate: orderData.expectedDeliveryDate,
                    contactPerson: supplierData.contactPerson,
                    
                    // Financial data - use current amounts
                    totalAmount: orderData.currentTotalAmountEur || orderData.originalTotalAmountEur,
                    
                    // Quantity data
                    originalQuantityLm: orderData.originalQuantityLm,
                    originalQuantitySqm: orderData.originalQuantitySqm,
                    currentQuantityLm: orderData.currentQuantityLm,
                    currentQuantitySqm: orderData.currentQuantitySqm,
                    
                    // Price data
                    currentUnitPriceEur: orderData.currentUnitPriceEur,
                    currentTotalPriceEur: orderData.currentTotalPriceEur,
                    
                    // Project information
                    projectName: orderData.projectName,
                    clientName: orderData.clientName,
                    deliveryAddress: orderData.deliveryAddress,
                    additionalInfo: orderData.additionalInfo,
                    
                    // Status flags
                    hasAttachment: attachments.length > 0,
                    hasQuantityChanges,
                    
                    // Profit information (internal)
                    profitInfo: profitInfo && profitInfo.amount > 0 ? profitInfo : null,
                    
                    // Helper functions for template
                    formatDate: (date) => moment(date).format('DD.MM.YYYY'),
                    formatCurrency: (amount) => parseFloat(amount || 0).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }),
                    multiply: (a, b) => (parseFloat(a || 0) * parseFloat(b || 0))
                },
                attachments
            };

            const result = await this.sendEmail(emailData);
            
            // Log email sending with additional context
            await this.logEmailActivity({
                type: 'order_confirmation',
                orderId: orderData.id,
                recipient: supplierData.contactEmail,
                subject,
                status: 'sent',
                attachmentCount: attachments.length,
                hasQuantityChanges,
                metadata: {
                    originalTotal: orderData.originalTotalAmountEur,
                    currentTotal: orderData.currentTotalAmountEur,
                    profitAmount: profitInfo?.amount
                }
            });

            return result;

        } catch (error) {
            // Log error with context
            await this.logEmailActivity({
                type: 'order_confirmation',
                orderId: orderData.id,
                recipient: supplierData.contactEmail,
                status: 'failed',
                error: error.message,
                hasQuantityChanges: this.hasQuantityOrPriceChanges(orderData)
            });
            
            throw error;
        }
    }

    /**
     * Check if quantities or prices have been changed from original
     * @param {Object} orderData - Order data
     * @returns {boolean} - True if changes detected
     */
    hasQuantityOrPriceChanges(orderData) {
        const quantityChanged = 
            parseFloat(orderData.originalQuantityLm || 0) !== parseFloat(orderData.currentQuantityLm || 0) ||
            parseFloat(orderData.originalQuantitySqm || 0) !== parseFloat(orderData.currentQuantitySqm || 0);
            
        const priceChanged = 
            parseFloat(orderData.originalUnitPriceEur || 0) !== parseFloat(orderData.currentUnitPriceEur || 0) ||
            parseFloat(orderData.originalTotalPriceEur || 0) !== parseFloat(orderData.currentTotalPriceEur || 0);
            
        const totalChanged = 
            parseFloat(orderData.originalTotalAmountEur || 0) !== parseFloat(orderData.currentTotalAmountEur || 0);

        return quantityChanged || priceChanged || totalChanged;
    }

    /**
     * Calculate profit information for internal use
     * @param {Object} orderData - Order data
     * @returns {Object|null} - Profit information
     */
    calculateProfitInfo(orderData) {
        if (!orderData.currentTotalAmountEur || !orderData.currentTotalPriceEur) {
            return null;
        }

        const totalAmount = parseFloat(orderData.currentTotalAmountEur);
        const totalCost = parseFloat(orderData.currentTotalPriceEur);
        const profitAmount = totalAmount - totalCost;
        const profitPercentage = totalAmount > 0 ? (profitAmount / totalAmount) * 100 : 0;

        return {
            amount: profitAmount,
            percentage: profitPercentage.toFixed(1)
        };
    }

    /**
     * Send payment notification with additional info
     * @param {Object} orderData - Order information
     * @param {Object} paymentData - Payment information
     */
    async sendPaymentNotification(orderData, paymentData) {
        try {
            const subject = `Payment Received - ${orderData.orderNumber}`;
            
            // Include additional payment info in the notification
            const additionalInfoText = paymentData.additionalInfo ? 
                ` (${paymentData.additionalInfo})` : '';
            
            const emailData = {
                to: process.env.FINANCE_EMAIL || 'finance@parketsense.bg',
                subject,
                template: 'payment_notification',
                data: {
                    orderNumber: orderData.orderNumber,
                    projectName: orderData.projectName,
                    clientName: orderData.clientName,
                    paymentAmount: paymentData.amountBgn,
                    paymentDate: paymentData.paymentDate,
                    paymentType: paymentData.paymentType,
                    additionalInfo: paymentData.additionalInfo,
                    additionalInfoText: additionalInfoText,
                    referenceNumber: paymentData.referenceNumber,
                    remainingAmount: orderData.remainingAmountBgn,
                    orderUrl: `${process.env.FRONTEND_URL}/orders/${orderData.id}`,
                    
                    // Financial summary
                    totalAmount: orderData.currentTotalAmountBgn,
                    paidAmount: orderData.paidAmountBgn,
                    paymentProgress: ((orderData.paidAmountBgn / orderData.currentTotalAmountBgn) * 100).toFixed(1)
                }
            };

            return await this.sendEmail(emailData);

        } catch (error) {
            console.error('Failed to send payment notification:', error);
        }
    }

    /**
     * Send order status update notification with quantity changes
     * @param {Object} orderData - Order information
     * @param {string} statusType - Type of status changed
     * @param {string} newStatus - New status value
     * @param {string} notes - Optional notes
     */
    async sendStatusUpdateNotification(orderData, statusType, newStatus, notes = '') {
        try {
            const subject = `Order Status Update - ${orderData.orderNumber}`;
            
            const emailData = {
                to: process.env.ORDER_NOTIFICATIONS_EMAIL || 'orders@parketsense.bg',
                subject,
                template: 'order_status_update',
                data: {
                    orderNumber: orderData.orderNumber,
                    projectName: orderData.projectName,
                    clientName: orderData.clientName,
                    statusType,
                    newStatus,
                    notes,
                    updatedAt: new Date(),
                    orderUrl: `${process.env.FRONTEND_URL}/orders/${orderData.id}`,
                    
                    // Include quantity/price change information
                    hasQuantityChanges: this.hasQuantityOrPriceChanges(orderData),
                    currentQuantityLm: orderData.currentQuantityLm,
                    currentQuantitySqm: orderData.currentQuantitySqm,
                    currentTotalAmount: orderData.currentTotalAmountEur,
                    profitInfo: this.calculateProfitInfo(orderData)
                }
            };

            return await this.sendEmail(emailData);

        } catch (error) {
            console.error('Failed to send status update notification:', error);
            // Don't throw - this is not critical
        }
    }

    /**
     * Send internal profit analysis notification
     * @param {Object} orderData - Order information
     * @param {Object} changes - What was changed
     */
    async sendProfitAnalysisNotification(orderData, changes) {
        try {
            const subject = `Profit Analysis Update - ${orderData.orderNumber}`;
            
            const originalProfit = (orderData.originalTotalAmountEur || 0) - (orderData.originalTotalPriceEur || 0);
            const currentProfit = (orderData.currentTotalAmountEur || 0) - (orderData.currentTotalPriceEur || 0);
            const profitChange = currentProfit - originalProfit;
            
            const emailData = {
                to: process.env.MANAGEMENT_EMAIL || 'management@parketsense.bg',
                subject,
                template: 'profit_analysis_update',
                data: {
                    orderNumber: orderData.orderNumber,
                    projectName: orderData.projectName,
                    clientName: orderData.clientName,
                    
                    originalProfit: originalProfit,
                    currentProfit: currentProfit,
                    profitChange: profitChange,
                    profitChangePercentage: originalProfit > 0 ? ((profitChange / originalProfit) * 100).toFixed(1) : 0,
                    
                    changes: changes,
                    updatedAt: new Date(),
                    orderUrl: `${process.env.FRONTEND_URL}/orders/${orderData.id}`,
                    
                    formatCurrency: (amount) => parseFloat(amount || 0).toLocaleString('bg-BG', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })
                }
            };

            return await this.sendEmail(emailData);

        } catch (error) {
            console.error('Failed to send profit analysis notification:', error);
        }
    }

    /**
     * Log email activity for audit trail with enhanced metadata
     */
    async logEmailActivity(activityData) {
        try {
            // Enhanced logging with more context
            await EmailLog.create({
                type: activityData.type,
                orderId: activityData.orderId,
                recipient: activityData.recipient,
                subject: activityData.subject,
                status: activityData.status,
                error: activityData.error,
                attachmentCount: activityData.attachmentCount || 0,
                hasQuantityChanges: activityData.hasQuantityChanges || false,
                metadata: JSON.stringify(activityData.metadata || {}),
                sentAt: new Date()
            });
        } catch (error) {
            console.error('Failed to log email activity:', error);
        }
    }
}

module.exports = new OrderEmailService();

// ============= EXPORT CONFIGURATION =============

module.exports = {
    routes: router,
    validation: { validateOrder, validateOrderStatus },
    emailTemplates: {
        orderConfirmationEN: orderConfirmationTemplateEN,
        orderConfirmationBG: orderConfirmationTemplateBG
    },
    EmailService: OrderEmailService
};