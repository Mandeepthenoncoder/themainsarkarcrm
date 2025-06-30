"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldAlert, Eye, Edit3, Filter, MessageSquare, UserCircle, CalendarIcon, AlertOctagon, CheckCircle, Loader2, AlertTriangle, Info } from 'lucide-react';
import Link from "next/link";
import { useState } from 'react';
import { getManagerEscalatedItemsAction, EscalationItem } from './actions';
import { format, parseISO } from 'date-fns';

const formatDate = (dateString: string | null | undefined, includeTime: boolean = false): string => {
  if (!dateString) return 'N/A';
  try {
    const date = parseISO(dateString);
    return format(date, includeTime ? 'MMM dd, yyyy, HH:mm' : 'MMM dd, yyyy');
  } catch (e) {
    return dateString; // Fallback
  }
};

const getStatusBadgeVariant = (status: EscalationItem['status']): "default" | "destructive" | "outline" | "secondary" => {
  switch (status) {
    case 'New': return 'destructive';
    case 'Under Review':
    case 'Action Pending': return 'default';
    case 'Resolved':
    case 'Feedback Logged': return 'secondary';
    case 'Closed': return 'outline';
    default: return 'outline';
  }
};

const PriorityDisplay = ({ priority }: { priority: EscalationItem['priority'] }) => {
  let icon = <AlertOctagon className="h-4 w-4 text-gray-500" />;
  let colorClass = 'text-gray-700';
  if (priority === 'High') {
    icon = <AlertOctagon className="h-4 w-4 text-red-500" />;
    colorClass = 'text-red-700 font-semibold';
  } else if (priority === 'Medium') {
    icon = <AlertOctagon className="h-4 w-4 text-yellow-500" />;
    colorClass = 'text-yellow-700 font-medium';
  } else if (priority === 'Low') {
    icon = <AlertOctagon className="h-4 w-4 text-green-500" />;
    colorClass = 'text-green-700';
  }
  return (
    <div className="flex items-center">
      {icon}
      <span className={`ml-1.5 text-xs ${colorClass}`}>{priority}</span>
    </div>
  );
};

export default async function ManagerEscalationsPage() {
  const result = await getManagerEscalatedItemsAction();
  let escalations: EscalationItem[] = [];
  let errorMessage: string | null = null;

  if (result.success) {
    escalations = result.escalations;
  } else {
    errorMessage = result.error;
  }

  return (
    <div className="space-y-6">
      <header className="bg-card shadow-sm rounded-lg p-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-7 w-7 text-primary" />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Customer & Team Escalations</h1>
              <p className="text-muted-foreground mt-1">Review and manage issues escalated for your attention.</p>
            </div>
          </div>
          {/* <Button disabled> <PlusCircle className="mr-2 h-4 w-4" /> Log New Escalation </Button> */}
        </div>
      </header>

      {errorMessage && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-destructive">Could not load escalations</CardTitle>
          </CardHeader>
          <CardContent><p>{errorMessage}</p></CardContent>
        </Card>
      )}

      {!errorMessage && escalations.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <ShieldAlert className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Active Escalations</h3>
            <p className="text-muted-foreground">
              There are currently no escalations requiring your attention.
            </p>
          </CardContent>
        </Card>
      )}

      {!errorMessage && escalations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Escalation List ({escalations.length})</CardTitle>
            <CardDescription>Sorted by urgency and then by last update time.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead className="w-[100px]">Priority</TableHead>
                    <TableHead className="min-w-[250px]">Subject</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Salesperson</TableHead>
                    <TableHead>Reported On</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {escalations.map((item) => (
                    <TableRow key={item.id} className={item.priority === 'High' && item.status === 'New' ? 'bg-red-500/5' : ''}>
                        <TableCell><PriorityDisplay priority={item.priority} /></TableCell>
                        <TableCell className="font-medium">
                            {item.subject}
                            {/* <p className="text-xs text-muted-foreground truncate max-w-xs mt-0.5">{item.description}</p> */}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                            {item.customer_name || 'N/A'}
                            {item.customer_id && <Link href={`/manager/customers/${item.customer_id}`} className="ml-1 text-primary hover:underline"> <Eye className="inline h-3 w-3"/> </Link>}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{item.salesperson_name || 'N/A'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDate(item.reported_at)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{formatDate(item.last_updated_at, true)}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusBadgeVariant(item.status)} className="text-xs">
                                {item.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild disabled>
                            <Link href={`#`}> {/* Would link to /manager/escalations/${item.id} */}
                                <Eye className="mr-1.5 h-4 w-4" /> View Details
                            </Link>
                        </Button>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="mt-8">
        <CardHeader className="flex flex-row items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            <CardTitle>Backend & Feature Note</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
                This page displays escalated items based on placeholder data. For full functionality:
            </p>
            <ol className="list-decimal list-inside pl-4 space-y-1">
                <li>
                    <strong>Database Table:</strong> A table (e.g., <code>manager_escalations</code> or <code>escalated_issues</code>) is needed with columns like:
                    <ul className="list-disc list-inside pl-6 text-xs">
                        <li><code>id UUID PRIMARY KEY</code>, <code>subject TEXT</code>, <code>description TEXT</code>, <code>status TEXT</code>, <code>priority TEXT</code>,</li>
                        <li><code>reported_at TIMESTAMPTZ</code>, <code>last_updated_at TIMESTAMPTZ</code>,</li>
                        <li><code>customer_id UUID NULLABLE REFERENCES customers(id)</code>, <code>salesperson_id UUID NULLABLE REFERENCES profiles(id)</code>,</li>
                        <li><code>reporting_user_id UUID REFERENCES profiles(id)</code> (who reported/escalated it),</li>
                        <li><code>assigned_manager_id UUID NULLABLE REFERENCES profiles(id)</code> (if assignable).</li>
                    </ul>
                </li>
                <li>
                    <strong>Server Actions:</strong> <code>getManagerEscalatedItemsAction</code> needs to query this table. Future actions would handle creating, updating status, and adding notes to escalations.
                </li>
                <li>
                    <strong>RLS Policies:</strong> Ensure managers can view escalations relevant to them (e.g., from their showroom or team) and perform actions based on their role.
                </li>
                <li><strong>Detailed View & Management:</strong> A dedicated page or modal for each escalation (<code>/manager/escalations/[escalationId]</code>) would be needed to view full details, add notes, and change status.</li>
            </ol>
            <p>Currently, this page uses placeholder data. Logging new escalations and detailed management are not yet implemented.</p>
        </CardContent>
      </Card>

    </div>
  );
} 