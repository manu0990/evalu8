'use client';

import { useState } from 'react';
import { DashboardOverview } from '@/components/app-layout/DashboardOverview';
import { AppSidebar } from '@/components/app-layout/AppSidebar';
import { MeetingGrid, type Meeting } from '@/components/app-layout/MeetingCard';
import { NewMeetingForm } from '@/components/app-layout/NewMeetingForm';
import { EmptyState } from '@/components/app-layout/EmptyState';
import { DashboardSkeleton } from '@/components/app-layout/Skeleton';
import { useSession } from 'next-auth/react';
import { BarChart3, Settings } from 'lucide-react';
import { SidebarProvider, SidebarInset } from '@repo/ui';

type ViewType = 'dashboard' | 'meetings' | 'analytics' | 'settings';

export default function Home() {
  const { data: session, status } = useSession();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [showNewMeetingForm, setShowNewMeetingForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with actual API calls
  const [meetings, setMeetings] = useState<Meeting[]>([
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

  const handleCreateMeeting = () => {
    setShowNewMeetingForm(true);
    setCurrentView('meetings');
  };

  const handleSubmitMeeting = async (formData: {
    companyName: string;
    companyWebsite: string;
    roleToApply: string;
    requirements: string;
    resumeFile: File | null;
  }) => {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      const newMeeting: Meeting = {
        id: Date.now().toString(),
        companyName: formData.companyName,
        companyWebsite: formData.companyWebsite,
        roleToApply: formData.roleToApply,
        requirements: formData.requirements,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };

      setMeetings([newMeeting, ...meetings]);
      setShowNewMeetingForm(false);
      setIsLoading(false);
    }, 6000);
  };

  const handleStartMeeting = (meetingId: string) => {
    console.log('Starting meeting:', meetingId);
    // Implement meeting start logic
  };

  const handleViewMeeting = (meetingId: string) => {
    console.log('Viewing meeting:', meetingId);
    // Implement meeting view logic
  };

  if (status === 'loading') {
    return (
      <div className="flex h-screen bg-background">
        <div className="w-64 border-r bg-card">
          {/* Sidebar skeleton */}
        </div>
        <div className="flex-1 flex flex-col">
          <div className="h-16 border-b bg-card"></div>
          <main className="flex-1 overflow-auto p-6">
            <DashboardSkeleton />
          </main>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        onCreateMeeting={handleCreateMeeting}
        user={session?.user}
      />

      <SidebarInset>
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-6 max-w-7xl">
            {currentView === 'dashboard' && (
              <DashboardOverview stats={stats} />
            )}

            {currentView === 'meetings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight">All Meetings</h2>
                    <p className="text-muted-foreground">
                      Manage your interview sessions and practice materials
                    </p>
                  </div>
                </div>

                {showNewMeetingForm ? (
                  <NewMeetingForm
                    onSubmit={handleSubmitMeeting}
                    onCancel={() => setShowNewMeetingForm(false)}
                    isSubmitting={isLoading}
                  />
                ) : (
                  <MeetingGrid
                    meetings={meetings}
                    onStart={handleStartMeeting}
                    onView={handleViewMeeting}
                    onCreateNew={handleCreateMeeting}
                  />
                )}
              </div>
            )}

            {currentView === 'analytics' && (
              <EmptyState
                icon={BarChart3}
                title="Analytics Coming Soon"
                description="We're working on detailed analytics to help you track your interview performance and progress over time."
              />
            )}

            {currentView === 'settings' && (
              <EmptyState
                icon={Settings}
                title="Settings"
                description="Account settings and preferences will be available here soon."
              />
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
