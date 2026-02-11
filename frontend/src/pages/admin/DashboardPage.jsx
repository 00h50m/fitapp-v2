import React from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Dumbbell, 
  TrendingUp, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock stats data
const stats = [
  {
    title: "Total de Alunos",
    value: "127",
    change: "+12%",
    changeType: "positive",
    icon: Users,
    description: "vs. mês anterior"
  },
  {
    title: "Alunos Ativos",
    value: "98",
    change: "+8%",
    changeType: "positive",
    icon: Activity,
    description: "com acesso válido"
  },
  {
    title: "Exercícios",
    value: "45",
    change: "+3",
    changeType: "positive",
    icon: Dumbbell,
    description: "cadastrados"
  },
  {
    title: "Treinos Hoje",
    value: "23",
    change: "-5%",
    changeType: "negative",
    icon: Calendar,
    description: "check-ins registrados"
  },
];

// Mock recent activity
const recentActivity = [
  { id: 1, user: "João Silva", action: "Finalizou treino", time: "há 5 min", type: "checkin" },
  { id: 2, user: "Maria Santos", action: "Novo cadastro", time: "há 15 min", type: "signup" },
  { id: 3, user: "Pedro Costa", action: "Finalizou treino", time: "há 32 min", type: "checkin" },
  { id: 4, user: "Ana Lima", action: "Acesso renovado", time: "há 1 hora", type: "renewal" },
  { id: 5, user: "Carlos Oliveira", action: "Finalizou treino", time: "há 2 horas", type: "checkin" },
];

const StatCard = ({ stat }) => {
  const Icon = stat.icon;
  const isPositive = stat.changeType === "positive";

  return (
    <Card className="bg-card border-border hover:border-primary/30 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{stat.title}</p>
            <p className="text-3xl font-display font-bold text-foreground">
              {stat.value}
            </p>
            <div className="flex items-center gap-1.5">
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4 text-success" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-destructive" />
              )}
              <span className={cn(
                "text-sm font-medium",
                isPositive ? "text-success" : "text-destructive"
              )}>
                {stat.change}
              </span>
              <span className="text-xs text-muted-foreground">
                {stat.description}
              </span>
            </div>
          </div>
          <div className={cn(
            "h-12 w-12 rounded-xl flex items-center justify-center",
            "bg-primary/10 text-primary"
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardPage = () => {
  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Visão geral do seu aplicativo de treinos
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id}
                    className="flex items-center justify-between py-3 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold",
                        activity.type === "checkin" && "bg-success/10 text-success",
                        activity.type === "signup" && "bg-primary/10 text-primary",
                        activity.type === "renewal" && "bg-warning/10 text-warning"
                      )}>
                        {activity.user.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {activity.user}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.action}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-display flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Resumo Rápido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Taxa de Conclusão</span>
                  <Badge variant="success">Alta</Badge>
                </div>
                <p className="text-2xl font-bold text-foreground">87%</p>
                <div className="h-2 bg-muted rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full"
                    style={{ width: '87%' }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Renovações Pendentes</span>
                  <Badge variant="warning">Atenção</Badge>
                </div>
                <p className="text-2xl font-bold text-foreground">12</p>
                <p className="text-xs text-muted-foreground mt-1">
                  alunos com acesso expirando em 7 dias
                </p>
              </div>

              <div className="p-4 rounded-xl bg-muted/50 border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Média de Treinos/Semana</span>
                </div>
                <p className="text-2xl font-bold text-foreground">3.2</p>
                <p className="text-xs text-muted-foreground mt-1">
                  por aluno ativo
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
