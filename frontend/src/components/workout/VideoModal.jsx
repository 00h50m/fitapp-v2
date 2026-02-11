import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Play, Layers, Repeat, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const VideoModal = ({ exercise, isOpen, onClose }) => {
  if (!exercise) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Badge variant="premium" className="text-xs">
              Exercício #{exercise.order}
            </Badge>
          </div>
          <DialogTitle className="text-lg font-display text-foreground">
            {exercise.name}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Demonstração do exercício {exercise.name}
          </DialogDescription>
        </DialogHeader>

        {/* Video Placeholder */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-muted mt-2">
          <div className="video-placeholder absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className={cn(
              "h-16 w-16 rounded-full",
              "bg-primary/20 backdrop-blur-sm",
              "flex items-center justify-center",
              "border border-primary/30"
            )}>
              <Play className="h-8 w-8 text-primary ml-1" />
            </div>
            <p className="text-sm text-muted-foreground">
              Vídeo demonstrativo
            </p>
            <p className="text-xs text-muted-foreground/60">
              (Conectar video_url do Supabase)
            </p>
          </div>
        </div>

        {/* Exercise Details */}
        <div className="space-y-4 mt-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-muted rounded-lg p-3 text-center">
              <Layers className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold text-foreground">{exercise.sets}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Séries</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <Repeat className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold text-foreground">{exercise.reps}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Reps</p>
            </div>
            <div className="bg-muted rounded-lg p-3 text-center">
              <Clock className="h-4 w-4 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold text-foreground">{exercise.rest_seconds}s</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Descanso</p>
            </div>
          </div>

          {/* Notes */}
          {exercise.notes && (
            <div className="bg-muted/50 rounded-lg p-3 border border-border">
              <div className="flex items-center gap-2 mb-2">
                <Info className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Dicas
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {exercise.notes}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
