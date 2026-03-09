// Mock data for Treinos section

// Exercise Library
export const mockExercises = [
  {
    id: "ex_001",
    name: "Supino Reto com Barra",
    description: "Exercício composto para peito, ombros e tríceps",
    video_url: "https://www.youtube.com/embed/rT7DgCr-3pg",
    muscle_group: "chest",
    equipment: "barbell",
    difficulty: "intermediate",
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "ex_002",
    name: "Agachamento Livre",
    description: "Exercício fundamental para quadríceps, glúteos e core",
    video_url: "https://www.youtube.com/embed/ultWZbUMPL8",
    muscle_group: "legs",
    equipment: "barbell",
    difficulty: "intermediate",
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: "ex_003",
    name: "Puxada Frontal",
    description: "Exercício para dorsais e bíceps",
    video_url: "https://www.youtube.com/embed/CAwf7n6Luuc",
    muscle_group: "back",
    equipment: "cable",
    difficulty: "beginner",
    created_at: "2025-01-16T10:00:00Z",
  },
  {
    id: "ex_004",
    name: "Desenvolvimento com Halteres",
    description: "Exercício para ombros",
    video_url: "https://www.youtube.com/embed/qEwKCR5JCog",
    muscle_group: "shoulders",
    equipment: "dumbbell",
    difficulty: "intermediate",
    created_at: "2025-01-17T10:00:00Z",
  },
  {
    id: "ex_005",
    name: "Rosca Direta",
    description: "Exercício isolado para bíceps",
    video_url: "https://www.youtube.com/embed/ykJmrZ5v0Oo",
    muscle_group: "biceps",
    equipment: "barbell",
    difficulty: "beginner",
    created_at: "2025-01-18T10:00:00Z",
  },
  {
    id: "ex_006",
    name: "Tríceps Corda",
    description: "Exercício isolado para tríceps",
    video_url: "https://www.youtube.com/embed/vB5OHsJ3EME",
    muscle_group: "triceps",
    equipment: "cable",
    difficulty: "beginner",
    created_at: "2025-01-18T10:00:00Z",
  },
  {
    id: "ex_007",
    name: "Prancha",
    description: "Exercício isométrico para core",
    video_url: "https://www.youtube.com/embed/ASdvN_XEl_c",
    muscle_group: "core",
    equipment: "bodyweight",
    difficulty: "beginner",
    created_at: "2025-01-19T10:00:00Z",
  },
  {
    id: "ex_008",
    name: "Burpee",
    description: "Exercício de alta intensidade para condicionamento",
    video_url: "https://www.youtube.com/embed/dZgVxmf6jkA",
    muscle_group: "cardio",
    equipment: "bodyweight",
    difficulty: "advanced",
    created_at: "2025-01-20T10:00:00Z",
  },
];

// Workout Templates
export const mockWorkoutTemplates = [
  {
    id: "wt_001",
    name: "Treino A - Push",
    description: "Treino de empurrar: peito, ombros e tríceps",
    pdf_url: null,
    blocks_count: 3,
    exercises_count: 8,
    created_at: "2025-01-20T10:00:00Z",
    blocks: [
      {
        id: "block_001",
        label: "Bloco A",
        type: "single",
        rounds: 1,
        rest_after: 0,
        order: 1,
        exercises: [
          { exercise_id: "ex_001", sets: 4, reps: "10-12", rest: 90, tempo: "3-1-2", notes: "", order: 1 },
        ],
      },
      {
        id: "block_002",
        label: "Bloco B",
        type: "biset",
        rounds: 3,
        rest_after: 60,
        order: 2,
        exercises: [
          { exercise_id: "ex_004", sets: 3, reps: "12", rest: 0, tempo: "", notes: "", order: 1 },
          { exercise_id: "ex_006", sets: 3, reps: "15", rest: 60, tempo: "", notes: "", order: 2 },
        ],
      },
    ],
  },
  {
    id: "wt_002",
    name: "Treino B - Pull",
    description: "Treino de puxar: costas e bíceps",
    pdf_url: null,
    blocks_count: 2,
    exercises_count: 5,
    created_at: "2025-01-21T10:00:00Z",
    blocks: [],
  },
  {
    id: "wt_003",
    name: "Treino C - Legs",
    description: "Treino de pernas completo",
    pdf_url: null,
    blocks_count: 4,
    exercises_count: 10,
    created_at: "2025-01-22T10:00:00Z",
    blocks: [],
  },
];

// Custom Workouts (assigned to students)
export const mockCustomWorkouts = [
  {
    id: "cw_001",
    workout_id: "wt_001",
    workout_name: "Treino A - Push",
    student_id: "st_001",
    student_name: "João Silva",
    start_date: "2025-02-01",
    end_date: "2025-02-28",
    status: "active",
    created_at: "2025-01-25T10:00:00Z",
  },
  {
    id: "cw_002",
    workout_id: "wt_002",
    workout_name: "Treino B - Pull",
    student_id: "st_002",
    student_name: "Maria Santos",
    start_date: "2025-02-01",
    end_date: "2025-03-31",
    status: "active",
    created_at: "2025-01-26T10:00:00Z",
  },
  {
    id: "cw_003",
    workout_id: "wt_003",
    workout_name: "Treino C - Legs",
    student_id: "st_001",
    student_name: "João Silva",
    start_date: "2025-01-01",
    end_date: "2025-01-31",
    status: "expired",
    created_at: "2025-01-01T10:00:00Z",
  },
];

// Mock Students for assignment
export const mockStudents = [
  { id: "st_001", name: "João Silva", email: "joao@email.com" },
  { id: "st_002", name: "Maria Santos", email: "maria@email.com" },
  { id: "st_003", name: "Pedro Costa", email: "pedro@email.com" },
  { id: "st_004", name: "Ana Lima", email: "ana@email.com" },
  { id: "st_005", name: "Carlos Oliveira", email: "carlos@email.com" },
];

// Options for forms
export const muscleGroupOptions = [
  { value: "chest", label: "Peito" },
  { value: "back", label: "Costas" },
  { value: "legs", label: "Pernas" },
  { value: "shoulders", label: "Ombros" },
  { value: "biceps", label: "Bíceps" },
  { value: "triceps", label: "Tríceps" },
  { value: "core", label: "Core" },
  { value: "cardio", label: "Cardio" },
];

export const equipmentOptions = [
  { value: "barbell", label: "Barra" },
  { value: "dumbbell", label: "Halter" },
  { value: "machine", label: "Máquina" },
  { value: "cable", label: "Cabo" },
  { value: "bodyweight", label: "Peso Corporal" },
  { value: "kettlebell", label: "Kettlebell" },
];

export const difficultyOptions = [
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
];

export const blockTypeOptions = [
  { value: "single", label: "Simples" },
  { value: "biset", label: "Biset" },
  { value: "triset", label: "Triset" },
  { value: "circuit", label: "Circuito" },
];

// Helper functions
export const getMuscleGroupLabel = (value) => {
  return muscleGroupOptions.find(o => o.value === value)?.label || value;
};

export const getEquipmentLabel = (value) => {
  return equipmentOptions.find(o => o.value === value)?.label || value;
};

export const getDifficultyLabel = (value) => {
  return difficultyOptions.find(o => o.value === value)?.label || value;
};

export const getBlockTypeLabel = (value) => {
  return blockTypeOptions.find(o => o.value === value)?.label || value;
};

export const getExerciseById = (id) => {
  return mockExercises.find(e => e.id === id);
};
