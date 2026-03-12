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
  User, Dumbbell, LogOut, Loader2, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, Repeat, Layers, Video,
  Play, RefreshCw, Trophy, AlertCircle, Calendar,
  X, MessageCircle, FileText, Star,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Config tipos de bloco ───────────────────────────────────────
const blockTypeConfig = {
  normal:   { label: "Normal",    color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
  biset:    { label: "Biset",     color: "bg-purple-500/15 text-purple-400 border-purple-500/30" },
  triset:   { label: "Triset",    color: "bg-orange-500/15 text-orange-400 border-orange-500/30" },
  circuit:  { label: "Circuito",  color: "bg-green-500/15 text-green-400 border-green-500/30" },
  dropset:  { label: "Drop Set",  color: "bg-red-500/15 text-red-400 border-red-500/30" },
  giantset: { label: "Giant Set", color: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30" },
};

// ── Tela de acesso expirado ─────────────────────────────────────
const AccessExpiredScreen = ({ profile, onLogout }) => (
  <MobileContainer>
    <MobileHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border border-border">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{profile?.name || "Aluno"}</p>
            <Badge variant="destructive" className="text-[10px] mt-0.5">Acesso Inativo</Badge>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onLogout}>
          <LogOut className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    </MobileHeader>
    <MobileContent>
      <div className="flex items-center justify-center min-h-[70vh] px-2">
        <Card className="bg-card border-destructive/30 w-full">
          <CardContent className="py-8 px-6 text-center space-y-5">
            <Badge variant="outline" className="border-destructive/50 text-destructive gap-1.5 px-3 py-1">
              <AlertCircle className="h-3.5 w-3.5" />
              Acesso Inativo
            </Badge>
            <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto border border-destructive/20">
              <Calendar className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-foreground">Seu acesso expirou</h2>
              {profile?.access_end && (
                <p className="text-sm text-muted-foreground mt-2">
                  Seu período de acesso terminou em{" "}
                  <span className="text-destructive font-medium">
                    {new Date(profile.access_end).toLocaleDateString("pt-BR", {
                      day: "numeric", month: "long", year: "numeric",
                    })}
                  </span>
                </p>
              )}
            </div>
            <div className="bg-muted/50 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">
                Entre em contato com seu treinador para renovar o acesso e continuar seus treinos.
              </p>
            </div>
            <a
              href={profile?.phone ? `https://wa.me/${profile.phone.replace(/\D/g, "")}` : "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="premium" className="w-full gap-2" disabled={!profile?.phone}>
                <MessageCircle className="h-4 w-4" />
                Falar com Treinador
              </Button>
            </a>
          </CardContent>
        </Card>
      </div>
    </MobileContent>
  </MobileContainer>
);

// ── Modal de detalhe do exercício (com embed vídeo inline) ──────
const ExerciseDetailModal = ({ exercise, index, blockLabel, blockType, onClose, onToggle, isDone }) => {
  if (!exercise) return null;
  const typeCfg = blockTypeConfig[blockType] || blockTypeConfig.normal;

  // Detecta se é YouTube para embed
  const getYouTubeId = (url) => {
    if (!url) return null;
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return m ? m[1] : null;
  };
  const ytId = getYouTubeId(exercise.video_url);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border rounded-t-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="outline" className="text-[10px]">Exercício #{index + 1}</Badge>
                {blockLabel && (
                  <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", typeCfg.color)}>
                    {blockLabel} · {typeCfg.label}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-display font-bold text-foreground leading-tight">
                {exercise.exercise_name}
              </h3>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Vídeo — embed YouTube ou link */}
          <div className="rounded-xl overflow-hidden border border-border bg-muted/50">
            {ytId ? (
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${ytId}`}
                  title={exercise.exercise_name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
            ) : exercise.video_url ? (
              <a
                href={exercise.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center py-8 gap-3 hover:bg-muted/80 transition-colors"
              >
                <div className="h-14 w-14 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center">
                  <Play className="h-6 w-6 text-primary ml-1" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Vídeo demonstrativo</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Toque para abrir</p>
                </div>
              </a>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground">
                <Video className="h-8 w-8 opacity-30" />
                <p className="text-xs">Vídeo demonstrativo</p>
                <p className="text-[10px] opacity-50">(Conectar video_url do Supabase)</p>
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Layers, value: exercise.sets, label: "Séries" },
              { icon: Repeat, value: exercise.reps, label: "Reps" },
              { icon: Clock, value: exercise.rest_seconds ? `${exercise.rest_seconds}s` : null, label: "Descanso" },
            ].filter(s => s.value).map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-muted/50 rounded-xl p-3 text-center border border-border">
                <Icon className="h-4 w-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
              </div>
            ))}
          </div>

          {/* Carga */}
          {exercise.load && (
            <div className="bg-muted/50 rounded-xl p-3 border border-border flex items-center gap-3">
              <Dumbbell className="h-4 w-4 text-primary flex-shrink-0" />
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Carga</p>
                <p className="text-sm font-semibold text-foreground">{exercise.load}</p>
              </div>
            </div>
          )}

          {/* Dicas */}
          {exercise.notes && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-[10px] text-primary font-bold">!</span>
              </div>
              <div>
                <p className="text-[10px] text-primary uppercase tracking-wide font-medium mb-0.5">Dicas</p>
                <p className="text-sm text-foreground">{exercise.notes}</p>
              </div>
            </div>
          )}

          {/* Botão marcar */}
          <Button
            variant={isDone ? "outline" : "premium"}
            className="w-full gap-2"
            onClick={() => { onToggle(); onClose(); }}
          >
            <CheckCircle2 className="h-4 w-4" />
            {isDone ? "Desmarcar exercício" : "Marcar como concluído"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── Modal "treino já feito recentemente" ────────────────────────
const RecentWorkoutModal = ({ workoutTitle, lastDate, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-sm p-4">
    <Card className="bg-card border-border w-full max-w-sm">
      <CardContent className="p-6 space-y-4 text-center">
        <div className="h-14 w-14 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto border border-yellow-500/20">
          <AlertCircle className="h-7 w-7 text-yellow-400" />
        </div>
        <div>
          <h3 className="text-base font-display font-bold text-foreground">Treino recente</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Você fez <span className="text-foreground font-medium">{workoutTitle}</span> em{" "}
            <span className="text-yellow-400 font-medium">{lastDate}</span>.
          </p>
          <p className="text-sm text-muted-foreground mt-1">Deseja fazer novamente?</p>
        </div>
        <div className="space-y-2">
          <Button variant="premium" className="w-full" onClick={onConfirm}>
            Sim, fazer novamente
          </Button>
          <Button variant="ghost" className="w-full" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
);

// ── Componente principal ────────────────────────────────────────
const StudentWorkoutPage = () => {
  const { id: workoutId } = useParams();
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();

  const [workout, setWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [blockMap, setBlockMap] = useState({});       // exercise_id → { block_label, block_type }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completedExercises, setCompletedExercises] = useState(new Set());
  const [activeSession, setActiveSession] = useState(null);
  const [starting, setStarting] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSession, setRecentSession] = useState(null); // { date } se feito ontem/hoje
  const [showRecentModal, setShowRecentModal] = useState(false);

  const accessExpired = profile?.access_end
    ? new Date(profile.access_end) < new Date()
    : false;

  const loadWorkout = useCallback(async () => {
    if (!user || !workoutId) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Metadados
      const { data: sw, error: swErr } = await supabase
        .from("student_workouts")
        .select("*")
        .eq("id", workoutId)
        .eq("student_id", user.id)
        .single();
      if (swErr) throw swErr;
      setWorkout(sw);

      // 2. Exercícios via view (lista flat ordenada por bloco → exercício)
      const { data: rows, error: viewErr } = await supabase
        .from("v_student_workout")
        .select("*")
        .eq("workout_id", workoutId)
        .eq("student_id", user.id)
        .order("block_order", { ascending: true })
        .order("exercise_order", { ascending: true });
      if (viewErr) throw viewErr;

      // 3. Tipos de bloco
      const { data: blockData } = await supabase
        .from("student_workout_blocks")
        .select("id, block_label, block_type, order_index")
        .eq("student_workout_id", workoutId);
      const blockTypeById = Object.fromEntries(
        (blockData || []).map(b => [b.id, { block_label: b.block_label, block_type: b.block_type }])
      );

      // 4. Notes/carga de student_workout_exercises (via blocos deste treino)
      const blockIds = (blockData || []).map(b => b.id);
      let notesMap = {};
      if (blockIds.length > 0) {
        const { data: sweData } = await supabase
          .from("student_workout_exercises")
          .select("id, exercise_id, notes, load, block_id")
          .in("block_id", blockIds);
        notesMap = Object.fromEntries(
          (sweData || []).map(s => [`${s.block_id}-${s.exercise_id}`, { notes: s.notes, load: s.load }])
        );
      }

      // 5. Enriquece linhas e deduplica por exercise_row_id
      const seen = new Set();
      const enriched = (rows || []).reduce((acc, r) => {
        const key = r.exercise_row_id || `${r.block_id}-${r.exercise_id}-${r.exercise_order}`;
        if (seen.has(key)) return acc;
        seen.add(key);
        acc.push({
          ...r,
          notes: notesMap[`${r.block_id}-${r.exercise_id}`]?.notes || null,
          load: r.load || notesMap[`${r.block_id}-${r.exercise_id}`]?.load || null,
        });
        return acc;
      }, []);
      setExercises(enriched);

      // Mapa exercise_row_id → bloco (evita conflito quando mesmo exercício está em blocos diferentes)
      const bmap = {};
      for (const r of enriched) {
        if (r.block_id && blockTypeById[r.block_id]) {
          bmap[r.exercise_row_id || r.exercise_id] = {
            ...blockTypeById[r.block_id],
            block_label: r.block_label,
          };
        }
      }
      setBlockMap(bmap);

      // 6. Sessão ativa hoje
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

      // 7. Verifica se foi feito recentemente (ontem ou hoje com status finished)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const { data: recent } = await supabase
        .from("workout_sessions")
        .select("session_date, finished")
        .eq("student_id", user.id)
        .eq("workout_id", workoutId)
        .eq("finished", true)
        .in("session_date", [today, yesterdayStr])
        .order("session_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (recent) {
        setRecentSession(recent);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, workoutId]);

  useEffect(() => { loadWorkout(); }, [loadWorkout]);

  // ── Toggle exercício ──────────────────────────────────────────
  const toggleExercise = async (exerciseId, e) => {
    e?.stopPropagation();
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
      // Reverte
      setCompletedExercises(prev => {
        const next = new Set(prev);
        isDone ? next.add(exerciseId) : next.delete(exerciseId);
        return next;
      });
    }
  };

  // ── Iniciar treino ────────────────────────────────────────────
  const doStart = async () => {
    setStarting(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      // Primeiro tenta buscar sessão existente de hoje
      const { data: existing } = await supabase
        .from("workout_sessions")
        .select("*")
        .eq("student_id", user.id)
        .eq("workout_id", workoutId)
        .eq("session_date", today)
        .maybeSingle();

      if (existing && !existing.finished) {
        setActiveSession(existing);
        toast.success("Treino retomado! 💪");
        return;
      }

      // Cria nova sessão
      const { data, error } = await supabase
        .from("workout_sessions")
        .insert({
          student_id: user.id,
          workout_id: workoutId,
          session_date: today,
          started_at: new Date().toISOString(),
          status: "active",
          finished: false,
        })
        .select()
        .single();

      if (error) throw error;
      setActiveSession(data);
      setRecentSession(null);
      toast.success("Treino iniciado! 💪");
    } catch (err) {
      toast.error("Erro ao iniciar: " + err.message);
    } finally {
      setStarting(false);
    }
  };

  const handleStart = () => {
    // Se foi feito recentemente e não tem sessão ativa hoje → avisa
    if (recentSession && !activeSession) {
      setShowRecentModal(true);
    } else {
      doStart();
    }
  };

  // ── Finalizar treino ──────────────────────────────────────────
  const handleFinish = async () => {
    if (!activeSession) return;
    setFinishing(true);
    try {
      await supabase.from("workout_sessions").update({
        completed: true, finished: true, status: "finished",
        finished_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
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

  const handleLogout = async () => { try { await logout(); } catch {} };

  const totalExercises = exercises.length;
  const completedCount = completedExercises.size;
  const progressPct = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;

  // Agrupa para exibir label do bloco entre exercícios
  const renderExerciseList = () => {
    let lastBlockId = null;
    return exercises.map((ex, idx) => {
      const done = completedExercises.has(ex.exercise_id);
      const blockInfo = blockMap[ex.exercise_row_id || ex.exercise_id];
      const blockType = blockInfo?.block_type || "normal";
      const typeCfg = blockTypeConfig[blockType] || blockTypeConfig.normal;
      const showBlockHeader = ex.block_id !== lastBlockId;
      lastBlockId = ex.block_id;

      return (
        <React.Fragment key={ex.exercise_row_id || `ex-${idx}`}>
          {/* Separador de bloco */}
          {showBlockHeader && ex.block_label && (
            <div className="flex items-center gap-2 pt-2 pb-1">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0">
                <Layers className="h-3.5 w-3.5 text-primary" />
              </div>
              <span className="font-semibold text-sm text-foreground">{ex.block_label}</span>
              <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded border", typeCfg.color)}>
                {typeCfg.label}
              </span>
            </div>
          )}

          {/* Card exercício */}
          <Card
            className={cn(
              "border transition-all duration-200 cursor-pointer",
              done
                ? "bg-green-500/5 border-green-500/30"
                : "bg-card border-border hover:border-primary/30"
            )}
            onClick={() => { setSelectedExercise(ex); setSelectedIndex(idx); }}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {/* Checkbox */}
                <button
                  className={cn(
                    "h-7 w-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
                    done ? "border-green-400 bg-green-400" : "border-muted-foreground/40 hover:border-primary"
                  )}
                  onClick={e => toggleExercise(ex.exercise_id, e)}
                >
                  {done && <CheckCircle2 className="h-4 w-4 text-white" />}
                </button>

                {/* Ícone tipo exercício */}
                <div className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 border",
                  done ? "bg-green-500/10 border-green-500/20" : "bg-primary/10 border-primary/20"
                )}>
                  <Dumbbell className={cn("h-4 w-4", done ? "text-green-400" : "text-primary")} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-semibold text-sm",
                    done ? "text-green-400 line-through" : "text-foreground"
                  )}>
                    {ex.exercise_name}
                  </p>
                  <div className="flex flex-wrap gap-3 mt-0.5 text-xs text-muted-foreground">
                    {ex.sets && <span className="flex items-center gap-1"><Layers className="h-3 w-3" />{ex.sets} séries</span>}
                    {ex.reps && <span className="flex items-center gap-1"><Repeat className="h-3 w-3" />{ex.reps} reps</span>}
                    {ex.rest_seconds && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{ex.rest_seconds}s descanso</span>}
                  </div>
                  {ex.notes && (
                    <p className="text-xs text-muted-foreground/70 italic mt-0.5">"{ex.notes}"</p>
                  )}
                </div>

                {/* Número */}
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <Badge variant="outline" className="text-[10px]">#{idx + 1}</Badge>
                  {ex.video_url && (
                    <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center">
                      <Play className="h-2.5 w-2.5 text-primary" />
                    </div>
                  )}
                </div>
              </div>

              {/* Link vídeo inline */}
              {ex.video_url && (
                <a
                  href={ex.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center justify-between mt-3 py-2 px-3 rounded-lg bg-muted/50 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-8 rounded bg-primary/10 flex items-center justify-center">
                      <Play className="h-3 w-3 text-primary" />
                    </div>
                    Ver demonstração do exercício
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </a>
              )}
            </CardContent>
          </Card>
        </React.Fragment>
      );
    });
  };

  // ── Acesso expirado ───────────────────────────────────────────
  if (!loading && accessExpired) {
    return <AccessExpiredScreen profile={profile} onLogout={handleLogout} />;
  }

  return (
    <MobileContainer>
      <MobileHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9"
              onClick={() => navigate("/student/workouts")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{profile?.name || "Aluno"}</p>
                <Badge variant={activeSession ? "premium" : "success"} className="text-[10px] mt-0.5">
                  {activeSession ? "Treinando" : "Acesso Ativo"}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={loadWorkout}>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleLogout}>
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </MobileHeader>

      <MobileContent className="pb-28">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
          <div className="space-y-4 animate-fade-in pt-1">

            {/* Header treino */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Dumbbell className="h-4 w-4 text-primary" />
                    <Badge variant="premium" className="text-xs">Treino Atual</Badge>
                    {recentSession && !activeSession && (
                      <Badge variant="outline" className="text-[10px] border-yellow-500/40 text-yellow-400 gap-1">
                        <Star className="h-2.5 w-2.5" />
                        Feito recentemente
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-xl font-display font-bold text-foreground">
                    {workout?.title || "Treino"}
                  </h1>
                  {workout?.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">{workout.description}</p>
                  )}
                </div>
                {/* Botão PDF placeholder */}
                <button className="flex flex-col items-center gap-1 p-2 rounded-xl border border-border bg-muted/30 hover:bg-muted transition-colors ml-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[9px] text-muted-foreground">PDF</span>
                </button>
              </div>

              {/* Barra de progresso */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-semibold text-foreground">{completedCount}/{totalExercises}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              {/* Data de criação */}
              {workout?.created_at && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  Criado em {new Date(workout.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                </p>
              )}
            </div>

            {/* Seção exercícios */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-foreground text-sm">Exercícios</h2>
                </div>
                <span className="text-xs text-muted-foreground">
                  {completedCount} de {totalExercises} concluídos
                </span>
              </div>

              <div className="space-y-2">
                {exercises.length > 0 ? renderExerciseList() : (
                  <Card className="bg-card border-border">
                    <CardContent className="py-12 text-center">
                      <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                      <p className="text-muted-foreground">Nenhum exercício cadastrado</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}
      </MobileContent>

      {/* Footer CTA */}
      {!loading && !error && exercises.length > 0 && (
        <MobileFooter>
          {!activeSession ? (
            <Button
              variant="premium" size="xl" className="w-full"
              onClick={handleStart} disabled={starting}
            >
              {starting
                ? <><Loader2 className="h-5 w-5 animate-spin" />Iniciando...</>
                : <><Play className="h-5 w-5" />Iniciar Treino</>
              }
            </Button>
          ) : (
            <div className="space-y-1.5 w-full">
              {progressPct === 100 && (
                <p className="text-center text-xs text-green-400 font-medium">
                  🏆 Todos os exercícios concluídos!
                </p>
              )}
              <Button
                variant="premium" size="xl"
                className={cn("w-full", progressPct === 100 && "pulse-subtle")}
                onClick={() => completedCount > 0
                  ? setShowFinishModal(true)
                  : toast("Marque exercícios para finalizar ⚡")
                }
              >
                <CheckCircle2 className="h-5 w-5" />
                {completedCount === 0
                  ? "Marque exercícios para finalizar"
                  : `Finalizar Treino (${completedCount}/${totalExercises})`
                }
              </Button>
            </div>
          )}
        </MobileFooter>
      )}

      {/* Modal detalhe exercício */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          index={selectedIndex}
          blockLabel={selectedExercise.block_label}
          blockType={blockMap[selectedExercise.exercise_row_id || selectedExercise.exercise_id]?.block_type}
          isDone={completedExercises.has(selectedExercise.exercise_id)}
          onClose={() => setSelectedExercise(null)}
          onToggle={() => toggleExercise(selectedExercise.exercise_id)}
        />
      )}

      {/* Modal treino recente */}
      {showRecentModal && (
        <RecentWorkoutModal
          workoutTitle={workout?.title}
          lastDate={recentSession?.session_date
            ? new Date(recentSession.session_date + "T12:00:00").toLocaleDateString("pt-BR", {
                weekday: "long", day: "2-digit", month: "short",
              })
            : "recentemente"
          }
          onConfirm={() => { setShowRecentModal(false); doStart(); }}
          onCancel={() => setShowRecentModal(false)}
        />
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
              <div className="bg-muted rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{workout?.title}</span>
                  <span className="text-primary font-bold">{progressPct}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted-foreground/20 overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />{completedCount} exercícios concluídos
                </p>
              </div>
              {progressPct < 100 && (
                <p className="text-xs text-center text-muted-foreground">
                  Deseja registrar o treino mesmo assim?
                </p>
              )}
              <div className="space-y-2">
                <Button variant="premium" className="w-full" onClick={handleFinish} disabled={finishing}>
                  {finishing
                    ? <><Loader2 className="h-4 w-4 animate-spin" />Finalizando...</>
                    : <><CheckCircle2 className="h-4 w-4" />Finalizar Mesmo Assim</>
                  }
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