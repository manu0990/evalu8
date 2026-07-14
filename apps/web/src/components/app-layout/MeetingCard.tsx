'use client';

import { useState } from 'react';
import {
  Card, CardHeader, CardContent, CardFooter, Button, Badge,
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
} from "@repo/ui";
import { Building2, Calendar, Clock, Play, Eye, ExternalLink, X, PieChart, Trash, RefreshCw } from "lucide-react";
import { Meeting } from "./MeetingGrid";
import { useRouter } from "next/navigation";
import { deleteMeeting } from "@/actions/deleteMeeting";
import { retryBlueprintGeneration } from "@/actions/retryBlueprintGeneration";
import { toast } from "sonner";

export type MeetingStatus = 'PENDING' | 'QUESTIONNAIRE_READY' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'FAILED';

interface MeetingCardProps {
  meeting: Meeting;
  onDelete?: (meetingId: string) => void;
  onStatusChange?: (meetingId: string, newStatus: MeetingStatus) => void;
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
  },
  FAILED: {
    label: 'Failed',
    variant: 'destructive' as const,
    description: 'Blueprint generation failed — retry or delete'
  }
};

export function MeetingCard({ meeting, onDelete, onStatusChange }: MeetingCardProps) {
  const router = useRouter();
  const [isRetrying, setIsRetrying] = useState(false);

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

  const handleDelete = async () => {
    try {
      const result = await deleteMeeting(meeting.id);
      if (result.success) {
        toast.success("Meeting deleted");
        onDelete?.(meeting.id);
      } else {
        toast.error(result.error || "Failed to delete meeting");
      }
    } catch {
      toast.error("Failed to delete meeting");
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const result = await retryBlueprintGeneration(meeting.id);
      if (result.success) {
        toast.success("Retrying blueprint generation...");
        onStatusChange?.(meeting.id, 'PENDING');
      } else {
        toast.error(result.error || "Failed to retry");
      }
    } catch {
      toast.error("Failed to retry blueprint generation");
    } finally {
      setIsRetrying(false);
    }
  };

  const renderActionButton = () => {
    switch (meeting.status) {
      case 'COMPLETED':
        return (
          <>
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={() => router.push(`/meetings/${meeting.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View Results
            </Button>
            <Button
              variant="default"
              className="flex-1 cursor-pointer"
              onClick={() => router.push(`/analytics/${meeting.id}`)}
            >
              <PieChart className="mr-2 h-4 w-4" />
              View Analysis
            </Button>
          </>
        );
      case 'QUESTIONNAIRE_READY':
        return (
          <>
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={() => router.push(`/meetings/${meeting.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
            <Button
              className="flex-1 cursor-pointer"
              onClick={() => router.push(`/interview/${meeting.id}`)}
            >
              <Play className="mr-2 h-4 w-4" />
              Start Interview
            </Button>
          </>
        );
      case 'IN_PROGRESS':
        return (
          <>
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={() => router.push(`/meetings/${meeting.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
            <Button
              className="flex-1 cursor-pointer bg-blue-400 hover:bg-blue-500"
              onClick={() => router.push(`/interview/${meeting.id}`)}
            >
              <Play className="mr-2 h-4 w-4" />
              Resume
            </Button>
          </>
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
          <>
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={() => router.push(`/meetings/${meeting.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
            <Button
              variant="destructive"
              className="flex-1 cursor-pointer"
              disabled
            >
              <X className="mr-2 h-4 w-4" />
              Cancelled
            </Button>
          </>
        );
      case 'FAILED':
        return (
          <Button
            variant="default"
            className="flex-1 cursor-pointer"
            onClick={handleRetry}
            disabled={isRetrying}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Retry Generation'}
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="border-primary/25 group hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-lg line-clamp-1">{meeting.companyName}</h3>
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
            <p className="text-sm font-medium text-primary line-clamp-1">{meeting.roleToApply}</p>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant={status.variant}>
              {status.label}
            </Badge>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="cursor-pointer text-muted-foreground hover:text-destructive">
                  <Trash className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className='border-accent'>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Meeting</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the meeting for <strong>{meeting.companyName}</strong> ({meeting.roleToApply}) and all associated data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
