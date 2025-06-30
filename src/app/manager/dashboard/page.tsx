import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  Contact,
  CalendarCheck,
  ClipboardList,
  UserPlus,
  Briefcase,
  AlertTriangle,
  Building,
  LineChart, // Keep for potential future use
  Megaphone, // For Announcements
  Target,    // For Goals
  ShieldAlert, // For Escalations
  TrendingUp, // For New Customers
  ListChecks // For tasks/follow-ups icon consistency
} from 'lucide-react';
import { redirect } from 'next/navigation';
// import { Database } from '@/lib/database.types'; // No longer needed directly
import { Badge } from '@/components/ui/badge';
import { Progress } from "@/components/ui/progress"; // For goal progress
import { getEnhancedManagerDashboardDataAction, EnhancedManagerDashboardData } from './actions';
import { format } from 'date-fns'; // For announcement dates

const getInitials = (name: string | null | undefined): string => {
  if (!name) return 'N A';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return dateString;
    }
  };

export default async function ManagerDashboardPage() {
  const result = await getEnhancedManagerDashboardDataAction();

  if (!result.success || !result.data) {
    // Handle error state, maybe redirect to login or show an error page
    // For now, showing a simple error message. Can be more sophisticated.
    console.error("Dashboard load error:", result.error);
    if (result.error === 'User not authenticated.' || result.error?.includes('Access Denied')){
        redirect('/login'); // Or a generic error page
    }
    return <div className="p-6"><Card><CardHeader><CardTitle>Error</CardTitle></CardHeader><CardContent><p>{result.error || "Could not load dashboard data."}</p></CardContent></Card></div>;
  }

  const {
    managerProfile,
    teamMembers,
    totalTeamCustomers,
    totalUpcomingTeamAppointments,
    totalPendingTeamFollowUps,
    newCustomersLast30Days,
    recentAnnouncements,
    activeGoals,
    openEscalationsCount
  } = result.data;

  if (!managerProfile) { // Should be caught by action, but good check
    redirect('/login');
  }

  const kpis = [
    { title: 'Team Members', value: teamMembers.length, icon: Users, href: '/manager/salespeople' },
    { title: 'Total Team Customers', value: totalTeamCustomers, icon: Contact, href: '/manager/customers' },
    { title: 'Upcoming Appointments', value: totalUpcomingTeamAppointments, icon: CalendarCheck, href: '/manager/appointments' },
    { title: 'Pending Follow-ups', value: totalPendingTeamFollowUps, icon: ListChecks, href: '/manager/tasks' },
    { title: 'New Customers (30 days)', value: newCustomersLast30Days, icon: TrendingUp, href: '/manager/customers' }, // New KPI
    { title: 'Open Escalations', value: openEscalationsCount, icon: ShieldAlert, href: '/manager/escalations' }, // New KPI
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      <header className="bg-card shadow-sm rounded-lg p-4 sm:p-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center">
              <Briefcase className="w-7 h-7 sm:w-8 sm:h-8 mr-2 text-primary"/> Manager Dashboard
            </h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Welcome, {managerProfile.full_name || managerProfile.email}. Overview of your team's activities.
            </p>
          </div>
           {/* Quick actions can be re-evaluated or expanded based on most common manager tasks */}
          <div className="flex gap-2 flex-wrap">
            {/* Add Salesperson button remains, others might be page-specific */}
            <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
              <Link href="/manager/salespeople/new">
                 <UserPlus className="h-4 w-4 mr-2" /> Add Salesperson
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Key Metrics Section - Expanded */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="hover:shadow-lg transition-shadow duration-200 flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
              <kpi.icon className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-3xl font-bold text-foreground">{kpi.value}</div>
            </CardContent>
            <CardFooter className="pt-1">
                 <Link href={kpi.href || '#'} className="text-xs text-primary hover:underline w-full">
                    View Details &rarr;
                </Link>
            </CardFooter>
          </Card>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Team Members Section (lg:col-span-2) */}
        <section className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 mr-2 text-primary" /> My Team Members ({teamMembers.length})
              </CardTitle>
               <CardDescription>Salespeople you directly supervise.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 flex-grow max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
              {teamMembers.length > 0 ? (
                teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-md hover:bg-muted/60 transition-colors">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={member.avatar_url || undefined} alt={member.full_name || 'User'} />
                        <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm text-foreground">{member.full_name}</p>
                        <p className="text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground">ID: {member.employee_id || 'N/A'}</p>
                        {member.assigned_showroom_id && <Badge variant="outline" className="mt-0.5 text-xs py-0.5 px-1.5">Showroom Linked</Badge>}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No team members found reporting to you.</p>
              )}
            </CardContent>
             {teamMembers.length > 0 && (
                <CardFooter className="border-t pt-3 text-right">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/manager/salespeople">View All Team Members</Link>
                    </Button>
                </CardFooter>
             )}
          </Card>
        </section>

        {/* Recent Announcements Section (lg:col-span-1) */}
        <section>
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Megaphone className="h-6 w-6 mr-2 text-primary" /> Recent Announcements
              </CardTitle>
              <CardDescription>Latest updates for the team.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 flex-grow max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
              {recentAnnouncements.length > 0 ? (
                recentAnnouncements.map(announcement => (
                  <Link key={announcement.id} href="/manager/communication" className="block p-2.5 bg-muted/30 rounded-md hover:bg-muted/60 transition-colors">
                    <h4 className={`font-semibold text-sm ${announcement.is_pinned ? 'text-primary' : 'text-foreground'}`}>{announcement.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{announcement.content}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">By {announcement.author_full_name_display} • {formatDate(announcement.created_at)}</p>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No recent announcements.</p>
              )}
            </CardContent>
            {recentAnnouncements.length > 0 && (
                <CardFooter className="border-t pt-3 text-right">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/manager/communication">View All Announcements</Link>
                    </Button>
                </CardFooter>
            )}
          </Card>
        </section>
      </div>

      {/* Second Row of Summaries: Goals & Escalations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Goals Section */}
        <section>
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center"><Target className="h-6 w-6 mr-2 text-primary" /> Active Goals</CardTitle>
                    <CardDescription>Key objectives for the team.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 flex-grow max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                    {activeGoals.length > 0 ? (
                        activeGoals.map(goal => (
                            <Link key={goal.id} href="/manager/goals" className="block p-2.5 bg-muted/30 rounded-md hover:bg-muted/60 transition-colors">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-semibold text-sm text-foreground truncate pr-2">{goal.title}</h4>
                                    <Badge variant={goal.status === 'On Track' || goal.status === 'Exceeded' ? 'secondary' : goal.status === 'Behind' ? 'destructive' : 'outline'} className="text-xs py-0.5 px-1.5 whitespace-nowrap">{goal.status}</Badge>
                                </div>
                                <Progress value={goal.progress} className="h-1.5 mb-1" />
                                <p className="text-xs text-muted-foreground">
                                    {goal.assigneeName} • Target: {goal.targetValue}
                                </p>
                            </Link>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No active goals set.</p>
                    )}
                </CardContent>
                {activeGoals.length > 0 && (
                    <CardFooter className="border-t pt-3 text-right">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/manager/goals">View All Goals</Link>
                        </Button>
                    </CardFooter>
                )}
            </Card>
        </section>

        {/* Pending Escalations Section - Placeholder for now */}
        <section>
            <Card className="h-full flex flex-col">
                <CardHeader>
                    <CardTitle className="flex items-center"><ShieldAlert className="h-6 w-6 mr-2 text-destructive" /> Pending Escalations</CardTitle>
                    <CardDescription>Urgent issues requiring attention.</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex items-center justify-center">
                    {openEscalationsCount > 0 ? (
                        <div className="text-center">
                            <p className="text-4xl font-bold text-destructive">{openEscalationsCount}</p>
                            <p className="text-muted-foreground">open escalation(s)</p>
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-4">No pending escalations.</p>
                    )}
                </CardContent>
                <CardFooter className="border-t pt-3 text-right">
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/manager/escalations">View Escalations</Link>
                    </Button>
                </CardFooter>
            </Card>
        </section>
      </div>

      {/* Placeholder for future: Revenue Opportunities, Top Performers (once analytics data is live) */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
        <p className="text-sm text-blue-700">
            Future enhancements: Summaries for Revenue Opportunities and Top Performing Salespeople will be added here once sales data is integrated with the Analytics module.
        </p>
      </div>

    </div>
  );
} 