import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Users, Plus, Search, RefreshCw, Loader2,
  AlertCircle, ChevronRight, Calendar, Mail,
  CheckCircle2, Clock, UserX,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function getAccessStatus(access_end) {
  if (!access_end) return { label: "Sem data", variant: "secondary", icon: Clock };
  const end = new Date(access_end + "T23:59");
  const now = new Date();
  const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: "Expirado", variant: "destructive", icon: UserX };
  if (diffDays <= 7) return { label: `Expira em ${diffDays}d`, variant: "warning", icon: Clock };
  return { label: "Ativo", variant: "success", icon: CheckCircle2 };
}

function getInitials(name) {
  if (!name) return "?";
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

const HUES = [0, 25, 45, 120, 200, 260, 300];
function getHue(str) {
  if (!str) return 0;
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h + str.charCodeAt(i)) % HUES.length;
  return HUES[h];
}

const AdminAlunosPage = () => {
  const navigate = useNavigate();
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Colunas corretas conforme schema real da tabela profiles
      const { data, error: err } = await supabase
        .from("profiles")
        .select("id, name, email, phone, access_end, training_level, plan, created_at")
        .eq("role", "student")
        .order("name", { ascending: true });

      if (err) throw err;
      setAlunos(data || []);
    } catch (err) {
      setError(err.message);
      toast.error("Erro ao carregar alunos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = alunos.filter(a => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return a.name?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q);
  });

  const total = alunos.length;
  const ativos = alunos.filter(a => {
    if (!a.access_end) return false;
    return new Date(a.access_end + "T23:59") >= new Date();
  }).length;

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground">Alunos</h1>
              <p className="text-sm text-muted-foreground">Gerencie os alunos e suas sessões de treino</p>
            </div>
          </div>
          <Button
            variant="premium"
            className="gap-2 w-full sm:w-auto"
            onClick={() => navigate("/admin/alunos/novo")}
          >
            <Plus className="h-4 w-4" />
            Novo Aluno
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{loading ? "—" : total}</p>
                  <p className="text-xs text-muted-foreground">Total de Alunos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{loading ? "—" : ativos}</p>
                  <p className="text-xs text-muted-foreground">Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border col-span-2 sm:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center justify-center flex-shrink-0">
                  <UserX className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{loading ? "—" : total - ativos}</p>
                  <p className="text-xs text-muted-foreground">Expirados/Sem plano</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <CardTitle className="text-base font-display">Lista de Alunos</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-8 h-8 text-sm bg-muted border-border"
                  />
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={load}>
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-7 w-7 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="py-12 text-center px-4">
                <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-3" />
                <p className="text-sm text-destructive mb-3">{error}</p>
                <Button variant="outline" size="sm" onClick={load}>
                  <RefreshCw className="h-3.5 w-3.5 mr-2" />Tentar novamente
                </Button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center px-4">
                <Users className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {search ? `Nenhum aluno encontrado para "${search}"` : "Nenhum aluno cadastrado"}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map(aluno => {
                  const status = getAccessStatus(aluno.access_end);
                  const initials = getInitials(aluno.name);
                  const hue = getHue(aluno.name);

                  return (
                    <div
                      key={aluno.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/admin/alunos/${aluno.id}`)}
                    >
                      <div
                        className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border"
                        style={{
                          background: `hsl(${hue} 60% 20%)`,
                          borderColor: `hsl(${hue} 60% 30%)`,
                          color: `hsl(${hue} 80% 70%)`,
                        }}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-foreground truncate">
                            {aluno.name || "Sem nome"}
                          </p>
                          <Badge variant={status.variant} className="text-[10px] flex-shrink-0">
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          {aluno.email && (
                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              {aluno.email}
                            </p>
                          )}
                          {aluno.access_end && (
                            <p className="text-xs text-muted-foreground flex-shrink-0 hidden sm:flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(aluno.access_end + "T12:00").toLocaleDateString("pt-BR")}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminAlunosPage;