import { supabase } from "@/lib/supabase";

export async function getStudentWorkouts() {
  const { data, error } = await supabase
    .from("student_workouts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  // Busca nomes dos alunos e templates em paralelo (evita FK join problemático)
  const studentIds = [...new Set(data.map(w => w.student_id).filter(Boolean))];
  const templateIds = [...new Set(data.map(w => w.template_id).filter(Boolean))];

  const [profilesRes, templatesRes] = await Promise.all([
    studentIds.length
      ? supabase.from("profiles").select("id, name").in("id", studentIds)
      : Promise.resolve({ data: [], error: null }),
    templateIds.length
      ? supabase.from("workout_templates").select("id, title").in("id", templateIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const profileMap = Object.fromEntries((profilesRes.data || []).map(p => [p.id, p.name]));
  const templateMap = Object.fromEntries((templatesRes.data || []).map(t => [t.id, t.title]));

  return data.map(w => ({
    ...w,
    student_name: profileMap[w.student_id] || "Aluno",
    workout_name: w.title || templateMap[w.template_id] || "Treino",
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

  return {
    ...data,
    student_name: payload.student_name || "Aluno",
    workout_name: data.title || "Treino",
  };
}

export async function updateStudentWorkout(id, payload) {
  const { data, error } = await supabase
    .from("student_workouts")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    student_name: payload.student_name || "Aluno",
    workout_name: data.title || "Treino",
  };
}

export async function deleteStudentWorkout(id) {
  const { error } = await supabase
    .from("student_workouts")
    .delete()
    .eq("id", id);

  if (error) throw error;
}