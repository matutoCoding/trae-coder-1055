import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { Order } from '../../types';
import { formatPrice } from '../../utils';
import styles from './index.module.scss';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
  const getStatusColor = () => {
    const colorMap: Record<string, string> = {
      pending: '#CD853F',
      processing: '#4682B4',
      completed: '#2E8B57',
      cancelled: '#CD5C5C',
    };
    return colorMap[order.status] || '#7a7a7a';
  };

  const getTypeIcon = () => {
    const iconMap: Record<string, string> = {
      artist: '🎨',
      babyhair: '👶',
      normal: '📦',
    };
    return iconMap[order.type] || '📋';
  };

  return (
    <View className={styles.card} onClick={onClick}>
      <View className={styles.header}>
        <View className={styles.typeRow}>
          <Text className={styles.typeIcon}>{getTypeIcon()}</Text>
          <Text className={styles.typeName}>{order.typeName}</Text>
        </View>
        <View className={styles.statusBadge} style={{ backgroundColor: getStatusColor() }}>
          <Text className={styles.statusText}>{order.statusName}</Text>
        </View>
      </View>
      <Text className={styles.orderNo}>{order.orderNo}</Text>
      <View className={styles.customerRow}>
        <Text className={styles.customerLabel}>客户：</Text>
        <Text className={styles.customerName}>{order.customerName}</Text>
      </View>
      <View className={styles.products}>
        {order.products.slice(0, 2).map((p, idx) => (
          <View key={idx} className={styles.productItem}>
            <Text className={styles.productName}>{p.productName}</Text>
            <Text className={styles.productQty}>x{p.quantity}</Text>
          </View>
        ))}
        {order.products.length > 2 && (
          <Text className={styles.more}>...等{order.products.length}件商品</Text>
        )}
      </View>
      {order.babyInfo && (
        <View className={styles.babyInfo}>
          <Text className={styles.babyName}>👶 {order.babyInfo.babyName}</Text>
          <Text className={styles.babyBlessing}>{order.babyInfo.blessing}</Text>
        </View>
      )}
      {order.artistInfo && (
        <View className={styles.artistInfo}>
          <Text className={styles.artistName}>🎨 {order.artistInfo.artistName}</Text>
          <Text className={styles.artistStyle}>{order.artistInfo.calligraphyStyle}</Text>
        </View>
      )}
      <View className={styles.footer}>
        <Text className={styles.date}>{order.createDate}</Text>
        <Text className={styles.amount}>{formatPrice(order.totalAmount)}</Text>
      </View>
    </View>
  );
};

export default OrderCard;
