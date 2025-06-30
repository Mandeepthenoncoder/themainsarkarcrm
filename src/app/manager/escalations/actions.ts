'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export interface EscalationManagerNote {
  id: string;
  escalation_id: string;
  created_at: string;
  note: string;
  manager_id: string;
  manager_name: string; // Or fetched via join
}

export interface EscalationItem {
  id: string;
  customer_id?: string | null;
  customer_name?: string | null;
  salesperson_id?: string | null;
  salesperson_name?: string | null;
  reported_at: string; // Date issue was reported/escalated
  subject: string; // A concise summary or title of the issue
  description: string; // Detailed description of the issue
  status: 'New' | 'Under Review' | 'Action Pending' | 'Resolved' | 'Closed' | 'Feedback Logged';
  priority: 'High' | 'Medium' | 'Low';
  last_updated_at: string;
  // manager_notes?: EscalationManagerNote[]; // For simplicity, notes can be a separate fetch if needed
  // assigned_manager_id?: string | null; // If escalations can be assigned to specific managers
}

interface GetEscalationsSuccessResult {
  success: true;
  escalations: EscalationItem[];
}

interface GetEscalationsErrorResult {
  success: false;
  error: string;
}

export type GetManagerEscalatedItemsResult = GetEscalationsSuccessResult | GetEscalationsErrorResult;

const placeholderEscalations: EscalationItem[] = [
  {
    id: 'esc1',
    customer_id: 'cust101',
    customer_name: 'Aarav Patel',
    salesperson_id: 'sp1',
    salesperson_name: 'Aisha Sharma',
    reported_at: '2024-07-20T10:00:00Z',
    subject: 'Watch Repair Delay - Unhappy Customer',
    description: 'Customer Aarav Patel is very unhappy with the extended delay for watch repair (Order #ORD123). Original promise date was 2 weeks ago. Demands immediate resolution or full refund.',
    status: 'New',
    priority: 'High',
    last_updated_at: '2024-07-20T10:00:00Z',
  },
  {
    id: 'esc2',
    customer_id: 'cust102',
    customer_name: 'Priya Sharma',
    salesperson_id: 'sp2',
    salesperson_name: 'Rohan Verma',
    reported_at: '2024-07-18T14:30:00Z',
    subject: 'Discount Misunderstanding on Custom Necklace',
    description: 'Misunderstanding regarding discount applied on custom necklace. Customer seeking clarification or price adjustment. Original quote needs to be reviewed.',
    status: 'Under Review',
    priority: 'Medium',
    last_updated_at: '2024-07-19T11:00:00Z',
  },
  {
    id: 'esc3',
    customer_id: 'cust105',
    customer_name: 'Vikram Singh',
    salesperson_id: 'sp1',
    salesperson_name: 'Aisha Sharma',
    reported_at: '2024-07-15T16:00:00Z',
    subject: 'Feedback: Showroom Crowding',
    description: 'Feedback from Vikram Singh: Showroom was too crowded during last visit (Saturday). Suggests exploring appointment-only slots on weekends to improve experience.',
    status: 'Feedback Logged',
    priority: 'Low',
    last_updated_at: '2024-07-16T09:00:00Z',
  },
  {
    id: 'esc4',
    customer_name: 'Internal Query',
    salesperson_name: 'Admin',
    reported_at: '2024-07-10T11:00:00Z',
    subject: 'Review Supplier Contract for Gold Chains',
    description: 'Current supplier contract for 22k gold chains is up for renewal. Need to review terms and explore alternative suppliers before end of month.',
    status: 'Action Pending',
    priority: 'Medium',
    last_updated_at: '2024-07-12T17:00:00Z',
  },
];

const statusOrder: Record<EscalationItem['status'], number> = {
    'New': 1,
    'Action Pending': 2,
    'Under Review': 3,
    'Feedback Logged': 4,
    'Resolved': 5,
    'Closed': 6,
};

const priorityOrder: Record<EscalationItem['priority'], number> = {
    'High': 1,
    'Medium': 2,
    'Low': 3,
};

export async function getManagerEscalatedItemsAction(): Promise<GetManagerEscalatedItemsResult> {
  const supabase = createServerActionClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'User not authenticated.' };

  // TODO: Implement actual database query from an 'escalations' table
  // This would involve fetching escalations relevant to the manager (e.g., for their showroom or team)
  // SELECT * FROM escalations 
  // WHERE showroom_id = (SELECT assigned_showroom_id FROM profiles WHERE id = user.id) 
  // ORDER BY status (custom order), priority (custom order), last_updated_at DESC;

  // Returning sorted placeholder data
  const sortedEscalations = [...placeholderEscalations].sort((a, b) => {
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(b.last_updated_at).getTime() - new Date(a.last_updated_at).getTime();
  });

  return { success: true, escalations: sortedEscalations };
}

// Future actions might include:
// - createEscalationAction(data: Omit<EscalationItem, 'id' | 'last_updated_at'>)
// - updateEscalationStatusAction(id: string, status: EscalationItem['status'], note?: string)
// - addManagerNoteToEscalationAction(escalationId: string, note: string) 