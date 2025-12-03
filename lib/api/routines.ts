import { supabase } from "@/lib/supabase";
import { mapDbRoutine, toDbRoutinePayload } from "@/lib/mappers/routine";

export const routinesApi = {
  async getAll() {
    const { data, error } = await supabase
      .from("routines")
      .select(`
      id,
      name,
      created_at,
      user_id,
      routine_exercises (
        id,
        exercise_id,
        position,
        suggested_sets,
        suggested_reps,
        advanced_technique
      )
    `)
      .order("created_at", { ascending: false })

    if (error) throw error
    return data.map(mapDbRoutine)
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from("routines")
      .select(`
      id,
      name,
      created_at,
      user_id,
      routine_exercises (
        id,
        exercise_id,
        position,
        suggested_sets,
        suggested_reps,
        advanced_technique
      )
    `)
      .eq("id", id)
      .single()

    if (error) throw error
    return mapDbRoutine(data)
  },

  async create(input: any) {
    const payload = toDbRoutinePayload(input);

    const { data, error } = await supabase
      .from("routines")
      .insert(payload)
      .select(`
        id,
        name,
        created_at,
        user_id,
        exercises:routine_exercises (*)
      `)
      .single();

    if (error) throw error;
    return mapDbRoutine(data);
  }
};
