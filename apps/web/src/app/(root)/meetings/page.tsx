'use client';

import { useState, useEffect } from 'react';
import { MeetingGrid, type Meeting } from '@/components/app-layout/MeetingGrid';
import { NewMeetingForm } from '@/components/app-layout/NewMeetingForm';
import { getMeetings } from '@/actions/getMeetings';
import { toast } from 'sonner';

export default function MeetingsPage() {
  const [showNewMeetingForm, setShowNewMeetingForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  // fetch meetings from database
  const fetchMeetings = async () => {
    try {
      const result = await getMeetings();

      if (!result.success) {
        toast.error(result.error || "Failed to fetch meetings");
        return;
      }

      if (result.data) {
        setMeetings(result.data);
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
      toast.error("Failed to load meetings");
    } finally {
      setIsLoading(false);
    }
  };

  // initial fetch on mount
  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleCreateMeeting = () => {
    setShowNewMeetingForm(true);
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
              onCancel={() => setShowNewMeetingForm(false)}
            />
          ) : (
            <MeetingGrid
              meetings={meetings}
              onCreateNew={handleCreateMeeting}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </main>
  );
}
