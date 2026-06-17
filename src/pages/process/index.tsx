import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/AppContext';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ProcessStep from '../../components/ProcessStep';
import EmptyState from '../../components/EmptyState';
import { brushSpecs } from '../../data/processes';
import { ProcessType } from '../../types';
import styles from './index.module.scss';

const ProcessPage: React.FC = () => {
  const { processes } = useApp();
  const [activeTab, setActiveTab] = useState<string>('all');

  const tabs = [
    { key: 'all', label: '全部工序' },
    { key: 'basin', label: '水盆' },
    { key: 'select', label: '择笔' },
    { key: 'assemble', label: '装笔' },
    { key: 'repair', label: '修笔' },
    { key: 'test', label: '试笔' },
  ];

  const filteredProcesses = useMemo(() => {
    if (activeTab === 'all') return processes;
    return processes.filter(p => p.type === activeTab);
  }, [processes, activeTab]);

  const stats = useMemo(() => {
    const total = processes.length;
    const basinCount = processes.filter(p => p.type === 'basin').length;
    const totalDuration = processes.reduce((sum, p) => sum + p.duration, 0);
    const excellentCount = processes.filter(p => p.quality === '极品' || p.quality === '优良').length;
    return { total, basinCount, totalDuration, excellentCount };
  }, [processes]);

  const handleAddProcess = () => {
    Taro.showToast({ title: '添加工序记录', icon: 'none' });
    console.log('[Process] 点击添加工序记录');
  };

  const handleViewSpecs = () => {
    Taro.showToast({ title: '笔头规格管理', icon: 'none' });
    console.log('[Process] 点击笔头规格管理');
  };

  const handleSpecClick = (spec: any) => {
    Taro.showToast({ title: `查看${spec.name}规格`, icon: 'none' });
    console.log('[Process] 点击规格:', spec.name, spec.id);
  };

  const handleProcessClick = (process: any) => {
    Taro.showToast({ title: `查看${process.name}`, icon: 'none' });
    console.log('[Process] 点击工序:', process.name, process.id);
  };

  return (
    <View className={styles.container}>
      <PageHeader title="制笔工序" subtitle="百道工序，一支好笔" />

      <View className={styles.statsRow}>
        <StatCard title="工序总数" value={stats.total} unit="道" color="primary" />
        <StatCard title="优良品率" value={Math.round((stats.excellentCount / stats.total) * 100)} unit="%" color="success" />
        <StatCard title="总工时" value={stats.totalDuration} unit="分" color="warning" />
      </View>

      <View className={styles.actionRow}>
        <Button className={`${styles.actionBtn} ${styles.primary}`} onClick={handleAddProcess}>
          <Text className={styles.actionBtnText}>➕ 添加工序</Text>
        </Button>
        <Button className={styles.actionBtn} onClick={handleViewSpecs}>
          <Text className={styles.actionBtnText}>📏 规格管理</Text>
        </Button>
      </View>

      <View className={styles.specSection}>
        <Text className={styles.specTitle}>笔头规格</Text>
        <ScrollView scrollX className={styles.specGrid}>
          {brushSpecs.slice(0, 6).map(spec => (
            <View key={spec.id} className={styles.specCard} onClick={() => handleSpecClick(spec)}>
              <Text className={styles.specName}>{spec.name}</Text>
              <Text className={styles.specInfo}>
                锋长：<Text className={styles.specValue}>{spec.length}mm</Text>
              </Text>
              <Text className={styles.specInfo}>
                直径：<Text className={styles.specValue}>{spec.diameter}mm</Text>
              </Text>
              <Text className={styles.specInfo}>
                毛量：<Text className={styles.specValue}>{spec.hairCount}根</Text>
              </Text>
            </View>
          ))}
        </ScrollView>
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
        <Text>工序记录</Text>
        <Text className={styles.sectionCount}>{filteredProcesses.length}条记录</Text>
      </View>

      <ScrollView scrollY className={styles.timeline}>
        {filteredProcesses.length > 0 ? (
          filteredProcesses.map((process, index) => (
            <ProcessStep
              key={process.id}
              process={process}
              isLast={index === filteredProcesses.length - 1}
              onClick={() => handleProcessClick(process)}
            />
          ))
        ) : (
          <View className={styles.emptyWrap}>
            <EmptyState
              icon="📋"
              title="暂无工序记录"
              description="点击上方按钮添加新的工序记录"
              buttonText="添加工序"
              onButtonClick={handleAddProcess}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default ProcessPage;
