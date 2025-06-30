"use client";

import Link from 'next/link';
import { Button } from "@/components/ui/button";
import {
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSalespersonDetailsAction, SalespersonProfile } from '../actions'; // Assuming actions.ts is in the parent directory
import { ArrowLeft, UserCircle, Mail, Phone, Briefcase as EmployeeIdIcon, Building, Tag, Edit, BarChart3, ShieldCheck, ShieldX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const getInitials = (name: string | null) => {
  if (!name) return 'N/A';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

interface SalespersonDetailPageProps {
  params: { salespersonId: string };
}

export default async function SalespersonDetailPage({ params }: SalespersonDetailPageProps) {
  const { salespersonId } = params;
  const { success, salesperson, error } = await getSalespersonDetailsAction(salespersonId);

  if (!success || !salesperson) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <header className="flex items-center gap-4 py-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="/manager/salespeople">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Team List</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-destructive">Error</h1>
        </header>
        <Card>
          <CardHeader>
            <CardTitle>Salesperson Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              {error || "Could not load salesperson details. They may not exist or you may not have permission to view them."}
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild>
                 <Link href="/manager/salespeople">Return to Team List</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="flex flex-wrap justify-between items-center gap-4 py-4 border-b mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/manager/salespeople">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to Team List</span>
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <Avatar className="h-16 w-16 border-2 border-primary">
              <AvatarImage src={salesperson.avatar_url || undefined} alt={salesperson.full_name || 'Salesperson'} />
              <AvatarFallback className="text-2xl">{getInitials(salesperson.full_name)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                {salesperson.full_name || 'N/A'}
              </h1>
              <p className="text-muted-foreground flex items-center">
                <Tag className="h-4 w-4 mr-1.5" /> Salesperson Profile
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
            {/* Future actions - Edit, View Performance etc. */}
            {/* <Button variant="outline" disabled><Edit className="mr-2 h-4 w-4" /> Edit Profile</Button> */}
            {/* <Button variant="outline" disabled><BarChart3 className="mr-2 h-4 w-4" /> View Performance</Button> */}
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Contact & Employment Information</CardTitle>
          <CardDescription>Key details for {salesperson.full_name}.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
          <div className="flex items-start">
            <Mail className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>
              <span className="font-medium text-foreground">Email Address</span>
              <p className="text-muted-foreground">{salesperson.email || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Phone className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>
              <span className="font-medium text-foreground">Phone Number</span>
              <p className="text-muted-foreground">{salesperson.phone_number || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start">
            <EmployeeIdIcon className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>
              <span className="font-medium text-foreground">Employee ID</span>
              <p className="text-muted-foreground">{salesperson.employee_id || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-start">
            <Building className="h-5 w-5 mr-3 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div>
              <span className="font-medium text-foreground">Assigned Showroom</span>
              <p className="text-muted-foreground">
                {salesperson.showrooms?.name ? (
                  <Badge variant="secondary" className="text-base">{salesperson.showrooms.name}</Badge>
                ) : (
                  'Not Assigned'
                )}
              </p>
            </div>
          </div>
          <div className="flex items-start md:col-span-2">
            {salesperson.status === 'pending_approval' ? (
                <ShieldX className="h-5 w-5 mr-3 mt-0.5 text-destructive flex-shrink-0" />
            ) : (
                <ShieldCheck className="h-5 w-5 mr-3 mt-0.5 text-green-600 flex-shrink-0" />
            )}
            <div>
              <span className="font-medium text-foreground">Account Status</span>
              <p className="text-muted-foreground">
                 <Badge 
                    variant={salesperson.status === 'active' ? 'default' : salesperson.status === 'pending_approval' ? 'destructive' : 'outline'}
                    className={salesperson.status === 'active' ? 'bg-green-100 text-green-700' : salesperson.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-700' : ''}
                >
                    {salesperson.status ? salesperson.status.replace('_', ' ').toUpperCase() : 'N/A'}
                </Badge>
              </p>
                {salesperson.status === 'pending_approval' && (
                    <p className="text-xs text-muted-foreground mt-1">This salesperson profile is pending activation/approval.</p>
                )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for future sections like Performance, Assigned Customers, Tasks, etc. */}
      {/* <Card>
        <CardHeader><CardTitle>Performance Overview</CardTitle></CardHeader>
        <CardContent><p className="text-muted-foreground">Performance metrics will be displayed here.</p></CardContent>
      </Card> */}
    </div>
  );
} 