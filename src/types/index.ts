export type Role = 'CUSTOMER' | 'RETAILER' | 'DELIVERY_PARTNER' | 'ADMIN' | 'SUPER_ADMIN';

export type OrderStatus =
  | 'PLACED' | 'ACCEPTED' | 'REJECTED' | 'PREPARING'
  | 'READY_FOR_PICKUP' | 'ASSIGNED' | 'PICKED_UP'
  | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  mobile: string;
  email?: string;
  role: Role;
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING';
  avatarUrl?: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Retailer {
  _id: string;
  ownerId: string;
  shopName: string;
  phone: string;
  address?: any;
  location?: { type: 'Point'; coordinates: [number, number] };
  categories?: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  isOpen?: boolean;
  createdAt?: string;
}

export interface DeliveryPartner {
  _id: string;
  userId: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  vehicleModel?: string;
  licenseNumber: string;
  availability: 'ONLINE' | 'OFFLINE' | 'BUSY' | 'BREAK';
  latitude?: number;
  longitude?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  userId: string;
  retailerId?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: 'COD' | 'ONLINE';
  paymentStatus?: 'PENDING' | 'COMPLETED';
  address?: any;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  isFeatured?: boolean;
  sortOrder?: number;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'PERCENT' | 'FLAT';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  expiresAt: string;
  isActive: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: { pagination?: PaginationMeta; timestamp?: string };
}
