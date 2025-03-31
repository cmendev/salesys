export interface Product {
  id: number;
  name: string;
  code: string;
  price: number;
  stock: number;
}

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  rfc?: string;
}

export interface SaleDetail {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  discount: number;
  tax_amount: number;
}

export interface SaleDetailWithProduct extends SaleDetail {
  product_name: string;
  product_code: string;
}

export interface Sale {
  id: number;
  date: string;
  customer_id?: number;
  subtotal: number;
  taxes: number;
  total: number;
  payment_method: string;
  status: string;
}

export type PaymentMethod = 'cash' | 'credit' | 'debit' | 'transfer';
export type SaleStatus = 'completed' | 'canceled' | 'refunded';

export interface CartItem {
  product_id: number;
  name: string;
  code: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface SaleData {
  customer_id?: number;
  payment_method: PaymentMethod | '';
  notes: string;
}