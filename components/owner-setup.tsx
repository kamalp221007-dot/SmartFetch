"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { SmartFetchLogo } from "./logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { SHOP_CATEGORIES, DAYS_OF_WEEK } from "@/lib/types"
import { MapPin, Loader2, Store, CreditCard, Clock } from "lucide-react"
import { toast } from "sonner"

export function OwnerSetup() {
  const { state, dispatch, generateId } = useStore()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const [shopName, setShopName] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [lat, setLat] = useState(12.9716)
  const [lng, setLng] = useState(77.5946)
  const [address, setAddress] = useState("")
  const [detectingLocation, setDetectingLocation] = useState(false)
  const [upiId, setUpiId] = useState("")
  const [openTime, setOpenTime] = useState("09:00")
  const [closeTime, setCloseTime] = useState("21:00")
  const [workingDays, setWorkingDays] = useState<string[]>([...DAYS_OF_WEEK])

  const progress = (step / 4) * 100

  const validateStep1 = () => {
    if (!shopName.trim()) { toast.error("Shop name is required"); return false }
    if (!category) { toast.error("Please select a category"); return false }
    if (!description.trim()) { toast.error("Please add a description"); return false }
    if (state.shops.some((s) => s.name.toLowerCase() === shopName.trim().toLowerCase())) { toast.error("A shop with this name already exists."); return false }
    return true
  }

  const validateStep2 = () => {
    if (!address.trim()) { toast.error("Please enter the shop address"); return false }
    const tooClose = state.shops.some((s) => {
      const R = 6371000; const dLat = ((s.lat - lat) * Math.PI) / 180; const dLng = ((s.lng - lng) * Math.PI) / 180
      const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat * Math.PI) / 180) * Math.cos((s.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) < 50
    })
    if (tooClose) { toast.error("Another shop exists within 50 meters."); return false }
    return true
  }

  const validateStep3 = () => {
    if (!upiId.trim()) { toast.error("UPI ID is required"); return false }
    if (!upiId.includes("@")) { toast.error("Please enter a valid UPI ID (e.g., name@upi)"); return false }
    return true
  }

  const validateStep4 = () => {
    if (workingDays.length === 0) { toast.error("Select at least one working day"); return false }
    return true
  }

  const detectLocation = async () => {
    setDetectingLocation(true)
    await new Promise((r) => setTimeout(r, 1500))
    setLat(Number((12.9716 + (Math.random() - 0.5) * 0.01).toFixed(6)))
    setLng(Number((77.5946 + (Math.random() - 0.5) * 0.01).toFixed(6)))
    setAddress(`${Math.floor(Math.random() * 100)} Commercial Street, Bangalore 560001`)
    setDetectingLocation(false)
    toast.success("Location detected!")
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    if (step === 3 && !validateStep3()) return
    if (step === 4 && !validateStep4()) return
    if (step < 4) { setStep(step + 1) } else { handleFinish() }
  }

  const handleFinish = async () => {
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    dispatch({ type: "ADD_SHOP", payload: { id: generateId("shop"), ownerId: state.user!.id, name: shopName.trim(), category, description: description.trim(), lat, lng, address: address.trim(), upiId: upiId.trim(), openTime, closeTime, workingDays, isTemporarilyClosed: false, isSetupComplete: true, createdAt: new Date().toISOString() } })
    setLoading(false)
    toast.success("Shop created successfully!")
    dispatch({ type: "NAVIGATE", payload: "owner-dashboard" })
  }

  const toggleDay = (day: string) => { setWorkingDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]) }

  const stepIcons = [Store, MapPin, CreditCard, Clock]
  const stepTitles = ["Shop Details", "Location", "Payment", "Operating Hours"]
  const StepIcon = stepIcons[step - 1]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60 bg-card/80 backdrop-blur-md px-4 py-3">
        <div className="flex items-center gap-2.5 mb-3">
          <SmartFetchLogo size={26} />
          <span className="font-heading font-semibold text-foreground text-sm">Setup Your Shop</span>
        </div>
        <Progress value={progress} className="h-1.5" />
        <div className="mt-2 flex items-center gap-2">
          <StepIcon className="h-4 w-4 text-primary" />
          <span className="text-sm text-muted-foreground font-medium">Step {step} of 4: {stepTitles[step - 1]}</span>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-md animate-fade-up">
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="shopName" className="text-foreground text-sm font-medium">Shop Name</Label>
                <Input id="shopName" placeholder="Enter your shop name" value={shopName} onChange={(e) => setShopName(e.target.value)} className="bg-card text-foreground rounded-xl h-11" />
                <p className="text-[10px] text-muted-foreground">Must be globally unique</p>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground text-sm font-medium">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="bg-card text-foreground rounded-xl h-11"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>{SHOP_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="desc" className="text-foreground text-sm font-medium">Description</Label>
                <Textarea id="desc" placeholder="Describe what your shop offers..." value={description} onChange={(e) => setDescription(e.target.value)} className="bg-card text-foreground rounded-xl" rows={3} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <Button variant="outline" className="h-12 border-primary/30 text-primary bg-primary/5 rounded-xl font-medium hover:bg-primary/10" onClick={detectLocation} disabled={detectingLocation}>
                {detectingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                {detectingLocation ? "Detecting..." : "Auto-detect GPS Location"}
              </Button>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-foreground text-xs font-medium">Latitude</Label>
                  <Input type="number" step="0.0001" value={lat} onChange={(e) => setLat(Number(e.target.value))} className="bg-card text-foreground text-xs rounded-xl h-10" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-foreground text-xs font-medium">Longitude</Label>
                  <Input type="number" step="0.0001" value={lng} onChange={(e) => setLng(Number(e.target.value))} className="bg-card text-foreground text-xs rounded-xl h-10" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="address" className="text-foreground text-sm font-medium">Address</Label>
                <Textarea id="address" placeholder="Full shop address" value={address} onChange={(e) => setAddress(e.target.value)} className="bg-card text-foreground rounded-xl" rows={2} />
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/30 p-6 text-center">
                <MapPin className="mx-auto mb-2 h-8 w-8 text-primary" />
                <p className="text-sm text-foreground font-medium">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
                <p className="text-xs text-muted-foreground">{address || "Adjust coordinates or detect location"}</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="upi" className="text-foreground text-sm font-medium">UPI ID</Label>
                <Input id="upi" placeholder="yourname@upi" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="bg-card text-foreground rounded-xl h-11" />
                <p className="text-[10px] text-muted-foreground">Customers will pay at pickup using this UPI ID</p>
              </div>
              {upiId && upiId.includes("@") && (
                <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground mb-1.5 font-medium">Preview</p>
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">{upiId}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <Label className="text-foreground text-xs font-medium">Opening Time</Label>
                  <Input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} className="bg-card text-foreground rounded-xl h-10" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-foreground text-xs font-medium">Closing Time</Label>
                  <Input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} className="bg-card text-foreground rounded-xl h-10" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground text-sm font-medium">Working Days</Label>
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
          )}
        </div>
      </main>

      <footer className="border-t border-border/60 bg-card/95 backdrop-blur-md px-4 py-4">
        <div className="mx-auto flex max-w-md gap-3">
          {step > 1 && <Button variant="outline" className="flex-1 border-border/60 text-foreground bg-card rounded-xl font-medium" onClick={() => setStep(step - 1)}>Back</Button>}
          <Button className="flex-1 bg-primary text-primary-foreground font-heading font-semibold rounded-xl" onClick={handleNext} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {step === 4 ? "Create Shop" : "Next"}
          </Button>
        </div>
      </footer>
    </div>
  )
}
