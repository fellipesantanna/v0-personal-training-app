"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { sessionsApi } from "@/lib/api/session"
import { Session } from "@/lib/types"

import { motion } from "framer-motion"
import { ArrowLeft, Dumbbell, Timer, Gauge, Footprints } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function SessionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)

  /** ==============================================
   * Carregar sessão
   ===============================================*/
  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const data = await sessionsApi.getById(id)
        setSession(data)
        
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  /** ==============================================
   * Icones de categoria
   ===============================================*/
  const iconMap: Record<string, any> = {
    "weight-reps": Dumbbell,
    "bodyweight-reps": Footprints,
    "duration": Timer,
    "distance-duration": Gauge,
  }

  /** ==============================================
   * UI
   ===============================================*/

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!session) {
    return <div className="text-center p-6">Sessão não encontrada.</div>
  }

  const totalTimeMin = Math.round(
    (session.finishedAt.getTime() - session.startedAt.getTime()) / 60000
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-3xl mx-auto p-6 flex flex-col gap-6"
    >
      {/* HEADER */}
      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-lg hover:bg-muted transition"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">{session.routineName}</h1>
          <p className="text-muted-foreground text-sm">
            Finalizado em{" "}
            {session.finishedAt.toLocaleString("pt-BR", {
              day: "2-digit",
              month: "long",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <Separator />

      {/* RESUMO */}
      <div className="rounded-xl border p-4 bg-card shadow-sm flex justify-between items-center">
        <div>
          <p className="text-purple-600 font-semibold">
            {session.exercises.length} exercícios
          </p>
          <p className="text-muted-foreground text-sm">
            Duração total: {totalTimeMin} min
          </p>
        </div>

        <Dumbbell className="w-10 h-10 text-purple-500" />
      </div>

      <Separator />

      {/* LISTA DE EXERCÍCIOS */}
      <div className="flex flex-col gap-8">
        {session.exercises.map((ex) => {
          const Icon = iconMap[ex.category]

          return (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="rounded-xl border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40">
                  <Icon className="h-6 w-6 text-purple-700 dark:text-purple-300" />
                </div>

                <div className="flex flex-col">
                  <h2 className="font-semibold text-lg">{ex.exerciseName}</h2>
                  <p className="text-muted-foreground text-sm">{ex.category}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2">
                {ex.sets.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-lg border p-3 bg-muted/30 flex justify-between"
                  >
                    <span className="font-medium text-purple-600">
                      Set {s.setIndex + 1}
                    </span>

                    <span className="text-sm text-muted-foreground">
                      {ex.category === "weight-reps" &&
                        `${s.weightKg}kg × ${s.reps} reps`}

                      {ex.category === "bodyweight-reps" &&
                        `${s.reps} reps`}

                      {ex.category === "duration" &&
                        `${s.durationSec}s`}

                      {ex.category === "distance-duration" &&
                        `${s.distanceM}m • ${s.durationSec}s`}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
