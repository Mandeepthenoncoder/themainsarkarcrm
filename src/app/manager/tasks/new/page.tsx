"use client";

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, UserPlus, Users } from 'lucide-react';
import { getTeamMembersAction, SalespersonProfile } from '../../salespeople/actions'; // Action to fetch salespeople
import { managerCreateTaskAction, ManagerCreateTaskData } from '../actions'; // Action to create task
import { useForm, Controller, SubmitHandler, ControllerRenderProps, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

const taskPriorityEnum = z.enum(['Low', 'Medium', 'High']);
const taskStatusEnum = z.enum(['To Do', 'In Progress', 'Completed', 'Blocked', 'Pending']);

const taskFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().optional(),
  due_date: z.string().refine((val: string) => !!val && !isNaN(new Date(val).valueOf()), { message: "Valid due date is required." }),
  priority: taskPriorityEnum,
  status: taskStatusEnum,
  assigned_to_user_id: z.string().uuid({ message: "Please select a salesperson." }),
  customer_id: z.string().uuid({message: "Invalid Customer ID format"}).optional().nullable().or(z.literal('')),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export default function AssignNewTaskPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [salespeople, setSalespeople] = useState<SalespersonProfile[]>([]);
  const [isLoadingSalespeople, setIsLoadingSalespeople] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      due_date: '',
      priority: 'Medium',
      status: 'To Do',
      assigned_to_user_id: '',
      customer_id: null,
    },
  });

  useEffect(() => {
    async function fetchSalespeople() {
      setIsLoadingSalespeople(true);
      const result = await getTeamMembersAction();
      if (result.success && result.teamMembers) {
        setSalespeople(result.teamMembers);
      } else {
        toast.error(result.error || "Failed to load salespeople for assignment.");
      }
      setIsLoadingSalespeople(false);
    }
    fetchSalespeople();
  }, []);

  const onSubmit: SubmitHandler<TaskFormValues> = async (data: TaskFormValues) => {
    // Ensure customer_id is null if it's an empty string from the form
    const payload: ManagerCreateTaskData = {
        ...data,
        customer_id: data.customer_id === '' ? null : data.customer_id,
        priority: data.priority as 'Low' | 'Medium' | 'High', // Cast because Zod enum is wider than DB enum type directly
        status: data.status as 'To Do' | 'In Progress' | 'Completed' | 'Blocked' | 'Pending' // Cast as well
    };

    startTransition(async () => {
      const result = await managerCreateTaskAction(payload);
      if (result.success) {
        toast.success(`Task "${data.title}" assigned successfully!`);
        reset();
        router.push('/manager/tasks');
      } else {
        toast.error(result.error || "Failed to assign task.");
      }
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/manager/tasks">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Tasks</span>
          </Link>
        </Button>
        <h1 className="text-2xl lg:text-3xl font-bold">Assign New Task</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Task Details</CardTitle>
          <CardDescription>
            Fill in the details below to assign a new task to a member of your team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
              <Controller
                name="title"
                control={control}
                render={({ field }: { field: ControllerRenderProps<TaskFormValues, 'title'> }) => <Input {...field} id="title" placeholder="e.g., Follow up with Customer X" />}
              />
              {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">Description (Optional)</label>
              <Controller
                name="description"
                control={control}
                render={({ field }: { field: ControllerRenderProps<TaskFormValues, 'description'> }) => <Textarea {...field} id="description" placeholder="Add more details about the task" />}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="assigned_to_user_id" className="block text-sm font-medium mb-1">Assign To</label>
                    <Controller
                        name="assigned_to_user_id"
                        control={control}
                        render={({ field }: { field: ControllerRenderProps<TaskFormValues, 'assigned_to_user_id'> }) => (
                        <Select onValueChange={field.onChange} value={field.value} disabled={isLoadingSalespeople}>
                            <SelectTrigger id="assigned_to_user_id">
                            <SelectValue placeholder={isLoadingSalespeople ? "Loading salespeople..." : "Select salesperson"} />
                            </SelectTrigger>
                            <SelectContent>
                            {salespeople.map(sp => (
                                <SelectItem key={sp.id} value={sp.id}>
                                <Users className="h-4 w-4 inline-block mr-2 opacity-70" /> {sp.full_name}
                                </SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                        )}
                    />
                    {errors.assigned_to_user_id && <p className="text-sm text-destructive mt-1">{errors.assigned_to_user_id.message}</p>}
                </div>
                <div>
                    <label htmlFor="due_date" className="block text-sm font-medium mb-1">Due Date</label>
                    <Controller
                        name="due_date"
                        control={control}
                        render={({ field }: { field: ControllerRenderProps<TaskFormValues, 'due_date'> }) => <Input type="date" {...field} id="due_date" />}
                    />
                    {errors.due_date && <p className="text-sm text-destructive mt-1">{errors.due_date.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="priority" className="block text-sm font-medium mb-1">Priority</label>
                    <Controller
                        name="priority"
                        control={control}
                        render={({ field }: { field: ControllerRenderProps<TaskFormValues, 'priority'> }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger id="priority"><SelectValue placeholder="Select priority" /></SelectTrigger>
                            <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            </SelectContent>
                        </Select>
                        )}
                    />
                </div>
                 <div>
                    <label htmlFor="status" className="block text-sm font-medium mb-1">Initial Status</label>
                    <Controller
                        name="status"
                        control={control}
                        render={({ field }: { field: ControllerRenderProps<TaskFormValues, 'status'> }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger id="status"><SelectValue placeholder="Set initial status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="To Do">To Do</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="In Progress">In Progress</SelectItem>
                                <SelectItem value="Blocked">Blocked</SelectItem> 
                            </SelectContent>
                        </Select>
                        )}
                    />
                </div>
            </div>

            <div>
                <label htmlFor="customer_id" className="block text-sm font-medium mb-1">Related Customer ID (Optional)</label>
                <Controller
                    name="customer_id"
                    control={control}
                    render={({ field }: { field: ControllerRenderProps<TaskFormValues, 'customer_id'> }) => <Input {...field} value={field.value || ''} id="customer_id" placeholder="Enter Customer ID if applicable" />}
                />
                 {errors.customer_id && <p className="text-sm text-destructive mt-1">{errors.customer_id.message}</p>}
            </div>

            <div className="flex justify-end items-center gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push('/manager/tasks')} disabled={isPending || isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || isSubmitting || isLoadingSalespeople}>
                {(isPending || isSubmitting) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign Task
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 