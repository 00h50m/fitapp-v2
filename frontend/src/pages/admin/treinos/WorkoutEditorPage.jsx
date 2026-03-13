import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ClipboardList, 
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  GripVertical,
  Layers,
  Dumbbell,
  Upload,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  mockWorkoutTemplates, 
  blockTypeOptions,
  getBlockTypeLabel,
  getExerciseById,
  mockExercises
} from "@/data/mockTreinosData";
import ExerciseSelectorModal from "@/components/treinos/ExerciseSelectorModal";

// Block type colors
const blockTypeColors = {
  single: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  biset: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  triset: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  circuit: "bg-green-500/15 text-green-400 border-green-500/30",
};

const WorkoutEditorPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  // Find existing workout or create new
  const existingWorkout = !isNew ? mockWorkoutTemplates.find(w => w.id === id) : null;

  // Form state
  const [workoutName, setWorkoutName] = useState(existingWorkout?.name || "");
  const [workoutDescription, setWorkoutDescription] = useState(existingWorkout?.description || "");
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(existingWorkout?.pdf_url || null);
  const [saving, setSaving] = useState(false);
  const [blocks, setBlocks] = useState(existingWorkout?.blocks || []);

  // Modal state
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState(null);

  // Add new block
  const addBlock = () => {
    const newBlock = {
      id: `block_${Date.now()}`,
      label: `Bloco ${String.fromCharCode(65 + blocks.length)}`,
      type: "single",
      rounds: 1,
      rest_after: 60,
      order: blocks.length + 1,
      exercises: [],
    };
    setBlocks([...blocks, newBlock]);
  };

  // Remove block
  const removeBlock = (blockId) => {
    setBlocks(blocks.filter(b => b.id !== blockId));
  };

  // Update block
  const updateBlock = (blockId, field, value) => {
    setBlocks(blocks.map(b => 
      b.id === blockId ? { ...b, [field]: value } : b
    ));
  };

  // Move block up/down
  const moveBlock = (blockId, direction) => {
    const index = blocks.findIndex(b => b.id === blockId);
    if (direction === "up" && index > 0) {
      const newBlocks = [...blocks];
      [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
      setBlocks(newBlocks);
    } else if (direction === "down" && index < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
      setBlocks(newBlocks);
    }
  };

  // Open exercise selector for a block
  const openExerciseSelector = (blockId) => {
    setActiveBlockId(blockId);
    setShowExerciseSelector(true);
  };

  // Add exercise to block
  const addExerciseToBlock = (exercise) => {
    setBlocks(blocks.map(b => {
      if (b.id === activeBlockId) {
        return {
          ...b,
          exercises: [
            ...b.exercises,
            {
              exercise_id: exercise.id,
              sets: 3,
              reps: "10-12",
              rest: 60,
              tempo: "",
              notes: "",
              order: b.exercises.length + 1,
            }
          ]
        };
      }
      return b;
    }));
  };

  // Remove exercise from block
  const removeExerciseFromBlock = (blockId, exerciseIndex) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        return {
          ...b,
          exercises: b.exercises.filter((_, i) => i !== exerciseIndex)
        };
      }
      return b;
    }));
  };

  // Update exercise in block
  const updateExerciseInBlock = (blockId, exerciseIndex, field, value) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        return {
          ...b,
          exercises: b.exercises.map((ex, i) => 
            i === exerciseIndex ? { ...ex, [field]: value } : ex
          )
        };
      }
      return b;
    }));
  };

  // Move exercise up/down in block
  const moveExerciseInBlock = (blockId, exerciseIndex, direction) => {
    setBlocks(blocks.map(b => {
      if (b.id === blockId) {
        const exercises = [...b.exercises];
        if (direction === "up" && exerciseIndex > 0) {
          [exercises[exerciseIndex - 1], exercises[exerciseIndex]] = [exercises[exerciseIndex], exercises[exerciseIndex - 1]];
        } else if (direction === "down" && exerciseIndex < exercises.length - 1) {
          [exercises[exerciseIndex], exercises[exerciseIndex + 1]] = [exercises[exerciseIndex + 1], exercises[exerciseIndex]];
        }
        return { ...b, exercises };
      }
      return b;
    }));
  };

  // Handle PDF file select (só armazena localmente, faz upload no save)
  const handlePdfUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Apenas arquivos PDF são aceitos");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande (máx. 10MB)");
      return;
    }
    setPdfFile(file);
    toast.success(`PDF selecionado: ${file.name}`);
  };

  // Upload PDF para Supabase Storage
  const uploadPdf = async (workoutId, file) => {
    const safeName = file.name.replace(/\s+/g, "_").replace(/[^a-zA-Z0-9._-]/g, "");
    const path = `templates/${workoutId}/${Date.now()}_${safeName}`;
    const { error: upErr } = await supabase.storage
      .from("workout-pdfs")
      .upload(path, file, { upsert: true });
    if (upErr) throw upErr;
    const { data: { publicUrl } } = supabase.storage.from("workout-pdfs").getPublicUrl(path);
    return publicUrl;
  };

  // Save workout
  const handleSave = async () => {
    if (!workoutName.trim()) {
      toast.error("Nome do treino é obrigatório");
      return;
    }
    setSaving(true);
    try {
      let finalPdfUrl = pdfUrl;

      // Se tem arquivo novo, faz upload primeiro
      if (pdfFile) {
        const tmpId = isNew ? `tmp_${Date.now()}` : id;
        finalPdfUrl = await uploadPdf(tmpId, pdfFile);
      }

      if (isNew) {
        // Cria template no Supabase
        const { data: created, error } = await supabase
          .from("workout_templates")
          .insert([{
            name: workoutName.trim(),
            description: workoutDescription.trim() || null,
            pdf_url: finalPdfUrl || null,
          }])
          .select()
          .single();
        if (error) throw error;

        // Se fez upload com tmpId, re-faz o path com id real
        if (pdfFile && created.id) {
          const realUrl = await uploadPdf(created.id, pdfFile);
          await supabase.from("workout_templates").update({ pdf_url: realUrl }).eq("id", created.id);
        }
        toast.success("Treino criado com sucesso!");
      } else {
        // Atualiza template existente
        const { error } = await supabase
          .from("workout_templates")
          .update({
            name: workoutName.trim(),
            description: workoutDescription.trim() || null,
            pdf_url: finalPdfUrl || null,
          })
          .eq("id", id);
        if (error) throw error;
        toast.success("Treino salvo com sucesso!");
      }

      navigate("/admin/treinos/templates");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Get all exercise IDs in current block
  const getBlockExerciseIds = (blockId) => {
    const block = blocks.find(b => b.id === blockId);
    return block?.exercises.map(e => e.exercise_id) || [];
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate("/admin/treinos/templates")}
            >
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
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar Treino
          </Button>
        </div>

        {/* Basic Info Card */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-display">Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Treino *</Label>
                <Input
                  id="name"
                  value={workoutName}
                  onChange={(e) => setWorkoutName(e.target.value)}
                  placeholder="Ex: Treino A - Push"
                  className="bg-muted border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdf">PDF do Treino</Label>
                <Input
                  id="pdf"
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
                <div
                  onClick={() => document.getElementById("pdf").click()}
                  className="border-2 border-dashed border-border rounded-xl p-4 text-center cursor-pointer hover:border-primary/40 hover:bg-muted/20 transition-all"
                >
                  {pdfFile ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-sm text-foreground truncate">{pdfFile.name}</span>
                        <span className="text-xs text-muted-foreground flex-shrink-0">
                          ({(pdfFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : pdfUrl ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                        <span className="text-xs text-muted-foreground truncate">
                          PDF atual: {decodeURIComponent(pdfUrl.split("/").pop())}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Ver
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => { e.stopPropagation(); setPdfUrl(null); }}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 py-1">
                      <Upload className="h-5 w-5 text-muted-foreground/50" />
                      <p className="text-xs text-muted-foreground">
                        Clique para selecionar um PDF <span className="text-primary">·</span> Máx. 10MB
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={workoutDescription}
                onChange={(e) => setWorkoutDescription(e.target.value)}
                placeholder="Descreva o treino..."
                className="bg-muted border-border min-h-[80px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Workout Builder */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                Blocos do Treino
              </CardTitle>
              <Button variant="outline" className="gap-2" onClick={addBlock}>
                <Plus className="h-4 w-4" />
                Adicionar Bloco
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {blocks.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-border rounded-lg">
                <Layers className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-4">Nenhum bloco adicionado</p>
                <Button variant="outline" className="gap-2" onClick={addBlock}>
                  <Plus className="h-4 w-4" />
                  Adicionar Primeiro Bloco
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {blocks.map((block, blockIndex) => (
                  <Card key={block.id} className="bg-muted/30 border-border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        {/* Reorder buttons */}
                        <div className="flex flex-col gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => moveBlock(block.id, "up")}
                            disabled={blockIndex === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => moveBlock(block.id, "down")}
                            disabled={blockIndex === blocks.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Block header */}
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Nome do Bloco</Label>
                            <Input
                              value={block.label}
                              onChange={(e) => updateBlock(block.id, "label", e.target.value)}
                              className="bg-card border-border h-9"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Tipo</Label>
                            <Select
                              value={block.type}
                              onValueChange={(value) => updateBlock(block.id, "type", value)}
                            >
                              <SelectTrigger className="bg-card border-border h-9">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-card border-border">
                                {blockTypeOptions.map(opt => (
                                  <SelectItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Rounds</Label>
                            <Input
                              type="number"
                              min="1"
                              value={block.rounds}
                              onChange={(e) => updateBlock(block.id, "rounds", parseInt(e.target.value) || 1)}
                              className="bg-card border-border h-9"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Descanso após (s)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={block.rest_after}
                              onChange={(e) => updateBlock(block.id, "rest_after", parseInt(e.target.value) || 0)}
                              className="bg-card border-border h-9"
                            />
                          </div>
                        </div>

                        {/* Block badge & delete */}
                        <div className="flex items-center gap-2">
                          <Badge className={cn("border", blockTypeColors[block.type])}>
                            {getBlockTypeLabel(block.type)}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => removeBlock(block.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Exercises in block */}
                      {block.exercises.length === 0 ? (
                        <div className="py-6 text-center border border-dashed border-border rounded-lg">
                          <Dumbbell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                          <p className="text-sm text-muted-foreground mb-3">Nenhum exercício</p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="gap-2"
                            onClick={() => openExerciseSelector(block.id)}
                          >
                            <Plus className="h-4 w-4" />
                            Adicionar Exercício
                          </Button>
                        </div>
                      ) : (
                        <>
                          {block.exercises.map((blockExercise, exIndex) => {
                            const exerciseData = getExerciseById(blockExercise.exercise_id) || 
                              mockExercises.find(e => e.id === blockExercise.exercise_id);
                            
                            return (
                              <Card key={`${block.id}-${exIndex}`} className="bg-card border-border">
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-3">
                                    {/* Reorder */}
                                    <div className="flex flex-col gap-0.5 pt-1">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5"
                                        onClick={() => moveExerciseInBlock(block.id, exIndex, "up")}
                                        disabled={exIndex === 0}
                                      >
                                        <ChevronUp className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5"
                                        onClick={() => moveExerciseInBlock(block.id, exIndex, "down")}
                                        disabled={exIndex === block.exercises.length - 1}
                                      >
                                        <ChevronDown className="h-3 w-3" />
                                      </Button>
                                    </div>

                                    {/* Exercise info */}
                                    <div className="flex-1 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <Dumbbell className="h-4 w-4 text-primary" />
                                          </div>
                                          <span className="font-medium text-foreground">
                                            {exerciseData?.name || "Exercício"}
                                          </span>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 text-destructive hover:text-destructive"
                                          onClick={() => removeExerciseFromBlock(block.id, exIndex)}
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      </div>

                                      {/* Exercise config */}
                                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                        <div className="space-y-1">
                                          <Label className="text-[10px] text-muted-foreground">Séries</Label>
                                          <Input
                                            type="number"
                                            min="1"
                                            value={blockExercise.sets}
                                            onChange={(e) => updateExerciseInBlock(block.id, exIndex, "sets", parseInt(e.target.value) || 1)}
                                            className="bg-muted border-border h-8 text-sm"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-[10px] text-muted-foreground">Reps</Label>
                                          <Input
                                            value={blockExercise.reps}
                                            onChange={(e) => updateExerciseInBlock(block.id, exIndex, "reps", e.target.value)}
                                            placeholder="10-12"
                                            className="bg-muted border-border h-8 text-sm"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-[10px] text-muted-foreground">Descanso (s)</Label>
                                          <Input
                                            type="number"
                                            min="0"
                                            value={blockExercise.rest}
                                            onChange={(e) => updateExerciseInBlock(block.id, exIndex, "rest", parseInt(e.target.value) || 0)}
                                            className="bg-muted border-border h-8 text-sm"
                                          />
                                        </div>
                                        <div className="space-y-1">
                                          <Label className="text-[10px] text-muted-foreground">Tempo</Label>
                                          <Input
                                            value={blockExercise.tempo}
                                            onChange={(e) => updateExerciseInBlock(block.id, exIndex, "tempo", e.target.value)}
                                            placeholder="3-1-2"
                                            className="bg-muted border-border h-8 text-sm"
                                          />
                                        </div>
                                        <div className="space-y-1 col-span-2 sm:col-span-1">
                                          <Label className="text-[10px] text-muted-foreground">Notas</Label>
                                          <Input
                                            value={blockExercise.notes}
                                            onChange={(e) => updateExerciseInBlock(block.id, exIndex, "notes", e.target.value)}
                                            placeholder="Observações..."
                                            className="bg-muted border-border h-8 text-sm"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}

                          <Button 
                            variant="outline" 
                            size="sm"
                            className="w-full gap-2"
                            onClick={() => openExerciseSelector(block.id)}
                          >
                            <Plus className="h-4 w-4" />
                            Adicionar Exercício
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

      {/* Exercise Selector Modal */}
      <ExerciseSelectorModal
        isOpen={showExerciseSelector}
        onClose={() => {
          setShowExerciseSelector(false);
          setActiveBlockId(null);
        }}
        onSelect={addExerciseToBlock}
        selectedIds={activeBlockId ? getBlockExerciseIds(activeBlockId) : []}
      />
    </AdminLayout>
  );
};

export default WorkoutEditorPage;