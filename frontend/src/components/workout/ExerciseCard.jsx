import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Clock, 
  Repeat, 
  Layers,
  ChevronRight,
  Dumbbell,
  Zap,
  TrendingUp,
  ArrowUp,
  MoveHorizontal,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

// Icon mapping for exercises
const iconMap = {
  dumbbell: Dumbbell,
  zap: Zap,
  "trending-up": TrendingUp,
  "arrow-up": ArrowUp,
  "move-horizontal": MoveHorizontal,
  activity: Activity,
};

export const ExerciseCard = ({ 
  exercise, 
  isCompleted, 
  onToggleComplete,
  onOpenVideo,
  iconName = "activity"
}) => {
  const IconComponent = iconMap[iconName] || Activity;

  return (
    <div 
      className={cn(
        "exercise-card group",
        "relative overflow-hidden",
        "bg-card rounded-xl border border-border",
        "p-4",
        "hover:border-primary/30 hover:shadow-md",
        isCompleted && "border-primary/40 bg-primary/5"
      )}
    >
      {/* Completed Glow Effect */}
      {isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
      )}

      <div className="relative flex gap-3">
        {/* Checkbox */}
        <div className="flex-shrink-0 pt-0.5">
          <Checkbox 
            checked={isCompleted}
            onCheckedChange={() => onToggleComplete(exercise.id)}
            className="h-6 w-6"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Exercise Name & Number */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className={cn(
                "flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center",
                isCompleted 
                  ? "bg-primary/20 text-primary" 
                  : "bg-muted text-muted-foreground"
              )}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h3 className={cn(
                  "font-semibold text-sm leading-tight truncate",
                  isCompleted ? "text-primary" : "text-foreground"
                )}>
                  {exercise.name}
                </h3>
              </div>
            </div>
            <Badge 
              variant={isCompleted ? "success" : "secondary"}
              className="flex-shrink-0 text-[10px] px-2"
            >
              #{exercise.order}
            </Badge>
          </div>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Layers className="h-3.5 w-3.5" />
              <span>{exercise.sets} séries</span>
            </div>
            <div className="flex items-center gap-1">
              <Repeat className="h-3.5 w-3.5" />
              <span>{exercise.reps} reps</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{exercise.rest_seconds}s descanso</span>
            </div>
          </div>

          {/* Notes */}
          {exercise.notes && (
            <p className="text-xs text-muted-foreground/80 italic line-clamp-2 mb-2">
              "{exercise.notes}"
            </p>
          )}

          {/* Video Button */}
          <button
            onClick={() => onOpenVideo(exercise)}
            className={cn(
              "flex items-center gap-2 w-full",
              "py-2.5 px-3 rounded-lg",
              "bg-muted/50 hover:bg-muted",
              "text-xs font-medium text-muted-foreground hover:text-foreground",
              "transition-colors duration-200",
              "group/video"
            )}
          >
            <div className="video-placeholder h-8 w-12 rounded-md flex items-center justify-center">
              <Play className="h-4 w-4 text-primary" />
            </div>
            <span className="flex-1 text-left">Ver demonstração do exercício</span>
            <ChevronRight className="h-4 w-4 opacity-50 group-hover/video:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    </div>
  );
};
