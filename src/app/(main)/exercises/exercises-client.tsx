"use client"

import { useState, useTransition } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { LEVEL_LABELS } from "@/types"
import type { Level } from "@/generated/prisma"
import { Search, Info, X, ChevronLeft, ChevronRight, SlidersHorizontal, Dumbbell } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"

type Exercise = {
  id: string; slug: string; name: string; mainMuscle: string; level: Level
  equipment: string; exerciseType: string; defaultSets: string | null; instructions: string | null
  safety: string | null; intensity: number; impact: number; family: string | null
  objective: string | null; bodyweightOnly: boolean; easyVariant: string | null
  hardVariant: string | null; secondaryMuscles: string[]; restSeconds: number | null
  imageUrl: string | null
}

type Filters = { q?: string; level?: string; equipment?: string; objective?: string; bodyweight?: string }

type Props = {
  exercises: Exercise[]
  total: number
  totalPages: number
  currentPage: number
  currentFilters: Filters
  equipmentOptions: string[]
  objectiveOptions: string[]
}

const LEVELS = [
  { val: "", label: "Tous niveaux" },
  { val: "BEGINNER", label: "Débutant" },
  { val: "INTERMEDIATE", label: "Intermédiaire" },
  { val: "ADVANCED", label: "Avancé" },
]

const IMPACT_MAP: Record<number, string> = { 1: "Très faible", 2: "Faible", 3: "Modéré", 4: "Élevé", 5: "Très élevé" }

