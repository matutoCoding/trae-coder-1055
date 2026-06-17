import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/AppContext';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import EmptyState from '../../components/EmptyState';
import Modal from '../../components/Modal';
import { formatPrice, generateId, formatDate } from '../../utils';
import { brushSpecs } from '../../data/processes';
import classnames from 'classnames';
import styles from './index.module.scss';

const gradeOptions = [
  { key: 'premium', label: '极品' },
  { key: 'fine', label: '精品' },
  { key: 'standard', label: '优品' },
  { key: 'normal', label: '普通' },
];

const ProductPage: React.FC = () => {
  const { products, materials, addProduct } = useApp();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [formName, setFormName] = useState('');
  const [formSpec, setFormSpec] = useState<any>(null);
  const [formGrade, setFormGrade] = useState('');
  const [formQuantity, setFormQuantity] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formMaterials, setFormMaterials] = useState<string[]>([]);
  const [formRemark, setFormRemark] = useState('');

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

  const resetForm = () => {
    setFormName('');
    setFormSpec(null);
    setFormGrade('');
    setFormQuantity('');
    setFormPrice('');
    setFormMaterials([]);
    setFormRemark('');
  };

  const handleAddProduct = () => {
    resetForm();
    setModalVisible(true);
    console.log('[Product] 点击成品入库');
  };

  const toggleMaterial = (materialId: string) => {
    setFormMaterials(prev =>
      prev.includes(materialId)
        ? prev.filter(id => id !== materialId)
        : [...prev, materialId]
    );
  };

  const handleSubmit = () => {
    if (!formName.trim()) {
      Taro.showToast({ title: '请输入成品名称', icon: 'none' });
      return;
    }
    if (!formSpec) {
      Taro.showToast({ title: '请选择笔头规格', icon: 'none' });
      return;
    }
    if (!formGrade) {
      Taro.showToast({ title: '请选择品质等级', icon: 'none' });
      return;
    }
    const qty = Number(formQuantity);
    if (!qty || qty <= 0) {
      Taro.showToast({ title: '数量必须大于0', icon: 'none' });
      return;
    }
    const price = Number(formPrice);
    if (!price || price <= 0) {
      Taro.showToast({ title: '价格必须大于0', icon: 'none' });
      return;
    }

    const gradeName = gradeOptions.find(g => g.key === formGrade)?.label || '';

    const newProduct = {
      id: generateId(),
      name: formName.trim(),
      spec: formSpec,
      grade: formGrade,
      gradeName,
      materials: formMaterials,
      processRecords: [],
      createDate: formatDate(new Date()),
      quantity: qty,
      price,
      status: 'instock' as const,
      remark: formRemark.trim() || undefined,
    };

    addProduct(newProduct);
    Taro.showToast({ title: '入库成功', icon: 'success' });
    console.log('[Product] 新增成品:', newProduct);
    setModalVisible(false);
    resetForm();
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

      <Modal
        visible={modalVisible}
        title="成品入库"
        onClose={() => setModalVisible(false)}
        onConfirm={handleSubmit}
        confirmText="确认入库"
        cancelText="取消"
      >
        <View className={styles.sectionTitle}>基础信息</View>

        <View className={styles.formGroup}>
          <Text className={`${styles.label} ${styles.labelRequired}`}>成品名称</Text>
          <Input
            className={styles.input}
            placeholder="请输入成品名称"
            value={formName}
            onInput={(e) => setFormName(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={`${styles.label} ${styles.labelRequired}`}>笔头规格</Text>
          <View className={styles.tagGroup}>
            {brushSpecs.map(spec => (
              <View
                key={spec.id}
                className={classnames(styles.tagItem, formSpec?.id === spec.id && styles.tagItemActive)}
                onClick={() => setFormSpec(spec)}
              >
                <Text>{spec.name} · {spec.length}mm</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formGroup}>
          <Text className={`${styles.label} ${styles.labelRequired}`}>品质等级</Text>
          <View className={styles.tagGroup}>
            {gradeOptions.map(grade => (
              <View
                key={grade.key}
                className={classnames(styles.tagItem, formGrade === grade.key && styles.tagItemActive)}
                onClick={() => setFormGrade(grade.key)}
              >
                <Text>{grade.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.divider} />
        <View className={styles.sectionTitle}>数量与价格</View>

        <View className={styles.formGroup}>
          <Text className={`${styles.label} ${styles.labelRequired}`}>成品数量（支）</Text>
          <Input
            className={styles.input}
            type="number"
            placeholder="请输入成品数量"
            value={formQuantity}
            onInput={(e) => setFormQuantity(e.detail.value)}
          />
        </View>

        <View className={styles.formGroup}>
          <Text className={`${styles.label} ${styles.labelRequired}`}>单支价格（元）</Text>
          <Input
            className={styles.input}
            type="digit"
            placeholder="请输入单支价格"
            value={formPrice}
            onInput={(e) => setFormPrice(e.detail.value)}
          />
        </View>

        <View className={styles.divider} />
        <View className={styles.sectionTitle}>关联信息</View>

        <View className={styles.formGroup}>
          <Text className={styles.label}>关联毛料（可多选）</Text>
          <View className={styles.tagGroup}>
            {materials.map(material => (
              <View
                key={material.id}
                className={classnames(styles.tagItem, formMaterials.includes(material.id) && styles.tagItemActive)}
                onClick={() => toggleMaterial(material.id)}
              >
                <Text>{material.name}</Text>
              </View>
            ))}
          </View>
        </View>

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

export default ProductPage;
