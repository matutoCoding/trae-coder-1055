import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/AppContext';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import MaterialCard from '../../components/MaterialCard';
import EmptyState from '../../components/EmptyState';
import { MaterialType } from '../../types';
import styles from './index.module.scss';

const MaterialPage: React.FC = () => {
  const { materials } = useApp();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'sheep', label: '羊毫' },
    { key: 'wolf', label: '狼毫' },
    { key: 'rabbit', label: '紫毫' },
    { key: 'other', label: '其他' },
  ];

  const filteredMaterials = useMemo(() => {
    if (activeFilter === 'all') return materials;
    return materials.filter(m => m.type === activeFilter);
  }, [materials, activeFilter]);

  const stats = useMemo(() => {
    const total = materials.reduce((sum, m) => sum + m.quantity, 0);
    const sheepCount = materials.filter(m => m.type === 'sheep').length;
    const wolfCount = materials.filter(m => m.type === 'wolf').length;
    const lowStock = materials.filter(m => m.quantity < 100).length;
    return { total, sheepCount, wolfCount, lowStock };
  }, [materials]);

  const handleAdd = () => {
    Taro.showToast({ title: '原料登记功能', icon: 'none' });
    console.log('[Material] 点击原料登记按钮');
  };

  const handleMaterialClick = (material: any) => {
    Taro.showToast({ title: `查看${material.name}`, icon: 'none' });
    console.log('[Material] 点击原料:', material.name, material.id);
  };

  const handleQuickEntry = (type: MaterialType) => {
    setActiveFilter(type);
    console.log('[Material] 快捷入口:', type);
  };

  return (
    <View className={styles.container}>
      <PageHeader title="原料管理" subtitle="羊毫狼毫，精选细料" />
      
      <View className={styles.statsRow}>
        <StatCard title="原料总量" value={stats.total} unit="克" color="primary" />
        <StatCard title="羊毫种类" value={stats.sheepCount} unit="种" color="success" />
        <StatCard title="狼毫种类" value={stats.wolfCount} unit="种" color="warning" />
      </View>

      <View className={styles.quickEntry}>
        <View className={styles.quickItem} onClick={() => handleQuickEntry('sheep')}>
          <Text className={styles.quickIcon}>🐑</Text>
          <Text className={styles.quickText}>羊毫</Text>
        </View>
        <View className={styles.quickItem} onClick={() => handleQuickEntry('wolf')}>
          <Text className={styles.quickIcon}>🐺</Text>
          <Text className={styles.quickText}>狼毫</Text>
        </View>
        <View className={styles.quickItem} onClick={() => handleQuickEntry('rabbit')}>
          <Text className={styles.quickIcon}>🐰</Text>
          <Text className={styles.quickText}>紫毫</Text>
        </View>
        <View className={styles.quickItem} onClick={() => handleQuickEntry('other')}>
          <Text className={styles.quickIcon}>📦</Text>
          <Text className={styles.quickText}>其他</Text>
        </View>
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
        {filteredMaterials.length > 0 ? (
          filteredMaterials.map(material => (
            <MaterialCard
              key={material.id}
              material={material}
              onClick={() => handleMaterialClick(material)}
            />
          ))
        ) : (
          <EmptyState
            icon="📦"
            title="暂无原料数据"
            description="点击右下角按钮登记新原料"
            buttonText="登记原料"
            onButtonClick={handleAdd}
          />
        )}
      </ScrollView>

      <Button className={styles.addBtn} onClick={handleAdd}>
        <Text className={styles.addBtnText}>+</Text>
      </Button>
    </View>
  );
};

export default MaterialPage;
