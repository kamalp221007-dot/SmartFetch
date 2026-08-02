"use client"

import { SmartFetchLogo } from "./logo"
import { useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Store, Play, Sun, Moon, MapPin, Zap, CreditCard } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function LandingPage() {
  const { dispatch } = useStore()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCustomer = () => {
    dispatch({ type: "NAVIGATE", payload: "auth-customer" })
  }

  const handleOwner = () => {
    dispatch({ type: "NAVIGATE", payload: "auth-owner" })
  }

  const handleDemo = () => {
    dispatch({ type: "SET_DEMO_MODE" })
    dispatch({ type: "NAVIGATE", payload: "demo-role-select" })
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Theme toggle */}
      {mounted && (
        <div className="absolute right-5 top-5 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="rounded-full border-border/60 bg-card/80 backdrop-blur-sm text-foreground h-10 w-10 shadow-lg hover:bg-muted transition-all hover:scale-105"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-[18px] w-[18px]" />
            ) : (
              <Moon className="h-[18px] w-[18px]" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      )}

      {/* Main content */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-16">
        <div className="flex w-full max-w-md flex-col items-center gap-10 animate-fade-up">
          {/* Logo and Branding */}
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <SmartFetchLogo size={80} />
            </div>
            <div className="flex flex-col items-center gap-3">
              <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-foreground text-center text-balance leading-tight">
                Skip the Queue.
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Pick Up Smarter.
                </span>
              </h1>
              <p className="text-center text-base leading-relaxed text-muted-foreground max-w-sm">
                Pre-order, pre-pay, and collect instantly from nearby shops. Your time matters.
              </p>
            </div>
          </div>

          {/* Feature row */}
          <div className="flex items-center gap-8 text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">Nearby</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">Instant</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 shadow-sm">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-medium text-foreground">Prepaid</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex w-full flex-col gap-3.5">
            <Button
              size="lg"
              className="h-14 gap-2.5 bg-primary text-primary-foreground font-heading font-semibold text-base rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
              onClick={handleCustomer}
            >
              <ShoppingBag className="h-5 w-5" />
              Grab Something Now
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="h-14 gap-2.5 border-2 border-border bg-card text-foreground font-heading font-semibold text-base rounded-xl hover:bg-muted hover:border-primary/50 transition-all"
              onClick={handleOwner}
            >
              <Store className="h-5 w-5" />
              Start Selling Today
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <span className="text-xs text-muted-foreground font-medium px-2">or</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            <Button
              size="lg"
              variant="ghost"
              className="h-12 gap-2 text-muted-foreground font-medium text-sm rounded-xl hover:bg-muted hover:text-foreground transition-all"
              onClick={handleDemo}
            >
              <Play className="h-4 w-4" />
              Explore Live Demo
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative border-t border-border/60 bg-card/50 backdrop-blur-sm px-6 py-5">
        <div className="mx-auto flex max-w-md items-center justify-center gap-6 text-xs text-muted-foreground">
          <span className="hover:text-foreground transition-colors cursor-pointer">Privacy</span>
          <span className="text-border">•</span>
          <span className="hover:text-foreground transition-colors cursor-pointer">Terms</span>
          <span className="text-border">•</span>
          <span className="hover:text-foreground transition-colors cursor-pointer">Support</span>
        </div>
      </footer>
    </div>
  )
}
