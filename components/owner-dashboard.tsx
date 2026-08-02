"use client"

import { Input } from "@/components/ui/input"
import { useMemo, useState } from "react"
import { useStore } from "@/lib/store"
import { AppHeader } from "./app-header"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ORDER_STATUS_LABELS, STATUS_COLORS } from "@/lib/types"
import type { Order, OrderStatus } from "@/lib/types"
import { Package, ClipboardList, Settings, BarChart3, Plus, ShoppingBag, LogOut, Store, Eye } from "lucide-react"
import { toast } from "sonner"
import { generateQRCodeSVG } from "@/lib/qr-code"

export function OwnerDashboard() {
  const { state, dispatch } = useStore()
  const [activeTab, setActiveTab] = useState("orders")

  const myShops = useMemo(() => state.shops.filter((s) => s.ownerId === state.user?.id), [state.shops, state.user])
  const allOrders = useMemo(() => {
    const shopIds = myShops.map((s) => s.id)
    return state.orders.filter((o) => shopIds.includes(o.shopId)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [state.orders, myShops])

  const activeOrders = allOrders.filter((o) => !["completed", "cancelled"].includes(o.status))
  const totalRevenue = allOrders.filter((o) => o.status === "completed").reduce((s, o) => s + o.total, 0)
  const totalProducts = state.products.filter((p) => myShops.some((s) => s.id === p.shopId)).length

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader title="Dashboard" showProfile />

      <main className="flex-1 pb-20">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2.5 px-4 py-4">
          {[
            { value: myShops.length, label: "Shops", color: "text-primary" },
            { value: activeOrders.length, label: "Active", color: "text-emerald-600 dark:text-emerald-400" },
            { value: `Rs.${totalRevenue}`, label: "Revenue", color: "text-foreground" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl bg-card border border-border/60 p-3.5 text-center shadow-sm">
              <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4">
          <TabsList className="w-full bg-muted/50 rounded-xl p-1">
            {["orders", "products", "shops", "analytics"].map((t) => (
              <TabsTrigger key={t} value={t} className="flex-1 text-xs rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium capitalize">
                {t}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="orders" className="mt-4"><OwnerOrdersTab orders={allOrders} /></TabsContent>
          <TabsContent value="products" className="mt-4"><OwnerProductsTab /></TabsContent>
          <TabsContent value="shops" className="mt-4">
            <div className="flex flex-col gap-2.5">
              {myShops.map((shop) => (
                <div key={shop.id} className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-heading font-semibold text-foreground">{shop.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{shop.category}</p>
                    </div>
                    <Badge className={`text-[10px] font-medium rounded-lg border-0 ${shop.isTemporarilyClosed ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>
                      {shop.isTemporarilyClosed ? "Closed" : "Open"}
                    </Badge>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">{shop.address}</p>
                  <Button size="sm" variant="outline" className="mt-3 h-8 text-xs border-border/60 text-foreground bg-card rounded-lg font-medium" onClick={() => { dispatch({ type: "SET_EDIT_SHOP", payload: shop.id }); dispatch({ type: "NAVIGATE", payload: "owner-settings" }) }}>
                    <Settings className="mr-1.5 h-3 w-3" /> Settings
                  </Button>
                </div>
              ))}
              <Button className="h-10 bg-primary text-primary-foreground rounded-xl font-heading font-semibold" onClick={() => dispatch({ type: "NAVIGATE", payload: "owner-setup" })}>
                <Plus className="mr-2 h-4 w-4" /> Add New Shop
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="analytics" className="mt-4"><OwnerAnalyticsTab orders={allOrders} totalProducts={totalProducts} /></TabsContent>
        </Tabs>
      </main>

      <OwnerBottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

function OwnerOrdersTab({ orders }: { orders: Order[] }) {
  const { dispatch } = useStore()
  const [filter, setFilter] = useState<"all" | "active" | "past">("active")
  const [verifyOrderId, setVerifyOrderId] = useState<string | null>(null)

  const filtered = filter === "all" ? orders : filter === "active" ? orders.filter((o) => !["completed", "cancelled"].includes(o.status)) : orders.filter((o) => ["completed", "cancelled"].includes(o.status))

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    dispatch({ type: "UPDATE_ORDER_STATUS", payload: { orderId, status: newStatus } })
    toast.success(`Order ${newStatus === "accepted" ? "accepted" : newStatus === "ready" ? "marked ready" : newStatus === "completed" ? "completed" : "updated"}`)
    setVerifyOrderId(null)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        {(["active", "all", "past"] as const).map((f) => (
          <Button key={f} size="sm" variant={filter === f ? "default" : "outline"}
            className={`h-8 text-xs rounded-lg font-medium ${filter === f ? "bg-primary text-primary-foreground" : "border-border/60 text-foreground bg-card"}`}
            onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No orders</p>
      ) : (
        filtered.map((order) => (
          <div key={order.id} className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{order.id}</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{order.items.map((i) => `${i.productName} x${i.quantity}`).join(", ")}</p>
              </div>
              <Badge className="text-[10px] rounded-lg border-0" style={{ backgroundColor: order.colorCode, color: "#fff" }}>{ORDER_STATUS_LABELS[order.status]}</Badge>
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
              <span className="font-semibold text-foreground">Rs. {order.total}</span>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: order.colorCode }} />
                <span>{order.colorLabel}</span>
              </div>
              <span className="font-mono">Code: {order.pickupCode}</span>
            </div>

            {verifyOrderId === order.id && (
              <div className="mb-3 rounded-xl border border-border/60 bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Verification Details</p>
                <div className="flex items-center gap-4">
                  <div className="shrink-0" dangerouslySetInnerHTML={{ __html: generateQRCodeSVG(order.qrData, 80, order.colorCode) }} />
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full" style={{ backgroundColor: order.colorCode }} />
                      <span className="font-semibold text-foreground text-sm">{order.colorLabel}</span>
                    </div>
                    <p className="font-mono text-lg font-bold text-foreground">{order.pickupCode}</p>
                    <p className="text-[10px] text-muted-foreground">Match color + code with customer receipt</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" className="h-8 text-xs border-border/60 text-foreground bg-card rounded-lg font-medium" onClick={() => setVerifyOrderId(verifyOrderId === order.id ? null : order.id)}>
                <Eye className="mr-1 h-3 w-3" /> {verifyOrderId === order.id ? "Hide" : "Verify"}
              </Button>
              {order.status === "placed" && (
                <>
                  <Button size="sm" className="h-8 text-xs bg-primary text-primary-foreground rounded-lg font-medium" onClick={() => handleStatusChange(order.id, "accepted")}>Accept</Button>
                  <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive rounded-lg" onClick={() => handleStatusChange(order.id, "cancelled")}>Reject</Button>
                </>
              )}
              {order.status === "accepted" && (
                <Button size="sm" className="h-8 text-xs bg-emerald-600 text-white rounded-lg font-medium" onClick={() => handleStatusChange(order.id, "ready")}>Mark Ready</Button>
              )}
              {order.status === "ready" && (
                <Button size="sm" className="h-8 text-xs bg-primary text-primary-foreground rounded-lg font-medium" onClick={() => handleStatusChange(order.id, "completed")}>Complete</Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function OwnerProductsTab() {
  const { state, dispatch, generateId } = useStore()
  const [adding, setAdding] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [desc, setDesc] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")

  const myShops = state.shops.filter((s) => s.ownerId === state.user?.id)
  const [selectedShop, setSelectedShop] = useState(myShops[0]?.id || "")
  const products = state.products.filter((p) => p.shopId === selectedShop)

  const resetForm = () => { setName(""); setDesc(""); setPrice(""); setCategory(""); setAdding(false); setEditId(null) }

  const handleSave = () => {
    if (!name.trim() || !price || !category) { toast.error("Please fill all fields"); return }
    if (editId) {
      const prod = state.products.find((p) => p.id === editId)
      if (prod) { dispatch({ type: "UPDATE_PRODUCT", payload: { ...prod, name: name.trim(), description: desc.trim(), price: Number(price), category } }); toast.success("Product updated") }
    } else {
      dispatch({ type: "ADD_PRODUCT", payload: { id: generateId("prod"), shopId: selectedShop, name: name.trim(), description: desc.trim(), price: Number(price), category, inStock: true, createdAt: new Date().toISOString() } })
      toast.success("Product added")
    }
    resetForm()
  }

  const handleEdit = (p: (typeof products)[0]) => { setEditId(p.id); setName(p.name); setDesc(p.description); setPrice(String(p.price)); setCategory(p.category); setAdding(true) }

  return (
    <div className="flex flex-col gap-3">
      {myShops.length > 1 && (
        <select value={selectedShop} onChange={(e) => setSelectedShop(e.target.value)} className="rounded-xl border border-border/60 bg-card px-3 py-2.5 text-sm text-foreground">
          {myShops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      )}

      {adding ? (
        <div className="rounded-xl border border-primary/30 bg-card p-4 flex flex-col gap-3 shadow-sm">
          <p className="font-heading font-semibold text-foreground">{editId ? "Edit Product" : "Add Product"}</p>
          <Input placeholder="Product name" value={name} onChange={(e) => setName(e.target.value)} className="bg-muted/30 text-foreground rounded-xl h-10" />
          <Input placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} className="bg-muted/30 text-foreground rounded-xl h-10" />
          <Input type="number" placeholder="Price (Rs.)" value={price} onChange={(e) => setPrice(e.target.value)} className="bg-muted/30 text-foreground rounded-xl h-10" />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5 text-sm text-foreground h-10">
            <option value="">Select category</option>
            {["Food & Beverages", "Snacks", "Fresh Produce", "Dairy", "Bakery", "Personal Care", "Household", "Electronics", "Other"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-2">
            <Button className="flex-1 bg-primary text-primary-foreground rounded-xl font-medium" onClick={handleSave}>{editId ? "Update" : "Add"}</Button>
            <Button variant="outline" className="flex-1 border-border/60 text-foreground bg-card rounded-xl font-medium" onClick={resetForm}>Cancel</Button>
          </div>
        </div>
      ) : (
        <Button className="h-10 bg-primary text-primary-foreground rounded-xl font-heading font-semibold" onClick={() => setAdding(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      )}

      {products.length === 0 && !adding ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No products yet. Add your first product!</p>
      ) : (
        products.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-3.5 shadow-sm">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                {!p.inStock && <Badge variant="secondary" className="text-[10px] bg-muted text-muted-foreground border-0 rounded-md">Out of stock</Badge>}
              </div>
              <p className="text-xs text-muted-foreground">{p.category}</p>
              <p className="text-sm font-bold text-primary mt-0.5">Rs. {p.price}</p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-8 text-xs text-foreground rounded-lg" onClick={() => handleEdit(p)}>Edit</Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs text-foreground rounded-lg" onClick={() => { dispatch({ type: "UPDATE_PRODUCT", payload: { ...p, inStock: !p.inStock } }); toast.info(p.inStock ? "Marked out of stock" : "Marked in stock") }}>
                {p.inStock ? "Hide" : "Show"}
              </Button>
              <Button size="sm" variant="ghost" className="h-8 text-xs text-destructive rounded-lg" onClick={() => { if (confirm("Delete this product?")) { dispatch({ type: "DELETE_PRODUCT", payload: p.id }); toast.info("Product deleted") } }}>Del</Button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function OwnerAnalyticsTab({ orders, totalProducts }: { orders: Order[]; totalProducts: number }) {
  const completed = orders.filter((o) => o.status === "completed")
  const cancelled = orders.filter((o) => o.status === "cancelled")
  const revenue = completed.reduce((s, o) => s + o.total, 0)
  const avgOrder = completed.length > 0 ? Math.round(revenue / completed.length) : 0

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { value: orders.length, label: "Total Orders", color: "text-primary" },
          { value: completed.length, label: "Completed", color: "text-emerald-600 dark:text-emerald-400" },
          { value: `Rs.${revenue}`, label: "Revenue", color: "text-foreground" },
          { value: `Rs.${avgOrder}`, label: "Avg. Order", color: "text-foreground" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border/60 bg-card p-4 text-center shadow-sm">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <Separator className="bg-border/60" />

      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <p className="font-heading text-sm font-semibold text-foreground mb-3">Order Status Breakdown</p>
        {(["placed", "accepted", "ready", "completed", "cancelled"] as const).map((status) => {
          const count = orders.filter((o) => o.status === status).length
          const pct = orders.length > 0 ? (count / orders.length) * 100 : 0
          return (
            <div key={status} className="flex items-center gap-3 mb-2.5">
              <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[status].hex }} />
              <span className="w-20 text-xs text-muted-foreground">{ORDER_STATUS_LABELS[status]}</span>
              <div className="flex-1 h-2 rounded-full bg-muted/60 overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[status].hex }} />
              </div>
              <span className="text-xs font-medium text-foreground w-8 text-right">{count}</span>
            </div>
          )
        })}
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <p className="font-heading text-sm font-semibold text-foreground mb-2">Summary</p>
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <div className="flex justify-between"><span>Total Products</span><span className="text-foreground font-medium">{totalProducts}</span></div>
          <div className="flex justify-between"><span>Cancellation Rate</span><span className="text-foreground font-medium">{orders.length > 0 ? Math.round((cancelled.length / orders.length) * 100) : 0}%</span></div>
          <div className="flex justify-between"><span>Completion Rate</span><span className="text-foreground font-medium">{orders.length > 0 ? Math.round((completed.length / orders.length) * 100) : 0}%</span></div>
        </div>
      </div>
    </div>
  )
}

function OwnerBottomNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (t: string) => void }) {
  const { dispatch } = useStore()

  const items = [
    { id: "orders", icon: ClipboardList, label: "Orders" },
    { id: "products", icon: Package, label: "Products" },
    { id: "shops", icon: Store, label: "Shops" },
    { id: "analytics", icon: BarChart3, label: "Analytics" },
  ]

  return (
    <nav className="sticky bottom-0 flex items-center justify-around border-t border-border/60 bg-card/95 backdrop-blur-md px-2 py-2.5">
      {items.map((item) => (
        <button key={item.id} className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${activeTab === item.id ? "text-primary" : "text-muted-foreground hover:text-foreground"}`} onClick={() => onTabChange(item.id)}>
          <item.icon className="h-5 w-5" />
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
      <button className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground hover:text-foreground rounded-xl transition-colors" onClick={() => { dispatch({ type: "LOGOUT" }); toast.info("Logged out") }}>
        <LogOut className="h-5 w-5" />
        <span className="text-[10px] font-medium">Logout</span>
      </button>
    </nav>
  )
}
