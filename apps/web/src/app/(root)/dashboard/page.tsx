'use client';

import { useState } from 'react';
import { DashboardOverview } from '@/components/app-layout/DashboardOverview';
import { type Meeting } from '@/components/app-layout/MeetingCard';
import { DashboardSkeleton } from '@/components/app-layout/Skeleton';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { status } = useSession();

  // Mock data - replace with actual API calls
  const [meetings] = useState<Meeting[]>([
    {
      id: '1',
      companyName: 'Google',
      companyWebsite: 'https://google.com',
      roleToApply: 'Senior Software Engineer',
      requirements: 'Looking for experienced engineers with strong background in distributed systems and cloud technologies.',
      status: 'QUESTIONNAIRE_READY',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      companyName: 'Microsoft',
      companyWebsite: 'https://microsoft.com',
      roleToApply: 'Product Manager',
      requirements: 'Seeking a product manager with 5+ years of experience in enterprise software.',
      status: 'PENDING',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: '3',
      companyName: 'Amazon',
      roleToApply: 'Data Scientist',
      requirements: 'Machine learning expert with strong statistical background and Python expertise.',
      status: 'COMPLETED',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      completedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const stats = {
    totalMeetings: meetings.length,
    completedMeetings: meetings.filter(m => m.status === 'COMPLETED').length,
    averageDuration: 45,
    pendingMeetings: meetings.filter(m => m.status === 'PENDING').length,
    inProgressMeetings: meetings.filter(m => m.status === 'IN_PROGRESS').length,
    readyMeetings: meetings.filter(m => m.status === 'QUESTIONNAIRE_READY').length,
  };

  if (status === 'loading') {
    return (
      <main className="flex-1 overflow-auto p-6">
        <DashboardSkeleton />
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto p-6 max-w-7xl">
        <DashboardOverview stats={stats} />
      </div>
    </main>
  );
}
