"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    Store, 
    Users, 
    UserCog,
    UsersRound,
    CalendarClock,
    BarChart3,
    Send,
    Settings2,
    Building
} from 'lucide-react';
import { cn } from "@/lib/utils";
import AuthButton from "@/components/AuthButton";

export default function AdminNavigation() {
  const pathname = usePathname();
  const basePath = "/admin";

  const navLinks = [
    { href: `${basePath}/dashboard`, label: "Dashboard", icon: LayoutDashboard },
    { href: `${basePath}/showrooms`, label: "Showrooms", icon: Store },
    { href: `${basePath}/managers`, label: "Managers", icon: Users },
    { href: `${basePath}/salespeople`, label: "Salespeople", icon: UserCog },
    { href: `${basePath}/customers`, label: "Customers", icon: UsersRound },
    { href: `${basePath}/appointments`, label: "Appointments", icon: CalendarClock },
    { href: `${basePath}/reports`, label: "Analytics", icon: BarChart3 },
    { href: `${basePath}/communication`, label: "Communication", icon: Send },
    { href: `${basePath}/settings`, label: "Settings", icon: Settings2 },
  ];

  // For mobile bottom bar, usually 4-5 main items. Let's pick the most frequent ones.
  const mobileNavLinks = [
    { href: `${basePath}/dashboard`, label: "Dashboard", icon: LayoutDashboard },
    { href: `${basePath}/customers`, label: "Customers", icon: UsersRound },
    { href: `${basePath}/appointments`, label: "Appointments", icon: CalendarClock },
    { href: `${basePath}/reports`, label: "Analytics", icon: BarChart3 },
    { href: `${basePath}/showrooms`, label: "Showrooms", icon: Store },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-72 bg-foreground text-background p-6 space-y-4 border-r border-border/20 shrink-0 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <Link href={`${basePath}/dashboard`} className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold text-primary-foreground">Admin</h2>
          </Link>
        </div>
        <div className="mb-4">
           <AuthButton />
        </div>
        <nav className="flex flex-col h-[calc(100%-120px)]"> {/* Adjusted height to accommodate AuthButton and footer */}
          <ul className="space-y-1.5 flex-grow overflow-y-auto pr-2  scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent">
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
          <div className="mt-auto pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-500 text-center">&copy; Jewelry CRM - Admin</p>
          </div>
        </nav>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden flex justify-between items-center mb-4 p-2 bg-card shadow-md rounded-md sticky top-0 z-40">
          <Link href={`${basePath}/dashboard`} className="flex items-center space-x-2">
              <Building className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-bold text-foreground">Admin</h1>
          </Link>
          <AuthButton /> {/* AuthButton for mobile top bar*/}
      </div>

      {/* Mobile Bottom Tab Bar */}
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
    </>
  );
} 