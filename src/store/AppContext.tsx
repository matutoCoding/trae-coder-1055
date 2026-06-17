import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import { Material, MixingRecord, ProcessRecord, Product, Order, Customer, SaleRecord } from '../types';
import { materials as mockMaterials } from '../data/materials';
import { mixings as mockMixings } from '../data/mixings';
import { processes as mockProcesses } from '../data/processes';
import { products as mockProducts } from '../data/products';
import { orders as mockOrders } from '../data/orders';
import { customers as mockCustomers } from '../data/customers';
import { sales as mockSales } from '../data/sales';
import { generateId, formatDate, getTypeNames } from '../utils';

const STORAGE_KEY = 'brush_workshop_data_v1';

interface StoredData {
  materials: Material[];
  mixings: MixingRecord[];
  processes: ProcessRecord[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
  sales: SaleRecord[];
}

const loadFromStorage = (): StoredData | null => {
  try {
    const data = Taro.getStorageSync(STORAGE_KEY);
    if (data) {
      return typeof data === 'string' ? JSON.parse(data) : data;
    }
    return null;
  } catch (e) {
    console.warn('[Storage] 读取本地存储失败:', e);
    return null;
  }
};

const saveToStorage = (data: StoredData) => {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[Storage] 写入本地存储失败:', e);
  }
};

interface AppContextType {
  materials: Material[];
  mixings: MixingRecord[];
  processes: ProcessRecord[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
  sales: SaleRecord[];

  addMaterial: (material: Material) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;

  addMixing: (mixing: MixingRecord) => { success: boolean; message?: string };
  addMixingWithStock: (mixing: MixingRecord) => { success: boolean; message?: string };
  duplicateMixing: (id: string) => MixingRecord | null;

  addProcess: (process: ProcessRecord) => void;

  addProduct: (product: Product) => { success: boolean; message?: string };
  addProductWithRelations: (product: Product, mixingId?: string, processIds?: string[]) => { success: boolean; message?: string };
  updateProductStock: (id: string, delta: number) => { success: boolean; message?: string };

  addOrder: (order: Order) => void;
  updateOrderStatus: (id: string, status: Order['status']) => { success: boolean; message?: string };
  completeOrderAndCreateSale: (orderId: string) => { success: boolean; sale?: SaleRecord; message?: string };

  addCustomer: (customer: Customer) => void;

  addSale: (sale: SaleRecord) => { success: boolean; message?: string };
  addSaleWithStock: (sale: SaleRecord) => { success: boolean; message?: string };

  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const stored = loadFromStorage();

  const [materials, setMaterials] = useState<Material[]>(stored?.materials ?? mockMaterials);
  const [mixings, setMixings] = useState<MixingRecord[]>(stored?.mixings ?? mockMixings);
  const [processes, setProcesses] = useState<ProcessRecord[]>(stored?.processes ?? mockProcesses);
  const [products, setProducts] = useState<Product[]>(stored?.products ?? mockProducts);
  const [orders, setOrders] = useState<Order[]>(stored?.orders ?? mockOrders);
  const [customers, setCustomers] = useState<Customer[]>(stored?.customers ?? mockCustomers);
  const [sales, setSales] = useState<SaleRecord[]>(stored?.sales ?? mockSales);

  useEffect(() => {
    saveToStorage({ materials, mixings, processes, products, orders, customers, sales });
  }, [materials, mixings, processes, products, orders, customers, sales]);

  const addMaterial = (material: Material) => {
    setMaterials(prev => [material, ...prev]);
  };

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials(prev => prev.map(m => (m.id === id ? { ...m, ...updates } : m)));
  };

  const addMixing = (mixing: MixingRecord) => {
    setMixings(prev => [mixing, ...prev]);
    return { success: true };
  };

  const addMixingWithStock = (mixing: MixingRecord) => {
    for (const m of mixing.materials) {
      const mat = materials.find(x => x.id === m.materialId);
      const used = (mixing.totalWeight * m.ratio) / 100;
      if (!mat || mat.quantity < used) {
        return { success: false, message: `原料【${m.materialName}】库存不足，需要 ${used.toFixed(1)}克，仅剩 ${mat?.quantity ?? 0}克` };
      }
    }

    const materialsWithWeight = mixing.materials.map(m => ({
      ...m,
      usedWeight: (mixing.totalWeight * m.ratio) / 100,
    }));

    setMaterials(prev =>
      prev.map(mat => {
        const used = materialsWithWeight.find(x => x.materialId === mat.id);
        if (used) {
          return { ...mat, quantity: Math.max(0, mat.quantity - (used.usedWeight || 0)) };
        }
        return mat;
      })
    );

    setMixings(prev => [{ ...mixing, materials: materialsWithWeight }, ...prev]);
    return { success: true };
  };

