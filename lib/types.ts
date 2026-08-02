export type UserRole = "customer" | "owner"

export interface User {
  id: string
  phone: string
  role: UserRole
  name: string
  createdAt: string
}

export interface Shop {
  id: string
  ownerId: string
  name: string
  category: string
  description: string
  lat: number
  lng: number
  address: string
  upiId?: string
  qrCodeUrl?: string
  openTime: string
  closeTime: string
  workingDays: string[]
  isTemporarilyClosed: boolean
  isSetupComplete: boolean
  createdAt: string
}

export interface Product {
  id: string
  shopId: string
  name: string
  description: string
  price: number
  category: string
  image?: string
  inStock: boolean
  createdAt: string
}

export interface CartItem {
  product: Product
  quantity: number
  shopId: string
}

export type OrderStatus = "placed" | "accepted" | "ready" | "completed" | "cancelled"

export interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
}

export interface Order {
  id: string
  customerId: string
  shopId: string
  shopName: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  pickupCode: string
  colorCode: string
  colorLabel: string
  qrData: string
  createdAt: string
  updatedAt: string
  pickupInstructions?: string
  customerName: string
  pickupTime: string
}

export interface AppState {
  isDemo: boolean
  user: User | null
  role: UserRole | null
  shops: Shop[]
  products: Product[]
  cart: CartItem[]
  orders: Order[]
  users: User[]
  currentView: string
  selectedShopId: string | null
  userLocation: { lat: number; lng: number } | null
  searchQuery: string
  filterCategory: string
  filterOpenNow: boolean
  filterDistance: number
  ownerSetupStep: number
  currentEditShopId: string | null
}

export const SHOP_CATEGORIES = [
  "Grocery",
  "Restaurant",
  "Bakery",
  "Pharmacy",
  "Electronics",
  "Clothing",
  "Stationery",
  "Hardware",
  "Pet Supplies",
  "Flowers",
  "Other",
]

export const PRODUCT_CATEGORIES = [
  "Food & Beverages",
  "Snacks",
  "Fresh Produce",
  "Dairy",
  "Bakery",
  "Meat & Seafood",
  "Personal Care",
  "Household",
  "Electronics",
  "Clothing",
  "Other",
]

export const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  placed: "Order Placed",
  accepted: "Accepted",
  ready: "Ready for Pickup",
  completed: "Completed",
  cancelled: "Cancelled",
}

export const STATUS_COLORS: Record<OrderStatus, { hex: string; label: string }> = {
  placed: { hex: "#3B82F6", label: "Blue" },
  accepted: { hex: "#F59E0B", label: "Amber" },
  ready: { hex: "#10B981", label: "Green" },
  completed: { hex: "#6366F1", label: "Indigo" },
  cancelled: { hex: "#EF4444", label: "Red" },
}
