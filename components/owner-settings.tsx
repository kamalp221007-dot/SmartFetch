"use client"

import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { AppHeader } from "./app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SHOP_CATEGORIES, DAYS_OF_WEEK } from "@/lib/types"
import { Save, Trash2, AlertTriangle, LogOut, User, Phone } from "lucide-react"
import { toast } from "sonner"
import { SmartFetchLogo } from "./logo"

export function OwnerSettings() {
  const { state, dispatch } = useStore()

  const shopId = state.currentEditShopId || state.shops.find((s) => s.ownerId === state.user?.id)?.id
  const shop = state.shops.find((s) => s.id === shopId)

  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [address, setAddress] = useState("")
  const [upiId, setUpiId] = useState("")
  const [openTime, setOpenTime] = useState("09:00")
  const [closeTime, setCloseTime] = useState("21:00")
  const [workingDays, setWorkingDays] = useState<string[]>([])
  const [isClosed, setIsClosed] = useState(false)

  useEffect(() => {
    if (shop) {
      setName(shop.name); setCategory(shop.category); setDescription(shop.description); setAddress(shop.address); setUpiId(shop.upiId || ""); setOpenTime(shop.openTime); setCloseTime(shop.closeTime); setWorkingDays([...shop.workingDays]); setIsClosed(shop.isTemporarilyClosed)
    }
  }, [shop])

  if (!shop) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <AppHeader title="Settings" showBack backTo="owner-dashboard" />
        <div className="flex flex-1 flex-col items-center justify-center">
          <p className="text-muted-foreground">No shop selected</p>
          <Button className="mt-4 bg-primary text-primary-foreground rounded-xl" onClick={() => dispatch({ type: "NAVIGATE", payload: "owner-dashboard" })}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  const toggleDay = (day: string) => { setWorkingDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]) }

  const handleSave = () => {
    if (!name.trim()) { toast.error("Shop name is required"); return }
    if (!category) { toast.error("Please select a category"); return }
    if (!upiId.includes("@")) { toast.error("Please enter a valid UPI ID"); return }
    if (workingDays.length === 0) { toast.error("Select at least one working day"); return }
    dispatch({ type: "UPDATE_SHOP", payload: { ...shop, name: name.trim(), category, description: description.trim(), address: address.trim(), upiId: upiId.trim(), openTime, closeTime, workingDays, isTemporarilyClosed: isClosed } })
    toast.success("Shop settings saved!")
    dispatch({ type: "NAVIGATE", payload: "owner-dashboard" })
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this shop? This action cannot be undone.")) {
      dispatch({ type: "DELETE_SHOP", payload: shop.id })
      toast.info("Shop deleted")
      dispatch({ type: "NAVIGATE", payload: "owner-dashboard" })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader title="Shop Settings" showBack backTo="owner-dashboard" />

      <main className="flex-1 px-4 py-6 pb-32">
        <div className="mx-auto max-w-md flex flex-col gap-5">
          {/* Owner info */}
          <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-heading font-semibold text-foreground">{state.user?.name}</p>
                <p className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{state.user?.phone}</p>
              </div>
            </div>
          </div>

          <Separator className="bg-border/60" />

          {/* Temporarily closed toggle */}
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <p className="text-sm font-medium text-foreground">Temporarily Close Shop</p>
                <p className="text-[10px] text-muted-foreground">{"Customers won't see your shop while closed"}</p>
              </div>
            </div>
            <Switch checked={isClosed} onCheckedChange={setIsClosed} />
          </div>

          {/* Shop details */}
          <div className="flex flex-col gap-3">
            <h3 className="font-heading text-sm font-semibold text-foreground">Shop Details</h3>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-xs font-medium">Shop Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-card text-foreground rounded-xl h-10" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-xs font-medium">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-card text-foreground rounded-xl h-10"><SelectValue /></SelectTrigger>
                <SelectContent>{SHOP_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-xs font-medium">Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-card text-foreground rounded-xl" rows={2} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-xs font-medium">Address</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} className="bg-card text-foreground rounded-xl h-10" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-foreground text-xs font-medium">UPI ID</Label>
              <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} className="bg-card text-foreground rounded-xl h-10" />
            </div>
          </div>

          <Separator className="bg-border/60" />

          {/* Operating hours */}
          <div className="flex flex-col gap-3">
            <h3 className="font-heading text-sm font-semibold text-foreground">Operating Hours</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1"><Label className="text-foreground text-xs font-medium">Opening</Label><Input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} className="bg-card text-foreground rounded-xl h-10" /></div>
              <div className="flex flex-col gap-1"><Label className="text-foreground text-xs font-medium">Closing</Label><Input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} className="bg-card text-foreground rounded-xl h-10" /></div>
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground text-xs font-medium">Working Days</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <label key={day} className={`flex cursor-pointer items-center rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors ${workingDays.includes(day) ? "border-primary bg-primary/10 text-primary" : "border-border/60 bg-card text-muted-foreground"}`}>
                    <Checkbox checked={workingDays.includes(day)} onCheckedChange={() => toggleDay(day)} className="sr-only" />
                    {day.slice(0, 3)}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <Separator className="bg-border/60" />

          {/* Danger zone */}
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
            <h3 className="font-heading text-sm font-semibold text-destructive mb-2">Danger Zone</h3>
            <p className="text-xs text-muted-foreground mb-3">Deleting your shop will remove all products and pending orders.</p>
            <Button variant="outline" className="border-destructive/40 text-destructive bg-transparent hover:bg-destructive hover:text-white rounded-xl font-medium" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete Shop
            </Button>
          </div>

          <Button variant="ghost" className="justify-start gap-3 text-destructive hover:text-destructive h-11 rounded-xl" onClick={() => { dispatch({ type: "LOGOUT" }); toast.info("Logged out") }}>
            <LogOut className="h-5 w-5" /> Log Out
          </Button>

          <div className="mt-4 flex flex-col items-center gap-2">
            <SmartFetchLogo size={28} />
            <p className="text-[10px] text-muted-foreground">Smart Fetch v1.0</p>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border/60 bg-card/95 backdrop-blur-md p-4">
        <div className="mx-auto max-w-md">
          <Button className="w-full h-12 bg-primary text-primary-foreground font-heading font-semibold rounded-xl" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
