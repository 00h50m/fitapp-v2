import { supabase } from "@/lib/supabase";

// A tabela exercises tem: id, title, default_description, video_url, is_active, created_at

export async function getExercises() {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .eq("is_active", true)
    .order("title", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createExercise({ title, description, video_url }) {
  const { data, error } = await supabase
    .from("exercises")
    .insert([{
      title,
      default_description: description || "",
      video_url: video_url || "",
      is_active: true,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateExercise(id, { title, description, video_url }) {
  const { data, error } = await supabase
    .from("exercises")
    .update({
      title,
      default_description: description || "",
      video_url: video_url || "",
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteExercise(id) {
  // Soft delete — mantém histórico em treinos existentes
  const { error } = await supabase
    .from("exercises")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw error;
}