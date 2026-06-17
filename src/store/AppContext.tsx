import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Material, MixingRecord, ProcessRecord, Product, Order, Customer, SaleRecord } from '../types';
import { materials as mockMaterials } from '../data/materials';
import { mixings as mockMixings } from '../data/mixings';
import { processes as mockProcesses } from '../data/processes';
import { products as mockProducts } from '../data/products';
import { orders as mockOrders } from '../data/orders';
import { customers as mockCustomers } from '../data/customers';
import { sales as mockSales } from '../data/sales';

interface AppContextType {
  materials: Material[];
  mixings: MixingRecord[];
  processes: ProcessRecord[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
  sales: SaleRecord[];
  setMaterials: React.Dispatch<React.SetStateAction<Material[]>>;
  setMixings: React.Dispatch<React.SetStateAction<MixingRecord[]>>;
  setProcesses: React.Dispatch<React.SetStateAction<ProcessRecord[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  setSales: React.Dispatch<React.SetStateAction<SaleRecord[]>>;
  addMaterial: (material: Material) => void;
  addMixing: (mixing: MixingRecord) => void;
  addProcess: (process: ProcessRecord) => void;
  addProduct: (product: Product) => void;
  addOrder: (order: Order) => void;
  addCustomer: (customer: Customer) => void;
  addSale: (sale: SaleRecord) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [mixings, setMixings] = useState<MixingRecord[]>(mockMixings);
  const [processes, setProcesses] = useState<ProcessRecord[]>(mockProcesses);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [sales, setSales] = useState<SaleRecord[]>(mockSales);

  const addMaterial = (material: Material) => {
    setMaterials(prev => [material, ...prev]);
  };

  const addMixing = (mixing: MixingRecord) => {
    setMixings(prev => [mixing, ...prev]);
  };

  const addProcess = (process: ProcessRecord) => {
    setProcesses(prev => [process, ...prev]);
  };

  const addProduct = (product: Product) => {
    setProducts(prev => [product, ...prev]);
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);
  };

  const addCustomer = (customer: Customer) => {
    setCustomers(prev => [customer, ...prev]);
  };

  const addSale = (sale: SaleRecord) => {
    setSales(prev => [sale, ...prev]);
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
        setMaterials,
        setMixings,
        setProcesses,
        setProducts,
        setOrders,
        setCustomers,
        setSales,
        addMaterial,
        addMixing,
        addProcess,
        addProduct,
        addOrder,
        addCustomer,
        addSale,
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
