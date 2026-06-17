import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/AppContext';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ProcessStep from '../../components/ProcessStep';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { brushSpecs } from '../../data/processes';
import { ProcessType } from '../../types';
import { generateId, formatDate } from '../../utils';
import styles from './index.module.scss';

const processTypeOptions = [
  { key: 'basin', label: '水盆' },
  { key: 'select', label: '择笔' },
  { key: 'assemble', label: '装笔' },
  { key: 'repair', label: '修笔' },
  { key: 'test', label: '试笔' },
];

const qualityOptions = ['极品', '优良', '精品', '优品', '普通'];

const ProcessPage: React.FC = () => {
  const { processes, addProcess } = useApp();
  const [activeTab, setActiveTab] = useState<string>('all');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [specModalVisible, setSpecModalVisible] = useState(false);

  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('');
  const [formTypeName, setFormTypeName] = useState('');
  const [formOperator, setFormOperator] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formQuality, setFormQuality] = useState('');
  const [formRemark, setFormRemark] = useState('');

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

  const resetForm = () => {
    setFormName('');
    setFormType('');
    setFormTypeName('');
    setFormOperator('');
    setFormDuration('');
    setFormQuality('');
    setFormRemark('');
  };

  const handleAddProcess = () => {
    resetForm();
    setAddModalVisible(true);
  };

  const handleViewSpecs = () => {
    setSpecModalVisible(true);
  };

  const handleSpecClick = (spec: any) => {
    Taro.showToast({ title: `查看${spec.name}规格`, icon: 'none' });
    console.log('[Process] 点击规格:', spec.name, spec.id);
  };

  const handleProcessClick = (process: any) => {
    Taro.showToast({ title: `查看${process.name}`, icon: 'none' });
    console.log('[Process] 点击工序:', process.name, process.id);
  };

  const handleTypeSelect = (key: string, label: string) => {
    setFormType(key);
    setFormTypeName(label + '工序');
  };

  const handleSubmitProcess = () => {
    if (!formName.trim()) {
      Taro.showToast({ title: '请输入工序名称', icon: 'none' });
      return;
    }
    if (!formType) {
      Taro.showToast({ title: '请选择工序类型', icon: 'none' });
      return;
    }
    if (!formOperator.trim()) {
      Taro.showToast({ title: '请输入操作人', icon: 'none' });
      return;
    }
    if (!formDuration || parseInt(formDuration) <= 0) {
      Taro.showToast({ title: '请输入有效的工序时长', icon: 'none' });
      return;
    }

    const newProcess = {
      id: generateId(),
      name: formName.trim(),
      type: formType as ProcessType,
      typeName: formTypeName,
      operator: formOperator.trim(),
      duration: parseInt(formDuration),
      quality: formQuality || '优品',
      date: formatDate(new Date()),
      remark: formRemark.trim(),
    };

    addProcess(newProcess);
    Taro.showToast({ title: '添加成功', icon: 'success' });
    setAddModalVisible(false);
    resetForm();
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
          {brushSpecs.map(spec => (
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

      <Modal
        visible={addModalVisible}
        title="添加工序"
        onClose={() => setAddModalVisible(false)}
        onConfirm={handleSubmitProcess}
        confirmText="保存"
        cancelText="取消"
      >
        <View className={styles.formGroup}>
          <Text className={`${styles.label} ${styles.labelRequired}`}>工序名称</Text>
          <Input
            className={styles.input}
            placeholder="请输入工序名称"
            value={formName}
            onInput={(e) => setFormName(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={`${styles.label} ${styles.labelRequired}`}>工序类型</Text>
          <View className={styles.tagGroup}>
            {processTypeOptions.map(opt => (
              <View
                key={opt.key}
                className={`${styles.tagItem} ${formType === opt.key ? styles.tagItemActive : ''}`}
                onClick={() => handleTypeSelect(opt.key, opt.label)}
              >
                <Text>{opt.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={`${styles.label} ${styles.labelRequired}`}>操作人</Text>
          <Input
            className={styles.input}
            placeholder="请输入操作人姓名"
            value={formOperator}
            onInput={(e) => setFormOperator(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={`${styles.label} ${styles.labelRequired}`}>工序时长（分钟）</Text>
          <Input
            className={styles.input}
            type="number"
            placeholder="请输入工序时长"
            value={formDuration}
            onInput={(e) => setFormDuration(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.label}>品质等级</Text>
          <View className={styles.tagGroup}>
            {qualityOptions.map(opt => (
              <View
                key={opt}
                className={`${styles.tagItem} ${formQuality === opt ? styles.tagItemActive : ''}`}
                onClick={() => setFormQuality(opt)}
              >
                <Text>{opt}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.label}>备注说明</Text>
          <Textarea
            className={styles.textarea}
            placeholder="请输入备注说明（选填）"
            value={formRemark}
            onInput={(e) => setFormRemark(e.detail.value)}
          />
        </View>
      </Modal>

      <Modal
        visible={specModalVisible}
        title="笔头规格管理"
        onClose={() => setSpecModalVisible(false)}
        showFooter={false}
      >
        <Text className={styles.sectionTitle}>全部笔头规格（{brushSpecs.length}种）</Text>
        {brushSpecs.map(spec => (
          <View key={spec.id} className={styles.specCard} onClick={() => handleSpecClick(spec)}>
            <View className={styles.specRow}>
              <Text className={styles.specLabel}>名称</Text>
              <Text className={styles.specValue}>{spec.name}</Text>
            </View>
            <View className={styles.specRow}>
              <Text className={styles.specLabel}>锋长</Text>
              <Text className={styles.specValue}>{spec.length}mm</Text>
            </View>
            <View className={styles.specRow}>
              <Text className={styles.specLabel}>直径</Text>
              <Text className={styles.specValue}>{spec.diameter}mm</Text>
            </View>
            <View className={styles.specRow}>
              <Text className={styles.specLabel}>毛量</Text>
              <Text className={styles.specValue}>{spec.hairCount}根</Text>
            </View>
            <View className={styles.specRow}>
              <Text className={styles.specLabel}>用途</Text>
              <Text className={styles.specValue}>{spec.purpose}</Text>
            </View>
          </View>
        ))}
      </Modal>
    </View>
  );
};

export default ProcessPage;
