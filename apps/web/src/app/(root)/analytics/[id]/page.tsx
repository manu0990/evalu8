import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { getMeetingDetails } from '@/actions/getMeetingDetails';
import { getAnalyses } from '@/actions/getAnalyses';
import { AnalysisClient } from '@/components/analysis/AnalysisClient';
import { redirect } from 'next/navigation';

export default async function AnalysisPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/signin');

  const [meetingResult, analysesResult] = await Promise.all([
    getMeetingDetails(resolvedParams.id),
    getAnalyses(resolvedParams.id),
  ]);

  if (!meetingResult.success || !meetingResult.data) {
    redirect('/meetings');
  }

  // Only allow analysis for COMPLETED meetings
  if (meetingResult.data.status !== 'COMPLETED') {
    redirect(`/meetings/${resolvedParams.id}`);
  }

  return (
    <main className="flex-1 overflow-y-scroll">
      <div className="container mx-auto p-6 max-w-7xl">
        <AnalysisClient
          meeting={meetingResult.data}
          initialAnalyses={analysesResult.success ? (analysesResult.data ?? []) : []}
        />
      </div>
    </main>
  );
}
