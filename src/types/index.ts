export type MaterialType = 'sheep' | 'wolf' | 'rabbit' | 'other';
export type MaterialGrade = 'S' | 'A' | 'B' | 'C';
export type ProcessType = 'basin' | 'select' | 'assemble' | 'repair' | 'test';
export type ProductGrade = 'premium' | 'fine' | 'standard' | 'normal';
export type OrderType = 'artist' | 'babyhair' | 'normal';
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'paid' | 'cancelled';
export type CustomerType = 'artist' | 'wholesale' | 'retail' | 'other';
export type SaleType = 'wholesale' | 'retail' | 'maintenance';

export interface Material {
  id: string;
  name: string;
  type: MaterialType;
  typeName: string;
  grade: MaterialGrade;
  origin: string;
  quantity: number;
  unit: string;
  inDate: string;
  quality: string;
  color: string;
  supplier: string;
  remark?: string;
}

export interface MixingRecord {
  id: string;
  name: string;
  materials: { materialId: string; materialName: string; ratio: number; usedWeight?: number }[];
  totalWeight: number;
  purpose: string;
  operator: string;
  date: string;
  remark?: string;
  isHistorical?: boolean;
}

export interface ProcessRecord {
  id: string;
  name: string;
  type: ProcessType;
  typeName: string;
  operator: string;
  date: string;
  duration: number;
  quality: string;
  remark?: string;
  relatedMixingId?: string;
  relatedProductId?: string;
}

export interface BrushSpec {
  id: string;
  name: string;
  length: number;
  diameter: number;
  hairCount: number;
  purpose: string;
}

export interface Product {
  id: string;
  name: string;
  spec: BrushSpec;
  grade: ProductGrade;
  gradeName: string;
  materials: string[];
  processRecords: string[];
  mixingId?: string;
  createDate: string;
  quantity: number;
  price: number;
  status: 'instock' | 'sold' | 'reserved';
  remark?: string;
}

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  typeName: string;
  phone: string;
  contact: string;
  address: string;
  createDate: string;
  remark?: string;
}

export interface Order {
  id: string;
  orderNo: string;
  type: OrderType;
  typeName: string;
  customerId: string;
  customerName: string;
  products: { productId: string; productName: string; quantity: number; price: number }[];
  totalAmount: number;
  status: OrderStatus;
  statusName: string;
  createDate: string;
  processDate?: string;
  completeDate?: string;
  paidDate?: string;
  requireDate?: string;
  remark?: string;
  babyInfo?: {
    babyName: string;
    birthday: string;
    hairDate: string;
    blessing: string;
  };
  artistInfo?: {
    artistName: string;
    calligraphyStyle: string;
    requirement: string;
  };
}

export interface SaleRecord {
  id: string;
  orderNo: string;
  type: SaleType;
  typeName: string;
  customerId?: string;
  customerName?: string;
  productId?: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  date: string;
  operator: string;
  remark?: string;
  relatedOrderId?: string;
}

export interface MaintenanceRecord {
  id: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  serviceType: string;
  cost: number;
  date: string;
  remark?: string;
}
