'use client';

import { Button } from "@repo/ui";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className = "" 
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-16 ${className}`}>
      <div className="rounded-full bg-muted/50 p-6 mb-6">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} className="min-w-[120px]">
          {action.label}
        </Button>
      )}
    </div>
  );
}