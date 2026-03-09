import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  ClipboardList, 
  Search, 
  Plus, 
  MoreHorizontal,
  Edit,
  Trash2,
  Layers,
  Dumbbell,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { mockWorkoutTemplates } from "@/data/mockTreinosData";

const WorkoutsPage = () => {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState(mockWorkoutTemplates);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteWorkout, setDeleteWorkout] = useState(null);

  // Filter workouts
  const filteredWorkouts = workouts.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Handle delete
  const handleDelete = () => {
    if (deleteWorkout) {
      setWorkouts(prev => prev.filter(w => w.id !== deleteWorkout.id));
      toast.success("Treino excluído com sucesso!");
      setDeleteWorkout(null);
    }
  };

  // Handle edit
  const handleEdit = (workout) => {
    navigate(`/admin/treinos/editor/${workout.id}`);
  };

  // Handle new
  const handleNew = () => {
    navigate("/admin/treinos/editor/new");
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <ClipboardList className="h-6 w-6 text-primary" />
              Treinos Padrão
            </h1>
            <p className="text-muted-foreground mt-1">
              Templates de treino reutilizáveis
            </p>
          </div>
          <Button variant="premium" className="gap-2" onClick={handleNew}>
            <Plus className="h-4 w-4" />
            Novo Treino
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{workouts.length}</p>
              <p className="text-xs text-muted-foreground">Total de Treinos</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {workouts.reduce((sum, w) => sum + (w.blocks_count || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total de Blocos</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">
                {workouts.reduce((sum, w) => sum + (w.exercises_count || 0), 0)}
              </p>
              <p className="text-xs text-muted-foreground">Total de Exercícios</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg font-display">
                Lista de Treinos
              </CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar treino..."
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
                    <TableHead className="text-muted-foreground">Nome do Treino</TableHead>
                    <TableHead className="text-muted-foreground hidden md:table-cell">Blocos</TableHead>
                    <TableHead className="text-muted-foreground hidden md:table-cell">Exercícios</TableHead>
                    <TableHead className="text-muted-foreground hidden lg:table-cell">Criado em</TableHead>
                    <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkouts.map((workout) => (
                    <TableRow key={workout.id} className="border-border hover:bg-muted/50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-foreground">{workout.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-[250px]">
                            {workout.description || "Sem descrição"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Layers className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{workout.blocks_count}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <Dumbbell className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{workout.exercises_count}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formatDate(workout.created_at)}</span>
                        </div>
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
                              onClick={() => handleEdit(workout)}
                            >
                              <Edit className="h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem 
                              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                              onClick={() => setDeleteWorkout(workout)}
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

            {filteredWorkouts.length === 0 && (
              <div className="py-12 text-center">
                <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhum treino encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteWorkout} onOpenChange={() => setDeleteWorkout(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Excluir treino?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteWorkout?.name}"? Esta ação não pode ser desfeita.
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

export default WorkoutsPage;
