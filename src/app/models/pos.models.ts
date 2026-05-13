export interface Category {
  id: number;
  name: string;
  description?: string;
  color?: string;
  icon: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description?: string;
  category_id?: number;
  image?: string;
  stock: number;
}

export interface InvoiceItem {
  product_id: number;
  name: string;
  qty: number;
  price: number;
  subtotal: number;
  vat: number;
}

export interface Invoice {
  uuid: string;
  id?: number;
  items: InvoiceItem[];
  subtotal: number;
  vat: number;
  payable: number;
  paid: number;
  change: number;
  payment_method: string;
  created_at: number;
  status: 'open' | 'completed' | 'cancelled';
  info_name: string;
  info_address: string;
  info_phone: string;
  info_email: string;
  customer_id?: number; 
}