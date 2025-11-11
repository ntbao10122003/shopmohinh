export interface OrderItem {
  product: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Customer {
  fullName: string;
  phone: string;
  address: string;
  email?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';

export interface Order {
  _id: string;
  orderCode: string;
  status: OrderStatus;
  total: number;
  paymentMethod: 'cod' | 'banking';
  customer: Customer;
  items: OrderItem[];
  createdAt: string;
  updatedAt?: string;
  note?: string;
}