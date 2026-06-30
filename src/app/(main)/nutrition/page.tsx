import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { calcNutrition } from "@/lib/nutrition"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatGoals } from "@/types"
import { Utensils, Zap, Fish, AlertCircle, CheckCircle } from "lucide-react"

export default async function NutritionPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const [profile, supprefs, lastMeasurement] = await Promise.all([
    db.profile.findUnique({ where: { userId: session.user.id } }),
    db.supplementPreferences.findUnique({ where: { userId: session.user.id } }),
    db.measurement.findFirst({ where: { userId: session.user.id }, orderBy: { recordedAt: "desc" } }),
  ])

  if (!profile) redirect("/onboarding")

  const weight = lastMeasurement?.weightKg ? Number(lastMeasurement.weightKg) : Number(profile.currentWeightKg ?? 70)
  const nutrition = calcNutrition(weight, profile.goals, profile.heightCm ?? undefined, profile.age ?? undefined)

  const macros = [
    { icon: Zap, label: "Calories estimées", value: `${nutrition.kcal} kcal/j`, color: "text-primary", sub: `Base métabolique : ${nutrition.bmr} kcal` },
    { icon: Fish, label: "Protéines cibles", value: `${nutrition.proteins} g/j`, color: "text-accent", sub: `1.8–2.2 g/kg · même sans whey` },
    { icon: Utensils, label: "Glucides", value: nutrition.carbs, color: "text-blue-400", sub: "Autour des entraînements" },
    { icon: Utensils, label: "Lipides", value: nutrition.lipids, color: "text-yellow-400", sub: "Graisses de qualité (oléagineux, huile d'olive…)" },
  ]

  const highProteinFoods = [
    { food: "Poulet / dinde", per100g: "22-26g", icon: "🍗" },
    { food: "Œufs", per100g: "13g", icon: "🥚" },
    { food: "Thon / saumon", per100g: "22-25g", icon: "🐟" },
    { food: "Fromage blanc 0%", per100g: "10-12g", icon: "🥛" },
    { food: "Lentilles cuites", per100g: "9g", icon: "🫘" },
    { food: "Tofu", per100g: "8g", icon: "🟡" },
    { food: "Skyr", per100g: "10-12g", icon: "🥄" },
    { food: "Steak haché 5%", per100g: "21g", icon: "🥩" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-5xl uppercase tracking-wide">Nutrition</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Recommandations adaptées à tes objectifs : <strong>{formatGoals(profile.goals)}</strong>
        </p>
      </div>

      {/* Main message */}
      <Card className="p-5 bg-primary/5 border-primary/20">
        <p className="text-sm leading-relaxed">{nutrition.msg}</p>
        <p className="text-xs text-muted-foreground mt-2">{nutrition.warn}</p>
      </Card>

      {/* Macros */}
      <div className="grid grid-cols-2 gap-4">
        {macros.map(({ icon: Icon, label, value, color, sub }) => (
          <Card key={label} className="p-4 bg-card border-border">
            <Icon className={`w-4 h-4 ${color} mb-2`} />
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{sub}</p>
          </Card>
        ))}
      </div>

      {/* Protein sources */}
      <Card className="p-5 bg-card border-border">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Fish className="w-4 h-4 text-accent" />
          Meilleures sources de protéines (sans compléments)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {highProteinFoods.map(({ food, per100g, icon }) => (
            <div key={food} className="bg-secondary/20 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{icon}</div>
              <p className="text-xs font-medium">{food}</p>
              <p className="text-xs text-accent font-bold mt-0.5">{per100g}/100g</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Supplements */}
      <Card className="p-5 bg-card border-border">
        <h3 className="font-semibold text-sm mb-4">Compléments — tes préférences actuelles</h3>
        <div className="space-y-3">
          {[
            { label: "Sans compléments", desc: "Le programme fonctionne à 100%. Mange des protéines, dors bien, sois régulier.", active: true, icon: CheckCircle, color: "text-accent" },
            { label: "Whey protéinée", desc: "Option confort pour atteindre tes protéines facilement. Pas un booster magique.", active: supprefs?.useWhey ?? false, icon: CheckCircle, color: "text-blue-400" },
            { label: "Créatine monohydrate", desc: "3-5g/j n'importe quand. Aide la performance répétée. Demande avis médical si doutes.", active: supprefs?.useCreatine ?? false, icon: CheckCircle, color: "text-yellow-400" },
          ].map(({ label, desc, active, icon: Icon, color }) => (
            <div key={label} className={`flex items-start gap-3 p-3 rounded-xl border ${active ? "border-border bg-secondary/20" : "border-transparent opacity-50"}`}>
              <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${active ? color : "text-muted-foreground"}`} />
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              {active && <Badge variant="outline" className="text-xs ml-auto shrink-0">Activé</Badge>}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground bg-secondary/20 rounded-xl p-3">
          <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
          Aucun complément n'est obligatoire. Tu peux modifier tes préférences dans les réglages.
        </div>
      </Card>
    </div>
  )
}
