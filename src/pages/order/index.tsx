import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/AppContext';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import OrderCard from '../../components/OrderCard';
import EmptyState from '../../components/EmptyState';
import { formatPrice } from '../../utils';
import styles from './index.module.scss';

const OrderPage: React.FC = () => {
  const { orders } = useApp();
  const [activeTab, setActiveTab] = useState<string>('all');

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
    const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const customCount = orders.filter(o => o.type === 'artist' || o.type === 'babyhair').length;
    return { total, pendingCount, totalAmount, customCount };
  }, [orders]);

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
    Taro.showToast({ title: '新建订单', icon: 'none' });
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

  return (
    <View className={styles.container}>
      <PageHeader title="定制订单" subtitle="匠心定制，笔笔传情" />

      <View className={styles.statsRow}>
        <StatCard title="订单总数" value={stats.total} unit="单" color="primary" />
        <StatCard title="待处理" value={stats.pendingCount} unit="单" color="warning" />
        <StatCard title="总金额" value={formatPrice(stats.totalAmount)} color="success" />
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
    </View>
  );
};

export default OrderPage;
