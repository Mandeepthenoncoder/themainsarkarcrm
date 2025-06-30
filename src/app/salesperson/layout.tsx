"use client"; // This layout now needs client-side hooks for active path

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Import usePathname
import { Home, Users, CalendarCheck, ClipboardList, Megaphone, PlusCircle, Briefcase } from 'lucide-react'; // Added ClipboardList, Megaphone, Briefcase (for portal icon)
import { cn } from "@/lib/utils";
import ProtectedRoute from "@/components/auth/ProtectedRoute"; // Added
import AuthButton from "@/components/AuthButton"; // Added

export default function SalespersonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname(); // Get current path
  const basePath = "/salesperson";

  const navLinks = [
    { href: `${basePath}/dashboard`, label: "Dashboard", icon: Home },
    { href: `${basePath}/customers`, label: "Customers", icon: Users }, // "Add Customer" will be prominent on dashboard/customer list page
    { href: `${basePath}/appointments`, label: "Appointments", icon: CalendarCheck },
    { href: `${basePath}/tasks`, label: "My Tasks", icon: ClipboardList },
    { href: `${basePath}/announcements`, label: "Announcements", icon: Megaphone },
  ];
  
  const quickActionLinks = [
    { href: `${basePath}/customers/new`, label: "Add New Customer", icon: PlusCircle }
  ];

  return (
    <ProtectedRoute allowedRoles={['salesperson', 'admin']}>
      <div className="flex min-h-screen bg-background">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-72 bg-foreground text-background p-6 space-y-4 border-r border-border/20 shrink-0 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Link href={`${basePath}/dashboard`} className="flex items-center space-x-2">
                <Briefcase className="h-8 w-8 text-primary" />
                <h2 className="text-2xl font-bold text-primary-foreground">Sales</h2>
            </Link>
          </div>
          <div className="mb-4">
            <AuthButton />
          </div>
          <nav className="flex flex-col h-[calc(100%-120px)]"> {/* Adjusted height */}
            <ul className="space-y-1.5 flex-grow overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-transparent">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || 
                                 (link.href !== `${basePath}/dashboard` && pathname.startsWith(link.href)) && 
                                 !(link.href === `${basePath}/customers` && pathname.startsWith(`${basePath}/customers/new`)); // Prevent /customers being active on /customers/new
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
            <div className="mt-auto pt-4 space-y-2 border-t border-gray-700">
              {quickActionLinks.map((link) => (
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
          <div className="md:hidden flex justify-between items-center mb-4 p-2 bg-card shadow-md rounded-md sticky top-0 z-10">
              <Link href={`${basePath}/dashboard`} className="flex items-center space-x-2">
                  <Briefcase className="h-6 w-6 text-primary" />
                  <h1 className="text-lg font-bold text-foreground">Sales</h1>
              </Link>
              <AuthButton /> {/* AuthButton for mobile top bar*/}
          </div>
          {children}
        </main>

        {/* Mobile Bottom Tab Bar - Fixed, 5 items */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-foreground border-t border-border/20 shadow-top-dark p-1 grid grid-cols-5 gap-0.5 z-50">
          {navLinks.map((link) => {
             // Ensure /customers/new doesn't make /customers also active
            const isActive = pathname === link.href || 
                           (link.href !== `${basePath}/dashboard` && pathname.startsWith(link.href) && 
                            !(link.href === `${basePath}/customers` && pathname.startsWith(`${basePath}/customers/new`)) &&
                            !(link.href === `${basePath}/dashboard` && pathname !== `${basePath}/dashboard`)); // dashboard only active if exact match

            return (
              <Link
                key={link.label} // Use label as key if hrefs might not be unique enough before basePath (though they are here)
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