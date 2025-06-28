// ==============================================
// BACKEND INTEGRATION
// ==============================================

/**
 * 1. INTEGRATION В APP.JS
 * Добавете този ред в основния app.js файл
 */

// В app.js добавете:
const creditNotesRoutes = require('./routes/creditNotes');

// Добавете route към middleware stack-а:
app.use('/api/invoices', creditNotesRoutes);

// Пълен пример на app.js integration:
/*
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/invoices', require('./routes/creditNotes')); // <-- НОВА ЛИНИЯ

// Error handling
app.use(require('./middleware/errorHandler'));

module.exports = app;
*/

// ==============================================
// 2. PERMISSIONS SETUP
// ==============================================

/**
 * Добавете новите permissions в базата данни
 */

const creditNotePermissions = [
  {
    name: 'credit_notes.create',
    description: 'Създаване на кредитни известия',
    category: 'credit_notes'
  },
  {
    name: 'credit_notes.read',
    description: 'Преглед на кредитни известия',
    category: 'credit_notes'
  },
  {
    name: 'credit_notes.send',
    description: 'Изпращане на кредитни известия',
    category: 'credit_notes'
  },
  {
    name: 'credit_notes.delete',
    description: 'Отмяна на кредитни известия',
    category: 'credit_notes'
  }
];

// SQL за добавяне на permissions:
/*
INSERT INTO permissions (id, name, description, category, created_at, updated_at) VALUES
('uuid-1', 'credit_notes.create', 'Създаване на кредитни известия', 'credit_notes', NOW(), NOW()),
('uuid-2', 'credit_notes.read', 'Преглед на кредитни известия', 'credit_notes', NOW(), NOW()),
('uuid-3', 'credit_notes.send', 'Изпращане на кредитни известия', 'credit_notes', NOW(), NOW()),
('uuid-4', 'credit_notes.delete', 'Отмяна на кредитни известия', 'credit_notes', NOW(), NOW());
*/

// ==============================================
// 3. DATABASE MIGRATION (ако не е направена)
// ==============================================

/**
 * SQL Migration за кредитни известия поддръжка
 */

const migrationSQL = `
-- Добавяне на колони за кредитни известия (ако не съществуват)
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS invoice_category ENUM('original', 'credit_note') DEFAULT 'original',
ADD COLUMN IF NOT EXISTS invoice_type VARCHAR(50) NULL,
ADD COLUMN IF NOT EXISTS original_invoice_id CHAR(36) NULL,
ADD COLUMN IF NOT EXISTS reason TEXT NULL,
ADD COLUMN IF NOT EXISTS sent_at DATETIME NULL,
ADD COLUMN IF NOT EXISTS sent_to VARCHAR(255) NULL,
ADD COLUMN IF NOT EXISTS cancelled_at DATETIME NULL,
ADD COLUMN IF NOT EXISTS cancelled_by CHAR(36) NULL,
ADD INDEX idx_invoice_category (invoice_category),
ADD INDEX idx_original_invoice_id (original_invoice_id),
ADD FOREIGN KEY fk_original_invoice (original_invoice_id) REFERENCES invoices(id) ON DELETE SET NULL;

-- Audit trail таблица (ако не съществува)
CREATE TABLE IF NOT EXISTS audit_trail (
  id CHAR(36) PRIMARY KEY,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(50) NOT NULL,
  entity_id CHAR(36) NOT NULL,
  user_id CHAR(36) NULL,
  details JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_entity_id (entity, entity_id),
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
`;

// ==============================================
// 4. ENVIRONMENT VARIABLES
// ==============================================

/**
 * Добавете в .env файла
 */

const envVariables = `
# PDF Generation
PDF_STORAGE_PATH=/uploads/pdfs
PDF_MAX_SIZE=10MB

# Email Settings  
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Rate Limiting
RATE_LIMIT_PDF=10  # requests per minute
RATE_LIMIT_EMAIL=5 # requests per minute

# File Upload
MAX_FILE_SIZE=10MB
ALLOWED_FILE_TYPES=pdf,jpg,png
`;

