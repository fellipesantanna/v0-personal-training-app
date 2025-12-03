"use client"

import { useEffect, useState } from "react"
import { sessionsApi } from "@/lib/api/session"
import { Session } from "@/lib/types"
import { StatCard } from "@/components/stats/StatCard"
import { motion } from "framer-motion"
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts"
import { Dumbbell, Gauge, Timer, Hash } from "lucide-react"

// ================================
// Helpers de Datas
// ================================
function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay() === 0 ? 7 : d.getDay() // domingo = 7
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - (day - 1))
  return d
}

function endOfWeek(date: Date) {
  const d = startOfWeek(date)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

function isWithinRange(date: Date, start: Date, end: Date) {
  return date >= start && date <= end
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

// ================================
// Estatísticas calculadas
// ================================
interface WeeklyStats {
  totalSets: number
  totalReps: number
  totalWeight: number
  totalDuration: number
  totalDistance: number
}

function computeStats(sessions: Session[]): WeeklyStats {
  let stats: WeeklyStats = {
    totalSets: 0,
    totalReps: 0,
    totalWeight: 0,
    totalDuration: 0,
    totalDistance: 0
  }

  for (const s of sessions) {
    for (const ex of s.exercises) {
      for (const set of ex.sets) {
        stats.totalSets++
        if (set.reps) stats.totalReps += set.reps
        if (set.weightKg) stats.totalWeight += (set.weightKg * (set.reps ?? 1))
        if (set.durationSec) stats.totalDuration += set.durationSec
        if (set.distanceM) stats.totalDistance += set.distanceM
      }
    }
  }

  return stats
}

// ================================
// Página
// ================================
export default function StatsPage() {

  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  const [currentStats, setCurrentStats] = useState<WeeklyStats | null>(null)
  const [prevStats, setPrevStats] = useState<WeeklyStats | null>(null)

  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    async function load() {
      setLoading(true)

      // ======================================
      // 1) pegar sessões completas
      // ======================================
      const all = await sessionsApi.getAll()
      setSessions(all)

      // ======================================
      // 2) calcular semanas
      // ======================================
      const today = new Date()
      const currStart = startOfWeek(today)
      const currEnd = endOfWeek(today)

      const prevStart = new Date(currStart)
      prevStart.setDate(prevStart.getDate() - 7)

      const prevEnd = new Date(currEnd)
      prevEnd.setDate(prevEnd.getDate() - 7)

      const currSessions = all.filter(s =>
        isWithinRange(new Date(s.startedAt), currStart, currEnd)
      )

      const prevSessions = all.filter(s =>
        isWithinRange(new Date(s.startedAt), prevStart, prevEnd)
      )

      // ======================================
      // 3) stats
      // ======================================
      const curr = computeStats(currSessions)
      const prev = computeStats(prevSessions)

      setCurrentStats(curr)
      setPrevStats(prev)

      // ======================================
      // 4) gráfico diário simples
      // ======================================
      const chart: any[] = []

      for (let i = 0; i < 7; i++) {
        const d = new Date(currStart)
        d.setDate(currStart.getDate() + i)

        const daySessions = currSessions.filter(s =>
          startOfDay(new Date(s.startedAt)).toDateString() === d.toDateString()
        )

        let vol = 0
        for (const s of daySessions) {
          for (const ex of s.exercises) {
            for (const set of ex.sets) {
              if (set.weightKg && set.reps) {
                vol += set.weightKg * set.reps
              }
            }
          }
        }

        chart.push({
          day: d.toLocaleDateString("pt-BR", { weekday: "short" }),
          volume: vol
        })
      }

      setChartData(chart)
      setLoading(false)
    }

    load()
  }, [])

  if (loading) return <div className="p-6 text-center">Carregando...</div>
  if (!currentStats) return <div className="p-6">Sem dados ainda.</div>

  const pct = (a: number, b: number) =>
    b === 0 ? 0 : ((a - b) / b) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="p-6 max-w-5xl mx-auto flex flex-col gap-8"
    >
      <h1 className="text-3xl font-bold">Estatísticas da Semana</h1>

      {/* ======================================
          CARDS PRINCIPAIS
      ======================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          label="Volume total (kg)"
          value={currentStats.totalWeight}
          diff={pct(currentStats.totalWeight, prevStats?.totalWeight ?? 0)}
          icon={<Dumbbell className="w-4 h-4" />}
        />

        <StatCard
          label="Repetições"
          value={currentStats.totalReps}
          diff={pct(currentStats.totalReps, prevStats?.totalReps ?? 0)}
          icon={<Hash className="w-4 h-4" />}
        />

        <StatCard
          label="Duração total (s)"
          value={currentStats.totalDuration}
          diff={pct(currentStats.totalDuration, prevStats?.totalDuration ?? 0)}
          icon={<Timer className="w-4 h-4" />}
        />

        <StatCard
          label="Distância total (m)"
          value={currentStats.totalDistance}
          diff={pct(currentStats.totalDistance, prevStats?.totalDistance ?? 0)}
          icon={<Gauge className="w-4 h-4" />}
        />

      </div>

      {/* ======================================
          GRÁFICO — Volume por dia
      ======================================= */}
      <div className="rounded-xl border p-4 bg-card dark:bg-card/80 shadow-sm w-full h-80">
        <h2 className="text-lg font-semibold mb-2">Volume (kg) por dia da semana</h2>

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="volume" fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ======================================
          EVOLUÇÃO — linha do tempo
      ======================================= */}
      <div className="rounded-xl border p-4 bg-card dark:bg-card/80 shadow-sm w-full h-80">
        <h2 className="text-lg font-semibold mb-2">Evolução de Volume</h2>

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="volume" stroke="#a855f7" strokeWidth={3} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>

    </motion.div>
  )
}
