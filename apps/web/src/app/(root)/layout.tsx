import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { SidebarProvider, SidebarInset } from '@repo/ui';
import { AppSidebar } from '@/components/app-layout/AppSidebar';

export const maxDuration = 60;

export default async function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  return (
    <SidebarProvider>
      <AppSidebar user={session?.user} />
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
