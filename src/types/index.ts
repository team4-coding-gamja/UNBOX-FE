// Common API Types
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface SortObject {
  sorted: boolean;
  empty: boolean;
  unsorted: boolean;
}

export interface PageableObject {
  paged: boolean;
  pageNumber: number; // 0-based index
  pageSize: number;
  sort: SortObject;
  offset: number;
  unpaged: boolean;
}

export interface Page<T> {
  content: T[];
  pageable: PageableObject;
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number; // 0-based index
  sort: SortObject;
  numberOfElements: number;
  empty: boolean;
}

export interface Pageable {
  page: number; // 0-based index
  size: number;
  sort?: string[];
}

export interface Brand {
  id: string;
  name: string;
  logoUrl: string;
}

export interface ProductOption {
  id: string;
  productOptionName: string; // Corresponds to 'size' visually
  lowestPrice?: number;
}

export interface Product {
  id: string;
  name: string;
  modelNumber: string;
  imageUrl: string;
  brandId?: string;
  brandName?: string;
  category?: string;
  lowestPrice?: number;
}

export interface SellingBid {
  id: string;
  productOption: ProductOption;
  product: Product;
  price: number;
  status: 'ACTIVE' | 'SOLD' | 'CANCELLED';
  createdAt: string;
}

export interface OrderStatus {
  status: 'PENDING_SHIPMENT' | 'SHIPPED_TO_CENTER' | 'IN_INSPECTION' | 'INSPECTION_PASSED' | 'INSPECTION_FAILED' | 'SHIPPED_TO_BUYER' | 'DELIVERED' | 'CANCELLED';
  label: string;
}

export interface Order {
  id: string;
  product: Product;
  productOption: ProductOption;
  price: number;
  status: OrderStatus['status'];
  address: string;
  addressDetail: string;
  zipCode: string;
  receiverName: string;
  receiverPhone: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  reviewWritten?: boolean;
}

export interface Review {
  id: string;
  userId: string;
  userNickname: string;
  rating: number;
  content: string;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  product: Product;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  nickname: string;
  phone: string;
  adminRole: 'ROLE_MASTER' | 'ROLE_MANAGER' | 'ROLE_INSPECTOR';
  status: string;
}

export const ORDER_STATUS_MAP: Record<OrderStatus['status'], string> = {
  PENDING_SHIPMENT: '발송 대기',
  SHIPPED_TO_CENTER: '검수센터 발송',
  IN_INSPECTION: '검수 중',
  INSPECTION_PASSED: '검수 합격',
  INSPECTION_FAILED: '검수 불합격',
  SHIPPED_TO_BUYER: '구매자 발송',
  DELIVERED: '배송 완료',
  CANCELLED: '취소됨',
};

export const ADMIN_ROLE_MAP: Record<string, string> = {
  ROLE_MASTER: '마스터',
  ROLE_MANAGER: '매니저',
  ROLE_INSPECTOR: '검수자',
};
