import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  MobileContainer, 
  MobileHeader, 
  MobileContent 
} from '@/components/layout/MobileContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  User, 
  Calendar, 
  Dumbbell,
  CheckCircle2,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Trophy,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const StudentDashboard = () => {
  const { user, profile, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const [error, setError] = useState(null);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const getOrCreateActiveSession = async () => {
  try {
    // 1. Buscar sessão ativa
    const { data: activeSession, error } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('student_id', user.id)
      .eq('status', 'active')
      .single();

    if (activeSession) {
      return activeSession;
    }

    // 2. Se não existir → descobrir workout_id atual do aluno
    const { data: studentWorkout } = await supabase
      .from('student_workouts')
      .select('workout_id')
      .eq('student_id', user.id)
      .single();

    if (!studentWorkout) {
      throw new Error('Aluno sem treino vinculado');
    }

    // 3. Criar nova sessão
    const { data: newSession, error: createError } = await supabase
      .from('workout_sessions')
      .insert([
        {
          workout_id: studentWorkout.workout_id,
          student_id: user.id,
          session_date: new Date().toISOString(),
          status: 'active'
        }
      ])
      .select()
      .single();

    if (createError) throw createError;

    return newSession;

  } catch (err) {
    console.error('Erro ao obter/criar sessão:', err);
    throw err;
  }
};

  // Fetch student's workout sessions
const fetchSessions = async () => {
  setLoading(true);
  setError(null);

  try {
    const { data, error: fetchError } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('student_id', user.id)
      .order('session_date', { ascending: false });

    if (fetchError) throw fetchError;
    setSessions(data || []);
  } catch (err) {
    console.error('Erro ao buscar sessões:', err);
    setError(err.message || 'Erro ao carregar sessões');
  } finally {
    setLoading(false);
  }
};

  // Fetch blocks for a session
  const fetchBlocks = async (session) => {
    setLoadingBlocks(true);
    setSelectedSession(session);
    console.log("SESSION ID:", session.id);
    console.log("USER ID:", user.id);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('workout_block_logs')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      setBlocks(data || []);
    } catch (err) {
      console.error('Erro ao buscar blocos:', err);
      toast.error('Erro ao carregar blocos do treino');
    } finally {
      setLoadingBlocks(false);
    }
  };

const toggleBlockCompletion = async (block) => {
  const isCompleted = !!block.completed_at;   // ← FALTAVA ISSO

  const newValue = isCompleted ? null : new Date().toISOString();

  setBlocks(prev =>
    prev.map(b =>
      b.id === block.id ? { ...b, completed_at: newValue } : b
    )
  );

  const { error } = await supabase
    .from('workout_block_logs')
    .update({ completed_at: newValue })
    .eq('id', block.id);

  if (error) {
    toast.error('Erro ao atualizar bloco');
  }
};
  // Progress calculations
  const completedCount = blocks.filter(b => b.completed_at).length;
  const allBlocksCompleted = blocks.length > 0 && completedCount === blocks.length;
  const progressPercent =
    blocks.length > 0
      ? Math.round((completedCount / blocks.length) * 100)
      : 0;

  // Finish session
  const handleFinishSession = async () => {
    if (!allBlocksCompleted) return;

    setFinishing(true);
    try {
      const { error: updateError } = await supabase
        .from('workout_sessions')
        .update({ 
            status: 'finished',
            completed_at: new Date().toISOString()
          })
        .eq('id', selectedSession.id);

      if (updateError) throw updateError;

      toast.success('Sessão concluída com sucesso!');
      setShowFinishModal(false);
      setSelectedSession(null);
      setBlocks([]);
      fetchSessions(); // Refresh sessions list
    } catch (err) {
      console.error('Erro ao finalizar sessão:', err);
      toast.error('Erro ao finalizar sessão');
    } finally {
      setFinishing(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      toast.error('Erro ao sair');
    }
  };

const initializeDashboard = async () => {
  setLoading(true);
  try {
    const session = await getOrCreateActiveSession();
    await fetchBlocks(session);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

//useEffect(() => {
  //if (user) {
  //  initializeDashboard();
 // }
// }, [user]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // Session List View
  if (!selectedSession) {
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
                <Badge variant="success" className="text-[10px] mt-0.5">
                  Aluno
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>
        </MobileHeader>

        <MobileContent>
          <div className="space-y-4 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-primary" />
                  Minhas Sessões
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Selecione uma sessão para treinar
                </p>
              </div>
              {!loading && (
                <Button variant="ghost" size="icon" onClick={fetchSessions}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Loading */}
            {loading && (
              <div className="py-12 text-center">
                <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Carregando sessões...</p>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <Card className="bg-card border-destructive/30">
                <CardContent className="py-8 text-center">
                  <AlertCircle className="h-10 w-10 mx-auto text-destructive mb-4" />
                  <p className="text-destructive font-medium mb-2">Erro ao carregar</p>
                  <p className="text-sm text-muted-foreground mb-4">{error}</p>
                  <Button variant="outline" onClick={fetchSessions} size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tentar novamente
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Sessions List */}
            {!loading && !error && (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <Card 
                    key={session.id}
                    className={cn(
                      "bg-card border-border cursor-pointer transition-all",
                      "hover:border-primary/30 active:scale-[0.98]",
                      session.status === 'finished' && "border-success/30 bg-success/5"
                    )}
                    onClick={() => fetchBlocks(session)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "h-10 w-10 rounded-lg flex items-center justify-center",
                            session.status === 'finished' 
                              ? "bg-success/20 text-success" 
                              : "bg-primary/10 text-primary"
                          )}>
                            {session.status === 'finished' ? (
                              <CheckCircle2 className="h-5 w-5" />
                            ) : (
                              <Dumbbell className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">
                              {session.workout_id}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDate(session.session_date)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {session.status === 'finished' && (
                            <Badge variant="success" className="text-xs">
                              Concluído
                            </Badge>
                          )}
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {sessions.length === 0 && (
                  <Card className="bg-card border-border">
                    <CardContent className="py-12 text-center">
                      <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">
                        Nenhuma sessão de treino encontrada
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </MobileContent>
      </MobileContainer>
    );
  }

  // Blocks View (Selected Session)
  return (
    <MobileContainer>
      <MobileHeader>
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              setSelectedSession(null);
              setBlocks([]);
            }}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <p className="font-semibold text-sm text-foreground">
              {selectedSession.workout_id}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDate(selectedSession.session_date)}
            </p>
          </div>
        </div>
      </MobileHeader>

      <MobileContent className="pb-24">
        <div className="space-y-4 animate-fade-in">
          {/* Progress Card */}
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progresso</span>
                <span className="text-sm font-semibold text-foreground">
                  {completedCount}/{blocks.length}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </CardContent>
          </Card>

          {/* Loading Blocks */}
          {loadingBlocks && (
            <div className="py-8 text-center">
              <Loader2 className="h-6 w-6 mx-auto text-primary animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">Carregando blocos...</p>
            </div>
          )}

          {/* Blocks List */}
          {!loadingBlocks && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" />
                Blocos do Treino
              </h2>

              {blocks.map((block, index) => (
                <Card 
                  key={block.id}
                  className={cn(
                    "bg-card border-border transition-all",
                    block.completed && "border-primary/40 bg-primary/5"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={!!block.completed_at}
                        onCheckedChange={() => toggleBlockCompletion(block)}
                        className="h-6 w-6"
                      />
                      <div className="flex-1">
                        <p className={cn(
                          "font-medium",
                          block.completed ? "text-primary" : "text-foreground"
                        )}>
                          Bloco {index + 1}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {block.block_id}
                        </p>
                      </div>
                      {block.completed && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {blocks.length === 0 && (
                <Card className="bg-card border-border">
                  <CardContent className="py-8 text-center">
                    <Dumbbell className="h-10 w-10 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum bloco encontrado para esta sessão
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </MobileContent>

      {/* Fixed Footer - Finish Button */}
      {blocks.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/90 backdrop-blur-lg border-t border-border safe-area-bottom">
          <div className="max-w-lg mx-auto">
            <Button
              variant={allBlocksCompleted ? "premium" : "secondary"}
              size="xl"
              className="w-full"
              disabled={!allBlocksCompleted}
              onClick={() => setShowFinishModal(true)}
            >
              <CheckCircle2 className="h-5 w-5" />
              {allBlocksCompleted 
                ? "Concluir Sessão"
                : `Complete todos os blocos (${completedCount}/${blocks.length})`
              }
            </Button>
          </div>
        </div>
      )}

      {/* Finish Modal */}
      <Dialog open={showFinishModal} onOpenChange={setShowFinishModal}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-2">
              <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-xl font-display text-foreground">
              Treino Completo!
            </DialogTitle>
            <DialogDescription>
              Parabéns! Você completou todos os blocos desta sessão.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col gap-2 sm:flex-col mt-4">
            <Button
              variant="premium"
              className="w-full"
              onClick={handleFinishSession}
              disabled={finishing}
            >
              {finishing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Finalizando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Confirmar Conclusão
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setShowFinishModal(false)}
              disabled={finishing}
            >
              Voltar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MobileContainer>
  );
};

export default StudentDashboard;
