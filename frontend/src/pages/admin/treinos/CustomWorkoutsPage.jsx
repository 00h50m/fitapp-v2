import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  UserCog, Search, Plus, MoreHorizontal,
  Trash2, Calendar, User, ClipboardList,
  CheckCircle2, XCircle, Clock, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import AssignWorkoutModal from "@/components/treinos/AssignWorkoutModal";

const statusStyles = {
  active:  { variant: "success",     label: "Ativo",    icon: CheckCircle2 },
  expired: { variant: "destructive", label: "Expirado", icon: XCircle },
  pending: { variant: "warning",     label: "Pendente", icon: Clock },
};

const CustomWorkoutsPage = () => {
  const [customWorkouts, setCustomWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadWorkouts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("student_workouts")
        .select("id, title, status, start_date, end_date, created_at, student_id, template_id")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const studentIds = [...new Set((data || []).map(w => w.student_id).filter(Boolean))];
      const templateIds = [...new Set((data || []).map(w => w.template_id).filter(Boolean))];

      const [profilesRes, templatesRes] = await Promise.all([
        studentIds.length
          ? supabase.from("profiles").select("id, name").in("id", studentIds)
          : Promise.resolve({ data: [] }),
        templateIds.length
          ? supabase.from("workout_templates").select("id, title").in("id", templateIds)
          : Promise.resolve({ data: [] }),
      ]);

      const profileMap = Object.fromEntries((profilesRes.data || []).map(p => [p.id, p.name]));
      const templateMap = Object.fromEntries((templatesRes.data || []).map(t => [t.id, t.title]));

      const normalized = (data || []).map(w => ({
        id: w.id,
        workout_name: w.title || templateMap[w.template_id] || "Treino",
        student_name: profileMap[w.student_id] || "Aluno",
        student_id: w.student_id,
        status: getStatus(w.start_date, w.end_date, w.status),
        start_date: w.start_date,
        end_date: w.end_date,
      }));

      setCustomWorkouts(normalized);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar treinos: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (start, end, status) => {
    if (status && status !== "active") return status;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (end && new Date(end) < today) return "expired";
    if (start && new Date(start) > today) return "pending";
    return "active";
  };

  useEffect(() => { loadWorkouts(); }, []);

  const filteredWorkouts = customWorkouts.filter(w =>
    w.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.workout_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = d => new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "short", year: "numeric",
  });

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      // Deleta exercícios → blocos → student_workout em ordem
      const { data: blocks } = await supabase
        .from("student_workout_blocks")
        .select("id")
        .eq("student_workout_id", deleteTarget.id);

      if (blocks?.length) {
        const blockIds = blocks.map(b => b.id);
        await supabase.from("student_workout_exercises").delete().in("block_id", blockIds);
      }

      await supabase.from("student_workout_blocks").delete().eq("student_workout_id", deleteTarget.id);
      await supabase.from("student_workouts").delete().eq("id", deleteTarget.id);

      setCustomWorkouts(prev => prev.filter(w => w.id !== deleteTarget.id));
      toast.success("Treino excluído!");
      setDeleteTarget(null);
    } catch (err) {
      toast.error("Erro ao excluir: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const activeCount = customWorkouts.filter(w => w.status === "active").length;
  const expiredCount = customWorkouts.filter(w => w.status === "expired").length;

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <UserCog className="h-6 w-6 text-primary" />
              Treinos Personalizados
            </h1>
            <p className="text-muted-foreground mt-1">Treinos atribuídos a alunos específicos</p>
          </div>
          <Button variant="premium" className="gap-2" onClick={() => setShowAssignModal(true)}>
            <Plus className="h-4 w-4" />Criar Treino Personalizado
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-foreground">{customWorkouts.length}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{activeCount}</p>
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
            {loading ? (
              <div className="py-16 flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />Carregando...
              </div>
            ) : (
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
                              {workout.start_date ? formatDate(workout.start_date) : "—"}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              {workout.end_date ? formatDate(workout.end_date) : "—"}
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
                                <DropdownMenuSeparator className="bg-border" />
                                <DropdownMenuItem
                                  className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                                  onClick={() => setDeleteTarget(workout)}
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
                {filteredWorkouts.length === 0 && (
                  <div className="py-12 text-center">
                    <UserCog className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Nenhum treino personalizado encontrado</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AssignWorkoutModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSave={() => { setShowAssignModal(false); loadWorkouts(); }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Excluir atribuição?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleteTarget?.workout_name}" de {deleteTarget?.student_name}?
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

export default CustomWorkoutsPage;