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

const ProductPage: React.FC = () => {
  const { products } = useApp();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'premium', label: '极品' },
    { key: 'fine', label: '精品' },
    { key: 'standard', label: '优品' },
    { key: 'normal', label: '普通' },
  ];

  const statusMap: Record<string, { name: string; class: string }> = {
    instock: { name: '在库', class: 'Instock' },
    sold: { name: '已售', class: 'Sold' },
    reserved: { name: '预留', class: 'Reserved' },
  };

  const getStatusClass = (status: string) => {
    const classKey = `status${statusMap[status]?.class || 'Instock'}`;
    return styles[classKey];
  };

  const filteredProducts = useMemo(() => {
    if (activeFilter === 'all') return products;
    return products.filter(p => p.grade === activeFilter);
  }, [products, activeFilter]);

  const stats = useMemo(() => {
    const total = products.length;
    const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const inStock = products.filter(p => p.status === 'instock').reduce((sum, p) => sum + p.quantity, 0);
    const premiumCount = products.filter(p => p.grade === 'premium').length;
    return { total, totalValue, inStock, premiumCount };
  }, [products]);

  const getGradeClass = (grade: string) => {
    const classMap: Record<string, string> = {
      premium: styles.gradePremium,
      fine: styles.gradeFine,
      standard: styles.gradeStandard,
      normal: styles.gradeNormal,
    };
    return classMap[grade] || styles.gradeNormal;
  };

  const handleProductClick = (product: any) => {
    Taro.showToast({ title: `查看${product.name}`, icon: 'none' });
    console.log('[Product] 点击成品:', product.name, product.id);
  };

  const handleAddProduct = () => {
    Taro.showToast({ title: '成品入库', icon: 'none' });
    console.log('[Product] 点击成品入库');
  };

  return (
    <View className={styles.container}>
      <PageHeader title="成品档案" subtitle="毫厘精工，笔笔匠心" />

      <View className={styles.statsRow}>
        <StatCard title="成品种类" value={stats.total} unit="种" color="primary" />
        <StatCard title="库存数量" value={stats.inStock} unit="支" color="success" />
        <StatCard title="总价值" value={stats.totalValue} unit="元" color="warning" />
      </View>

      <ScrollView scrollX className={styles.filterBar}>
        {filters.map(filter => (
          <View
            key={filter.key}
            className={`${styles.filterItem} ${activeFilter === filter.key ? styles.active : ''}`}
            onClick={() => setActiveFilter(filter.key)}
          >
            <Text className={styles.filterText}>{filter.label}</Text>
          </View>
        ))}
      </ScrollView>

      <ScrollView scrollY className={styles.list}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map(product => (
            <View key={product.id} className={styles.productCard} onClick={() => handleProductClick(product)}>
              <View className={styles.cardHeader}>
                <View className={styles.productInfo}>
                  <Text className={styles.productName}>{product.name}</Text>
                  <Text className={styles.productSpec}>
                    {product.spec.name} · 锋长{product.spec.length}mm
                  </Text>
                </View>
                <View className={classnames(styles.gradeBadge, getGradeClass(product.grade))}>
                  <Text className={styles.gradeText}>{product.gradeName}</Text>
                </View>
              </View>

              <View className={styles.productGrid}>
                <View className={styles.productGridItem}>
                  <Text className={styles.gridLabel}>库存</Text>
                  <Text className={styles.gridValue}>{product.quantity}支</Text>
                </View>
                <View className={styles.productGridItem}>
                  <Text className={styles.gridLabel}>单价</Text>
                  <Text className={classnames(styles.gridValue, styles.priceValue)}>{formatPrice(product.price)}</Text>
                </View>
                <View className={styles.productGridItem}>
                  <Text className={styles.gridLabel}>工序</Text>
                  <Text className={styles.gridValue}>{product.processRecords.length}道</Text>
                </View>
              </View>

              {product.remark && <Text className={styles.remark}>💡 {product.remark}</Text>}

              <View className={styles.statusRow}>
                <View className={classnames(styles.statusBadge, getStatusClass(product.status))}>
                  <Text className={styles.statusText}>{statusMap[product.status].name}</Text>
                </View>
                <Text className={styles.productDate}>{product.createDate}</Text>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon="🖌️"
            title="暂无成品档案"
            description="点击下方按钮登记新成品"
            buttonText="成品入库"
            onButtonClick={handleAddProduct}
          />
        )}
      </ScrollView>

      <Button
        className="btnPrimary"
        onClick={handleAddProduct}
        style={{
          position: 'fixed',
          right: 32,
          bottom: 120,
          paddingLeft: 48,
          paddingRight: 48,
        }}
      >
        <Text>➕ 成品入库</Text>
      </Button>
    </View>
  );
};

export default ProductPage;
