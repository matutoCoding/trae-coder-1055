import React, { ReactNode } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import styles from './index.module.scss';
import classnames from 'classnames';

interface ModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  children: ReactNode;
  showFooter?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  title,
  onClose,
  onConfirm,
  confirmText = '确认',
  cancelText = '取消',
  children,
  showFooter = true,
}) => {
  if (!visible) return null;

  return (
    <View className={styles.mask} onClick={onClose}>
      <View className={styles.container} onClick={(e) => e.stopPropagation()}>
        <View className={styles.header}>
          <Text className={styles.title}>{title}</Text>
          <View className={styles.closeBtn} onClick={onClose}>
            <Text>✕</Text>
          </View>
        </View>

        <ScrollView scrollY className={styles.body}>
          {children}
        </ScrollView>

        {showFooter && (
          <View className={styles.footer}>
            <View className={styles.btnCancel} onClick={onClose}>
              <Text>{cancelText}</Text>
            </View>
            <View className={styles.btnConfirm} onClick={onConfirm}>
              <Text>{confirmText}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default Modal;
