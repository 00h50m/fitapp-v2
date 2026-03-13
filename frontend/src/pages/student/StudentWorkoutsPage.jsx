import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  MobileContainer, MobileHeader, MobileContent, MobileFooter,
} from "@/components/layout/MobileContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  User, Dumbbell, LogOut, Loader2, RefreshCw,
  ChevronRight, AlertCircle, Trophy, Calendar,
  Play, CheckCircle2, Lock, FileText,
  Flame, Star, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── helpers ───────────────────────────────────────────────────────────────

const todayStr = () => new Date().toISOString().split("T")[0];

function getNextWorkoutIndex(workouts, sessions) {
  if (!workouts.length) return 0;
  const finished = sessions
    .filter(s => s.finished)
    .sort((a, b) => new Date(b.session_date + "T00:00") - new Date(a.session_date + "T00:00"));
  if (!finished.length) return 0;

  const lastWorkoutId = finished[0].workout_id;
  const lastIdx = workouts.findIndex(w => w.id === lastWorkoutId);
  if (lastIdx === -1) return 0;
  return (lastIdx + 1) % workouts.length;
}

function trainedToday(sessions) {
  return sessions.some(s => s.session_date === todayStr() && s.finished);
}

function activeSessionToday(sessions) {
  return sessions.find(s => s.session_date === todayStr() && !s.finished) || null;
}

// ─── componente principal ──────────────────────────────────────────────────

