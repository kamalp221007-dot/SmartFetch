"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { AppHeader } from "./app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { toast } from "sonner"

export function CartPage() {
  const { state, dispatch } = useStore()
  const [pickupInstructions, setPickupInstructions] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [pickupTime, setPickupTime] = useState("")

  const shop = state.cart.length > 0 ? state.shops.find((s) => s.id === state.cart[0].shopId) : null
  const total = state.cart.reduce((sum, c) => c.product.price * c.quantity, 0)

  const handlePlaceOrder = () => {
    if (state.cart.length === 0) return
    if (!customerName.trim()) { toast.error("Please enter your full name"); return }
    if (!pickupTime) { toast.error("Please select a pickup time"); return }
    dispatch({
      type: "PLACE_ORDER",
      payload: { pickupInstructions: pickupInstructions || undefined, customerName: customerName.trim(), pickupTime },
    })
    toast.success("Order placed successfully!")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader title="Your Cart" showBack backTo={state.selectedShopId ? "shop-detail" : "customer-home"} />

      <main className="flex-1 pb-32">
        {state.cart.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50 mb-5">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <p className="font-heading text-lg font-semibold text-foreground">Your cart is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">Browse shops and add items to get started</p>
            <Button className="mt-6 bg-primary text-primary-foreground rounded-xl font-medium" onClick={() => dispatch({ type: "NAVIGATE", payload: "customer-home" })}>
              Browse Shops
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4 px-4 py-4">
            {/* Shop info */}
            {shop && (
              <div className="rounded-xl border border-border/60 bg-card p-3.5 shadow-sm">
                <p className="text-xs text-muted-foreground font-medium">Ordering from</p>
                <p className="font-heading font-semibold text-foreground mt-0.5">{shop.name}</p>
                <p className="text-xs text-muted-foreground">{shop.address}</p>
              </div>
            )}

            {/* Customer name and pickup time */}
            <div className="rounded-xl border border-border/60 bg-card p-4 flex flex-col gap-3.5 shadow-sm">
              <div className="flex flex-col gap-2">
                <Label htmlFor="customer-name" className="text-sm font-medium text-foreground">Your Full Name</Label>
                <Input id="customer-name" placeholder="Enter your full name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="bg-muted/30 text-foreground border-border/60 h-11 rounded-xl" required />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="pickup-time" className="text-sm font-medium text-foreground">Preferred Pickup Time</Label>
                <select id="pickup-time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-foreground text-sm h-11" required>
                  <option value="">Select a time</option>
                  <option value="ASAP">ASAP (15-20 minutes)</option>
                  <option value="30 mins">In 30 minutes</option>
                  <option value="1 hour">In 1 hour</option>
                  <option value="1.5 hours">In 1.5 hours</option>
                  <option value="2 hours">In 2 hours</option>
                  <option value="3 hours">In 3 hours</option>
                </select>
              </div>
            </div>

            {/* Cart items */}
            <div className="flex flex-col gap-2">
              {state.cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 shadow-sm">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{item.product.name}</p>
                    <p className="text-xs text-muted-foreground">Rs. {item.product.price} x {item.quantity}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg border-border/60 text-foreground bg-card" onClick={() => dispatch({ type: "UPDATE_CART_QUANTITY", payload: { productId: item.product.id, quantity: item.quantity - 1 } })}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-5 text-center text-sm font-semibold text-foreground">{item.quantity}</span>
                    <Button size="icon" className="h-8 w-8 rounded-lg bg-primary text-primary-foreground" onClick={() => dispatch({ type: "UPDATE_CART_QUANTITY", payload: { productId: item.product.id, quantity: item.quantity + 1 } })}>
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  <p className="w-16 text-right text-sm font-bold text-foreground">Rs. {item.product.price * item.quantity}</p>

                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive rounded-lg" onClick={() => dispatch({ type: "REMOVE_FROM_CART", payload: item.product.id })}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <Separator className="bg-border/60" />

            {/* Pickup instructions */}
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-foreground">Pickup Instructions (optional)</Label>
              <Textarea placeholder="e.g., I'll come around 3 PM, please keep it packed" value={pickupInstructions} onChange={(e) => setPickupInstructions(e.target.value)} className="bg-card text-foreground rounded-xl border-border/60" rows={2} />
            </div>

            <Separator className="bg-border/60" />

            {/* Price summary */}
            <div className="rounded-xl bg-muted/40 p-4 border border-border/60">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Subtotal ({state.cart.reduce((s, c) => s + c.quantity, 0)} items)</span>
                <span>Rs. {total}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground mt-1">
                <span>Platform fee</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">FREE</span>
              </div>
              <Separator className="my-2.5 bg-border/60" />
              <div className="flex items-center justify-between">
                <span className="font-heading font-semibold text-foreground">Total</span>
                <span className="text-lg font-bold text-primary">Rs. {total}</span>
              </div>
              <p className="mt-2 text-[10px] text-muted-foreground">Payment via UPI/QR at pickup</p>
            </div>

            <Button variant="ghost" className="text-destructive rounded-xl" onClick={() => { dispatch({ type: "CLEAR_CART" }); toast.info("Cart cleared") }}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cart
            </Button>
          </div>
        )}
      </main>

      {state.cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-border/60 bg-card/95 backdrop-blur-md p-4">
          <Button className="w-full h-12 bg-primary text-primary-foreground font-heading font-bold text-base rounded-xl shadow-sm" onClick={handlePlaceOrder}>
            Place Order - Rs. {total}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
