import React from 'react';
import { View, Text } from '@tarojs/components';
import classnames from 'classnames';
import { Order } from '../../types';
import { formatPrice } from '../../utils';
import styles from './index.module.scss';

interface OrderCardProps {
  order: Order;
  onClick?: () => void;
  actions?: React.ReactNode;
}

const STATUS_STEPS: { key: Order['status']; label: string }[] = [
  { key: 'pending', label: '待处理' },
  { key: 'processing', label: '制作中' },
  { key: 'completed', label: '已完成' },
  { key: 'paid', label: '已收款' },
];

const CUSTOM_PROGRESS_TEXT: Record<Order['status'], string> = {
  pending: '等待笔匠接单',
  processing: '笔匠精心制作中',
  completed: '已完成，等待您验收',
  paid: '已收款，感谢惠顾',
  cancelled: '订单已取消',
};

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick, actions }) => {
  const getStatusColor = () => {
    const colorMap: Record<string, string> = {
      pending: '#CD853F',
      processing: '#4682B4',
      completed: '#2E8B57',
      paid: '#8B4513',
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

  const getStepState = (stepKey: Order['status']): 'done' | 'active' | 'pending' => {
    const orderIndex = STATUS_STEPS.findIndex(s => s.key === order.status);
    const stepIndex = STATUS_STEPS.findIndex(s => s.key === stepKey);
    if (order.status === 'cancelled') return 'pending';
    if (stepIndex < orderIndex) return 'done';
    if (stepIndex === orderIndex) return 'active';
    return 'pending';
  };

  const isCustomOrder = order.type === 'artist' || order.type === 'babyhair';

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

      {order.status !== 'cancelled' && (
        <View className={styles.progressBar}>
          {STATUS_STEPS.map((step, idx) => {
            const state = getStepState(step.key);
            return (
              <View key={step.key} className={styles.stepItem}>
                <View
                  className={classnames(styles.stepDot, {
                    [styles.stepDotDone]: state === 'done',
                    [styles.stepDotActive]: state === 'active',
                  })}
                >
                  {state === 'done' && <Text className={styles.stepCheck}>✓</Text>}
                  {state === 'active' && <Text className={styles.stepDotInner} />}
                </View>
                <Text
                  className={classnames(styles.stepLabel, {
                    [styles.stepLabelDone]: state === 'done',
                    [styles.stepLabelActive]: state === 'active',
                  })}
                >
                  {step.label}
                </Text>
                {idx < STATUS_STEPS.length - 1 && (
                  <View
                    className={classnames(styles.stepLine, {
                      [styles.stepLineDone]: state === 'done',
                    })}
                  />
                )}
              </View>
            );
          })}
        </View>
      )}

      {isCustomOrder && order.status !== 'cancelled' && (
        <View className={styles.customProgress}>
          <Text className={styles.customProgressIcon}>✨</Text>
          <Text className={styles.customProgressText}>{CUSTOM_PROGRESS_TEXT[order.status]}</Text>
        </View>
      )}

      {actions && <View className={styles.actionsRow} onClick={e => e.stopPropagation()}>{actions}</View>}

      <View className={styles.footer}>
        <Text className={styles.date}>{order.createDate}</Text>
        <Text className={styles.amount}>{formatPrice(order.totalAmount)}</Text>
      </View>
    </View>
  );
};

export default OrderCard;
