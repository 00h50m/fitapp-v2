import React, { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Dumbbell, 
  Search, 
  Plus, 
  MoreHorizontal,
  Play,
  Clock,
  Layers,
  Repeat,
  Eye,
  Edit,
  Trash2,
  Video,
  FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Mock exercises data
const mockExercises = [
  {
    id: "1",
    name: "Supino Reto com Barra",
    muscle_group: "Peito",
    sets: 4,
    reps: "10-12",
    rest_seconds: 90,
    has_video: true,
    has_notes: true,
  },
  {
    id: "2",
    name: "Agachamento Livre",
    muscle_group: "Pernas",
    sets: 4,
    reps: "8-10",
    rest_seconds: 120,
    has_video: true,
    has_notes: true,
  },
  {
    id: "3",
    name: "Puxada Frontal",
    muscle_group: "Costas",
    sets: 4,
    reps: "10-12",
    rest_seconds: 90,
    has_video: false,
    has_notes: true,
  },
  {
    id: "4",
    name: "Desenvolvimento com Halteres",
    muscle_group: "Ombros",
    sets: 4,
    reps: "10-12",
    rest_seconds: 90,
    has_video: true,
    has_notes: false,
  },
  {
    id: "5",
    name: "Rosca Direta",
    muscle_group: "Bíceps",
    sets: 3,
    reps: "12-15",
    rest_seconds: 60,
    has_video: true,
    has_notes: true,
  },
  {
    id: "6",
    name: "Tríceps Corda",
    muscle_group: "Tríceps",
    sets: 3,
    reps: "12-15",
    rest_seconds: 60,
    has_video: false,
    has_notes: true,
  },
  {
    id: "7",
    name: "Leg Press 45°",
    muscle_group: "Pernas",
    sets: 4,
    reps: "10-12",
    rest_seconds: 90,
    has_video: true,
    has_notes: true,
  },
  {
    id: "8",
    name: "Crucifixo na Máquina",
    muscle_group: "Peito",
    sets: 3,
    reps: "12-15",
    rest_seconds: 60,
    has_video: true,
    has_notes: false,
  },
];

const muscleGroupColors = {
  "Peito": "bg-red-500/10 text-red-400 border-red-500/30",
  "Costas": "bg-blue-500/10 text-blue-400 border-blue-500/30",
  "Pernas": "bg-purple-500/10 text-purple-400 border-purple-500/30",
  "Ombros": "bg-orange-500/10 text-orange-400 border-orange-500/30",
  "Bíceps": "bg-green-500/10 text-green-400 border-green-500/30",
  "Tríceps": "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
};

const ExerciseCard = ({ exercise }) => {
  const colorClass = muscleGroupColors[exercise.muscle_group] || "bg-muted text-muted-foreground";

  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-all group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <Badge className={cn("text-xs border", colorClass)}>
                {exercise.muscle_group}
              </Badge>
              {exercise.has_video && (
                <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center">
                  <Video className="h-3 w-3 text-primary" />
                </div>
              )}
              {exercise.has_notes && (
                <div className="h-5 w-5 rounded bg-muted flex items-center justify-center">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Name */}
            <h3 className="font-semibold text-foreground truncate mb-3">
              {exercise.name}
            </h3>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" />
                <span>{exercise.sets} séries</span>
              </div>
              <div className="flex items-center gap-1">
                <Repeat className="h-3.5 w-3.5" />
                <span>{exercise.reps} reps</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{exercise.rest_seconds}s</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Eye className="h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <Edit className="h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                <Trash2 className="h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
};

const ExerciciosPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("Todos");
  const [exercises] = useState(mockExercises);

  const muscleGroups = ["Todos", ...new Set(exercises.map(e => e.muscle_group))];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === "Todos" || exercise.muscle_group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-primary" />
              Exercícios
            </h1>
            <p className="text-muted-foreground mt-1">
              Biblioteca de exercícios disponíveis para os treinos
            </p>
          </div>
          <Button variant="premium" className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Novo Exercício
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{exercises.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {exercises.filter(e => e.has_video).length}
              </p>
              <p className="text-xs text-muted-foreground">Com Vídeo</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {muscleGroups.length - 1}
              </p>
              <p className="text-xs text-muted-foreground">Grupos Musculares</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {exercises.filter(e => e.has_notes).length}
              </p>
              <p className="text-xs text-muted-foreground">Com Instruções</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar exercício..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-muted border-border"
                />
              </div>

              {/* Muscle Group Filter */}
              <div className="flex flex-wrap gap-2">
                {muscleGroups.map((group) => (
                  <Button
                    key={group}
                    variant={selectedGroup === group ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedGroup(group)}
                    className={cn(
                      selectedGroup === group && "bg-primary text-primary-foreground"
                    )}
                  >
                    {group}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredExercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>

        {filteredExercises.length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">Nenhum exercício encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default ExerciciosPage;
