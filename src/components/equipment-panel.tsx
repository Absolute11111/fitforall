"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { EQUIPMENT_OPTIONS } from "@/types"
import { cn } from "@/lib/utils"
import { CheckCircle, Plus, X, Save, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

type Props = {
  current: string[]
  compact?: boolean        // true = inline dans settings, false = widget standalone
  onSaved?: () => void
}

export function EquipmentPanel({ current, compact = false, onSaved }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set(current))
  const [custom, setCustom] = useState("")
  const [customList, setCustomList] = useState<string[]>(
    current.filter((e) => !EQUIPMENT_OPTIONS.some((o) => o.value === e))
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function toggle(value: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(value)) next.delete(value)
      else next.add(value)
      return next
    })
    setSaved(false)
  }

  function addCustom() {
    const v = custom.trim()
    if (!v || customList.includes(v)) return
    setCustomList((prev) => [...prev, v])
    setSelected((prev) => new Set([...prev, v]))
    setCustom("")
    setSaved(false)
  }

  function removeCustom(v: string) {
    setCustomList((prev) => prev.filter((c) => c !== v))
    setSelected((prev) => { const next = new Set(prev); next.delete(v); return next })
    setSaved(false)
  }

  async function save() {
    setSaving(true)
    await fetch("/api/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ equipment: [...selected] }),
    })
    setSaving(false)
    setSaved(true)
    router.refresh()
    onSaved?.()
    setTimeout(() => setSaved(false), 3000)
  }

  const hasChanges = JSON.stringify([...selected].sort()) !== JSON.stringify([...current].sort())
  const count = selected.size

  return (
    <div className={cn("space-y-4", !compact && "")}>
      {!compact && (
        <div className="flex items-center gap-2 mb-2">
          <Package className="w-4 h-4 text-primary" />
          <p className="font-semibold text-sm">Mon équipement disponible</p>
          {count > 0 && (
            <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
              {count} sélectionné{count > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Coche ce que tu possèdes — les séances et exercices s'adaptent automatiquement.
      </p>

      {/* Equipment grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {EQUIPMENT_OPTIONS.map((eq) => {
          const checked = selected.has(eq.value)
          return (
            <button
              key={eq.value}
              type="button"
              onClick={() => toggle(eq.value)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                checked
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30 bg-card"
              )}
            >
              <span className="text-xl shrink-0">{eq.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium truncate", checked && "text-primary")}>{eq.label}</p>
                <p className="text-xs text-muted-foreground truncate">{eq.desc}</p>
              </div>
              <div className={cn(
                "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                checked ? "bg-primary border-primary" : "border-muted-foreground/40"
              )}>
                {checked && <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Custom equipment */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Autre matériel ?</p>
        <div className="flex gap-2">
          <Input
            placeholder="Ex: Ballon de plage, dip bars..."
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustom())}
            className="text-sm"
          />
          <Button type="button" variant="outline" size="icon" onClick={addCustom} disabled={!custom.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {customList.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-2">
            {customList.map((c) => (
              <div key={c} className="flex items-center gap-1.5 bg-secondary px-3 py-1.5 rounded-full text-xs font-medium border border-border">
                {c}
                <button type="button" onClick={() => removeCustom(c)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save */}
      <Button
        onClick={save}
        disabled={saving || !hasChanges}
        className={cn("w-full gap-2 h-11 transition-colors", saved && "bg-accent hover:bg-accent text-accent-foreground")}
      >
        {saving ? (
          <><div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" /> Enregistrement...</>
        ) : saved ? (
          <><CheckCircle className="w-4 h-4" /> Équipement mis à jour !</>
        ) : (
          <><Save className="w-4 h-4" /> Enregistrer mon équipement</>
        )}
      </Button>
    </div>
  )
}
