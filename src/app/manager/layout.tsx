"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, // Dashboard
  Users, // Salespeople (Team)
  Contact, // Customers
  CalendarCheck, // Appointments
  ClipboardList, // Tasks
  LineChart, // Analytics
  Target, // Goals
  Megaphone, // Communication (Announcements)
  ShieldAlert, // Escalations
  Home as MobileHome, // For mobile nav
  UserPlus, // Add Salesperson
  Briefcase, // Generic "Manager" icon for mobile group
  ListChecks, // Team Tasks
  UserCheck, // Customer Oversight
  CalendarDays, // Team Appointments
} from 'lucide-react';
import { cn } from "@/lib/utils"; // Assuming you have a cn utility
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AuthButton from "@/components/AuthButton";

interface NavLinkItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const basePath = "/manager";

  const navLinks: NavLinkItem[] = [
    { href: `${basePath}/dashboard`, label: "Dashboard", icon: LayoutDashboard },
    { href: `${basePath}/salespeople`, label: "My Team", icon: Users },
    { href: `${basePath}/customers`, label: "Customer Oversight", icon: UserCheck },
    { href: `${basePath}/appointments`, label: "Team Appointments", icon: CalendarDays },
    { href: `${basePath}/tasks`, label: "Team Tasks", icon: ListChecks },
    { href: `${basePath}/analytics`, label: "Analytics", icon: LineChart },
    { href: `${basePath}/goals`, label: "Goals & Targets", icon: Target },
    { href: `${basePath}/communication`, label: "Announcements", icon: Megaphone },
    { href: `${basePath}/escalations`, label: "Escalations", icon: ShieldAlert },
    // Add more links like Reports, Settings as features are built
  ];

  // Mobile navigation: Grouping for brevity if needed, or list main ones.
  // Let's try with a few key items and a "More" or similar concept if it gets too crowded.
  // For now, focusing on a few core items directly accessible.
  const mobileNavLinks: NavLinkItem[] = [
    { href: `${basePath}/dashboard`, label: "Dashboard", icon: MobileHome },
    { href: `${basePath}/salespeople`, label: "Team", icon: Users },
    { href: `${basePath}/customers`, label: "Customers", icon: Contact },
    { href: `${basePath}/tasks`, label: "Tasks", icon: ClipboardList },
    { href: `${basePath}/appointments`, label: "Calendar", icon: CalendarCheck },
  ];
  
  // Define a type for quick actions to avoid implicit any
  type QuickActionLink = NavLinkItem; // Can reuse NavLinkItem if structure is same

  const quickActions: QuickActionLink[] = [
    // { href: `${basePath}/salespeople/new`, label: "Add Salesperson", icon: UserPlus }
  ];


  return (
    <ProtectedRoute allowedRoles={['manager', 'admin']}>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-72 bg-foreground text-background p-6 space-y-4 border-r border-border/20 shrink-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Link href={`${basePath}/dashboard`} className="flex items-center space-x-2">
                <Briefcase className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-bold text-primary-foreground">Manager</h2>
            </Link>
          </div>
          <div className="mb-4">
            <AuthButton />
          </div>
          <nav className="flex flex-col h-[calc(100%-120px)]">
            <ul className="space-y-1.5 flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        "flex items-center space-x-3 py-2.5 px-4 rounded-md transition-all duration-150 ease-in-out",
                        isActive
                          ? "bg-primary/20 text-primary font-semibold shadow-sm"
                          : "text-gray-300 hover:bg-primary/10 hover:text-primary hover:translate-x-1"
                      )}
                    >
                      <link.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-gray-400 group-hover:text-primary")} />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <div className="mt-auto pt-4 space-y-2 border-t border-gray-600">
              {quickActions.map((link) => (
                  <Link
                      key={link.href}
                      href={link.href}
                      className={cn(
                          "flex items-center space-x-3 py-2 px-4 rounded-md transition-colors duration-150 ease-in-out text-sm",
                          pathname.startsWith(link.href) ? "bg-primary/20 text-primary font-medium" : "text-gray-300 hover:bg-primary/10 hover:text-primary"
                      )}
                  >
                      <link.icon className="h-4 w-4 text-gray-400" />
                      <span>{link.label}</span>
                  </Link>
              ))}
              <p className="text-xs text-gray-500 text-center pt-2">&copy; Jewelry CRM</p>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 bg-muted/40 overflow-y-auto pb-24 md:pb-8">
          {/* Mobile Top Bar Placeholder (Can be enhanced with current page title or actions) */}
          <div className="md:hidden flex justify-between items-center mb-4 p-2 bg-card shadow-md rounded-md sticky top-0 z-10">
              <Link href={`${basePath}/dashboard`} className="flex items-center space-x-2">
                  <Briefcase className="h-6 w-6 text-primary" />
                  <h1 className="text-lg font-bold text-foreground">Manager</h1>
              </Link>
              <AuthButton />
          </div>
          {children}
        </main>

        {/* Mobile Bottom Tab Bar - Fixed */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-foreground border-t border-border/20 shadow-top-dark p-1 grid grid-cols-5 gap-0.5 z-50">
          {mobileNavLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center p-1 rounded-md transition-colors text-center",
                  isActive ? "bg-primary/20 text-primary scale-105" : "text-gray-400 hover:bg-primary/10 hover:text-primary"
                )}
              >
                <link.icon className="h-5 w-5 mb-0.5" />
                <span className="text-[10px] leading-tight tracking-tighter">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </ProtectedRoute>
  );
} 