import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  UserCog, Search, Plus, MoreHorizontal, Edit, Trash2,
  Calendar, User, ClipboardList, CheckCircle2, XCircle,
  Clock, Loader2, RefreshCw, AlertCircle, Layers,
  GripVertical, Tag, ChevronDown, ChevronUp, Save, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import AssignWorkoutModal from "@/components/treinos/AssignWorkoutModal";
import { getStudentWorkouts, deleteStudentWorkout } from "@/services/studentWorkoutService";

// ─── helpers ──────────────────────────────────────────────────────────────
function getRealStatus(w) {
  if (!w.end_date) return "active";
  return new Date(w.end_date + "T23:59:59") < new Date() ? "expired" : "active";
}

const statusConfig = {
  active:   { label: "Ativo",    variant: "success",     icon: CheckCircle2 },
  expired:  { label: "Expirado", variant: "destructive", icon: XCircle },
  inactive: { label: "Inativo",  variant: "secondary",   icon: Clock },
};

function fmtDate(val) {
  if (!val) return "—";
  const d = new Date((val + "").split("T")[0] + "T12:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

const SECTION_COLORS = [
  "bg-primary/10 text-primary border-primary/20",
  "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  "bg-rose-500/10 text-rose-400 border-rose-500/20",
  "bg-orange-500/10 text-orange-400 border-orange-500/20",
];

const TABS = ["Todos", "Ativos", "Expirados", "Inativos"];

// ─── Modal de editar seção de um treino ────────────────────────────────────
const EditSectionModal = ({ workout, existingSections, onClose, onSave }) => {
  const [section, setSection] = useState(workout?.catalog_section || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!workout) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("student_workouts")
        .update({ catalog_section: section.trim() || null })
        .eq("id", workout.id);
      if (error) throw error;
      onSave({ ...workout, catalog_section: section.trim() || null });
      toast.success("Seção atualizada!");
      onClose();
    } catch (err) {
      toast.error("Erro: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-lg font-display">
            Organizar no Catálogo
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm text-muted-foreground">Treino</Label>
            <p className="font-semibold text-foreground">{workout?.workout_name}</p>
            <p className="text-xs text-muted-foreground">{workout?.student_name}</p>
          </div>
          <div className="space-y-2">
            <Label>Seção / Categoria</Label>
            <Input
              value={section}
              onChange={e => setSection(e.target.value)}
              placeholder="Ex: Fase 1, Hipertrofia, Desafio..."
              className="bg-muted border-border"
            />
            <p className="text-[11px] text-muted-foreground">
              Aparece como uma linha no catálogo do aluno. Deixe vazio para "Meus Treinos".
            </p>
          </div>
          {/* Sugestões de seções já existentes */}
          {existingSections.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Seções existentes</p>
              <div className="flex flex-wrap gap-1.5">
                {existingSections.map((s, i) => (
                  <button
                    key={s}
                    onClick={() => setSection(s)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full border font-medium transition-all",
                      section === s
                        ? SECTION_COLORS[i % SECTION_COLORS.length] + " ring-1 ring-current"
                        : "bg-muted text-muted-foreground border-border hover:border-primary/30"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            <X className="h-4 w-4 mr-2" />Cancelar
          </Button>
          <Button variant="premium" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Componente principal ──────────────────────────────────────────────────
const CustomWorkoutsPage = () => {
  const [workouts,       setWorkouts]       = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);
  const [search,         setSearch]         = useState("");
  const [tab,            setTab]            = useState("Todos");
  const [showModal,      setShowModal]      = useState(false);
  const [editing,        setEditing]        = useState(null);
  const [deleting,       setDeleting]       = useState(null);
  const [confirmDelete,  setConfirmDelete]  = useState(false);
  const [sectionEditing, setSectionEditing] = useState(null);
  // Visualização: "table" | "catalog"
  const [viewMode,       setViewMode]       = useState("catalog");

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const data = await getStudentWorkouts();
      setWorkouts(data);
    } catch (err) {
      setError(err.message);
      toast.error("Erro ao carregar treinos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const counts = {
    Todos:     workouts.length,
    Ativos:    workouts.filter(w => getRealStatus(w) === "active" && w.status !== "inactive").length,
    Expirados: workouts.filter(w => getRealStatus(w) === "expired").length,
    Inativos:  workouts.filter(w => w.status === "inactive").length,
  };

  const filtered = workouts.filter(w => {
    const rs = getRealStatus(w);
    const tabMatch =
      tab === "Todos"     ? true :
      tab === "Ativos"    ? rs === "active" && w.status !== "inactive" :
      tab === "Expirados" ? rs === "expired" :
      tab === "Inativos"  ? w.status === "inactive" : true;
    const q = search.toLowerCase();
    return tabMatch && (!q ||
      (w.student_name || "").toLowerCase().includes(q) ||
      (w.workout_name || "").toLowerCase().includes(q) ||
      (w.catalog_section || "").toLowerCase().includes(q));
  });

  // Seções únicas para sugestão
  const allSections = [...new Set(workouts.map(w => w.catalog_section).filter(Boolean))];

  const handleSave = (saved) => {
    if (editing) {
      setWorkouts(prev => prev.map(w => w.id === saved.id ? { ...w, ...saved } : w));
    } else {
      setWorkouts(prev => [saved, ...prev]);
    }
    setEditing(null);
    setShowModal(false);
  };

  const handleSectionSave = (updated) => {
    setWorkouts(prev => prev.map(w => w.id === updated.id ? updated : w));
    setSectionEditing(null);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteStudentWorkout(deleting.id);
      setWorkouts(prev => prev.filter(w => w.id !== deleting.id));
      toast.success("Treino excluído!");
    } catch (err) {
      toast.error("Erro ao excluir: " + err.message);
    } finally {
      setDeleting(null);
      setConfirmDelete(false);
    }
  };

  // ─── Agrupar por aluno para vista de catálogo ─────────────────────────
  // Agrupa filtered por student_name, depois por catalog_section
  const catalogByStudent = filtered.reduce((acc, w) => {
    const student = w.student_name || "Sem aluno";
    if (!acc[student]) acc[student] = {};
    const sec = w.catalog_section?.trim() || "Meus Treinos";
    if (!acc[student][sec]) acc[student][sec] = [];
    acc[student][sec].push(w);
    return acc;
  }, {});

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <UserCog className="h-6 w-6 text-primary" />
              Catálogo de Treinos
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Organize e atribua treinos para seus alunos
            </p>
          </div>
          <Button variant="premium" className="gap-2 w-full sm:w-auto"
            onClick={() => { setEditing(null); setShowModal(true); }}>
            <Plus className="h-4 w-4" />Atribuir Treino
          </Button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total",     value: counts.Todos,     color: "text-foreground",  tab: "Todos" },
            { label: "Ativos",    value: counts.Ativos,    color: "text-green-400",   tab: "Ativos" },
            { label: "Expirados", value: counts.Expirados, color: "text-destructive", tab: "Expirados" },
          ].map(s => (
            <Card key={s.tab}
              className={cn("bg-card border-border cursor-pointer hover:border-primary/30 transition-colors",
                tab === s.tab && "border-primary/40")}
              onClick={() => setTab(s.tab)}>
              <CardContent className="p-4 text-center">
                <p className={cn("text-2xl font-bold", s.color)}>{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Tabela / Catálogo ── */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base font-display">Treinos Atribuídos</CardTitle>
                {/* Toggle view */}
                <div className="flex items-center bg-muted rounded-lg p-0.5 gap-0.5">
                  <button
                    onClick={() => setViewMode("catalog")}
                    className={cn("flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-all",
                      viewMode === "catalog" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                  >
                    <Layers className="h-3.5 w-3.5" />Catálogo
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={cn("flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-all",
                      viewMode === "table" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
                  >
                    <ClipboardList className="h-3.5 w-3.5" />Tabela
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Buscar aluno, treino ou seção..."
                    value={search} onChange={e => setSearch(e.target.value)}
                    className="pl-9 bg-muted border-border h-9 text-sm" />
                </div>
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={load}>
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>
              </div>
            </div>

            {/* Abas */}
            <div className="flex gap-1 border-b border-border -mx-6 px-6 overflow-x-auto">
              {TABS.map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
                    tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}>
                  {t}
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                    tab === t ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground")}>
                    {counts[t] ?? filtered.length}
                  </span>
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="py-12 text-center px-4">
                <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-3" />
                <p className="text-sm text-destructive mb-3">{error}</p>
                <Button variant="outline" size="sm" onClick={load}>Tentar novamente</Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center">
                <UserCog className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">Nenhum treino encontrado</p>
              </div>

            ) : viewMode === "catalog" ? (
              // ─── Vista Catálogo (por aluno → por seção) ─────────────────
              <div className="divide-y divide-border/40">
                {Object.entries(catalogByStudent).map(([studentName, sections]) => (
                  <StudentCatalogBlock
                    key={studentName}
                    studentName={studentName}
                    sections={sections}
                    allSections={allSections}
                    onEdit={(w) => { setEditing(w); setShowModal(true); }}
                    onDelete={(w) => { setDeleting(w); setConfirmDelete(true); }}
                    onEditSection={(w) => setSectionEditing(w)}
                  />
                ))}
              </div>

            ) : (
              // ─── Vista Tabela ──────────────────────────────────────────
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Treino</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Aluno</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Seção</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Fim</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filtered.map(w => {
                      const rs = getRealStatus(w);
                      const st = w.status === "inactive" ? "inactive" : rs;
                      const cfg = statusConfig[st] || statusConfig.active;
                      const Icon = cfg.icon;
                      const sectionIdx = allSections.indexOf(w.catalog_section);
                      return (
                        <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                                <ClipboardList className="h-4 w-4 text-primary" />
                              </div>
                              <span className="font-medium text-sm text-foreground">{w.workout_name || "—"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-7 w-7 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0">
                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                              </div>
                              <span className="text-sm text-foreground">{w.student_name || "—"}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            {w.catalog_section ? (
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full border font-medium",
                                SECTION_COLORS[sectionIdx % SECTION_COLORS.length]
                              )}>
                                {w.catalog_section}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground/50">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className={cn("text-sm flex items-center gap-1.5",
                              rs === "expired" ? "text-destructive font-medium" : "text-muted-foreground")}>
                              <Calendar className="h-3.5 w-3.5" />{fmtDate(w.end_date)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={cfg.variant} className="gap-1 text-xs">
                              <Icon className="h-3 w-3" />{cfg.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <WorkoutRowMenu
                              workout={w}
                              onEdit={() => { setEditing(w); setShowModal(true); }}
                              onDelete={() => { setDeleting(w); setConfirmDelete(true); }}
                              onEditSection={() => setSectionEditing(w)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Modais ── */}
      <AssignWorkoutModal
        isOpen={showModal}
        workout={editing}
        onClose={() => { setShowModal(false); setEditing(null); }}
        onSave={handleSave}
      />

      {sectionEditing && (
        <EditSectionModal
          workout={sectionEditing}
          existingSections={allSections}
          onClose={() => setSectionEditing(null)}
          onSave={handleSectionSave}
        />
      )}

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Excluir treino?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{deleting?.workout_name}" de {deleting?.student_name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted border-border">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

// ─── Bloco de catálogo por aluno ──────────────────────────────────────────
const StudentCatalogBlock = ({ studentName, sections, allSections, onEdit, onDelete, onEditSection }) => {
  const [expanded, setExpanded] = useState(true);
  const totalWorkouts = Object.values(sections).flat().length;

  return (
    <div className="px-6 py-5 space-y-4">
      {/* Header do aluno */}
      <button
        className="flex items-center gap-3 w-full"
        onClick={() => setExpanded(p => !p)}
      >
        <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 text-left">
          <p className="font-bold text-foreground text-sm">{studentName}</p>
          <p className="text-xs text-muted-foreground">
            {totalWorkouts} treino{totalWorkouts !== 1 ? "s" : ""} •{" "}
            {Object.keys(sections).length} seção{Object.keys(sections).length !== 1 ? "ões" : ""}
          </p>
        </div>
        {expanded
          ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {/* Seções do aluno */}
      {expanded && (
        <div className="space-y-5 pl-12">
          {Object.entries(sections).map(([sectionName, sectionWorkouts], i) => (
            <div key={sectionName} className="space-y-2">
              {/* Label da seção */}
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-xs px-2.5 py-1 rounded-full border font-semibold",
                  SECTION_COLORS[i % SECTION_COLORS.length]
                )}>
                  {sectionName}
                </span>
                <div className="flex-1 h-px bg-border/40" />
                <span className="text-[10px] text-muted-foreground">{sectionWorkouts.length} treino{sectionWorkouts.length !== 1 ? "s" : ""}</span>
              </div>

              {/* Cards dos treinos */}
              <div className="space-y-2">
                {sectionWorkouts.map(w => {
                  const rs = getRealStatus(w);
                  const st = w.status === "inactive" ? "inactive" : rs;
                  const cfg = statusConfig[st] || statusConfig.active;
                  const Icon = cfg.icon;
                  return (
                    <div key={w.id}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors">
                      <GripVertical className="h-4 w-4 text-muted-foreground/30 flex-shrink-0 cursor-grab" />
                      <div className="h-8 w-8 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="h-4 w-4 text-primary/70" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{w.workout_name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant={cfg.variant} className="text-[10px] gap-0.5 py-0 h-4">
                            <Icon className="h-2.5 w-2.5" />{cfg.label}
                          </Badge>
                          {w.end_date && (
                            <span className="text-[10px] text-muted-foreground">
                              até {fmtDate(w.end_date)}
                            </span>
                          )}
                        </div>
                      </div>
                      <WorkoutRowMenu
                        workout={w}
                        onEdit={() => onEdit(w)}
                        onDelete={() => onDelete(w)}
                        onEditSection={() => onEditSection(w)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Menu de ações de um treino ───────────────────────────────────────────
const WorkoutRowMenu = ({ workout, onEdit, onDelete, onEditSection }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="bg-card border-border">
      <DropdownMenuItem className="gap-2 cursor-pointer" onClick={onEdit}>
        <Edit className="h-4 w-4" />Editar
      </DropdownMenuItem>
      <DropdownMenuItem className="gap-2 cursor-pointer" onClick={onEditSection}>
        <Tag className="h-4 w-4" />Organizar no catálogo
      </DropdownMenuItem>
      <DropdownMenuSeparator className="bg-border" />
      <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive" onClick={onDelete}>
        <Trash2 className="h-4 w-4" />Excluir
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default CustomWorkoutsPage;