export function ExercisesClient({ exercises, total, totalPages, currentPage, currentFilters, equipmentOptions, objectiveOptions }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [selected, setSelected] = useState<Exercise | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const [q, setQ] = useState(currentFilters.q ?? "")
  const [level, setLevel] = useState(currentFilters.level ?? "")
  const [equipment, setEquipment] = useState(currentFilters.equipment ?? "")
  const [objective, setObjective] = useState(currentFilters.objective ?? "")
  const [bodyweight, setBodyweight] = useState(currentFilters.bodyweight === "true")

  function applyFilters(overrides: Partial<Filters & { page?: number }> = {}) {
    const params = new URLSearchParams()
    const fq = overrides.q !== undefined ? overrides.q : q
    const fl = overrides.level !== undefined ? overrides.level : level
    const fe = overrides.equipment !== undefined ? overrides.equipment : equipment
    const fo = overrides.objective !== undefined ? overrides.objective : objective
    const fb = overrides.bodyweight !== undefined ? overrides.bodyweight : bodyweight ? "true" : ""
    const fp = overrides.page ?? 1
    if (fq) params.set("q", fq)
    if (fl) params.set("level", fl)
    if (fe) params.set("equipment", fe)
    if (fo) params.set("objective", fo)
    if (fb) params.set("bodyweight", fb)
    if (fp > 1) params.set("page", String(fp))
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  function reset() {
    setQ(""); setLevel(""); setEquipment(""); setObjective(""); setBodyweight(false)
    startTransition(() => router.push(pathname))
  }

  const hasFilters = !!(q || level || equipment || objective || bodyweight)
  const activeCount = [q, level, equipment, objective, bodyweight ? "y" : ""].filter(Boolean).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-3xl sm:text-5xl uppercase tracking-wide">Exercices</h1>
          <p className="text-muted-foreground text-sm mt-1">
            <span className="text-primary font-semibold">{total.toLocaleString("fr-FR")}</span> exercices
            {hasFilters ? " trouvés" : " disponibles"} · Page {currentPage}/{totalPages}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 relative" onClick={() => setShowFilters(!showFilters)}>
          <SlidersHorizontal className="w-4 h-4" />
          Filtres
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>
      </div>

      {/* Search bar always visible */}
      <form onSubmit={(e) => { e.preventDefault(); applyFilters({ q, page: 1 }) }} className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher : pompes, développé, dips, squat..."
          className="pl-9 pr-20 h-11"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button type="submit" size="sm" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8">
          Chercher
        </Button>
      </form>

      {/* Expanded filters */}
      {showFilters && (
        <Card className="p-4 bg-card border-border space-y-4">
          {/* Level */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Niveau</p>
            <div className="flex gap-2 flex-wrap">
              {LEVELS.map((l) => (
                <button key={l.val} type="button"
                  onClick={() => { setLevel(l.val); applyFilters({ level: l.val, page: 1 }) }}
                  className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    level === l.val ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
                  )}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Matériel</p>
            <div className="flex gap-2 flex-wrap max-h-28 overflow-y-auto">
              <button type="button"
                onClick={() => { setEquipment(""); applyFilters({ equipment: "", page: 1 }) }}
                className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  !equipment ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                )}>
                Tous
              </button>
              {equipmentOptions.map((eq) => (
                <button key={eq} type="button"
                  onClick={() => { setEquipment(eq); applyFilters({ equipment: eq, page: 1 }) }}
                  className={cn("shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    equipment === eq ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
                  )}>
                  {eq}
                </button>
              ))}
            </div>
          </div>

          {/* Objective */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Objectif</p>
            <div className="flex gap-2 flex-wrap">
              <button type="button"
                onClick={() => { setObjective(""); applyFilters({ objective: "", page: 1 }) }}
                className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  !objective ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground"
                )}>
                Tous
              </button>
              {objectiveOptions.map((ob) => (
                <button key={ob} type="button"
                  onClick={() => { setObjective(ob); applyFilters({ objective: ob, page: 1 }) }}
                  className={cn("px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    objective === ob ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
                  )}>
                  {ob}
                </button>
              ))}
            </div>
          </div>

          {/* Bodyweight toggle */}
          <div className="flex items-center justify-between pt-1 border-t border-border">
            <div>
              <p className="text-sm font-medium">Poids du corps uniquement</p>
              <p className="text-xs text-muted-foreground">Sans matériel, partout</p>
            </div>
            <button type="button"
              onClick={() => { const nb = !bodyweight; setBodyweight(nb); applyFilters({ bodyweight: nb ? "true" : "", page: 1 }) }}
              className={cn("w-11 h-6 rounded-full border-2 transition-colors relative",
                bodyweight ? "bg-primary border-primary" : "bg-secondary border-border"
              )}>
              <div className={cn("w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform",
                bodyweight ? "translate-x-5" : "translate-x-0.5"
              )} />
            </button>
          </div>

          {hasFilters && (
            <button onClick={reset} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 pt-1">
              <X className="w-3 h-3" /> Réinitialiser tous les filtres
            </button>
          )}
        </Card>
      )}

      {/* Loading overlay */}
      {isPending && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          Chargement...
        </div>
      )}

      {/* Results grid */}
      {exercises.length === 0 ? (
        <div className="text-center py-16">
          <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground">Aucun exercice ne correspond à ces filtres.</p>
          {hasFilters && <button onClick={reset} className="text-primary text-sm mt-2 hover:underline">Effacer les filtres</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {exercises.map((ex) => (
            <Card key={ex.id} onClick={() => setSelected(ex)} className="overflow-hidden bg-card border-border hover:border-primary/30 cursor-pointer transition-colors">
              {ex.imageUrl ? (
                <div className="relative h-32 bg-secondary/30">
                  <Image src={ex.imageUrl} alt={ex.name} fill className="object-cover" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
                </div>
              ) : (
                <div className="h-12 bg-secondary/20 flex items-center justify-center">
                  <Dumbbell className="w-4 h-4 text-muted-foreground/30" />
                </div>
              )}
              <div className="p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-sm leading-tight">{ex.name}</h3>
                <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              </div>
              <p className="text-xs text-muted-foreground mb-2">{ex.mainMuscle}</p>
              <div className="flex gap-1.5 flex-wrap mb-2">
                <Badge variant="outline" className="text-xs">{LEVEL_LABELS[ex.level]}</Badge>
                <Badge variant="outline" className="text-xs">{ex.equipment}</Badge>
                {ex.objective && <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">{ex.objective}</Badge>}
              </div>
              {ex.defaultSets && <p className="text-xs text-muted-foreground">{ex.defaultSets}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => applyFilters({ page: currentPage - 1 })} className="gap-1">
            <ChevronLeft className="w-4 h-4" /> Précédent
          </Button>
          <span className="text-sm text-muted-foreground">
            Page <strong>{currentPage}</strong> / {totalPages.toLocaleString("fr-FR")}
          </span>
          <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => applyFilters({ page: currentPage + 1 })} className="gap-1">
            Suivant <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Detail modal — bottom sheet on mobile */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setSelected(null)}>
          <Card className="max-w-md w-full bg-card border-border max-h-[90vh] overflow-y-auto rounded-t-xl sm:rounded-xl" onClick={(e) => e.stopPropagation()}>
            {/* Image */}
            {selected.imageUrl && (
              <div className="relative h-52 sm:h-64 bg-secondary/30 rounded-t-xl overflow-hidden">
                <Image src={selected.imageUrl} alt={selected.name} fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                <button onClick={() => setSelected(null)} className="absolute top-3 right-3 p-2 bg-black/50 rounded-full" aria-label="Fermer">
                  <X className="w-4 h-4 text-white" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h2 className="text-xl font-bold leading-tight drop-shadow-lg">{selected.name}</h2>
                  <p className="text-sm text-muted-foreground">{selected.mainMuscle}</p>
                </div>
              </div>
            )}
            <div className="p-5">
            {!selected.imageUrl && (
            <div className="flex items-start justify-between mb-3 gap-3">
              <h2 className="text-lg font-bold leading-tight">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="shrink-0 p-2 -m-2" aria-label="Fermer"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            )}
            <div className="flex gap-2 flex-wrap mb-4">
              <Badge variant="outline" className="text-xs">{selected.mainMuscle}</Badge>
              <Badge variant="outline" className="text-xs">{LEVEL_LABELS[selected.level]}</Badge>
              <Badge variant="outline" className="text-xs">{selected.equipment}</Badge>
              {selected.objective && <Badge className="text-xs bg-primary/10 text-primary border-0">{selected.objective}</Badge>}
              {selected.bodyweightOnly && <Badge variant="outline" className="text-xs text-accent border-accent/30">Poids du corps</Badge>}
            </div>
            <div className="space-y-3 text-sm">
              {selected.defaultSets && <p><span className="font-medium">Séries : </span>{selected.defaultSets} {selected.restSeconds ? `· repos ${selected.restSeconds}s` : ""}</p>}
              {selected.instructions && <p><span className="font-medium">Technique : </span>{selected.instructions}</p>}
              {selected.safety && <p className="text-muted-foreground"><span className="font-medium">Précautions : </span>{selected.safety}</p>}
              {selected.easyVariant && <p className="text-muted-foreground"><span className="font-medium">Variante facile : </span>{selected.easyVariant}</p>}
              {selected.hardVariant && <p className="text-muted-foreground"><span className="font-medium">Variante difficile : </span>{selected.hardVariant}</p>}
              {selected.secondaryMuscles.length > 0 && <p className="text-muted-foreground"><span className="font-medium">Muscles secondaires : </span>{selected.secondaryMuscles.join(", ")}</p>}
            </div>
            <div className="flex gap-3 mt-4 text-xs text-muted-foreground border-t border-border pt-3">
              <span>Intensité : {"●".repeat(selected.intensity)}{"○".repeat(5 - selected.intensity)}</span>
              <span>Impact : {IMPACT_MAP[selected.impact] ?? selected.impact}</span>
            </div>
            </div>{/* end p-5 */}
          </Card>
        </div>
      )}
    </div>
  )
}
