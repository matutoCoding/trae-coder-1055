import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useApp } from '../../store/AppContext';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import EmptyState from '../../components/EmptyState';
import classnames from 'classnames';
import styles from './index.module.scss';

const CustomerPage: React.FC = () => {
  const { customers } = useApp();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filters = [
    { key: 'all', label: '全部' },
    { key: 'artist', label: '书画家' },
    { key: 'wholesale', label: '批发商' },
    { key: 'retail', label: '零售客户' },
  ];

  const filteredCustomers = useMemo(() => {
    if (activeFilter === 'all') return customers;
    return customers.filter(c => c.type === activeFilter);
  }, [customers, activeFilter]);

  const stats = useMemo(() => {
    const total = customers.length;
    const artistCount = customers.filter(c => c.type === 'artist').length;
    const wholesaleCount = customers.filter(c => c.type === 'wholesale').length;
    const retailCount = customers.filter(c => c.type === 'retail').length;
    return { total, artistCount, wholesaleCount, retailCount };
  }, [customers]);

  const getTypeClass = (type: string) => {
    const classMap: Record<string, string> = {
      artist: styles.typeArtist,
      wholesale: styles.typeWholesale,
      retail: styles.typeRetail,
      other: styles.typeOther,
    };
    return classMap[type] || styles.typeOther;
  };

  const handleCustomerClick = (customer: any) => {
    Taro.showToast({ title: `查看${customer.name}`, icon: 'none' });
    console.log('[Customer] 点击客户:', customer.name, customer.id);
  };

  const handleCallPhone = (phone: string) => {
    Taro.showToast({ title: `拨打 ${phone}`, icon: 'none' });
    console.log('[Customer] 点击拨打电话:', phone);
  };

  const handleAddCustomer = () => {
    Taro.showToast({ title: '新增客户', icon: 'none' });
    console.log('[Customer] 点击新增客户');
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  return (
    <View className={styles.container}>
      <PageHeader title="客户管理" subtitle="客户至上，以诚相待" showBack onBack={handleBack} />

      <View className={styles.statsRow}>
        <StatCard title="客户总数" value={stats.total} unit="位" color="primary" />
        <StatCard title="书画家" value={stats.artistCount} unit="位" color="warning" />
        <StatCard title="批发商" value={stats.wholesaleCount} unit="位" color="success" />
      </View>

      <View className={styles.actionRow}>
        <Button className={styles.actionBtn} onClick={handleAddCustomer}>
          <Text className={styles.actionBtnText}>➕ 新增客户</Text>
        </Button>
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
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map(customer => (
            <View key={customer.id} className={styles.customerCard} onClick={() => handleCustomerClick(customer)}>
              <View className={styles.cardHeader}>
                <View className={styles.customerInfo}>
                  <Text className={styles.customerName}>{customer.name}</Text>
                </View>
                <View className={classnames(styles.typeTag, getTypeClass(customer.type))}>
                  <Text className={styles.typeText}>{customer.typeName}</Text>
                </View>
              </View>

              <View className={styles.contactRow}>
                <Text className={styles.contactLabel}>联系人：</Text>
                <Text className={styles.contactValue}>{customer.contact}</Text>
                <Button
                  className={styles.phoneBtn}
                  onClick={(e) => { e.stopPropagation(); handleCallPhone(customer.phone); }}
                >
                  <Text className={styles.phoneBtnText}>📞 联系</Text>
                </Button>
              </View>

              <View className={styles.contactRow}>
                <Text className={styles.contactLabel}>电话：</Text>
                <Text className={styles.contactValue}>{customer.phone}</Text>
              </View>

              <View className={styles.addressRow}>
                <Text className={styles.addressLabel}>地址：</Text>
                <Text className={styles.addressValue}>{customer.address}</Text>
              </View>

              <View className={styles.cardFooter}>
                {customer.remark && <Text className={styles.remark}>💡 {customer.remark}</Text>}
                <Text className={styles.createDate}>{customer.createDate}</Text>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            icon="👥"
            title="暂无客户数据"
            description="点击上方按钮添加新客户"
            buttonText="新增客户"
            onButtonClick={handleAddCustomer}
          />
        )}
      </ScrollView>
    </View>
  );
};

export default CustomerPage;
