import { Card, CardContent } from '@repo/ui';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
}

export function StatCard({ label, value, icon: Icon, description }: StatCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 border-accent">
      <CardContent className="px-6 py-0">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold">{value}</p>
              <Icon className="h-5 w-5 text-primary rounded-full" />
            </div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
      </CardContent>
    </Card>
  );
}
