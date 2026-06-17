import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  color?: 'primary' | 'success' | 'warning' | 'info';
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, unit, color = 'primary', onClick }) => {
  return (
    <View className={classnames(styles.card, styles[color])} onClick={onClick}>
      <Text className={styles.title}>{title}</Text>
      <View className={styles.valueWrap}>
        <Text className={styles.value}>{value}</Text>
        {unit && <Text className={styles.unit}>{unit}</Text>}
      </View>
    </View>
  );
};

export default StatCard;
