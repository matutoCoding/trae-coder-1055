import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/AppContext';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import MaterialCard from '../../components/MaterialCard';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { MaterialType, Material } from '../../types';
import { generateId, formatDate } from '../../utils';
import styles from './index.module.scss';

const MaterialPage: React.FC = () => {
  const { materials, addMaterial } = useApp();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'sheep' as MaterialType,
    grade: 'B' as 'S' | 'A' | 'B' | 'C',
    origin: '',
    quantity: 0,
    quality: '良好',
    color: '',
    supplier: '',
    remark: '',
  });

  const typeOptions = [
    { key: 'sheep', label: '🐑 羊毫', typeName: '羊毫' },
    { key: 'wolf', label: '🐺 狼毫', typeName: '狼毫' },
    { key: 'rabbit', label: '🐰 紫毫', typeName: '紫毫' },
    { key: 'other', label: '📦 其他', typeName: '其他' },
  ];

  const gradeOptions = [
    { key: 'S', label: 'S级（极品）' },
    { key: 'A', label: 'A级（优良）' },
    { key: 'B', label: 'B级（良好）' },
    { key: 'C', label: 'C级（普通）' },
  ];

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

  const getTypeName = (type: MaterialType) => {
    const found = typeOptions.find(t => t.key === type);
    return found ? found.typeName : '其他';
  };

  const resetForm = () => {
    setForm({
      name: '',
      type: 'sheep',
      grade: 'B',
      origin: '',
      quantity: 0,
      quality: '良好',
      color: '',
      supplier: '',
      remark: '',
    });
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
    console.log('[Material] 打开原料登记表单');
  };

  const handleMaterialClick = (material: any) => {
    Taro.showToast({ title: `查看${material.name}`, icon: 'none' });
    console.log('[Material] 点击原料:', material.name, material.id);
  };

  const handleQuickEntry = (type: MaterialType) => {
    setActiveFilter(type);
    console.log('[Material] 快捷入口:', type);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      Taro.showToast({ title: '请输入原料名称', icon: 'none' });
      return;
    }
    if (!form.quantity || form.quantity <= 0) {
      Taro.showToast({ title: '请输入正确的数量', icon: 'none' });
      return;
    }

    const newMaterial: Material = {
      id: generateId(),
      name: form.name,
      type: form.type,
      typeName: getTypeName(form.type),
      grade: form.grade,
      origin: form.origin || '未知产地',
      quantity: Number(form.quantity),
      unit: '克',
      inDate: formatDate(new Date()),
      quality: form.quality,
      color: form.color || '标准色',
      supplier: form.supplier || '本地供应商',
      remark: form.remark || undefined,
    };

    addMaterial(newMaterial);
    Taro.showToast({ title: '登记成功', icon: 'success' });
    setShowModal(false);
    resetForm();
    console.log('[Material] 新增原料成功:', newMaterial.name);
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

      <Modal
        visible={showModal}
        title="登记新原料"
        onClose={() => setShowModal(false)}
        onConfirm={handleSubmit}
        confirmText="登记入库"
      >
        <View className={styles.formGroup}>
          <Text className={`${styles.label} ${styles.labelRequired}`}>原料名称</Text>
          <Input
            className={styles.input}
            placeholder="如：湖羊优质纯白毫"
            value={form.name}
            onInput={(e) => setForm({ ...form, name: e.detail.value })}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={`${styles.label} ${styles.labelRequired}`}>毛料类型</Text>
          <View className={styles.tagGroup}>
            {typeOptions.map(opt => (
              <View
                key={opt.key}
                className={`${styles.tagItem} ${form.type === opt.key ? styles.tagItemActive : ''}`}
                onClick={() => setForm({ ...form, type: opt.key as MaterialType })}
              >
                <Text>{opt.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={`${styles.label} ${styles.labelRequired}`}>品质等级</Text>
          <View className={styles.tagGroup}>
            {gradeOptions.map(opt => (
              <View
                key={opt.key}
                className={`${styles.tagItem} ${form.grade === opt.key ? styles.tagItemActive : ''}`}
                onClick={() => setForm({ ...form, grade: opt.key as 'S' | 'A' | 'B' | 'C' })}
              >
                <Text>{opt.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={`${styles.label} ${styles.labelRequired}`}>入库数量（克）</Text>
          <Input
            className={styles.input}
            type="number"
            placeholder="请输入数量"
            value={form.quantity ? String(form.quantity) : ''}
            onInput={(e) => setForm({ ...form, quantity: Number(e.detail.value) })}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.label}>产地来源</Text>
          <Input
            className={styles.input}
            placeholder="如：浙江湖州"
            value={form.origin}
            onInput={(e) => setForm({ ...form, origin: e.detail.value })}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.label}>品质描述</Text>
          <Input
            className={styles.input}
            placeholder="如：优良、极品"
            value={form.quality}
            onInput={(e) => setForm({ ...form, quality: e.detail.value })}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.label}>毛色色系</Text>
          <Input
            className={styles.input}
            placeholder="如：纯白、深棕、紫黑"
            value={form.color}
            onInput={(e) => setForm({ ...form, color: e.detail.value })}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.label}>供应商</Text>
          <Input
            className={styles.input}
            placeholder="供应商名称"
            value={form.supplier}
            onInput={(e) => setForm({ ...form, supplier: e.detail.value })}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.label}>备注说明</Text>
          <Textarea
            className={styles.textarea}
            placeholder="其他需要记录的信息..."
            value={form.remark}
            onInput={(e) => setForm({ ...form, remark: e.detail.value })}
          />
        </View>
      </Modal>
    </View>
  );
};

export default MaterialPage;
