import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/AppContext';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { formatPrice, formatDate, generateId, getTypeNames } from '../../utils';
import classnames from 'classnames';
import styles from './index.module.scss';
import { SaleType } from '../../types';

const SalesPage: React.FC = () => {
  const { sales, customers, products, addSale } = useApp();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);

  const [formType, setFormType] = useState<SaleType | ''>('');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [formCustomerName, setFormCustomerName] = useState('');
  const [formProductId, setFormProductId] = useState('');
  const [formProductName, setFormProductName] = useState('');
  const [formQuantity, setFormQuantity] = useState('1');
  const [formUnitPrice, setFormUnitPrice] = useState('');
  const [formOperator, setFormOperator] = useState('当前笔匠');
  const [formRemark, setFormRemark] = useState('');

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'wholesale', label: '批发' },
    { key: 'retail', label: '零售' },
    { key: 'maintenance', label: '修笔养护' },
  ];

  const saleTypes = [
    { key: 'wholesale', label: '批发' },
    { key: 'retail', label: '零售' },
    { key: 'maintenance', label: '修笔养护' },
  ];

  const filteredSales = useMemo(() => {
    if (activeTab === 'all') return sales;
    return sales.filter(s => s.type === activeTab);
  }, [sales, activeTab]);

  const stats = useMemo(() => {
    const totalAmount = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const wholesaleAmount = sales.filter(s => s.type === 'wholesale').reduce((sum, s) => sum + s.totalAmount, 0);
    const retailAmount = sales.filter(s => s.type === 'retail').reduce((sum, s) => sum + s.totalAmount, 0);
    const maintenanceAmount = sales.filter(s => s.type === 'maintenance').reduce((sum, s) => sum + s.totalAmount, 0);
    const transactionCount = sales.length;
    const avgOrder = transactionCount > 0 ? Math.round(totalAmount / transactionCount) : 0;
    return { totalAmount, wholesaleAmount, retailAmount, maintenanceAmount, transactionCount, avgOrder };
  }, [sales]);

  const getTypeClass = (type: string) => {
    const classMap: Record<string, string> = {
      wholesale: styles.typeWholesale,
      retail: styles.typeRetail,
      maintenance: styles.typeMaintenance,
    };
    return classMap[type] || '';
  };

  const handleSaleClick = (sale: any) => {
    Taro.showToast({ title: `查看${sale.orderNo}`, icon: 'none' });
    console.log('[Sales] 点击销售记录:', sale.orderNo, sale.id);
  };

  const resetForm = () => {
    setFormType('');
    setFormCustomerId('');
    setFormCustomerName('');
    setFormProductId('');
    setFormProductName('');
    setFormQuantity('1');
    setFormUnitPrice('');
    setFormOperator('当前笔匠');
    setFormRemark('');
  };

  const handleAddSale = () => {
    resetForm();
    setShowAddModal(true);
  };

  const validateForm = (): string | null => {
    if (!formType) return '请选择销售类型';
    if (formType !== 'maintenance' && !formProductId) return '请选择商品';
    const qty = parseFloat(formQuantity);
    if (isNaN(qty) || qty <= 0) return '数量必须大于0';
    const price = parseFloat(formUnitPrice);
    if (isNaN(price) || price <= 0) return '单价必须大于0';
    if (!formOperator.trim()) return '请填写经办人';
    return null;
  };

  const generateOrderNo = (): string => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const todayCount = sales.filter(s => s.date === formatDate(now)).length + 1;
    return `XS${dateStr}${String(todayCount).padStart(3, '0')}`;
  };

  const handleConfirmAdd = () => {
    const error = validateForm();
    if (error) {
      Taro.showToast({ title: error, icon: 'none' });
      return;
    }

    const quantity = parseFloat(formQuantity);
    const unitPrice = parseFloat(formUnitPrice);
    const totalAmount = Math.round(quantity * unitPrice * 100) / 100;

    let productName = formProductName;
    let productId = formProductId;
    if (formType === 'maintenance') {
      productName = formProductName || '修笔养护服务';
      productId = formProductId || undefined;
    }

    const newSale = {
      id: generateId(),
      orderNo: generateOrderNo(),
      type: formType as SaleType,
      typeName: getTypeNames[formType],
      customerId: formCustomerId || undefined,
      customerName: formCustomerName || undefined,
      productId: productId || undefined,
      productName: productName || undefined,
      quantity,
      unitPrice,
      totalAmount,
      date: formatDate(new Date()),
      operator: formOperator.trim(),
      remark: formRemark || undefined,
    };

    addSale(newSale);
    setShowAddModal(false);
    Taro.showToast({ title: '添加成功', icon: 'success' });
    console.log('[Sales] 新增销售记录:', newSale);
  };

  const handleSettle = () => {
    setShowSettleModal(true);
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  const handleSelectCustomer = (customer: any) => {
    setFormCustomerId(customer.id);
    setFormCustomerName(customer.name);
    setShowCustomerPicker(false);
  };

  const handleSelectProduct = (product: any) => {
    setFormProductId(product.id);
    setFormProductName(product.name);
    if (!formUnitPrice) {
      setFormUnitPrice(String(product.price));
    }
    setShowProductPicker(false);
  };

  return (
    <View className={styles.container}>
      <PageHeader title="销售台账" subtitle="诚信经营，童叟无欺" showBack onBack={handleBack} />

      <View className={styles.summaryCard}>
        <Text className={styles.summaryTitle}>累计销售额</Text>
        <Text className={styles.summaryAmount}>{formatPrice(stats.totalAmount)}</Text>
        <View className={styles.summaryGrid}>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>批发</Text>
            <Text className={styles.summaryValue}>{formatPrice(stats.wholesaleAmount)}</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>零售</Text>
            <Text className={styles.summaryValue}>{formatPrice(stats.retailAmount)}</Text>
          </View>
          <View className={styles.summaryItem}>
            <Text className={styles.summaryLabel}>养护</Text>
            <Text className={styles.summaryValue}>{formatPrice(stats.maintenanceAmount)}</Text>
          </View>
        </View>
      </View>

      <View className={styles.statsRow}>
        <StatCard title="交易笔数" value={stats.transactionCount} unit="笔" color="primary" />
        <StatCard title="平均客单" value={stats.avgOrder} unit="元" color="success" />
      </View>

      <View className={styles.actionRow}>
        <Button className={`${styles.actionBtn} ${styles.primary}`} onClick={handleAddSale}>
          <Text className={styles.actionBtnText}>➕ 新增销售</Text>
        </Button>
        <Button className={styles.actionBtn} onClick={handleSettle}>
          <Text className={styles.actionBtnText}>💰 收支结算</Text>
        </Button>
      </View>

      <ScrollView scrollX className={styles.tabs}>
        {tabs.map(tab => (
          <View
            key={tab.key}
            className={`${styles.tabItem} ${activeTab === tab.key ? styles.active : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <Text className={styles.tabText}>{tab.label}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.sectionTitle}>
        <Text>销售记录</Text>
        <Text className={styles.sectionCount}>{filteredSales.length}笔</Text>
      </View>

      <ScrollView scrollY className={styles.list}>
        {filteredSales.length > 0 ? (
          filteredSales.map(sale => (
            <View key={sale.id} className={styles.saleCard} onClick={() => handleSaleClick(sale)}>
              <View className={styles.cardHeader}>
                <View className={classnames(styles.typeTag, getTypeClass(sale.type))}>
                  <Text className={styles.typeText}>{sale.typeName}</Text>
                </View>
                <Text className={styles.orderNo}>{sale.orderNo}</Text>
              </View>

              {sale.customerName && (
                <View className={styles.customerRow}>
                  <Text className={styles.customerLabel}>客户：</Text>
                  <Text className={styles.customerName}>{sale.customerName}</Text>
                </View>
              )}

              {sale.productName && (
                <View className={styles.productRow}>
                  <Text className={styles.productName}>{sale.productName}</Text>
                  {sale.type !== 'maintenance' && sale.quantity > 0 && (
                    <Text className={styles.productQty}>x{sale.quantity}</Text>
                  )}
                  <Text className={styles.productPrice}>{formatPrice(sale.totalAmount)}</Text>
                </View>
              )}

              {!sale.productName && (
                <View className={styles.productRow}>
                  <Text className={styles.productName}>{sale.typeName}服务</Text>
                  <Text className={styles.productPrice}>{formatPrice(sale.totalAmount)}</Text>
                </View>
              )}

              <View className={styles.cardFooter}>
                <Text className={styles.operator}>经办人：{sale.operator}</Text>
                <Text className={styles.date}>{sale.date}</Text>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon="💰"
            title="暂无销售记录"
            description="点击上方按钮添加新销售记录"
            buttonText="新增销售"
            onButtonClick={handleAddSale}
          />
        )}
      </ScrollView>

      <Modal
        visible={showAddModal}
        title="新增销售记录"
        onClose={() => setShowAddModal(false)}
        onConfirm={handleConfirmAdd}
        confirmText="保存"
      >
        <View className={styles.formGroup}>
          <Text className={`${styles.label} ${styles.labelRequired}`}>销售类型</Text>
          <View className={styles.tagGroup}>
            {saleTypes.map(type => (
              <View
                key={type.key}
                className={classnames(styles.tagItem, formType === type.key && styles.tagItemActive)}
                onClick={() => {
                  setFormType(type.key as SaleType);
                  if (type.key === 'maintenance') {
                    setFormProductId('');
                    setFormProductName('');
                    setFormQuantity('1');
                  }
                }}
              >
                <Text>{type.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.label}>选择客户</Text>
          <View className={styles.pickerWrap} onClick={() => setShowCustomerPicker(true)}>
            <Text className={classnames(styles.pickerText, !formCustomerName && styles.pickerPlaceholder)}>
              {formCustomerName || '请选择客户（选填）'}
            </Text>
          </View>
        </View>

        {formType !== 'maintenance' && (
          <View className={styles.formGroup}>
            <Text className={`${styles.label} ${styles.labelRequired}`}>选择商品</Text>
            <View className={styles.pickerWrap} onClick={() => setShowProductPicker(true)}>
              <Text className={classnames(styles.pickerText, !formProductName && styles.pickerPlaceholder)}>
                {formProductName || '请选择商品'}
              </Text>
            </View>
          </View>
        )}

        {formType === 'maintenance' && (
          <View className={styles.formGroup}>
            <Text className={styles.label}>服务内容</Text>
            <Input
              className={styles.input}
              placeholder="修笔养护服务"
              value={formProductName}
              onInput={(e) => setFormProductName(e.detail.value)}
            />
          </View>
        )}

        <View className={styles.formGroup}>
          <Text className={`${styles.label} ${styles.labelRequired}`}>数量</Text>
          <Input
            className={styles.input}
            type="digit"
            placeholder="请输入数量"
            value={formQuantity}
            onInput={(e) => setFormQuantity(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={`${styles.label} ${styles.labelRequired}`}>单价（元）</Text>
          <Input
            className={styles.input}
            type="digit"
            placeholder="请输入单价"
            value={formUnitPrice}
            onInput={(e) => setFormUnitPrice(e.detail.value)}
          />
        </View>

        {formQuantity && formUnitPrice && !isNaN(parseFloat(formQuantity)) && !isNaN(parseFloat(formUnitPrice)) && (
          <View className={styles.formGroup}>
            <Text className={styles.label}>小计金额</Text>
            <Text style={{ fontSize: '36rpx', fontWeight: '600', color: '#8B4513' }}>
              {formatPrice(parseFloat(formQuantity) * parseFloat(formUnitPrice))}
            </Text>
          </View>
        )}

        <View className={styles.formGroup}>
          <Text className={`${styles.label} ${styles.labelRequired}`}>经办人</Text>
          <Input
            className={styles.input}
            placeholder="请输入经办人"
            value={formOperator}
            onInput={(e) => setFormOperator(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.label}>备注</Text>
          <Textarea
            className={styles.textarea}
            placeholder="请输入备注信息（选填）"
            value={formRemark}
            onInput={(e) => setFormRemark(e.detail.value)}
          />
        </View>
      </Modal>

      <Modal
        visible={showCustomerPicker}
        title="选择客户"
        onClose={() => setShowCustomerPicker(false)}
        showFooter={false}
      >
        {customers.length > 0 ? (
          customers.map(customer => (
            <View
              key={customer.id}
              className={styles.pickerWrap}
              style={{ marginBottom: '16rpx' }}
              onClick={() => handleSelectCustomer(customer)}
            >
              <View>
                <Text className={styles.pickerText}>{customer.name}</Text>
                <Text style={{ fontSize: '24rpx', color: '#999' }}>{customer.typeName} · {customer.phone}</Text>
              </View>
            </View>
          ))
        ) : (
          <EmptyState icon="📋" title="暂无客户" description="请先添加客户" />
        )}
      </Modal>

      <Modal
        visible={showProductPicker}
        title="选择商品"
        onClose={() => setShowProductPicker(false)}
        showFooter={false}
      >
        {products.length > 0 ? (
          products.map(product => (
            <View
              key={product.id}
              className={styles.pickerWrap}
              style={{ marginBottom: '16rpx', height: 'auto', padding: '16rpx 24rpx' }}
              onClick={() => handleSelectProduct(product)}
            >
              <View style={{ flex: 1 }}>
                <Text className={styles.pickerText}>{product.name}</Text>
                <Text style={{ fontSize: '24rpx', color: '#999' }}>
                  {product.gradeName} · 库存{product.quantity} · {formatPrice(product.price)}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <EmptyState icon="🖌️" title="暂无商品" description="请先添加商品" />
        )}
      </Modal>

      <Modal
        visible={showSettleModal}
        title="收支结算"
        onClose={() => setShowSettleModal(false)}
        confirmText="确定"
        cancelText="关闭"
      >
        <View className={styles.settleCard}>
          <Text className={styles.settleTitle}>总收入</Text>
          <Text className={styles.settleAmount}>{formatPrice(stats.totalAmount)}</Text>
          <View className={styles.settleRow}>
            <Text className={styles.settleLabel}>批发收入</Text>
            <Text className={styles.settleValue}>{formatPrice(stats.wholesaleAmount)}</Text>
          </View>
          <View className={styles.settleRow}>
            <Text className={styles.settleLabel}>零售收入</Text>
            <Text className={styles.settleValue}>{formatPrice(stats.retailAmount)}</Text>
          </View>
          <View className={styles.settleRow}>
            <Text className={styles.settleLabel}>养护收入</Text>
            <Text className={styles.settleValue}>{formatPrice(stats.maintenanceAmount)}</Text>
          </View>
        </View>

        <View className={styles.sectionTitle}>交易统计</View>
        <View className={styles.settleRow}>
          <Text className={styles.label}>总交易笔数</Text>
          <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#333' }}>
            {stats.transactionCount} 笔
          </Text>
        </View>
        <View className={styles.settleRow}>
          <Text className={styles.label}>平均客单价</Text>
          <Text style={{ fontSize: '28rpx', fontWeight: '600', color: '#8B4513' }}>
            {formatPrice(stats.avgOrder)}
          </Text>
        </View>

        <View className={styles.divider} />
        <View className={styles.settleRow}>
          <Text className={styles.label}>结算日期</Text>
          <Text style={{ fontSize: '28rpx', color: '#666' }}>{formatDate(new Date())}</Text>
        </View>
      </Modal>
    </View>
  );
};

export default SalesPage;