const StudentWorkoutsPage = () => {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();

  const [workouts, setWorkouts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isExpired = profile?.access_end
    ? new Date(profile.access_end + "T23:59") < new Date()
    : false;

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      // Coluna correta é end_date (não expires_at)
      const { data: wData, error: wErr } = await supabase
        .from("student_workouts")
        .select("id, title, status, end_date, pdf_url, created_at")
        .eq("student_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: true });
      if (wErr) throw wErr;

      // Sessões dos últimos 30 dias
      const since = new Date();
      since.setDate(since.getDate() - 30);
      const { data: sData, error: sErr } = await supabase
        .from("workout_sessions")
        .select("id, workout_id, session_date, finished, finished_at, status")
        .eq("student_id", user.id)
        .gte("session_date", since.toISOString().split("T")[0])
        .order("session_date", { ascending: false });
      if (sErr) throw sErr;

      setWorkouts(wData || []);
      setSessions(sData || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // ── estado derivado ────────────────────────────────────────────────────
  const nextIdx = getNextWorkoutIndex(workouts, sessions);
  const alreadyToday = trainedToday(sessions);
  const ongoing = activeSessionToday(sessions);
  const todayWorkout = workouts[nextIdx] || null;

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekCount = sessions.filter(
    s => s.finished && new Date(s.session_date + "T12:00") >= weekStart
  ).length;

  const streak = (() => {
    let count = alreadyToday ? 1 : 0;
    const doneSet = new Set(sessions.filter(s => s.finished).map(s => s.session_date));
    const d = new Date();
    d.setDate(d.getDate() - 1);
    while (doneSet.has(d.toISOString().split("T")[0])) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  // Verifica se treino expirou pelo end_date
  const isWorkoutExpired = (workout) => {
    if (!workout.end_date) return false;
    return new Date(workout.end_date + "T23:59:59") < new Date();
  };

  // ── sub-componente WorkoutCard ─────────────────────────────────────────
  const WorkoutCard = ({ workout, idx, isNext, isOngoing }) => {
    const doneCount = sessions.filter(s => s.workout_id === workout.id && s.finished).length;
    const last = sessions.find(s => s.workout_id === workout.id && s.finished);
    const expired = isWorkoutExpired(workout);

    return (
      <Card
        className={cn(
          "border transition-all duration-200 cursor-pointer active:scale-[0.98]",
          expired
            ? "bg-muted/30 border-border opacity-60"
            : isNext && !alreadyToday
            ? "bg-primary/5 border-primary/40 shadow-[0_0_24px_-8px_hsl(var(--primary)/0.35)]"
            : isOngoing
            ? "bg-blue-500/5 border-blue-500/30"
            : "bg-card border-border"
        )}
        onClick={() => !expired && navigate(`/student/workout/${workout.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "h-11 w-11 rounded-xl flex items-center justify-center border flex-shrink-0",
              expired
                ? "bg-muted border-border"
                : isNext && !alreadyToday
                ? "bg-primary/10 border-primary/30"
                : isOngoing
                ? "bg-blue-500/10 border-blue-500/30"
                : "bg-muted border-border"
            )}>
              {expired
                ? <Lock className="h-5 w-5 text-muted-foreground" />
                : isOngoing
                ? <Play className="h-5 w-5 text-blue-400" />
                : isNext && !alreadyToday
                ? <Star className="h-5 w-5 text-primary" />
                : <Dumbbell className="h-5 w-5 text-muted-foreground" />
              }
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm text-foreground truncate">
                  {workout.title}
                </p>
                {expired && (
                  <Badge variant="destructive" className="text-[10px]">Expirado</Badge>
                )}
                {!expired && isOngoing && (
                  <Badge className="text-[10px] bg-blue-500/20 text-blue-400 border-blue-500/30 border">
                    Em andamento
                  </Badge>
                )}
                {!expired && isNext && !alreadyToday && !isOngoing && (
                  <Badge variant="premium" className="text-[10px]">Hoje ⚡</Badge>
                )}
                {!expired && alreadyToday && isNext && (
                  <Badge className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30 border">
                    ✓ Feito hoje
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  {doneCount} {doneCount === 1 ? "sessão" : "sessões"}
                </span>
                {last && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(last.session_date + "T12:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                  </span>
                )}
                {workout.pdf_url && !expired && (
                  <span
                    className="flex items-center gap-1 text-primary"
                    onClick={e => { e.stopPropagation(); window.open(workout.pdf_url, "_blank"); }}
                  >
                    <FileText className="h-3 w-3" />
                    PDF
                  </span>
                )}
              </div>
            </div>

            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    );
  };

  // ── render ─────────────────────────────────────────────────────────────
  return (
    <MobileContainer>
      <MobileHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground leading-tight truncate">
                {profile?.name || "Aluno"}
              </p>
              <p className="text-[11px] text-muted-foreground leading-tight truncate">
                {isExpired
                  ? <span className="text-destructive">Acesso expirado</span>
                  : profile?.access_end
                  ? `Ativo até ${new Date(profile.access_end + "T12:00").toLocaleDateString("pt-BR")}`
                  : "Aluno ativo"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={load}>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={async () => { try { await logout(); } catch {} }}
            >
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </MobileHeader>

      <MobileContent className="pb-28">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>

        ) : error ? (
          <Card className="bg-card border-destructive/30 mt-4">
            <CardContent className="py-10 text-center">
              <AlertCircle className="h-10 w-10 mx-auto text-destructive mb-3" />
              <p className="text-destructive font-medium mb-4 text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={load}>
                <RefreshCw className="h-4 w-4 mr-2" />Tentar novamente
              </Button>
            </CardContent>
          </Card>

        ) : isExpired ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center animate-fade-in">
            <div className="h-20 w-20 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-5">
              <Lock className="h-9 w-9 text-destructive" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              Acesso Expirado
            </h2>
            <p className="text-sm text-muted-foreground mb-1 max-w-[260px]">
              Seu plano expirou em{" "}
              <span className="text-foreground font-medium">
                {new Date(profile.access_end + "T12:00").toLocaleDateString("pt-BR")}
              </span>
              .
            </p>
            <p className="text-sm text-muted-foreground mb-7 max-w-[260px]">
              Entre em contato com seu treinador para renovar o acesso.
            </p>
            {profile?.phone && (
              <Button
                variant="premium"
                className="gap-2"
                onClick={() =>
                  window.open(`https://wa.me/${profile.phone.replace(/\D/g, "")}`, "_blank")
                }
              >
                Falar com o Treinador
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>

        ) : workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center animate-fade-in">
            <div className="h-20 w-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5">
              <Dumbbell className="h-9 w-9 text-primary" />
            </div>
            <h2 className="text-xl font-display font-bold text-foreground mb-2">
              Nenhum treino ativo
            </h2>
            <p className="text-sm text-muted-foreground max-w-[260px]">
              Seu treinador ainda não adicionou treinos. Aguarde ou entre em contato.
            </p>
          </div>

        ) : (
          <div className="space-y-5 animate-fade-in pt-1">
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-primary">{workouts.length}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Treinos</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-foreground">{weekCount}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Essa semana</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <p className="text-xl font-bold text-foreground">{streak}</p>
                  {streak >= 2 && <Flame className="h-4 w-4 text-orange-400" />}
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Sequência</p>
              </div>
            </div>

            {todayWorkout && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-0.5">
                  {alreadyToday ? "✓ Treino de hoje concluído" : "Treino indicado para hoje"}
                </p>
                <WorkoutCard
                  workout={todayWorkout}
                  idx={nextIdx}
                  isNext={true}
                  isOngoing={ongoing?.workout_id === todayWorkout.id}
                />
              </div>
            )}

            {workouts.length > 1 && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 px-0.5">
                  Todos os treinos
                </p>
                <div className="space-y-2">
                  {workouts.map((w, idx) => (
                    <WorkoutCard
                      key={w.id}
                      workout={w}
                      idx={idx}
                      isNext={idx === nextIdx}
                      isOngoing={ongoing?.workout_id === w.id}
                    />
                  ))}
                </div>
              </div>
            )}

            {alreadyToday && (
              <Card className="bg-green-500/5 border-green-500/20">
                <CardContent className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-400">Treino concluído hoje! 🏆</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Volte amanhã para o próximo treino da sequência.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </MobileContent>

      {!loading && !error && !isExpired && todayWorkout && !alreadyToday && (
        <MobileFooter>
          <Button
            variant="premium"
            size="xl"
            className="w-full gap-2"
            onClick={() => {
              const target = ongoing
                ? workouts.find(w => w.id === ongoing.workout_id) || todayWorkout
                : todayWorkout;
              navigate(`/student/workout/${target.id}`);
            }}
          >
            {ongoing
              ? <><Play className="h-5 w-5" />Continuar Treino</>
              : <><Dumbbell className="h-5 w-5" />Iniciar Treino de Hoje</>
            }
          </Button>
        </MobileFooter>
      )}
    </MobileContainer>
  );
};

export default StudentWorkoutsPage;