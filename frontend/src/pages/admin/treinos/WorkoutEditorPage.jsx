import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ClipboardList, Save, ArrowLeft, Plus, Trash2,
  Layers, Dumbbell, ChevronDown, ChevronUp, X, Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { getWorkoutTemplateById, saveWorkoutTemplate } from "@/services/workoutService";
import ExerciseSelectorModal from "@/components/treinos/ExerciseSelectorModal";

const blockTypeOptions = [
  { value: "normal", label: "Normal" },
  { value: "biset", label: "Biset" },
  { value: "triset", label: "Triset" },
  { value: "circuit", label: "Circuito" },
  { value: "dropset", label: "Drop Set" },
  { value: "giantset", label: "Giant Set" },
];

const blockTypeColors = {
  normal: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  biset: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  triset: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  circuit: "bg-green-500/15 text-green-400 border-green-500/30",
  dropset: "bg-red-500/15 text-red-400 border-red-500/30",
  giantset: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
};

const WorkoutEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isNew = id === "new";

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [workoutName, setWorkoutName] = useState("");
  const [workoutDescription, setWorkoutDescription] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState(null);

  // Carrega template existente
  useEffect(() => {
    if (isNew) return;
    const load = async () => {
      try {
        const data = await getWorkoutTemplateById(id);
        setWorkoutName(data.title || "");
        setWorkoutDescription(data.description || "");
        setBlocks(data.blocks || []);
      } catch (err) {
        toast.error("Erro ao carregar treino: " + err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isNew]);

  // ── Blocos ──────────────────────────────────────────────────

  const addBlock = () => {
    setBlocks(prev => [...prev, {
      id: `block_${Date.now()}`,
      label: `Bloco ${String.fromCharCode(65 + prev.length)}`,
      type: "normal",
      notes: "",
      order: prev.length + 1,
      exercises: [],
    }]);
  };

  const removeBlock = blockId => setBlocks(prev => prev.filter(b => b.id !== blockId));

  const updateBlock = (blockId, field, value) =>
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, [field]: value } : b));

  const moveBlock = (blockId, dir) => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === blockId);
      const arr = [...prev];
      if (dir === "up" && idx > 0)
        [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      if (dir === "down" && idx < arr.length - 1)
        [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return arr;
    });
  };

  // ── Exercícios ──────────────────────────────────────────────

  const openExerciseSelector = blockId => {
    setActiveBlockId(blockId);
    setShowExerciseSelector(true);
  };

  const addExerciseToBlock = exercise => {
    setBlocks(prev => prev.map(b => {
      if (b.id !== activeBlockId) return b;
      return {
        ...b,
        exercises: [...b.exercises, {
          exercise_id: exercise.id,
          name: exercise.title || exercise.name || "Exercício",
          sets: 3,
          reps: "10-12",
          rest: 60,
          tempo: "",
          notes: "",
        }],
      };
    }));
  };

  const removeExercise = (blockId, exIdx) =>
    setBlocks(prev => prev.map(b =>
      b.id === blockId
        ? { ...b, exercises: b.exercises.filter((_, i) => i !== exIdx) }
        : b
    ));

  const updateExercise = (blockId, exIdx, field, value) =>
    setBlocks(prev => prev.map(b =>
      b.id === blockId
        ? { ...b, exercises: b.exercises.map((ex, i) => i === exIdx ? { ...ex, [field]: value } : ex) }
        : b
    ));

  const moveExercise = (blockId, exIdx, dir) => {
    setBlocks(prev => prev.map(b => {
      if (b.id !== blockId) return b;
      const exs = [...b.exercises];
      if (dir === "up" && exIdx > 0)
        [exs[exIdx - 1], exs[exIdx]] = [exs[exIdx], exs[exIdx - 1]];
      if (dir === "down" && exIdx < exs.length - 1)
        [exs[exIdx], exs[exIdx + 1]] = [exs[exIdx + 1], exs[exIdx]];
      return { ...b, exercises: exs };
    }));
  };

  const getBlockExerciseIds = blockId =>
    blocks.find(b => b.id === blockId)?.exercises.map(e => e.exercise_id) || [];

  // ── Salvar ──────────────────────────────────────────────────

  const handleSave = async () => {
    if (!workoutName.trim()) {
      toast.error("Nome do treino é obrigatório");
      return;
    }
    setSaving(true);
    try {
      await saveWorkoutTemplate({
        id: isNew ? null : id,
        title: workoutName,
        description: workoutDescription,
        blocks,
        createdBy: user?.id,
      });
      toast.success(isNew ? "Treino criado!" : "Treino salvo!");
      navigate("/admin/treinos/templates");
    } catch (err) {
      console.error("Erro ao salvar:", err);
      toast.error("Erro ao salvar treino: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/treinos/templates")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                <ClipboardList className="h-6 w-6 text-primary" />
                {isNew ? "Novo Treino" : "Editar Treino"}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isNew ? "Crie um novo template de treino" : "Edite o template de treino"}
              </p>
            </div>
          </div>
          <Button variant="premium" className="gap-2" onClick={handleSave} disabled={saving}>
            {saving
              ? <><Loader2 className="h-4 w-4 animate-spin" />Salvando...</>
              : <><Save className="h-4 w-4" />Salvar Treino</>
            }
          </Button>
        </div>

        {/* Informações Básicas */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-display">Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Treino *</Label>
              <Input
                id="name"
                value={workoutName}
                onChange={e => setWorkoutName(e.target.value)}
                placeholder="Ex: Treino A – Push"
                className="bg-muted border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={workoutDescription}
                onChange={e => setWorkoutDescription(e.target.value)}
                placeholder="Descreva o treino..."
                className="bg-muted border-border min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Blocos */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Blocos do Treino
              </CardTitle>
              <Button variant="outline" className="gap-2" onClick={addBlock}>
                <Plus className="h-4 w-4" />Adicionar Bloco
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {blocks.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-border rounded-lg">
                <Layers className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum bloco adicionado</p>
                <Button variant="outline" className="gap-2" onClick={addBlock}>
                  <Plus className="h-4 w-4" />Adicionar Primeiro Bloco
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {blocks.map((block, blockIdx) => (
                  <Card key={block.id} className="bg-muted/30 border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        {/* Reordenar */}
                        <div className="flex flex-col gap-0.5">
                          <Button variant="ghost" size="icon" className="h-6 w-6"
                            onClick={() => moveBlock(block.id, "up")} disabled={blockIdx === 0}>
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-6 w-6"
                            onClick={() => moveBlock(block.id, "down")} disabled={blockIdx === blocks.length - 1}>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Campos */}
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Nome do Bloco</Label>
                            <Input value={block.label}
                              onChange={e => updateBlock(block.id, "label", e.target.value)}
                              className="bg-card border-border h-9" />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Tipo</Label>
                            <Select value={block.type} onValueChange={v => updateBlock(block.id, "type", v)}>
                              <SelectTrigger className="bg-card border-border h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-border">
                                {blockTypeOptions.map(o => (
                                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1 col-span-2 md:col-span-1">
                            <Label className="text-xs">Notas</Label>
                            <Input value={block.notes}
                              onChange={e => updateBlock(block.id, "notes", e.target.value)}
                              placeholder="Observações..."
                              className="bg-card border-border h-9" />
                          </div>
                        </div>

                        {/* Badge + Excluir */}
                        <div className="flex items-center gap-2">
                          <Badge className={cn("border", blockTypeColors[block.type])}>
                            {blockTypeOptions.find(o => o.value === block.type)?.label}
                          </Badge>
                          <Button variant="ghost" size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => removeBlock(block.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {block.exercises.length === 0 ? (
                        <div className="py-6 text-center border border-dashed border-border rounded-lg">
                          <Dumbbell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                          <p className="text-sm text-muted-foreground mb-3">Nenhum exercício</p>
                          <Button variant="outline" size="sm" className="gap-2"
                            onClick={() => openExerciseSelector(block.id)}>
                            <Plus className="h-4 w-4" />Adicionar Exercício
                          </Button>
                        </div>
                      ) : (
                        <>
                          {block.exercises.map((ex, exIdx) => (
                            <Card key={`${block.id}-${exIdx}`} className="bg-card border-border">
                              <CardContent className="p-3">
                                <div className="flex items-start gap-3">
                                  {/* Reordenar exercício */}
                                  <div className="flex flex-col gap-0.5 pt-1">
                                    <Button variant="ghost" size="icon" className="h-5 w-5"
                                      onClick={() => moveExercise(block.id, exIdx, "up")} disabled={exIdx === 0}>
                                      <ChevronUp className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-5 w-5"
                                      onClick={() => moveExercise(block.id, exIdx, "down")}
                                      disabled={exIdx === block.exercises.length - 1}>
                                      <ChevronDown className="h-3 w-3" />
                                    </Button>
                                  </div>

                                  <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                          <Dumbbell className="h-4 w-4 text-primary" />
                                        </div>
                                        <span className="font-medium text-foreground">{ex.name}</span>
                                      </div>
                                      <Button variant="ghost" size="icon"
                                        className="h-7 w-7 text-destructive hover:text-destructive"
                                        onClick={() => removeExercise(block.id, exIdx)}>
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                      <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">Séries</Label>
                                        <Input type="number" min="1" value={ex.sets}
                                          onChange={e => updateExercise(block.id, exIdx, "sets", parseInt(e.target.value) || 1)}
                                          className="bg-muted border-border h-8 text-sm" />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">Reps</Label>
                                        <Input value={ex.reps} placeholder="10-12"
                                          onChange={e => updateExercise(block.id, exIdx, "reps", e.target.value)}
                                          className="bg-muted border-border h-8 text-sm" />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">Descanso (s)</Label>
                                        <Input type="number" min="0" value={ex.rest}
                                          onChange={e => updateExercise(block.id, exIdx, "rest", parseInt(e.target.value) || 0)}
                                          className="bg-muted border-border h-8 text-sm" />
                                      </div>
                                      <div className="space-y-1">
                                        <Label className="text-[10px] text-muted-foreground">Tempo</Label>
                                        <Input value={ex.tempo} placeholder="3-1-2"
                                          onChange={e => updateExercise(block.id, exIdx, "tempo", e.target.value)}
                                          className="bg-muted border-border h-8 text-sm" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}

                          <Button variant="outline" size="sm" className="w-full gap-2"
                            onClick={() => openExerciseSelector(block.id)}>
                            <Plus className="h-4 w-4" />Adicionar Exercício
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ExerciseSelectorModal
        isOpen={showExerciseSelector}
        onClose={() => { setShowExerciseSelector(false); setActiveBlockId(null); }}
        onSelect={addExerciseToBlock}
        selectedIds={activeBlockId ? getBlockExerciseIds(activeBlockId) : []}
      />
    </AdminLayout>
  );
};

export default WorkoutEditorPage;