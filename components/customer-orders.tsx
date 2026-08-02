"use client"

import { useMemo, useState } from "react"
import { useStore } from "@/lib/store"
import { AppHeader } from "./app-header"
import { BottomNav } from "./customer-home"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ORDER_STATUS_LABELS } from "@/lib/types"
import type { Order } from "@/lib/types"
import { Clock, ChevronRight, XCircle } from "lucide-react"
import { toast } from "sonner"

interface OrderCardProps {
  order: Order
  onView: () => void
  onCancel?: () => void
}

function OrderCard({ order, onView, onCancel }: OrderCardProps) {
  return (
    <div
      className="flex flex-col gap-2.5 rounded-xl border border-border/60 bg-card p-4 text-left cursor-pointer shadow-sm transition-all hover:shadow-md hover:border-primary/20"
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onView() }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{order.id}</p>
          <p className="font-heading font-semibold text-foreground">{order.shopName}</p>
        </div>
        <Badge className="text-[10px] font-semibold rounded-lg border-0" style={{ backgroundColor: order.colorCode, color: "#fff" }}>
          {ORDER_STATUS_LABELS[order.status]}
        </Badge>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{order.items.length} item{order.items.length > 1 ? "s" : ""}</span>
        <span>Rs. {order.total}</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: order.colorCode }} />
          <span className="text-[10px] text-muted-foreground">{order.colorLabel}</span>
        </div>
        <span className="text-[10px] text-muted-foreground">|</span>
        <span className="font-mono text-[10px] text-muted-foreground">Code: {order.pickupCode}</span>
        <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
      </div>

      {onCancel && order.status === "placed" && (
        <Button size="sm" variant="ghost" className="mt-1 h-7 text-destructive text-xs self-start rounded-lg" onClick={(e) => { e.stopPropagation(); onCancel() }}>
          <XCircle className="mr-1 h-3 w-3" />
          Cancel Order
        </Button>
      )}
    </div>
  )
}

export function CustomerOrders() {
  const { state, dispatch } = useStore()
  const [tab, setTab] = useState("active")

  const myOrders = useMemo(
    () => state.orders.filter((o) => o.customerId === state.user?.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [state.orders, state.user],
  )

  const activeOrders = myOrders.filter((o) => !["completed", "cancelled"].includes(o.status))
  const pastOrders = myOrders.filter((o) => ["completed", "cancelled"].includes(o.status))

  const viewOrder = (order: Order) => {
    dispatch({ type: "SELECT_SHOP", payload: order.id })
    dispatch({ type: "NAVIGATE", payload: "order-receipt" })
  }

  const cancelOrder = (orderId: string) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      dispatch({ type: "UPDATE_ORDER_STATUS", payload: { orderId, status: "cancelled" } })
      toast.info("Order cancelled")
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader title="My Orders" showCart showProfile />

      <main className="flex-1 px-4 py-4 pb-20">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full bg-muted/50 rounded-xl p-1">
            <TabsTrigger value="active" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium text-sm">
              Active ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium text-sm">
              Past ({pastOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4">
            {activeOrders.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No active orders</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {activeOrders.map((o) => (
                  <OrderCard key={o.id} order={o} onView={() => viewOrder(o)} onCancel={() => cancelOrder(o.id)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-4">
            {pastOrders.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">No past orders</p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {pastOrders.map((o) => (
                  <OrderCard key={o.id} order={o} onView={() => viewOrder(o)} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  )
}
