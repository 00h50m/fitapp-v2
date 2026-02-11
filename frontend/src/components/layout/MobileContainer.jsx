import React from "react";
import { cn } from "@/lib/utils";

export const MobileContainer = ({ children, className }) => {
  return (
    <div 
      className={cn(
        "min-h-screen min-h-dvh w-full max-w-lg mx-auto",
        "bg-background",
        "flex flex-col",
        className
      )}
    >
      {children}
    </div>
  );
};

export const MobileHeader = ({ children, className }) => {
  return (
    <header 
      className={cn(
        "sticky top-0 z-40",
        "px-4 py-4",
        "bg-background/80 backdrop-blur-lg",
        "border-b border-border/50",
        "safe-area-top",
        className
      )}
    >
      {children}
    </header>
  );
};

export const MobileContent = ({ children, className }) => {
  return (
    <main 
      className={cn(
        "flex-1 px-4 py-4",
        "overflow-y-auto",
        className
      )}
    >
      {children}
    </main>
  );
};

export const MobileFooter = ({ children, className }) => {
  return (
    <footer 
      className={cn(
        "sticky bottom-0 z-40",
        "px-4 py-4",
        "bg-background/90 backdrop-blur-lg",
        "border-t border-border/50",
        "safe-area-bottom",
        className
      )}
    >
      {children}
    </footer>
  );
};
