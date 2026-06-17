import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/AppContext';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { generateId, formatDate } from '../../utils';
import styles from './index.module.scss';

interface MixingMaterialForm {
  materialId: string;
  materialName: string;
  ratio: number;
}

const MixingPage: React.FC = () => {
  const { mixings, materials, addMixing } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [showMaterialPicker, setShowMaterialPicker] = useState(false);
  const [currentMaterialIndex, setCurrentMaterialIndex] = useState<number | null>(null);
  const [selectedPurposeFilter, setSelectedPurposeFilter] = useState<string>('全部');
  const [selectedOperatorFilter, setSelectedOperatorFilter] = useState<string>('全部');

  const [formName, setFormName] = useState('');
  const [formPurpose, setFormPurpose] = useState('');
  const [formOperator, setFormOperator] = useState('');
  const [formTotalWeight, setFormTotalWeight] = useState<string>('');
  const [formMaterials, setFormMaterials] = useState<MixingMaterialForm[]>([]);
  const [formRemark, setFormRemark] = useState('');

  const stats = useMemo(() => {
    const totalRecords = mixings.length;
    const totalWeight = mixings.reduce((sum, m) => sum + m.totalWeight, 0);
    const totalMaterials = mixings.reduce((sum, m) => sum + m.materials.length, 0);
    return { totalRecords, totalWeight, totalMaterials };
  }, [mixings]);

  const purposeOptions = useMemo(() => {
    const purposes = Array.from(new Set(mixings.map(m => m.purpose)));
    return ['全部', ...purposes];
  }, [mixings]);

  const operatorOptions = useMemo(() => {
    const operators = Array.from(new Set(mixings.map(m => m.operator)));
    return ['全部', ...operators];
  }, [mixings]);

  const filteredMixings = useMemo(() => {
    return mixings.filter(m => {
      const matchPurpose = selectedPurposeFilter === '全部' || m.purpose === selectedPurposeFilter;
      const matchOperator = selectedOperatorFilter === '全部' || m.operator === selectedOperatorFilter;
      return matchPurpose && matchOperator;
    });
  }, [mixings, selectedPurposeFilter, selectedOperatorFilter]);

  const resetForm = () => {
    setFormName('');
    setFormPurpose('');
    setFormOperator('');
    setFormTotalWeight('');
    setFormMaterials([]);
    setFormRemark('');
    setCurrentMaterialIndex(null);
    setShowMaterialPicker(false);
  };

  const handleAddMixing = () => {
    resetForm();
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

  const handleAddMaterial = () => {
    const newMaterial: MixingMaterialForm = {
      materialId: '',
      materialName: '',
      ratio: 0,
    };
    setFormMaterials([...formMaterials, newMaterial]);
  };

  const handleRemoveMaterial = (index: number) => {
    const updated = formMaterials.filter((_, i) => i !== index);
    setFormMaterials(updated);
  };

  const handleOpenMaterialPicker = (index: number) => {
    setCurrentMaterialIndex(index);
    setShowMaterialPicker(true);
  };

  const handleSelectMaterial = (material: any) => {
    if (currentMaterialIndex === null) return;
    const alreadySelected = formMaterials.some(
      (m, i) => i !== currentMaterialIndex && m.materialId === material.id
    );
    if (alreadySelected) {
      Taro.showToast({ title: '该毛料已添加', icon: 'none' });
      setShowMaterialPicker(false);
      return;
    }
    const updated = [...formMaterials];
    updated[currentMaterialIndex] = {
      materialId: material.id,
      materialName: material.name,
      ratio: updated[currentMaterialIndex].ratio || 0,
    };
    setFormMaterials(updated);
    setShowMaterialPicker(false);
    setCurrentMaterialIndex(null);
  };

  const handleRatioChange = (index: number, value: string) => {
    const updated = [...formMaterials];
    const num = parseFloat(value);
    updated[index] = {
      ...updated[index],
      ratio: isNaN(num) ? 0 : num,
    };
    setFormMaterials(updated);
  };

  const validateForm = (): boolean => {
    if (!formName.trim()) {
      Taro.showToast({ title: '请填写配方名称', icon: 'none' });
      return false;
    }
    if (formMaterials.length === 0) {
      Taro.showToast({ title: '请至少选择一种毛料', icon: 'none' });
      return false;
    }
    const hasEmptyMaterial = formMaterials.some(m => !m.materialId);
    if (hasEmptyMaterial) {
      Taro.showToast({ title: '请为每一项选择毛料', icon: 'none' });
      return false;
    }
    const hasInvalidRatio = formMaterials.some(m => m.ratio <= 0);
    if (hasInvalidRatio) {
      Taro.showToast({ title: '每个毛料比例必须为正数', icon: 'none' });
      return false;
    }
    const totalWeightNum = parseFloat(formTotalWeight);
    if (isNaN(totalWeightNum) || totalWeightNum <= 0) {
      Taro.showToast({ title: '总重量必须为正数', icon: 'none' });
      return false;
    }
    return true;
  };

  const handleSaveMixing = () => {
    if (!validateForm()) return;

    const totalRatio = formMaterials.reduce((sum, m) => sum + m.ratio, 0);
    if (totalRatio !== 100) {
      Taro.showModal({
        title: '提示',
        content: `当前比例总和为 ${totalRatio}%，建议为 100%。是否继续保存？`,
        confirmText: '继续保存',
        cancelText: '返回修改',
        success: (res) => {
          if (res.confirm) {
            saveMixingRecord();
          }
        },
      });
    } else {
      saveMixingRecord();
    }
  };

  const saveMixingRecord = () => {
    const newRecord = {
      id: generateId(),
      name: formName.trim(),
      purpose: formPurpose.trim() || '未指定',
      operator: formOperator.trim() || '未指定',
      totalWeight: parseFloat(formTotalWeight),
      materials: formMaterials.map(m => ({
        materialId: m.materialId,
        materialName: m.materialName,
        ratio: m.ratio,
      })),
      date: formatDate(new Date()),
      remark: formRemark.trim() || undefined,
    };

    addMixing(newRecord);
    Taro.showToast({ title: '保存成功', icon: 'success' });
    console.log('[Mixing] 新建配料记录:', newRecord);
    setShowForm(false);
    resetForm();
  };

  const handleCloseForm = () => {
    if (formName.trim() || formMaterials.length > 0 || formTotalWeight) {
      Taro.showModal({
        title: '提示',
        content: '确定要放弃填写吗？',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            setShowForm(false);
            resetForm();
          }
        },
      });
    } else {
      setShowForm(false);
      resetForm();
    }
  };

  const totalRatioSum = useMemo(() => {
    return formMaterials.reduce((sum, m) => sum + (m.ratio || 0), 0);
  }, [formMaterials]);

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

      <View className={styles.filterBar}>
        <View className={styles.filterRow}>
          <Text className={styles.filterLabel}>用途：</Text>
          <ScrollView scrollX className={styles.filterTags}>
            {purposeOptions.map(purpose => (
              <View
                key={purpose}
                className={`${styles.filterTag} ${selectedPurposeFilter === purpose ? styles.filterTagActive : ''}`}
                onClick={() => setSelectedPurposeFilter(purpose)}
              >
                <Text>{purpose}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
        <View className={styles.filterRow}>
          <Text className={styles.filterLabel}>匠人：</Text>
          <ScrollView scrollX className={styles.filterTags}>
            {operatorOptions.map(operator => (
              <View
                key={operator}
                className={`${styles.filterTag} ${selectedOperatorFilter === operator ? styles.filterTagActive : ''}`}
                onClick={() => setSelectedOperatorFilter(operator)}
              >
                <Text>{operator}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      <Text className={styles.sectionTitle}>
        配料记录 {filteredMixings.length !== mixings.length ? `（筛选 ${filteredMixings.length}/${mixings.length}）` : ''}
      </Text>

      <ScrollView scrollY className={styles.list}>
        {filteredMixings.length > 0 ? (
          filteredMixings.map(mixing => (
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
            title={mixings.length > 0 ? '暂无匹配的配料记录' : '暂无配料记录'}
            description={mixings.length > 0 ? '请尝试调整筛选条件' : '点击上方按钮创建新的配料单'}
            buttonText={mixings.length > 0 ? '重置筛选' : '新建配料'}
            onButtonClick={() => {
              if (mixings.length > 0) {
                setSelectedPurposeFilter('全部');
                setSelectedOperatorFilter('全部');
              } else {
                handleAddMixing();
              }
            }}
          />
        )}
      </ScrollView>

      <Modal
        visible={showForm}
        title="新建配料单"
        onClose={handleCloseForm}
        onConfirm={handleSaveMixing}
        confirmText="保存"
        cancelText="取消"
      >
        <View className={styles.formGroup}>
          <Text className={`${styles.label} ${styles.labelRequired}`}>配方名称</Text>
          <Input
            className={styles.input}
            placeholder="请输入配方名称，如：大楷兼毫配方"
            value={formName}
            onInput={(e) => setFormName(e.detail.value)}
            maxLength={30}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.label}>用途</Text>
          <Input
            className={styles.input}
            placeholder="请输入用途，如：制作大楷兼毫笔"
            value={formPurpose}
            onInput={(e) => setFormPurpose(e.detail.value)}
            maxLength={50}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={styles.label}>匠人</Text>
          <Input
            className={styles.input}
            placeholder="请输入匠人姓名"
            value={formOperator}
            onInput={(e) => setFormOperator(e.detail.value)}
            maxLength={20}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={`${styles.label} ${styles.labelRequired}`}>总重量（克）</Text>
          <Input
            className={styles.input}
            type="digit"
            placeholder="请输入总重量，如：100"
            value={formTotalWeight}
            onInput={(e) => setFormTotalWeight(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <View className={styles.mixingHeader}>
            <Text className={`${styles.label} ${styles.labelRequired}`} style={{ marginBottom: 0 }}>
              毛料配方
            </Text>
            <Text style={{ fontSize: '24rpx', color: totalRatioSum === 100 ? '#2E8B57' : '#CD5C5C' }}>
              比例合计：{totalRatioSum}%
            </Text>
          </View>
        </View>

        {formMaterials.map((mat, index) => (
          <View key={index} className={styles.mixingItem}>
            <View className={styles.mixingHeader}>
              <View
                className={styles.pickerWrap}
                style={{ flex: 1, marginRight: '16rpx', height: '64rpx' }}
                onClick={() => handleOpenMaterialPicker(index)}
              >
                {mat.materialId ? (
                  <Text className={styles.pickerText}>{mat.materialName}</Text>
                ) : (
                  <Text className={`${styles.pickerText} ${styles.pickerPlaceholder}`}>点击选择毛料</Text>
                )}
              </View>
              <Text className={styles.removeBtn} onClick={() => handleRemoveMaterial(index)}>
                删除
              </Text>
            </View>
            <View className={styles.mixingRatio}>
              <Text className={styles.label} style={{ marginBottom: 0, minWidth: '100rpx' }}>比例</Text>
              <Input
                className={styles.ratioInput}
                type="digit"
                placeholder="请输入比例"
                value={mat.ratio === 0 ? '' : String(mat.ratio)}
                onInput={(e) => handleRatioChange(index, e.detail.value)}
              />
              <Text className={styles.ratioUnit}>%</Text>
            </View>
          </View>
        ))}

        <View className={styles.addBtn} onClick={handleAddMaterial}>
          <Text>➕ 添加毛料</Text>
        </View>

        <View className={styles.divider} />

        <View className={styles.formGroup}>
          <Text className={styles.label}>备注</Text>
          <Input
            className={styles.textarea}
            placeholder="请输入备注信息（可选）"
            value={formRemark}
            onInput={(e) => setFormRemark(e.detail.value)}
            maxLength={200}
          />
        </View>
      </Modal>

      <Modal
        visible={showMaterialPicker}
        title="选择毛料"
        onClose={() => {
          setShowMaterialPicker(false);
          setCurrentMaterialIndex(null);
        }}
        showFooter={false}
      >
        <View className={styles.tagGroup}>
          {materials.length > 0 ? (
            materials.map(material => {
              const isDisabled = formMaterials.some(
                (m, i) => i !== currentMaterialIndex && m.materialId === material.id
              );
              const isSelected = currentMaterialIndex !== null && 
                formMaterials[currentMaterialIndex]?.materialId === material.id;
              return (
                <View
                  key={material.id}
                  className={`${styles.tagItem} ${isSelected ? styles.tagItemActive : ''}`}
                  style={{ opacity: isDisabled ? 0.4 : 1 }}
                  onClick={() => {
                    if (!isDisabled) {
                      handleSelectMaterial(material);
                    }
                  }}
                >
                  <Text>{material.name}</Text>
                </View>
              );
            })
          ) : (
            <EmptyState
              icon="🧶"
              title="暂无毛料"
              description="请先在毛料管理中添加毛料"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

export default MixingPage;
