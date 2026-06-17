import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/AppContext';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import EmptyState from '../../components/EmptyState';
import styles from './index.module.scss';

const MixingPage: React.FC = () => {
  const { mixings } = useApp();
  const [showForm, setShowForm] = useState(false);

  const stats = useMemo(() => {
    const totalRecords = mixings.length;
    const totalWeight = mixings.reduce((sum, m) => sum + m.totalWeight, 0);
    const totalMaterials = mixings.reduce((sum, m) => sum + m.materials.length, 0);
    return { totalRecords, totalWeight, totalMaterials };
  }, [mixings]);

  const handleAddMixing = () => {
    Taro.showToast({ title: '新建配料单', icon: 'none' });
    console.log('[Mixing] 点击新建配料单');
    setShowForm(true);
  };

  const handleViewHistory = () => {
    Taro.showToast({ title: '历史配比查询', icon: 'none' });
    console.log('[Mixing] 点击历史配比查询');
  };

  const handleCardClick = (mixing: any) => {
    Taro.showToast({ title: `查看${mixing.name}`, icon: 'none' });
    console.log('[Mixing] 点击配料记录:', mixing.name, mixing.id);
  };

  return (
    <View className={styles.container}>
      <PageHeader title="配料记录" subtitle="毛料梳理，精准配比" />
      
      <View className={styles.statsRow}>
        <StatCard title="配料记录" value={stats.totalRecords} unit="条" color="primary" />
        <StatCard title="总用毛量" value={stats.totalWeight} unit="克" color="success" />
        <StatCard title="原料使用" value={stats.totalMaterials} unit="次" color="warning" />
      </View>

      <View className={styles.actionRow}>
        <Button className={`${styles.actionBtn} ${styles.primary}`} onClick={handleAddMixing}>
          <Text className={styles.actionBtnText}>➕ 新建配料</Text>
        </Button>
        <Button className={styles.actionBtn} onClick={handleViewHistory}>
          <Text className={styles.actionBtnText}>📋 历史配方</Text>
        </Button>
      </View>

      <Text className={styles.sectionTitle}>配料记录</Text>

      <ScrollView scrollY className={styles.list}>
        {mixings.length > 0 ? (
          mixings.map(mixing => (
            <View key={mixing.id} className={styles.card} onClick={() => handleCardClick(mixing)}>
              <View className={styles.cardHeader}>
                <Text className={styles.cardTitle}>{mixing.name}</Text>
                <View className={styles.purposeTag}>
                  <Text className={styles.purposeText}>{mixing.purpose}</Text>
                </View>
              </View>
              
              <View className={styles.metaRow}>
                <Text className={styles.metaItem}>🧑‍🍳 {mixing.operator}</Text>
                <Text className={styles.metaItem}>📅 {mixing.date}</Text>
              </View>

              <View className={styles.materialsSection}>
                <Text className={styles.materialsTitle}>配料比例</Text>
                {mixing.materials.map((mat, idx) => (
                  <View key={idx} className={styles.materialItem}>
                    <Text className={styles.materialName}>{mat.materialName}</Text>
                    <View className={styles.ratioBar}>
                      <View className={styles.ratioBg}>
                        <View className={styles.ratioFill} style={{ width: `${mat.ratio}%` }} />
                      </View>
                    </View>
                    <Text className={styles.ratioText}>{mat.ratio}%</Text>
                  </View>
                ))}
                <View className={styles.totalWeight}>
                  <Text className={styles.totalLabel}>总重量</Text>
                  <Text className={styles.totalValue}>{mixing.totalWeight}克</Text>
                </View>
              </View>

              {mixing.remark && <Text className={styles.remark}>💡 {mixing.remark}</Text>}

              <View className={styles.cardFooter}>
                <Text className={styles.operator}>匠人：{mixing.operator}</Text>
                <Text className={styles.date}>{mixing.date}</Text>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon="⚗️"
            title="暂无配料记录"
            description="点击上方按钮创建新的配料单"
            buttonText="新建配料"
            onButtonClick={handleAddMixing}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default MixingPage;
