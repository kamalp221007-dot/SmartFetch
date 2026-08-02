"use client"

import React, { createContext, useContext, useReducer, type ReactNode } from "react"
import type {
  AppState,
  User,
  Shop,
  Product,
  CartItem,
  Order,
  OrderStatus,
  UserRole,
  OrderItem,
} from "./types"
import { STATUS_COLORS } from "./types"
import { DEMO_USERS, DEMO_SHOPS, DEMO_PRODUCTS, DEMO_ORDERS } from "./demo-data"

function generateId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function generatePickupCode() {
  return Math.floor(1000 + Math.random() * 9000).toString()
}

function generateOrderId() {
  const d = new Date()
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`
  const seq = Math.floor(100 + Math.random() * 900)
  return `ORD-${date}-${seq}`
}

function generateQrData(orderId: string, shopId: string, status: OrderStatus, colorHex: string) {
  return `SF-${orderId}-${shopId}-${status}-${colorHex.replace("#", "")}`
}

const initialState: AppState = {
  isDemo: false,
  user: null,
  role: null,
  shops: [],
  products: [],
  cart: [],
  orders: [],
  users: [],
  currentView: "landing",
  selectedShopId: null,
  userLocation: null,
  searchQuery: "",
  filterCategory: "",
  filterOpenNow: false,
  filterDistance: 10,
  ownerSetupStep: 1,
  currentEditShopId: null,
}

type Action =
  | { type: "SET_DEMO_MODE" }
  | { type: "SET_USER"; payload: { user: User; role: UserRole } }
  | { type: "LOGOUT" }
  | { type: "NAVIGATE"; payload: string }
  | { type: "SET_LOCATION"; payload: { lat: number; lng: number } | null }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_FILTER_CATEGORY"; payload: string }
  | { type: "SET_FILTER_OPEN_NOW"; payload: boolean }
  | { type: "SET_FILTER_DISTANCE"; payload: number }
  | { type: "SELECT_SHOP"; payload: string | null }
  | { type: "ADD_SHOP"; payload: Shop }
  | { type: "UPDATE_SHOP"; payload: Shop }
  | { type: "DELETE_SHOP"; payload: string }
  | { type: "ADD_PRODUCT"; payload: Product }
  | { type: "UPDATE_PRODUCT"; payload: Product }
  | { type: "DELETE_PRODUCT"; payload: string }
  | { type: "ADD_TO_CART"; payload: { product: Product; shopId: string } }
  | { type: "UPDATE_CART_QUANTITY"; payload: { productId: string; quantity: number } }
  | { type: "REMOVE_FROM_CART"; payload: string }
  | { type: "CLEAR_CART" }
  | { type: "PLACE_ORDER"; payload: { pickupInstructions?: string } }
  | { type: "UPDATE_ORDER_STATUS"; payload: { orderId: string; status: OrderStatus } }
  | { type: "SET_OWNER_SETUP_STEP"; payload: number }
  | { type: "SET_EDIT_SHOP"; payload: string | null }
  | { type: "ADD_USER"; payload: User }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_DEMO_MODE":
      return {
        ...state,
        isDemo: true,
        users: DEMO_USERS,
        shops: DEMO_SHOPS,
        products: DEMO_PRODUCTS,
        orders: DEMO_ORDERS,
        currentView: "landing",
      }

    case "SET_USER":
      return {
        ...state,
        user: action.payload.user,
        role: action.payload.role,
        currentView:
          action.payload.role === "customer"
            ? "customer-home"
            : state.shops.some(
                  (s) => s.ownerId === action.payload.user.id && s.isSetupComplete,
                )
              ? "owner-dashboard"
              : "owner-setup",
      }

    case "LOGOUT":
      if (state.isDemo) {
        return { ...initialState }
      }
      return {
        ...initialState,
        shops: state.shops,
        products: state.products,
        users: state.users,
      }

    case "NAVIGATE":
      return { ...state, currentView: action.payload }

    case "SET_LOCATION":
      return { ...state, userLocation: action.payload }

    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload }

    case "SET_FILTER_CATEGORY":
      return { ...state, filterCategory: action.payload }

    case "SET_FILTER_OPEN_NOW":
      return { ...state, filterOpenNow: action.payload }

    case "SET_FILTER_DISTANCE":
      return { ...state, filterDistance: action.payload }

    case "SELECT_SHOP":
      return {
        ...state,
        selectedShopId: action.payload,
        currentView: action.payload
          ? state.role === "customer"
            ? "shop-detail"
            : "owner-shop-detail"
          : state.currentView,
      }

    case "ADD_SHOP":
      return { ...state, shops: [...state.shops, action.payload] }

    case "UPDATE_SHOP":
      return {
        ...state,
        shops: state.shops.map((s) => (s.id === action.payload.id ? action.payload : s)),
      }

    case "DELETE_SHOP":
      return {
        ...state,
        shops: state.shops.filter((s) => s.id !== action.payload),
        products: state.products.filter((p) => p.shopId !== action.payload),
      }

    case "ADD_PRODUCT":
      return { ...state, products: [...state.products, action.payload] }

    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.payload.id ? action.payload : p)),
      }

    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((p) => p.id !== action.payload),
      }

    case "ADD_TO_CART": {
      const existing = state.cart.find((c) => c.product.id === action.payload.product.id)
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((c) =>
            c.product.id === action.payload.product.id ? { ...c, quantity: c.quantity + 1 } : c,
          ),
        }
      }
      // Check if cart has items from different shop
      if (state.cart.length > 0 && state.cart[0].shopId !== action.payload.shopId) {
        return {
          ...state,
          cart: [{ product: action.payload.product, quantity: 1, shopId: action.payload.shopId }],
        }
      }
      return {
        ...state,
        cart: [...state.cart, { product: action.payload.product, quantity: 1, shopId: action.payload.shopId }],
      }
    }

    case "UPDATE_CART_QUANTITY":
      if (action.payload.quantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter((c) => c.product.id !== action.payload.productId),
        }
      }
      return {
        ...state,
        cart: state.cart.map((c) =>
          c.product.id === action.payload.productId ? { ...c, quantity: action.payload.quantity } : c,
        ),
      }

    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((c) => c.product.id !== action.payload),
      }

    case "CLEAR_CART":
      return { ...state, cart: [] }

    case "PLACE_ORDER": {
      if (state.cart.length === 0 || !state.user) return state
      const shop = state.shops.find((s) => s.id === state.cart[0].shopId)
      if (!shop) return state

      const orderId = generateOrderId()
      const status: OrderStatus = "placed"
      const colorInfo = STATUS_COLORS[status]
      const pickupCode = generatePickupCode()

      const items: OrderItem[] = state.cart.map((c) => ({
        productId: c.product.id,
        productName: c.product.name,
        price: c.product.price,
        quantity: c.quantity,
      }))

      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

      const order: Order = {
        id: orderId,
        customerId: state.user.id,
        shopId: shop.id,
        shopName: shop.name,
        items,
        total,
        status,
        pickupCode,
        colorCode: colorInfo.hex,
        colorLabel: colorInfo.label,
        qrData: generateQrData(orderId, shop.id, status, colorInfo.hex),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        pickupInstructions: action.payload.pickupInstructions,
        customerName: action.payload.customerName,
        pickupTime: action.payload.pickupTime,
      }

      return {
        ...state,
        orders: [...state.orders, order],
        cart: [],
        currentView: "order-receipt",
        selectedShopId: order.id,
      }
    }

    case "UPDATE_ORDER_STATUS": {
      const colorInfo = STATUS_COLORS[action.payload.status]
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.id === action.payload.orderId
            ? {
                ...o,
                status: action.payload.status,
                colorCode: colorInfo.hex,
                colorLabel: colorInfo.label,
                qrData: generateQrData(action.payload.orderId, o.shopId, action.payload.status, colorInfo.hex),
                updatedAt: new Date().toISOString(),
              }
            : o,
        ),
      }
    }

    case "SET_OWNER_SETUP_STEP":
      return { ...state, ownerSetupStep: action.payload }

    case "SET_EDIT_SHOP":
      return { ...state, currentEditShopId: action.payload }

    case "ADD_USER":
      return { ...state, users: [...state.users, action.payload] }

    default:
      return state
  }
}

interface StoreContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
  generateId: typeof generateId
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <StoreContext.Provider value={{ state, dispatch, generateId }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
