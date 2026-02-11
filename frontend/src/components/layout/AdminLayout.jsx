import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  Users, 
  Dumbbell, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  Zap
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Alunos",
    href: "/admin/alunos",
    icon: Users,
  },
  {
    title: "Exercícios",
    href: "/admin/exercicios",
    icon: Dumbbell,
  },
];

export const AdminSidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full",
          "w-72 bg-card border-r border-border",
          "flex flex-col",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo/Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground text-lg leading-none">
                FitApp
              </h1>
              <span className="text-[10px] text-primary font-medium uppercase tracking-wider">
                Admin
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onToggle}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== "/admin" && location.pathname.startsWith(item.href));
              
              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={() => window.innerWidth < 1024 && onToggle()}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl",
                    "text-sm font-medium",
                    "transition-all duration-200",
                    "group relative overflow-hidden",
                    isActive
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  {/* Active indicator glow */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                  )}
                  
                  <item.icon className={cn(
                    "h-5 w-5 flex-shrink-0 relative z-10",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  
                  <span className="relative z-10 flex-1">{item.title}</span>
                  
                  {isActive && (
                    <ChevronRight className="h-4 w-4 text-primary/60 relative z-10" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Footer - Logout */}
        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 px-4 py-3 h-auto",
              "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            )}
            onClick={() => {
              // Mock logout - would redirect to login
              window.location.href = "/";
            }}
          >
            <LogOut className="h-5 w-5" />
            <span>Sair</span>
          </Button>
        </div>
      </aside>
    </>
  );
};

export const AdminHeader = ({ onMenuToggle }) => {
  return (
    <header className="h-16 px-4 lg:px-6 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
      {/* Mobile Menu Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Breadcrumb / Page Title - Can be customized per page */}
      <div className="hidden lg:block" />

      {/* Right side - Admin info */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-foreground">Administrador</p>
          <p className="text-xs text-muted-foreground">admin@fitapp.com</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
          <span className="text-sm font-semibold text-primary">A</span>
        </div>
      </div>
    </header>
  );
};

export const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Header */}
        <AdminHeader onMenuToggle={toggleSidebar} />

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
