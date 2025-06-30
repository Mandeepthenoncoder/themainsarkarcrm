// import { useState } from 'react'; // Temporarily remove for server component conversion
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Temporarily remove/re-evaluate for server component
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList, Filter, AlertTriangle, CheckCircle, ExternalLink, Eye } from 'lucide-react'; // Loader2 might not be needed if not updating status client-side
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Re-using interfaces from dashboard or define locally if not shared
// Ensure these match the expected structure from your Supabase queries
interface CustomerForFollowUp {
  id: string;
  full_name: string | null;
  follow_up_date: string | null;
}

interface TaskFromDB {
  id: string;
  title: string;
  description?: string | null;
  due_date: string; // Assuming DB uses due_date
  priority?: string | null;
  status: string;
  // relatedCustomer?: string | null; // Original structure
  // relatedCustomerId?: string | null; // Original structure
  customers: { id: string; full_name: string | null; } | null; // For tasks linked to customers in DB
}

interface DisplayTask extends TaskFromDB { // This will be our combined type
  type: 'Task' | 'FollowUp';
  // specific fields for follow-up if needed for display, e.g. customer name if not via 'customers' relation
}

const taskStatuses = ["To Do", "Pending", "In Progress", "Completed", "Cancelled", "Overdue"];
const taskPriorities = ["High", "Medium", "Low"];

// Helper functions (can be moved to utils if not already there)
const formatDate = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString([], { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) {
    return dateString; // fallback
  }
};

const getStatusBadgeVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
  switch (status) {
    case 'Pending':
    case 'Overdue': return 'destructive'; 
    case 'To Do':
    case 'In Progress': return 'default';
    case 'Completed': return 'secondary';
    case 'Cancelled': return 'outline';
    default: return 'outline';
  }
};

const getPriorityIcon = (priority: string | null | undefined, status?: string) => {
  const color = status === 'Completed' ? 'text-green-500' : 
                priority === 'High' ? 'text-red-500' : 
                priority === 'Medium' ? 'text-yellow-500' : 'text-gray-400';
  if (status === 'Completed') return <CheckCircle className={`h-4 w-4 ${color} mr-1`} />;
  return <AlertTriangle className={`h-4 w-4 ${color} mr-1`} />;
};

