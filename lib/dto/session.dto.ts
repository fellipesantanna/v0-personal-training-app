// lib/dto/session.dto.ts

export interface SessionSetInput {
  setIndex: number
  weightKg?: number | null
  reps?: number | null
  durationSec?: number | null
  distanceM?: number | null
}

export interface SessionExerciseInput {
  exerciseId: string
  position: number
  sets: SessionSetInput[]
}

export interface CreateSessionDto {
  routineId: string
  routineName?: string | null
  notes?: string | null
  sessionDate?: Date | null
  exercises: SessionExerciseInput[]
}
