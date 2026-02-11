import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Dumbbell, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const FinishWorkoutModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  completedCount, 
  totalCount,
  workoutName
}) => {
  const allCompleted = completedCount === totalCount;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm bg-card border-border">
        <DialogHeader className="text-center">
          {/* Icon */}
          <div className="flex justify-center mb-2">
            <div className={cn(
              "h-16 w-16 rounded-full flex items-center justify-center",
              allCompleted 
                ? "bg-primary/20" 
                : "bg-warning/20"
            )}>
              {allCompleted ? (
                <Trophy className="h-8 w-8 text-primary" />
              ) : (
                <Dumbbell className="h-8 w-8 text-warning" />
              )}
            </div>
          </div>

          <DialogTitle className="text-xl font-display text-foreground">
            {allCompleted ? "Treino Completo!" : "Finalizar Treino?"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {allCompleted 
              ? "Parabéns! Você completou todos os exercícios."
              : `Você completou ${completedCount} de ${totalCount} exercícios (${progressPercent}%).`
            }
          </DialogDescription>
        </DialogHeader>

        {/* Progress Summary */}
        <div className="bg-muted/50 rounded-xl p-4 my-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">{workoutName}</span>
            <span className={cn(
              "text-sm font-bold",
              allCompleted ? "text-primary" : "text-warning"
            )}>
              {progressPercent}%
            </span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500",
                allCompleted 
                  ? "bg-gradient-to-r from-primary to-primary-glow shadow-glow"
                  : "bg-warning"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-2 mt-3">
            <CheckCircle2 className={cn(
              "h-4 w-4",
              allCompleted ? "text-primary" : "text-muted-foreground"
            )} />
            <span className="text-xs text-muted-foreground">
              {completedCount} exercícios concluídos
            </span>
          </div>
        </div>

        {!allCompleted && (
          <p className="text-xs text-center text-muted-foreground">
            Deseja registrar o treino mesmo assim?
          </p>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col mt-2">
          <Button 
            variant="premium" 
            className="w-full"
            onClick={onConfirm}
          >
            <CheckCircle2 className="h-4 w-4" />
            {allCompleted ? "Registrar Treino" : "Finalizar Mesmo Assim"}
          </Button>
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={onClose}
          >
            Continuar Treinando
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const WorkoutCompletedToast = ({ workoutName }) => {
  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
        <Trophy className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="font-semibold text-sm">Treino Registrado!</p>
        <p className="text-xs text-muted-foreground">{workoutName}</p>
      </div>
    </div>
  );
};
