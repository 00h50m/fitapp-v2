import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from "react-router-dom";
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Users, 
  Search, 
  Plus, 
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
  RefreshCw,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const AdminAlunosPage = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state for creating session
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sessionDate, setSessionDate] = useState('');
  const [workoutId, setWorkoutId] = useState('');
  const [creatingSession, setCreatingSession] = useState(false);

  // Fetch students (role = 'student')
    const fetchStudents = async () => {

      setLoading(true)
      setError(null)

      try {

        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            name,
            email,
            plan,
            training_level,
            is_active,
            access_end
          `)
          .eq('role', 'student')
          .order('created_at', { ascending: false })

        if (error) throw error

        setStudents(data || [])

      } catch (err) {

        console.error('Erro ao buscar alunos:', err)
        setError(err.message)

      } finally {

        setLoading(false)

      }

    }

  useEffect(() => {
    fetchStudents();
  }, []);

  // Filter students based on search
  const filteredStudents = students.filter(student => {
    const term = searchTerm.toLowerCase();
    return (
      (student.name?.toLowerCase() || '').includes(term) ||
      (student.email?.toLowerCase() || '').includes(term)
    );
  });

  // Stats
  const totalStudents = students.length;

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Open session creation modal
  const handleCreateSession = (student) => {
    setSelectedStudent(student);
    setSessionDate(new Date().toISOString().split('T')[0]);
    setWorkoutId('');
    setShowSessionModal(true);
  };

  // Create workout session
  const handleSubmitSession = async () => {
    if (!selectedStudent || !sessionDate || !workoutId.trim()) {
      toast.error('Preencha todos os campos');
      return;
    }

    setCreatingSession(true);
    try {
      const { error: insertError } = await supabase
        .from('workout_sessions')
        .insert({
          student_id: selectedStudent.id,
          workout_id: workoutId.trim(),
          session_date: sessionDate,
        });

      if (insertError) throw insertError;

      toast.success('Sessão de treino criada com sucesso!');
      setShowSessionModal(false);
      setSelectedStudent(null);
    } catch (err) {
      console.error('Erro ao criar sessão:', err);
      toast.error(err.message || 'Erro ao criar sessão');
    } finally {
      setCreatingSession(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              Alunos
            </h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os alunos e suas sessões de treino
            </p>
          </div>

          <Button
            onClick={() => navigate("/admin/alunos/novo")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Aluno
          </Button>

        </div>

        {/* Stats Card */}
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {loading ? '-' : totalStudents}
              </p>
              <p className="text-sm text-muted-foreground">Total de Alunos</p>
            </div>
          </CardContent>
        </Card>

        {/* Search and Table */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                Lista de Alunos
                {!loading && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={fetchStudents}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                )}
              </CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-muted border-border"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Loading State */}
            {loading && (
              <div className="py-12 text-center">
                <Loader2 className="h-8 w-8 mx-auto text-primary animate-spin mb-4" />
                <p className="text-muted-foreground">Carregando alunos...</p>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="py-12 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
                <p className="text-destructive font-medium mb-2">Erro ao carregar dados</p>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button variant="outline" onClick={fetchStudents} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Tentar novamente
                </Button>
              </div>
            )}

            {/* Table */}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <Table>
               <TableHeader>
                    <TableRow>

                    <TableHead>Aluno</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Plano até</TableHead>
                    <TableHead>Ações</TableHead>

                    </TableRow>
                    </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow 
                        key={student.id} 
                        className="border-border hover:bg-muted/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                              {getInitials(student.name)}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {student.name || 'Sem nome'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {student.email || '-'}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant="secondary">
                            {student.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleCreateSession(student)}
                          >
                            <Plus className="h-4 w-4" />
                            Nova Sessão
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredStudents.length === 0 && (
              <div className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'Nenhum aluno encontrado' : 'Nenhum aluno cadastrado'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        </div>

      {/* Create Session Modal */}
      <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Nova Sessão de Treino
            </DialogTitle>
            <DialogDescription>
              Criar sessão para {selectedStudent?.name || 'aluno'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Data da Sessão
              </label>
              <Input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="bg-muted border-border"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                ID do Treino
              </label>
              <Input
                placeholder="Ex: treino_a, treino_b..."
                value={workoutId}
                onChange={(e) => setWorkoutId(e.target.value)}
                className="bg-muted border-border"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowSessionModal(false)}
              disabled={creatingSession}
            >
              Cancelar
            </Button>
            <Button
              variant="premium"
              onClick={handleSubmitSession}
              disabled={creatingSession}
            >
              {creatingSession ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Criar Sessão
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminAlunosPage;
