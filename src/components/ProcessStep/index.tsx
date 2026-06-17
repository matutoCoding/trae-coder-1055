import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { ProcessRecord } from '../../types';
import styles from './index.module.scss';

interface ProcessStepProps {
  process: ProcessRecord;
  isLast?: boolean;
  onClick?: () => void;
}

const ProcessStep: React.FC<ProcessStepProps> = ({ process, isLast, onClick }) => {
  const getTypeIcon = () => {
    const iconMap: Record<string, string> = {
      basin: '💧',
      select: '✂️',
      assemble: '🔧',
      repair: '🔨',
      test: '✍️',
    };
    return iconMap[process.type] || '📋';
  };

  const getTypeColor = () => {
    const colorMap: Record<string, string> = {
      basin: '#4682B4',
      select: '#DAA520',
      assemble: '#CD853F',
      repair: '#8B4513',
      test: '#2E8B57',
    };
    return colorMap[process.type] || '#7a7a7a';
  };

  return (
    <View className={classnames(styles.step, { [styles.last]: isLast })} onClick={onClick}>
      <View className={styles.timeline}>
        <View className={styles.dot} style={{ backgroundColor: getTypeColor() }}>
          <Text className={styles.dotIcon}>{getTypeIcon()}</Text>
        </View>
        {!isLast && <View className={styles.line} />}
      </View>
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.typeName} style={{ color: getTypeColor() }}>{process.typeName}</Text>
          <Text className={styles.date}>{process.date}</Text>
        </View>
        <Text className={styles.name}>{process.name}</Text>
        <View className={styles.meta}>
          <Text className={styles.metaItem}>匠人：{process.operator}</Text>
          <Text className={styles.metaItem}>用时：{process.duration}分钟</Text>
        </View>
        <View className={styles.qualityRow}>
          <Text className={styles.qualityLabel}>品质：</Text>
          <Text className={styles.qualityValue}>{process.quality}</Text>
        </View>
        {process.remark && <Text className={styles.remark}>{process.remark}</Text>}
      </View>
    </View>
  );
};

export default ProcessStep;
