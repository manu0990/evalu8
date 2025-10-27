'use client';

import { useState } from 'react';
import { MeetingGrid, type Meeting } from '@/components/app-layout/MeetingCard';
import { NewMeetingForm } from '@/components/app-layout/NewMeetingForm';

export default function MeetingsPage() {
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

  const handleCreateMeeting = () => {
    setShowNewMeetingForm(true);
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

  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto p-6 max-w-7xl">
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
      </div>
    </main>
  );
}
