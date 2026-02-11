import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

export const WorkoutHeader = ({ 
  workout, 
  completedCount, 
  totalCount, 
  onDownloadPdf 
}) => {
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Workout Title Section */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell className="h-5 w-5 text-primary flex-shrink-0" />
            <Badge variant="premium" className="text-xs">
              Treino Atual
            </Badge>
          </div>
          <h1 className="text-xl font-display font-bold text-foreground truncate">
            {workout.name}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {workout.description}
          </p>
        </div>
      </div>

      {/* Progress & PDF Row */}
      <div className="flex items-center gap-3">
        {/* Progress Indicator */}
        <div className="flex-1 bg-card rounded-xl p-3 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Progresso</span>
            <span className="text-sm font-semibold text-foreground">
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out",
                "bg-gradient-to-r from-primary to-primary-glow",
                progressPercent > 0 && "shadow-glow"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* PDF Button */}
        {workout.pdf_url && (
          <Button
            variant="outline"
            size="icon"
            className="h-[62px] w-14 flex-shrink-0 flex-col gap-0.5"
            onClick={onDownloadPdf}
          >
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-[10px] text-muted-foreground">PDF</span>
          </Button>
        )}
      </div>

      {/* Date Info */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        <span>
          Criado em {new Date(workout.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })}
        </span>
      </div>
    </div>
  );
};
