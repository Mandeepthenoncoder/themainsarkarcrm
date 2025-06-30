'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';

export interface TeamGoal {
  id: string;
  title: string;
  metric: string;
  targetValue: string | number;
  currentValue: string | number;
  progress: number; // Percentage 0-100
  period: string;
  status: string; // e.g., 'In Progress', 'On Track', 'Exceeded', 'Behind'
  assigneeType: 'Team' | 'Individual';
  assigneeName: string; // Team name or Salesperson name
  // We might add fields like created_at, updated_at, description, etc. later
}

interface SuccessResult {
  success: true;
  goals: TeamGoal[];
}

interface ErrorResult {
  success: false;
  error: string;
}

export type GetManagerTeamGoalsResult = SuccessResult | ErrorResult;

// TODO: Replace placeholder data with actual data fetching from a 'goals' table
export async function getManagerTeamGoalsAction(): Promise<GetManagerTeamGoalsResult> {
  const supabase = createServerActionClient<Database>({ cookies });
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: 'User not authenticated.' };
  }

  // Placeholder data - in a real app, this would come from a 'team_goals' or 'user_goals' table.
  const placeholderGoals: TeamGoal[] = [
    {
      id: 'goal1',
      title: 'Q4 Showroom Revenue Target',
      metric: 'Total Sales Value',
      targetValue: "₹30,00,000",
      currentValue: "₹12,50,000",
      progress: (1250000 / 3000000) * 100,
      period: 'Q4 2024',
      status: 'In Progress',
      assigneeType: 'Team',
      assigneeName: 'Entire Showroom Team'
    },
    {
      id: 'goal2',
      title: 'October New Customer Acquisition',
      metric: 'New Customers Signed',
      targetValue: 60,
      currentValue: 25,
      progress: (25 / 60) * 100,
      period: 'October 2024',
      status: 'Behind',
      assigneeType: 'Team',
      assigneeName: 'Entire Showroom Team'
    },
    {
      id: 'goal3',
      title: 'Vikram Singh - Monthly Sales Target',
      metric: 'Individual Sales Value',
      targetValue: "₹4,00,000",
      currentValue: "₹3,10,000",
      progress: (310000 / 400000) * 100,
      period: 'October 2024',
      status: 'On Track',
      assigneeType: 'Individual',
      assigneeName: 'Vikram Singh' // This would ideally be linked to a salesperson's profile
    },
  ];
  
  // await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay

  return { success: true, goals: placeholderGoals };
}

// Future actions might include:
// - createTeamGoalAction(goalData: Omit<TeamGoal, 'id' | 'progress' | 'currentValue'>)
// - updateGoalProgressAction(goalId: string, currentValue: number)
// - assignGoalToSalespersonAction(goalId: string, salespersonId: string) 