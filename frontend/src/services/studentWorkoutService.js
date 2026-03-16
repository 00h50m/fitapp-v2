import { supabase } from "@/lib/supabase";

export async function getStudentWorkouts() {
  const { data, error } = await supabase
    .from("student_workouts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const studentIds = [...new Set(data.map(w => w.student_id).filter(Boolean))];
  const templateIds = [...new Set(data.map(w => w.template_id).filter(Boolean))];

  const [profilesRes, templatesRes] = await Promise.all([
    studentIds.length
      ? supabase.from("profiles").select("id, user_id, name").in("user_id", studentIds)
      : Promise.resolve({ data: [], error: null }),
    templateIds.length
      ? supabase.from("workout_templates").select("id, title").in("id", templateIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  // student_id pode ser user_id ou profiles.id — mapeia por ambos
  const profileMap = {};
  (profilesRes.data || []).forEach(p => {
    if (p.id)      profileMap[p.id]      = p.name;
    if (p.user_id) profileMap[p.user_id] = p.name;
  });
  const templateMap = Object.fromEntries((templatesRes.data || []).map(t => [t.id, t.title]));

  return data.map(w => ({
    ...w,
    student_name: profileMap[w.student_id] || "Aluno",
    workout_name: w.title || templateMap[w.template_id] || "Treino",
  }));
}

export async function createStudentWorkout(payload) {
  // Remove campos virtuais que nao existem na tabela
  const { student_name, workout_name, ...dbPayload } = payload;

  const { data, error } = await supabase
    .from("student_workouts")
    .insert([dbPayload])
    .select()
    .single();

  if (error) throw error;

  return {
    ...data,
    student_name: student_name || "Aluno",
    workout_name: data.title || "Treino",
  };
}

export async function updateStudentWorkout(id, payload) {
  // Remove campos virtuais e envia so colunas reais da tabela
  const { student_name, workout_name, ...rest } = payload;

  const safePayload = {
    ...(rest.start_date !== undefined && { start_date: rest.start_date }),
    ...(rest.end_date !== undefined && { end_date: rest.end_date }),
    ...(rest.status !== undefined && { status: rest.status }),
    ...(rest.title !== undefined && { title: rest.title }),
    ...(rest.description !== undefined && { description: rest.description }),
    ...(rest.pdf_url !== undefined && { pdf_url: rest.pdf_url }),
  };

  // Sem .select() para evitar body stream already read
  const { error } = await supabase
    .from("student_workouts")
    .update(safePayload)
    .eq("id", id);

  if (error) throw error;

  // Busca os dados atualizados em query separada
  const { data } = await supabase
    .from("student_workouts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return {
    ...(data || { id }),
    student_name: student_name || "Aluno",
    workout_name: data?.title || payload.title || "Treino",
  };
}

export async function deleteStudentWorkout(id) {
  const { error } = await supabase
    .from("student_workouts")
    .delete()
    .eq("id", id);

  if (error) throw error;
}