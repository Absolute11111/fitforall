"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { onboardingSchema, type OnboardingValues } from "@/schemas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Dumbbell, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = ["Toi", "Objectif", "Séances", "Compléments"]

const GOALS = [
  { value: "FAT_LOSS", label: "Perte de gras", emoji: "🔥", desc: "Affiner et perdre du poids progressivement" },
  { value: "MUSCLE_GAIN", label: "Prise de muscle", emoji: "💪", desc: "Prendre du volume et de la force" },
  { value: "RECOMPOSITION", label: "Recomposition", emoji: "⚖️", desc: "Perdre du gras et prendre du muscle simultanément" },
  { value: "HEALTH", label: "Forme générale", emoji: "❤️", desc: "Bouger plus, se sentir mieux au quotidien" },
  { value: "ENDURANCE", label: "Endurance", emoji: "🏃", desc: "Améliorer le cardio et l'énergie" },
]

const LEVELS = [
  { value: "BEGINNER", label: "Débutant", desc: "Je commence ou reprends le sport" },
  { value: "INTERMEDIATE", label: "Intermédiaire", desc: "Je pratique régulièrement depuis plus de 6 mois" },
  { value: "ADVANCED", label: "Avancé", desc: "Je m'entraîne intensément depuis plusieurs années" },
]

