'use client'; // This page will eventually have client-side filters

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import {
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow
} from "@/components/ui/table";
import { getManagedTeamTasksAction, ManagedDisplayTask } from './actions';
import { ListChecks, Eye, User, Users2, AlertTriangle, CheckCircle, ClipboardList, Filter, Loader2, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, isValid } from 'date-fns';

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const parsedDate = parseISO(dateString);
    if (!isValid(parsedDate)) return dateString;
    return format(parsedDate, 'MMM dd, yyyy');
  } catch (e) {
    return dateString;
  }
};

const getStatusBadgeVariant = (status: string): "default" | "destructive" | "outline" | "secondary" => {
  status = status.toLowerCase();
  if (status === 'pending' || status === 'to do') return 'default';
  if (status === 'overdue') return 'destructive';
  if (status === 'in progress') return 'default';
  if (status === 'completed') return 'secondary';
  if (status === 'cancelled') return 'outline';
  return 'outline';
};

const getPriorityBadgeClass = (priority?: string | null): string => {
  if (!priority) return 'border-gray-300 bg-gray-50 text-gray-500';
  priority = priority.toLowerCase();
  if (priority === 'high') return 'border-red-500 bg-red-100 text-red-700';
  if (priority === 'medium') return 'border-yellow-500 bg-yellow-100 text-yellow-700';
  if (priority === 'low') return 'border-blue-500 bg-blue-100 text-blue-700';
  return 'border-gray-300 bg-gray-50 text-gray-500';
};

function TeamTasksContent() {
  const [tasks, setTasks] = useState<ManagedDisplayTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      const result = await getManagedTeamTasksAction();
      if (result.success && result.tasks) {
        setTasks(result.tasks);
      } else {
        setError(result.error || 'Failed to load team tasks.');
        setTasks([]);
      }
      setIsLoading(false);
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
        <div className="p-10 text-center text-muted-foreground flex items-center justify-center">
            <Loader2 className="h-8 w-8 mr-3 animate-spin" /> Loading team tasks...
        </div>
    );
  }

  if (error) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle className="text-destructive">Error Loading Tasks</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error}</p>
                {/* <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button> */}
            </CardContent>
        </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Task List ({tasks.length})</CardTitle>
        <CardDescription>
          All tasks assigned to your team members, including scheduled customer follow-ups.
          {/* Placeholder for filter button/summary */}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {tasks.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            <ListChecks className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold">No Tasks Found</h3>
            <p className="mt-1 text-sm">
              There are currently no tasks assigned to your team members or no pending follow-ups.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Type</TableHead>
                  <TableHead className="min-w-[250px]">Title</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Related Customer</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} className={task.priority === 'High' && task.status !== 'Completed' ? 'bg-red-500/5' : ''}>
                    <TableCell>
                        <Badge variant={task.type === 'FollowUp' ? 'secondary' : 'outline'}
                               className={task.type === 'FollowUp' ? 'bg-purple-100 text-purple-700' : ''}
                        >{task.type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      <span className={`${task.status === 'Completed' ? 'line-through text-muted-foreground' : ''}`}>
                        {task.title}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {task.salesperson_name_for_display || 'N/A'}
                    </TableCell>
                     <TableCell className="text-xs">
                      {task.customer_name_for_display ? (
                        <Link href={`/salesperson/customers/${task.customers?.id}`} className="hover:underline text-primary">
                          {task.customer_name_for_display}
                        </Link>
                      ) : 'N/A'}
                    </TableCell>
                    <TableCell className={`text-xs ${task.status === 'Completed' ? 'text-muted-foreground line-through' : 'text-muted-foreground'} ${task.status === 'Overdue' ? 'font-semibold text-destructive' : ''}`}>
                        {formatDate(task.due_date)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(task.status)} className="text-xs">
                        {task.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                        <Badge variant="outline" className={`text-xs ${getPriorityBadgeClass(task.priority)}`}>
                            {task.priority || 'Normal'}
                        </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" asChild>
                        {/* Updated links for manager context */}
                        <Link href={task.type === 'FollowUp' && task.customers?.id 
                                      ? `/manager/customers/${task.customers.id}` 
                                      : `/manager/tasks/${task.id}`
                                  }>
                          <Eye className="mr-1.5 h-4 w-4" /> View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ManagerTeamTasksPage() {
    return (
        <div className="space-y-6">
            <header className="bg-card shadow-sm rounded-lg p-6">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center">
                        <ListChecks className="w-8 h-8 mr-3 text-primary"/> Team Tasks
                        </h1>
                        <p className="text-muted-foreground mt-1">
                        View and manage tasks assigned to your team, including customer follow-ups.
                        </p>
                    </div>
                    <div>
                        <Button asChild>
                            <Link href="/manager/tasks/new">
                                <PlusCircle className="mr-2 h-4 w-4" /> Assign New Task
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>
            <Suspense fallback={<div className="p-10 text-center text-muted-foreground flex items-center justify-center"><Loader2 className="h-8 w-8 mr-3 animate-spin" /> Loading tasks...</div>}>
                <TeamTasksContent />
            </Suspense>
        </div>
    );
} 