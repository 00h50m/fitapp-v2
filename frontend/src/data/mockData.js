// Mock data for fitness app prototype
// This data simulates what would come from Supabase

export const mockStudent = {
  id: "student_001",
  name: "João Silva",
  email: "joao@email.com",
  avatar_url: null,
  access_start: "2025-01-01",
  access_end: "2025-12-31", // Change to past date to test inactive state
  created_at: "2025-01-01T10:00:00Z",
};

export const mockStudentInactive = {
  ...mockStudent,
  access_end: "2024-12-31", // Expired access
};

export const mockCurrentWorkout = {
  id: "workout_001",
  name: "Treino A - Superior",
  description: "Foco em peito, ombros e tríceps",
  pdf_url: "https://example.com/treino-a.pdf",
  created_at: "2025-01-15T10:00:00Z",
  exercises: [
    {
      id: "ex_001",
      name: "Supino Reto com Barra",
      sets: 4,
      reps: "10-12",
      rest_seconds: 90,
      video_url: null, // Placeholder for video
      notes: "Manter cotovelos a 45 graus",
      order: 1,
    },
    {
      id: "ex_002",
      name: "Supino Inclinado com Halteres",
      sets: 4,
      reps: "10-12",
      rest_seconds: 90,
      video_url: null,
      notes: "Controle na descida",
      order: 2,
    },
    {
      id: "ex_003",
      name: "Crucifixo na Máquina",
      sets: 3,
      reps: "12-15",
      rest_seconds: 60,
      video_url: null,
      notes: "Foco na contração do peitoral",
      order: 3,
    },
    {
      id: "ex_004",
      name: "Desenvolvimento com Halteres",
      sets: 4,
      reps: "10-12",
      rest_seconds: 90,
      video_url: null,
      notes: "Não bloquear os cotovelos no topo",
      order: 4,
    },
    {
      id: "ex_005",
      name: "Elevação Lateral",
      sets: 4,
      reps: "12-15",
      rest_seconds: 60,
      video_url: null,
      notes: "Manter leve flexão nos cotovelos",
      order: 5,
    },
    {
      id: "ex_006",
      name: "Tríceps Corda",
      sets: 4,
      reps: "12-15",
      rest_seconds: 60,
      video_url: null,
      notes: "Abrir a corda no final do movimento",
      order: 6,
    },
    {
      id: "ex_007",
      name: "Tríceps Testa",
      sets: 3,
      reps: "10-12",
      rest_seconds: 60,
      video_url: null,
      notes: "Manter cotovelos fixos",
      order: 7,
    },
  ],
};

export const mockWorkoutCheckins = [
  {
    id: "checkin_001",
    workout_id: "workout_001",
    student_id: "student_001",
    completed_at: "2025-01-20T18:30:00Z",
    exercises_completed: ["ex_001", "ex_002", "ex_003", "ex_004", "ex_005", "ex_006", "ex_007"],
  },
  {
    id: "checkin_002",
    workout_id: "workout_001",
    student_id: "student_001",
    completed_at: "2025-01-18T17:45:00Z",
    exercises_completed: ["ex_001", "ex_002", "ex_003", "ex_004", "ex_005", "ex_006", "ex_007"],
  },
];

// Exercise icons mapping (using Lucide icon names)
export const exerciseIcons = {
  "Supino": "dumbbell",
  "Crucifixo": "move-horizontal",
  "Desenvolvimento": "trending-up",
  "Elevação": "arrow-up",
  "Tríceps": "zap",
  "Agachamento": "arrow-down-to-line",
  "Leg Press": "square",
  "default": "activity",
};

// Get icon for exercise based on name
export const getExerciseIcon = (exerciseName) => {
  for (const [key, icon] of Object.entries(exerciseIcons)) {
    if (exerciseName.toLowerCase().includes(key.toLowerCase())) {
      return icon;
    }
  }
  return exerciseIcons.default;
};
