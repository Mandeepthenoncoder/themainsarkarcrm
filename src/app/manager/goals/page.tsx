import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Target, AlertTriangle, PlusCircle, Edit3, Users, ListChecks, CalendarDays, CheckCircle, Activity, Zap } from 'lucide-react';
import { getManagerTeamGoalsAction, TeamGoal } from './actions';
import { Badge } from "@/components/ui/badge";

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
  const lowerStatus = status.toLowerCase();
  if (lowerStatus === 'exceeded' || lowerStatus === 'on track') return 'secondary'; // Greenish/positive
  if (lowerStatus === 'in progress') return 'default'; // Bluish/neutral
  if (lowerStatus === 'behind') return 'destructive';
  return 'outline';
};

const GoalCard = ({ goal }: { goal: TeamGoal }) => {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold leading-tight">{goal.title}</CardTitle>
          <Badge variant={getStatusBadgeVariant(goal.status)} className="ml-2 shrink-0">
            {goal.status}
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground flex items-center pt-1">
          {goal.assigneeType === 'Individual' ? <Users className="w-3 h-3 mr-1.5" /> : <Zap className="w-3 h-3 mr-1.5" />}
          {goal.assigneeName} • <CalendarDays className="w-3 h-3 ml-1.5 mr-1" /> {goal.period}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-sm text-muted-foreground mb-1">{goal.metric}</div>
        <Progress value={goal.progress} className="w-full h-3 mb-1" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{typeof goal.currentValue === 'number' ? goal.currentValue.toLocaleString() : goal.currentValue} (Current)</span>
          <span>{typeof goal.targetValue === 'number' ? goal.targetValue.toLocaleString() : goal.targetValue} (Target)</span>
        </div>
      </CardContent>
      <CardFooter className="pt-4">
        <Button variant="outline" size="sm" className="w-full text-xs" asChild>
            {/* This would eventually link to a goal detail page or open an edit modal */}
            <Link href={`#`}> 
                <Edit3 className="w-3 h-3 mr-1.5" /> View/Edit Details (Not Implemented)
            </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default async function ManagerGoalsPage() {
  const result = await getManagerTeamGoalsAction();
  let goals: TeamGoal[] = [];
  let errorMessage: string | null = null;

  if (result.success) {
    goals = result.goals;
  } else {
    errorMessage = result.error;
  }

  return (
    <div className="space-y-6">
      <header className="bg-card shadow-sm rounded-lg p-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <Target className="h-7 w-7 text-primary" />
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Team Goals & Targets</h1>
                    <p className="text-muted-foreground mt-1">Track and manage objectives for your team and individual members.</p>
                </div>
            </div>
            <Button disabled> {/* Kept disabled as functionality is not yet built */}
                <PlusCircle className="mr-2 h-4 w-4" /> Set New Goal
            </Button>
        </div>
      </header>

      {errorMessage && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-destructive">Could not load goals data</CardTitle>
          </CardHeader>
          <CardContent><p>{errorMessage}</p></CardContent>
        </Card>
      )}

      {!errorMessage && goals.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <ListChecks className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Goals Set Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by setting objectives for your team or individual salespeople.
            </p>
            <Button disabled> {/* Kept disabled */}
                <PlusCircle className="mr-2 h-4 w-4" /> Set First Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {!errorMessage && goals.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {goals.map(goal => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      )}

      <Card className="mt-6">
        <CardHeader>
            <CardTitle>Goal Management Notice</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground">
                The goals displayed above are currently based on placeholder data.
                To manage real team and individual goals, the following features are planned:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground mt-3 space-y-1">
                <li>A dedicated database table (e.g., `team_goals`) to store goal definitions, targets, progress, and assignments.</li>
                <li>Forms for creating new goals, assigning them to the team or individuals, and setting target metrics and periods.</li>
                <li>Mechanisms to update the current progress towards goals, potentially linked to sales data or other performance metrics.</li>
                <li>Filtering and sorting options for the goals list.</li>
                <li>Detailed view and editing capabilities for each goal.</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-4">
                Please provide details on the specific goal-setting and tracking functionalities you need.
            </p>
        </CardContent>
      </Card>

    </div>
  );
} 