  const duplicateMixing = (id: string): MixingRecord | null => {
    const original = mixings.find(m => m.id === id);
    if (!original) return null;
    const newMixing: MixingRecord = {
      ...original,
      id: generateId(),
      name: `${original.name}（副本）`,
      date: formatDate(new Date()),
      isHistorical: false,
    };
    return newMixing;
  };

  const addProcess = (process: ProcessRecord) => {
    setProcesses(prev => [process, ...prev]);
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
    return { success: true };
  };

  const addProductWithRelations = (product: Product, mixingId?: string, processIds?: string[]) => {
    const newProduct: Product = {
      ...product,
      mixingId,
      processRecords: processIds || product.processRecords || [],
    };
    setProducts(prev => [newProduct, ...prev]);

    if (processIds && processIds.length > 0) {
      setProcesses(prev =>
        prev.map(p =>
          processIds.includes(p.id) ? { ...p, relatedProductId: newProduct.id } : p
        )
      );
    }
    return { success: true };
  };

  const updateProductStock = (id: string, delta: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return { success: false, message: '产品不存在' };
    if (product.quantity + delta < 0) {
      return { success: false, message: `【${product.name}】库存不足，当前库存 ${product.quantity}，需要 ${-delta}` };
    }
    setProducts(prev =>
      prev.map(p => {
        if (p.id !== id) return p;
        const newQty = p.quantity + delta;
        return {
          ...p,
          quantity: newQty,
          status: newQty <= 0 ? 'sold' : p.status === 'sold' ? 'instock' : p.status,
        };
      })
    );
    return { success: true };
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  const updateOrderStatus = (id: string, status: Order['status']) => {
    const statusMap: Record<Order['status'], string> = {
      pending: '待处理',
      processing: '制作中',
      completed: '已完成',
      paid: '已收款',
      cancelled: '已取消',
    };
    const now = formatDate(new Date());
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== id) return o;
        const updates: Partial<Order> = { status, statusName: statusMap[status] };
        if (status === 'processing') updates.processDate = now;
        if (status === 'completed') updates.completeDate = now;
        if (status === 'paid') updates.paidDate = now;
        return { ...o, ...updates };
      })
    );
    return { success: true };
  };

  const completeOrderAndCreateSale = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: '订单不存在' };
    if (order.status === 'completed' || order.status === 'paid') {
      for (const item of order.products) {
        const stockResult = updateProductStock(item.productId, -item.quantity);
        if (!stockResult.success) {
          return { success: false, message: stockResult.message };
        }
      }
    }

    const statusResult = updateOrderStatus(orderId, 'completed');
    if (!statusResult.success) return statusResult;

    let lastSale: SaleRecord | undefined;

    order.products.forEach((item, idx) => {
      const sale: SaleRecord = {
        id: generateId(),
        orderNo: `XS${Date.now().toString().slice(-8)}${idx}`,
        type: order.type === 'artist' || order.type === 'babyhair' ? 'retail' : 'retail',
        typeName: getTypeNames[order.type === 'artist' || order.type === 'babyhair' ? 'retail' : 'retail'] || '零售',
        customerId: order.customerId,
        customerName: order.customerName,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.price,
        totalAmount: item.quantity * item.price,
        date: formatDate(new Date()),
        operator: '系统生成',
        remark: `由订单【${order.orderNo}】自动生成`,
        relatedOrderId: order.id,
      };
      setSales(prev => [sale, ...prev]);
      if (!lastSale) lastSale = sale;
    });

    return { success: true, sale: lastSale };
  };

  const addCustomer = (customer: Customer) => {
    setCustomers(prev => [customer, ...prev]);
  };

  const addSale = (sale: SaleRecord) => {
    setSales(prev => [sale, ...prev]);
    return { success: true };
  };

  const addSaleWithStock = (sale: SaleRecord) => {
    if (sale.productId && sale.type !== 'maintenance') {
      const stockResult = updateProductStock(sale.productId, -sale.quantity);
      if (!stockResult.success) return stockResult;
    }
    setSales(prev => [sale, ...prev]);
    return { success: true };
  };

  const resetAllData = () => {
    setMaterials(mockMaterials);
    setMixings(mockMixings);
    setProcesses(mockProcesses);
    setProducts(mockProducts);
    setOrders(mockOrders);
    setCustomers(mockCustomers);
    setSales(mockSales);
    try {
      Taro.removeStorageSync(STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        materials,
        mixings,
        processes,
        products,
        orders,
        customers,
        sales,
        addMaterial,
        updateMaterial,
        addMixing,
        addMixingWithStock,
        duplicateMixing,
        addProcess,
        addProduct,
        addProductWithRelations,
        updateProductStock,
        addOrder,
        updateOrderStatus,
        completeOrderAndCreateSale,
        addCustomer,
        addSale,
        addSaleWithStock,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
