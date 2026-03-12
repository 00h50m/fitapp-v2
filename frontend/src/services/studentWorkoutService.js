import { supabase } from "@/lib/supabase";

export async function getStudentWorkouts() {
  const { data, error } = await supabase
    .from("student_workouts")
    .select(`
      *,
      profiles!student_id(name),
      workout_templates!template_id(title)
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data.map(w => ({
    ...w,
    student_name: w.profiles?.name || "Aluno",
    workout_name: w.workout_templates?.title || "Treino"
  }));
}

export async function createStudentWorkout(payload) {

  console.log("PAYLOAD INSERT:", payload);

  const { data, error } = await supabase
    .from("student_workouts")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function updateStudentWorkout(id, payload) {
  const { data, error } = await supabase
    .from("student_workouts")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function deleteStudentWorkout(id) {
  const { error } = await supabase
    .from("student_workouts")
    .delete()
    .eq("id", id);

  if (error) throw error;
}