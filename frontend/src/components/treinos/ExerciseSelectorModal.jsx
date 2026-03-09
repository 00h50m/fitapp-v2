import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  mockExercises, 
  getMuscleGroupLabel 
} from "@/data/mockTreinosData";
import { Search, Dumbbell, Check, Video } from "lucide-react";
import { cn } from "@/lib/utils";

// Muscle group badge colors
const muscleGroupColors = {
  chest: "bg-red-500/15 text-red-400 border-red-500/30",
  back: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  legs: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  shoulders: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  biceps: "bg-green-500/15 text-green-400 border-green-500/30",
  triceps: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
  core: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  cardio: "bg-pink-500/15 text-pink-400 border-pink-500/30",
};

const ExerciseSelectorModal = ({ isOpen, onClose, onSelect, selectedIds = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Filter exercises
  const filteredExercises = mockExercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getMuscleGroupLabel(ex.muscle_group).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle select
  const handleSelect = () => {
    if (selectedExercise) {
      onSelect(selectedExercise);
      setSelectedExercise(null);
      setSearchTerm("");
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedExercise(null);
    setSearchTerm("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-display text-foreground flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            Selecionar Exercício
          </DialogTitle>
          <DialogDescription>
            Escolha um exercício da biblioteca
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar exercício..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted border-border"
          />
        </div>

        {/* Exercise List */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-2 py-2">
            {filteredExercises.map((exercise) => {
              const isSelected = selectedExercise?.id === exercise.id;
              const isAlreadyAdded = selectedIds.includes(exercise.id);

              return (
                <div
                  key={exercise.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all",
                    isSelected 
                      ? "border-primary bg-primary/10" 
                      : "border-border bg-muted/50 hover:border-primary/50",
                    isAlreadyAdded && "opacity-50"
                  )}
                  onClick={() => !isAlreadyAdded && setSelectedExercise(exercise)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
                    )}>
                      {isSelected ? (
                        <Check className="h-5 w-5" />
                      ) : exercise.video_url ? (
                        <Video className="h-5 w-5" />
                      ) : (
                        <Dumbbell className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium truncate",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {exercise.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={cn("text-[10px] border", muscleGroupColors[exercise.muscle_group])}>
                          {getMuscleGroupLabel(exercise.muscle_group)}
                        </Badge>
                        {isAlreadyAdded && (
                          <span className="text-[10px] text-muted-foreground">Já adicionado</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredExercises.length === 0 && (
              <div className="py-8 text-center">
                <Dumbbell className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">Nenhum exercício encontrado</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="ghost" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            variant="premium" 
            onClick={handleSelect}
            disabled={!selectedExercise}
          >
            Adicionar Exercício
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseSelectorModal;
