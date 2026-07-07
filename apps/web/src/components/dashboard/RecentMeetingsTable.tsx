'use client';

import { Card, CardHeader, CardContent, Badge } from '@repo/ui';
import { useRouter } from 'next/navigation';
import { statusConfig, type MeetingStatus } from '@/components/app-layout/MeetingCard';

interface Meeting {
  id: string;
  companyName: string;
  roleToApply: string;
  status: MeetingStatus;
  createdAt: string;
  score?: number;
}

interface RecentMeetingsTableProps {
  meetings: Meeting[];
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function RecentMeetingsTable({ meetings }: RecentMeetingsTableProps) {
  const router = useRouter();

  return (
    <Card className='border-accent'>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <h3 className="text-lg font-semibold">Recent Meetings</h3>
        <button 
          onClick={() => router.push('/meetings')}
          className="text-sm text-primary hover:underline"
        >
          View All →
        </button>
      </CardHeader>
      <CardContent>
        {meetings.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No meetings yet. Create your first session!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 px-4 font-medium">Company</th>
                  <th className="pb-3 px-4 font-medium">Status</th>
                  <th className="pb-3 px-4 font-medium">Score</th>
                  <th className="pb-3 px-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((meeting) => {
                  const status = statusConfig[meeting.status];
                  return (
                    <tr
                      title='View meeting details'
                      key={meeting.id} 
                      className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors cursor-pointer even:bg-muted/20"
                      onClick={() => router.push(`/meetings/${meeting.id}`)}
                    >
                      <td className="py-3 px-4">
                        <p className="line-clamp-1 font-medium">{meeting.companyName}</p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">{meeting.roleToApply}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={status.variant} className="whitespace-nowrap text-[10px] px-1.5 py-0">
                          {status.label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {meeting.score !== undefined ? `${meeting.score}/100` : '—'}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                        {timeAgo(meeting.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