// ==============================================
// 5. PACKAGE DEPENDENCIES
// ==============================================

/**
 * NPM packages които трябва да са инсталирани
 */

const requiredPackages = {
  "dependencies": {
    "express": "^4.18.2",
    "express-validator": "^6.15.0",
    "moment": "^2.29.4",
    "uuid": "^9.0.0",
    "mysql2": "^3.2.0",
    "nodemailer": "^6.9.1",
    "puppeteer": "^19.8.0", // за PDF генериране
    "helmet": "^6.1.5",
    "cors": "^2.8.5",
    "morgan": "^1.10.0"
  }
};

// Install command:
// npm install express express-validator moment uuid mysql2 nodemailer puppeteer helmet cors morgan

// ==============================================
// 6. TESTING SETUP
// ==============================================

/**
 * Jest test configuration
 */

const testConfig = {
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "jest": "^29.5.0",
    "supertest": "^6.3.3",
    "@types/jest": "^29.5.0"
  }
};

// ==============================================
// 7. API DOCUMENTATION
// ==============================================

/**
 * Swagger/OpenAPI документация
 */

const swaggerDocumentation = {
  "paths": {
    "/api/invoices/variant/{variantId}/credit-note": {
      "post": {
        "summary": "Създаване на кредитно известие",
        "tags": ["Credit Notes"],
        "security": [{"bearerAuth": []}],
        "parameters": [
          {
            "name": "variantId",
            "in": "path",
            "required": true,
            "schema": {"type": "string", "format": "uuid"}
          }
        ],
        "requestBody": {
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["original_invoice_id", "mode", "reason"],
                "properties": {
                  "original_invoice_id": {"type": "string", "format": "uuid"},
                  "mode": {"type": "string", "enum": ["amount", "items"]},
                  "reason": {"type": "string", "minLength": 10},
                  "amount": {"type": "number", "minimum": 0.01},
                  "items": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "product_id": {"type": "string", "format": "uuid"},
                        "quantity": {"type": "number", "minimum": 0.01}
                      }
                    }
                  },
                  "notes": {"type": "string", "maxLength": 1000}
                }
              }
            }
          }
        },
        "responses": {
          "201": {
            "description": "Кредитното известие е създадено успешно",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "success": {"type": "boolean"},
                    "message": {"type": "string"},
                    "data": {
                      "type": "object",
                      "properties": {
                        "creditNote": {"$ref": "#/components/schemas/CreditNote"}
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

// ==============================================
// 8. MONITORING & LOGGING
// ==============================================

/**
 * Winston logger configuration
 */

const loggerConfig = `
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'credit-notes' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

module.exports = logger;
`;

// ==============================================
// DEPLOYMENT CHECKLIST
// ==============================================

/**
 * ✅ Checklist за внедряване в продукция
 */

const deploymentChecklist = [
  '✅ Database migration изпълнена',
  '✅ Permissions добавени в базата',
  '✅ Environment variables конфигурирани', 
  '✅ NPM packages инсталирани',
  '✅ Routes интегрирани в app.js',
  '✅ PDF storage папка създадена',
  '✅ Email SMTP конфигуриран',
  '✅ Error logging активиран',
  '✅ API endpoints тествани',
  '✅ Permissions тествани',
  '✅ PDF генериране тествано',
  '✅ Email изпращане тествано',
  '✅ Rate limiting конфигуриран',
  '✅ Security headers активирани'
];

console.log('🚀 Backend Integration за кредитни известия готов!');
console.log('📋 Следвайте checklist-а за пълно внедряване');

module.exports = {
  creditNotePermissions,
  migrationSQL,
  envVariables,
  requiredPackages,
  testConfig,
  deploymentChecklist
};