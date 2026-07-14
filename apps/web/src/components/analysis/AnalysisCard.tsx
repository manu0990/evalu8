'use client';

import { Card, Button, Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@repo/ui";
import { LucideIcon, Loader2, AlertCircle } from "lucide-react";
import { ScoreDisplay } from "./ScoreDisplay";
import { SubScoreBadge } from "./SubScoreBadge";
import { AnalysisResult, InterviewAnalysisFeedback, ResumeAnalysisFeedback } from "@/actions/runAnalysis";

interface AnalysisCardProps {
  type: 'INTERVIEW_ANALYSIS' | 'RESUME_ANALYSIS';
  title: string;
  description: string;
  icon: LucideIcon;
  accentColor: string;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  result?: AnalysisResult;
  onRun: () => void;
  isRunning: boolean;
}

export function AnalysisCard({
  type,
  title,
  description,
  icon: Icon,
  accentColor,
  status,
  result,
  onRun,
  isRunning
}: AnalysisCardProps) {
  const isInterview = type === 'INTERVIEW_ANALYSIS';

  // Helper to render lists with colored borders
  const renderList = (items: string[], colorClass: string) => (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className={`pl-4 border-l-2 ${colorClass} text-sm leading-relaxed text-muted-foreground`}>
          {item}
        </li>
      ))}
    </ul>
  );

  if (status === 'completed' && result?.feedback) {
    const feedback = result.feedback;
    const score = result.score ?? 0;

    return (
      <Card className="border-accent overflow-hidden shadow-sm transition-all duration-300">
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-foreground font-semibold text-xl">
                <Icon className={`w-6 h-6 ${accentColor}`} />
                {title}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
                {feedback.summary}
              </p>
              
              {isInterview && (feedback as InterviewAnalysisFeedback).sub_scores && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <SubScoreBadge label="Performance" score={(feedback as InterviewAnalysisFeedback).sub_scores.interview_performance} />
                  <SubScoreBadge label="Communication" score={(feedback as InterviewAnalysisFeedback).sub_scores.communication_structure} />
                  <SubScoreBadge label="Answers" score={(feedback as InterviewAnalysisFeedback).sub_scores.answer_quality} />
                </div>
              )}
            </div>
            
            <div className="shrink-0 flex justify-center">
              <ScoreDisplay score={score} size="md" />
            </div>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="strengths" className="border-b border-border last:border-b-0 px-2">
              <AccordionTrigger className="hover:no-underline hover:bg-muted/50 rounded-md px-2 py-3 transition-colors font-medium text-sm">Strengths</AccordionTrigger>
              <AccordionContent className="pb-4 px-2">
                {renderList(feedback.strengths, 'border-green-500')}
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="weaknesses" className="border-b border-border last:border-b-0 px-2">
              <AccordionTrigger className="hover:no-underline hover:bg-muted/50 rounded-md px-2 py-3 transition-colors font-medium text-sm">Areas for Improvement</AccordionTrigger>
              <AccordionContent className="pb-4 px-2">
                {renderList(feedback.weaknesses, 'border-amber-500')}
              </AccordionContent>
            </AccordionItem>

            {!isInterview && (feedback as ResumeAnalysisFeedback).resume_suggestions && (
               <AccordionItem value="resume_suggestions" className="border-b border-border last:border-b-0 px-2">
                 <AccordionTrigger className="hover:no-underline hover:bg-muted/50 rounded-md px-2 py-3 transition-colors font-medium text-sm">Resume Suggestions</AccordionTrigger>
                 <AccordionContent className="pb-4 px-2">
                   {renderList((feedback as ResumeAnalysisFeedback).resume_suggestions, 'border-blue-500')}
                 </AccordionContent>
               </AccordionItem>
            )}
            
            {isInterview && (feedback as InterviewAnalysisFeedback).suggestions && (
              <AccordionItem value="suggestions" className="border-b border-border last:border-b-0 px-2">
                <AccordionTrigger className="hover:no-underline hover:bg-muted/50 rounded-md px-2 py-3 transition-colors font-medium text-sm">Suggestions</AccordionTrigger>
                <AccordionContent className="pb-4 px-2">
                  {renderList((feedback as InterviewAnalysisFeedback).suggestions, 'border-blue-500')}
                </AccordionContent>
              </AccordionItem>
            )}

            <AccordionItem value="detailed" className="border-b border-border last:border-b-0 px-2">
              <AccordionTrigger className="hover:no-underline hover:bg-muted/50 rounded-md px-2 py-3 transition-colors font-medium text-sm">Detailed Feedback</AccordionTrigger>
              <AccordionContent className="pb-4 px-2">
                <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                  {feedback.detailed_feedback}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </Card>
    );
  }

  if (status === 'processing') {
    return (
      <Card className="overflow-hidden shadow-sm transition-all duration-300 relative">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-muted/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center">
            <Icon className={`w-8 h-8 ${accentColor} animate-pulse`} />
          </div>
          <h3 className="font-semibold text-lg">Analyzing...</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            AI is reviewing the data and generating your feedback report. This can take few minutes.
          </p>
          <Button disabled variant="outline" className="mt-4">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing
          </Button>
        </div>
      </Card>
    );
  }

  if (status === 'failed') {
    return (
      <Card className="border-destructive overflow-hidden shadow-sm transition-all duration-300">
        <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="font-semibold text-lg">Analysis Failed</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {typeof result?.feedback === 'string' ? result.feedback : "An error occurred while generating the analysis."}
          </p>
          <Button onClick={onRun} disabled={isRunning} variant="outline" className="mt-4 border-destructive text-destructive hover:bg-destructive/10">
            {isRunning ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Retrying...</> : "Retry"}
          </Button>
        </div>
      </Card>
    );
  }

  // IDLE state
  return (
    <Card className="border-dashed border-muted overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-6 md:p-8 flex flex-col items-center justify-center text-center space-y-4 min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-2">
          <Icon className={`w-8 h-8 ${accentColor}`} />
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
          {description}
        </p>
        <div className="pt-4 flex flex-col items-center space-y-2">
          <Button onClick={onRun} disabled={isRunning} className="min-w-[200px] cursor-pointer">
            Run Analysis
          </Button>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Uses 1 Analysis Credit</span>
        </div>
      </div>
    </Card>
  );
}
