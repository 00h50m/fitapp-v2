import React, { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
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
  Dumbbell, Search, Plus, MoreHorizontal, Edit, Trash2,
  Video, Loader2, RefreshCw, Filter, X, Layers, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  getExercises, saveExercise, deleteExercise,
  muscleGroupOptions, equipmentOptions, difficultyOptions,
  muscleGroupColors, difficultyColors, getLabel,
} from "@/services/exercisesService";
import ExerciseFormModal from "@/components/treinos/ExerciseFormModal";

// ── Drawer de detalhes ──────────────────────────────────────────
const ExerciseDetailDrawer = ({ exercise, onClose, onEdit }) => {
  if (!exercise) return null;
  const ytId = (() => {
    const m = exercise.video_url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return m ? m[1] : null;
  })();

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-card border-l border-border h-full overflow-y-auto z-50 shadow-2xl">
        <div className="sticky top-0 bg-card border-b border-border px-5 py-4 flex items-center justify-between z-10">
          <h2 className="font-display font-bold text-foreground text-lg truncate pr-4">{exercise.title}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(exercise)}>
              <Edit className="h-4 w-4 mr-1.5" />Editar
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="p-5 space-y-5">
          <div className="flex flex-wrap gap-2">
            {exercise.muscle_group && <Badge className={cn("border", muscleGroupColors[exercise.muscle_group])}>{getLabel(muscleGroupOptions, exercise.muscle_group)}</Badge>}
            {exercise.difficulty && <Badge className={cn("border", difficultyColors[exercise.difficulty])}>{getLabel(difficultyOptions, exercise.difficulty)}</Badge>}
            {exercise.mechanics && <Badge variant="outline" className="text-xs">{exercise.mechanics === "compound" ? "Composto" : "Isolado"}</Badge>}
            {exercise.category && <Badge variant="outline" className="text-xs">{exercise.category}</Badge>}
          </div>

          {exercise.secondary_muscles?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Músculos Secundários</p>
              <div className="flex flex-wrap gap-1.5">
                {exercise.secondary_muscles.map(m => (
                  <span key={m} className={cn("px-2 py-0.5 rounded-full text-xs border", muscleGroupColors[m] || "bg-muted text-muted-foreground border-border")}>
                    {getLabel(muscleGroupOptions, m)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {ytId ? (
            <div className="aspect-video rounded-xl overflow-hidden border border-border bg-muted">
              <iframe src={`https://www.youtube.com/embed/${ytId}`} className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen title={exercise.title} />
            </div>
          ) : exercise.thumbnail_url ? (
            <img src={exercise.thumbnail_url} alt={exercise.title} className="w-full rounded-xl border border-border object-cover max-h-48" />
          ) : null}

          {exercise.default_description && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5">Descrição</p>
              <p className="text-sm text-foreground leading-relaxed">{exercise.default_description}</p>
            </div>
          )}

          {exercise.instructions && (
            <div className="bg-muted/50 rounded-xl p-4 border border-border">
              <p className="text-xs text-primary uppercase tracking-wide font-medium mb-2 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />Instruções de Execução
              </p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{exercise.instructions}</p>
            </div>
          )}

          {exercise.tips && (
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
              <p className="text-xs text-primary uppercase tracking-wide font-medium mb-2 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5" />Dicas do Treinador
              </p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{exercise.tips}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {exercise.equipment && (
              <div className="bg-muted/50 rounded-xl p-3 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Equipamento</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{getLabel(equipmentOptions, exercise.equipment)}</p>
              </div>
            )}
            {exercise.force && (
              <div className="bg-muted/50 rounded-xl p-3 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Padrão</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{exercise.force}</p>
              </div>
            )}
          </div>

          {exercise.tags?.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {exercise.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary">{tag}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Página principal ────────────────────────────────────────────
const ExercisesPage = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMuscle, setFilterMuscle] = useState("");
  const [filterEquipment, setFilterEquipment] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [detailExercise, setDetailExercise] = useState(null);

  // Debounce search para evitar AbortErrors
  const searchDebounceRef = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(searchDebounceRef.current);
  }, [search]);

  // Carrega exercícios — sem useCallback para evitar re-renders
  const loadExercises = async (params = {}) => {
    setLoading(true);
    try {
      const data = await getExercises(params);
      setExercises(data);
    } catch (err) {
      // AbortError é silencioso (query cancelada pelo navegador)
      if (err?.name !== "AbortError") {
        toast.error("Erro ao carregar exercícios");
      }
    } finally {
      setLoading(false);
    }
  };

  // Recarrega quando filtros mudam
  useEffect(() => {
    loadExercises({
      search: debouncedSearch,
      muscleGroup: filterMuscle,
      equipment: filterEquipment,
      difficulty: filterDifficulty,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filterMuscle, filterEquipment, filterDifficulty]);

  const hasFilters = filterMuscle || filterEquipment || filterDifficulty || debouncedSearch;

  const clearFilters = () => {
    setSearch(""); setFilterMuscle("");
    setFilterEquipment(""); setFilterDifficulty("");
  };

  const handleSave = async (data) => {
    // saveExercise lança erro com mensagem amigável se duplicata
    const saved = await saveExercise(data);
    toast.success(data.id ? "Exercício atualizado!" : "Exercício criado!");
    // Atualiza lista sem recarregar tudo
    setExercises(prev => {
      if (data.id) return prev.map(e => e.id === saved.id ? saved : e);
      return [saved, ...prev];
    });
    // Fecha o modal após sucesso
    setShowModal(false);
    setEditingExercise(null);
    return saved;
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteExercise(deleteTarget.id);
      toast.success("Exercício removido!");
      setExercises(prev => prev.filter(e => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      toast.error("Erro ao remover");
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (ex) => {
    setDetailExercise(null);
    setEditingExercise(ex);
    setShowModal(true);
  };

  const withVideo = exercises.filter(e => e.video_url).length;
  const muscles = new Set(exercises.map(e => e.muscle_group).filter(Boolean)).size;

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
            <p className="text-muted-foreground mt-1">Gerencie os exercícios disponíveis para os treinos</p>
          </div>
          <Button variant="premium" className="gap-2" onClick={() => { setEditingExercise(null); setShowModal(true); }}>
            <Plus className="h-4 w-4" />Novo Exercício
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total",            value: exercises.length,                                color: "text-foreground" },
            { label: "Com Vídeo",        value: withVideo,                                       color: "text-primary" },
            { label: "Grupos Musculares", value: muscles,                                        color: "text-foreground" },
            { label: "Com Dificuldade",  value: exercises.filter(e => e.difficulty).length,      color: "text-foreground" },
          ].map(s => (
            <Card key={s.label} className="bg-card border-border">
              <CardContent className="p-4 text-center">
                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar exercício..." value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 bg-muted border-border" />
              </div>

              <Select value={filterMuscle} onValueChange={setFilterMuscle}>
                <SelectTrigger className="bg-muted border-border w-full sm:w-44">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Músculo" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {muscleGroupOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filterEquipment} onValueChange={setFilterEquipment}>
                <SelectTrigger className="bg-muted border-border w-full sm:w-44">
                  <SelectValue placeholder="Equipamento" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {equipmentOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                <SelectTrigger className="bg-muted border-border w-full sm:w-40">
                  <SelectValue placeholder="Dificuldade" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {difficultyOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>

              {hasFilters && (
                <Button variant="ghost" size="icon" onClick={clearFilters} title="Limpar filtros">
                  <X className="h-4 w-4" />
                </Button>
              )}

              <Button variant="ghost" size="icon" title="Recarregar"
                onClick={() => loadExercises({ search: debouncedSearch, muscleGroup: filterMuscle, equipment: filterEquipment, difficulty: filterDifficulty })}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 pt-4 px-6">
            <CardTitle className="text-base font-display flex items-center gap-2">
              Lista de Exercícios
              {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground pl-6">Exercício</TableHead>
                    <TableHead className="text-muted-foreground hidden md:table-cell">Grupo Muscular</TableHead>
                    <TableHead className="text-muted-foreground hidden lg:table-cell">Equipamento</TableHead>
                    <TableHead className="text-muted-foreground hidden sm:table-cell">Dificuldade</TableHead>
                    <TableHead className="text-muted-foreground hidden xl:table-cell">Mecânica</TableHead>
                    <TableHead className="text-muted-foreground text-right pr-6">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && exercises.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16 text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                        <p className="text-muted-foreground text-sm">Carregando exercícios...</p>
                      </TableCell>
                    </TableRow>
                  ) : exercises.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16 text-center">
                        <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground">Nenhum exercício encontrado</p>
                        {hasFilters && (
                          <Button variant="link" className="mt-2 text-primary" onClick={clearFilters}>
                            Limpar filtros
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : exercises.map(ex => (
                    <TableRow key={ex.id} className="border-border hover:bg-muted/30 cursor-pointer"
                      onClick={() => setDetailExercise(ex)}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary flex-shrink-0 overflow-hidden">
                            {ex.thumbnail_url
                              ? <img src={ex.thumbnail_url} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display = "none"; }} />
                              : ex.video_url ? <Video className="h-5 w-5" /> : <Dumbbell className="h-5 w-5" />
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[200px]">{ex.title}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {ex.default_description || "Sem descrição"}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        {ex.muscle_group
                          ? <Badge className={cn("border text-xs", muscleGroupColors[ex.muscle_group])}>{getLabel(muscleGroupOptions, ex.muscle_group)}</Badge>
                          : <span className="text-muted-foreground text-xs">—</span>}
                      </TableCell>

                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm text-foreground">{getLabel(equipmentOptions, ex.equipment)}</span>
                      </TableCell>

                      <TableCell className="hidden sm:table-cell">
                        {ex.difficulty
                          ? <Badge className={cn("border text-xs", difficultyColors[ex.difficulty])}>{getLabel(difficultyOptions, ex.difficulty)}</Badge>
                          : <span className="text-muted-foreground text-xs">—</span>}
                      </TableCell>

                      <TableCell className="hidden xl:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {ex.mechanics === "compound" ? "Composto" : ex.mechanics === "isolation" ? "Isolado" : "—"}
                        </span>
                      </TableCell>

                      <TableCell className="text-right pr-6" onClick={e => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => handleEdit(ex)}>
                              <Edit className="h-4 w-4" />Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem
                              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(ex)}
                            >
                              <Trash2 className="h-4 w-4" />Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {detailExercise && (
        <ExerciseDetailDrawer
          exercise={detailExercise}
          onClose={() => setDetailExercise(null)}
          onEdit={handleEdit}
        />
      )}

      <ExerciseFormModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingExercise(null); }}
        exercise={editingExercise}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Remover exercício?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover "{deleteTarget?.title}"?
              O exercício não aparecerá mais em novas prescrições.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete} disabled={deleting}
            >
              {deleting ? "Removendo..." : "Remover"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default ExercisesPage;