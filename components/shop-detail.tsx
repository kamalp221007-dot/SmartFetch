"use client"

import { useMemo, useState } from "react"
import { useStore } from "@/lib/store"
import { AppHeader } from "./app-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MapPin, Clock, CreditCard, Plus, Minus, ShoppingCart } from "lucide-react"
import { toast } from "sonner"

function isShopOpen(openTime: string, closeTime: string, workingDays: string[]): boolean {
  const now = new Date()
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const today = dayNames[now.getDay()]
  if (!workingDays.includes(today)) return false
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const [oh, om] = openTime.split(":").map(Number)
  const [ch, cm] = closeTime.split(":").map(Number)
  return currentMinutes >= oh * 60 + om && currentMinutes <= ch * 60 + cm
}

export function ShopDetail() {
  const { state, dispatch } = useStore()
  const [showAllProducts, setShowAllProducts] = useState(false)

  const shop = state.shops.find((s) => s.id === state.selectedShopId)
  const products = useMemo(
    () => state.products.filter((p) => p.shopId === state.selectedShopId && p.inStock),
    [state.products, state.selectedShopId],
  )

  if (!shop) return null

  const open = isShopOpen(shop.openTime, shop.closeTime, shop.workingDays)
  const cartShopId = state.cart.length > 0 ? state.cart[0].shopId : null
  const displayProducts = showAllProducts ? products : products.slice(0, 6)
  const cartTotal = state.cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0)
  const cartCount = state.cart.reduce((sum, c) => sum + c.quantity, 0)

  const getCartQuantity = (productId: string) => {
    const item = state.cart.find((c) => c.product.id === productId)
    return item ? item.quantity : 0
  }

  const handleAdd = (product: (typeof products)[0]) => {
    if (cartShopId && cartShopId !== shop.id) {
      if (!confirm("Adding items from a different shop will clear your current cart. Continue?")) return
    }
    dispatch({ type: "ADD_TO_CART", payload: { product, shopId: shop.id } })
    toast.success(`${product.name} added to cart`)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader title={shop.name} showBack backTo="customer-home" showCart />

      <main className="flex-1 pb-24">
        {/* Shop Info */}
        <div className="flex flex-col gap-3 px-4 py-5 bg-card border-b border-border/60">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-heading text-xl font-bold text-foreground">{shop.name}</h1>
              <p className="text-sm text-muted-foreground mt-0.5">{shop.category}</p>
            </div>
            <Badge className={`text-[10px] font-medium rounded-lg px-2 border-0 ${open ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-muted text-muted-foreground"}`}>
              {open ? "Open" : "Closed"}
            </Badge>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{shop.description}</p>

          <Separator className="bg-border/60" />

          <div className="flex flex-col gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2.5">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span>{shop.address}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <span>{shop.openTime} - {shop.closeTime}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CreditCard className="h-4 w-4 text-primary shrink-0" />
              <span>UPI Payment at Pickup</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {shop.workingDays.map((day) => (
              <span key={day} className="rounded-lg bg-muted/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {day.slice(0, 3)}
              </span>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="px-4 py-4">
          <h2 className="mb-3 font-heading text-base font-semibold text-foreground">
            Products ({products.length})
          </h2>

          {products.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No products available</p>
          ) : (
            <div className="flex flex-col gap-2">
              {displayProducts.map((product) => {
                const qty = getCartQuantity(product.id)
                return (
                  <div key={product.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3.5 shadow-sm">
                    <div className="flex-1 pr-3">
                      <h3 className="text-sm font-medium text-foreground">{product.name}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{product.description}</p>
                      <p className="mt-1.5 text-sm font-bold text-primary">Rs. {product.price}</p>
                    </div>

                    {qty === 0 ? (
                      <Button size="sm" className="h-9 bg-primary text-primary-foreground rounded-lg font-medium" onClick={() => handleAdd(product)} disabled={!open}>
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Add
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg border-border/60 text-foreground bg-card" onClick={() => dispatch({ type: "UPDATE_CART_QUANTITY", payload: { productId: product.id, quantity: qty - 1 } })}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-5 text-center text-sm font-semibold text-foreground">{qty}</span>
                        <Button size="icon" className="h-8 w-8 rounded-lg bg-primary text-primary-foreground" onClick={() => dispatch({ type: "UPDATE_CART_QUANTITY", payload: { productId: product.id, quantity: qty + 1 } })}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}

              {products.length > 6 && !showAllProducts && (
                <Button variant="ghost" className="text-primary rounded-xl font-medium" onClick={() => setShowAllProducts(true)}>
                  Show all {products.length} products
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Cart bar */}
      {cartCount > 0 && cartShopId === shop.id && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-border/60 bg-card/95 backdrop-blur-md p-4">
          <Button className="w-full h-12 bg-primary text-primary-foreground font-heading font-semibold rounded-xl shadow-sm" onClick={() => dispatch({ type: "NAVIGATE", payload: "cart" })}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            View Cart ({cartCount} items) - Rs. {cartTotal}
          </Button>
        </div>
      )}
    </div>
  )
}
