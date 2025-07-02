// import { useState } from 'react'; // Remove if modal is simplified/deferred
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from "@/components/ui/dialog"; // Remove if modal is simplified/deferred
import { AlertTriangle, CheckCircle, ClipboardList, Megaphone, PlusCircle, ExternalLink, Eye, Info, CalendarDays, UserCircle } from 'lucide-react'; // Removed DollarSign from here
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { parsePriceRange } from '@/lib/utils'; // Import the parser
import { Badge } from '@/components/ui/badge'; // For task priority, if needed


// Define interfaces for fetched data
interface Customer {
  id: string;
  full_name: string | null;
  created_at: string;
  interest_categories_json: Array<{
    id: string;
    category_type: string;
    products: Array<{
      product_name: string;
      price_range: string;
      // other product fields if relevant
    }>;
  }> | null;
  follow_up_date?: string | null;
}

interface Appointment {
  id: string;
  appointment_datetime: string;
  status: string; // e.g., 'Scheduled', 'Completed', 'Cancelled'
  // Add other fields if needed for display, e.g., customer name/id if not joining
  customers: { full_name: string | null } | null; // Assuming a join for customer name
  service_type: string | null; // Purpose of appointment
}

interface Task {
  id: string;
  title: string;
  due_date: string; // Supabase typically uses underscore
  status: string;
  priority?: string;
  description?: string;
  // relatedCustomer?: string | null; // We might fetch customer name via relation
  // relatedCustomerId?: string | null;
  customers: { id: string; full_name: string | null; deleted_at?: string | null } | null; // If tasks are linked to customers
}

interface Announcement {
  id: string;
  title: string | null;
  created_at: string; // Or a specific 'date_posted' field
  is_pinned?: boolean;
  content?: string | null; // If announcements have more details
}

// Add a type for the combined tasks (actual tasks + follow-up tasks)
interface DisplayTask extends Task {
  type: 'Task' | 'FollowUp';
  // We can add customer_name directly here for follow-ups if needed for sorting/display
  customer_name_for_follow_up?: string | null; 
}


// Consistent Date Formatting Function (can remain if used)
const formatDateToDDMMYYYY = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    return dateString;
  }
};

const formatCurrency = (value: number) => {
  // Re-added style: 'currency' and currency: 'INR' to display Rupee symbol
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
};

// Task related UI functions (can remain)
const getTaskStatusIcon = (status: string) => {
    if (status === 'Pending' || status.toLowerCase() === 'to do') return <AlertTriangle className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0" />;
    if (status === 'Completed') return <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />;
    return <ClipboardList className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />;
};

const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    let colorClasses = "text-xs font-semibold px-2 py-0.5 rounded-full ";
    switch (priority.toLowerCase()) {
        case 'high': colorClasses += "bg-red-100 text-red-700 border border-red-300"; break;
        case 'medium': colorClasses += "bg-yellow-100 text-yellow-700 border border-yellow-300"; break;
        case 'low': colorClasses += "bg-green-100 text-green-700 border border-green-300"; break;
        default: colorClasses += "bg-gray-100 text-gray-700 border border-gray-300"; break;
    }
    return <Badge variant="outline" className={colorClasses.replace("rounded-full", "")}>{priority}</Badge>;
};


