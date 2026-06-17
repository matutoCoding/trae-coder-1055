import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/AppContext';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import EmptyState from '../../components/EmptyState';
import { formatPrice } from '../../utils';
import classnames from 'classnames';
import styles from './index.module.scss';

const SalesPage: React.FC = () => {
  const { sales } = useApp();
  const [activeTab, setActiveTab] = useState<string>('all');

  const tabs = [
    { key: 'all', label: '全部' },
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
    return { totalAmount, wholesaleAmount, retailAmount, maintenanceAmount, transactionCount };
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

  const handleAddSale = () => {
    Taro.showToast({ title: '新增销售记录', icon: 'none' });
    console.log('[Sales] 点击新增销售记录');
  };

  const handleSettle = () => {
    Taro.showToast({ title: '收支结算', icon: 'none' });
    console.log('[Sales] 点击收支结算');
  };

  const handleBack = () => {
    Taro.navigateBack();
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
        <StatCard title="平均客单" value={Math.round(stats.totalAmount / stats.transactionCount)} unit="元" color="success" />
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
                  <Text className={styles.productQty}>x{sale.quantity}</Text>
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
    </View>
  );
};

export default SalesPage;
