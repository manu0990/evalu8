"use client";

import { Building2 } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { MeetingCard, MeetingStatus } from "./MeetingCard";

export interface Meeting {
  id: string;
  companyName: string;
  companyWebsite?: string;
  roleToApply: string;
  requirements: string;
  status: MeetingStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface MeetingGridProps {
  meetings: Meeting[];
  onCreateNew?: () => void;
  onDelete?: (meetingId: string) => void;
  onStatusChange?: (meetingId: string, newStatus: MeetingStatus) => void;
  isLoading?: boolean;
}

export function MeetingGrid({ meetings, onCreateNew, onDelete, onStatusChange, isLoading }: MeetingGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-muted-foreground">Loading meetings...</div>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No meetings yet"
        description="Create your first interview meeting to start practicing and improving your interview skills."
        action={onCreateNew ? {
          label: "Create Meeting",
          onClick: onCreateNew
        } : undefined}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {meetings.map((meeting) => (
        <MeetingCard
          key={meeting.id}
          meeting={meeting}
          onDelete={onDelete}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
}