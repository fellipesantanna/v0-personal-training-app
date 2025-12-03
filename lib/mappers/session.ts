// lib/mappers/session.ts
import { Session } from "../types"

export function mapDbSession(db: any): Session {
  return {
    id: db.id,
    routineId: db.routine_id,
    routineName: db.routine_name ?? "",
    startedAt: db.started_at ? new Date(db.started_at) : new Date(),
    finishedAt: db.finished_at ? new Date(db.finished_at) : new Date(),

    exercises: (db.session_exercises ?? []).map((ex: any) => ({
      id: ex.id,
      exerciseId: ex.exercise_id,
      exerciseName: ex.exercise_name ?? "Exercício",
      category: ex.category ?? "weight-reps",
      position: ex.position ?? 0,

      sets: (ex.sets ?? []).map((s: any) => ({
        id: s.id,
        setIndex: s.set_index,
        reps: s.reps ?? null,
        weightKg: s.weight_kg ?? null,
        durationSec: s.duration_sec ?? null,
        distanceM: s.distance_m ?? null,
      }))
    }))
  }
}
