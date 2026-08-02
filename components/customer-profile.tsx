"use client"

import { useStore } from "@/lib/store"
import { AppHeader } from "./app-header"
import { BottomNav } from "./customer-home"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { User, Phone, ShoppingBag, ClipboardList, LogOut, Moon, Sun, ChevronRight, Shield, HelpCircle } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { SmartFetchLogo } from "./logo"

export function CustomerProfile() {
  const { state, dispatch } = useStore()
  const { resolvedTheme, setTheme } = useTheme()

  const totalOrders = state.orders.filter((o) => o.customerId === state.user?.id).length
  const completedOrders = state.orders.filter((o) => o.customerId === state.user?.id && o.status === "completed").length
  const activeOrders = state.orders.filter((o) => o.customerId === state.user?.id && !["completed", "cancelled"].includes(o.status)).length

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader title="Profile" showCart />

      <main className="flex-1 px-4 py-6 pb-24">
        <div className="mx-auto max-w-md">
          {/* User info card */}
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="text-center">
              <h2 className="font-heading text-lg font-bold text-foreground">{state.user?.name}</h2>
              <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mt-1">
                <Phone className="h-3 w-3" />
                {state.user?.phone}
              </p>
            </div>
            {state.isDemo && <Badge className="bg-primary/10 text-primary border-0 font-medium">Demo Account</Badge>}
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-border/60 bg-card p-3.5 text-center shadow-sm">
              <p className="text-xl font-bold text-primary">{totalOrders}</p>
              <p className="text-[10px] text-muted-foreground font-medium">Total</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-3.5 text-center shadow-sm">
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{completedOrders}</p>
              <p className="text-[10px] text-muted-foreground font-medium">Completed</p>
            </div>
            <div className="rounded-xl border border-border/60 bg-card p-3.5 text-center shadow-sm">
              <p className="text-xl font-bold text-foreground">{activeOrders}</p>
              <p className="text-[10px] text-muted-foreground font-medium">Active</p>
            </div>
          </div>

          <Separator className="my-5 bg-border/60" />

          {/* Menu items */}
          <div className="flex flex-col gap-0.5">
            {[
              { icon: ClipboardList, label: "My Orders", action: () => dispatch({ type: "NAVIGATE", payload: "customer-orders" }) },
              { icon: ShoppingBag, label: "My Cart", action: () => dispatch({ type: "NAVIGATE", payload: "cart" }), badge: state.cart.reduce((s, c) => s + c.quantity, 0) || undefined },
            ].map((item) => (
              <button key={item.label} className="flex items-center justify-between rounded-xl px-3 py-3.5 text-left transition-colors hover:bg-muted/50" onClick={item.action}>
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && <Badge className="bg-primary text-primary-foreground text-[10px] border-0">{item.badge}</Badge>}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            ))}

            <Separator className="my-2 bg-border/60" />

            <button className="flex items-center justify-between rounded-xl px-3 py-3.5 text-left transition-colors hover:bg-muted/50" onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
              <div className="flex items-center gap-3">
                {resolvedTheme === "dark" ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5 text-primary" />}
                <span className="text-sm font-medium text-foreground">{resolvedTheme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>

            {[
              { icon: Shield, label: "Privacy Policy" },
              { icon: HelpCircle, label: "Help & Support" },
            ].map((item) => (
              <button key={item.label} className="flex items-center justify-between rounded-xl px-3 py-3.5 text-left transition-colors hover:bg-muted/50">
                <div className="flex items-center gap-3">
                  <item.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}

            <Separator className="my-2 bg-border/60" />

            <Button variant="ghost" className="justify-start gap-3 text-destructive hover:text-destructive h-11 rounded-xl" onClick={() => { dispatch({ type: "LOGOUT" }); toast.info("Logged out") }}>
              <LogOut className="h-5 w-5" />
              Log Out
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-8 flex flex-col items-center gap-2 text-center">
            <SmartFetchLogo size={28} />
            <p className="text-xs text-muted-foreground">Smart Fetch v1.0</p>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
