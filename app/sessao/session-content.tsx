"use client";

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { routinesApi } from "@/lib/api/routines"
import { sessionsApi } from "@/lib/api/session"
import { exercisesApi } from "@/lib/api/exercise"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

// Estrutura local para montar os exercícios da sessão
type SessionExerciseDraft = {
  exerciseId: string
  name: string
  category: string
  position: number
  sets: {
    id: string
    reps: number | null
    weightKg: number | null
    durationSec: number | null
    distanceM: number | null
  }[]
}

export default function SessionPageContent() {
  const search = useSearchParams()
  const router = useRouter()

  const routineId = search.get("routine")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [routine, setRoutine] = useState<any>(null)

  // momento que o treino começou
  const [startedAt] = useState(() => new Date())

  // exercícios desta sessão (com sets sendo preenchidos pelo usuário)
  const [sessionExercises, setSessionExercises] = useState<SessionExerciseDraft[]>([])

  // =========================================================
  // Carregar rotina + exercícios
  // =========================================================
  useEffect(() => {
    async function load() {
      if (!routineId) {
        router.push("/rotinas")
        return
      }

      setLoading(true)
      try {
        const [r, allExercises] = await Promise.all([
          routinesApi.getById(routineId),
          exercisesApi.getAll(),
        ])

        setRoutine(r)

        const prepared: SessionExerciseDraft[] = r.exercises.map((re: any, idx: number) => {
          const ex = allExercises.find((e: any) => e.id === re.exerciseId)

          return {
            exerciseId: re.exerciseId,
            name: ex?.name ?? "Exercício",
            category: ex?.category ?? "peso_reps", // default se não achar
            position: re.position ?? idx,
            sets: [],
          }
        })

        setSessionExercises(prepared)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [routineId, router])

  // =========================================================
  // Adicionar um set simples
  // =========================================================
  function addSet(exerciseIndex: number) {
    setSessionExercises(prev => {
      const next = [...prev]
      const ex = next[exerciseIndex]

      ex.sets.push({
        id: crypto.randomUUID(),
        reps: 10,
        weightKg: null,
        durationSec: null,
        distanceM: null,
      })

      return next
    })
  }

  // =========================================================
  // Finalizar treino
  // =========================================================
  async function finalizarTreino() {
    if (!routine) {
      alert("Rotina não carregada.");
      return;
    }

    setSaving(true);

    try {
      await sessionsApi.create({
        routineId: routineId!,
        startedAt: startedAt,
        finishedAt: new Date(),
        exercises: sessionExercises.map(ex => ({
          exerciseId: ex.exerciseId,
          category: ex.category,
          sets: ex.sets.map((s: any) => ({
            id: s.id ?? crypto.randomUUID(),
            reps: s.reps ?? null,
            weightKg: s.weightKg ?? null,
            durationSec: s.durationSec ?? null,
            distanceM: s.distanceM ?? null,
          }))
        }))
      });

      router.push("/historico");
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar sessão.");
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // UI
  // =========================================================
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!routine) {
    return <div className="p-6">Rotina não encontrada.</div>
  }

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-6">
      <h1 className="text-2xl font-bold">{routine.name}</h1>

      {sessionExercises.map((ex, idx) => (
        <div key={ex.exerciseId} className="rounded-lg border p-4 bg-card">
          <h2 className="font-semibold">{ex.name}</h2>
          <p className="text-xs text-muted-foreground mb-1">
            Categoria: {ex.category}
          </p>

          <Button
            onClick={() => addSet(idx)}
            className="mt-3"
            variant="outline"
          >
            + Registrar set
          </Button>

          <div className="mt-3 flex flex-col gap-2">
            {ex.sets.map((s, i) => (
              <div
                key={s.id}
                className="border rounded-md p-2 flex justify-between text-sm"
              >
                <span>Set {i + 1}</span>
                <span>{s.reps} reps</span>
              </div>
            ))}

            {ex.sets.length === 0 && (
              <span className="text-xs text-muted-foreground">
                Nenhum set registrado ainda.
              </span>
            )}
          </div>
        </div>
      ))}

      <Button
        className="bg-green-600 hover:bg-green-700 mt-6"
        onClick={finalizarTreino}
        disabled={saving}
      >
        {saving ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Salvando treino...
          </>
        ) : (
          "Finalizar treino"
        )}
      </Button>
    </div>
  )
}
