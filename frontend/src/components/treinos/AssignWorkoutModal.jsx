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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockStudents, mockWorkoutTemplates } from "@/data/mockTreinosData";
import { Save, X, User, ClipboardList } from "lucide-react";

const AssignWorkoutModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    student_id: "",
    workout_id: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: "",
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const student = mockStudents.find(s => s.id === formData.student_id);
    const workout = mockWorkoutTemplates.find(w => w.id === formData.workout_id);
    
    onSave({
      ...formData,
      id: `cw_${Date.now()}`,
      student_name: student?.name || "",
      workout_name: workout?.name || "",
      status: "active",
      created_at: new Date().toISOString(),
    });
    
    // Reset form
    setFormData({
      student_id: "",
      workout_id: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-display text-foreground">
            Criar Treino Personalizado
          </DialogTitle>
          <DialogDescription>
            Atribua um treino a um aluno específico
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Student */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Aluno *
            </Label>
            <Select
              value={formData.student_id}
              onValueChange={(value) => handleChange("student_id", value)}
              required
            >
              <SelectTrigger className="bg-muted border-border">
                <SelectValue placeholder="Selecione um aluno..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {mockStudents.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    <div className="flex items-center gap-2">
                      <span>{student.name}</span>
                      <span className="text-muted-foreground text-xs">({student.email})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Workout Template */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              Treino *
            </Label>
            <Select
              value={formData.workout_id}
              onValueChange={(value) => handleChange("workout_id", value)}
              required
            >
              <SelectTrigger className="bg-muted border-border">
                <SelectValue placeholder="Selecione um treino..." />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {mockWorkoutTemplates.map(workout => (
                  <SelectItem key={workout.id} value={workout.id}>
                    {workout.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Início *</Label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                className="bg-muted border-border"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Data Fim *</Label>
              <Input
                type="date"
                value={formData.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
                className="bg-muted border-border"
                min={formData.start_date}
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button type="submit" variant="premium">
              <Save className="h-4 w-4 mr-2" />
              Atribuir Treino
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AssignWorkoutModal;
