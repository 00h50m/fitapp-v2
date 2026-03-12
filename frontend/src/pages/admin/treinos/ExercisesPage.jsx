import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Video,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  getExercises,
  deleteExercise,
} from "@/services/exercisesService";
import ExerciseFormModal from "@/components/treinos/ExerciseFormModal";

const ExercisesPage = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Carrega exercícios do banco
  const loadExercises = async () => {
    setLoading(true);
    try {
      const data = await getExercises();
      setExercises(data);
    } catch (err) {
      toast.error("Erro ao carregar exercícios: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExercises();
  }, []);

  // Filtra pelo termo de busca
  const filteredExercises = exercises.filter(ex =>
    ex.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.default_description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Callback do modal após salvar — recarrega do banco
  const handleSave = (savedExercise) => {
    if (editingExercise) {
      setExercises(prev => prev.map(ex => ex.id === savedExercise.id ? savedExercise : ex));
    } else {
      setExercises(prev => [savedExercise, ...prev]);
    }
    setEditingExercise(null);
  };

  // Excluir (soft delete)
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteExercise(deleteTarget.id);
      setExercises(prev => prev.filter(ex => ex.id !== deleteTarget.id));
      toast.success("Exercício excluído!");
      setDeleteTarget(null);
    } catch (err) {
      toast.error("Erro ao excluir: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (exercise) => {
    setEditingExercise(exercise);
    setShowModal(true);
  };

  const handleNew = () => {
    setEditingExercise(null);
    setShowModal(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
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
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{exercises.length}</p>
              <p className="text-xs text-muted-foreground">Total de Exercícios</p>
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
        </div>

        {/* Tabela */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg font-display">Lista de Exercícios</CardTitle>
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
            {loading ? (
              <div className="py-16 flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                Carregando exercícios...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Exercício</TableHead>
                      <TableHead className="text-muted-foreground hidden md:table-cell">Vídeo</TableHead>
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
                              {exercise.video_url
                                ? <Video className="h-5 w-5" />
                                : <Dumbbell className="h-5 w-5" />
                              }
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{exercise.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">
                                {exercise.default_description || "Sem descrição"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {exercise.video_url ? (
                            <a
                              href={exercise.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline flex items-center gap-1"
                            >
                              <Video className="h-3.5 w-3.5" />
                              Ver vídeo
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
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
                                onClick={() => setDeleteTarget(exercise)}
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

                {filteredExercises.length === 0 && (
                  <div className="py-12 text-center">
                    <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      {searchTerm ? "Nenhum exercício encontrado" : "Nenhum exercício cadastrado"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ExerciseFormModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingExercise(null);
        }}
        exercise={editingExercise}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Excluir exercício?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteTarget?.title}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default ExercisesPage;