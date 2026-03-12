import React, { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  muscleGroupOptions, equipmentOptions, difficultyOptions,
  categoryOptions, mechanicsOptions, forceOptions,
  muscleGroupColors, getLabel,
} from "@/services/exercisesService";
import {
  Save, X, Video, Dumbbell, Tag, Info,
  ChevronDown, ChevronUp, Layers, Zap, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EMPTY = {
  title: "", default_description: "", video_url: "", thumbnail_url: "",
  muscle_group: "", secondary_muscles: [], equipment: "", difficulty: "",
  category: "", mechanics: "", force: "", instructions: "", tips: "", tags: [],
};

const Section = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button type="button"
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/40 hover:bg-muted/60 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm text-foreground">{title}</span>
        </div>
        {open
          ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
          : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
};

const TagInput = ({ value = [], onChange }) => {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim().toLowerCase();
    if (v && !value.includes(v)) onChange([...value, v]);
    setInput("");
  };
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="Digite uma tag e pressione Enter"
          className="bg-muted border-border flex-1" />
        <Button type="button" variant="outline" size="sm" onClick={add}>Adicionar</Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary">
              {tag}
              <button type="button" onClick={() => onChange(value.filter(t => t !== tag))}>
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

const MultiMuscleSelect = ({ value = [], onChange }) => {
  const toggle = v =>
    value.includes(v) ? onChange(value.filter(x => x !== v)) : onChange([...value, v]);
  return (
    <div className="flex flex-wrap gap-1.5">
      {muscleGroupOptions.map(opt => (
        <button key={opt.value} type="button" onClick={() => toggle(opt.value)}
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium border transition-all",
            value.includes(opt.value)
              ? muscleGroupColors[opt.value] || "bg-primary/15 text-primary border-primary/30"
              : "bg-muted/50 text-muted-foreground border-border hover:border-primary/30"
          )}>
          {opt.label}
        </button>
      ))}
    </div>
  );
};

