import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Input, Textarea, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/AppContext';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import OrderCard from '../../components/OrderCard';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { formatPrice, generateId, formatDate } from '../../utils';
import { OrderType, Order } from '../../types';
import classnames from 'classnames';
import styles from './index.module.scss';
import orderCardStyles from '../../components/OrderCard/index.module.scss';

const typeOptions: { key: OrderType; label: string }[] = [
  { key: 'normal', label: '普通订单' },
  { key: 'artist', label: '书画家定制' },
  { key: 'babyhair', label: '胎毛笔定制' },
];

const statusNames: Record<string, string> = {
  pending: '待处理',
  processing: '制作中',
  completed: '已完成',
  paid: '已收款',
  cancelled: '已取消',
};

const typeNames: Record<string, string> = {
  normal: '普通订单',
  artist: '书画家定制',
  babyhair: '胎毛笔定制',
};

interface FormProduct {
  productId: string;
  productName: string;
  quantity: string;
  price: string;
}

const OrderPage: React.FC = () => {
  const { orders, customers, products, addOrder, updateOrderStatus, completeOrderAndCreateSale } = useApp();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [formType, setFormType] = useState<OrderType>('normal');
  const [formCustomerIndex, setFormCustomerIndex] = useState<number>(-1);
  const [formRequireDate, setFormRequireDate] = useState('');
  const [formRemark, setFormRemark] = useState('');
  const [formProducts, setFormProducts] = useState<FormProduct[]>([]);
  const [formArtistName, setFormArtistName] = useState('');
  const [formCalligraphyStyle, setFormCalligraphyStyle] = useState('');
  const [formRequirement, setFormRequirement] = useState('');
  const [formBabyName, setFormBabyName] = useState('');
  const [formBirthday, setFormBirthday] = useState('');
  const [formHairDate, setFormHairDate] = useState('');
  const [formBlessing, setFormBlessing] = useState('');

  const tabs = [
    { key: 'all', label: '全部订单' },
    { key: 'artist', label: '书画家定制' },
    { key: 'babyhair', label: '胎毛笔定制' },
    { key: 'normal', label: '普通订单' },
    { key: 'pending', label: '待处理' },
  ];

  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders;
    if (activeTab === 'pending') return orders.filter(o => o.status === 'pending' || o.status === 'processing');
    return orders.filter(o => o.type === activeTab);
  }, [orders, activeTab]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const processingCount = orders.filter(o => o.status === 'processing').length;
    const completedCount = orders.filter(o => o.status === 'completed').length;
    return { total, pendingCount, processingCount, completedCount };
  }, [orders]);

  const totalAmount = useMemo(() => {
    return formProducts.reduce((sum, p) => {
      const qty = Number(p.quantity) || 0;
      const price = Number(p.price) || 0;
      return sum + qty * price;
    }, 0);
  }, [formProducts]);

  const resetForm = () => {
    setFormType('normal');
    setFormCustomerIndex(-1);
    setFormRequireDate('');
    setFormRemark('');
    setFormProducts([]);
    setFormArtistName('');
    setFormCalligraphyStyle('');
    setFormRequirement('');
    setFormBabyName('');
    setFormBirthday('');
    setFormHairDate('');
    setFormBlessing('');
  };

  const handleQuickEntry = (type: string) => {
    if (type === 'artist') {
      setActiveTab('artist');
      console.log('[Order] 快捷入口: 书画家定制');
    } else if (type === 'babyhair') {
      setActiveTab('babyhair');
      console.log('[Order] 快捷入口: 胎毛笔定制');
    } else {
      setActiveTab('normal');
      console.log('[Order] 快捷入口: 普通订单');
    }
  };

  const handleOrderClick = (order: any) => {
    Taro.showToast({ title: `查看${order.orderNo}`, icon: 'none' });
    console.log('[Order] 点击订单:', order.orderNo, order.id);
  };

  const handleNewOrder = () => {
    resetForm();
    setModalVisible(true);
    console.log('[Order] 点击新建订单');
  };

  const handleMoreMenu = () => {
    Taro.showActionSheet({
      itemList: ['客户管理', '销售台账', '收支结算'],
      success: (res) => {
        if (res.tapIndex === 0) {
          Taro.navigateTo({ url: '/pages/customer/index' });
          console.log('[Order] 跳转到客户管理');
        } else if (res.tapIndex === 1) {
          Taro.navigateTo({ url: '/pages/sales/index' });
          console.log('[Order] 跳转到销售台账');
        } else if (res.tapIndex === 2) {
          Taro.showToast({ title: '收支结算', icon: 'none' });
          console.log('[Order] 点击收支结算');
        }
      },
    });
  };

  const handleAddProduct = () => {
    if (products.length === 0) {
      Taro.showToast({ title: '暂无可用商品', icon: 'none' });
      return;
    }
    Taro.showActionSheet({
      itemList: products.map(p => `${p.name} (${formatPrice(p.price)})`),
      success: (res) => {
        const selected = products[res.tapIndex];
        const exists = formProducts.find(p => p.productId === selected.id);
        if (exists) {
          Taro.showToast({ title: '该商品已添加', icon: 'none' });
          return;
        }
        setFormProducts(prev => [
          ...prev,
          {
            productId: selected.id,
            productName: selected.name,
            quantity: '1',
            price: String(selected.price),
          },
        ]);
        console.log('[Order] 添加商品:', selected.name);
      },
    });
  };

  const handleRemoveProduct = (index: number) => {
    setFormProducts(prev => prev.filter((_, i) => i !== index));
  };

  const handleProductFieldChange = (index: number, field: 'quantity' | 'price', value: string) => {
    setFormProducts(prev => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const handleStartProcessing = (orderId: string) => {
    const result = updateOrderStatus(orderId, 'processing');
    if (result.success) {
      Taro.showToast({ title: '已开始制作', icon: 'success' });
      console.log('[Order] 开始制作订单:', orderId);
    } else {
      Taro.showToast({ title: result.message || '操作失败', icon: 'none' });
    }
  };

  const handleCompleteOrder = (orderId: string) => {
    const result = completeOrderAndCreateSale(orderId);
    if (result.success) {
      Taro.showToast({ title: '订单完成，已生成销售记录并扣减库存', icon: 'success', duration: 2500 });
      console.log('[Order] 完成订单并生成销售记录:', orderId);
    } else {
      Taro.showToast({ title: result.message || '操作失败', icon: 'none', duration: 2500 });
    }
  };

  const handleConfirmPaid = (orderId: string) => {
    const result = updateOrderStatus(orderId, 'paid');
    if (result.success) {
      Taro.showToast({ title: '已确认收款', icon: 'success' });
      console.log('[Order] 确认收款订单:', orderId);
    } else {
      Taro.showToast({ title: result.message || '操作失败', icon: 'none' });
    }
  };

  const renderOrderActions = (order: Order) => {
    if (order.status === 'pending') {
      return (
        <View
          className={classnames(orderCardStyles.actionBtn, orderCardStyles.actionBtnInfo)}
          onClick={() => handleStartProcessing(order.id)}
        >
          <Text>开始制作</Text>
        </View>
      );
    }
    if (order.status === 'processing') {
      return (
        <View
          className={classnames(orderCardStyles.actionBtn, orderCardStyles.actionBtnSuccess)}
          onClick={() => handleCompleteOrder(order.id)}
        >
          <Text>完成制作</Text>
        </View>
      );
    }
    if (order.status === 'completed') {
      return (
        <View
          className={classnames(orderCardStyles.actionBtn, orderCardStyles.actionBtnPrimary)}
          onClick={() => handleConfirmPaid(order.id)}
        >
          <Text>确认收款</Text>
        </View>
      );
    }
    return null;
  };

  const handleSubmit = () => {
    if (formCustomerIndex < 0) {
      Taro.showToast({ title: '请选择客户', icon: 'none' });
      return;
    }
    if (formProducts.length === 0) {
      Taro.showToast({ title: '请至少添加一个商品', icon: 'none' });
      return;
    }
    for (const p of formProducts) {
      const qty = Number(p.quantity);
      const price = Number(p.price);
      if (!qty || qty <= 0) {
        Taro.showToast({ title: `${p.productName} 数量必须大于0`, icon: 'none' });
        return;
      }
      if (!price || price <= 0) {
        Taro.showToast({ title: `${p.productName} 单价必须大于0`, icon: 'none' });
        return;
      }
    }

    const customer = customers[formCustomerIndex];
    const finalProducts = formProducts.map(p => ({
      productId: p.productId,
      productName: p.productName,
      quantity: Number(p.quantity),
      price: Number(p.price),
    }));
    const finalTotalAmount = finalProducts.reduce((sum, p) => sum + p.quantity * p.price, 0);

    const newOrder: any = {
      id: generateId(),
      orderNo: 'DD' + Date.now().toString().slice(-8),
      type: formType,
      typeName: typeNames[formType],
      customerId: customer.id,
      customerName: customer.name,
      products: finalProducts,
      totalAmount: finalTotalAmount,
      status: 'pending',
      statusName: statusNames['pending'],
      createDate: formatDate(new Date()),
      requireDate: formRequireDate || undefined,
      remark: formRemark.trim() || undefined,
    };

    if (formType === 'artist') {
      newOrder.artistInfo = {
        artistName: formArtistName.trim(),
        calligraphyStyle: formCalligraphyStyle.trim(),
        requirement: formRequirement.trim(),
      };
    } else if (formType === 'babyhair') {
      newOrder.babyInfo = {
        babyName: formBabyName.trim(),
        birthday: formBirthday,
        hairDate: formHairDate,
        blessing: formBlessing.trim(),
      };
    }

    addOrder(newOrder);
    Taro.showToast({ title: '创建成功', icon: 'success' });
    console.log('[Order] 新建订单:', newOrder);
    setModalVisible(false);
    resetForm();
  };

  return (
    <View className={styles.container}>
      <PageHeader title="定制订单" subtitle="匠心定制，笔笔传情" />

      <View className={styles.statsRow}>
        <StatCard title="订单总数" value={stats.total} unit="单" color="primary" />
        <StatCard title="待处理" value={stats.pendingCount} unit="单" color="warning" />
        <StatCard title="制作中" value={stats.processingCount} unit="单" color="info" />
        <StatCard title="已完成" value={stats.completedCount} unit="单" color="success" />
      </View>

      <View className={styles.quickEntry}>
        <View className={styles.quickItem} onClick={() => handleQuickEntry('artist')}>
          <Text className={styles.quickIcon}>🎨</Text>
          <Text className={styles.quickTitle}>书画家定制</Text>
          <Text className={styles.quickDesc}>专业定制</Text>
        </View>
        <View className={styles.quickItem} onClick={() => handleQuickEntry('babyhair')}>
          <Text className={styles.quickIcon}>👶</Text>
          <Text className={styles.quickTitle}>胎毛笔定制</Text>
          <Text className={styles.quickDesc}>珍贵纪念</Text>
        </View>
        <View className={styles.quickItem} onClick={() => handleQuickEntry('normal')}>
          <Text className={styles.quickIcon}>📦</Text>
          <Text className={styles.quickTitle}>普通订单</Text>
          <Text className={styles.quickDesc}>批发零售</Text>
        </View>
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
        <Text>订单列表</Text>
        <View style={{ display: 'flex', gap: 16 }}>
          <Text className={styles.sectionCount} onClick={handleMoreMenu}>
            ⋯ 更多
          </Text>
          <Text className={styles.sectionCount}>{filteredOrders.length}单</Text>
        </View>
      </View>

      <ScrollView scrollY className={styles.list}>
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onClick={() => handleOrderClick(order)}
              actions={renderOrderActions(order)}
            />
          ))
        ) : (
          <EmptyState
            icon="📋"
            title="暂无订单"
            description="点击下方按钮创建新订单"
            buttonText="新建订单"
            onButtonClick={handleNewOrder}
          />
        )}
      </ScrollView>

      <Button
        className="btnPrimary"
        onClick={handleNewOrder}
        style={{
          position: 'fixed',
          right: 32,
          bottom: 120,
          paddingLeft: 48,
          paddingRight: 48,
        }}
      >
        <Text>➕ 新建订单</Text>
      </Button>

      <Modal
        visible={modalVisible}
        title="新建订单"
        onClose={() => setModalVisible(false)}
        onConfirm={handleSubmit}
        confirmText="创建订单"
        cancelText="取消"
      >
        <View className={styles.formSectionTitle}>订单类型</View>
        <View className={styles.formGroup}>
          <View className={styles.tagGroup}>
            {typeOptions.map(opt => (
              <View
                key={opt.key}
                className={classnames(styles.tagItem, formType === opt.key && styles.tagItemActive)}
                onClick={() => setFormType(opt.key)}
              >
                <Text>{opt.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.divider} />
        <View className={styles.formSectionTitle}>基本信息</View>

        <View className={styles.formGroup}>
          <Text className={`${styles.label} ${styles.labelRequired}`}>选择客户</Text>
          <Picker
            mode="selector"
            range={customers.map(c => c.name)}
            value={formCustomerIndex >= 0 ? formCustomerIndex : 0}
            onChange={(e: any) => setFormCustomerIndex(Number(e.detail.value))}
          >
            <View className={styles.pickerWrap}>
              {formCustomerIndex >= 0 ? (
                <Text className={styles.pickerText}>{customers[formCustomerIndex].name}</Text>
              ) : (
                <Text className={`${styles.pickerText} ${styles.pickerPlaceholder}`}>请选择客户</Text>
              )}
              <Text>›</Text>
            </View>
          </Picker>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.label}>要求交货日期</Text>
          <Picker
            mode="date"
            value={formRequireDate}
            onChange={(e: any) => setFormRequireDate(e.detail.value)}
          >
            <View className={styles.pickerWrap}>
              {formRequireDate ? (
                <Text className={styles.pickerText}>{formRequireDate}</Text>
              ) : (
                <Text className={`${styles.pickerText} ${styles.pickerPlaceholder}`}>请选择交货日期</Text>
              )}
              <Text>›</Text>
            </View>
          </Picker>
        </View>

        <View className={styles.divider} />
        <View className={styles.formSectionTitle}>商品明细</View>

        {formProducts.map((p, index) => (
          <View key={index} className={styles.mixingItem}>
            <View className={styles.mixingHeader}>
              <Text className={styles.mixingName}>{p.productName}</Text>
              <Text className={styles.removeBtn} onClick={() => handleRemoveProduct(index)}>
                删除
              </Text>
            </View>
            <View className={styles.mixingRatio}>
              <Input
                className={styles.ratioInput}
                type="number"
                placeholder="数量"
                value={p.quantity}
                onInput={(e) => handleProductFieldChange(index, 'quantity', e.detail.value)}
              />
              <Text className={styles.ratioUnit}>支</Text>
              <Input
                className={styles.ratioInput}
                type="digit"
                placeholder="单价(元)"
                value={p.price}
                onInput={(e) => handleProductFieldChange(index, 'price', e.detail.value)}
              />
              <Text className={styles.ratioUnit}>元</Text>
            </View>
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 24, color: '#CD853F', fontWeight: 600 }}>
                小计: {formatPrice((Number(p.quantity) || 0) * (Number(p.price) || 0))}
              </Text>
            </View>
          </View>
        ))}

        <View className={styles.addBtn} onClick={handleAddProduct}>
          <Text>➕ 添加商品</Text>
        </View>

        <View
          style={{
            padding: 24,
            background: 'linear-gradient(135deg, #CD853F 0%, #DEB887 100%)',
            borderRadius: 16,
            marginBottom: 32,
          }}
        >
          <Text style={{ fontSize: 26, color: '#fff', opacity: 0.9 }}>订单总金额</Text>
          <Text style={{ fontSize: 48, fontWeight: 700, color: '#fff', display: 'block', marginTop: 8 }}>
            {formatPrice(totalAmount)}
          </Text>
        </View>

        {formType === 'artist' && (
          <>
            <View className={styles.divider} />
            <View className={styles.formSectionTitle}>书画家定制信息</View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>书画家姓名</Text>
              <Input
                className={styles.input}
                placeholder="请输入书画家姓名"
                value={formArtistName}
                onInput={(e) => setFormArtistName(e.detail.value)}
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>书法风格</Text>
              <Input
                className={styles.input}
                placeholder="如：楷书、行书、山水画等"
                value={formCalligraphyStyle}
                onInput={(e) => setFormCalligraphyStyle(e.detail.value)}
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>特殊要求</Text>
              <Textarea
                className={styles.textarea}
                placeholder="请输入特殊要求，如刻字、笔杆材质等"
                value={formRequirement}
                onInput={(e) => setFormRequirement(e.detail.value)}
              />
            </View>
          </>
        )}

        {formType === 'babyhair' && (
          <>
            <View className={styles.divider} />
            <View className={styles.formSectionTitle}>胎毛笔定制信息</View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>宝宝姓名</Text>
              <Input
                className={styles.input}
                placeholder="请输入宝宝姓名"
                value={formBabyName}
                onInput={(e) => setFormBabyName(e.detail.value)}
              />
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>出生日期</Text>
              <Picker
                mode="date"
                value={formBirthday}
                onChange={(e: any) => setFormBirthday(e.detail.value)}
              >
                <View className={styles.pickerWrap}>
                  {formBirthday ? (
                    <Text className={styles.pickerText}>{formBirthday}</Text>
                  ) : (
                    <Text className={`${styles.pickerText} ${styles.pickerPlaceholder}`}>请选择出生日期</Text>
                  )}
                  <Text>›</Text>
                </View>
              </Picker>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>剃发日期</Text>
              <Picker
                mode="date"
                value={formHairDate}
                onChange={(e: any) => setFormHairDate(e.detail.value)}
              >
                <View className={styles.pickerWrap}>
                  {formHairDate ? (
                    <Text className={styles.pickerText}>{formHairDate}</Text>
                  ) : (
                    <Text className={`${styles.pickerText} ${styles.pickerPlaceholder}`}>请选择剃发日期</Text>
                  )}
                  <Text>›</Text>
                </View>
              </Picker>
            </View>

            <View className={styles.formGroup}>
              <Text className={styles.label}>祝福语</Text>
              <Textarea
                className={styles.textarea}
                placeholder="请输入给宝宝的祝福语"
                value={formBlessing}
                onInput={(e) => setFormBlessing(e.detail.value)}
              />
            </View>
          </>
        )}

        <View className={styles.divider} />
        <View className={styles.formSectionTitle}>其他信息</View>

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
    </View>
  );
};

export default OrderPage;
