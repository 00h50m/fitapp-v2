import React, { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Dumbbell, 
  Search, 
  Plus, 
  MoreHorizontal,
  Edit,
  Trash2,
  Video
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  mockExercises, 
  getMuscleGroupLabel, 
  getEquipmentLabel,
  getDifficultyLabel 
} from "@/data/mockTreinosData";
import ExerciseFormModal from "@/components/treinos/ExerciseFormModal";

// Difficulty badge colors
const difficultyColors = {
  beginner: "bg-success/15 text-success border-success/30",
  intermediate: "bg-warning/15 text-warning border-warning/30",
  advanced: "bg-destructive/15 text-destructive border-destructive/30",
};

// Muscle group badge colors
const muscleGroupColors = {
  chest: "bg-red-500/15 text-red-400 border-red-500/30",
  back: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  legs: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  shoulders: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  biceps: "bg-green-500/15 text-green-400 border-green-500/30",
  triceps: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  core: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  cardio: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

const ExercisesPage = () => {
  const [exercises, setExercises] = useState(mockExercises);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [deleteExercise, setDeleteExercise] = useState(null);

  // Filter exercises
  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getMuscleGroupLabel(ex.muscle_group).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle save
  const handleSave = (exerciseData) => {
    if (editingExercise) {
      setExercises(prev => prev.map(ex => 
        ex.id === exerciseData.id ? exerciseData : ex
      ));
      toast.success("Exercício atualizado com sucesso!");
    } else {
      setExercises(prev => [exerciseData, ...prev]);
      toast.success("Exercício criado com sucesso!");
    }
    setEditingExercise(null);
  };

  // Handle delete
  const handleDelete = () => {
    if (deleteExercise) {
      setExercises(prev => prev.filter(ex => ex.id !== deleteExercise.id));
      toast.success("Exercício excluído com sucesso!");
      setDeleteExercise(null);
    }
  };

  // Open edit modal
  const handleEdit = (exercise) => {
    setEditingExercise(exercise);
    setShowModal(true);
  };

  // Open new modal
  const handleNew = () => {
    setEditingExercise(null);
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-primary" />
              Biblioteca de Exercícios
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os exercícios disponíveis para os treinos
            </p>
          </div>
          <Button variant="premium" className="gap-2" onClick={handleNew}>
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
                {exercises.filter(e => e.video_url).length}
              </p>
              <p className="text-xs text-muted-foreground">Com Vídeo</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {new Set(exercises.map(e => e.muscle_group)).size}
              </p>
              <p className="text-xs text-muted-foreground">Grupos Musculares</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {new Set(exercises.map(e => e.equipment)).size}
              </p>
              <p className="text-xs text-muted-foreground">Equipamentos</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg font-display">
                Lista de Exercícios
              </CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar exercício..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-muted border-border"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Exercício</TableHead>
                    <TableHead className="text-muted-foreground hidden md:table-cell">Grupo Muscular</TableHead>
                    <TableHead className="text-muted-foreground hidden lg:table-cell">Equipamento</TableHead>
                    <TableHead className="text-muted-foreground hidden sm:table-cell">Dificuldade</TableHead>
                    <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredExercises.map((exercise) => (
                    <TableRow key={exercise.id} className="border-border hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center",
                            "bg-primary/10 text-primary"
                          )}>
                            {exercise.video_url ? (
                              <Video className="h-5 w-5" />
                            ) : (
                              <Dumbbell className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{exercise.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                              {exercise.description || "Sem descrição"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge className={cn("border", muscleGroupColors[exercise.muscle_group])}>
                          {getMuscleGroupLabel(exercise.muscle_group)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm text-foreground">
                          {getEquipmentLabel(exercise.equipment)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className={cn("border", difficultyColors[exercise.difficulty])}>
                          {getDifficultyLabel(exercise.difficulty)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem 
                              className="gap-2 cursor-pointer"
                              onClick={() => handleEdit(exercise)}
                            >
                              <Edit className="h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem 
                              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                              onClick={() => setDeleteExercise(exercise)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredExercises.length === 0 && (
              <div className="py-12 text-center">
                <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhum exercício encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Exercise Form Modal */}
      <ExerciseFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingExercise(null);
        }}
        exercise={editingExercise}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteExercise} onOpenChange={() => setDeleteExercise(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Excluir exercício?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteExercise?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default ExercisesPage;
