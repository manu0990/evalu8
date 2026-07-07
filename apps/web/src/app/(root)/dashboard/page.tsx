import { getDashboardStats } from '@/actions/getDashboardStats';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { DashboardClient } from '@/components/dashboard/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [session, result] = await Promise.all([
    getServerSession(authOptions),
    getDashboardStats(),
  ]);

  return (
    <main className="flex-1 overflow-auto">
      <div className="container mx-auto p-6 max-w-7xl">
        {result.success && result.data ? (
          <DashboardClient stats={result.data} user={session?.user} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Failed to load dashboard data. Please try refreshing.
          </div>
        )}
      </div>
    </main>
  );
}
