import { supabase } from "@/lib/supabase";

// ── Opções ──────────────────────────────────────────────────────

export const muscleGroupOptions = [
  { value: "chest",        label: "Peito" },
  { value: "back",         label: "Costas" },
  { value: "legs",         label: "Pernas" },
  { value: "glutes",       label: "Glúteos" },
  { value: "shoulders",    label: "Ombros" },
  { value: "biceps",       label: "Bíceps" },
  { value: "triceps",      label: "Tríceps" },
  { value: "forearms",     label: "Antebraço" },
  { value: "core",         label: "Core / Abdômen" },
  { value: "calves",       label: "Panturrilha" },
  { value: "cardio",       label: "Cardio" },
  { value: "full_body",    label: "Corpo Todo" },
];

export const equipmentOptions = [
  { value: "barbell",         label: "Barra" },
  { value: "dumbbell",        label: "Halter" },
  { value: "cable",           label: "Cabo / Polia" },
  { value: "machine",         label: "Máquina" },
  { value: "bodyweight",      label: "Peso Corporal" },
  { value: "kettlebell",      label: "Kettlebell" },
  { value: "resistance_band", label: "Elástico" },
  { value: "smith",           label: "Smith Machine" },
  { value: "trx",             label: "TRX / Suspensão" },
  { value: "other",           label: "Outro" },
];

export const difficultyOptions = [
  { value: "beginner",     label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced",     label: "Avançado" },
];

export const categoryOptions = [
  { value: "strength",       label: "Força" },
  { value: "hypertrophy",    label: "Hipertrofia" },
  { value: "endurance",      label: "Resistência" },
  { value: "power",          label: "Potência" },
  { value: "flexibility",    label: "Flexibilidade" },
  { value: "rehabilitation", label: "Reabilitação" },
];

export const mechanicsOptions = [
  { value: "compound",  label: "Composto (multi-articular)" },
  { value: "isolation", label: "Isolado (uni-articular)" },
];

export const forceOptions = [
  { value: "push",   label: "Empurrar (Push)" },
  { value: "pull",   label: "Puxar (Pull)" },
  { value: "hinge",  label: "Dobradiça (Hinge)" },
  { value: "squat",  label: "Agachamento (Squat)" },
  { value: "carry",  label: "Carregar (Carry)" },
  { value: "rotate", label: "Rotação" },
  { value: "static", label: "Estático (Isometria)" },
];

export const getLabel = (options, value) =>
  options.find(o => o.value === value)?.label || value || "—";

export const muscleGroupColors = {
  chest:     "bg-red-500/15 text-red-400 border-red-500/30",
  back:      "bg-blue-500/15 text-blue-400 border-blue-500/30",
  legs:      "bg-purple-500/15 text-purple-400 border-purple-500/30",
  glutes:    "bg-pink-500/15 text-pink-400 border-pink-500/30",
  shoulders: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  biceps:    "bg-green-500/15 text-green-400 border-green-500/30",
  triceps:   "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  forearms:  "bg-teal-500/15 text-teal-400 border-teal-500/30",
  core:      "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  calves:    "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  cardio:    "bg-pink-500/15 text-pink-400 border-pink-500/30",
  full_body: "bg-primary/15 text-primary border-primary/30",
};

export const difficultyColors = {
  beginner:     "bg-green-500/15 text-green-400 border-green-500/30",
  intermediate: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  advanced:     "bg-red-500/15 text-red-400 border-red-500/30",
};

// ── CRUD ─────────────────────────────────────────────────────────

export async function getExercises({
  search = "", muscleGroup = "", equipment = "", difficulty = ""
} = {}) {
  let query = supabase
    .from("exercises")
    .select("*")
    .eq("is_active", true)
    .order("title", { ascending: true });

  if (search)      query = query.ilike("title", `%${search}%`);
  if (muscleGroup) query = query.eq("muscle_group", muscleGroup);
  if (equipment)   query = query.eq("equipment", equipment);
  if (difficulty)  query = query.eq("difficulty", difficulty);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// Uma única query — sem roundtrip extra de check
export async function saveExercise(exerciseData) {
  const title = exerciseData.title?.trim();
  if (!title) throw new Error("Nome do exercício é obrigatório");

  const payload = {
    title,
    default_description: exerciseData.default_description || null,
    video_url:           exerciseData.video_url || null,
    thumbnail_url:       exerciseData.thumbnail_url || null,
    muscle_group:        exerciseData.muscle_group || null,
    secondary_muscles:   exerciseData.secondary_muscles || [],
    equipment:           exerciseData.equipment || null,
    difficulty:          exerciseData.difficulty || null,
    category:            exerciseData.category || null,
    mechanics:           exerciseData.mechanics || null,
    force:               exerciseData.force || null,
    instructions:        exerciseData.instructions || null,
    tips:                exerciseData.tips || null,
    tags:                exerciseData.tags || [],
    is_active:           true,
  };

  let data, error;

  if (exerciseData.id) {
    ({ data, error } = await supabase
      .from("exercises")
      .update(payload)
      .eq("id", exerciseData.id)
      .select()
      .single());
  } else {
    ({ data, error } = await supabase
      .from("exercises")
      .insert(payload)
      .select()
      .single());
  }

  if (error) {
    // Postgres unique violation — código 23505
    if (error.code === "23505") {
      throw new Error(`Já existe um exercício com o nome "${title}"`);
    }
    throw error;
  }

  return data;
}

export async function deleteExercise(id) {
  const { error } = await supabase
    .from("exercises")
    .update({ is_active: false })
    .eq("id", id);
  if (error) throw error;
}