export default async function SalespersonTasksPage() {
  const supabase = createServerComponentClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <p>Please log in to view tasks.</p>;
  }

  const now = new Date();
  const todayDateString = now.toISOString().split('T')[0];

  // 1. Fetch actual tasks
  const { data: actualTasksData, error: tasksFetchError } = await supabase
    .from('tasks')
    .select('id, title, description, due_date, priority, status, customers (id, full_name)')
    .eq('assigned_to_user_id', user.id)
    .order('due_date', { ascending: true })
    .returns<TaskFromDB[]>(); // Ensure Supabase client can use .returns for typing

  // 2. Fetch customers for follow-up tasks
  const { data: customersForFollowup, error: customersFetchError } = await supabase
    .from('customers')
    .select('id, full_name, follow_up_date')
    .eq('assigned_salesperson_id', user.id)
    .not('follow_up_date', 'is', null) // Only customers with a follow-up date
    .returns<CustomerForFollowUp[]>();

  if (tasksFetchError) console.error("Error fetching tasks:", tasksFetchError.message);
  if (customersFetchError) console.error("Error fetching customers for follow-up:", customersFetchError.message);

  // 3. Transform customer follow-ups into DisplayTask objects
  const followUpDisplayTasks: DisplayTask[] = (customersForFollowup || [])
    .filter(customer => customer.follow_up_date) // Ensure follow_up_date is not null
    .map(customer => {
      const dueDate = new Date(customer.follow_up_date!);
      const status = dueDate < now && dueDate.toISOString().split('T')[0] !== todayDateString ? 'Overdue' : 'Pending';
      return {
        id: `followup-${customer.id}`,
        title: `Follow up with ${customer.full_name || 'N/A'}`,
        description: `Scheduled follow-up for customer: ${customer.full_name || 'N/A'}.`,
        due_date: customer.follow_up_date!,
        priority: status === 'Overdue' ? 'High' : 'Medium', // Example: Overdue follow-ups are high priority
        status: status,
        customers: { id: customer.id, full_name: customer.full_name },
        type: 'FollowUp' as const,
      };
    });

  // 4. Combine and sort all tasks
  const allDisplayTasks: DisplayTask[] = [
    ...(actualTasksData?.map(task => ({ ...task, type: 'Task' as const })) || []),
    ...followUpDisplayTasks
  ].sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  // TODO: Re-implement filtering based on URL query params if needed
  // TODO: Re-implement View/Update modal - likely needs a separate client component & server action for status updates

  return (
    <div className="space-y-6">
      <header className="bg-card shadow-sm rounded-lg p-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Tasks</h1>
            <p className="text-muted-foreground mt-1">Manage your assigned tasks and customer follow-ups.</p>
          </div>
        </div>
      </header>

      {/* Filters Section - Temporarily simplified for server component. Could be a separate client component. */}
      <section className="bg-card shadow-sm rounded-lg p-6">
        <p className="text-muted-foreground">Filtering options will be available soon.</p>
        {/* 
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="statusFilterTasks" className="block text-sm font-medium text-muted-foreground mb-1.5">Status</label>
            <Select defaultValue="all">
              <SelectTrigger id="statusFilterTasks"><SelectValue placeholder="All Statuses" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {taskStatuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
           <div>
            <label htmlFor="priorityFilterTasks" className="block text-sm font-medium text-muted-foreground mb-1.5">Priority</label>
            <Select defaultValue="all">
              <SelectTrigger id="priorityFilterTasks"><SelectValue placeholder="All Priorities" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {taskPriorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" className="w-full sm:w-auto lg:mt-auto">
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </Button>
        </div>
        */}
      </section>

      {/* Tasks Table Section */}
      <section className="bg-card shadow-sm rounded-lg">
        <CardHeader>
            <CardTitle>Task List ({allDisplayTasks.length})</CardTitle>
            <CardDescription>All tasks assigned to you, including scheduled customer follow-ups.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                    <TableHead className="w-[50px]"></TableHead>{/* For Priority Icon */}
                    <TableHead className="min-w-[250px]">Title</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Related To</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allDisplayTasks.length > 0 ? allDisplayTasks.map((task) => (
                  <TableRow key={task.id} className={task.priority === 'High' && task.status !== 'Completed' ? 'bg-red-500/5' : ''}>
                    <TableCell className="pl-4 pr-0">{getPriorityIcon(task.priority, task.status)}</TableCell>
                    <TableCell className="font-medium">
                        <span className={`${task.status === 'Completed' ? 'line-through text-muted-foreground' : ''}`}>
                            {task.title}
                        </span>
                        {task.type === 'FollowUp' && <Badge variant="outline" className="ml-2 bg-purple-100 text-purple-700 border-purple-300 text-xs">Follow-up</Badge>}
                    </TableCell>
                    <TableCell className={task.status === 'Completed' ? 'text-muted-foreground line-through' : 'text-muted-foreground'}>{formatDate(task.due_date)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(task.status)}>
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell className={task.status === 'Completed' ? 'text-muted-foreground line-through' : 'text-muted-foreground'}>
                      {task.customers?.id ? (
                        <Link href={`/salesperson/customers/${task.customers.id}`} className="hover:underline">
                          {task.customers.full_name || 'N/A'}
                        </Link>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      {/* View/Update button - will need to link to a detail page or a server-action driven modal component */}
                      <Button variant="outline" size="sm" asChild>
                        {/* For now, link to customer if it's a follow up, or a placeholder for task detail page */}
                        <Link href={task.type === 'FollowUp' && task.customers?.id ? `/salesperson/customers/${task.customers.id}` : `/salesperson/tasks/${task.id}`}>
                           <Eye className="h-4 w-4 mr-1.5" /> View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No tasks found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </section>

      {/* Modal for Task Details & Update Status would be a separate client component or page */}
    </div>
  );
} 