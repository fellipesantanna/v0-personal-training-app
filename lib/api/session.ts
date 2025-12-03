// lib/api/session.ts
import { supabase } from "@/lib/supabase"
import { CreateSessionDto } from "../dto/session.dto"
import { mapDbSession } from "../mappers/session"

export const sessionsApi = {
  /** -------------------------------------------------------------------------
   * GET ALL SESSIONS (mais recentes primeiro)
   ------------------------------------------------------------------------- */
  async getAll() {
    const { data, error } = await supabase
      .from("sessions")
      .select(`
        id,
        routine_id,
        routine_name,
        started_at,
        finished_at,
        session_exercises (
          id,
          exercise_id,
          exercise_name,
          category,
          position,
          sets (
            id,
            set_index,
            reps,
            weight_kg,
            duration_sec,
            distance_m
          )
        )
      `)
      .order("started_at", { ascending: false })

    if (error) throw error
    return data.map(mapDbSession)
  },

  /** -------------------------------------------------------------------------
   * GET SESSION BY ID (histórico/[id])
   ------------------------------------------------------------------------- */
  async getById(id: string) {
    const { data, error } = await supabase
      .from("sessions")
      .select(`
        id,
        routine_id,
        routine_name,
        started_at,
        finished_at,
        session_exercises (
          id,
          exercise_id,
          exercise_name,
          category,
          position,
          sets (
            id,
            set_index,
            reps,
            weight_kg,
            duration_sec,
            distance_m
          )
        )
      `)
      .eq("id", id)
      .single()

    if (error) throw error
    return mapDbSession(data)
  },

  /** -------------------------------------------------------------------------
   * GET LAST SESSION OF A ROUTINE (para reuso da rotina)
   ------------------------------------------------------------------------- */
  async getLastOfRoutine(routineId: string) {
    const { data, error } = await supabase
      .from("sessions")
      .select(`
        id,
        routine_id,
        routine_name,
        started_at,
        finished_at,
        session_exercises (
          id,
          exercise_id,
          exercise_name,
          category,
          position,
          sets (
            id,
            set_index,
            reps,
            weight_kg,
            duration_sec,
            distance_m
          )
        )
      `)
      .eq("routine_id", routineId)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    if (!data) return null

    return mapDbSession(data)
  },

  /** -------------------------------------------------------------------------
   * CREATE SESSION
   ------------------------------------------------------------------------- */
  async create(dto: CreateSessionDto & { routineName?: string }) {
    // 1) cria sessão
    const { data: session, error: sessionErr } = await supabase
      .from("sessions")
      .insert({
        routine_id: dto.routineId,
        routine_name: dto.routineName ?? null,
        notes: dto.notes ?? null,
        started_at: dto.sessionDate ?? new Date(),
        finished_at: new Date(),
      })
      .select("*")
      .single()

    if (sessionErr) throw sessionErr

    // 2) cria exercises dentro da sessão
    for (const ex of dto.exercises) {
      const { data: exRow, error: exErr } = await supabase
        .from("session_exercises")
        .insert({
          session_id: session.id,
          exercise_id: ex.exerciseId,
          exercise_name: null,
          category: null,
          position: ex.position,
        })
        .select("*")
        .single()

      if (exErr) throw exErr

      const setsPayload = ex.sets.map((s) => ({
        session_exercise_id: exRow.id,
        set_index: s.setIndex,
        reps: s.reps ?? null,
        weight_kg: s.weightKg ?? null,
        duration_sec: s.durationSec ?? null,
        distance_m: s.distanceM ?? null,
      }))

      const { error: setsErr } = await supabase
        .from("sets")
        .insert(setsPayload)

      if (setsErr) throw setsErr
    }

    return true
  },
}
