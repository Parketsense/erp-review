// =============================================
// PARKETSENSE - ORDERS MODULE BACKEND
// Services & Controllers
// =============================================

// ============= MODELS =============

// models/Order.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    orderNumber: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        field: 'order_number'
    },
    variantId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'variant_id'
    },
    clientId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'client_id'
    },
    projectId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'project_id'
    },
    phaseId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'phase_id'
    },
    orderDate: {
        type: DataTypes.DATEONLY,
        defaultValue: DataTypes.NOW,
        field: 'order_date'
    },
    expectedDeliveryDate: {
        type: DataTypes.DATEONLY,
        field: 'expected_delivery_date'
    },
    actualDeliveryDate: {
        type: DataTypes.DATEONLY,
        field: 'actual_delivery_date'
    },
    infoStatus: {
        type: DataTypes.ENUM('not_confirmed', 'confirmed'),
        defaultValue: 'not_confirmed',
        field: 'info_status'
    },
    paymentStatus: {
        type: DataTypes.ENUM('not_paid', 'advance_paid', 'fully_paid'),
        defaultValue: 'not_paid',
        field: 'payment_status'
    },
    deliveryStatus: {
        type: DataTypes.ENUM('pending', 'partial', 'completed'),
        defaultValue: 'pending',
        field: 'delivery_status'
    },
    lastStatusUpdate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'last_status_update'
    },
    lastStatusType: {
        type: DataTypes.ENUM('info', 'payment', 'delivery'),
        defaultValue: 'info',
        field: 'last_status_type'
    },
    
    // Оригинални данни от варианта
    originalTotalAmountBgn: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: 'original_total_amount_bgn'
    },
    originalTotalAmountEur: {
        type: DataTypes.DECIMAL(12, 2),
        field: 'original_total_amount_eur'
    },
    originalQuantitySqm: {
        type: DataTypes.DECIMAL(10, 3),
        field: 'original_quantity_sqm'
    },
    originalQuantityLm: {
        type: DataTypes.DECIMAL(10, 3),
        field: 'original_quantity_lm'
    },
    originalUnitPriceEur: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'original_unit_price_eur'
    },
    originalTotalPriceEur: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'original_total_price_eur'
    },
    
    // Актуални данни (редактируеми)
    currentTotalAmountBgn: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: 'current_total_amount_bgn'
    },
    currentTotalAmountEur: {
        type: DataTypes.DECIMAL(12, 2),
        field: 'current_total_amount_eur'
    },
    currentQuantitySqm: {
        type: DataTypes.DECIMAL(10, 3),
        field: 'current_quantity_sqm'
    },
    currentQuantityLm: {
        type: DataTypes.DECIMAL(10, 3),
        field: 'current_quantity_lm'
    },
    currentUnitPriceEur: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'current_unit_price_eur'
    },
    currentTotalPriceEur: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'current_total_price_eur'
    },
    
    // Изчислени полета за печалба
    profitAmountEur: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'profit_amount_eur'
    },
    profitPercentage: {
        type: DataTypes.DECIMAL(5, 2),
        field: 'profit_percentage'
    },
    
    advanceAmountBgn: {
        type: DataTypes.DECIMAL(12, 2),
        field: 'advance_amount_bgn'
    },
    advancePercent: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 70.00,
        field: 'advance_percent'
    },
    paidAmountBgn: {
        type: DataTypes.DECIMAL(12, 2),
        defaultValue: 0,
        field: 'paid_amount_bgn'
    },
    remainingAmountBgn: {
        type: DataTypes.DECIMAL(12, 2),
        field: 'remaining_amount_bgn'
    },
    deliveryAddress: {
        type: DataTypes.TEXT,
        field: 'delivery_address'
    },
    deliveryNotes: {
        type: DataTypes.TEXT,
        field: 'delivery_notes'
    },
    confirmationDocumentUrl: {
        type: DataTypes.STRING(500),
        field: 'confirmation_document_url'
    },
    attachmentFileUrl: {
        type: DataTypes.STRING(500),
        field: 'attachment_file_url'
    },
    attachmentFilename: {
        type: DataTypes.STRING(255),
        field: 'attachment_filename'
    },
    confirmationEmailSent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'confirmation_email_sent'
    },
    confirmationEmailSentAt: {
        type: DataTypes.DATE,
        field: 'confirmation_email_sent_at'
    },
    internalNotes: {
        type: DataTypes.TEXT,
        field: 'internal_notes'
    },
    additionalInfo: {
        type: DataTypes.TEXT,
        field: 'additional_info'
    },
    createdBy: {
        type: DataTypes.UUID,
        field: 'created_by'
    },
    updatedBy: {
        type: DataTypes.UUID,
        field: 'updated_by'
    }
}, {
    tableName: 'orders',
    underscored: true
});

