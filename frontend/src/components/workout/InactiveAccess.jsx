import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const InactiveAccess = ({ student, onContactSupport }) => {
  const accessEndDate = new Date(student.access_end).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 animate-fade-in">
      <Card className={cn(
        "w-full max-w-sm",
        "bg-card border-destructive/30",
        "overflow-hidden"
      )}>
        {/* Warning Banner */}
        <div className="bg-destructive/10 px-4 py-3 border-b border-destructive/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <span className="font-semibold text-destructive text-sm">
              Acesso Inativo
            </span>
          </div>
        </div>

        <CardContent className="p-6 space-y-4">
          {/* Icon */}
          <div className="flex justify-center">
            <div className={cn(
              "h-20 w-20 rounded-full",
              "bg-destructive/10",
              "flex items-center justify-center"
            )}>
              <Calendar className="h-10 w-10 text-destructive/70" />
            </div>
          </div>

          {/* Message */}
          <div className="text-center space-y-2">
            <h2 className="text-lg font-display font-bold text-foreground">
              Seu acesso expirou
            </h2>
            <p className="text-sm text-muted-foreground">
              Seu período de acesso terminou em{" "}
              <span className="font-semibold text-foreground">
                {accessEndDate}
              </span>
            </p>
          </div>

          {/* What to do */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Entre em contato com seu treinador para renovar o acesso e continuar seus treinos.
            </p>
          </div>

          {/* CTA */}
          <Button 
            variant="premium" 
            className="w-full"
            onClick={onContactSupport}
          >
            <MessageCircle className="h-4 w-4" />
            Falar com Treinador
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
