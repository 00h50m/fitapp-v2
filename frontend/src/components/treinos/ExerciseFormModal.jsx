import React, { useState, useEffect } from "react";
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
import { Save, X, Video, Loader2 } from "lucide-react";
import { createExercise, updateExercise } from "@/services/exercisesService";
import { toast } from "sonner";

const ExerciseFormModal = ({ isOpen, onClose, exercise, onSave }) => {
  const isEditing = !!exercise;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    video_url: "",
  });
  const [saving, setSaving] = useState(false);

  // Preenche o form ao abrir em modo edição
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: exercise?.title || "",
        description: exercise?.default_description || "",
        video_url: exercise?.video_url || "",
      });
    }
  }, [isOpen, exercise]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Nome do exercício é obrigatório");
      return;
    }

    setSaving(true);
    try {
      let saved;

      if (isEditing) {
        saved = await updateExercise(exercise.id, formData);
        toast.success("Exercício atualizado!");
      } else {
        saved = await createExercise(formData);
        toast.success("Exercício criado!");
      }

      onSave(saved);
      onClose();
    } catch (err) {
      console.error("Erro ao salvar exercício:", err);
      toast.error("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("embed")) return url;
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display text-foreground">
            {isEditing ? "Editar Exercício" : "Novo Exercício"}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize as informações do exercício" : "Preencha os dados do novo exercício"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Nome do Exercício *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Ex: Supino Reto com Barra"
              className="bg-muted border-border"
              required
            />
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="video_url">URL do Vídeo (YouTube)</Label>
            <Input
              id="video_url"
              value={formData.video_url}
              onChange={(e) => handleChange("video_url", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="bg-muted border-border"
            />

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

          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" variant="premium" disabled={saving}>
              {saving ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</>
              ) : (
                <><Save className="h-4 w-4 mr-2" />{isEditing ? "Salvar Alterações" : "Criar Exercício"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseFormModal;