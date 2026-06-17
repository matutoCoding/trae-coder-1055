import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { Material } from '../../types';
import styles from './index.module.scss';

interface MaterialCardProps {
  material: Material;
  onClick?: () => void;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ material, onClick }) => {
  const getStockColor = () => {
    if (material.quantity < 100) return 'warning';
    if (material.quantity < 50) return 'danger';
    return 'normal';
  };

  const getGradeColor = () => {
    const colorMap: Record<string, string> = {
      S: '#DAA520',
      A: '#CD853F',
      B: '#8B7355',
      C: '#7a7a7a',
    };
    return colorMap[material.grade] || '#7a7a7a';
  };

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.typeTag} style={{ backgroundColor: getGradeColor() }}>
          <Text className={styles.typeText}>{material.typeName}</Text>
        </View>
        <View className={styles.gradeBadge} style={{ borderColor: getGradeColor() }}>
          <Text className={styles.gradeText} style={{ color: getGradeColor() }}>{material.grade}级</Text>
        </View>
      </View>
      <Text className={styles.name}>{material.name}</Text>
      <View className={styles.infoRow}>
        <Text className={styles.infoLabel}>产地：</Text>
        <Text className={styles.infoValue}>{material.origin}</Text>
      </View>
      <View className={styles.infoRow}>
        <Text className={styles.infoLabel}>品质：</Text>
        <Text className={styles.infoValue}>{material.quality}</Text>
      </View>
      <View className={styles.footer}>
        <View className={classnames(styles.stockBadge, styles[getStockColor()])}>
          <Text className={styles.stockText}>库存 {material.quantity}{material.unit}</Text>
        </View>
        <Text className={styles.date}>{material.inDate}</Text>
      </View>
    </View>
  );
};

export default MaterialCard;
