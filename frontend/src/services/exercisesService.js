import { supabase } from "@/lib/supabase";

export async function getExercises() {
  const { data, error } = await supabase
    .from("exercises")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Erro ao buscar exercícios:", error);
    return [];
  }

  return data ?? [];
}