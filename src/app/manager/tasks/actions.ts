'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';

// Based on salesperson/tasks/page.tsx and salesperson/dashboard/page.tsx
export interface ManagedTaskFromDB {
  id: string;
  title: string;
  description?: string | null;
  due_date: string;
  priority?: string | null;
  status: string;
  assigned_to_user_id?: string | null; // The salesperson it is assigned to
  customers: { // For tasks linked to customers in DB
    id: string;
    full_name: string | null;
  } | null;
  // We also need to fetch the salesperson's name for display
  profiles?: { // Salesperson who is assigned the task
    full_name: string | null;
  } | null;
}

export interface ManagedDisplayTask extends ManagedTaskFromDB { 
  type: 'Task' | 'FollowUp';
  salesperson_name_for_display?: string | null; // To directly hold the assigned salesperson's name
  customer_name_for_display?: string | null; // To directly hold the customer's name
}

interface GetManagedTeamTasksResult {
  success: boolean;
  tasks?: ManagedDisplayTask[];
  error?: string;
}

export async function getManagedTeamTasksAction(): Promise<GetManagedTeamTasksResult> {
  const supabase = createServerActionClient<Database>({ cookies });
  const { data: { user: managerUser }, error: managerUserError } = await supabase.auth.getUser();

  if (managerUserError || !managerUser) {
    return { success: false, error: 'Manager not authenticated.' };
  }

  // 1. Get IDs and names of salespeople managed by this manager
  const { data: managedSalespeople, error: salespeopleError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('supervising_manager_id', managerUser.id)
    .eq('role', 'salesperson');

  if (salespeopleError) {
    return { success: false, error: 'Failed to fetch team members for task query.' };
  }

  if (!managedSalespeople || managedSalespeople.length === 0) {
    return { success: true, tasks: [] }; // No salespeople, so no tasks
  }
  const salespersonIds = managedSalespeople.map(sp => sp.id);
  const salespersonIdToNameMap = new Map(managedSalespeople.map(sp => [sp.id, sp.full_name]));

  const allDisplayTasks: ManagedDisplayTask[] = [];
  const now = new Date();
  const todayDateString = now.toISOString().split('T')[0];

  // 2. Fetch actual tasks assigned to these salespeople
  const { data: actualTasksData, error: tasksFetchError } = await supabase
    .from('tasks')
    .select(`
      *,
      customers (id, full_name),
      profiles!assigned_to_user_id (full_name)
    `)
    .in('assigned_to_user_id', salespersonIds);
    // Not ordering yet, will sort combined list

  if (tasksFetchError) {
    // Continue to fetch follow-ups, but report this error if no tasks found overall
  }

  if (actualTasksData) {
    actualTasksData.forEach((task: any) => { // Use 'any' temporarily, will cast to ManagedTaskFromDB
        const assignedSalespersonName = task.profiles?.full_name || salespersonIdToNameMap.get(task.assigned_to_user_id) || 'N/A';
        allDisplayTasks.push({
            ...(task as ManagedTaskFromDB),
            type: 'Task',
            salesperson_name_for_display: assignedSalespersonName,
            customer_name_for_display: task.customers?.full_name,
        });
    });
  }

  // 3. Fetch customers assigned to these salespeople for follow-up tasks
  const { data: customersForFollowup, error: customersFetchError } = await supabase
    .from('customers')
    .select('id, full_name, follow_up_date, assigned_salesperson_id')
    .in('assigned_salesperson_id', salespersonIds)
    .not('follow_up_date', 'is', null);

  if (customersFetchError) {
    // Continue to fetch follow-ups, but report this error if no tasks found overall
  }

  if (customersForFollowup) {
    customersForFollowup.forEach(customer => {
      if (customer.follow_up_date && customer.assigned_salesperson_id) {
        const dueDate = new Date(customer.follow_up_date);
        // Ensure status reflects overdue correctly even if due date is today but time has passed (simplification: just by date for now)
        const status = dueDate < now && customer.follow_up_date.split('T')[0] !== todayDateString ? 'Overdue' : 'Pending';
        const assignedSalespersonName = salespersonIdToNameMap.get(customer.assigned_salesperson_id) || 'N/A';
        
        allDisplayTasks.push({
          id: `followup-${customer.id}`,
          title: `Follow up with ${customer.full_name || 'N/A'}`,
          description: `Scheduled follow-up for customer: ${customer.full_name || 'N/A'}.`,
          due_date: customer.follow_up_date,
          priority: status === 'Overdue' ? 'High' : 'Medium', 
          status: status,
          customers: { id: customer.id, full_name: customer.full_name },
          assigned_to_user_id: customer.assigned_salesperson_id,
          profiles: { full_name: assignedSalespersonName }, // For consistency, though might be redundant
          type: 'FollowUp',
          salesperson_name_for_display: assignedSalespersonName,
          customer_name_for_display: customer.full_name,
        });
      }
    });
  }

  // 4. Sort all tasks by due date
  allDisplayTasks.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  
  if (allDisplayTasks.length === 0 && (tasksFetchError || customersFetchError)){
      return { success: false, error: 'Failed to fetch any task data for the team.' };
  }

  return { success: true, tasks: allDisplayTasks };
}

// --- Manager Create Task Action ---

export interface ManagerCreateTaskData {
  title: string;
  description?: string | null;
  due_date: string; // Expected in YYYY-MM-DD format or ISO string
  priority: Database['public']['Enums']['task_priority_enum'];
  status: Database['public']['Enums']['task_status_enum']; // Initial status, e.g., 'To Do'
  assigned_to_user_id: string; // This will be the salesperson's profile ID
  customer_id?: string | null; // Optional related customer ID
}

export interface ManagerCreateTaskResult {
  success: boolean;
  taskId?: string;
  error?: string;
}

export async function managerCreateTaskAction(
  taskData: ManagerCreateTaskData
): Promise<ManagerCreateTaskResult> {
  const supabase = createServerActionClient<Database>({ cookies });
  const { data: { user: managerUser }, error: authError } = await supabase.auth.getUser();

  if (authError || !managerUser) {
    return { success: false, error: "Manager not authenticated." };
  }

  // Verify that assigned_to_user_id is a salesperson supervised by this manager
  const { data: salespersonProfile, error: salespersonProfileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', taskData.assigned_to_user_id)
    .eq('supervising_manager_id', managerUser.id)
    .eq('role', 'salesperson')
    .single();

  if (salespersonProfileError || !salespersonProfile) {
    return { success: false, error: "Invalid assignee. Salesperson not found or not managed by you." };
  }

  const { data: newTask, error: insertError } = await supabase
    .from('tasks')
    .insert({
      title: taskData.title,
      description: taskData.description,
      due_date: taskData.due_date,
      priority: taskData.priority,
      status: taskData.status,
      assigned_to_user_id: taskData.assigned_to_user_id,
      assigned_by_user_id: managerUser.id, // Manager assigning the task
      customer_id: taskData.customer_id,
      // created_at and updated_at will be set by default by Postgres
    })
    .select('id')
    .single();

  if (insertError) {
    return { success: false, error: `Failed to create task: ${insertError.message}` };
  }

  if (!newTask || !newTask.id) {
    return { success: false, error: "Task created but failed to retrieve ID." };
  }

  // Revalidate paths to ensure the new task appears in lists
  revalidatePath('/manager/tasks');
  revalidatePath('/salesperson/tasks'); // If salespeople view their own tasks
  revalidatePath('/salesperson/dashboard'); // If tasks appear on salesperson dashboard
  revalidatePath('/manager/dashboard'); // If tasks appear on manager dashboard

  return { success: true, taskId: newTask.id };
} 