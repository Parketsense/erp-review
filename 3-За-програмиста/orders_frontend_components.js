// =============================================
// PARKETSENSE - ORDERS MODULE FRONTEND
// React Components
// =============================================

// ============= MAIN ORDERS LIST =============

// components/orders/OrdersList.jsx
import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, Input, Select, DatePicker, Modal, message } from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import OrderDetailsModal from './OrderDetailsModal';
import PaymentModal from './PaymentModal';
import DeliveryModal from './DeliveryModal';
import { ordersAPI } from '../../services/api';
import moment from 'moment';

const { RangePicker } = DatePicker;
const { Option } = Select;

const OrdersList = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({});
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [modals, setModals] = useState({
        details: false,
        payment: false,
        delivery: false
    });

    // Статус конфигурация
    const statusConfig = {
        'НЕПОТВЪРДЕНА': { color: 'default', bgColor: '#f5f5f5' },
        'ПОТВЪРДЕНА': { color: 'green', bgColor: '#f6ffed' },
        'НЕПЛАТЕНА': { color: 'default', bgColor: '#f5f5f5' },
        'ЧАСТИЧНО ПЛАТЕНА': { color: 'orange', bgColor: '#fff7e6' },
        'ПЛАТЕНА': { color: 'green', bgColor: '#f6ffed' },
        'ОЧАКВАМЕ': { color: 'blue', bgColor: '#f0f5ff' },
        'ДОСТАВЕНА': { color: 'green', bgColor: '#f6ffed' }
    };

    const columns = [
        {
            title: 'ПО ПРОЕКТ',
            dataIndex: ['variant', 'phase', 'project', 'name'],
            key: 'project',
            width: 200,
            render: (text, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>
                        {record.variant?.phase?.project?.client?.firstName} {record.variant?.phase?.project?.client?.lastName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                        {text} - {record.variant?.phase?.name}
                    </div>
                </div>
            )
        },
        {
            title: 'ФАЗА',
            dataIndex: ['variant', 'phase', 'name'],
            key: 'phase',
            width: 150
        },
        {
            title: 'ВАРИАНТ',
            dataIndex: ['variant', 'name'],
            key: 'variant',
            width: 150
        },
        {
            title: 'ДОСТАВЧИК',
            key: 'supplier',
            width: 120,
            render: (text, record) => {
                const supplier = record.supplierOrders?.[0];
                return supplier?.supplier?.name || supplier?.manufacturer?.name || '-';
            }
        },
        {
            title: 'ДАТА',
            dataIndex: 'orderDate',
            key: 'orderDate',
            width: 100,
            render: (date) => moment(date).format('DD.MM.YYYY')
        },
        {
            title: 'ДАТА НА ДОСТАВКА',
            dataIndex: 'expectedDeliveryDate',
            key: 'expectedDeliveryDate',
            width: 120,
            render: (date) => date ? moment(date).format('DD.MM.YYYY') : '-'
        },
        {
            title: '№ ВХОДЯЩ ДОКУМЕНТ',
            key: 'documentNumber',
            width: 120,
            render: () => 'без номер' // TODO: Implement document number logic
        },
        {
            title: '№ ПОРЪЧКА',
            dataIndex: 'orderNumber',
            key: 'orderNumber',
            width: 120
        },
        {
            title: 'СТАТУС',
            key: 'status',
            width: 150,
            render: (text, record) => {
                const status = record.displayStatus;
                const config = statusConfig[status] || { color: 'default', bgColor: '#f5f5f5' };
                
                return (
                    <Tag 
                        color={config.color}
                        style={{ 
                            backgroundColor: config.bgColor,
                            border: `1px solid ${config.color === 'default' ? '#d9d9d9' : 'transparent'}`,
                            borderRadius: '4px',
                            padding: '4px 8px'
                        }}
                    >
                        {status}
                    </Tag>
                );
            }
        },
        {
            title: 'ДЕЙСТВИЯ',
            key: 'actions',
            width: 100,
            render: (text, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => handleOpenModal('details', record)}
                        title="Детайли"
                    />
                </Space>
            )
        }
    ];

    useEffect(() => {
        loadOrders();
    }, [filters]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const response = await ordersAPI.getOrders(filters);
            if (response.success) {
                setOrders(response.data);
            }
        } catch (error) {
            message.error('Грешка при зареждане на поръчките');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (modalType, order = null) => {
        setSelectedOrder(order);
        setModals(prev => ({ ...prev, [modalType]: true }));
    };

    const handleCloseModal = (modalType) => {
        setModals(prev => ({ ...prev, [modalType]: false }));
        setSelectedOrder(null);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleDateRangeChange = (dates) => {
        if (dates && dates.length === 2) {
            setFilters(prev => ({
                ...prev,
                dateFrom: dates[0].format('YYYY-MM-DD'),
                dateTo: dates[1].format('YYYY-MM-DD')
            }));
        } else {
            setFilters(prev => {
                const newFilters = { ...prev };
                delete newFilters.dateFrom;
                delete newFilters.dateTo;
                return newFilters;
            });
        }
    };

    const handleOrderUpdate = () => {
        loadOrders();
        // Затваряне на всички модали
        setModals({
            details: false,
            payment: false,
            delivery: false
        });
    };

    return (
        <div className="orders-list">
            {/* Header */}
            <div style={{ 
                background: '#000', 
                color: '#fff', 
                padding: '12px 24px', 
                marginBottom: '24px',
                borderRadius: '8px'
            }}>
                <h2 style={{ color: '#fff', margin: 0 }}>ПОРЪЧКИ</h2>
            </div>

            {/* Filters */}
            <div style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                marginBottom: '24px',
                borderRadius: '8px'
            }}>
                <Space wrap>
                    <Input
                        placeholder="Търсене..."
                        prefix={<SearchOutlined />}
                        style={{ width: 200 }}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                    
                    <Select
                        placeholder="Статус"
                        style={{ width: 150 }}
                        allowClear
                        onChange={(value) => handleFilterChange('status', value)}
                    >
                        <Option value="info:not_confirmed">Непотвърдена</Option>
                        <Option value="info:confirmed">Потвърдена</Option>
                        <Option value="payment:not_paid">Неплатена</Option>
                        <Option value="payment:advance_paid">Частично платена</Option>
                        <Option value="payment:fully_paid">Платена</Option>
                        <Option value="delivery:pending">Очакваме</Option>
                        <Option value="delivery:completed">Доставена</Option>
                    </Select>

                    <RangePicker
                        placeholder={['От дата', 'До дата']}
                        format="DD.MM.YYYY"
                        onChange={handleDateRangeChange}
                    />

                    {/* Status filter buttons */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {Object.entries(statusConfig).map(([status, config]) => (
                            <Button
                                key={status}
                                size="small"
                                style={{
                                    backgroundColor: config.bgColor,
                                    border: `1px solid ${config.color === 'default' ? '#d9d9d9' : 'transparent'}`,
                                    color: config.color === 'default' ? '#000' : config.color
                                }}
                                onClick={() => {
                                    // Convert display status to filter format
                                    const statusFilters = {
                                        'НЕПОТВЪРДЕНА': 'info:not_confirmed',
                                        'ПОТВЪРДЕНА': 'info:confirmed',
                                        'НЕПЛАТЕНА': 'payment:not_paid',
                                        'ЧАСТИЧНО ПЛАТЕНА': 'payment:advance_paid',
                                        'ПЛАТЕНА': 'payment:fully_paid',
                                        'ОЧАКВАМЕ': 'delivery:pending',
                                        'ДОСТАВЕНА': 'delivery:completed'
                                    };
                                    handleFilterChange('status', statusFilters[status]);
                                }}
                            >
                                {status}
                            </Button>
                        ))}
                    </div>
                </Space>
            </div>

            {/* Table */}
            <Table
                columns={columns}
                dataSource={orders}
                rowKey="id"
                loading={loading}
                scroll={{ x: 1200 }}
                pagination={{
                    total: orders.length,
                    pageSize: 20,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                        `${range[0]}-${range[1]} от ${total} поръчки`
                }}
                size="small"
                className="orders-table"
            />

            {/* Modals */}
            <OrderDetailsModal
                visible={modals.details}
                order={selectedOrder}
                onClose={() => handleCloseModal('details')}
                onUpdate={handleOrderUpdate}
                onOpenPayment={() => handleOpenModal('payment', selectedOrder)}
                onOpenDelivery={() => handleOpenModal('delivery', selectedOrder)}
            />

            <PaymentModal
                visible={modals.payment}
                order={selectedOrder}
                onClose={() => handleCloseModal('payment')}
                onUpdate={handleOrderUpdate}
            />

            <DeliveryModal
                visible={modals.delivery}
                order={selectedOrder}
                onClose={() => handleCloseModal('delivery')}
                onUpdate={handleOrderUpdate}
            />
        </div>
    );
};

// ============= ORDER DETAILS MODAL =============

// components/orders/OrderDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Table, Button, Space, Tag, Upload, message, Spin } from 'antd';
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import OrderInfoModal from './OrderInfoModal';
import PaymentModal from './PaymentModal';
import DeliveryModal from './DeliveryModal';
import { ordersAPI } from '../../services/api';
import moment from 'moment';

const OrderDetailsModal = ({ 
    visible, 
    order, 
    onClose, 
    onUpdate, 
    onOpenPayment, 
    onOpenDelivery 
}) => {
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modals, setModals] = useState({
        orderInfo: false,
        payment: false,
        delivery: false
    });

    useEffect(() => {
        if (visible && order) {
            loadOrderDetails();
        }
    }, [visible, order]);

    const loadOrderDetails = async () => {
        setLoading(true);
        try {
            const response = await ordersAPI.getOrderDetails(order.id);
            if (response.success) {
                setOrderDetails(response.data);
            }
        } catch (error) {
            message.error('Грешка при зареждане на детайлите');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (modalType) => {
        setModals(prev => ({ ...prev, [modalType]: true }));
    };

    const handleCloseModal = (modalType) => {
        setModals(prev => ({ ...prev, [modalType]: false }));
        // Reload details after modal closes
        if (modalType !== 'orderInfo') {
            loadOrderDetails();
        }
    };

    const handleOrderUpdate = () => {
        loadOrderDetails();
        onUpdate && onUpdate();
    };

    const getStatusColor = (status, type) => {
        const statusColors = {
            info: {
                'not_confirmed': '#ff4d4f',
                'confirmed': '#52c41a'
            },
            payment: {
                'not_paid': '#ff4d4f',
                'advance_paid': '#faad14',
                'fully_paid': '#52c41a'
            },
            delivery: {
                'pending': '#1890ff',
                'completed': '#52c41a'
            }
        };
        return statusColors[type][status] || '#666';
    };

    const getStatusText = (status, type) => {
        const statusTexts = {
            info: {
                'not_confirmed': 'НЕПОТВЪРДЕНА',
                'confirmed': 'ПОТВЪРДЕНА'
            },
            payment: {
                'not_paid': 'НЕПЛАТЕНА',
                'advance_paid': 'ЧАСТИЧНО ПЛАТЕНА',
                'fully_paid': 'НАПЪЛНО ПЛАТЕНА'
            },
            delivery: {
                'pending': 'ОЧАКВАМЕ',
                'completed': 'ДОСТАВЕНА'
            }
        };
        return statusTexts[type][status] || status.toUpperCase();
    };

    const navigateToProject = () => {
        // Implement navigation to project
        message.info(`Навигация към проект: ${orderDetails?.variant?.phase?.project?.name}`);
    };

    const navigateToPhase = () => {
        // Implement navigation to phase
        message.info(`Навигация към фаза: ${orderDetails?.variant?.phase?.name}`);
    };

    const navigateToVariant = () => {
        // Implement navigation to variant
        message.info(`Навигация към вариант: ${orderDetails?.variant?.name}`);
    };

    if (!orderDetails) {
        return (
            <Modal
                title="Поръчка"
                visible={visible}
                onCancel={onClose}
                footer={null}
                width={1200}
            >
                <Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '50px' }} />
            </Modal>
        );
    }

    return (
        <>
            <Modal
                title="Поръчка"
                visible={visible}
                onCancel={onClose}
                footer={null}
                width={1200}
                className="order-details-modal"
            >
                <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {/* Header Information */}
                    <div style={{ 
                        background: '#000', 
                        color: '#fff', 
                        padding: '16px', 
                        marginBottom: '24px',
                        borderRadius: '4px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(8, 1fr)',
                        gap: '8px',
                        fontSize: '12px',
                        fontWeight: '500'
                    }}>
                        <span>ПО ПРОЕКТ</span>
                        <span>ФАЗА</span>
                        <span>ВАРИАНТ</span>
                        <span>ДОСТАВЧИК</span>
                        <span>ДАТА</span>
                        <span>ДАТА НА ДОСТАВКА</span>
                        <span>№ ВХОДЯЩ ДОКУМЕНТ</span>
                        <span>№ ПОРЪЧКА</span>
                    </div>

                    <div style={{ 
                        background: '#f8f9fa', 
                        padding: '16px', 
                        marginBottom: '24px',
                        borderRadius: '4px',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(8, 1fr)',
                        gap: '8px',
                        fontSize: '14px'
                    }}>
                        <span 
                            style={{ color: '#1890ff', cursor: 'pointer' }}
                            onClick={navigateToProject}
                        >
                            {orderDetails.variant?.phase?.project?.client?.firstName} {orderDetails.variant?.phase?.project?.client?.lastName}
                        </span>
                        <span 
                            style={{ color: '#1890ff', cursor: 'pointer' }}
                            onClick={navigateToPhase}
                        >
                            {orderDetails.variant?.phase?.name}
                        </span>
                        <span 
                            style={{ color: '#1890ff', cursor: 'pointer' }}
                            onClick={navigateToVariant}
                        >
                            {orderDetails.variant?.name}
                        </span>
                        <span>{orderDetails.supplierOrders?.[0]?.supplier?.name || orderDetails.supplierOrders?.[0]?.manufacturer?.name}</span>
                        <span>{moment(orderDetails.orderDate).format('DD.MM.YYYY г.')}</span>
                        <span>{orderDetails.expectedDeliveryDate ? moment(orderDetails.expectedDeliveryDate).format('DD.MM.YYYY г.') : '-'}</span>
                        <span>{orderDetails.documentNumber || 'без номер'}</span>
                        <span>{orderDetails.orderNumber}</span>
                    </div>

                    {/* Product Information */}
                    <div style={{ marginBottom: '24px' }}>
                        <h4>Поръчан продукт:</h4>
                        <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '4px' }}>
                            <div>Дървен първаз в цвят на паркета-Дъб-80 мм височина-специално за Линднер</div>
                            <div>Friulparchet Дъб Maxi TOP Natural Трислоен лак T15 W145 L1400 - 2200 Confort/Select</div>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                            <div>
                                <div>Количество:</div>
                                <div>{orderDetails.currentQuantityLm?.toFixed(2) || '1170.00'} л.м.</div>
                                <div>{orderDetails.currentQuantitySqm?.toFixed(2) || '1420.00'} кв.м.</div>
                            </div>
                            <div>
                                <div>Цена €:</div>
                                <div>{orderDetails.currentUnitPriceEur?.toFixed(2) || '3.70'}</div>
                                <div>{orderDetails.currentTotalPriceEur?.toFixed(2) || '43.50'}</div>
                            </div>
                        </div>
                        
                        <div style={{ textAlign: 'right', marginTop: '16px', fontSize: '16px', fontWeight: 'bold' }}>
                            Обща сума: {orderDetails.currentTotalAmountBgn?.toLocaleString('bg-BG', { minimumFractionDigits: 2 }) || '66 099,00'}
                            {orderDetails.profitAmountEur && (
                                <div style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
                                    Печалба: {orderDetails.profitAmountEur.toFixed(2)}€ ({orderDetails.profitPercentage?.toFixed(1)}%)
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Action Buttons */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginTop: '32px',
                        gap: '16px'
                    }}>
                        {/* Info Status */}
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ marginBottom: '8px', fontWeight: 500 }}>
                                Информация<br />за ПОРЪЧКА
                            </div>
                            <Button
                                type="default"
                                style={{
                                    width: '100%',
                                    marginBottom: '8px'
                                }}
                                onClick={() => handleOpenModal('orderInfo')}
                            >
                                Информация за ПОРЪЧКА
                            </Button>
                            <div
                                style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: '500',
                                    textTransform: 'uppercase',
                                    backgroundColor: getStatusColor(orderDetails.infoStatus, 'info'),
                                    color: 'white'
                                }}
                            >
                                {getStatusText(orderDetails.infoStatus, 'info')}
                            </div>
                        </div>

                        {/* Payment Status */}
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ marginBottom: '8px', fontWeight: 500 }}>
                                Информация<br />за ПЛАЩАНЕ
                            </div>
                            <Button
                                type="default"
                                style={{
                                    width: '100%',
                                    marginBottom: '8px'
                                }}
                                onClick={() => handleOpenModal('payment')}
                            >
                                Информация за ПЛАЩАНЕ
                            </Button>
                            <div
                                style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: '500',
                                    textTransform: 'uppercase',
                                    backgroundColor: getStatusColor(orderDetails.paymentStatus, 'payment'),
                                    color: 'white'
                                }}
                            >
                                {getStatusText(orderDetails.paymentStatus, 'payment')}
                            </div>
                        </div>

                        {/* Delivery Status */}
                        <div style={{ textAlign: 'center', flex: 1 }}>
                            <div style={{ marginBottom: '8px', fontWeight: 500 }}>
                                Информация<br />за ДОСТАВКА
                            </div>
                            <Button
                                type="default"
                                style={{
                                    width: '100%',
                                    marginBottom: '8px'
                                }}
                                onClick={() => handleOpenModal('delivery')}
                            >
                                Информация за ДОСТАВКА
                            </Button>
                            <div
                                style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: '500',
                                    textTransform: 'uppercase',
                                    backgroundColor: getStatusColor(orderDetails.deliveryStatus, 'delivery'),
                                    color: 'white'
                                }}
                            >
                                {getStatusText(orderDetails.deliveryStatus, 'delivery')}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        gap: '8px',
                        marginTop: '24px',
                        paddingTop: '16px',
                        borderTop: '1px solid #f0f0f0'
                    }}>
                        <Button onClick={onClose}>
                            Затвори
                        </Button>
                        <Button 
                            type="primary" 
                            style={{ backgroundColor: '#1890ff' }}
                            onClick={handleOrderUpdate}
                        >
                            ЗАПАЗИ
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Sub-modals */}
            <OrderInfoModal
                visible={modals.orderInfo}
                order={orderDetails}
                onClose={() => handleCloseModal('orderInfo')}
                onUpdate={handleOrderUpdate}
            />

            <PaymentModal
                visible={modals.payment}
                order={orderDetails}
                onClose={() => handleCloseModal('payment')}
                onUpdate={handleOrderUpdate}
            />

            <DeliveryModal
                visible={modals.delivery}
                order={orderDetails}
                onClose={() => handleCloseModal('delivery')}
                onUpdate={handleOrderUpdate}
            />
        </>
    );
};

