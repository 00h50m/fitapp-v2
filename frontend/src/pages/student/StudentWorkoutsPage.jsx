import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { MobileContainer, MobileHeader, MobileContent, MobileFooter } from "@/components/layout/MobileContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User, Dumbbell, LogOut, Loader2, RefreshCw,
  ChevronRight, AlertCircle, Trophy, Calendar,
  Play, CheckCircle2, Lock, FileText, Flame,
  Star, ArrowRight, Clock, ChevronDown, ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const todayStr = () => new Date().toISOString().split("T")[0];

function getNextWorkoutIndex(workouts, sessions) {
  if (!workouts.length) return 0;
  const finished = sessions.filter(s => s.finished)
    .sort((a, b) => new Date(b.session_date) - new Date(a.session_date));
  if (!finished.length) return 0;
  const lastIdx = workouts.findIndex(w => w.id === finished[0].workout_id);
  return lastIdx === -1 ? 0 : (lastIdx + 1) % workouts.length;
}

function trainedToday(sessions) {
  return sessions.some(s => s.session_date === todayStr() && s.finished);
}

function activeSessionToday(sessions) {
  return sessions.find(s => s.session_date === todayStr() && !s.finished) || null;
}

function isExpiredWorkout(w) {
  if (!w.end_date) return false;
  return new Date(w.end_date + "T23:59:59") < new Date();
}

const WA_NUMBER = "5511949997913";
const waLink = (msg) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

const WhatsAppIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const StudentWorkoutsPage = () => {
  const navigate = useNavigate();
  const { user, profile, logout, loading: authLoading } = useAuth();

  const [workouts,  setWorkouts]  = useState([]);
  const [sessions,  setSessions]  = useState([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [showExpired, setShowExpired] = useState(false);

  const isExpired = profile?.access_end
    ? new Date(profile.access_end + "T23:59") < new Date()
    : false;

  const load = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const [wRes, sRes] = await Promise.all([
        supabase.from("student_workouts")
          .select("id, title, status, end_date, pdf_url, created_at")
          .eq("student_id", user.id)
          .eq("status", "active")
          .order("created_at", { ascending: true }),
        supabase.from("workout_sessions")
          .select("id, workout_id, session_date, finished, status")
          .eq("student_id", user.id)
          .gte("session_date", new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0])
          .order("session_date", { ascending: false }),
      ]);
      if (wRes.error) throw wRes.error;
      if (sRes.error) throw sRes.error;
      setWorkouts(wRes.data || []);
      setSessions(sRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (user?.id) load();
    else setLoading(false);
  }, [user?.id, authLoading]); // eslint-disable-line

  // Derived
  const activeWorkouts  = workouts.filter(w => !isExpiredWorkout(w));
  const expiredWorkouts = workouts.filter(w => isExpiredWorkout(w));
  const allExpired      = workouts.length > 0 && activeWorkouts.length === 0;

  const nextIdx      = getNextWorkoutIndex(activeWorkouts, sessions);
  const alreadyToday = trainedToday(sessions);
  const ongoing      = activeSessionToday(sessions);
  const todayWorkout = activeWorkouts[nextIdx] || null;

  const weekCount = sessions.filter(s =>
    s.finished && new Date(s.session_date + "T12:00") >= (() => {
      const d = new Date(); d.setDate(d.getDate() - d.getDay()); return d;
    })()
  ).length;

  const streak = (() => {
    let count = alreadyToday ? 1 : 0;
    const done = new Set(sessions.filter(s => s.finished).map(s => s.session_date));
    const d = new Date(); d.setDate(d.getDate() - 1);
    while (done.has(d.toISOString().split("T")[0])) { count++; d.setDate(d.getDate() - 1); }
    return count;
  })();

  // WorkoutCard
  const WorkoutCard = ({ workout, isNext, isOngoing, dim }) => {
    const doneCount = sessions.filter(s => s.workout_id === workout.id && s.finished).length;
    const last = sessions.find(s => s.workout_id === workout.id && s.finished);
    const expired = isExpiredWorkout(workout);

    return (
      <div
        className={cn(
          "flex items-center gap-3.5 p-4 rounded-2xl border transition-all active:scale-[0.98] cursor-pointer",
          dim         ? "opacity-50 pointer-events-none bg-card border-border" :
          expired     ? "bg-muted/20 border-border/50" :
          isOngoing   ? "bg-blue-500/5 border-blue-500/25" :
          isNext && !alreadyToday
                      ? "bg-primary/5 border-primary/30 shadow-[0_0_20px_-6px_hsl(var(--primary)/0.3)]"
                      : "bg-card border-border"
        )}
        onClick={() => !expired && !dim && navigate(`/student/workout/${workout.id}`)}
      >
        {/* Ícone */}
        <div className={cn(
          "h-12 w-12 rounded-xl flex items-center justify-center border flex-shrink-0",
          expired   ? "bg-muted/40 border-border/40" :
          isOngoing ? "bg-blue-500/15 border-blue-500/30" :
          isNext && !alreadyToday ? "bg-primary/15 border-primary/25" :
                      "bg-muted border-border"
        )}>
          {expired    ? <Lock className="h-5 w-5 text-muted-foreground/50" /> :
           isOngoing  ? <Play className="h-5 w-5 text-blue-400" /> :
           isNext && !alreadyToday ? <Star className="h-5 w-5 text-primary" /> :
                        <Dumbbell className="h-5 w-5 text-muted-foreground" />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-semibold text-sm text-foreground truncate">{workout.title}</p>
            {expired && <Badge variant="destructive" className="text-[10px] px-1.5">Expirado</Badge>}
            {!expired && isOngoing && <Badge className="text-[10px] px-1.5 bg-blue-500/20 text-blue-400 border-blue-500/30 border">Em andamento</Badge>}
            {!expired && isNext && !alreadyToday && !isOngoing && <Badge variant="premium" className="text-[10px] px-1.5">Hoje ⚡</Badge>}
            {!expired && alreadyToday && isNext && <Badge className="text-[10px] px-1.5 bg-green-500/20 text-green-400 border-green-500/30 border">✓ Feito</Badge>}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
              <span className="flex items-center gap-1 text-primary font-medium"
                onClick={e => { e.stopPropagation(); window.open(workout.pdf_url, "_blank"); }}>
                <FileText className="h-3 w-3" />PDF
              </span>
            )}
          </div>
        </div>

        <ChevronRight className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
      </div>
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <MobileContainer>
      {/* Header */}
      <MobileHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-foreground leading-tight truncate">
                {profile?.name || "Aluno"}
              </p>
              <p className="text-[11px] leading-tight truncate">
                {isExpired
                  ? <span className="text-destructive font-medium">Acesso expirado</span>
                  : profile?.access_end
                  ? <span className="text-muted-foreground">Ativo até {new Date(profile.access_end + "T12:00").toLocaleDateString("pt-BR")}</span>
                  : <span className="text-muted-foreground">Aluno ativo</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={load}>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9"
              onClick={async () => { try { await logout(); } catch {} }}>
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </MobileHeader>

      <MobileContent className="pb-32 px-4">
        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>

        /* Error */ ) : error ? (
          <div className="flex flex-col items-center py-16 gap-4 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="h-4 w-4 mr-2" />Tentar novamente
            </Button>
          </div>

        /* Acesso expirado */ ) : isExpired ? (
          <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 text-center animate-fade-in gap-6">
            <div className="h-24 w-24 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <Lock className="h-11 w-11 text-destructive/60" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Acesso Expirado</h2>
              <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed">
                Seu plano expirou em{" "}
                <span className="text-foreground font-semibold">
                  {profile?.access_end ? new Date(profile.access_end + "T12:00").toLocaleDateString("pt-BR") : "—"}
                </span>
                . Fale com seu personal para renovar!
              </p>
            </div>
            <div className="flex flex-col gap-3 w-full max-w-[260px]">
              <Button variant="premium" className="w-full gap-2 py-6 text-base"
                onClick={() => window.open(waLink("Olá! Gostaria de renovar meu plano no FitApp. 🏋️"), "_blank")}>
                <WhatsAppIcon />Falar com o Personal
              </Button>
              <Button variant="outline" className="w-full" onClick={async () => { await logout(); }}>
                Sair da conta
              </Button>
            </div>
          </div>

        /* Só treinos expirados */ ) : allExpired ? (
          <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 text-center animate-fade-in gap-6">
            <div className="h-20 w-20 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Clock className="h-9 w-9 text-orange-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-foreground">Treinos Expirados</h2>
              <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed">
                Seus treinos expiraram. Converse com seu personal para renovar ou receber novos treinos!
              </p>
            </div>
            <Button variant="premium" className="gap-2 py-5 px-6"
              onClick={() => window.open(waLink("Olá! Meus treinos expiraram e gostaria de renovar. 🏋️"), "_blank")}>
              <WhatsAppIcon />Falar com o Personal
            </Button>
          </div>

        /* Sem treinos */ ) : workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[65vh] px-4 text-center animate-fade-in gap-5">
            <div className="h-20 w-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Dumbbell className="h-9 w-9 text-primary" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-foreground">Nenhum treino ainda</h2>
              <p className="text-sm text-muted-foreground max-w-[240px]">
                Seu personal ainda não adicionou treinos. Aguarde ou entre em contato.
              </p>
            </div>
            <Button variant="outline" className="gap-2"
              onClick={() => window.open(waLink("Olá! Estou aguardando meu treino no FitApp. 💪"), "_blank")}>
              <WhatsAppIcon />Avisar o Personal
            </Button>
          </div>

        /* Conteúdo principal */ ) : (
          <div className="space-y-5 animate-fade-in pt-2">

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: "Treinos",      value: activeWorkouts.length, color: "text-primary" },
                { label: "Essa semana",  value: weekCount,             color: "text-foreground" },
                { label: streak >= 2 ? "🔥 Streak" : "Sequência", value: streak, color: "text-foreground" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-card border border-border rounded-2xl p-3.5 text-center">
                  <p className={cn("text-2xl font-black leading-none mb-1", color)}>{value}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
                </div>
              ))}
            </div>

            {/* Treino de hoje */}
            {todayWorkout && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-0.5">
                  {alreadyToday ? "✓ Treino de hoje" : "Treino de hoje"}
                </p>
                <WorkoutCard workout={todayWorkout} idx={nextIdx} isNext={true}
                  isOngoing={ongoing?.workout_id === todayWorkout.id} />
              </div>
            )}

            {/* Concluído hoje */}
            {alreadyToday && (
              <div className="flex items-center gap-3 bg-green-500/8 border border-green-500/20 rounded-2xl px-4 py-3.5">
                <div className="h-9 w-9 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-green-400">Treino concluído hoje! 🏆</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeWorkouts.length > 1 ? "Amanhã começa o próximo." : "Repita quando quiser!"}
                  </p>
                </div>
              </div>
            )}

            {/* Todos os treinos ativos (quando há mais de 1) */}
            {activeWorkouts.length > 1 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-0.5">
                  Todos os treinos
                </p>
                <div className="space-y-2">
                  {activeWorkouts.map((w, idx) => (
                    <WorkoutCard key={w.id} workout={w} idx={idx}
                      isNext={idx === nextIdx} isOngoing={ongoing?.workout_id === w.id} />
                  ))}
                </div>
              </div>
            )}

            {/* Treinos expirados — colapsável, só aparece se existirem */}
            {expiredWorkouts.length > 0 && (
              <div>
                <button
                  className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-0.5 mb-2 w-full"
                  onClick={() => setShowExpired(p => !p)}
                >
                  <span className="flex-1 text-left">Treinos expirados ({expiredWorkouts.length})</span>
                  {showExpired ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
                {showExpired && (
                  <div className="space-y-2">
                    {expiredWorkouts.map((w, idx) => (
                      <WorkoutCard key={w.id} workout={w} idx={idx} isNext={false} isOngoing={false} />
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </MobileContent>

      {/* Footer CTA */}
      {!loading && !error && !isExpired && !allExpired && todayWorkout && (
        <MobileFooter>
          <Button variant="premium" size="xl" className="w-full gap-2"
            onClick={() => navigate(`/student/workout/${
              ongoing ? (workouts.find(w => w.id === ongoing.workout_id) || todayWorkout).id : todayWorkout.id
            }`)}>
            {ongoing
              ? <><Play className="h-5 w-5" />Continuar Treino</>
              : alreadyToday
              ? <><RefreshCw className="h-5 w-5" />Novo Ciclo — Repetir Treino</>
              : <><Dumbbell className="h-5 w-5" />Iniciar Treino de Hoje</>
            }
          </Button>
        </MobileFooter>
      )}
    </MobileContainer>
  );
};

export default StudentWorkoutsPage;