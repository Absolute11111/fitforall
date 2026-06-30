import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { calcNutrition, calcBmi, bmiLabel } from "@/lib/nutrition"
import { GOAL_LABELS, LEVEL_LABELS, formatGoals } from "@/types"
import { Flame, TrendingDown, TrendingUp, Dumbbell, Calendar, Zap, ArrowRight, Plus } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [profile, lastMeasurement, workoutLogs, userProgram] = await Promise.all([
    db.profile.findUnique({ where: { userId: session.user.id } }),
    db.measurement.findFirst({ where: { userId: session.user.id }, orderBy: { recordedAt: "desc" } }),
    db.workoutLog.findMany({ where: { userId: session.user.id }, orderBy: { completedAt: "desc" }, take: 30 }),
    db.userProgram.findFirst({
      where: { userId: session.user.id, isActive: true },
      include: {
        program: {
          include: {
            sessions: { orderBy: { order: "asc" }, take: 1, include: { exercises: { include: { exercise: true }, orderBy: { order: "asc" }, take: 5 } } },
          },
        },
      },
    }),
  ])

  if (!profile) redirect("/onboarding")

  const currentWeight = lastMeasurement?.weightKg ? Number(lastMeasurement.weightKg) : Number(profile.currentWeightKg ?? 0)
  const targetWeight = Number(profile.targetWeightKg ?? currentWeight)
  const startWeight = Number(profile.currentWeightKg ?? currentWeight)

  const totalGap = startWeight - targetWeight
  const currentGap = currentWeight - targetWeight
  const progressPct = totalGap !== 0 ? Math.min(100, Math.max(0, Math.round(((totalGap - currentGap) / Math.abs(totalGap)) * 100))) : 100

  const bmi = profile.heightCm ? calcBmi(currentWeight, profile.heightCm) : null
  const bmiInfo = bmi ? bmiLabel(bmi) : null

  // Streak: consecutive days with workout
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  let streak = 0
  const dayMap = new Set(workoutLogs.map((l) => new Date(l.completedAt).toDateString()))
  for (let i = 0; i < 30; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    if (dayMap.has(d.toDateString())) streak++
    else if (i > 0) break
  }

  const nutrition = calcNutrition(currentWeight, profile.goals, profile.heightCm ?? undefined, profile.age ?? undefined)
  const todaySession = userProgram?.program.sessions[0]

  const motivations = [
    "Chaque séance compte. Même 15 minutes, c'est déjà une victoire.",
    "Tu n'as pas à être parfait. Tu dois juste y aller.",
    "Le progrès, pas la perfection. C'est ça la clé.",
    "Ton corps se souvient de chaque effort. Continue.",
  ]
  const motivation = motivations[new Date().getDay() % motivations.length]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-5xl uppercase tracking-wide">Bonjour, {session.user.name?.split(" ")[0]} 👋</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{motivation}</p>
        </div>
        {streak > 0 && (
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold text-sm">
            <Flame className="w-4 h-4" />
            {streak} jour{streak > 1 ? "s" : ""} de suite
          </div>
        )}
      </div>

      {/* Today session CTA */}
      {todaySession && (
        <Card className="p-5 bg-primary/5 border-primary/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <Dumbbell className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Séance du jour</p>
              <p className="font-semibold">{userProgram?.program.name} — {todaySession.sessionName}</p>
            </div>
          </div>
          <Link href={`/workout/${todaySession.id}`}>
            <Button className="gap-1 shrink-0">
              Commencer <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </Card>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground mb-1">Poids actuel</p>
          <p className="text-2xl font-bold">{currentWeight} kg</p>
          {currentWeight !== startWeight && (
            <p className={`text-xs mt-1 flex items-center gap-1 ${currentWeight < startWeight ? "text-accent" : "text-destructive"}`}>
              {currentWeight < startWeight ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {Math.abs(currentWeight - startWeight).toFixed(1)} kg
            </p>
          )}
        </Card>

        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground mb-1">Objectif</p>
          <p className="text-2xl font-bold">{targetWeight} kg</p>
          <p className="text-xs text-muted-foreground mt-1">{formatGoals(profile.goals)}</p>
        </Card>

        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground mb-1">Séances complétées</p>
          <p className="text-2xl font-bold">{workoutLogs.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{LEVEL_LABELS[profile.level]}</p>
        </Card>

        <Card className="p-4 bg-card border-border">
          <p className="text-xs text-muted-foreground mb-1">IMC indicatif</p>
          {bmi ? (
            <>
              <p className="text-2xl font-bold">{bmi}</p>
              <p className={`text-xs mt-1 ${bmiInfo?.color}`}>{bmiInfo?.label}</p>
            </>
          ) : <p className="text-muted-foreground text-sm">—</p>}
        </Card>
      </div>

      {/* Progress bar */}
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center justify-between mb-3">
          <p className="font-medium text-sm">Progression vers l'objectif</p>
          <span className="text-primary font-bold text-sm">{progressPct}%</span>
        </div>
        <Progress value={progressPct} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Départ : {startWeight} kg</span>
          <span>Cible : {targetWeight} kg</span>
        </div>
      </Card>

      {/* Nutrition */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 bg-card border-border">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Nutrition du jour</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Calories estimées</p>
              <p className="text-xl font-bold text-primary">{nutrition.kcal} kcal</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Protéines cibles</p>
              <p className="text-xl font-bold">{nutrition.proteins} g</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{nutrition.msg}</p>
          <Link href="/nutrition" className="text-xs text-primary hover:underline mt-2 inline-block">
            Voir les détails nutrition →
          </Link>
        </Card>

        <Card className="p-5 bg-card border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-sm">Mon programme</h3>
            </div>
            <Link href="/programs">
              <Button variant="ghost" size="sm" className="text-xs h-7">Changer</Button>
            </Link>
          </div>
          {userProgram ? (
            <div>
              <p className="font-medium">{userProgram.program.name}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant="outline" className="text-xs">{LEVEL_LABELS[userProgram.program.level]}</Badge>
                <Badge variant="outline" className="text-xs">{GOAL_LABELS[userProgram.program.goal]}</Badge>
                <Badge variant="outline" className="text-xs">{userProgram.program.sessionsPerWeek}x/sem</Badge>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Aucun programme actif</p>
              <Link href="/programs"><Button size="sm" className="gap-1 w-fit"><Plus className="w-3 h-3" />Choisir un programme</Button></Link>
            </div>
          )}
        </Card>
      </div>

      {/* Mesure rapide */}
      <Card className="p-5 bg-card border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm">Enregistrer une mesure</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Poids, tour de taille, énergie du jour</p>
          </div>
          <Link href="/progress">
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="w-3 h-3" /> Ajouter
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
