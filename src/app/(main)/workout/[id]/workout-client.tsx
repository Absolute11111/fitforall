"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, ChevronRight, ChevronLeft, Timer, RotateCcw, Flag, Info } from "lucide-react"
import { cn } from "@/lib/utils"

type Exercise = {
  id: string
  name: string
  mainMuscle: string
  defaultSets: string | null
  restSeconds: number | null
  instructions: string | null
  safety: string | null
  intensity: number
  pattern: string | null
}

type ProgramExercise = {
  id: string
  order: number
  exercise: Exercise
}

type Props = {
  session: {
    id: string
    sessionName: string
    program: { name: string }
    exercises: ProgramExercise[]
  }
  userId: string
}

function useTimer(initial: number) {
  const [time, setTime] = useState(initial)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    if (time <= 0) { setRunning(false); return }
    const t = setTimeout(() => setTime((t) => t - 1), 1000)
    return () => clearTimeout(t)
  }, [running, time])

  const start = useCallback((s: number) => { setTime(s); setRunning(true) }, [])
  const reset = useCallback((s: number) => { setTime(s); setRunning(false) }, [])

  return { time, running, start, reset }
}

export function WorkoutClient({ session, userId }: Props) {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [completed, setCompleted] = useState<Set<number>>(new Set())
  const [showInfo, setShowInfo] = useState(false)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [rpe, setRpe] = useState(6)

  const exercises = session.exercises
  const ex = exercises[current]?.exercise
  const restSec = ex?.restSeconds ?? 60
  const timer = useTimer(restSec)
  const startTime = useState(() => Date.now())[0]

  const pct = Math.round(((completed.size) / exercises.length) * 100)

  function markDone(idx: number) {
    setCompleted((s) => new Set([...s, idx]))
    if (ex?.restSeconds) timer.start(ex.restSeconds)
  }

  function goNext() {
    if (current < exercises.length - 1) setCurrent((c) => c + 1)
    else setDone(true)
  }

  async function finishWorkout() {
    setSubmitting(true)
    const durationMin = Math.round((Date.now() - startTime) / 60000)
    await fetch("/api/workout/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ programSessionId: session.id, durationMin, rpe }),
    })
    setSubmitting(false)
    router.push("/dashboard")
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto space-y-6 text-center">
        <div className="text-6xl mb-2">🎉</div>
        <h2 className="text-2xl font-bold">Séance terminée !</h2>
        <p className="text-muted-foreground">
          {completed.size}/{exercises.length} exercices complétés. Excellent travail.
        </p>

        <Card className="p-5 bg-card border-border text-left">
          <p className="font-medium text-sm mb-3">À quel point c'était difficile ? (RPE)</p>
          <div className="flex gap-2 flex-wrap">
            {[...Array(10)].map((_, i) => (
              <button key={i + 1} onClick={() => setRpe(i + 1)}
                className={cn("w-9 h-9 rounded-lg border text-sm font-medium transition-colors",
                  rpe === i + 1 ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground"
                )}>
                {i + 1}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">1 = très facile · 10 = effort maximal</p>
        </Card>

        <Button className="w-full h-11" onClick={finishWorkout} disabled={submitting}>
          {submitting ? "Enregistrement..." : "Valider et retourner au dashboard"}
        </Button>
        <Button variant="outline" className="w-full" onClick={() => { setCurrent(0); setDone(false); }}>
          Revoir les exercices
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      {/* Header */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wide">{session.program.name}</p>
        <h1 className="font-display text-3xl uppercase tracking-wide">{session.sessionName}</h1>
        <div className="mt-2">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Exercice {current + 1}/{exercises.length}</span>
            <span>{pct}% complété</span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>
      </div>

      {/* Exercise list nav */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {exercises.map((pe, i) => (
          <button key={pe.id} onClick={() => setCurrent(i)}
            className={cn("shrink-0 w-8 h-8 rounded-full border text-xs font-bold transition-colors",
              completed.has(i) ? "bg-accent/20 border-accent text-accent" :
              i === current ? "bg-primary border-primary text-primary-foreground" :
              "border-border text-muted-foreground"
            )}>
            {completed.has(i) ? "✓" : i + 1}
          </button>
        ))}
      </div>

      {/* Current exercise */}
      {ex && (
        <Card className="p-5 bg-card border-border space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold">{ex.name}</h2>
              <p className="text-sm text-muted-foreground">{ex.mainMuscle}</p>
            </div>
            <button onClick={() => setShowInfo(!showInfo)} className="text-muted-foreground hover:text-foreground mt-0.5">
              <Info className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {ex.defaultSets && <Badge variant="outline" className="text-xs">{ex.defaultSets}</Badge>}
            {ex.pattern && <Badge variant="outline" className="text-xs">{ex.pattern}</Badge>}
            {[...Array(5)].map((_, i) => (
              <span key={i} className={i < ex.intensity ? "text-primary" : "text-muted-foreground/30"}>●</span>
            ))}
          </div>

          {showInfo && (
            <div className="space-y-2 text-sm bg-secondary/20 rounded-xl p-4">
              {ex.instructions && <p><span className="font-medium">Technique : </span>{ex.instructions}</p>}
              {ex.safety && <p className="text-muted-foreground"><span className="font-medium">Sécurité : </span>{ex.safety}</p>}
            </div>
          )}

          {/* Rest timer */}
          {timer.running && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Temps de repos</p>
              <p className="text-3xl font-bold text-primary">
                {Math.floor(timer.time / 60).toString().padStart(2, "0")}:{(timer.time % 60).toString().padStart(2, "0")}
              </p>
              <button className="text-xs text-muted-foreground mt-2 flex items-center gap-1 mx-auto" onClick={() => timer.reset(restSec)}>
                <RotateCcw className="w-3 h-3" /> Réinitialiser
              </button>
            </div>
          )}

          <div className="flex gap-3">
            {!completed.has(current) ? (
              <Button className="flex-1 h-11 gap-1" onClick={() => { markDone(current) }}>
                <CheckCircle className="w-4 h-4" /> Exercice terminé
              </Button>
            ) : (
              <div className="flex-1 flex items-center gap-2 text-accent text-sm font-medium">
                <CheckCircle className="w-4 h-4" /> Bien joué !
              </div>
            )}
            <Button variant="outline" size="icon" onClick={() => timer.start(restSec)} className="h-11 w-11 shrink-0">
              <Timer className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Nav */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setCurrent((c) => Math.max(c - 1, 0))} disabled={current === 0} className="flex-1 gap-1">
          <ChevronLeft className="w-4 h-4" /> Précédent
        </Button>
        {current < exercises.length - 1 ? (
          <Button onClick={goNext} className="flex-1 gap-1">
            Suivant <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button onClick={() => setDone(true)} className="flex-1 gap-1 bg-accent hover:bg-accent/90 text-accent-foreground">
            <Flag className="w-4 h-4" /> Terminer
          </Button>
        )}
      </div>
    </div>
  )
}
