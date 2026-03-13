import { supabase } from "@/lib/supabase";
import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  UserCog, Search, Plus, MoreHorizontal, Edit, Trash2,
  Calendar, User, ClipboardList, CheckCircle2, XCircle, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import AssignWorkoutModal from "@/components/treinos/AssignWorkoutModal";
import {
  getStudentWorkouts,
  createStudentWorkout,
  deleteStudentWorkout,
} from "@/services/studentWorkoutService";

const statusStyles = {
  active:  { variant: "success",     label: "Ativo",    icon: CheckCircle2 },
  expired: { variant: "destructive", label: "Expirado", icon: XCircle },
  pending: { variant: "warning",     label: "Pendente", icon: Clock },
  inactive:{ variant: "secondary",   label: "Inativo",  icon: Clock },
};

const CustomWorkoutsPage = () => {
  const [customWorkouts, setCustomWorkouts] = useState([]);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [deleteWorkout, setDeleteWorkout] = useState(null);

  useEffect(() => { loadWorkouts(); }, []);

  async function loadWorkouts() {
    try {
      const data = await getStudentWorkouts();
      setCustomWorkouts(data);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao carregar treinos");
    }
  }

  const filteredWorkouts = customWorkouts.filter(w =>
    (w.student_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (w.workout_name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  // O AssignWorkoutModal já faz o save no Supabase e devolve o objeto pronto
  const handleSaveAssignment = async (savedWorkout) => {
    if (editingWorkout) {
      // Modo edição: substitui na lista local com o objeto já salvo
      setCustomWorkouts(prev =>
        prev.map(w => w.id === savedWorkout.id ? savedWorkout : w)
      );
      toast.success("Treino atualizado!");
    } else {
      // Modo criação: desativa anteriores do mesmo aluno na lista local
      if (savedWorkout.student_id) {
        await supabase
          .from("student_workouts")
          .update({ status: "inactive" })
          .eq("student_id", savedWorkout.student_id)
          .eq("status", "active")
          .neq("id", savedWorkout.id);

        setCustomWorkouts(prev =>
          prev.map(w =>
            w.student_id === savedWorkout.student_id && w.status === "active" && w.id !== savedWorkout.id
              ? { ...w, status: "inactive" }
              : w
          )
        );
      }
      setCustomWorkouts(prev => [savedWorkout, ...prev]);
      toast.success("Treino atribuído com sucesso!");
    }
    setEditingWorkout(null);
  };

  const handleDelete = async () => {
    if (!deleteWorkout) return;
    try {
      await deleteStudentWorkout(deleteWorkout.id);
      setCustomWorkouts(prev => prev.filter(w => w.id !== deleteWorkout.id));
      toast.success("Treino excluído!");
      setDeleteWorkout(null);
    } catch (error) {
      console.error(error);
      toast.error("Erro ao excluir treino");
    }
  };

  const activeCount  = customWorkouts.filter(w => w.status === "active").length;
  const expiredCount = customWorkouts.filter(w => w.status === "expired").length;

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <UserCog className="h-6 w-6 text-primary" />
              Treinos Personalizados
            </h1>
            <p className="text-muted-foreground mt-1">Treinos atribuídos a alunos específicos</p>
          </div>
          <Button variant="premium" className="gap-2" onClick={() => { setEditingWorkout(null); setShowAssignModal(true); }}>
            <Plus className="h-4 w-4" />
            Criar Treino Personalizado
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{customWorkouts.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-success">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Ativos</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-destructive">{expiredCount}</p>
              <p className="text-xs text-muted-foreground">Expirados</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg font-display">Treinos Atribuídos</CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por aluno ou treino..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
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
                    <TableHead className="text-muted-foreground">Treino</TableHead>
                    <TableHead className="text-muted-foreground">Aluno</TableHead>
                    <TableHead className="text-muted-foreground hidden md:table-cell">Data Início</TableHead>
                    <TableHead className="text-muted-foreground hidden md:table-cell">Data Fim</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkouts.map(workout => {
                    const statusInfo = statusStyles[workout.status] || statusStyles.pending;
                    const StatusIcon = statusInfo.icon;
                    return (
                      <TableRow key={workout.id} className="border-border hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <ClipboardList className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium text-foreground">{workout.workout_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <span className="text-foreground">{workout.student_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(workout.start_date)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(workout.end_date)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant} className="gap-1">
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
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
                                onClick={() => { setEditingWorkout(workout); setShowAssignModal(true); }}
                              >
                                <Edit className="h-4 w-4" />Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-border" />
                              <DropdownMenuItem
                                className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                onClick={() => setDeleteWorkout(workout)}
                              >
                                <Trash2 className="h-4 w-4" />Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {filteredWorkouts.length === 0 && (
              <div className="py-12 text-center">
                <UserCog className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhum treino personalizado encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AssignWorkoutModal
        isOpen={showAssignModal}
        workout={editingWorkout}
        onClose={() => { setShowAssignModal(false); setEditingWorkout(null); }}
        onSave={handleSaveAssignment}
      />

      <AlertDialog open={!!deleteWorkout} onOpenChange={() => setDeleteWorkout(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Excluir atribuição?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteWorkout?.workout_name}" de {deleteWorkout?.student_name}? Esta ação não pode ser desfeita.
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

export default CustomWorkoutsPage;