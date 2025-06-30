import Link from 'next/link';
import { getSalespersonTaskDetailsAction, SalespersonTaskDetails } from '../actions'; // Path to your actions file
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowLeft, CalendarDays, Tag, UserCircle, ListChecks, FileText } from 'lucide-react';
import { notFound } from 'next/navigation';

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    // Attempt to parse as ISO string first, then fall back to direct Date constructor
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Invalid date
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) {
    return dateString; // Fallback if parsing fails
  }
};

const getStatusBadgeVariant = (status?: string | null): "default" | "destructive" | "outline" | "secondary" => {
  if (!status) return 'outline';
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === 'pending' || lowerStatus === 'to do' || lowerStatus === 'in progress') return 'default';
  if (lowerStatus === 'overdue') return 'destructive';
  if (lowerStatus === 'completed') return 'secondary';
  if (lowerStatus === 'cancelled') return 'outline';
  return 'outline';
};

interface TaskDetailPageProps {
  params: {
    taskId: string;
  };
}

export default async function SalespersonTaskDetailPage({ params }: TaskDetailPageProps) {
  const { taskId } = params;

  if (!taskId) {
    // This case should ideally be caught by Next.js routing if the path is malformed
    // but good to have a fallback.
    notFound(); 
  }

  const result = await getSalespersonTaskDetailsAction(taskId);

  if (!result.success) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="max-w-2xl mx-auto border-destructive">
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <div >
                <CardTitle className="text-destructive">Error Loading Task</CardTitle>
                <CardDescription className="text-destructive">
                    {result.error}
                </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {result.details && <p className="text-sm text-muted-foreground">Details: {result.details}</p>}
            <Button variant="outline" asChild className="mt-6">
              <Link href="/salesperson/tasks">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to My Tasks
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const task = result.task;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <div>
                <Link href="/salesperson/tasks" className="text-sm text-primary hover:underline flex items-center mb-2">
                    <ArrowLeft className="mr-1.5 h-4 w-4" />
                    Back to My Tasks
                </Link>
                <CardTitle className="text-2xl lg:text-3xl font-bold flex items-center">
                    <ListChecks className="w-7 h-7 mr-3 text-primary" /> Task Details
                </CardTitle>
            </div>
            <Badge variant={getStatusBadgeVariant(task.status)} className="text-sm px-3 py-1">
              {task.status || 'N/A'}
            </Badge>
          </div>
          <CardDescription className="mt-1 text-base">
            {task.title}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                <FileText className="w-4 h-4 mr-2" /> Description
            </h3>
            <p className="text-foreground bg-muted p-3 rounded-md min-h-[60px]">
              {task.description || <span className="italic text-gray-500">No description provided.</span>}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                <CalendarDays className="w-4 h-4 mr-2" /> Due Date
              </h3>
              <p className={`text-foreground ${new Date(task.due_date || '') < new Date() && task.status !== 'Completed' ? 'text-destructive font-semibold' : ''}`}>
                {formatDate(task.due_date)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                <Tag className="w-4 h-4 mr-2" /> Priority
              </h3>
              <Badge variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'default' : 'secondary'} className="capitalize">
                {task.priority || 'Normal'}
              </Badge>
            </div>
            
            {task.customers && (
                <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                        <UserCircle className="w-4 h-4 mr-2" /> Related Customer
                    </h3>
                    <Link href={`/salesperson/customers/${task.customers.id}`} className="text-primary hover:underline flex items-center">
                        {task.customers.full_name || 'Unnamed Customer'}
                        <ArrowLeft className="w-3 h-3 ml-1 transform rotate-[135deg]" />
                    </Link>
                </div>
            )}
          </div>
          
          {/* Placeholder for future actions like 'Mark as Complete', 'Edit Task' etc. */}
          <div className="mt-8 pt-6 border-t border-dashed">
            {/* 
            <Button variant="default" className="mr-2">
                <CheckCircle className="mr-2 h-4 w-4" /> Mark as Complete
            </Button>
            <Button variant="outline">
                <Edit3 className="mr-2 h-4 w-4" /> Edit Task (Not Implemented)
            </Button> 
            */}
            <p className="text-xs text-muted-foreground text-center">Further actions like editing or status updates will be available soon.</p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
} 