import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  MobileContainer, MobileHeader, MobileContent, MobileFooter,
} from "@/components/layout/MobileContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  User, Dumbbell, LogOut, Loader2, ChevronLeft,
  ChevronDown, ChevronUp, CheckCircle2,
  Clock, Repeat, Layers, Video, Play, RefreshCw,
  Trophy, AlertCircle, Lock, FileText, X,
  HelpCircle, Zap, Weight, Info, StickyNote,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const blockTypeConfig = {
  normal:   { label: "Normal",    color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  biset:    { label: "Biset",     color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  triset:   { label: "Triset",    color: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  circuit:  { label: "Circuito",  color: "bg-green-500/15 text-green-400 border-green-500/30" },
  dropset:  { label: "Drop Set",  color: "bg-red-500/15 text-red-400 border-red-500/30" },
  giantset: { label: "Giant Set", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
};

// Extrai ID do YouTube de qualquer formato de URL
function getYoutubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

// ─── Modal de detalhes do exercício ───────────────────────────────────────
const ExerciseDetailModal = ({ exercise, onClose }) => {
  if (!exercise) return null;
  const ytId = getYoutubeId(exercise.video_url);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/90 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg overflow-hidden flex flex-col"
        style={{ maxHeight: "90dvh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm text-foreground truncate">{exercise.exercise_name}</span>
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Corpo scrollável */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Vídeo embed */}
          {ytId && (
            <div className="rounded-xl overflow-hidden aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={exercise.exercise_name}
              />
            </div>
          )}

          {/* Prescrição */}
          <div className="grid grid-cols-2 gap-2">
            {exercise.sets && (
              <div className="bg-muted/60 rounded-xl p-3 flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Séries</p>
                  <p className="text-sm font-semibold text-foreground">{exercise.sets}</p>
                </div>
              </div>
            )}
            {exercise.reps && (
              <div className="bg-muted/60 rounded-xl p-3 flex items-center gap-2">
                <Repeat className="h-4 w-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Repetições</p>
                  <p className="text-sm font-semibold text-foreground">{exercise.reps}</p>
                </div>
              </div>
            )}
            {exercise.rest_seconds && (
              <div className="bg-muted/60 rounded-xl p-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Descanso</p>
                  <p className="text-sm font-semibold text-foreground">{exercise.rest_seconds}s</p>
                </div>
              </div>
            )}
            {exercise.load && (
              <div className="bg-muted/60 rounded-xl p-3 flex items-center gap-2">
                <Weight className="h-4 w-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Carga</p>
                  <p className="text-sm font-semibold text-foreground">{exercise.load}</p>
                </div>
              </div>
            )}
            {exercise.tempo && (
              <div className="bg-muted/60 rounded-xl p-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground">Tempo</p>
                  <p className="text-sm font-semibold text-foreground">{exercise.tempo}</p>
                </div>
              </div>
            )}
          </div>

          {/* Observações */}
          {exercise.obs && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-2">
              <StickyNote className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] text-primary font-medium mb-0.5">Observações</p>
                <p className="text-sm text-foreground leading-relaxed">{exercise.obs}</p>
              </div>
            </div>
          )}

          {/* Sem vídeo e sem detalhes extras */}
          {!ytId && !exercise.sets && !exercise.reps && !exercise.obs && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              Nenhum detalhe adicional cadastrado.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Componente principal ──────────────────────────────────────────────────
const StudentWorkoutPage = () => {
  const { id: workoutId } = useParams();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();

  const [workout, setWorkout] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [expandedBlocks, setExpandedBlocks] = useState(new Set());
  const [expandedVideos, setExpandedVideos] = useState(new Set()); // vídeos inline abertos
  const [activeSession, setActiveSession] = useState(null);
  const [starting, setStarting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [detailExercise, setDetailExercise] = useState(null); // modal detalhes

  const loadWorkout = useCallback(async () => {
    if (!user || !workoutId) return;
    setLoading(true);
    setError(null);
    try {
      const { data: sw, error: swErr } = await supabase
        .from("student_workouts")
        .select("*")
        .eq("id", workoutId)
        .eq("student_id", user.id)
        .single();
      if (swErr) throw swErr;
      setWorkout(sw);

      // Verificar expiração pelo campo end_date (não expires_at)
      const todayStr = new Date().toISOString().split("T")[0];
      if (sw.end_date && sw.end_date < todayStr) {
        setIsExpired(true);
        setLoading(false);
        return;
      }

      const { data: rows, error: viewErr } = await supabase
        .from("v_student_workout")
        .select("*")
        .eq("workout_id", workoutId)
        .eq("student_id", user.id)
        .order("block_order", { ascending: true })
        .order("exercise_order", { ascending: true });
      if (viewErr) throw viewErr;

      const { data: blockData } = await supabase
        .from("student_workout_blocks")
        .select("id, block_type, order_index")
        .eq("student_workout_id", workoutId);
      const blockTypeMap = Object.fromEntries(
        (blockData || []).map(b => [b.id, b.block_type])
      );

      const blockMap = {};
      for (const row of rows || []) {
        const key = row.block_id;
        if (!blockMap[key]) {
          blockMap[key] = {
            block_id: row.block_id,
            block_label: row.block_label,
            block_type: blockTypeMap[row.block_id] || "normal",
            block_order: row.block_order,
            exercises: [],
          };
        }
        blockMap[key].exercises.push(row);
      }
      const sortedBlocks = Object.values(blockMap).sort((a, b) => a.block_order - b.block_order);
      setBlocks(sortedBlocks);
      if (sortedBlocks.length > 0) {
        setExpandedBlocks(new Set([sortedBlocks[0].block_id]));
      }

      const today = new Date().toISOString().split("T")[0];
      const { data: session } = await supabase
        .from("workout_sessions")
        .select("*")
        .eq("student_id", user.id)
        .eq("workout_id", workoutId)
        .eq("session_date", today)
        .eq("finished", false)
        .maybeSingle();
      if (session) {
        setActiveSession(session);
        const { data: logs } = await supabase
          .from("workout_exercise_logs")
          .select("exercise_id")
          .eq("session_id", session.id)
          .eq("completed", true);
        if (logs?.length) {
          setCompletedExercises(new Set(logs.map(l => l.exercise_id)));
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, workoutId]);

  useEffect(() => { loadWorkout(); }, [loadWorkout]);

  const toggleBlock = blockId => {
    setExpandedBlocks(prev => {
      const next = new Set(prev);
      next.has(blockId) ? next.delete(blockId) : next.add(blockId);
      return next;
    });
  };

  const toggleVideo = (exerciseRowId, e) => {
    e.stopPropagation();
    setExpandedVideos(prev => {
      const next = new Set(prev);
      next.has(exerciseRowId) ? next.delete(exerciseRowId) : next.add(exerciseRowId);
      return next;
    });
  };

  const toggleExercise = async (exerciseId) => {
    if (!activeSession) {
      toast("Inicie o treino primeiro ⚡");
      return;
    }
    const isDone = completedExercises.has(exerciseId);
    setCompletedExercises(prev => {
      const next = new Set(prev);
      isDone ? next.delete(exerciseId) : next.add(exerciseId);
      return next;
    });
    try {
      if (isDone) {
        await supabase.from("workout_exercise_logs").delete()
          .eq("session_id", activeSession.id).eq("exercise_id", exerciseId);
      } else {
        await supabase.from("workout_exercise_logs").upsert({
          session_id: activeSession.id,
          exercise_id: exerciseId,
          completed: true,
          completed_at: new Date().toISOString(),
        });
      }
    } catch {
      setCompletedExercises(prev => {
        const next = new Set(prev);
        isDone ? next.add(exerciseId) : next.delete(exerciseId);
        return next;
      });
    }
  };

  const handleStart = async () => {
    setStarting(true);
    try {
      const today = new Date().toISOString().split("T")[0];

      // Verifica se já existe sessão hoje (finished ou não)
      const { data: existing } = await supabase
        .from("workout_sessions")
        .select("*")
        .eq("student_id", user.id)
        .eq("workout_id", workoutId)
        .eq("session_date", today)
        .maybeSingle();

      if (existing) {
        setActiveSession(existing);
        toast.success("Treino retomado!");
        return;
      }

      // Cria nova sessão com upsert para evitar 409
      const { data, error } = await supabase
        .from("workout_sessions")
        .upsert(
          [{
            student_id: user.id,
            workout_id: workoutId,
            session_date: today,
            started_at: new Date().toISOString(),
            status: "active",
            finished: false,
          }],
          { onConflict: "student_id,workout_id,session_date", ignoreDuplicates: false }
        )
        .select()
        .single();

      if (error) throw error;
      setActiveSession(data);
      toast.success("Treino iniciado! 💪");
    } catch (err) {
      toast.error("Erro ao iniciar: " + err.message);
    } finally {
      setStarting(false);
    }
  };

  const handleFinish = async () => {
    if (!activeSession) return;
    setFinishing(true);
    try {
      await supabase.from("workout_sessions").update({
        completed: true, finished: true, status: "finished",
        finished_at: new Date().toISOString(), completed_at: new Date().toISOString(),
      }).eq("id", activeSession.id);
      setActiveSession(null);
      setShowFinishModal(false);
      toast.success("Treino concluído! 🏆");
      navigate("/student/workouts");
    } catch (err) {
      toast.error("Erro ao finalizar: " + err.message);
    } finally {
      setFinishing(false);
    }
  };

  const totalExercises = blocks.reduce((sum, b) => sum + b.exercises.length, 0);
  const completedCount = completedExercises.size;
  const progressPct = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;
  const isBlockCompleted = b => b.exercises.length > 0 && b.exercises.every(ex => completedExercises.has(ex.exercise_id));

  return (
    <MobileContainer>
      <MobileHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => navigate("/student/workouts")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{profile?.name || "Aluno"}</p>
                <Badge variant={activeSession ? "premium" : "success"} className="text-[10px] mt-0.5">
                  {activeSession ? "Treinando" : "Aluno"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={loadWorkout}>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={async () => { try { await logout(); } catch {} }}>
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </MobileHeader>

      <MobileContent className="pb-32">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>

        ) : isExpired ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center space-y-5 animate-fade-in">
            <div className="h-20 w-20 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <Lock className="h-10 w-10 text-destructive/60" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground mb-2">Treino Expirado</h2>
              <p className="text-sm text-muted-foreground">
                {workout?.end_date
                  ? `Este treino expirou em ${new Date(workout.end_date + "T12:00:00").toLocaleDateString("pt-BR")}.`
                  : "Este treino não está mais disponível."}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Entre em contato com seu personal para renovar seu plano.
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/student/workouts")} className="gap-2">
              <ChevronLeft className="h-4 w-4" />Voltar para Meus Treinos
            </Button>
          </div>

        ) : error ? (
          <Card className="bg-card border-destructive/30 mt-4">
            <CardContent className="py-10 text-center">
              <AlertCircle className="h-10 w-10 mx-auto text-destructive mb-3" />
              <p className="text-destructive font-medium mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={loadWorkout}>
                <RefreshCw className="h-4 w-4 mr-2" />Tentar novamente
              </Button>
            </CardContent>
          </Card>

        ) : (
          <div className="space-y-4 animate-fade-in pt-2">

            {/* Header do treino */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <Badge variant="premium" className="text-xs mb-2">Treino Atual</Badge>
                <h1 className="text-xl font-display font-bold text-foreground leading-tight">{workout?.title || "Treino"}</h1>
                <p className="text-sm text-muted-foreground mt-1">{blocks.length} blocos • {totalExercises} exercícios</p>
              </div>
              {workout?.pdf_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 flex-shrink-0 mt-1"
                  onClick={() => setShowPdfModal(true)}
                >
                  <FileText className="h-4 w-4" />
                  PDF
                </Button>
              )}
            </div>

            {/* Barra de progresso */}
            {activeSession && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Progresso da sessão</span>
                  <span className="font-semibold text-foreground">{completedCount}/{totalExercises}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progressPct}%` }} />
                </div>
                {progressPct === 100 && (
                  <p className="text-xs text-center text-green-400 font-medium pt-0.5">🏆 Todos os exercícios concluídos!</p>
                )}
              </div>
            )}

            {/* Blocos */}
            <div className="space-y-3">
              {blocks.map(block => {
                const isExpanded = expandedBlocks.has(block.block_id);
                const blockDone = isBlockCompleted(block);
                const typeCfg = blockTypeConfig[block.block_type] || blockTypeConfig.normal;

                return (
                  <Card key={block.block_id} className={cn(
                    "border transition-all duration-200 overflow-hidden",
                    blockDone ? "bg-green-500/5 border-green-500/30" : "bg-card border-border"
                  )}>
                    {/* Header do bloco */}
                    <div
                      className="flex items-center justify-between px-4 py-3.5 cursor-pointer select-none"
                      onClick={() => toggleBlock(block.block_id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-9 w-9 rounded-lg flex items-center justify-center border flex-shrink-0",
                          blockDone ? "bg-green-500/10 border-green-500/30" : "bg-primary/10 border-primary/20"
                        )}>
                          {blockDone
                            ? <CheckCircle2 className="h-5 w-5 text-green-400" />
                            : <Layers className="h-4 w-4 text-primary" />}
                        </div>
                        <div>
                          <p className={cn("font-semibold text-sm", blockDone ? "text-green-400" : "text-foreground")}>
                            {block.block_label}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", typeCfg.color)}>
                              {typeCfg.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground">{block.exercises.length} exerc.</span>
                            {blockDone && <span className="text-[10px] text-green-400 font-medium">✓ Completo</span>}
                          </div>
                        </div>
                      </div>
                      {isExpanded
                        ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
                    </div>

                    {/* Lista de exercícios */}
                    {isExpanded && (
                      <div className="border-t border-border divide-y divide-border/50">
                        {block.exercises.map((ex, idx) => {
                          const done = completedExercises.has(ex.exercise_id);
                          const ytId = getYoutubeId(ex.video_url);
                          const videoKey = ex.exercise_row_id || `${block.block_id}-${idx}`;
                          const videoOpen = expandedVideos.has(videoKey);

                          return (
                            <div key={videoKey}>
                              {/* Linha principal do exercício */}
                              <div
                                className={cn(
                                  "px-4 py-3 transition-colors duration-150 cursor-pointer",
                                  done ? "bg-green-500/5" : "hover:bg-muted/30"
                                )}
                                onClick={() => toggleExercise(ex.exercise_id)}
                              >
                                <div className="flex items-start gap-3">
                                  {/* Checkbox */}
                                  <div className={cn(
                                    "h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                                    done ? "border-green-400 bg-green-400" : "border-muted-foreground/40"
                                  )}>
                                    {done && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    {/* Nome + botões */}
                                    <div className="flex items-center justify-between gap-2">
                                      <p className={cn(
                                        "font-semibold text-sm leading-tight",
                                        done ? "text-green-400 line-through" : "text-foreground"
                                      )}>
                                        {ex.exercise_name}
                                      </p>
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        {/* Botão vídeo inline */}
                                        {ytId && (
                                          <button
                                            className={cn(
                                              "h-7 w-7 rounded-lg flex items-center justify-center transition-colors",
                                              videoOpen
                                                ? "bg-primary/20 text-primary"
                                                : "bg-muted text-muted-foreground hover:text-primary hover:bg-primary/10"
                                            )}
                                            onClick={e => toggleVideo(videoKey, e)}
                                            title="Ver vídeo"
                                          >
                                            <Play className="h-3.5 w-3.5" />
                                          </button>
                                        )}
                                        {/* Botão detalhes */}
                                        <button
                                          className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                          onClick={e => { e.stopPropagation(); setDetailExercise(ex); }}
                                          title="Ver detalhes"
                                        >
                                          <HelpCircle className="h-3.5 w-3.5" />
                                        </button>
                                        <Badge variant="outline" className="text-[10px]">#{idx + 1}</Badge>
                                      </div>
                                    </div>

                                    {/* Prescrição resumida */}
                                    <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-muted-foreground">
                                      {ex.sets && (
                                        <span className="flex items-center gap-1">
                                          <Layers className="h-3 w-3" />{ex.sets} séries
                                        </span>
                                      )}
                                      {ex.reps && (
                                        <span className="flex items-center gap-1">
                                          <Repeat className="h-3 w-3" />{ex.reps} reps
                                        </span>
                                      )}
                                      {ex.rest_seconds && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" />{ex.rest_seconds}s
                                        </span>
                                      )}
                                      {ex.load && (
                                        <span className="flex items-center gap-1">
                                          💪 {ex.load}
                                        </span>
                                      )}
                                      {ex.tempo && (
                                        <span className="flex items-center gap-1">
                                          <Zap className="h-3 w-3" />{ex.tempo}
                                        </span>
                                      )}
                                    </div>

                                    {/* Observações inline */}
                                    {ex.obs && (
                                      <div className="mt-2 flex items-start gap-1.5">
                                        <StickyNote className="h-3 w-3 text-primary flex-shrink-0 mt-0.5" />
                                        <p className="text-xs text-muted-foreground leading-relaxed">{ex.obs}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Vídeo embed expandível */}
                              {videoOpen && ytId && (
                                <div className="px-4 pb-3">
                                  <div className="rounded-xl overflow-hidden aspect-video bg-black">
                                    <iframe
                                      src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&autoplay=1`}
                                      className="w-full h-full"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                      allowFullScreen
                                      title={ex.exercise_name}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>

            {blocks.length === 0 && (
              <Card className="bg-card border-border">
                <CardContent className="py-12 text-center">
                  <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground">Nenhum exercício cadastrado</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </MobileContent>

      {/* Footer CTA */}
      {!loading && !error && !isExpired && blocks.length > 0 && (
        <MobileFooter>
          {!activeSession ? (
            <Button variant="premium" size="xl" className="w-full" onClick={handleStart} disabled={starting}>
              {starting
                ? <><Loader2 className="h-5 w-5 animate-spin" />Iniciando...</>
                : <><Play className="h-5 w-5" />Iniciar Treino</>}
            </Button>
          ) : (
            <Button
              variant="premium"
              size="xl"
              className="w-full"
              onClick={() => setShowFinishModal(true)}
              disabled={completedCount === 0}
            >
              <CheckCircle2 className="h-5 w-5" />
              {completedCount === 0
                ? "Marque exercícios para finalizar"
                : `Finalizar Treino (${completedCount}/${totalExercises})`}
            </Button>
          )}
        </MobileFooter>
      )}

      {/* Modal detalhes do exercício */}
      {detailExercise && (
        <ExerciseDetailModal
          exercise={detailExercise}
          onClose={() => setDetailExercise(null)}
        />
      )}

      {/* Modal PDF */}
      {showPdfModal && workout?.pdf_url && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/90 backdrop-blur-sm p-0 sm:p-4"
          onClick={() => setShowPdfModal(false)}
        >
          <div
            className="bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl overflow-hidden flex flex-col"
            style={{ height: "90dvh" }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm text-foreground">PDF do Treino</span>
              </div>
              <div className="flex items-center gap-2">
                <a href={workout.pdf_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                  Abrir em nova aba
                </a>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowPdfModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={`${workout.pdf_url}#toolbar=0&navpanes=0`}
                className="w-full h-full"
                title="Treino PDF"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal finalizar */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="bg-card border-border w-full max-w-sm">
            <CardContent className="p-6 space-y-4">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 border border-primary/20">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-display font-bold text-foreground">Finalizar Treino?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Você completou {completedCount} de {totalExercises} exercícios ({progressPct}%).
                </p>
              </div>
              <div className="bg-muted rounded-xl p-3 space-y-2">
                <div className="h-2 rounded-full bg-muted-foreground/20 overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="text-xs text-center text-muted-foreground">{completedCount} exercícios concluídos</p>
              </div>
              <div className="space-y-2">
                <Button variant="premium" className="w-full" onClick={handleFinish} disabled={finishing}>
                  {finishing
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Finalizando...</>
                    : <><CheckCircle2 className="h-4 w-4" />Finalizar Mesmo Assim</>}
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => setShowFinishModal(false)}>
                  Continuar Treinando
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </MobileContainer>
  );
};

export default StudentWorkoutPage;