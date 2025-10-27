'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Monitor, Wrench } from 'lucide-react';
import { Button } from '@repo/ui';

const settingsTabs = [
  { name: 'Profile', href: '/settings/profile', icon: User },
  { name: 'Account', href: '/settings/account', icon: Wrench },
  { name: 'Appearance', href: '/settings/appearance', icon: Monitor },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-screen px-52 py-24">
      <div className="px-8 py-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground mt-1">
            Manage your account settings.
          </p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Settings Navigation */}
        <aside className="w-64 p-6">
          <nav className="flex flex-col space-y-1">
            {settingsTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = pathname === tab.href;

              return (
                <Link key={tab.href} href={tab.href}>
                  <Button
                    variant={isActive ? 'secondary' : 'link'}
                    className="w-full justify-start cursor-pointer"
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {tab.name}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Settings Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
