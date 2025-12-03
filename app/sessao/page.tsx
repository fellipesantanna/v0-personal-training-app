"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { SessionExerciseCard } from "@/components/session/SessionExerciseCard"
import { Button } from "@/components/ui/button"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import { sessionsApi } from "@/lib/api/session"
import { routinesApi } from "@/lib/api/routines"
import { exercisesApi } from "@/lib/api/exercise"
import {
  Exercise,
  Routine,
  SessionExercise,
  WorkoutSet,
  ExerciseCategory,
  Session
} from "@/lib/types"
import { Separator } from "@/components/ui/separator"
import { motion } from "framer-motion"

export default function SessaoPage() {
  const searchParams = useSearchParams()
  const routineId = searchParams.get("id")
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [routine, setRoutine] = useState<Routine | null>(null)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([])
  const [lastSession, setLastSession] = useState<Session | null>(null)

  const [sessionStartTimestamp] = useState(Date.now())

  function buildInitialSets(
    category: ExerciseCategory,
    suggestedSets?: number | null,
    suggestedReps?: number | null
  ): WorkoutSet[] {
    const totalSets = suggestedSets ?? 0
    const reps = suggestedReps ?? 10

    const list: WorkoutSet[] = []

    for (let i = 0; i < totalSets; i++) {
      list.push({
        id: crypto.randomUUID(),
        setIndex: i,
        reps: category.includes("reps") ? reps : null,
        weightKg: category === "weight-reps" ? 20 : null,
        durationSec: category.includes("duration") ? 30 : null,
        distanceM: category === "distance-duration" ? 100 : null,
      })
    }

    return list
  }

  // ------------------------------------------------------------------------
  // Mesclar sets novos + última sessão
  // ------------------------------------------------------------------------
  function mergeWithLastSession(
    exerciseId: string,
    baseSets: WorkoutSet[],
    last: Session | null
  ): WorkoutSet[] {
    if (!last) return baseSets

    const lastEx = last.exercises.find(e => e.exerciseId === exerciseId)
    if (!lastEx) return baseSets

    if (lastEx.sets.length === 0) return baseSets

    return lastEx.sets.map((set, idx) => ({
      id: crypto.randomUUID(),
      setIndex: idx,
      reps: set.reps ?? null,
      weightKg: set.weightKg ?? null,
      durationSec: set.durationSec ?? null,
      distanceM: set.distanceM ?? null,
    }))
  }

  // ------------------------------------------------------------------------
  // Load routine + exercises + last session
  // ------------------------------------------------------------------------
  useEffect(() => {
    if (!routineId) {
      router.push("/rotinas")
      return
    }

    async function load() {
      try {
        setLoading(true)

        const [routineData, allExercises] = await Promise.all([
          routinesApi.getById(routineId),
          exercisesApi.getAll()
        ])

        setRoutine(routineData)
        setExercises(allExercises)

        // NOVO: PUXA APENAS A ÚLTIMA SESSÃO CORRETA
        const last = await sessionsApi.getLastOfRoutine(routineId)
        setLastSession(last)

        const prepared: SessionExercise[] = routineData.exercises.map((re, idx) => {
          const ex = allExercises.find(e => e.id === re.exerciseId)

          const baseSets = buildInitialSets(
            ex?.category ?? "weight-reps",
            re.suggestedSets,
            re.suggestedReps
          )

          const finalSets = mergeWithLastSession(
            re.exerciseId,
            baseSets,
            last
          )

          return {
            id: crypto.randomUUID(),
            exerciseId: re.exerciseId,
            exerciseName: ex?.name ?? "Exercício",
            category: ex?.category ?? "weight-reps",
            position: idx,
            sets: finalSets,
          }
        })

        setSessionExercises(prepared)

      } catch (err) {
        console.error(err)
        alert("Erro ao carregar dados.")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [routineId])

  // ------------------------------------------------------------------------
  // UPDATE SETS
  // ------------------------------------------------------------------------
  function updateExerciseSets(exerciseId: string, sets: WorkoutSet[]) {
    setSessionExercises(prev =>
      prev.map(se => se.exerciseId === exerciseId ? { ...se, sets } : se)
    )
  }

  // ------------------------------------------------------------------------
  // SAVE
  // ------------------------------------------------------------------------
  async function saveSession() {
    setSaving(true)
    try {
      await sessionsApi.create({
        routineId: routineId!,
        routineName: routine?.name ?? "Treino",
        sessionDate: new Date(sessionStartTimestamp),
        exercises: sessionExercises.map(se => ({
          exerciseId: se.exerciseId,
          position: se.position,
          sets: se.sets
        }))
      })

      router.push("/historico")
    } catch (err) {
      console.error(err)
      alert("Erro ao salvar sessão.")
    } finally {
      setSaving(false)
    }
  }

  // ------------------------------------------------------------------------
  // UI
  // ------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  if (!routine) return <div>Rotina não encontrada.</div>

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-3xl mx-auto p-6 flex flex-col gap-6"
    >

      {/* HEADER */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">{routine.name}</h1>
          <p className="text-muted-foreground text-sm">Sessão ativa</p>
        </div>
      </div>

      <Separator />

      {/* EXERCÍCIOS */}
      <div className="flex flex-col gap-6">
        {sessionExercises.map((ex) => (
          <motion.div key={ex.id} layout transition={{ type: "spring", bounce: 0.25 }}>
            <SessionExerciseCard
              exercise={{
                id: ex.exerciseId,
                name: ex.exerciseName,
                category: ex.category,
                userId: "",
                createdAt: new Date(),
              }}
              type={ex.category}
              sets={ex.sets}
              onChange={(sets) => updateExerciseSets(ex.exerciseId, sets)}
            />
          </motion.div>
        ))}
      </div>

      <Separator />

      {/* SAVE BUTTON */}
      <Button
        onClick={saveSession}
        disabled={saving}
        className="flex items-center gap-2 justify-center text-lg py-6 bg-purple-600 hover:bg-purple-700"
      >
        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        Finalizar Sessão
      </Button>

    </motion.div>
  )
}
