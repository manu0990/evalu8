'use client';

import { EmptyState } from '@/components/app-layout/EmptyState';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto p-6 max-w-7xl">
        <EmptyState
          icon={BarChart3}
          title="Analytics Coming Soon"
          description="We're working on detailed analytics to help you track your interview performance and progress over time."
        />
      </div>
    </main>
  );
}
