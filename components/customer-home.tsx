"use client"

import { useMemo, useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { AppHeader } from "./app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Search,
  MapPin,
  Clock,
  ChevronRight,
  SlidersHorizontal,
  ShoppingBag,
  ShoppingCart,
  ClipboardList,
  User,
  X,
  Star,
} from "lucide-react"
import { SHOP_CATEGORIES } from "@/lib/types"

function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function isShopOpen(
  openTime: string,
  closeTime: string,
  workingDays: string[],
): boolean {
  const now = new Date()
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]
  const today = dayNames[now.getDay()]
  if (!workingDays.includes(today)) return false
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const [oh, om] = openTime.split(":").map(Number)
  const [ch, cm] = closeTime.split(":").map(Number)
  return currentMinutes >= oh * 60 + om && currentMinutes <= ch * 60 + cm
}

export function CustomerHome() {
  const { state, dispatch } = useStore()
  const [showFilters, setShowFilters] = useState(false)
  const [locationName, setLocationName] = useState("Detecting location...")

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({
        type: "SET_LOCATION",
        payload: { lat: 12.9716, lng: 77.5946 },
      })
      setLocationName("MG Road, Bangalore")
    }, 1000)
    return () => clearTimeout(timer)
  }, [dispatch])

  const filteredShops = useMemo(() => {
    let shops = state.shops.filter(
      (s) => s.isSetupComplete && !s.isTemporarilyClosed,
    )

    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase()
      shops = shops.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      )
    }

    if (state.filterCategory) {
      shops = shops.filter((s) => s.category === state.filterCategory)
    }

    if (state.filterOpenNow) {
      shops = shops.filter((s) =>
        isShopOpen(s.openTime, s.closeTime, s.workingDays),
      )
    }

    if (state.userLocation) {
      shops = shops
        .map((s) => ({
          ...s,
          distance: getDistance(
            state.userLocation!.lat,
            state.userLocation!.lng,
            s.lat,
            s.lng,
          ),
        }))
        .filter((s) => s.distance <= state.filterDistance)
        .sort((a, b) => a.distance - b.distance)
    }

    return shops
  }, [
    state.shops,
    state.searchQuery,
    state.filterCategory,
    state.filterOpenNow,
    state.filterDistance,
    state.userLocation,
  ])

  const activeOrders = state.orders.filter(
    (o) =>
      o.customerId === state.user?.id &&
      !["completed", "cancelled"].includes(o.status),
  )

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader showCart showProfile />

      {/* Location bar */}
      <div className="flex items-center gap-2.5 border-b border-border/60 bg-card/50 px-4 py-2.5">
        <MapPin className="h-4 w-4 text-primary shrink-0" />
        <span className="flex-1 text-sm text-foreground truncate font-medium">
          {locationName}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-primary h-7 rounded-lg hover:bg-primary/10"
          onClick={() => setLocationName("MG Road, Bangalore")}
        >
          Change
        </Button>
      </div>

      {/* Active orders banner */}
      {activeOrders.length > 0 && (
        <div
          className="flex items-center gap-3 bg-primary/5 border-b border-primary/10 px-4 py-3 cursor-pointer hover:bg-primary/10 transition-colors"
          onClick={() =>
            dispatch({ type: "NAVIGATE", payload: "customer-orders" })
          }
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter")
              dispatch({ type: "NAVIGATE", payload: "customer-orders" })
          }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <ClipboardList className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {activeOrders.length} active order
              {activeOrders.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">
              Tap to view status
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search shops or products..."
            value={state.searchQuery}
            onChange={(e) =>
              dispatch({ type: "SET_SEARCH", payload: e.target.value })
            }
            className="pl-10 bg-muted/50 text-foreground border-0 h-11 rounded-xl"
          />
          {state.searchQuery && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => dispatch({ type: "SET_SEARCH", payload: "" })}
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Button
          variant="outline"
          size="icon"
          className={`shrink-0 h-11 w-11 rounded-xl border-border/60 ${
            showFilters
              ? "bg-primary text-primary-foreground border-primary"
              : "text-foreground bg-card"
          }`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-col gap-3 border-b border-border/60 bg-card/50 px-4 pb-4 animate-fade-in">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground font-medium">
              Category
            </Label>
            <Select
              value={state.filterCategory}
              onValueChange={(v) =>
                dispatch({
                  type: "SET_FILTER_CATEGORY",
                  payload: v === "all" ? "" : v,
                })
              }
            >
              <SelectTrigger className="bg-card text-foreground rounded-xl h-10">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {SHOP_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground font-medium">
              Open now only
            </Label>
            <Switch
              checked={state.filterOpenNow}
              onCheckedChange={(v) =>
                dispatch({ type: "SET_FILTER_OPEN_NOW", payload: v })
              }
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground font-medium">
              Distance: up to {state.filterDistance} km
            </Label>
            <Slider
              value={[state.filterDistance]}
              onValueChange={([v]) =>
                dispatch({ type: "SET_FILTER_DISTANCE", payload: v })
              }
              min={1}
              max={50}
              step={1}
            />
          </div>
        </div>
      )}

      {/* Shop list */}
      <div className="flex-1 px-4 py-3">
        <h2 className="mb-3 text-sm font-heading font-semibold text-muted-foreground">
          {filteredShops.length} shop{filteredShops.length !== 1 ? "s" : ""}{" "}
          nearby
        </h2>

        {filteredShops.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
              <ShoppingBag className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-heading font-semibold text-foreground">
              No shops found
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting your filters or search
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {filteredShops.map((shop) => {
              const open = isShopOpen(
                shop.openTime,
                shop.closeTime,
                shop.workingDays,
              )
              const dist = state.userLocation
                ? getDistance(
                    state.userLocation.lat,
                    state.userLocation.lng,
                    shop.lat,
                    shop.lng,
                  )
                : null

              return (
                <button
                  key={shop.id}
                  className="flex flex-col gap-2.5 rounded-xl border border-border/60 bg-card p-4 text-left shadow-sm transition-all hover:shadow-md hover:border-primary/20"
                  onClick={() =>
                    dispatch({ type: "SELECT_SHOP", payload: shop.id })
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-foreground text-[15px]">
                        {shop.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                        {shop.description}
                      </p>
                    </div>
                    <Badge
                      variant={open ? "default" : "secondary"}
                      className={`text-[10px] font-medium rounded-lg px-2 ${
                        open
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0"
                          : "bg-muted text-muted-foreground border-0"
                      }`}
                    >
                      {open ? "Open" : "Closed"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium">
                      <ShoppingBag className="h-3 w-3" />
                      {shop.category}
                    </span>
                    {dist !== null && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {dist < 1
                          ? `${Math.round(dist * 1000)}m`
                          : `${dist.toFixed(1)}km`}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {shop.openTime} - {shop.closeTime}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}

export function BottomNav() {
  const { state, dispatch } = useStore()
  const isCustomer = state.role === "customer"
  const cartCount = state.cart.reduce((sum, c) => sum + c.quantity, 0)

  if (!isCustomer) return null

  return (
    <nav className="sticky bottom-0 flex items-center justify-around border-t border-border/60 bg-card/95 backdrop-blur-md px-2 py-2.5">
      {[
        {
          id: "customer-home",
          icon: ShoppingBag,
          label: "Shops",
        },
        {
          id: "customer-orders",
          icon: ClipboardList,
          label: "Orders",
        },
        {
          id: "cart",
          icon: ShoppingCart,
          label: "Cart",
          badge: cartCount > 0 ? cartCount : undefined,
        },
        {
          id: "customer-profile",
          icon: User,
          label: "Profile",
        },
      ].map((item) => (
        <button
          key={item.id}
          className={`relative flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors ${
            state.currentView === item.id
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => dispatch({ type: "NAVIGATE", payload: item.id })}
        >
          <item.icon className="h-5 w-5" />
          {item.badge && (
            <span className="absolute -right-0.5 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
              {item.badge}
            </span>
          )}
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