export default async function SalespersonDashboardPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Handle unauthenticated user, maybe redirect or show error
    return <p>Please log in to view the dashboard.</p>;
  }

  // --- Data Fetching ---
  const now = new Date();
  const todayDateString = now.toISOString().split('T')[0]; // YYYY-MM-DD for comparison
  const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

  const { data: customersData, error: customersError } = await supabase
    .from('customers')
    .select('id, full_name, created_at, interest_categories_json, follow_up_date, purchase_amount') // Added purchase_amount
    .eq('assigned_salesperson_id', user.id)
    .is('deleted_at', null) as { data: (Customer & { follow_up_date?: string | null; purchase_amount?: number | null })[] | null; error: any };

  const { data: appointmentsData, error: appointmentsError } = await supabase
    .from('appointments')
    .select('id, appointment_datetime, status, service_type, customers!inner (full_name, deleted_at)')
    .eq('salesperson_id', user.id)
    .is('customers.deleted_at', null)
    .order('appointment_datetime', { ascending: true }) as { data: Appointment[] | null; error: any };

  const { data: rawTasksData, error: tasksError } = await supabase
    .from('tasks')
    .select('id, title, due_date, status, priority, description, customers (id, full_name, deleted_at)')
    .eq('assigned_to_user_id', user.id)
    .order('due_date', { ascending: true }) as { data: Task[] | null; error: any };

  // Filter out tasks related to deleted customers
  const actualTasksData = rawTasksData?.filter(task => 
    !task.customers || !task.customers.deleted_at
  ) || null;
    
  const { data: announcementsData, error: announcementsError } = await supabase
    .from('announcements')
    .select('id, title, created_at, is_pinned, content')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(5);

  // --- Data Processing & Calculations ---
  let totalPipelineValue = 0;
  let totalConvertedRevenue = 0;
  let convertedCustomersCount = 0;

  if (customersData) {
    customersData.forEach((customer) => { // customer is already typed from the cast above
      // Calculate pipeline value from interest categories
      if (customer.interest_categories_json) {
        customer.interest_categories_json.forEach((category: any) => {
          if (category.products && Array.isArray(category.products)) {
            category.products.forEach((product: any) => {
              // Use revenue_opportunity if available, fallback to price_range for old data
              if (product.revenue_opportunity) {
                totalPipelineValue += product.revenue_opportunity;
              } else if (product.price_range) {
                totalPipelineValue += parsePriceRange(product.price_range);
              }
            });
          }
        });
      }
      
      // Calculate converted revenue
      if (customer.purchase_amount && customer.purchase_amount > 0) {
        totalConvertedRevenue += customer.purchase_amount;
        convertedCustomersCount++;
      }
    });
  }

  const conversionRate = customersData?.length 
    ? ((convertedCustomersCount / customersData.length) * 100).toFixed(1) 
    : '0.0';

  const upcomingAppointments = appointmentsData?.filter(
    appt => new Date(appt.appointment_datetime) >= now && (appt.status === 'Scheduled' || appt.status === 'Rescheduled')
  ) || [];

  const newCustomersThisWeek = customersData?.filter(
    customer => new Date(customer.created_at) >= oneWeekAgo
  ).length || 0;

  // Transform customer follow-ups into task-like objects
  const followUpTasks: DisplayTask[] = customersData
    ?.filter(customer => customer.follow_up_date && new Date(customer.follow_up_date) >= new Date(todayDateString)) // Only future or today's follow-ups
    .map(customer => ({
      id: `followup-${customer.id}`, // Create a unique ID
      title: `Follow up with ${customer.full_name || 'N/A'}`,
      due_date: customer.follow_up_date!,
      status: new Date(customer.follow_up_date!) < now ? 'Overdue' : 'Pending', // Mark past due_dates as 'Overdue'
      priority: 'Medium', // Default priority for follow-ups, can be adjusted
      description: `Scheduled follow-up for customer: ${customer.full_name}.`,
      customers: { id: customer.id, full_name: customer.full_name },
      type: 'FollowUp',
      customer_name_for_follow_up: customer.full_name
    })) || [];
    
  // Combine actual tasks with follow-up tasks
  const allDisplayTasks: DisplayTask[] = [
    ...(actualTasksData?.map(task => ({ ...task, type: 'Task' as const })) || []),
    ...followUpTasks
  ];
  
  // Sort all tasks by due date for consistent display if needed, especially for "Urgent Tasks"
  allDisplayTasks.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());


  const pendingTasksCount = allDisplayTasks.filter(
    task => task.status === 'Pending' || task.status === 'To Do' || task.status === 'Overdue'
  ).length || 0;
  
  // Urgent tasks can now include high-priority actual tasks OR overdue follow-ups
  // For simplicity, let's redefine urgentTasks based on the combined list
  // We might want to give preference to 'High' priority actual tasks first, then overdue follow-ups
  const urgentDisplayTasks = allDisplayTasks.filter(task => 
      (task.type === 'Task' && task.priority === 'High' && (task.status === 'Pending' || task.status === 'To Do')) ||
      (task.type === 'FollowUp' && task.status === 'Overdue') || // Consider overdue follow-ups as urgent
      (task.type === 'FollowUp' && task.status === 'Pending' && new Date(task.due_date).toISOString().split('T')[0] === todayDateString ) // Follow-ups for today
    ).slice(0, 3);


  const latestAnnouncements = announcementsData || [];


  // Basic error handling for fetches (can be more sophisticated)
  if (customersError) console.error("Error fetching customers:", customersError.message);
  if (appointmentsError) console.error("Error fetching appointments:", appointmentsError.message);
  if (tasksError) console.error("Error fetching actual tasks:", tasksError.message);
  if (announcementsError) console.error("Error fetching announcements:", announcementsError.message);

  // Modal state and handlers would need to be moved to a client component if complex interaction is needed.
  // For now, removing direct modal logic from this server component.
  // const [showTaskModal, setShowTaskModal] = useState(false);
  // const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  // const handleOpenTaskModal = (task: Task) => { /* ... */ };

  return (
    <>
      <div className="space-y-6 lg:space-y-8">
        <header className="bg-card shadow-sm rounded-lg p-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Salesperson Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {user.email}! Here&apos;s an overview of your activities.</p>
        </header>

        {/* Key Metrics Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 md:gap-6">
          {/* Total Converted Revenue Card - FEATURED */}
          <Card className="lg:col-span-2 xl:col-span-2 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-green-800">💰 Converted Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-700">{formatCurrency(totalConvertedRevenue)}</p>
              <p className="text-sm text-green-600 mt-1">{convertedCustomersCount} customers converted • {conversionRate}% conversion rate</p>
            </CardContent>
          </Card>

          {/* Total Pipeline Value Card - FEATURED */}
          <Card className="lg:col-span-2 xl:col-span-2 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center text-blue-800">📊 Pipeline Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-700">{formatCurrency(totalPipelineValue)}</p>
              <p className="text-sm text-blue-600 mt-1">Total potential revenue from open opportunities</p>
            </CardContent>
          </Card>
        
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{upcomingAppointments.length}</p>
              <Link href="/salesperson/appointments" className="text-sm text-muted-foreground hover:text-primary flex items-center">
                View all <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">New Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{newCustomersThisWeek}</p>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Pending Tasks</CardTitle> 
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{pendingTasksCount}</p>
              <Link href="/salesperson/tasks?filter=pending" className="text-sm text-muted-foreground hover:text-primary flex items-center">
                Manage <ExternalLink className="h-3 w-3 ml-1" />
              </Link>
            </CardContent>
          </Card>
        </section>

        {/* Quick Actions Section - No change needed here unless data drives it */}
        <section className="bg-card shadow-sm rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/salesperson/customers/new">
              <Button className="w-full sm:w-auto">
                <PlusCircle className="h-4 w-4 mr-2" /> Add New Customer
              </Button>
            </Link>
            <Link href="/salesperson/appointments/new">
              <Button variant="outline" className="w-full sm:w-auto">
                Schedule New Appointment
              </Button>
            </Link>
          </div>
        </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* My Tasks Summary Section */}
          <section>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-xl">My Urgent Tasks</CardTitle>
                      <Link href="/salesperson/tasks">
                          <Button variant="ghost" size="sm">View All Tasks <ExternalLink className="h-3 w-3 ml-1.5" /></Button>
                      </Link>
                  </CardHeader>
                  <CardContent className="space-y-3">
                      {urgentDisplayTasks.length > 0 ? urgentDisplayTasks.map(task => (
                          <div key={task.id} className="flex items-start p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors group">
                              {getTaskStatusIcon(task.status)}
                              <div className="flex-grow min-w-0">
                                  <p className="text-sm font-medium text-foreground group-hover:text-primary truncate">{task.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Due: {formatDateToDDMMYYYY(task.due_date)}
                                    {task.type === 'Task' && task.priority && getPriorityBadge(task.priority)}
                                    {task.type === 'FollowUp' && <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-700 border-purple-300">Follow-up</Badge>}
                                  </p>
                                  {task.customers && ( // Display customer if available (for both tasks and follow-ups)
                                    <Link href={`/salesperson/customers/${task.customers.id}`} className="text-xs text-muted-foreground hover:underline">
                                      Related to: {task.customers.full_name}
                                    </Link>
                                  )}
                              </div>
                          </div>
                      )) : (
                          <p className="text-sm text-muted-foreground text-center py-4">No urgent tasks. Well done!</p>
                      )}
                  </CardContent>
              </Card>
          </section>

          {/* Latest Announcements Section */}
          <section>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-xl">Latest Announcements</CardTitle>
                      <Link href="/salesperson/announcements">
                          <Button variant="ghost" size="sm">View All Announcements <ExternalLink className="h-3 w-3 ml-1.5" /></Button>
                      </Link>
                  </CardHeader>
                  <CardContent className="space-y-3">
                      {latestAnnouncements.length > 0 ? latestAnnouncements.map(anno => (
                          <Link key={anno.id} href={`/salesperson/announcements/${anno.id}`} className="block p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors group">
                              <div className="flex items-start">
                                  <Megaphone className={`h-4 w-4 mr-2 mt-0.5 flex-shrink-0 ${anno.is_pinned ? 'text-primary' : 'text-blue-500'}`} />
                                  <div className="flex-grow min-w-0">
                                      <p className="text-sm font-medium text-foreground group-hover:text-primary truncate">{anno.title || 'Untitled Announcement'}</p>
                                      <p className="text-xs text-muted-foreground">Posted: {formatDateToDDMMYYYY(anno.created_at)}</p>
                                  </div>
                              </div>
                          </Link>
                      )) : (
                          <p className="text-sm text-muted-foreground text-center py-4">No new announcements.</p>
                      )}
                  </CardContent>
              </Card>
          </section>
      </div>

        {/* Upcoming Appointments Table */}
        <section className="bg-card shadow-sm rounded-lg p-6 mt-6 lg:mt-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">My Upcoming Appointments</h2>
          {upcomingAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-card">
                  <thead className="bg-secondary/50">
                  <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date & Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Purpose</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                  {upcomingAppointments.map(appt => (
                    <tr key={appt.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-foreground">{appt.customers?.full_name || 'N/A'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{new Date(appt.appointment_datetime).toLocaleString([], {dateStyle: 'medium', timeStyle: 'short'})}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{appt.service_type || 'N/A'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <Badge variant={appt.status === 'Scheduled' || appt.status === 'Rescheduled' ? "default" : "outline"} 
                                 className={appt.status === 'Scheduled' || appt.status === 'Rescheduled' ? "bg-blue-100 text-blue-700" : ""}>
                            {appt.status}
                          </Badge>
                        </td>
                    </tr>
                  ))}
                  </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No upcoming appointments.</p>
          )}
        </section>
      </div>

      {/* Task Details Modal would be a separate client component if needed */}
      {/* 
      {selectedTask && (
        <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedTask.title}</DialogTitle>
              {selectedTask.priority && getPriorityBadge(selectedTask.priority)}
            </DialogHeader>
            <div className="py-4 space-y-2">
              <p className="text-sm"><strong className="text-muted-foreground">Due:</strong> {formatDateToDDMMYYYY(selectedTask.dueDate)}</p>
              <p className="text-sm"><strong className="text-muted-foreground">Status:</strong> {selectedTask.status}</p>
              {selectedTask.relatedCustomer && <p className="text-sm"><strong className="text-muted-foreground">Customer:</strong> {selectedTask.relatedCustomer}</p>}
              <p className="text-sm"><strong className="text-muted-foreground">Description:</strong></p>
              <p className="text-sm whitespace-pre-wrap bg-muted/50 p-2 rounded-md">{selectedTask.description || "No description."}</p>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setShowTaskModal(false)}>Close</Button>
                 {selectedTask.relatedCustomerId && 
                    <Link href={`/salesperson/customers/${selectedTask.relatedCustomerId}`}>
                        <Button><UserCircle className="h-4 w-4 mr-2"/>View Customer</Button>
                    </Link>
                }
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )} 
      */}
    </>
  );
} 