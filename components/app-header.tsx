"use client"

import { SmartFetchLogo } from "./logo"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Sun, Moon, ShoppingCart, User, ArrowLeft, Store } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"

export function AppHeader({
  title,
  showBack,
  backTo,
  showCart,
  showProfile,
}: {
  title?: string
  showBack?: boolean
  backTo?: string
  showCart?: boolean
  showProfile?: boolean
}) {
  const { state, dispatch } = useStore()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const cartCount = state.cart.reduce((sum, c) => sum + c.quantity, 0)

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-border/60 bg-card/80 backdrop-blur-md px-4 py-3">
      <div className="flex items-center gap-2.5">
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              dispatch({ type: "NAVIGATE", payload: backTo || "customer-home" })
            }
            className="text-foreground -ml-2 h-9 w-9 rounded-xl hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <SmartFetchLogo size={26} />
        <span className="font-heading font-semibold text-foreground text-sm tracking-tight">
          {title || "Smart Fetch"}
        </span>
        {state.isDemo && (
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary text-[10px] px-1.5 py-0 font-medium"
          >
            DEMO
          </Badge>
        )}
      </div>
      <div className="flex items-center gap-0.5">
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="text-muted-foreground h-9 w-9 rounded-xl hover:bg-muted"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        )}
        {showCart && state.role === "customer" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch({ type: "NAVIGATE", payload: "cart" })}
            className="relative text-muted-foreground h-9 w-9 rounded-xl hover:bg-muted"
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </Button>
        )}
        {showProfile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              dispatch({
                type: "NAVIGATE",
                payload: state.role === "customer" ? "customer-profile" : "owner-settings",
              })
            }
            className="text-muted-foreground h-9 w-9 rounded-xl hover:bg-muted"
          >
            {state.role === "owner" ? (
              <Store className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </header>
  )
}
