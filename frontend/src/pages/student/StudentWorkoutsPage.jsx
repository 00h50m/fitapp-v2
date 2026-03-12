import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  MobileContainer, MobileHeader, MobileContent,
} from "@/components/layout/MobileContainer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  User, Dumbbell, LogOut, Loader2, ChevronRight,
  Calendar, CheckCircle2, XCircle, Clock, Star,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const getStatus = (startDate, endDate, status) => {
  if (status && status !== "active") return status;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (endDate && new Date(endDate) < today) return "expired";
  if (startDate && new Date(startDate) > today) return "pending";
  return "active";
};

const statusConfig = {
  active:  { label: "Ativo",    icon: CheckCircle2, color: "text-green-400",  bg: "bg-green-400/10 border-green-400/30" },
  expired: { label: "Expirado", icon: XCircle,      color: "text-red-400",    bg: "bg-red-400/10 border-red-400/30" },
  pending: { label: "Pendente", icon: Clock,         color: "text-yellow-400", bg: "bg-yellow-400/10 border-yellow-400/30" },
};

const StudentWorkoutsPage = () => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState([]);
  const [todayWorkoutId, setTodayWorkoutId] = useState(null); // treino sugerido para hoje
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        // 1. Busca treinos ativos do aluno
        const { data, error } = await supabase
          .from("student_workouts")
          .select("id, title, status, start_date, end_date, created_at")
          .eq("student_id", user.id)
          .order("created_at", { ascending: true });
        if (error) throw error;

        const list = data || [];
        setWorkouts(list);

        // 2. Determina "treino do dia" pela rotação
        // Pega último treino concluído e sugere o próximo na sequência
        const activeList = list.filter(w =>
          getStatus(w.start_date, w.end_date, w.status) === "active"
        );

        if (activeList.length === 0) return;
        if (activeList.length === 1) {
          setTodayWorkoutId(activeList[0].id);
          return;
        }

        // Busca última sessão finalizada para determinar rotação
        const { data: lastSession } = await supabase
          .from("workout_sessions")
          .select("workout_id, session_date")
          .eq("student_id", user.id)
          .eq("finished", true)
          .order("session_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!lastSession) {
          // Nunca treinou → sugere o primeiro
          setTodayWorkoutId(activeList[0].id);
          return;
        }

        // Encontra índice do último treino feito e sugere o próximo
        const lastIdx = activeList.findIndex(w => w.id === lastSession.workout_id);
        if (lastIdx === -1) {
          setTodayWorkoutId(activeList[0].id);
        } else {
          const nextIdx = (lastIdx + 1) % activeList.length;
          setTodayWorkoutId(activeList[nextIdx].id);
        }
      } catch (err) {
        toast.error("Erro ao carregar treinos");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleLogout = async () => {
    try { await logout(); } catch { toast.error("Erro ao sair"); }
  };

  const formatDate = d => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

  const activeCount = workouts.filter(w =>
    getStatus(w.start_date, w.end_date, w.status) === "active"
  ).length;

  return (
    <MobileContainer>
      <MobileHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">{profile?.name || "Aluno"}</p>
              <Badge variant="success" className="text-[10px] mt-0.5">Acesso Ativo</Badge>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>
      </MobileHeader>

      <MobileContent className="pb-8">
        <div className="space-y-4 animate-fade-in">
          <div className="pt-2">
            <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-primary" />
              Meus Treinos
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {activeCount} treino(s) ativo(s)
            </p>
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : workouts.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Nenhum treino atribuído ainda</p>
                <p className="text-xs text-muted-foreground mt-1">Aguarde seu treinador configurar seu treino</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {workouts.map(workout => {
                const status = getStatus(workout.start_date, workout.end_date, workout.status);
                const cfg = statusConfig[status] || statusConfig.pending;
                const StatusIcon = cfg.icon;
                const isActive = status === "active";
                const isToday = workout.id === todayWorkoutId;

                return (
                  <Card
                    key={workout.id}
                    className={cn(
                      "border transition-all duration-200",
                      isActive && isToday
                        ? "bg-primary/5 border-primary/50 cursor-pointer"
                        : isActive
                        ? "bg-card border-border hover:border-primary/30 cursor-pointer"
                        : "bg-muted/30 border-border opacity-60"
                    )}
                    onClick={() => isActive && navigate(`/student/workout/${workout.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={cn(
                            "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 border",
                            isToday && isActive
                              ? "bg-primary/20 border-primary/40"
                              : isActive
                              ? "bg-primary/10 border-primary/20"
                              : "bg-muted border-border"
                          )}>
                            {isToday && isActive
                              ? <Star className="h-5 w-5 text-primary" fill="currentColor" />
                              : <Dumbbell className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                            }
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground truncate">{workout.title}</p>
                              {isToday && isActive && (
                                <Badge className="text-[10px] bg-primary/20 text-primary border-primary/30 flex-shrink-0">
                                  Hoje
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={cn("inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border", cfg.bg, cfg.color)}>
                                <StatusIcon className="h-3 w-3" />
                                {cfg.label}
                              </span>
                              {workout.end_date && (
                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  até {formatDate(workout.end_date)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {isActive && (
                          <ChevronRight className={cn("h-5 w-5 flex-shrink-0", isToday ? "text-primary" : "text-muted-foreground")} />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </MobileContent>
    </MobileContainer>
  );
};

export default StudentWorkoutsPage;