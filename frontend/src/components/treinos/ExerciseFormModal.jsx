import React, { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Save, X, Video, Loader2, AlertCircle } from "lucide-react";

const muscleGroupOptions = [
  { value: "chest", label: "Peito" },
  { value: "back", label: "Costas" },
  { value: "legs", label: "Pernas" },
  { value: "shoulders", label: "Ombros" },
  { value: "biceps", label: "Bíceps" },
  { value: "triceps", label: "Tríceps" },
  { value: "core", label: "Core / Abdômen" },
  { value: "glutes", label: "Glúteos" },
  { value: "cardio", label: "Cardio" },
  { value: "full_body", label: "Corpo Inteiro" },
];

const equipmentOptions = [
  { value: "barbell", label: "Barra" },
  { value: "dumbbell", label: "Halteres" },
  { value: "machine", label: "Máquina" },
  { value: "cable", label: "Cabo / Polia" },
  { value: "bodyweight", label: "Peso Corporal" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "resistance_band", label: "Elástico" },
  { value: "none", label: "Sem Equipamento" },
];

const difficultyOptions = [
  { value: "beginner", label: "Iniciante" },
  { value: "intermediate", label: "Intermediário" },
  { value: "advanced", label: "Avançado" },
];

const getEmbedUrl = (url) => {
  if (!url) return "";
  if (url.includes("/embed/")) return url;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : "";
};

const ExerciseFormModal = ({ isOpen, onClose, exercise, onSave }) => {
  const isEditing = !!exercise;
  const [formData, setFormData] = useState({
    title: "", description: "", video_url: "",
    muscle_group: "", equipment: "", difficulty: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const embedUrl = getEmbedUrl(formData.video_url);

  // Reset form when modal opens/exercise changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: exercise?.title ?? exercise?.name ?? "",
        description: exercise?.description ?? "",
        video_url: exercise?.video_url ?? "",
        muscle_group: exercise?.muscle_group ?? "",
        equipment: exercise?.equipment ?? "",
        difficulty: exercise?.difficulty ?? "",
      });
      setError(null);
      setSaving(false);
    }
  }, [isOpen, exercise]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      setError("Nome do exercício é obrigatório");
      return;
    }
    setSaving(true);
    setError(null);
    const result = await onSave({
      ...formData,
      id: exercise?.id,
    });
    // onSave retorna false em caso de duplicata — modal NÃO fecha
    if (result === false) {
      setSaving(false);
      setError("Já existe um exercício com esse nome.");
    } else {
      setSaving(false);
      // modal fechado pelo pai
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display text-foreground">
            {isEditing ? "Editar Exercício" : "Novo Exercício"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize as informações do exercício" : "Preencha os dados do novo exercício"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="title">Nome do Exercício *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ex: Supino Reto com Barra"
              className="bg-muted border-border"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descreva a execução do exercício..."
              className="bg-muted border-border min-h-[80px]"
            />
          </div>

          {/* URL Vídeo */}
          <div className="space-y-2">
            <Label htmlFor="video_url">URL do Vídeo (YouTube)</Label>
            <Input
              id="video_url"
              value={formData.video_url}
              onChange={(e) => handleChange("video_url", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="bg-muted border-border"
            />
            {/* Embed preview */}
            {embedUrl ? (
              <div className="mt-2">
                <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                  <Video className="h-3 w-3" />Pré-visualização do vídeo
                </p>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted border border-border">
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Video preview"
                  />
                </div>
              </div>
            ) : formData.video_url ? (
              <p className="text-xs text-destructive/70 mt-1">
                URL inválida — use um link do YouTube (youtube.com/watch?v=... ou youtu.be/...)
              </p>
            ) : null}
          </div>

          {/* Grupo Muscular / Equipamento / Dificuldade */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Grupo Muscular</Label>
              <Select value={formData.muscle_group} onValueChange={(v) => handleChange("muscle_group", v)}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {muscleGroupOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Equipamento</Label>
              <Select value={formData.equipment} onValueChange={(v) => handleChange("equipment", v)}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {equipmentOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dificuldade</Label>
              <Select value={formData.difficulty} onValueChange={(v) => handleChange("difficulty", v)}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {difficultyOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            <X className="h-4 w-4 mr-2" />Cancelar
          </Button>
          <Button variant="premium" onClick={handleSubmit} disabled={saving}>
            {saving
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</>
              : <><Save className="h-4 w-4 mr-2" />{isEditing ? "Salvar Alterações" : "Criar Exercício"}</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseFormModal;