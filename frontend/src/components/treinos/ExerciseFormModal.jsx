import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  muscleGroupOptions, 
  equipmentOptions, 
  difficultyOptions 
} from "@/data/mockTreinosData";
import { Save, X, Video } from "lucide-react";

const ExerciseFormModal = ({ isOpen, onClose, exercise, onSave }) => {
  const isEditing = !!exercise;
  
  const [formData, setFormData] = useState({
    name: exercise?.name || "",
    description: exercise?.description || "",
    video_url: exercise?.video_url || "",
    muscle_group: exercise?.muscle_group || "",
    equipment: exercise?.equipment || "",
    difficulty: exercise?.difficulty || "",
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: exercise?.id || `ex_${Date.now()}`,
      created_at: exercise?.created_at || new Date().toISOString(),
    });
    onClose();
  };

  // Extract YouTube embed URL
  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("embed")) return url;
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display text-foreground">
            {isEditing ? "Editar Exercício" : "Novo Exercício"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize as informações do exercício" : "Preencha os dados do novo exercício"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Exercício *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ex: Supino Reto com Barra"
              className="bg-muted border-border"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descreva o exercício..."
              className="bg-muted border-border min-h-[80px]"
            />
          </div>

          {/* Video URL */}
          <div className="space-y-2">
            <Label htmlFor="video_url">URL do Vídeo (YouTube)</Label>
            <Input
              id="video_url"
              value={formData.video_url}
              onChange={(e) => handleChange("video_url", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="bg-muted border-border"
            />
            
            {/* Video Preview */}
            {formData.video_url && (
              <div className="mt-3">
                <Label className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
                  <Video className="h-3 w-3" />
                  Pré-visualização
                </Label>
                <div className="aspect-video rounded-lg overflow-hidden bg-muted border border-border">
                  <iframe
                    src={getEmbedUrl(formData.video_url)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Video preview"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Muscle Group, Equipment, Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Muscle Group */}
            <div className="space-y-2">
              <Label>Grupo Muscular *</Label>
              <Select
                value={formData.muscle_group}
                onValueChange={(value) => handleChange("muscle_group", value)}
              >
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {muscleGroupOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Equipment */}
            <div className="space-y-2">
              <Label>Equipamento *</Label>
              <Select
                value={formData.equipment}
                onValueChange={(value) => handleChange("equipment", value)}
              >
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {equipmentOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty */}
            <div className="space-y-2">
              <Label>Dificuldade *</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => handleChange("difficulty", value)}
              >
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {difficultyOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" variant="premium">
              <Save className="h-4 w-4 mr-2" />
              {isEditing ? "Salvar Alterações" : "Criar Exercício"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseFormModal;