// models/SupplierOrder.js
const SupplierOrder = sequelize.define('SupplierOrder', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'order_id'
    },
    supplierId: {
        type: DataTypes.UUID,
        field: 'supplier_id'
    },
    manufacturerId: {
        type: DataTypes.UUID,
        field: 'manufacturer_id'
    },
    supplierOrderNumber: {
        type: DataTypes.STRING(100),
        field: 'supplier_order_number'
    },
    status: {
        type: DataTypes.ENUM('draft', 'sent', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled'),
        defaultValue: 'draft'
    },
    totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: 'total_amount'
    },
    contactPerson: {
        type: DataTypes.STRING(200),
        field: 'contact_person'
    },
    contactEmail: {
        type: DataTypes.STRING(100),
        field: 'contact_email'
    },
    contactPhone: {
        type: DataTypes.STRING(20),
        field: 'contact_phone'
    }
}, {
    tableName: 'supplier_orders',
    underscored: true
});

// models/OrderPayment.js
const OrderPayment = sequelize.define('OrderPayment', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'order_id'
    },
    paymentType: {
        type: DataTypes.ENUM('advance', 'final', 'partial'),
        allowNull: false,
        field: 'payment_type'
    },
    amountBgn: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        field: 'amount_bgn'
    },
    paymentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'payment_date'
    },
    referenceNumber: {
        type: DataTypes.STRING(100),
        field: 'reference_number'
    },
    swiftFileUrl: {
        type: DataTypes.STRING(500),
        field: 'swift_file_url'
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'failed'),
        defaultValue: 'pending'
    },
    notes: DataTypes.TEXT,
    additionalInfo: {
        type: DataTypes.STRING(500),
        field: 'additional_info'
    },
    createdBy: {
        type: DataTypes.UUID,
        field: 'created_by'
    }
}, {
    tableName: 'order_payments',
    underscored: true
});

// models/OrderDelivery.js
const OrderDelivery = sequelize.define('OrderDelivery', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'order_id'
    },
    deliveryNumber: {
        type: DataTypes.STRING(100),
        field: 'delivery_number'
    },
    deliveryDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'delivery_date'
    },
    transportCompany: {
        type: DataTypes.STRING(255),
        field: 'transport_company'
    },
    deliveredQuantitySqm: {
        type: DataTypes.DECIMAL(10, 2),
        field: 'delivered_quantity_sqm'
    },
    deliveredPackages: {
        type: DataTypes.INTEGER,
        field: 'delivered_packages'
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'in_transit', 'delivered', 'failed'),
        defaultValue: 'scheduled'
    },
    trackingNumber: {
        type: DataTypes.STRING(100),
        field: 'tracking_number'
    },
    deliveryNotes: {
        type: DataTypes.TEXT,
        field: 'delivery_notes'
    },
    createdBy: {
        type: DataTypes.UUID,
        field: 'created_by'
    }
}, {
    tableName: 'order_deliveries',
    underscored: true
});

// ============= SERVICES =============

// services/OrderService.js
const Order = require('../models/Order');
const SupplierOrder = require('../models/SupplierOrder');
const OrderPayment = require('../models/OrderPayment');
const OrderDelivery = require('../models/OrderDelivery');
const OfferVariant = require('../models/OfferVariant');
const EmailService = require('./EmailService');
const sequelize = require('../config/database');

class OrderService {
    
    // Създаване на поръчка от вариант
    async createOrderFromVariant(variantId, orderData, userId) {
        const transaction = await sequelize.transaction();
        
        try {
            // Намиране на варианта
            const variant = await OfferVariant.findByPk(variantId, {
                include: [
                    'phase',
                    'phase.project',
                    'phase.project.client',
                    'rooms',
                    'rooms.products'
                ],
                transaction
            });

            if (!variant) {
                throw new Error('Варианта не е намерен');
            }

            if (variant.status !== 'accepted') {
                throw new Error('Могат да се създават поръчки само от одобрени варианти');
            }

            // Генериране на поръчков номер
            const orderNumber = await this.generateOrderNumber();

            // Изчисляване на суми от варианта
            const originalTotalAmountBgn = variant.totalBgn;
            const originalTotalAmountEur = variant.totalEur;
            const advancePercent = orderData.advancePercent || 70;
            const advanceAmount = originalTotalAmountBgn * (advancePercent / 100);

            // Извличане на количества и цени от варианта (примерни стойности)
            const originalQuantitySqm = variant.totalSqm || 0;
            const originalQuantityLm = variant.totalLm || 0;
            const originalUnitPriceEur = variant.avgUnitPriceEur || 0;
            const originalTotalPriceEur = variant.totalCostEur || 0;

            // Създаване на поръчката
            const order = await Order.create({
                orderNumber,
                variantId,
                clientId: variant.phase.project.clientId,
                projectId: variant.phase.projectId,
                phaseId: variant.phaseId,
                orderDate: orderData.orderDate || new Date(),
                expectedDeliveryDate: orderData.expectedDeliveryDate,
                
                // Оригинални данни (запазват се от варианта)
                originalTotalAmountBgn,
                originalTotalAmountEur,
                originalQuantitySqm,
                originalQuantityLm,
                originalUnitPriceEur,
                originalTotalPriceEur,
                
                // Актуални данни (първоначално същите като оригиналните)
                currentTotalAmountBgn: originalTotalAmountBgn,
                currentTotalAmountEur: originalTotalAmountEur,
                currentQuantitySqm: originalQuantitySqm,
                currentQuantityLm: originalQuantityLm,
                currentUnitPriceEur: originalUnitPriceEur,
                currentTotalPriceEur: originalTotalPriceEur,
                
                advanceAmountBgn: advanceAmount,
                advancePercent,
                deliveryAddress: orderData.deliveryAddress,
                deliveryNotes: orderData.deliveryNotes,
                internalNotes: orderData.internalNotes,
                additionalInfo: orderData.additionalInfo,
                createdBy: userId
            }, { transaction });

            // Създаване на supplier orders ако са предоставени
            if (orderData.supplierOrders && orderData.supplierOrders.length > 0) {
                for (const supplierOrderData of orderData.supplierOrders) {
                    await SupplierOrder.create({
                        orderId: order.id,
                        supplierId: supplierOrderData.supplierId,
                        manufacturerId: supplierOrderData.manufacturerId,
                        totalAmount: supplierOrderData.totalAmount,
                        contactPerson: supplierOrderData.contactPerson,
                        contactEmail: supplierOrderData.contactEmail,
                        contactPhone: supplierOrderData.contactPhone
                    }, { transaction });
                }
            }

            await transaction.commit();
            return order;

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Обновяване на количества и цени в поръчката
    async updateOrderQuantitiesAndPrices(orderId, updateData, userId) {
        const transaction = await sequelize.transaction();
        
        try {
            const order = await Order.findByPk(orderId, { transaction });
            if (!order) {
                throw new Error('Поръчката не е намерена');
            }

            // Обновяване на актуалните данни
            const updateFields = {
                updatedBy: userId
            };

            if (updateData.currentQuantitySqm !== undefined) {
                updateFields.currentQuantitySqm = updateData.currentQuantitySqm;
            }
            if (updateData.currentQuantityLm !== undefined) {
                updateFields.currentQuantityLm = updateData.currentQuantityLm;
            }
            if (updateData.currentUnitPriceEur !== undefined) {
                updateFields.currentUnitPriceEur = updateData.currentUnitPriceEur;
            }
            if (updateData.currentTotalPriceEur !== undefined) {
                updateFields.currentTotalPriceEur = updateData.currentTotalPriceEur;
            }
            if (updateData.currentTotalAmountEur !== undefined) {
                updateFields.currentTotalAmountEur = updateData.currentTotalAmountEur;
            }
            if (updateData.currentTotalAmountBgn !== undefined) {
                updateFields.currentTotalAmountBgn = updateData.currentTotalAmountBgn;
            }
            if (updateData.additionalInfo !== undefined) {
                updateFields.additionalInfo = updateData.additionalInfo;
            }

            await order.update(updateFields, { transaction });

            // Запазване в история на промените
            await OrderStatusHistory.create({
                orderId,
                statusType: 'info_status',
                oldStatus: 'quantities_updated',
                newStatus: 'quantities_updated',
                notes: `Обновени количества и цени: ${JSON.stringify(updateData)}`,
                changedBy: userId
            }, { transaction });

            await transaction.commit();
            return order.reload();

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Генериране на номер на поръчка
    async generateOrderNumber() {
        const year = new Date().getFullYear();
        const prefix = `ORD-${year}-`;
        
        const lastOrder = await Order.findOne({
            where: {
                orderNumber: {
                    [Op.like]: `${prefix}%`
                }
            },
            order: [['orderNumber', 'DESC']]
        });

        let nextNumber = 1;
        if (lastOrder) {
            const lastNumber = parseInt(lastOrder.orderNumber.split('-')[2]);
            nextNumber = lastNumber + 1;
        }

        return `${prefix}${nextNumber.toString().padStart(6, '0')}`;
    }

    // Списък с поръчки с филтри
    async getOrdersList(filters = {}) {
        const whereClause = {};
        const include = [
            {
                association: 'variant',
                include: [
                    {
                        association: 'phase',
                        include: [
                            {
                                association: 'project',
                                include: ['client']
                            }
                        ]
                    }
                ]
            },
            {
                association: 'supplierOrders',
                include: ['supplier', 'manufacturer']
            }
        ];

        // Филтри
        if (filters.status) {
            const [statusType, statusValue] = filters.status.split(':');
            whereClause[`${statusType}Status`] = statusValue;
        }

        if (filters.clientId) {
            whereClause.clientId = filters.clientId;
        }

        if (filters.projectId) {
            whereClause.projectId = filters.projectId;
        }

        if (filters.dateFrom) {
            whereClause.orderDate = {
                [Op.gte]: filters.dateFrom
            };
        }

        if (filters.dateTo) {
            whereClause.orderDate = {
                ...whereClause.orderDate,
                [Op.lte]: filters.dateTo
            };
        }

        const orders = await Order.findAll({
            where: whereClause,
            include,
            order: [['lastStatusUpdate', 'DESC']]
        });

        // Определяне на display status според логиката
        return orders.map(order => ({
            ...order.toJSON(),
            displayStatus: this.getDisplayStatus(order)
        }));
    }

    // Определяне на статуса за показване
    getDisplayStatus(order) {
        // Приоритет: delivery > payment > info
        if (order.lastStatusType === 'delivery') {
            switch (order.deliveryStatus) {
                case 'pending': return 'ОЧАКВАМЕ';
                case 'partial': return 'ЧАСТИЧНО';
                case 'completed': return 'ДОСТАВЕНА';
            }
        }
        
        if (order.lastStatusType === 'payment' || 
           (order.lastStatusType === 'info' && order.paymentStatus !== 'not_paid')) {
            switch (order.paymentStatus) {
                case 'not_paid': return 'НЕПЛАТЕНА';
                case 'advance_paid': return 'ЧАСТИЧНО ПЛАТЕНА';
                case 'fully_paid': return 'ПЛАТЕНА';
            }
        }
        
        switch (order.infoStatus) {
            case 'not_confirmed': return 'НЕПОТВЪРДЕНА';
            case 'confirmed': return 'ПОТВЪРДЕНА';
        }
    }

    // Промяна на статус
    async updateOrderStatus(orderId, statusType, newStatus, userId, notes = null) {
        const transaction = await sequelize.transaction();
        
        try {
            const order = await Order.findByPk(orderId, { transaction });
            if (!order) {
                throw new Error('Поръчката не е намерена');
            }

            const oldStatus = order[`${statusType}Status`];
            
            // Запазване в история
            await OrderStatusHistory.create({
                orderId,
                statusType: `${statusType}_status`,
                oldStatus,
                newStatus,
                notes,
                changedBy: userId
            }, { transaction });

            // Обновяване на поръчката
            await order.update({
                [`${statusType}Status`]: newStatus,
                lastStatusUpdate: new Date(),
                lastStatusType: statusType,
                updatedBy: userId
            }, { transaction });

            await transaction.commit();
            return order;

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Потвърждаване на поръчка с изпращане на email
    async confirmOrder(orderId, userId, attachmentData = null) {
        const transaction = await sequelize.transaction();
        
        try {
            const order = await Order.findByPk(orderId, {
                include: [
                    {
                        association: 'variant',
                        include: [
                            {
                                association: 'phase',
                                include: [
                                    {
                                        association: 'project',
                                        include: ['client']
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        association: 'supplierOrders',
                        include: ['supplier', 'manufacturer']
                    }
                ],
                transaction
            });

            if (!order) {
                throw new Error('Поръчката не е намерена');
            }

            // Обновяване на статуса
            await this.updateOrderStatus(orderId, 'info', 'confirmed', userId, 'Потвърдена автоматично');

            // Запазване на прикачения файл ако има такъв
            if (attachmentData) {
                await order.update({
                    attachmentFileUrl: attachmentData.fileUrl,
                    attachmentFilename: attachmentData.filename
                }, { transaction });
            }

            // Изпращане на email към производителите
            const emailPromises = [];
            
            for (const supplierOrder of order.supplierOrders) {
                if (supplierOrder.contactEmail) {
                    const emailData = {
                        to: supplierOrder.contactEmail,
                        subject: `Order Confirmation - ${order.orderNumber}`,
                        template: 'order_confirmation_en',
                        data: {
                            orderNumber: order.orderNumber,
                            supplierName: supplierOrder.supplier?.name || supplierOrder.manufacturer?.name,
                            orderDate: order.orderDate,
                            deliveryDate: order.expectedDeliveryDate,
                            contactPerson: supplierOrder.contactPerson,
                            totalAmount: supplierOrder.totalAmount,
                            projectName: order.variant.phase.project.name,
                            clientName: `${order.variant.phase.project.client.firstName} ${order.variant.phase.project.client.lastName}`
                        },
                        attachments: attachmentData ? [{
                            filename: attachmentData.filename,
                            path: attachmentData.fileUrl
                        }] : []
                    };
                    
                    emailPromises.push(EmailService.sendEmail(emailData));
                }
            }

            // Изпращане на всички emails
            await Promise.all(emailPromises);

            // Отбелязване че email-ът е изпратен
            await order.update({
                confirmationEmailSent: true,
                confirmationEmailSentAt: new Date()
            }, { transaction });

            await transaction.commit();
            return order;

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Добавяне на плащане
    async addPayment(orderId, paymentData, userId) {
        const transaction = await sequelize.transaction();
        
        try {
            const order = await Order.findByPk(orderId, { transaction });
            if (!order) {
                throw new Error('Поръчката не е намерена');
            }

            // Създаване на плащането
            const payment = await OrderPayment.create({
                orderId,
                paymentType: paymentData.paymentType,
                amountBgn: paymentData.amountBgn,
                paymentDate: paymentData.paymentDate,
                referenceNumber: paymentData.referenceNumber,
                swiftFileUrl: paymentData.swiftFileUrl,
                notes: paymentData.notes,
                additionalInfo: paymentData.additionalInfo, // Нова функционалност
                createdBy: userId
            }, { transaction });

            // Обновяване на платената сума
            const newPaidAmount = parseFloat(order.paidAmountBgn) + parseFloat(paymentData.amountBgn);
            
            // Определяне на новия payment status
            let newPaymentStatus = 'advance_paid';
            if (newPaidAmount >= parseFloat(order.currentTotalAmountBgn)) {
                newPaymentStatus = 'fully_paid';
            }

            await order.update({
                paidAmountBgn: newPaidAmount,
                paymentStatus: newPaymentStatus,
                lastStatusUpdate: new Date(),
                lastStatusType: 'payment',
                updatedBy: userId
            }, { transaction });

            // Запазване в история на статуса
            await OrderStatusHistory.create({
                orderId,
                statusType: 'payment_status',
                oldStatus: order.paymentStatus,
                newStatus: newPaymentStatus,
                notes: `Добавено плащане: ${paymentData.amountBgn} лв. ${paymentData.additionalInfo ? '(' + paymentData.additionalInfo + ')' : ''}`,
                changedBy: userId
            }, { transaction });

            await transaction.commit();
            return payment;

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Добавяне на доставка
    async addDelivery(orderId, deliveryData, userId) {
        const transaction = await sequelize.transaction();
        
        try {
            const delivery = await OrderDelivery.create({
                orderId,
                deliveryDate: deliveryData.deliveryDate,
                transportCompany: deliveryData.transportCompany,
                deliveredQuantitySqm: deliveryData.deliveredQuantitySqm,
                deliveredPackages: deliveryData.deliveredPackages,
                deliveryNotes: deliveryData.deliveryNotes,
                createdBy: userId
            }, { transaction });

            // Обновяване на delivery status
            await this.updateOrderStatus(orderId, 'delivery', 'completed', userId, 'Доставката е регистрирана');

            await transaction.commit();
            return delivery;

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Получаване на плащания за поръчка
    async getOrderPayments(orderId) {
        return await OrderPayment.findAll({
            where: { orderId },
            order: [['paymentDate', 'DESC']],
            include: ['createdByUser']
        });
    }

    // Обновяване на плащане
    async updatePayment(orderId, paymentId, updateData, userId) {
        const transaction = await sequelize.transaction();
        
        try {
            const payment = await OrderPayment.findOne({
                where: { id: paymentId, orderId },
                transaction
            });

            if (!payment) {
                throw new Error('Плащането не е намерено');
            }

            const oldAmount = payment.amountBgn;
            await payment.update({
                ...updateData,
                updatedBy: userId
            }, { transaction });

            // Преизчисляване на платената сума в поръчката
            if (updateData.amountBgn && updateData.amountBgn !== oldAmount) {
                await this.recalculateOrderPayments(orderId, transaction);
            }

            await transaction.commit();
            return payment;

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Изтриване на плащане
    async deletePayment(orderId, paymentId, userId) {
        const transaction = await sequelize.transaction();
        
        try {
            const payment = await OrderPayment.findOne({
                where: { id: paymentId, orderId },
                transaction
            });

            if (!payment) {
                throw new Error('Плащането не е намерено');
            }

            await payment.destroy({ transaction });

            // Преизчисляване на платената сума в поръчката
            await this.recalculateOrderPayments(orderId, transaction);

            await transaction.commit();
            return true;

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // Преизчисляване на платените суми
    async recalculateOrderPayments(orderId, transaction = null) {
        const t = transaction || await sequelize.transaction();
        
        try {
            const payments = await OrderPayment.sum('amountBgn', {
                where: { 
                    orderId,
                    status: ['pending', 'confirmed'] // Exclude failed payments
                },
                transaction: t
            });

            const totalPaid = payments || 0;
            const order = await Order.findByPk(orderId, { transaction: t });
            
            let newPaymentStatus = 'not_paid';
            if (totalPaid > 0) {
                newPaymentStatus = totalPaid >= order.currentTotalAmountBgn ? 'fully_paid' : 'advance_paid';
            }

            await order.update({
                paidAmountBgn: totalPaid,
                paymentStatus: newPaymentStatus,
                lastStatusUpdate: new Date(),
                lastStatusType: 'payment'
            }, { transaction: t });

            if (!transaction) {
                await t.commit();
            }

        } catch (error) {
            if (!transaction) {
                await t.rollback();
            }
            throw error;
        }
    }

    // Получаване на доставки за поръчка
    async getOrderDeliveries(orderId) {
        return await OrderDelivery.findAll({
            where: { orderId },
            order: [['deliveryDate', 'DESC']],
            include: ['createdByUser', 'documents']
        });
    }

    // Обновяване на доставка
    async updateDelivery(orderId, deliveryId, updateData, userId) {
        const delivery = await OrderDelivery.findOne({
            where: { id: deliveryId, orderId }
        });

        if (!delivery) {
            throw new Error('Доставката не е намерена');
        }

        return await delivery.update({
            ...updateData,
            updatedBy: userId
        });
    }

    // Генериране на отчет
    async getOrdersSummaryReport(filters = {}) {
        const whereClause = this.buildWhereClause(filters);
        
        const summary = await Order.findAll({
            where: whereClause,
            attributes: [
                [sequelize.fn('COUNT', sequelize.col('id')), 'totalOrders'],
                [sequelize.fn('SUM', sequelize.col('current_total_amount_bgn')), 'totalAmountBgn'],
                [sequelize.fn('SUM', sequelize.col('paid_amount_bgn')), 'totalPaidBgn'],
                [sequelize.fn('SUM', sequelize.col('profit_amount_eur')), 'totalProfitEur'],
                [sequelize.fn('AVG', sequelize.col('profit_percentage')), 'avgProfitPercentage'],
                'info_status',
                'payment_status',
                'delivery_status'
            ],
            group: ['info_status', 'payment_status', 'delivery_status'],
            raw: true
        });

        return this.formatSummaryReport(summary);
    }

    // Генериране на финансов отчет
    async getFinancialReport(filters = {}) {
        const whereClause = this.buildWhereClause(filters);
        
        const orders = await Order.findAll({
            where: whereClause,
            include: [
                'payments',
                'variant.phase.project.client',
                'supplierOrders.manufacturer'
            ],
            order: [['orderDate', 'DESC']]
        });

        return this.formatFinancialReport(orders);
    }

    // Експорт в Excel
    async exportOrdersToExcel(filters = {}) {
        const orders = await this.getOrdersList(filters);
        
        // Use a library like ExcelJS to create the Excel file
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Orders');

        // Define columns
        worksheet.columns = [
            { header: 'Номер поръчка', key: 'orderNumber', width: 15 },
            { header: 'Клиент', key: 'clientName', width: 20 },
            { header: 'Проект', key: 'projectName', width: 25 },
            { header: 'Дата', key: 'orderDate', width: 12 },
            { header: 'Статус', key: 'displayStatus', width: 15 },
            { header: 'Обща сума (лв)', key: 'currentTotalAmountBgn', width: 15 },
            { header: 'Платено (лв)', key: 'paidAmountBgn', width: 15 },
            { header: 'Остатък (лв)', key: 'remainingAmountBgn', width: 15 },
            { header: 'Печалба (€)', key: 'profitAmountEur', width: 12 },
            { header: 'Печалба (%)', key: 'profitPercentage', width: 12 }
        ];

        // Add rows
        orders.forEach(order => {
            worksheet.addRow({
                orderNumber: order.orderNumber,
                clientName: order.clientName,
                projectName: order.projectName,
                orderDate: moment(order.orderDate).format('DD.MM.YYYY'),
                displayStatus: order.displayStatus,
                currentTotalAmountBgn: order.currentTotalAmountBgn,
                paidAmountBgn: order.paidAmountBgn,
                remainingAmountBgn: order.remainingAmountBgn,
                profitAmountEur: order.profitAmountEur,
                profitPercentage: order.profitPercentage
            });
        });

        // Style the header
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        return await workbook.xlsx.writeBuffer();
    }

    // Генериране на PDF
    async generateOrderPDF(orderId) {
        const order = await this.getOrderDetails(orderId);
        
        if (!order) {
            throw new Error('Поръчката не е намерена');
        }

        // Use a library like Puppeteer to generate PDF
        const puppeteer = require('puppeteer');
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        const html = this.generateOrderHTML(order);
        await page.setContent(html);
        
        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                right: '15mm',
                bottom: '20mm',
                left: '15mm'
            }
        });

        await browser.close();
        return pdfBuffer;
    }

    // Helper методи
    buildWhereClause(filters) {
        const where = {};

        if (filters.status) {
            const [statusType, statusValue] = filters.status.split(':');
            where[`${statusType}Status`] = statusValue;
        }

        if (filters.clientId) {
            where.clientId = filters.clientId;
        }

        if (filters.projectId) {
            where.projectId = filters.projectId;
        }

        if (filters.dateFrom && filters.dateTo) {
            where.orderDate = {
                [Op.between]: [filters.dateFrom, filters.dateTo]
            };
        } else if (filters.dateFrom) {
            where.orderDate = {
                [Op.gte]: filters.dateFrom
            };
        } else if (filters.dateTo) {
            where.orderDate = {
                [Op.lte]: filters.dateTo
            };
        }

        return where;
    }

    formatSummaryReport(rawData) {
        // Format the raw summary data into a useful structure
        const summary = {
            totalOrders: 0,
            totalAmountBgn: 0,
            totalPaidBgn: 0,
            totalProfitEur: 0,
            avgProfitPercentage: 0,
            statusBreakdown: {
                info: {},
                payment: {},
                delivery: {}
            }
        };

        rawData.forEach(row => {
            summary.totalOrders += parseInt(row.totalOrders);
            summary.totalAmountBgn += parseFloat(row.totalAmountBgn || 0);
            summary.totalPaidBgn += parseFloat(row.totalPaidBgn || 0);
            summary.totalProfitEur += parseFloat(row.totalProfitEur || 0);

            // Group by status
            summary.statusBreakdown.info[row.info_status] = 
                (summary.statusBreakdown.info[row.info_status] || 0) + parseInt(row.totalOrders);
            summary.statusBreakdown.payment[row.payment_status] = 
                (summary.statusBreakdown.payment[row.payment_status] || 0) + parseInt(row.totalOrders);
            summary.statusBreakdown.delivery[row.delivery_status] = 
                (summary.statusBreakdown.delivery[row.delivery_status] || 0) + parseInt(row.totalOrders);
        });

        summary.avgProfitPercentage = summary.totalOrders > 0 ? 
            (summary.totalProfitEur / summary.totalAmountBgn) * 100 : 0;

        return summary;
    }

    formatFinancialReport(orders) {
        return {
            summary: {
                totalOrders: orders.length,
                totalValue: orders.reduce((sum, order) => sum + parseFloat(order.currentTotalAmountBgn), 0),
                totalPaid: orders.reduce((sum, order) => sum + parseFloat(order.paidAmountBgn), 0),
                totalProfit: orders.reduce((sum, order) => sum + parseFloat(order.profitAmountEur || 0), 0),
                avgProfitMargin: orders.length > 0 ? 
                    orders.reduce((sum, order) => sum + parseFloat(order.profitPercentage || 0), 0) / orders.length : 0
            },
            orders: orders.map(order => ({
                orderNumber: order.orderNumber,
                clientName: order.variant?.phase?.project?.client?.firstName + ' ' + order.variant?.phase?.project?.client?.lastName,
                orderDate: order.orderDate,
                totalAmount: order.currentTotalAmountBgn,
                paidAmount: order.paidAmountBgn,
                profitAmount: order.profitAmountEur,
                profitPercentage: order.profitPercentage,
                paymentStatus: order.paymentStatus
            }))
        };
    }

    generateOrderHTML(order) {
        // Generate HTML template for PDF
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Поръчка ${order.orderNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; font-size: 12px; }
                .header { text-align: center; margin-bottom: 30px; }
                .details { margin-bottom: 20px; }
                .table { width: 100%; border-collapse: collapse; }
                .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                .table th { background-color: #f2f2f2; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>ПОРЪЧКА ${order.orderNumber}</h1>
                <p>Дата: ${moment(order.orderDate).format('DD.MM.YYYY')}</p>
            </div>
            
            <div class="details">
                <p><strong>Клиент:</strong> ${order.variant?.phase?.project?.client?.firstName} ${order.variant?.phase?.project?.client?.lastName}</p>
                <p><strong>Проект:</strong> ${order.variant?.phase?.project?.name}</p>
                <p><strong>Фаза:</strong> ${order.variant?.phase?.name}</p>
                <p><strong>Вариант:</strong> ${order.variant?.name}</p>
            </div>
            
            <table class="table">
                <thead>
                    <tr>
                        <th>Количество</th>
                        <th>Единица</th>
                        <th>Цена €</th>
                        <th>Общо</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${order.currentQuantityLm}</td>
                        <td>л.м.</td>
                        <td>${order.currentUnitPriceEur}</td>
                        <td>${(order.currentQuantityLm * order.currentUnitPriceEur).toFixed(2)}</td>
                    </tr>
                    <tr>
                        <td>${order.currentQuantitySqm}</td>
                        <td>кв.м.</td>
                        <td>${order.currentTotalPriceEur}</td>
                        <td>${(order.currentQuantitySqm * order.currentTotalPriceEur).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>
            
            <div style="margin-top: 20px; text-align: right;">
                <p><strong>Обща сума: ${order.currentTotalAmountBgn} лв.</strong></p>
            </div>
        </body>
        </html>
        `;
    }
}

module.exports = new OrderService();

// ============= CONTROLLERS =============

// controllers/OrderController.js
const OrderService = require('../services/OrderService');
const { ValidationError } = require('sequelize');

class OrderController {
    
    // GET /api/orders
    async getOrders(req, res) {
        try {
            const filters = {
                status: req.query.status,
                clientId: req.query.clientId,
                projectId: req.query.projectId,
                dateFrom: req.query.dateFrom,
                dateTo: req.query.dateTo
            };

            const orders = await OrderService.getOrdersList(filters);
            
            res.json({
                success: true,
                data: orders
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Грешка при зареждане на поръчките',
                error: error.message
            });
        }
    }

    // GET /api/orders/:id
    async getOrderDetails(req, res) {
        try {
            const order = await OrderService.getOrderDetails(req.params.id);
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Поръчката не е намерена'
                });
            }

            res.json({
                success: true,
                data: order
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Грешка при зареждане на поръчката',
                error: error.message
            });
        }
    }

    // POST /api/orders/from-variant/:variantId
    async createOrderFromVariant(req, res) {
        try {
            const order = await OrderService.createOrderFromVariant(
                req.params.variantId,
                req.body,
                req.user.id
            );

            res.status(201).json({
                success: true,
                data: order,
                message: 'Поръчката е създадена успешно'
            });
        } catch (error) {
            const status = error instanceof ValidationError ? 400 : 500;
            res.status(status).json({
                success: false,
                message: 'Грешка при създаване на поръчката',
                error: error.message
            });
        }
    }

    // PUT /api/orders/:id/status/:statusType
    async updateOrderStatus(req, res) {
        try {
            const { statusType } = req.params;
            const { newStatus, notes } = req.body;

            const order = await OrderService.updateOrderStatus(
                req.params.id,
                statusType,
                newStatus,
                req.user.id,
                notes
            );

            res.json({
                success: true,
                data: order,
                message: 'Статусът е обновен успешно'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Грешка при обновяване на статуса',
                error: error.message
            });
        }
    }

    // POST /api/orders/:id/confirm
    async confirmOrder(req, res) {
        try {
            const { attachmentData } = req.body;
            
            const order = await OrderService.confirmOrder(
                req.params.id,
                req.user.id,
                attachmentData
            );

            res.json({
                success: true,
                data: order,
                message: 'Поръчката е потвърдена и email-ът е изпратен успешно'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Грешка при потвърждаване на поръчката',
                error: error.message
            });
        }
    }

    // POST /api/orders/:id/payments
    async addPayment(req, res) {
        try {
            const payment = await OrderService.addPayment(
                req.params.id,
                req.body,
                req.user.id
            );

            res.status(201).json({
                success: true,
                data: payment,
                message: 'Плащането е добавено успешно'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Грешка при добавяне на плащането',
                error: error.message
            });
        }
    }

    // PUT /api/orders/:id/quantities-prices
    async updateOrderQuantitiesAndPrices(req, res) {
        try {
            const order = await OrderService.updateOrderQuantitiesAndPrices(
                req.params.id,
                req.body,
                req.user.id
            );

            res.json({
                success: true,
                data: order,
                message: 'Количествата и цените са обновени успешно'
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Грешка при обновяване на количествата и цените',
                error: error.message
            });
        }
    }

    // GET /api/orders/:id/profit-analysis
    async getProfitAnalysis(req, res) {
        try {
            const order = await OrderService.getOrderDetails(req.params.id);
            
            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Поръчката не е намерена'
                });
            }

            const profitAnalysis = {
                originalData: {
                    totalAmountEur: order.originalTotalAmountEur,
                    totalCostEur: order.originalTotalPriceEur,
                    profitEur: order.originalTotalAmountEur - order.originalTotalPriceEur,
                    profitPercentage: ((order.originalTotalAmountEur - order.originalTotalPriceEur) / order.originalTotalAmountEur) * 100
                },
                currentData: {
                    totalAmountEur: order.currentTotalAmountEur,
                    totalCostEur: order.currentTotalPriceEur,
                    profitEur: order.profitAmountEur,
                    profitPercentage: order.profitPercentage
                },
                difference: {
                    profitChange: order.profitAmountEur - (order.originalTotalAmountEur - order.originalTotalPriceEur),
                    percentageChange: order.profitPercentage - (((order.originalTotalAmountEur - order.originalTotalPriceEur) / order.originalTotalAmountEur) * 100)
                }
            };

            res.json({
                success: true,
                data: profitAnalysis
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Грешка при изчисляване на анализа на печалбата',
                error: error.message
            });
        }
    }
}

module.exports = new OrderController();