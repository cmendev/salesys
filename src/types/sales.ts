// Tipos para Productos
export interface Product {
    id: number;
    name: string;
    code: string;
    price: number;
    stock: number;
  }
  
  // Tipos para Clientes
  export interface Customer {
    id: number;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    rfc?: string;
  }
  
  // Tipos para Detalles de Venta
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
  
  // Tipos para Ventas
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
  
  // Tipos para Facturas
  export interface Invoice {
    id: number;
    sale_id: number;
    uuid: string;
    date: string;
    file_path: string;
    status: string;
  }
  
  // Tipos para el estado de la venta actual
  export interface CartItem {
    product_id: number;
    name: string;
    code: string;
    price: number;
    quantity: number;
    subtotal: number;
  }