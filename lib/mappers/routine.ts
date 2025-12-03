import { Routine, RoutineExercise } from "@/lib/types";

export function mapDbRoutine(db: any) {
  return {
    id: db.id,
    name: db.name,
    createdAt: db.created_at,
    userId: db.user_id,

    exercises: (db.routine_exercises ?? []).map((ex: any) => ({
      id: ex.id,
      exerciseId: ex.exercise_id,
      position: ex.position,
      suggestedSets: ex.suggested_sets ?? null,
      suggestedReps: ex.suggested_reps ?? null,
      advancedTechnique: ex.advanced_technique ?? ""
    }))
  }
}

function mapDbRoutineExercise(row: any): RoutineExercise {
  return {
    id: row.id,
    exerciseId: row.exercise_id,
    position: row.position ?? 0,
    suggestedSets: row.suggested_sets ?? null,
    suggestedReps: row.suggested_reps ?? null,
    advancedTechnique: row.advanced_technique ?? ""
  };
}

export function toDbRoutinePayload(routine: any) {
  return {
    name: routine.name,
    user_id: routine.userId,
    exercises: routine.exercises.map((e: any) => ({
      exercise_id: e.exerciseId,
      position: e.position,
      suggested_sets: e.suggestedSets ?? null,
      suggested_reps: e.suggestedReps ?? null,
      advanced_technique: e.advancedTechnique ?? "",
    }))
  };
}
