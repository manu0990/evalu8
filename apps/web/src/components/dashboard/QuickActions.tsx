'use client';

import { Card, CardHeader, CardContent, Separator } from '@repo/ui';
import { Plus, BarChart3, Calendar, Settings, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      label: 'New Meeting',
      description: 'Start a new interview session',
      icon: Plus,
      href: '/meetings?new=true',
      color: 'text-primary'
    },
    {
      label: 'Browse Meetings',
      description: 'See all your sessions',
      icon: Calendar,
      href: '/meetings',
      color: 'text-chart-2'
    },
    {
      label: 'View Analytics',
      description: 'Track your performance',
      icon: BarChart3,
      href: '/analytics',
      color: 'text-chart-1'
    },
    {
      label: 'Settings',
      description: 'Manage your account',
      icon: Settings,
      href: '/settings/profile',
      color: 'text-muted-foreground'
    }
  ];

  return (
    <Card className='border-accent'>
      <CardHeader>
        <h3 className="text-lg font-semibold">Quick Actions</h3>
      </CardHeader>
      <CardContent className="px-4">
        <div className="space-y-1">
          {actions.map((action, i) => {
            const Icon = action.icon;
            return (
              <div key={i}>
                <div 
                  className="flex items-center justify-between hover:bg-accent/50 rounded-lg transition-colors p-3 cursor-pointer"
                  onClick={() => router.push(action.href)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-muted p-2">
                      <Icon className={`h-4 w-4 ${action.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                {i < actions.length - 1 && <Separator className="my-1 mx-3 w-auto" />}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
