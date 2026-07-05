'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getMeetingDetails, type MeetingDetailsData } from '@/actions/getMeetingDetails';
import { getMeetingMessages } from '@/actions/getMeetingMessages';
import { 
  Card, CardHeader, CardContent, CardTitle, Badge, Button, Tabs,
  TabsList, TabsTrigger, TabsContent, Skeleton, Avatar
} from '@repo/ui';  
import { 
  ArrowLeft, Building2, Calendar, FileText, ExternalLink,
  Play, MessageSquare, ListTodo, Info, CheckCircle2 
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function MeetingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [meeting, setMeeting] = useState<MeetingDetailsData | null>(null);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMeetingDetails = async () => {
      try {
        const [result, msgResult] = await Promise.all([
          getMeetingDetails(resolvedParams.id),
          getMeetingMessages(resolvedParams.id)
        ]);

        if (!result.success) {
          toast.error(result.error || 'Failed to fetch meeting details');
          router.push('/meetings');
          return;
        }

        if (result.data) setMeeting(result.data);
        if (msgResult.success && msgResult.messages) setMessages(msgResult.messages);
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
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (isLoading) return <LoadingSkeleton />;
  if (!meeting) return null;

  const canStartMeeting = meeting.status === 'QUESTIONNAIRE_READY' || meeting.status === 'IN_PROGRESS';

  return (
    /** 
     * Outer container: 
     * h-screen (take full height), 
     * flex-col (stack top bar and content), 
     * overflow-hidden (prevent window scroll) 
     */
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      
      {/* Pinned Top Navigation Bar */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-20 shrink-0">
        <div className="container mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push('/meetings')} className="group">
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <Badge variant={meeting.status === 'COMPLETED' ? 'secondary' : 'default'} className="capitalize">
                {meeting.status.replace(/_/g, ' ').toLowerCase()}
            </Badge>
          </div>
        </div>
      </header>

      {/* Fixed Layout with Scrollable Tab Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="container mx-auto p-6 max-w-7xl space-y-6 flex flex-col h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
          
          {/* Hero Header Section */}
          <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 shrink-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Building2 className="h-4 w-4" />
                <span className="text-sm font-medium">{meeting.companyName}</span>
                {meeting.companyWebsite && (
                  <Link href={meeting.companyWebsite} target="_blank" className="hover:text-primary transition-colors">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground">{meeting.roleToApply}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Created on {formatDate(meeting.createdAt)}
              </p>
            </div>

            {canStartMeeting && (
              <Button 
                size="lg" 
                onClick={() => router.push(`/interview/${resolvedParams.id}`)}
                className="px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95"
              >
                <Play className="mr-2 h-4 w-4 fill-current" />
                {meeting.status === 'IN_PROGRESS' ? 'Continue Interview' : 'Start Interview Now'}
              </Button>
            )}
          </section>

          <Tabs defaultValue="details" className="w-full flex-1 flex flex-col gap-0.5 min-h-0">
            <TabsList variant='line' className="rounded-full w-full h-16 shrink-0">
              <TabsTrigger value="details" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <Info className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Job Details</span>
              </TabsTrigger>
              <TabsTrigger value="blueprint" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <ListTodo className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Blueprint</span>
              </TabsTrigger>
              <TabsTrigger value="history" className="rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm">
                <MessageSquare className="mr-2 h-4 w-4" /> <span className="hidden sm:inline">Conversation</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto py-4">
              {/* Tab Content: Details */}
              <TabsContent value="details" className="h-full space-y-6 focus-visible:outline-none">
                  <Card className="shadow-sm border-muted">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <FileText className="h-5 w-5 text-primary" />
                      Role Requirements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg p-6">
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {meeting.requirements}
                        </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Tab Content: Blueprint */}
              <TabsContent value="blueprint" className="h-full focus-visible:outline-none">
                {meeting.interviewBlueprint ? (
                <div className="grid gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-primary/70 text-primary-foreground border-none">
                      <CardContent className="pt-6">
                        <p className="text-sm opacity-80 font-medium">Total Questions</p>
                        <p className="text-4xl font-bold">{meeting.interviewBlueprint.totalQuestions}</p>
                      </CardContent>
                    </Card>
                    {meeting.interviewBlueprint.categories.map((category, index) => (
                      <Card key={index} className="shadow-sm border-muted">
                        <CardContent className="pt-6">
                          <p className="text-xs font-bold uppercase text-muted-foreground mb-1 tracking-tighter">
                            {category.type.replace(/_/g, ' ')}
                          </p>
                          <p className="text-3xl font-bold">{category.target}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-sm border-muted">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                           <CheckCircle2 className="h-4 w-4 text-primary" />
                           Rationale
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {meeting.interviewBlueprint.rationale}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="shadow-sm border-muted">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                           <Info className="h-4 w-4 text-primary" />
                           Interviewer Notes
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {meeting.interviewBlueprint.initialNotes}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <EmptyState 
                  icon={<ListTodo className="h-12 w-12" />} 
                  title="No Blueprint Generated" 
                  description="The interview structure will appear here once the system finishes processing."
                />
              )}
              </TabsContent>

              {/* Tab Content: History */}
              <TabsContent value="history" className="mt-0 h-full focus-visible:outline-none">
                <Card className="bg-transparent shadow-sm border-muted min-h-[400px]">
                <div className="p-8">
                  {messages.length === 0 ? (
                    <EmptyState 
                      icon={<MessageSquare className="h-12 w-12" />} 
                      title="No Conversation Yet" 
                      description="Messages from your interview will be archived here."
                    />
                  ) : (
                    <div className="space-y-10 mx-auto">
                      {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'ai' ? '' : 'flex-row-reverse'}`}>
                          <Avatar className={`h-10 w-10 border shadow-sm ${msg.role === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                            <div className="flex items-center justify-center h-full w-full text-[10px] font-black uppercase">
                              {msg.role === 'ai' ? 'AI' : 'You'}
                            </div>
                          </Avatar>
                          <div className={`flex flex-col max-w-[85%] space-y-2 ${msg.role === 'ai' ? 'items-start' : 'items-end'}`}>
                            <div className={`rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm border ${
                              msg.role === 'ai' 
                                ? 'bg-muted/50 text-foreground rounded-tl-none border-muted' 
                                : 'bg-primary/70 text-primary-foreground rounded-tr-none'
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-2xl bg-muted/5 border-muted">
      <div className="text-muted-foreground mb-4 opacity-20">{icon}</div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2 leading-relaxed">{description}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      <div className="h-16 border-b flex items-center px-6">
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="flex-1 overflow-hidden p-6 max-w-5xl mx-auto w-full space-y-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <Skeleton className="h-12 w-full rounded-md" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    </div>
  );
}