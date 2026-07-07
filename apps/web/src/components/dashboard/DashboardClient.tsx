'use client';

import { DashboardStats } from '@/actions/getDashboardStats';
import { GreetingHeader } from './GreetingHeader';
import { StatCard } from './StatCard';
import { ActivityChart } from './ActivityChart';
import { StatusRadar } from './StatusRadar';
import { RecentMeetingsTable } from './RecentMeetingsTable';
import { QuickActions } from './QuickActions';
import { Calendar, CheckCircle, Zap, TrendingUp } from 'lucide-react';

interface DashboardClientProps {
  stats: DashboardStats;
  user?: { name?: string | null; email?: string | null; image?: string | null };
}

export function DashboardClient({ stats, user }: DashboardClientProps) {
  return (
    <div className="space-y-6">
      {/* Row 1: Greeting */}
      <GreetingHeader userName={user?.name} />

      {/* Row 2: Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Total Meetings" 
          value={stats.totalMeetings} 
          icon={Calendar} 
          description="All sessions"
        />
        <StatCard 
          label="Completed" 
          value={stats.completedMeetings} 
          icon={CheckCircle} 
          description={`${stats.completionRate}% completion rate`} 
        />
        <StatCard 
          label="Ready to Start" 
          value={stats.readyMeetings + stats.inProgressMeetings} 
          icon={Zap} 
          description="Awaiting your action"
        />
        <StatCard 
          label="Avg Score" 
          value={stats.averageScore ?? '—'} 
          icon={TrendingUp} 
          description="Across all evaluations" 
        />
      </div>

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <ActivityChart data={stats.activityTimeline} />
        </div>
        <div className="lg:col-span-2">
          <StatusRadar 
            data={stats.statusDistribution} 
          />
        </div>
      </div>

      {/* Row 4: Table + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3">
          <RecentMeetingsTable meetings={stats.recentMeetings} />
        </div>
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
