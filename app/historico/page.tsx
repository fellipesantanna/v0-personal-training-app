"use client"

import { useEffect, useState } from "react"
import { sessionsApi } from "@/lib/api/session"
import { Session } from "@/lib/types"
import { motion } from "framer-motion"
import { ArrowRight, CalendarDays, Clock, Dumbbell } from "lucide-react"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"

/** ===========================================================
 * Retorna a segunda-feira da semana correspondente
 ============================================================ */
function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay() // 0 = domingo
  const diff = (day === 0 ? -6 : 1) - day // trazer para segunda
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/** ===========================================================
 * Formatar data dd/mm
 ============================================================ */
function formatShort(d: Date) {
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit"
  })
}

/** ===========================================================
 * Formatar Título da Semana
 ============================================================ */
function formatWeekTitle(monday: Date) {
  const end = new Date(monday)
  end.setDate(end.getDate() + 6)

  return `${monday.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long"
  })} — ${end.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long"
  })}`
}

export default function HistoricoPage() {
  const [list, setList] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  /** ===========================================================
   * Carregar sessões detalhadas
   ============================================================ */
  async function load() {
    setLoading(true)
    try {
      const base = await sessionsApi.getAll()
      const detailed: Session[] = []

      const data = await sessionsApi.getAll()
      setList(data)
      
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])


  /** ===========================================================
   * AGRUPAR POR SEMANA -> { mondayDateString: Session[] }
   ============================================================ */
  const grouped: Record<string, Session[]> = {}

  for (const s of list) {
    const monday = startOfWeek(s.startedAt)
    const key = monday.toISOString().slice(0, 10)

    if (!grouped[key]) grouped[key] = []
    grouped[key].push(s)
  }

  // ordenar semanas da mais recente para mais antiga
  const sortedWeeks = Object.keys(grouped).sort((a, b) =>
    a < b ? 1 : -1
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <div className="animate-spin w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-3xl mx-auto p-6 flex flex-col gap-10"
    >
      <div>
        <h1 className="text-3xl font-bold mb-1">Histórico</h1>
        <p className="text-muted-foreground">
          Veja seus treinos organizados por semana
        </p>
      </div>

      <Separator />

      {/* ===========================================================
          LISTA POR SEMANA
      ============================================================ */}
      {sortedWeeks.map((weekKey) => {
        const monday = new Date(weekKey)
        const title = formatWeekTitle(monday)
        const sessions = grouped[weekKey]

        return (
          <motion.div
            key={weekKey}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-4"
          >
            <h2 className="text-xl font-bold">{title}</h2>

            {/* SESSÕES DA SEMANA */}
            <div className="flex flex-col gap-4">
              {sessions.map((s) => {
                const totalTimeMin = Math.round(
                  (s.finishedAt.getTime() - s.startedAt.getTime()) / 60000
                )

                return (
                  <motion.div
                    key={s.id}
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => router.push(`/historico/${s.id}`)}
                    className="
                      cursor-pointer rounded-xl border bg-card shadow-sm 
                      p-4 flex items-center justify-between
                      hover:bg-muted/40 transition
                    "
                  >
                    <div className="flex items-center gap-4">

                      <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/40">
                        <Dumbbell className="w-6 h-6 text-purple-700 dark:text-purple-300" />
                      </div>

                      <div className="flex flex-col">
                        <span className="font-semibold text-lg">
                          {s.routineName}
                        </span>

                        <span className="text-muted-foreground text-sm">
                          {formatShort(s.startedAt)} • {s.exercises.length} exercícios
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {totalTimeMin} min
                      </div>

                      <ArrowRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </motion.div>
                )
              })}
            </div>

            <Separator />
          </motion.div>
        )
      })}

    </motion.div>
  )
}
