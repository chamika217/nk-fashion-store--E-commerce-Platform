export interface ProductVariant {
  size: string;
  color: string;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  subcategory: string;
  description: string;
  price: number;
  images: string[];
  variants: ProductVariant[];
  totalStock: number;
  lowStockThreshold: number;
  material: string;
  weight: number;
  status: "active" | "out-of-stock" | "hidden";
  createdAt: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  size: string;
  color: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    city: string;
  };
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: "COD";
  isPaid: boolean;
  status:
    | "Pending"
    | "Confirmed"
    | "Processing"
    | "Dispatched"
    | "Delivered"
    | "Cancelled";
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: string[];
  order: number;
}

export interface AdminUser {
  uid: string;
  name: string;
  role: "owner" | "staff";
  email: string;
}