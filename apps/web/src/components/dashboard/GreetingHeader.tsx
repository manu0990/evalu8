'use client';

import { Button } from '@repo/ui';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface GreetingHeaderProps {
  userName?: string | null;
}

export function GreetingHeader({ userName }: GreetingHeaderProps) {
  const router = useRouter();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = userName?.split(' ')[0] || 'there';

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 suppressHydrationWarning className="text-2xl md:text-3xl font-bold tracking-tight">
          {greeting}, {firstName}
        </h2>
        <p className="hidden md:flex text-muted-foreground">
          Here&apos;s how your interview prep is going
        </p>
      </div>
      <Button
      title="New Meeting"
        size="icon-sm" 
        onClick={() => router.push('/meetings?new=true')}
        className="cursor-pointer w-auto p-2"
      >
        <Plus className="h-2 w-2" />
        <span className="hidden md:flex">New Meeting</span>
      </Button>
    </div>
  );
}
