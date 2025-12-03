"use client"

import { useEffect, useState } from "react"
import { sessionsApi } from "@/lib/api/session"
import { Session } from "@/lib/types"

export interface WeeklySummary {
  sessions: number
  totalSets: number
  totalReps: number
  totalWeight: number
  totalDuration: number
  totalDistance: number
}

export interface WeeklyStatsResult {
  loading: boolean
  current: WeeklySummary | null
  previous: WeeklySummary | null
}

// =============================
// Helpers de datas
// =============================
function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1) - day // segunda-feira
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfWeek(date: Date) {
  const start = startOfWeek(date)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}

// =============================
// Soma dos dados
// =============================
function summarizeSessions(list: Session[], from: Date, to: Date): WeeklySummary {
  const filtered = list.filter(s =>
    s.startedAt >= from && s.startedAt <= to
  )

  const summary: WeeklySummary = {
    sessions: filtered.length,
    totalSets: 0,
    totalReps: 0,
    totalWeight: 0,
    totalDuration: 0,
    totalDistance: 0,
  }

  for (const sess of filtered) {
    for (const ex of sess.exercises) {
      summary.totalSets += ex.sets.length

      for (const set of ex.sets) {
        if (set.reps) summary.totalReps += set.reps
        if (set.weightKg && set.reps)
          summary.totalWeight += set.weightKg * set.reps
        if (set.durationSec) summary.totalDuration += set.durationSec
        if (set.distanceM) summary.totalDistance += set.distanceM
      }
    }
  }

  return summary
}

// =============================
// HOOK PRINCIPAL
// =============================
export function useWeeklyStats(): WeeklyStatsResult {
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<Session[]>([])

  const [current, setCurrent] = useState<WeeklySummary | null>(null)
  const [previous, setPrevious] = useState<WeeklySummary | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const list = await sessionsApi.getAll()
        setSessions(list)

        computeStats(list)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  function computeStats(list: Session[]) {
    const now = new Date()

    const currentStart = startOfWeek(now)
    const currentEnd = endOfWeek(now)

    const prevStart = new Date(currentStart)
    prevStart.setDate(prevStart.getDate() - 7)

    const prevEnd = new Date(currentEnd)
    prevEnd.setDate(prevEnd.getDate() - 7)

    const curr = summarizeSessions(list, currentStart, currentEnd)
    const prev = summarizeSessions(list, prevStart, prevEnd)

    setCurrent(curr)
    setPrevious(prev)
  }

  return { loading, current, previous }
}
