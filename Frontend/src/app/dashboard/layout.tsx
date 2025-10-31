'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/context/app-context';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  CalendarCheck,
  MessageSquare,
  Calendar,
  LogOut,
  Sparkles,
  Moon,
  Sun,
  Menu,
} from 'lucide-react';
import { AppLogo } from '@/components/icons';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, setUser, isAuthenticated, toggleTheme, data } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    setUser(null);
    router.push('/');
  };

  if (!isAuthenticated || !user) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
         <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
       </div>
    );
  }
  
  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, role: ['teacher', 'student'] },
    { href: '/dashboard/attendance', label: 'Attendance', icon: CalendarCheck, role: ['teacher'] },
    { href: '/dashboard/messages', label: 'Messages', icon: MessageSquare, role: ['teacher', 'student'] },
    { href: '/dashboard/events', label: 'Events', icon: Calendar, role: ['teacher', 'student'] },
    { href: '/dashboard/suggestions', label: 'Suggestions', icon: Sparkles, role: ['student'] },
  ].filter(item => item.role.includes(user.type));

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('');
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-3">
              <AppLogo className="h-8 w-8 text-primary" />
              <span className="text-xl font-semibold">Easy4U</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    onClick={() => router.push(item.href)}
                    isActive={pathname === item.href}
                    tooltip={item.label}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
             <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2 overflow-hidden">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id || user.username}`} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col truncate">
                        <span className="text-sm font-semibold truncate">{user.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">{user.type}</span>
                    </div>
                </div>
                <SidebarMenuButton 
                  onClick={handleLogout} 
                  className="!w-auto !h-auto"
                  tooltip="Logout">
                  <LogOut />
                </SidebarMenuButton>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:pt-4">
                 <SidebarMenuButton className="md:hidden !w-10 !h-10 p-0" variant="ghost">
                    <Menu/>
                 </SidebarMenuButton>
                <h1 className="text-xl font-semibold md:hidden">
                  {navItems.find(item => item.href === pathname)?.label}
                </h1>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={toggleTheme}>
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-4 md:p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
