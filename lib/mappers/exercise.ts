import { Exercise } from "@/lib/types";

export function mapDbExercise(row: any): Exercise {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    createdAt: new Date(row.created_at),
    userId: row.user_id,

    suggestedReps: row.suggested_reps,
    suggestedWeight: row.suggested_weight,
    suggestedTime: row.suggested_time,
    suggestedDistance: row.suggested_distance
  };
}

export function toDbExercisePayload(ex: Partial<Exercise>) {
  return {
    name: ex.name,
    category: ex.category,
    user_id: ex.userId,

    suggested_reps: ex.suggestedReps ?? null,
    suggested_weight: ex.suggestedWeight ?? null,
    suggested_time: ex.suggestedTime ?? null,
    suggested_distance: ex.suggestedDistance ?? null,
  };
}
