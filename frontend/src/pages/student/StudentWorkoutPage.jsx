import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  MobileContainer, 
  MobileHeader, 
  MobileContent,
  MobileFooter
} from '@/components/layout/MobileContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Dumbbell,
  Play,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Layers,
  Repeat,
  Clock,
  Video,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const StudentWorkoutPage = () => {
  const { user, profile, logout } = useAuth();
  const [workoutData, setWorkoutData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [startingWorkout, setStartingWorkout] = useState(false);
  const [finishingWorkout, setFinishingWorkout] = useState(false);

  const toggleExercise = async (exerciseId) => {
    if (!activeSession) return;
    try {
      await supabase
        .from("workout_exercise_logs")
        .upsert({
          session_id: activeSession.id,
          exercise_id: exerciseId,
          completed: true,
          completed_at: new Date().toISOString()
        });
    } catch (err) {
      console.error("Erro ao marcar exercício:", err);
    }
  };

  const fetchWorkout = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('v_student_workout')
        .select('*')
        .eq('student_id', user.id)
        .order('block_order', { ascending: true })
        .order('exercise_order', { ascending: true });

      if (fetchError) throw fetchError;
      setWorkoutData(data || []);

      const { data: sessionData, error: sessionError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('student_id', user.id)
        .eq('completed', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!sessionError && sessionData) {
        setActiveSession(sessionData);
      }
    } catch (err) {
      console.error('Erro ao buscar treino:', err);
      setError(err.message || 'Erro ao carregar treino');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWorkout();
    }
  }, [user]);

  const groupedByBlock = workoutData.reduce((acc, item) => {
    const blockKey = item.block_order || 0;
    if (!acc[blockKey]) {
      acc[blockKey] = {
        block_label: item.block_label || `Bloco ${blockKey}`,
        block_order: blockKey,
        exercises: []
      };
    }
    acc[blockKey].exercises.push(item);
    return acc;
  }, {});

  const blocks = Object.values(groupedByBlock).sort((a, b) => a.block_order - b.block_order);
  const workoutTitle = workoutData[0]?.workout_title || 'Meu Treino';

  const handleStartWorkout = async () => {
    if (!user || !workoutData.length) return;
    setStartingWorkout(true);

    try {
      const workoutId = workoutData[0]?.workout_id;
      const today = new Date().toISOString().split("T")[0];

      const { data: existingSession, error: checkError } = await supabase
        .from("workout_sessions")
        .select("*")
        .eq("student_id", user.id)
        .eq("workout_id", workoutId)
        .eq("session_date", today)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existingSession) {
        setActiveSession(existingSession);
        toast.success("Treino retomado!");
        return;
      }

      const { data, error } = await supabase
        .from("workout_sessions")
        .insert([{
          student_id: user.id,
          workout_id: workoutId,
          session_date: today,
          started_at: new Date().toISOString(),
          status: "active",
          finished: false
        }])
        .select()
        .single();

      if (error) throw error;

      setActiveSession(data);
      toast.success("Treino iniciado!");
    } catch (err) {
      console.error("Erro ao iniciar treino:", err);
      toast.error(err.message || "Erro ao iniciar treino");
    } finally {
      setStartingWorkout(false);
    }
  };

  const handleFinishWorkout = async () => {
    if (!activeSession) return;
    setFinishingWorkout(true);

    try {
      const { error: updateError } = await supabase
        .from("workout_sessions")
        .update({
          completed: true,
          completed_at: new Date().toISOString(),
          finished_at: new Date().toISOString(),
          status: "finished",
          finished: true
        })
        .eq("id", activeSession.id);

      if (updateError) throw updateError;

      setActiveSession(null);
      toast.success("Treino concluído!");
    } catch (err) {
      console.error("Erro ao finalizar treino:", err);
      toast.error(err.message || "Erro ao finalizar treino");
    } finally {
      setFinishingWorkout(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      toast.error('Erro ao sair');
    }
  };

  return (
    <MobileContainer>
      <MobileHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">
                {profile?.name || 'Aluno'}
              </p>
              <Badge variant={activeSession ? "premium" : "success"} className="text-[10px] mt-0.5">
                {activeSession ? "Treinando" : "Aluno"}
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </MobileHeader>

      <MobileContent className="pb-24">
        <div className="space-y-4 animate-fade-in">

          {loading && (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin mb-4" />
              <p className="text-muted-foreground">Carregando treino...</p>
            </div>
          )}

          {error && !loading && (
            <Card className="bg-card border-destructive/30">
              <CardContent className="py-8 text-center">
                <AlertCircle className="h-10 w-10 mx-auto text-destructive mb-4" />
                <p className="text-destructive font-medium mb-2">Erro ao carregar</p>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button variant="outline" onClick={fetchWorkout} size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
              </CardContent>
            </Card>
          )}

          {!loading && !error && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Dumbbell className="h-5 w-5 text-primary" />
                    <Badge variant="premium" className="text-xs">
                      Treino Atual
                    </Badge>
                  </div>
                  <h1 className="text-xl font-display font-bold text-foreground">
                    {workoutTitle}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    {blocks.length} blocos • {workoutData.length} exercícios
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={fetchWorkout}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              {blocks.map((block) => (
                <div key={block.block_order} className="space-y-3">
                  <div className="flex items-center gap-2 pt-2">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Layers className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="font-semibold text-foreground">
                      {block.block_label}
                    </h2>
                    <Badge variant="secondary" className="text-xs">
                      {block.exercises.length} exercícios
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {block.exercises.map((exercise, exIndex) => (
                      <Card
                        key={`${block.block_order}-${exercise.exercise_order}-${exIndex}`}
                        className="bg-card border-border"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground">
                                {exercise.exercise_name || 'Exercício'}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              #{exercise.exercise_order || exIndex + 1}
                            </Badge>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-3">
                            {exercise.sets && (
                              <div className="flex items-center gap-1">
                                <Layers className="h-3.5 w-3.5" />
                                <span>{exercise.sets} séries</span>
                              </div>
                            )}
                            {exercise.reps && (
                              <div className="flex items-center gap-1">
                                <Repeat className="h-3.5 w-3.5" />
                                <span>{exercise.reps} reps</span>
                              </div>
                            )}
                            {exercise.rest_seconds && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{exercise.rest_seconds}s descanso</span>
                              </div>
                            )}
                          </div>

                          {exercise.video_url && (
                            <a
                              href={exercise.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(
                                "flex items-center gap-2 w-full",
                                "py-2.5 px-3 rounded-lg",
                                "bg-muted/50 hover:bg-muted",
                                "text-xs font-medium text-muted-foreground hover:text-foreground",
                                "transition-colors duration-200"
                              )}
                            >
                              <div className="h-8 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                                <Video className="h-4 w-4 text-primary" />
                              </div>
                              <span className="flex-1 text-left">Ver vídeo demonstrativo</span>
                            </a>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}

              {workoutData.length === 0 && (
                <Card className="bg-card border-border">
                  <CardContent className="py-12 text-center">
                    <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum treino disponível
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </MobileContent>

      {!loading && !error && workoutData.length > 0 && (
        <MobileFooter>
          {!activeSession ? (
            <Button
              variant="premium"
              size="xl"
              className="w-full"
              onClick={handleStartWorkout}
              disabled={startingWorkout}
            >
              {startingWorkout ? (
                <><Loader2 className="h-5 w-5 animate-spin" />Iniciando...</>
              ) : (
                <><Play className="h-5 w-5" />Iniciar Treino</>
              )}
            </Button>
          ) : (
            <Button
              variant="premium"
              size="xl"
              className="w-full pulse-subtle"
              onClick={handleFinishWorkout}
              disabled={finishingWorkout}
            >
              {finishingWorkout ? (
                <><Loader2 className="h-5 w-5 animate-spin" />Finalizando...</>
              ) : (
                <><CheckCircle2 className="h-5 w-5" />Finalizar Treino</>
              )}
            </Button>
          )}
        </MobileFooter>
      )}
    </MobileContainer>
  );
};

export default StudentWorkoutPage;
