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
  email: string;
  // roleId references a Role document in the roles/{roleId} Firestore collection.
  // NOTE: Existing admins/{uid} docs still have the old role:"owner"|"staff" field.
  // After deploying this change, update each admin's Firestore doc manually via
  // Firebase Console to add roleId pointing to the appropriate seeded role ID.
  roleId: string;
}

// ── RBAC ─────────────────────────────────────────────────────────────────────

export type Permission =
  | "products:view"   | "products:manage"
  | "orders:view"     | "orders:manage"
  | "categories:view" | "categories:manage"
  | "customers:view"
  | "content:view"    | "content:manage"
  | "reports:view"
  | "users:manage"; // manage admin accounts and roles (Super Admin only)

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
}

// ── Notifications ─────────────────────────────────────────────────────────────

export type NotificationType =
  | "new_order"       // customer placed a new order
  | "order_confirmed" // order status changed to Confirmed
  | "order_cancelled" // order status changed to Cancelled
  | "order_status"    // any other order status change
  | "low_stock"       // product stock <= lowStockThreshold
  | "out_of_stock";   // product totalStock reached 0

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
  // Optional links for quick navigation
  linkType?: "order" | "product";
  linkId?: string;   // orderId or productId
}
