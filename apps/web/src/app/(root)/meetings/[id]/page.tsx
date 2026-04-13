'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMeetingDetails, type MeetingDetailsData } from '@/actions/getMeetingDetails';
import { Card, CardHeader, CardContent, CardTitle, Badge, Button } from '@repo/ui';
import { ArrowLeft, Building2, Calendar, Clock, FileText, Briefcase, ExternalLink, Play } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { use } from 'react';

export default function MeetingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [meeting, setMeeting] = useState<MeetingDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // fetch all the meeting details on mount
  useEffect(() => {
    const fetchMeetingDetails = async () => {
      try {
        const result = await getMeetingDetails(resolvedParams.id);

        if (!result.success) {
          toast.error(result.error || 'Failed to fetch meeting details');
          router.push('/meetings');
          return;
        }

        if (result.data) {
          setMeeting(result.data);
        }
      } catch (error) {
        console.error('Error fetching meeting details:', error);
        toast.error('Failed to load meeting details');
        router.push('/meetings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeetingDetails();
  }, [resolvedParams.id, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStartMeeting = () => {
    router.push(`/interview/${resolvedParams.id}`);
  };

  if (isLoading) {
    return (
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 max-w-5xl">
          <div className="flex justify-center items-center py-12">
            <div className="text-muted-foreground">Loading meeting details...</div>
          </div>
        </div>
      </main>
    );
  }

  if (!meeting) {
    return null;
  }

  const canStartMeeting = meeting.status === 'QUESTIONNAIRE_READY' || meeting.status === 'IN_PROGRESS';

  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.push('/meetings')}
              className="cursor-pointer"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Meetings
            </Button>
            <div className="flex items-center space-x-2">
              {canStartMeeting && (
                <Button
                  onClick={handleStartMeeting}
                  className="cursor-pointer"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {meeting.status === 'IN_PROGRESS' ? 'Resume Interview' : 'Start Now'}
                </Button>
              )}
            </div>
          </div>

          {/* Meeting Information */}
          <Card>
            <CardHeader>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-2xl">{meeting.companyName}</CardTitle>
                  {meeting.companyWebsite && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      asChild
                    >
                      <Link
                        href={meeting.companyWebsite}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
                <div className="flex items-center space-x-2 text-lg text-primary">
                  <Briefcase className="h-4 w-4" />
                  <span className="font-medium">{meeting.roleToApply}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Requirements */}
              <div>
                <h3 className="text-sm font-semibold mb-2 flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Requirements
                </h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {meeting.requirements}
                </p>
              </div>

              {/* Resume Information */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Resume</h3>
                <div className="text-sm text-muted-foreground">
                  <p>{meeting.resume.name}</p>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-muted-foreground">{formatDate(meeting.createdAt)}</p>
                  </div>
                </div>
                {meeting.completedAt && (
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Completed</p>
                      <p className="text-muted-foreground">{formatDate(meeting.completedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Interview Blueprint */}
          {meeting.interviewBlueprint && (
            <Card>
              <CardHeader>
                <CardTitle>Interview Blueprint</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Total Questions</h3>
                  <p className="text-2xl font-bold text-primary">
                    {meeting.interviewBlueprint.totalQuestions}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Question Categories</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {meeting.interviewBlueprint.categories.map((category, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <span className="text-sm font-medium capitalize">
                          {category.type.replace(/_/g, ' ')}
                        </span>
                        <Badge variant="secondary">{category.target} questions</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Rationale</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {meeting.interviewBlueprint.rationale}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold mb-2">Initial Notes</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {meeting.interviewBlueprint.initialNotes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
