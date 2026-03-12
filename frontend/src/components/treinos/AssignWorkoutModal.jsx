import React, { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Save, X, User, ClipboardList, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { copyTemplateToStudent } from "@/services/workoutService";
import { toast } from "sonner";

const AssignWorkoutModal = ({ isOpen, onClose, onSave }) => {
  const [students, setStudents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    student_id: "",
    template_id: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  });

  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [studentsRes, templatesRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("id, name, email")
            .eq("role", "student")
            .eq("is_active", true)
            .order("name"),
          supabase
            .from("workout_templates")
            .select("id, title")
            .eq("is_active", true)
            .order("title"),
        ]);
        if (studentsRes.error) throw studentsRes.error;
        if (templatesRes.error) throw templatesRes.error;
        setStudents(studentsRes.data || []);
        setTemplates(templatesRes.data || []);
      } catch (err) {
        toast.error("Erro ao carregar dados: " + err.message);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.student_id || !formData.template_id || !formData.end_date) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setSaving(true);
    try {
      const template = templates.find(t => t.id === formData.template_id);
      const student = students.find(s => s.id === formData.student_id);

      // 1. Cria student_workout
      // student_id referencia profiles.id (que é igual ao auth.uid)
      const { data: studentWorkout, error } = await supabase
        .from("student_workouts")
        .insert([{
          student_id: formData.student_id,
          template_id: formData.template_id,
          title: template?.title || "Treino",
          start_date: formData.start_date,
          end_date: formData.end_date,
          status: "active",
        }])
        .select()
        .single();

      if (error) throw error;

      // 2. Copia blocos/exercícios do template para student_workout_blocks/exercises
      await copyTemplateToStudent({
        studentWorkoutId: studentWorkout.id,
        templateId: formData.template_id,
        studentProfileId: formData.student_id,
        title: template?.title || "Treino",
      });

      toast.success(`Treino atribuído para ${student?.name}!`);
      onSave?.(studentWorkout);
      onClose();

      setFormData({
        student_id: "",
        template_id: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
      });
    } catch (err) {
      console.error("Erro ao atribuir treino:", err);
      toast.error("Erro ao atribuir treino: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-display text-foreground">
            Atribuir Treino
          </DialogTitle>
          <DialogDescription>
            Atribua um template de treino a um aluno
          </DialogDescription>
        </DialogHeader>

        {loadingData ? (
          <div className="py-8 flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando dados...
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                Aluno *
              </Label>
              <Select value={formData.student_id} onValueChange={v => handleChange("student_id", v)}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Selecione um aluno..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {students.length === 0
                    ? <SelectItem value="none" disabled>Nenhum aluno cadastrado</SelectItem>
                    : students.map(s => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                          {s.email && <span className="text-muted-foreground text-xs ml-2">({s.email})</span>}
                        </SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                Treino *
              </Label>
              <Select value={formData.template_id} onValueChange={v => handleChange("template_id", v)}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Selecione um treino..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {templates.length === 0
                    ? <SelectItem value="none" disabled>Nenhum template cadastrado</SelectItem>
                    : templates.map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Início *</Label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={e => handleChange("start_date", e.target.value)}
                  className="bg-muted border-border"
                />
              </div>
              <div className="space-y-2">
                <Label>Data Fim *</Label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={e => handleChange("end_date", e.target.value)}
                  className="bg-muted border-border"
                  min={formData.start_date}
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 pt-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="premium" disabled={saving || loadingData}>
            {saving
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</>
              : <><Save className="h-4 w-4 mr-2" />Atribuir Treino</>
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignWorkoutModal;