"use client"

import { useStore } from "@/lib/store"
import { AppHeader } from "./app-header"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ORDER_STATUS_LABELS } from "@/lib/types"
import { generateQRCodeSVG } from "@/lib/qr-code"
import { CheckCircle, Copy, Home } from "lucide-react"
import { toast } from "sonner"

export function OrderReceipt() {
  const { state, dispatch } = useStore()

  const order = state.orders.find((o) => o.id === state.selectedShopId) || state.orders[state.orders.length - 1]

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <p className="text-foreground">Order not found</p>
        <Button className="mt-4 rounded-xl" onClick={() => dispatch({ type: "NAVIGATE", payload: "customer-home" })}>Go Home</Button>
      </div>
    )
  }

  const qrSvg = generateQRCodeSVG(order.qrData, 180, order.colorCode)

  const copyCode = () => {
    navigator.clipboard?.writeText(order.pickupCode)
    toast.success("Pickup code copied!")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader title="Order Receipt" showBack backTo="customer-orders" />

      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-sm animate-fade-up">
          {/* Success header */}
          <div className="flex flex-col items-center gap-2.5 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: `${order.colorCode}15` }}>
              <CheckCircle className="h-8 w-8" style={{ color: order.colorCode }} />
            </div>
            <h1 className="font-heading text-xl font-bold text-foreground">
              {order.status === "placed" ? "Order Placed!" : ORDER_STATUS_LABELS[order.status]}
            </h1>
            <Badge className="text-sm px-3 py-1 font-semibold rounded-lg border-0" style={{ backgroundColor: order.colorCode, color: "#fff" }}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>

          {/* Receipt card */}
          <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
            <div className="h-1.5" style={{ backgroundColor: order.colorCode }} />

            <div className="p-5 flex flex-col gap-4">
              {/* Order ID and Date */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Order ID</p>
                  <p className="font-mono text-sm font-bold text-foreground">{order.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Date</p>
                  <p className="text-xs text-foreground">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>

              <Separator className="bg-border/60" />

              {/* QR Code */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs text-muted-foreground font-medium">Scan at pickup</p>
                <div className="rounded-xl border border-border/60 p-2 bg-background" dangerouslySetInnerHTML={{ __html: qrSvg }} />
              </div>

              <Separator className="bg-border/60" />

              {/* Pickup Code */}
              <div className="flex flex-col items-center gap-2">
                <p className="text-xs text-muted-foreground font-medium">Pickup Code</p>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-3xl font-black tracking-[0.3em] text-foreground">{order.pickupCode}</span>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground rounded-xl" onClick={copyCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator className="bg-border/60" />

              {/* Color Code */}
              <div className="flex items-center justify-between rounded-xl p-3" style={{ backgroundColor: `${order.colorCode}10` }}>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Verification Color</p>
                  <p className="text-sm font-semibold" style={{ color: order.colorCode }}>{order.colorLabel}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full border-2 border-border/60" style={{ backgroundColor: order.colorCode }} />
                  <span className="font-mono text-xs text-muted-foreground">{order.colorCode}</span>
                </div>
              </div>

              <Separator className="bg-border/60" />

              {/* Customer name and pickup time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Customer</p>
                  <p className="font-semibold text-foreground text-sm">{order.customerName}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Pickup Time</p>
                  <p className="font-semibold text-foreground text-sm">{order.pickupTime}</p>
                </div>
              </div>

              <Separator className="bg-border/60" />

              {/* Shop */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Shop</p>
                <p className="font-semibold text-foreground">{order.shopName}</p>
              </div>

              {/* Items */}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-2">Items</p>
                <div className="flex flex-col gap-1">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span className="text-foreground">{item.productName} x{item.quantity}</span>
                      <span className="font-medium text-foreground">Rs. {item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="bg-border/60" />

              <div className="flex items-center justify-between">
                <span className="font-heading text-base font-bold text-foreground">Total</span>
                <span className="text-xl font-black text-primary">Rs. {order.total}</span>
              </div>

              <p className="text-center text-[10px] text-muted-foreground">Pay via UPI/QR at the shop during pickup</p>
            </div>
            <div className="h-1.5" style={{ backgroundColor: order.colorCode }} />
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-2.5">
            <Button className="h-11 bg-primary text-primary-foreground rounded-xl font-heading font-semibold" onClick={() => dispatch({ type: "NAVIGATE", payload: "customer-orders" })}>
              View All Orders
            </Button>
            <Button variant="outline" className="h-11 border-border/60 text-foreground bg-card rounded-xl font-medium" onClick={() => dispatch({ type: "NAVIGATE", payload: "customer-home" })}>
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