// ============= ORDER INFO MODAL =============

// components/orders/OrderInfoModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Button, Upload, message, Space } from 'antd';
import { UploadOutlined, FileTextOutlined } from '@ant-design/icons';
import { ordersAPI } from '../../services/api';
import moment from 'moment';

const { TextArea } = Input;

const OrderInfoModal = ({ visible, order, onClose, onUpdate }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [confirmingOrder, setConfirmingOrder] = useState(false);
    const [calculatedTotal, setCalculatedTotal] = useState(0);
    const [attachmentFile, setAttachmentFile] = useState(null);

    useEffect(() => {
        if (visible && order) {
            // Set initial form values
            const initialValues = {
                currentQuantityLm: order.currentQuantityLm || 1170.00,
                currentQuantitySqm: order.currentQuantitySqm || 1420.00,
                currentUnitPriceEur: order.currentUnitPriceEur || 3.70,
                currentTotalPriceEur: order.currentTotalPriceEur || 43.50,
                additionalInfo: order.additionalInfo || ''
            };
            
            form.setFieldsValue(initialValues);
            calculateTotal(initialValues);
        }
    }, [visible, order, form]);

    const calculateTotal = (values = null) => {
        const formValues = values || form.getFieldsValue();
        const quantitySqm = parseFloat(formValues.currentQuantitySqm) || 0;
        const totalPriceEur = parseFloat(formValues.currentTotalPriceEur) || 0;
        
        // Business logic: calculate based on sqm * total price
        const total = quantitySqm * totalPriceEur;
        setCalculatedTotal(total);
        
        return total;
    };

    const handleFormChange = (changedFields, allFields) => {
        calculateTotal();
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            const updateData = {
                currentQuantityLm: values.currentQuantityLm,
                currentQuantitySqm: values.currentQuantitySqm,
                currentUnitPriceEur: values.currentUnitPriceEur,
                currentTotalPriceEur: values.currentTotalPriceEur,
                currentTotalAmountBgn: calculatedTotal, // Convert to BGN if needed
                currentTotalAmountEur: calculatedTotal,
                additionalInfo: values.additionalInfo
            };

            const response = await ordersAPI.updateOrderQuantitiesAndPrices(order.id, updateData);
            if (response.success) {
                message.success('Количествата и цените са обновени успешно');
                onUpdate && onUpdate();
            }
        } catch (error) {
            message.error('Грешка при запазване на промените');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOrder = async () => {
        try {
            // First save the current changes
            await handleSave();
            
            setConfirmingOrder(true);
            
            const attachmentData = attachmentFile ? {
                fileUrl: attachmentFile.response?.fileUrl,
                filename: attachmentFile.name
            } : null;

            const response = await ordersAPI.confirmOrder(order.id, { attachmentData });
            if (response.success) {
                message.success('Поръчката е потвърдена и email-ът е изпратен към производителя!');
                onUpdate && onUpdate();
                onClose();
            }
        } catch (error) {
            message.error('Грешка при потвърждаване на поръчката');
        } finally {
            setConfirmingOrder(false);
        }
    };

    const uploadProps = {
        name: 'file',
        action: '/api/upload',
        maxCount: 1,
        onChange(info) {
            if (info.file.status === 'done') {
                setAttachmentFile(info.file);
                message.success(`${info.file.name} файлът е качен успешно`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} файлът не можа да бъде качен`);
            }
        }
    };

    if (!order) return null;

    return (
        <Modal
            title="Информация за поръчката"
            visible={visible}
            onCancel={onClose}
            footer={null}
            width={800}
            className="order-info-modal"
        >
            {/* Header */}
            <div style={{ 
                background: '#000', 
                color: '#fff', 
                padding: '12px', 
                marginBottom: '24px',
                borderRadius: '4px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: '8px',
                fontSize: '12px',
                fontWeight: '500'
            }}>
                <span>ДОСТАВЧИК</span>
                <span>ДАТА</span>
                <span>№ НА ДОКУМЕНТ</span>
                <span>ДАТА НА ДОСТАВКА</span>
            </div>

            <div style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '4px', 
                marginBottom: '24px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr 1fr',
                gap: '16px'
            }}>
                <span>{order.supplierOrders?.[0]?.supplier?.name || order.supplierOrders?.[0]?.manufacturer?.name || 'Friulparchet'}</span>
                <span>{moment(order.orderDate).format('DD.MM.YYYY г.')}</span>
                <span>{order.documentNumber || '383'}</span>
                <span>{order.expectedDeliveryDate ? moment(order.expectedDeliveryDate).format('DD.MM.YYYY') : '1.9.2025'}</span>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFieldsChange={handleFormChange}
            >
                {/* Product Information */}
                <div style={{ 
                    background: '#f8f9fa', 
                    padding: '16px', 
                    borderRadius: '4px',
                    marginBottom: '24px'
                }}>
                    <h4 style={{ margin: '0 0 16px 0' }}>Поръчан продукт:</h4>
                    <div style={{ 
                        background: 'white', 
                        padding: '12px', 
                        borderRadius: '4px',
                        marginBottom: '16px'
                    }}>
                        <div>Дървен първаз в цвят на паркета-Дъб-80 мм височина-специално за Линднер</div>
                        <div style={{ marginTop: '8px' }}>Friulparchet Дъб Maxi TOP Natural Трислоен лак T15 W145 L1400 - 2200 Confort/Select</div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '24px' }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: '8px', fontWeight: 500 }}>Количество:</div>
                            <Form.Item
                                name="currentQuantityLm"
                                style={{ marginBottom: '8px' }}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    precision={2}
                                    min={0}
                                    addonAfter="л.м."
                                />
                            </Form.Item>
                            <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic', marginBottom: '16px' }}>
                                л.м. (за окончателна фактура)
                            </div>
                            
                            <Form.Item
                                name="currentQuantitySqm"
                                style={{ marginBottom: '8px' }}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    precision={2}
                                    min={0}
                                    addonAfter="кв.м."
                                />
                            </Form.Item>
                            <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
                                кв.м. (за окончателна фактура)
                            </div>
                        </div>
                        
                        <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: '8px', fontWeight: 500 }}>Цена €:</div>
                            <Form.Item
                                name="currentUnitPriceEur"
                                style={{ marginBottom: '8px' }}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    precision={2}
                                    min={0}
                                    placeholder="Единична цена"
                                />
                            </Form.Item>
                            <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic', marginBottom: '16px' }}>
                                за изчисляване на печалба
                            </div>
                            
                            <Form.Item
                                name="currentTotalPriceEur"
                                style={{ marginBottom: '8px' }}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    precision={2}
                                    min={0}
                                    placeholder="Обща цена"
                                />
                            </Form.Item>
                            <div style={{ fontSize: '11px', color: '#666', fontStyle: 'italic' }}>
                                за изчисляване на печалба
                            </div>
                        </div>
                    </div>
                    
                    <div style={{ 
                        textAlign: 'right',
                        marginTop: '16px',
                        padding: '12px',
                        background: '#f8f9fa',
                        borderRadius: '4px',
                        border: '1px solid #e8e8e8'
                    }}>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                            Обща сума: {calculatedTotal.toLocaleString('bg-BG', { 
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2 
                            })}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', fontWeight: 'normal', marginTop: '4px' }}>
                            (автоматично изчисляване при промяна)
                        </div>
                    </div>
                </div>

                {/* Additional Information */}
                <Form.Item
                    name="additionalInfo"
                    label="Допълнителна информация:"
                >
                    <TextArea
                        rows={3}
                        placeholder="потвърдени_пор."
                        style={{ resize: 'none' }}
                    />
                </Form.Item>

                {/* File Upload */}
                <div style={{ marginBottom: '24px' }}>
                    <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />}>
                            📎 Прикачи файл
                        </Button>
                    </Upload>
                    {(attachmentFile || order.attachmentFilename) && (
                        <div style={{ marginTop: '8px', color: '#666' }}>
                            <FileTextOutlined /> {attachmentFile?.name || order.attachmentFilename}
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: '8px'
                }}>
                    <Button onClick={onClose}>
                        Отказ
                    </Button>
                    <Button 
                        type="primary" 
                        onClick={handleSave}
                        loading={loading}
                        style={{ backgroundColor: '#1890ff' }}
                    >
                        ЗАПАЗИ
                    </Button>
                    <Button 
                        type="primary" 
                        onClick={handleConfirmOrder}
                        loading={confirmingOrder}
                        style={{ backgroundColor: '#52c41a' }}
                        disabled={order.infoStatus === 'confirmed'}
                    >
                        ПОТВЪРДИ
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default OrderInfoModal;

// components/orders/PaymentModal.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Button, Upload, message, InputNumber } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { ordersAPI } from '../../services/api';
import moment from 'moment';

const PaymentModal = ({ visible, order, onClose, onUpdate }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [payments, setPayments] = useState([]);

    useEffect(() => {
        if (visible && order) {
            loadPayments();
            // Set initial form values
            form.setFieldsValue({
                paymentDate: moment()
            });
        }
    }, [visible, order]);

    const loadPayments = async () => {
        try {
            const response = await ordersAPI.getOrderDetails(order.id);
            if (response.success) {
                setPayments(response.data.payments || []);
            }
        } catch (error) {
            message.error('Грешка при зареждане на плащанията');
        }
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const paymentData = {
                paymentType: 'partial',
                amountBgn: values.amount,
                paymentDate: values.paymentDate.format('YYYY-MM-DD'),
                referenceNumber: values.referenceNumber,
                swiftFileUrl: values.swiftFile?.file?.response?.fileUrl,
                notes: values.notes
            };

            const response = await ordersAPI.addPayment(order.id, paymentData);
            if (response.success) {
                message.success('Плащането е добавено успешно');
                form.resetFields();
                onUpdate();
                onClose();
            }
        } catch (error) {
            message.error('Грешка при добавяне на плащането');
        } finally {
            setLoading(false);
        }
    };

    const uploadProps = {
        name: 'file',
        action: '/api/upload',
        maxCount: 1,
        onChange(info) {
            if (info.file.status === 'done') {
                message.success(`${info.file.name} файлът е качен успешно`);
            } else if (info.file.status === 'error') {
                message.error(`${info.file.name} файлът не можа да бъде качен`);
            }
        }
    };

    const totalAmount = order?.totalAmountBgn || 66099.00;
    const paidAmount = order?.paidAmountBgn || 0;
    const remainingAmount = totalAmount - paidAmount;

    return (
        <Modal
            title="Информация за плащане"
            visible={visible}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            {/* Header */}
            <div style={{ 
                background: '#000', 
                color: '#fff', 
                padding: '12px', 
                marginBottom: '24px',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', gap: '40px' }}>
                    <span>ДОСТАВЧИК</span>
                    <span>ДАТА</span>
                </div>
                <div style={{ 
                    background: '#000', 
                    color: '#fff',
                    padding: '8px 16px',
                    borderRadius: '4px'
                }}>
                    <div style={{ textAlign: 'center' }}>ОБЩА СУМА</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                        {totalAmount.toLocaleString('bg-BG', { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            <div style={{ 
                background: '#f8f9fa', 
                padding: '12px', 
                marginBottom: '24px',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', gap: '40px' }}>
                    <span>Friulparchet</span>
                    <span>1.09.2025 г.</span>
                </div>
            </div>

            {/* Existing Payments */}
            {payments.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                    <h4>Направени плащания:</h4>
                    {payments.map((payment, index) => (
                        <div key={payment.id} style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            background: '#f0f0f0',
                            marginBottom: '8px',
                            borderRadius: '4px'
                        }}>
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <span>{payment.amountBgn.toLocaleString('bg-BG', { minimumFractionDigits: 2 })}</span>
                                <span>{moment(payment.paymentDate).format('DD.MM.YYYY')}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button icon={<UploadOutlined />} size="small">
                                    Прикачи SWIFT
                                </Button>
                                <Button icon={<DeleteOutlined />} size="small" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Payment Form */}
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
            >
                <div style={{ marginBottom: '16px' }}>
                    <strong>Плащане сума:</strong>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'end', marginBottom: '16px' }}>
                    <Form.Item
                        name="amount"
                        rules={[{ required: true, message: 'Въведете сума' }]}
                        style={{ flex: 1 }}
                    >
                        <InputNumber
                            style={{ width: '100%' }}
                            placeholder="50000.00"
                            min={0}
                            max={remainingAmount}
                            precision={2}
                            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="paymentDate"
                        rules={[{ required: true, message: 'Изберете дата' }]}
                    >
                        <DatePicker format="DD.MM.YYYY" />
                    </Form.Item>

                    <Button icon={<UploadOutlined />}>
                        Прикачи SWIFT
                    </Button>

                    <Button icon={<DeleteOutlined />} />
                </div>

                <Button
                    type="text"
                    style={{ 
                        background: '#52c41a', 
                        color: '#fff', 
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        marginBottom: '16px'
                    }}
                >
                    +
                </Button>

                <div style={{ 
                    textAlign: 'right', 
                    marginBottom: '24px',
                    fontSize: '16px'
                }}>
                    <div>ОСТАТЪК:</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                        {remainingAmount.toLocaleString('bg-BG', { minimumFractionDigits: 2 })} €
                    </div>
                </div>

                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: '8px'
                }}>
                    <Button onClick={onClose}>
                        Отказ
                    </Button>
                    <Button 
                        type="primary" 
                        htmlType="submit"
                        loading={loading}
                        style={{ backgroundColor: '#52c41a' }}
                    >
                        ЗАПИШИ
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

// ============= DELIVERY MODAL =============

// components/orders/DeliveryModal.jsx
import React, { useState } from 'react';
import { Modal, Form, Input, DatePicker, Button, InputNumber, message } from 'antd';
import { ordersAPI } from '../../services/api';
import moment from 'moment';

const DeliveryModal = ({ visible, order, onClose, onUpdate }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            const deliveryData = {
                deliveryDate: values.deliveryDate.format('YYYY-MM-DD'),
                transportCompany: values.transportCompany,
                deliveredQuantitySqm: values.deliveredQuantitySqm,
                deliveredPackages: values.deliveredPackages,
                deliveryNotes: values.deliveryNotes
            };

            const response = await ordersAPI.addDelivery(order.id, deliveryData);
            if (response.success) {
                message.success('Доставката е регистрирана успешно');
                form.resetFields();
                onUpdate();
                onClose();
            }
        } catch (error) {
            message.error('Грешка при регистриране на доставката');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Информация за доставка"
            visible={visible}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            {/* Header */}
            <div style={{ 
                background: '#000', 
                color: '#fff', 
                padding: '12px', 
                marginBottom: '24px',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', gap: '40px' }}>
                    <span>ДОСТАВКА</span>
                    <span>ДАТА</span>
                    <span>ТРАНСПОРТНА КОМПАНИЯ</span>
                </div>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    deliveryDate: moment(),
                    deliveredQuantitySqm: 1170.00,
                    deliveredPackages: 1420.00
                }}
            >
                <div style={{ 
                    background: '#f8f9fa', 
                    padding: '16px', 
                    marginBottom: '24px',
                    borderRadius: '4px'
                }}>
                    <Form.Item
                        name="transportCompany"
                        label="Транспортна компания"
                    >
                        <Input placeholder="Транспортна компания" />
                    </Form.Item>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <h4>Доставен продукт:</h4>
                    <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '4px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            Дървен първаз в цвят на паркета-Дъб-80 мм височина-специално за Линднер
                        </div>
                        <div>
                            Friulparchet Дъб Maxi TOP Natural Трислоен лак T15 W145 L1400 - 2200 Confort/Select
                        </div>
                    </div>
                    
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginTop: '16px',
                        gap: '16px'
                    }}>
                        <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: '8px' }}>Количество:</div>
                            <Form.Item
                                name="deliveredQuantitySqm"
                                style={{ marginBottom: '8px' }}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    precision={2}
                                    addonAfter="л.м."
                                />
                            </Form.Item>
                            <Form.Item
                                name="deliveredPackages"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    precision={2}
                                    addonAfter="кв.м."
                                />
                            </Form.Item>
                        </div>
                        
                        <div style={{ flex: 1 }}>
                            <div style={{ marginBottom: '8px' }}>Брой пакети:</div>
                            <Form.Item
                                name="packageCount1"
                                style={{ marginBottom: '8px' }}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    defaultValue={0}
                                />
                            </Form.Item>
                            <Form.Item
                                name="packageCount2"
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    defaultValue={0}
                                />
                            </Form.Item>
                        </div>
                    </div>
                </div>

                <Form.Item
                    name="deliveryDate"
                    label="Дата на доставка"
                    rules={[{ required: true, message: 'Изберете дата на доставка' }]}
                >
                    <DatePicker 
                        format="DD.MM.YYYY" 
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                <Button
                    style={{ 
                        background: '#f0f0f0', 
                        border: '1px solid #d9d9d9',
                        marginBottom: '24px'
                    }}
                >
                    Прикачи файл
                </Button>

                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: '8px'
                }}>
                    <Button onClick={onClose}>
                        Отказ
                    </Button>
                    <Button 
                        type="primary" 
                        htmlType="submit"
                        loading={loading}
                        style={{ backgroundColor: '#52c41a' }}
                    >
                        ПОТВЪРДИ
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

// ============= API SERVICE =============

// services/ordersAPI.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

export const ordersAPI = {
    // Get orders list with filters
    getOrders: async (filters = {}) => {
        const response = await axios.get(`${API_BASE_URL}/orders`, { params: filters });
        return response.data;
    },

    // Get order details
    getOrderDetails: async (orderId) => {
        const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
        return response.data;
    },

    // Create order from variant
    createOrderFromVariant: async (variantId, orderData) => {
        const response = await axios.post(`${API_BASE_URL}/orders/from-variant/${variantId}`, orderData);
        return response.data;
    },

    // Update order status
    updateOrderStatus: async (orderId, statusType, newStatus, notes) => {
        const response = await axios.put(`${API_BASE_URL}/orders/${orderId}/status/${statusType}`, {
            newStatus,
            notes
        });
        return response.data;
    },

    // Update order quantities and prices (NEW)
    updateOrderQuantitiesAndPrices: async (orderId, updateData) => {
        const response = await axios.put(`${API_BASE_URL}/orders/${orderId}/quantities-prices`, updateData);
        return response.data;
    },

    // Get profit analysis (NEW)
    getProfitAnalysis: async (orderId) => {
        const response = await axios.get(`${API_BASE_URL}/orders/${orderId}/profit-analysis`);
        return response.data;
    },

    // Confirm order (sends email)
    confirmOrder: async (orderId, data) => {
        const response = await axios.post(`${API_BASE_URL}/orders/${orderId}/confirm`, data);
        return response.data;
    },

    // Add payment
    addPayment: async (orderId, paymentData) => {
        const response = await axios.post(`${API_BASE_URL}/orders/${orderId}/payments`, paymentData);
        return response.data;
    },

    // Add delivery
    addDelivery: async (orderId, deliveryData) => {
        const response = await axios.post(`${API_BASE_URL}/orders/${orderId}/deliveries`, deliveryData);
        return response.data;
    },

    // Get payments for order
    getPayments: async (orderId) => {
        const response = await axios.get(`${API_BASE_URL}/orders/${orderId}/payments`);
        return response.data;
    },

    // Update payment
    updatePayment: async (orderId, paymentId, paymentData) => {
        const response = await axios.put(`${API_BASE_URL}/orders/${orderId}/payments/${paymentId}`, paymentData);
        return response.data;
    },

    // Delete payment
    deletePayment: async (orderId, paymentId) => {
        const response = await axios.delete(`${API_BASE_URL}/orders/${orderId}/payments/${paymentId}`);
        return response.data;
    },

    // Get deliveries for order
    getDeliveries: async (orderId) => {
        const response = await axios.get(`${API_BASE_URL}/orders/${orderId}/deliveries`);
        return response.data;
    },

    // Update delivery
    updateDelivery: async (orderId, deliveryId, deliveryData) => {
        const response = await axios.put(`${API_BASE_URL}/orders/${orderId}/deliveries/${deliveryId}`, deliveryData);
        return response.data;
    },

    // Export orders to Excel
    exportToExcel: async (filters = {}) => {
        const response = await axios.get(`${API_BASE_URL}/orders/export/excel`, { 
            params: filters,
            responseType: 'blob'
        });
        return response.data;
    },

    // Generate order PDF
    generateOrderPDF: async (orderId) => {
        const response = await axios.get(`${API_BASE_URL}/orders/${orderId}/generate-pdf`, {
            responseType: 'blob'
        });
        return response.data;
    },

    // Get orders summary report
    getOrdersSummary: async (filters = {}) => {
        const response = await axios.get(`${API_BASE_URL}/orders/reports/summary`, { params: filters });
        return response.data;
    },

    // Get financial report
    getFinancialReport: async (filters = {}) => {
        const response = await axios.get(`${API_BASE_URL}/orders/reports/financial`, { params: filters });
        return response.data;
    },

    // Get delivery status report
    getDeliveryReport: async () => {
        const response = await axios.get(`${API_BASE_URL}/orders/reports/delivery-status`);
        return response.data;
    }
};

export default OrdersList;