import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, showBack, onBack }) => {
  return (
    <View className={styles.header}>
      <View className={styles.headerContent}>
        <Text className={styles.title}>{title}</Text>
        {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
      </View>
      {showBack && (
        <View className={styles.backBtn} onClick={onBack}>
          <Text className={styles.backText}>返回</Text>
        </View>
      )}
    </View>
  );
};

export default PageHeader;
