// =========================
// Categorias de exercício
// =========================
export type ExerciseCategory =
  | "peso_reps"
  | "corpo_livre"
  | "duracao"
  | "distancia_duracao";

export interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  createdAt: Date
  userId: string

  // SUGESTÕES
  suggestedReps?: number | null
  suggestedWeight?: number | null
  suggestedTime?: number | null
  suggestedDistance?: number | null
}

// DTO para criar/editar exercício
export interface SaveExerciseDto {
  name: string
  category: ExerciseCategory
}

// =========================
// Rotina (domínio)
// =========================
export interface Routine {
  id: string
  name: string
  createdAt: Date
  userId: string
  exercises: RoutineExercise[]
}

export interface RoutineExercise {
  id: string
  exerciseId: string
  position: number
  suggestedSets?: number
  suggestedReps?: number
  advancedTechnique?: string
}

// DTO para criar rotina
export interface CreateRoutineDto {
  name: string
  exercises: {
    exerciseId: string
    position: number
    suggestedSets?: number
    suggestedReps?: number
    advancedTechnique?: string
  }[]
}

// =========================
// Sessões
// =========================
export interface WorkoutSet {
  id: string
  setIndex: number
  reps?: number
  weightKg?: number
  durationSec?: number
  distanceM?: number
}

export interface SessionExercise {
  id: string
  exerciseId: string
  exerciseName: string
  category: ExerciseCategory
  position: number
  sets: WorkoutSet[]
}

export interface Session {
  id: string
  routineId: string
  routineName: string
  startedAt: Date
  finishedAt: Date
  exercises: SessionExercise[]
}

// DTO para criar sessão
export interface CreateSessionDto {
  routineId: string
  routineName: string
  startedAt: Date
  finishedAt: Date
  exercises: {
    exerciseId: string
    position: number
    sets: WorkoutSet[]
  }[]
}
