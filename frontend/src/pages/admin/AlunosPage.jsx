import React, { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  Search, 
  Plus, 
  MoreHorizontal,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Mock students data
const mockStudents = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@email.com",
    access_start: "2025-01-01",
    access_end: "2026-12-31",
    workout_name: "Treino A - Superior",
    is_active: true,
    checkins_count: 45,
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@email.com",
    access_start: "2025-02-15",
    access_end: "2025-08-15",
    workout_name: "Treino B - Inferior",
    is_active: true,
    checkins_count: 32,
  },
  {
    id: "3",
    name: "Pedro Costa",
    email: "pedro@email.com",
    access_start: "2024-06-01",
    access_end: "2024-12-01",
    workout_name: "Treino C - Full Body",
    is_active: false,
    checkins_count: 67,
  },
  {
    id: "4",
    name: "Ana Lima",
    email: "ana@email.com",
    access_start: "2025-03-01",
    access_end: "2025-09-01",
    workout_name: "Treino A - Superior",
    is_active: true,
    checkins_count: 28,
  },
  {
    id: "5",
    name: "Carlos Oliveira",
    email: "carlos@email.com",
    access_start: "2025-01-15",
    access_end: "2025-07-15",
    workout_name: "Treino D - HIIT",
    is_active: true,
    checkins_count: 51,
  },
];

const AlunosPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [students] = useState(mockStudents);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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
              Gerencie os alunos cadastrados no sistema
            </p>
          </div>
          <Button variant="premium" className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Novo Aluno
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{students.length}</p>
                <p className="text-sm text-muted-foreground">Total de Alunos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {students.filter(s => s.is_active).length}
                </p>
                <p className="text-sm text-muted-foreground">Ativos</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {students.filter(s => !s.is_active).length}
                </p>
                <p className="text-sm text-muted-foreground">Inativos</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Table */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle className="text-lg font-display">
                Lista de Alunos
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Aluno</TableHead>
                    <TableHead className="text-muted-foreground hidden md:table-cell">Treino Atual</TableHead>
                    <TableHead className="text-muted-foreground hidden lg:table-cell">Acesso</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground text-right">Ações</TableHead>
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
                          <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold",
                            student.is_active 
                              ? "bg-primary/10 text-primary" 
                              : "bg-muted text-muted-foreground"
                          )}>
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{student.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {student.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-foreground">{student.workout_name}</span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(student.access_start)}</span>
                            <span>-</span>
                            <span>{formatDate(student.access_end)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.is_active ? "success" : "destructive"}>
                          {student.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Eye className="h-4 w-4" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 cursor-pointer">
                              <Edit className="h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                              <Trash2 className="h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredStudents.length === 0 && (
              <div className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Nenhum aluno encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AlunosPage;
