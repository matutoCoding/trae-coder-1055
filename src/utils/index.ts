export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${formatDate(d)} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

export const formatPrice = (price: number): string => {
  return `¥${price.toFixed(2)}`;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    pending: '#CD853F',
    processing: '#4682B4',
    completed: '#2E8B57',
    cancelled: '#CD5C5C',
    instock: '#2E8B57',
    sold: '#8B4513',
    reserved: '#DAA520',
  };
  return colorMap[status] || '#7a7a7a';
};

export const getTypeNames: Record<string, string> = {
  sheep: '羊毫',
  wolf: '狼毫',
  rabbit: '紫毫',
  other: '其他',
  basin: '水盆工序',
  select: '择笔工序',
  assemble: '装笔工序',
  repair: '修笔工序',
  test: '试笔检验',
  premium: '极品',
  fine: '精品',
  standard: '优品',
  normal: '普通',
  artist: '书画家定制',
  babyhair: '胎毛笔定制',
  normal_order: '普通订单',
  wholesale: '批发',
  retail: '零售',
  maintenance: '修笔养护',
};
