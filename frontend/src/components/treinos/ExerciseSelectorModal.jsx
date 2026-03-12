import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Dumbbell, Check, Video, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getExercises } from "@/services/exercisesService";
import { toast } from "sonner";

const ExerciseSelectorModal = ({ isOpen, onClose, onSelect, selectedIds = [] }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Busca exercícios do banco quando o modal abre
  useEffect(() => {
    if (!isOpen) return;

    const load = async () => {
      setLoading(true);
      try {
        const data = await getExercises();
        setExercises(data);
      } catch (err) {
        toast.error("Erro ao carregar exercícios: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen]);

  // Filtra por título ou descrição
  const filteredExercises = exercises.filter(ex =>
    ex.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.default_description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = () => {
    if (!selectedExercise) return;
    onSelect(selectedExercise);
    setSelectedExercise(null);
    setSearchTerm("");
    onClose();
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

        {/* Busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar exercício..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-muted border-border"
            autoFocus
          />
        </div>

        {/* Lista */}
        <ScrollArea className="h-[340px] -mx-6 px-6">
          <div className="space-y-2 py-2">

            {loading && (
              <div className="py-10 flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Carregando exercícios...
              </div>
            )}

            {!loading && filteredExercises.map((exercise) => {
              const isSelected = selectedExercise?.id === exercise.id;
              const isAlreadyAdded = selectedIds.includes(exercise.id);

              return (
                <div
                  key={exercise.id}
                  className={cn(
                    "p-3 rounded-lg border transition-all",
                    isAlreadyAdded
                      ? "opacity-50 cursor-not-allowed border-border bg-muted/30"
                      : "cursor-pointer",
                    !isAlreadyAdded && isSelected
                      ? "border-primary bg-primary/10"
                      : !isAlreadyAdded && "border-border bg-muted/50 hover:border-primary/50"
                  )}
                  onClick={() => !isAlreadyAdded && setSelectedExercise(exercise)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-muted-foreground"
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
                        {exercise.title}
                      </p>
                      {exercise.default_description && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {exercise.default_description}
                        </p>
                      )}
                      {isAlreadyAdded && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Já adicionado
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {!loading && filteredExercises.length === 0 && (
              <div className="py-8 text-center">
                <Dumbbell className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {exercises.length === 0
                    ? "Nenhum exercício cadastrado ainda"
                    : "Nenhum exercício encontrado"}
                </p>
                {exercises.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Cadastre exercícios na página de Exercícios primeiro
                  </p>
                )}
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