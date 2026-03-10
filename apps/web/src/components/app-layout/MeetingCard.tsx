'use client';

import { Card, CardHeader, CardContent, CardFooter, Button, Badge } from "@repo/ui";
import { Building2, Calendar, Clock, Play, Eye, MoreHorizontal, ExternalLink, X } from "lucide-react";
import { Meeting } from "./MeetingGrid";

export type MeetingStatus = 'PENDING' | 'QUESTIONNAIRE_READY' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface MeetingCardProps {
  meeting: Meeting;
  onStart: (meetingId: string) => void;
  onView: (meetingId: string) => void;
}

export const statusConfig = {
  PENDING: {
    label: 'Processing',
    variant: 'secondary' as const,
    description: 'AI is preparing your interview questions'
  },
  QUESTIONNAIRE_READY: {
    label: 'Ready',
    variant: 'default' as const,
    description: 'Interview questions are ready'
  },
  IN_PROGRESS: {
    label: 'In Progress',
    variant: 'secondary' as const,
    description: 'Interview session is active'
  },
  COMPLETED: {
    label: 'Completed',
    variant: 'outline' as const,
    description: 'Interview session finished'
  },
  CANCELLED: {
    label: 'Cancelled',
    variant: 'destructive' as const,
    description: 'Interview session was cancelled'
  }
};

export function MeetingCard({ meeting, onStart, onView }: MeetingCardProps) {
  const status = statusConfig[meeting.status as MeetingStatus];
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderActionButton = () => {
    switch (meeting.status) {
      case 'COMPLETED':
        return (
          <Button
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={() => onView(meeting.id)}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Results
          </Button>
        );
      case 'QUESTIONNAIRE_READY':
        return (
          <Button
            className="flex-1 cursor-pointer"
            onClick={() => onStart(meeting.id)}
          >
            <Play className="mr-2 h-4 w-4" />
            Start Interview
          </Button>
        );
      case 'IN_PROGRESS':
        return (
          <Button
            variant="destructive"
            className="flex-1 cursor-pointer"
            onClick={() => onStart(meeting.id)}
          >
            <Play className="mr-2 h-4 w-4" />
            Resume Interview
          </Button>
        );
      case 'PENDING':
        return (
          <Button
            variant="outline"
            className="flex-1 cursor-pointer"
            disabled
          >
            <Clock className="mr-2 h-4 w-4" />
            Processing...
          </Button>
        );
      case 'CANCELLED':
        return (
          <Button
            variant="destructive"
            className="flex-1 cursor-pointer"
            disabled
          >
            <X className="mr-2 h-4 w-4" />
            Cancelled
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-lg">{meeting.companyName}</h3>
              {meeting.companyWebsite && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  asChild
                >
                  <a
                    href={meeting.companyWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
            <p className="text-sm font-medium text-primary">{meeting.roleToApply}</p>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant={status.variant}>
              {status.label}
            </Badge>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {meeting.requirements}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Created {formatDate(meeting.createdAt)}</span>
              </div>
              {meeting.startedAt && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>Started {formatTime(meeting.startedAt)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            {status.description}
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex space-x-2 w-full">
          {renderActionButton()}
        </div>
      </CardFooter>
    </Card>
  );
}