const ExerciseFormModal = ({ isOpen, onClose, exercise, onSave }) => {
  const isEditing = !!exercise?.id;
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");   // ← erro inline no modal

  useEffect(() => {
    if (isOpen) {
      setError("");
      setForm(exercise ? {
        ...EMPTY, ...exercise,
        title: exercise.title ?? exercise.name ?? "",
        default_description: exercise.default_description ?? exercise.description ?? "",
        video_url: exercise.video_url ?? "",
        thumbnail_url: exercise.thumbnail_url ?? "",
        muscle_group: exercise.muscle_group ?? "",
        equipment: exercise.equipment ?? "",
        difficulty: exercise.difficulty ?? "",
        category: exercise.category ?? "",
        mechanics: exercise.mechanics ?? "",
        force: exercise.force ?? "",
        instructions: exercise.instructions ?? "",
        tips: exercise.tips ?? "",
        secondary_muscles: exercise.secondary_muscles ?? [],
        tags: exercise.tags ?? [],
      } : EMPTY);
    }
  }, [exercise, isOpen]);

  const set = (f, v) => { setError(""); setForm(p => ({ ...p, [f]: v })); };

  const ytId = (() => {
    const m = form.video_url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return m ? m[1] : null;
  })();

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.title?.trim()) { setError("O nome do exercício é obrigatório"); return; }

    setSaving(true);
    setError("");
    try {
      await onSave(form);
      // onSave bem-sucedido → fecha modal (ExercisesPage chama onClose após)
    } catch (err) {
      // Mostra erro inline — NÃO fecha o modal
      setError(err.message || "Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={v => { if (!saving) onClose(); }}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[92vh] overflow-y-auto p-0">
        {/* Header fixo */}
        <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">
          <DialogHeader>
            <DialogTitle className="text-xl font-display text-foreground flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              {isEditing ? "Editar Exercício" : "Novo Exercício"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {isEditing ? "Atualize as informações do exercício" : "Cadastre um novo exercício na biblioteca"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Banner de erro */}
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Informações Básicas */}
          <Section title="Informações Básicas" icon={Info}>
            <div className="space-y-2">
              <Label>Nome do Exercício *</Label>
              <Input value={form.title} onChange={e => set("title", e.target.value)}
                placeholder="Ex: Supino Reto com Barra"
                className={cn("bg-muted border-border", error && !form.title?.trim() && "border-destructive")}
                required />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={form.default_description} onChange={e => set("default_description", e.target.value)}
                placeholder="Descreva o exercício..."
                className="bg-muted border-border min-h-[80px]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Grupo Muscular Principal</Label>
                <Select value={form.muscle_group} onValueChange={v => set("muscle_group", v)}>
                  <SelectTrigger className="bg-muted border-border"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {muscleGroupOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {form.muscle_group && (
                  <Badge className={cn("border text-xs mt-1", muscleGroupColors[form.muscle_group])}>
                    {getLabel(muscleGroupOptions, form.muscle_group)}
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                <Label>Equipamento</Label>
                <Select value={form.equipment} onValueChange={v => set("equipment", v)}>
                  <SelectTrigger className="bg-muted border-border"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {equipmentOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Dificuldade</Label>
                <Select value={form.difficulty} onValueChange={v => set("difficulty", v)}>
                  <SelectTrigger className="bg-muted border-border"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {difficultyOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Músculos Secundários</Label>
              <p className="text-xs text-muted-foreground">Clique para selecionar múltiplos grupos</p>
              <MultiMuscleSelect value={form.secondary_muscles} onChange={v => set("secondary_muscles", v)} />
            </div>
          </Section>

          {/* Classificação */}
          <Section title="Classificação Técnica" icon={Layers} defaultOpen={false}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.category} onValueChange={v => set("category", v)}>
                  <SelectTrigger className="bg-muted border-border"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {categoryOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mecânica</Label>
                <Select value={form.mechanics} onValueChange={v => set("mechanics", v)}>
                  <SelectTrigger className="bg-muted border-border"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {mechanicsOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Padrão de Força</Label>
                <Select value={form.force} onValueChange={v => set("force", v)}>
                  <SelectTrigger className="bg-muted border-border"><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {forceOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Section>

          {/* Execução */}
          <Section title="Execução & Dicas" icon={Zap} defaultOpen={false}>
            <div className="space-y-2">
              <Label>Instruções de Execução</Label>
              <Textarea value={form.instructions} onChange={e => set("instructions", e.target.value)}
                placeholder="Passo a passo de como executar o exercício..."
                className="bg-muted border-border min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <Label>Dicas do Treinador</Label>
              <Textarea value={form.tips} onChange={e => set("tips", e.target.value)}
                placeholder="Dicas de forma, erros comuns a evitar..."
                className="bg-muted border-border min-h-[80px]" />
            </div>
          </Section>

          {/* Mídia */}
          <Section title="Mídia" icon={Video}>
            <div className="space-y-2">
              <Label>URL do Vídeo (YouTube)</Label>
              <Input value={form.video_url} onChange={e => set("video_url", e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="bg-muted border-border" />
            </div>
            {ytId && (
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Pré-visualização</Label>
                <div className="aspect-video rounded-xl overflow-hidden border border-border bg-muted">
                  <iframe src={`https://www.youtube.com/embed/${ytId}`} className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen title="preview" />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>URL da Thumbnail (opcional)</Label>
              <Input value={form.thumbnail_url} onChange={e => set("thumbnail_url", e.target.value)}
                placeholder="https://..." className="bg-muted border-border" />
              {form.thumbnail_url && (
                <img src={form.thumbnail_url} alt="thumbnail"
                  className="h-20 rounded-lg border border-border object-cover"
                  onError={e => { e.target.style.display = "none"; }} />
              )}
            </div>
          </Section>

          {/* Tags */}
          <Section title="Tags de Busca" icon={Tag} defaultOpen={false}>
            <p className="text-xs text-muted-foreground">
              Palavras-chave para facilitar a busca (ex: empurrar, peito, força)
            </p>
            <TagInput value={form.tags} onChange={v => set("tags", v)} />
          </Section>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              <X className="h-4 w-4 mr-2" />Cancelar
            </Button>
            <Button type="submit" variant="premium" disabled={saving || !form.title?.trim()}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Exercício"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseFormModal;