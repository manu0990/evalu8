'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@repo/ui";
import { Home, Calendar, BarChart3, Settings, HelpCircle, User, ChevronDown, Monitor, Sparkles, LogOut, FileText } from "lucide-react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect, useRef } from 'react';

interface AppSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const generalNav = [
  { name: 'Dashboard', key: 'dashboard' as const, icon: Home, href: '/dashboard' },
  { name: 'Meetings', key: 'meetings' as const, icon: Calendar, href: '/meetings' },
  { name: 'Analytics', key: 'analytics' as const, icon: BarChart3, href: '/analytics' },
];

const settingsSubNav = [
  { name: 'Profile', key: 'profile' as const, icon: User, href: '/settings/profile' },
  { name: 'Account', key: 'account' as const, icon: Settings, href: '/settings/account' },
  { name: 'Appearance', key: 'appearance' as const, icon: Monitor, href: '/settings/appearance' },
];

export function AppSidebar({ user }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <Sidebar className="border-r border-sidebar-border">
      {/* Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground">
              <div className="grid flex-1 text-center text-3xl leading-tight">
                <span className="truncate font-semibold ">Evalu8</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        {/* General Section */}
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {generalNav.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <SidebarMenuItem key={item.key}>
                    <SidebarMenuButton
                      className="cursor-pointer"
                      isActive={isActive}
                      onClick={() => router.push(item.href)}
                    >
                      <Icon />
                      <span>{item.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Other Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Other</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setSettingsExpanded(!settingsExpanded)}
                  className="group/menu-button cursor-pointer"
                >
                  <Settings />
                  <span>Settings</span>
                  <ChevronDown className={`ml-auto transition-transform ${!settingsExpanded && '-rotate-90'}`} />
                </SidebarMenuButton>
                {settingsExpanded && (
                  <SidebarMenuSub>
                    {settingsSubNav.map((item) => {
                      const Icon = item.icon;

                      return (
                        <SidebarMenuSubItem key={item.key}>
                          <SidebarMenuSubButton
                            className="cursor-pointer"
                            onClick={() => router.push(item.href)}
                          >
                            <Icon />
                            <span>{item.name}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <HelpCircle />
                  <span>Help Center</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - User Profile */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "User"}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name || "User"}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg">
                {/* User Info Header */}
                <div className="flex items-center gap-3 p-3 border-b">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "User"}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-medium truncate">{user?.name || "User"}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <DropdownMenuItem>
                  <Sparkles className="h-4 w-4 mr-2" /> Upgrade to Pro
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" /> Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" /> Privacy Policy
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogOut className="h-4 w-4 mr-2" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
