'use client';

import { useState } from 'react';
import { Button, AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@repo/ui";
import { ArrowLeft, ClipboardCheck, FileSearch, Loader2, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { AnalysisCard } from "./AnalysisCard";
import { AnalysisResult, runInterviewAnalysis, runResumeAnalysis } from "@/actions/runAnalysis";
import { MeetingDetailsData } from "@/actions/getMeetingDetails";
import { toast } from "sonner";

interface AnalysisClientProps {
  meeting: MeetingDetailsData;
  initialAnalyses: AnalysisResult[];
}

export function AnalysisClient({ meeting, initialAnalyses }: AnalysisClientProps) {
  const router = useRouter();
  
  const [interviewStatus, setInterviewStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>(
    (initialAnalyses.find(a => a.type === 'INTERVIEW_ANALYSIS')?.status.toLowerCase() as 'idle' | 'processing' | 'completed' | 'failed') || 'idle'
  );
  const [interviewResult, setInterviewResult] = useState<AnalysisResult | undefined>(
    initialAnalyses.find(a => a.type === 'INTERVIEW_ANALYSIS')
  );

  const [resumeStatus, setResumeStatus] = useState<'idle' | 'processing' | 'completed' | 'failed'>(
    (initialAnalyses.find(a => a.type === 'RESUME_ANALYSIS')?.status.toLowerCase() as 'idle' | 'processing' | 'completed' | 'failed') || 'idle'
  );
  const [resumeResult, setResumeResult] = useState<AnalysisResult | undefined>(
    initialAnalyses.find(a => a.type === 'RESUME_ANALYSIS')
  );

  const [isRunningAll, setIsRunningAll] = useState(false);

  const handleRunInterview = async () => {
    setInterviewStatus('processing');
    const res = await runInterviewAnalysis(meeting.id);
    if (res.success && res.data) {
      setInterviewResult(res.data);
      setInterviewStatus('completed');
      toast.success("Interview analysis completed");
    } else {
      setInterviewResult({ id: '', type: 'INTERVIEW_ANALYSIS', status: 'FAILED', score: 0, feedback: null });
      setInterviewStatus('failed');
      toast.error(res.error || "Failed to run interview analysis");
    }
  };

  const handleRunResume = async () => {
    setResumeStatus('processing');
    const res = await runResumeAnalysis(meeting.id);
    if (res.success && res.data) {
      setResumeResult(res.data);
      setResumeStatus('completed');
      toast.success("Resume analysis completed");
    } else {
      setResumeResult({ id: '', type: 'RESUME_ANALYSIS', status: 'FAILED', score: 0, feedback: null });
      setResumeStatus('failed');
      toast.error(res.error || "Failed to run resume analysis");
    }
  };

  const handleRunAll = async () => {
    setIsRunningAll(true);

    if (interviewStatus !== 'completed') {
      await handleRunInterview();
    }

    if (resumeStatus !== 'completed') {
      await handleRunResume();
    }

    setIsRunningAll(false);
  };

  const isAnyRunning = interviewStatus === 'processing' || resumeStatus === 'processing' || isRunningAll;
  const allCompleted = interviewStatus === 'completed' && resumeStatus === 'completed';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center gap-4 border-b pb-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/meetings')} className="group">
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Meetings
        </Button>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{meeting.roleToApply}</h1>
          <p className="text-muted-foreground">
            {meeting.companyName} • Completed on {new Date(meeting.createdAt).toLocaleDateString()}
          </p>
        </div>

        {!allCompleted && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                disabled={isAnyRunning} 
                size="lg" 
                className="shadow-sm active:scale-95 transition-all cursor-pointer"
              >
                {isAnyRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4 fill-current" />}
                {isAnyRunning ? "Processing..." : "Run All Analyses"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-accent">
              <AlertDialogHeader>
                <AlertDialogTitle>Run All Analyses</AlertDialogTitle>
                <AlertDialogDescription>
                  This will run both Interview Analysis and Resume Analysis. This uses 2 analysis credits and each analysis can only be run once per meeting. Continue?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRunAll}>Run All</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <AnalysisCard
          type="INTERVIEW_ANALYSIS"
          title="Interview Analysis"
          description="Comprehensive evaluation of your interview performance, communication style, and answer quality"
          icon={ClipboardCheck}
          accentColor="text-violet-500"
          status={interviewStatus}
          result={interviewResult}
          onRun={handleRunInterview}
          isRunning={interviewStatus === 'processing'}
        />

        <AnalysisCard
          type="RESUME_ANALYSIS"
          title="Resume Analysis"
          description="How well your resume matches the target role, with specific improvement suggestions"
          icon={FileSearch}
          accentColor="text-amber-500"
          status={resumeStatus}
          result={resumeResult}
          onRun={handleRunResume}
          isRunning={resumeStatus === 'processing'}
        />
      </div>
    </div>
  );
}