const DURATIONS = [15, 25, 35, 45, 60]
const SESSIONS_PER_WEEK = [2, 3, 4, 5, 6]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      goals: ["HEALTH"],
      level: "BEGINNER",
      sessionDuration: 25,
      sessionsPerWeek: 3,
      equipment: [],
      useWhey: false,
      useCreatine: false,
      targetWeeks: 16,
    },
  })

  const goals = watch("goals") ?? []
  const level = watch("level")
  const sessionDuration = watch("sessionDuration")
  const sessionsPerWeek = watch("sessionsPerWeek")
  const useWhey = watch("useWhey")
  const useCreatine = watch("useCreatine")

  async function onSubmit(data: OnboardingValues) {
    setLoading(true)
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    setLoading(false)
    router.push("/dashboard")
  }

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const prev = () => setStep((s) => Math.max(s - 1, 0))

  function toggleGoal(value: string) {
    const current = goals as string[]
    const next = current.includes(value) ? current.filter((g) => g !== value) : [...current, value]
    setValue("goals", next.length ? (next as OnboardingValues["goals"]) : (current as OnboardingValues["goals"]))
  }

  const hasFatLoss = (goals as string[]).includes("FAT_LOSS")
  const hasMuscleGain = (goals as string[]).includes("MUSCLE_GAIN")

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center gap-2 font-bold text-xl mb-8 justify-center">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-primary-foreground" />
          </div>
          FitForAll
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                i < step ? "bg-primary text-primary-foreground" :
                i === step ? "bg-primary text-primary-foreground" :
                "bg-secondary text-muted-foreground"
              )}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </div>
              <span className={cn("text-xs hidden sm:block", i === step ? "text-foreground font-medium" : "text-muted-foreground")}>{s}</span>
              {i < STEPS.length - 1 && <div className={cn("h-0.5 flex-1", i < step ? "bg-primary" : "bg-border")} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card className="p-6 bg-card border-border">

            {/* Step 0 — Toi */}
            {step === 0 && (
              <div className="space-y-4">
                <h2 className="font-display text-3xl uppercase tracking-wide mb-1">Parle-nous de toi</h2>
                <p className="text-sm text-muted-foreground mb-4">Ces infos servent à personnaliser ton programme. Rien d'autre.</p>

                <div className="space-y-1.5">
                  <Label>Prénom</Label>
                  <Input placeholder="Ton prénom" {...register("name")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Âge</Label>
                    <Input type="number" placeholder="25" {...register("age")} />
                    {errors.age && <p className="text-xs text-destructive">{errors.age.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Taille (cm)</Label>
                    <Input type="number" placeholder="175" {...register("heightCm")} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Poids actuel (kg)</Label>
                    <Input type="number" step="0.1" placeholder="72" {...register("currentWeightKg")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Poids cible (kg)</Label>
                    <Input type="number" step="0.1" placeholder="66" {...register("targetWeightKg")} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Délai cible (semaines)</Label>
                  <Input type="number" placeholder="16" {...register("targetWeeks")} />
                  <p className="text-xs text-muted-foreground">Entre 4 et 52 semaines. 16 semaines = rythme sain et durable.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Blessures ou douleurs à signaler ?</Label>
                  <Input placeholder="Genou droit, dos... ou aucune" {...register("injuries")} />
                </div>
              </div>
            )}

            {/* Step 1 — Objectif */}
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-display text-3xl uppercase tracking-wide mb-1">Tes objectifs</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Choisis-en un ou plusieurs — par exemple "Perte de gras" + "Prise de muscle" pour une recomposition.
                  Ton programme et tes exercices s'adaptent à la combinaison.
                </p>

                <div className="space-y-2">
                  {GOALS.map((g) => {
                    const checked = (goals as string[]).includes(g.value)
                    return (
                      <button key={g.value} type="button" onClick={() => toggleGoal(g.value)}
                        className={cn("w-full text-left p-3.5 rounded-xl border transition-colors flex items-center gap-3",
                          checked ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                        )}>
                        <span className="text-2xl">{g.emoji}</span>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{g.label}</div>
                          <div className="text-xs text-muted-foreground">{g.desc}</div>
                        </div>
                        <div className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors",
                          checked ? "bg-primary border-primary" : "border-muted-foreground"
                        )}>
                          {checked && <CheckCircle className="w-3.5 h-3.5 text-primary-foreground" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
                {errors.goals && <p className="text-xs text-destructive">{errors.goals.message}</p>}

                {hasFatLoss && hasMuscleGain && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 text-xs text-primary">
                    ⚖️ Perte de gras + Prise de muscle = on t'oriente vers un programme de <strong>recomposition</strong>
                    (renfo + cardio modéré, protéines élevées) — le combo le plus efficace pour les deux à la fois.
                  </div>
                )}

                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Ton niveau actuel</p>
                  <div className="flex gap-2">
                    {LEVELS.map((l) => (
                      <button key={l.value} type="button" onClick={() => setValue("level", l.value as any)}
                        className={cn("flex-1 p-2.5 rounded-lg border text-xs font-medium transition-colors",
                          level === l.value ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                        )}>
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Séances */}
            {step === 2 && (
              <div className="space-y-5">
                <h2 className="font-display text-3xl uppercase tracking-wide mb-1">Organisation de tes séances</h2>
                <p className="text-sm text-muted-foreground mb-4">Sois réaliste — mieux vaut 3 séances tenues que 6 ratées.</p>

                <div>
                  <p className="text-sm font-medium mb-2">Durée par séance</p>
                  <div className="flex gap-2 flex-wrap">
                    {DURATIONS.map((d) => (
                      <button key={d} type="button" onClick={() => setValue("sessionDuration", d)}
                        className={cn("px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                          sessionDuration === d ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                        )}>
                        {d} min
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Séances par semaine</p>
                  <div className="flex gap-2 flex-wrap">
                    {SESSIONS_PER_WEEK.map((s) => (
                      <button key={s} type="button" onClick={() => setValue("sessionsPerWeek", s)}
                        className={cn("w-10 h-10 rounded-lg border text-sm font-medium transition-colors",
                          sessionsPerWeek === s ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-primary/40"
                        )}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-secondary/30 rounded-xl p-4 text-sm text-muted-foreground">
                  → {Number(sessionsPerWeek)}x {Number(sessionDuration)} min/semaine = {Number(sessionsPerWeek) * Number(sessionDuration)} min d'effort. C'est largement suffisant pour progresser.
                </div>
              </div>
            )}

            {/* Step 3 — Compléments */}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="font-display text-3xl uppercase tracking-wide mb-1">Compléments alimentaires</h2>
                <p className="text-sm text-muted-foreground mb-2">
                  Tout fonctionne sans compléments. Réponds honnêtement — on adapte juste les conseils nutrition.
                </p>

                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-primary mb-4">
                  ✓ Aucun complément n'est obligatoire pour progresser avec FitForAll.
                </div>

                {[
                  { key: "useWhey", val: useWhey, label: "Whey protéinée", desc: "Pratique pour atteindre les apports en protéines. Option confort, pas obligation." },
                  { key: "useCreatine", val: useCreatine, label: "Créatine monohydrate", desc: "Peut aider les performances répétées. Option utile, jamais indispensable. Demande avis médical si doutes." },
                ].map(({ key, val, label, desc }) => (
                  <button key={key} type="button"
                    onClick={() => setValue(key as any, !val)}
                    className={cn("w-full text-left p-4 rounded-xl border transition-colors",
                      val ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    )}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{label}</span>
                      <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                        val ? "bg-primary border-primary" : "border-muted-foreground"
                      )}>
                        {val && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{desc}</p>
                  </button>
                ))}

                <p className="text-xs text-muted-foreground text-center mt-2">Tu pourras modifier ça à tout moment dans les réglages.</p>
              </div>
            )}
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4 gap-3">
            <Button type="button" variant="outline" onClick={prev} disabled={step === 0} className="gap-1">
              <ChevronLeft className="w-4 h-4" /> Retour
            </Button>
            {step < STEPS.length - 1 ? (
              <Button type="button" onClick={next} className="gap-1">
                Suivant <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={loading} className="gap-1">
                {loading ? "Génération..." : "Obtenir mon programme"} <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
