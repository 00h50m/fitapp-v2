import React, { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { 
  MobileContainer, 
  MobileHeader, 
  MobileContent, 
  MobileFooter 
} from "@/components/layout/MobileContainer";
import { WorkoutHeader } from "@/components/workout/WorkoutHeader";
import { ExerciseCard } from "@/components/workout/ExerciseCard";
import { VideoModal } from "@/components/workout/VideoModal";
import { InactiveAccess } from "@/components/workout/InactiveAccess";
import { FinishWorkoutModal, WorkoutCompletedToast } from "@/components/workout/FinishWorkoutModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  mockStudent, 
  mockCurrentWorkout, 
  getExerciseIcon 
} from "@/data/mockData";
import { 
  User, 
  CheckCircle2, 
  Dumbbell,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";

const WorkoutPage = () => {
  // State
  const [student] = useState(mockStudent);
  const [workout] = useState(mockCurrentWorkout);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);

  // Check if access is active
  const isAccessActive = useMemo(() => {
    const today = new Date();
    const accessEnd = new Date(student.access_end);
    return today <= accessEnd;
  }, [student.access_end]);

  // Stats
  const totalExercises = workout.exercises.length;
  const completedCount = completedExercises.size;
  const allCompleted = completedCount === totalExercises;

  // Handlers
  const handleToggleExercise = (exerciseId) => {
    setCompletedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  const handleOpenVideo = (exercise) => {
    setSelectedExercise(exercise);
    setIsVideoModalOpen(true);
  };

  const handleCloseVideo = () => {
    setIsVideoModalOpen(false);
    setTimeout(() => setSelectedExercise(null), 200);
  };

  const handleDownloadPdf = () => {
    // Mock PDF download - would open actual PDF URL
    toast.success("PDF do treino", {
      description: "Download iniciado...",
    });
    // In production: window.open(workout.pdf_url, '_blank');
  };

  const handleContactSupport = () => {
    toast.info("Contato", {
      description: "Abrindo WhatsApp do treinador...",
    });
    // In production: window.open('https://wa.me/...', '_blank');
  };

  const handleFinishWorkout = () => {
    setIsFinishModalOpen(true);
  };

  const handleConfirmFinish = () => {
    // Mock: Create workout_checkin record
    const checkinData = {
      id: `checkin_${Date.now()}`,
      workout_id: workout.id,
      student_id: student.id,
      completed_at: new Date().toISOString(),
      exercises_completed: Array.from(completedExercises),
    };
    
    console.log("Workout Checkin Created:", checkinData);
    
    setIsFinishModalOpen(false);
    
    toast.custom(() => (
      <WorkoutCompletedToast workoutName={workout.name} />
    ), {
      duration: 4000,
    });

    // Reset for next workout session
    setCompletedExercises(new Set());
  };

  // If access is inactive
  if (!isAccessActive) {
    return (
      <MobileContainer>
        <MobileHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{student.name}</p>
              <Badge variant="destructive" className="text-[10px] mt-0.5">
                Acesso Inativo
              </Badge>
            </div>
          </div>
        </MobileHeader>
        <MobileContent>
          <InactiveAccess 
            student={student} 
            onContactSupport={handleContactSupport}
          />
        </MobileContent>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer>
      {/* Header with User Info */}
      <MobileHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{student.name}</p>
              <Badge variant="success" className="text-[10px] mt-0.5">
                Acesso Ativo
              </Badge>
            </div>
          </div>
          {allCompleted && (
            <Badge variant="premium" className="animate-pulse">
              <Sparkles className="h-3 w-3 mr-1" />
              Completo
            </Badge>
          )}
        </div>
      </MobileHeader>

      {/* Main Content */}
      <MobileContent className="pb-24">
        {/* Workout Header */}
        <WorkoutHeader 
          workout={workout}
          completedCount={completedCount}
          totalCount={totalExercises}
          onDownloadPdf={handleDownloadPdf}
        />

        {/* Exercises List */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-primary" />
              Exercícios
            </h2>
            <span className="text-xs text-muted-foreground">
              {completedCount} de {totalExercises} concluídos
            </span>
          </div>

          <div className="space-y-3 stagger-children">
            {workout.exercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                isCompleted={completedExercises.has(exercise.id)}
                onToggleComplete={handleToggleExercise}
                onOpenVideo={handleOpenVideo}
                iconName={getExerciseIcon(exercise.name)}
              />
            ))}
          </div>
        </div>
      </MobileContent>

      {/* Fixed Footer with CTA */}
      <MobileFooter>
        <Button
          variant={allCompleted ? "premium" : "default"}
          size="xl"
          className={cn(
            "w-full",
            allCompleted && "pulse-subtle"
          )}
          onClick={handleFinishWorkout}
          disabled={completedCount === 0}
        >
          <CheckCircle2 className="h-5 w-5" />
          {completedCount === 0 
            ? "Marque exercícios para finalizar"
            : allCompleted 
              ? "Finalizar Treino Completo"
              : `Finalizar Treino (${completedCount}/${totalExercises})`
          }
        </Button>
      </MobileFooter>

      {/* Modals */}
      <VideoModal 
        exercise={selectedExercise}
        isOpen={isVideoModalOpen}
        onClose={handleCloseVideo}
      />

      <FinishWorkoutModal
        isOpen={isFinishModalOpen}
        onClose={() => setIsFinishModalOpen(false)}
        onConfirm={handleConfirmFinish}
        completedCount={completedCount}
        totalCount={totalExercises}
        workoutName={workout.name}
      />
    </MobileContainer>
  );
};

export default WorkoutPage;
