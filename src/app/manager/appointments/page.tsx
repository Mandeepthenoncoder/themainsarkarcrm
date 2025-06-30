'use client';

import Link from 'next/link';
import { useState, useEffect, useTransition, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
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
import { Input } from "@/components/ui/input";
import {
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { getManagedTeamAppointmentsAction, ManagedAppointment, AppointmentStatusEnum } from './actions';
import { getTeamMembersAction, SalespersonProfile } from '../salespeople/actions'; // To get salespeople for filter
import { CalendarDays, Eye, Users, Filter, Loader2, AlertTriangle, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, parseISO, isValid } from 'date-fns';
// import { DatePicker } from '@/components/ui/date-picker'; // Removed: DatePicker component does not exist yet

const formatDate = (dateString: string | null | undefined, includeTime = true) => {
  if (!dateString) return 'N/A';
  try {
    const parsedDate = parseISO(dateString);
    if (!isValid(parsedDate)) return dateString; // Return original if not valid date
    return format(parsedDate, includeTime ? 'MMM dd, yyyy HH:mm' : 'MMM dd, yyyy');
  } catch (e) {
    return dateString; 
  }
};

const appointmentStatusColors: Record<AppointmentStatusEnum, string> = {
  Scheduled: 'border-blue-500 bg-blue-50 text-blue-700',
  Confirmed: 'border-green-500 bg-green-50 text-green-700',
  Completed: 'border-purple-500 bg-purple-50 text-purple-700',
  Cancelled: 'border-red-500 bg-red-50 text-red-700',
  Rescheduled: 'border-yellow-500 bg-yellow-50 text-yellow-700',
  'No Show': 'border-gray-500 bg-gray-50 text-gray-700',
};

const statusOptions: AppointmentStatusEnum[] = [
    'Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled', 'No Show'
];

const ALL_STATUSES_OPTION_VALUE = "__ALL_STATUSES__";
const ALL_SALESPEOPLE_OPTION_VALUE = "__ALL_SALESPEOPLE__";

function TeamAppointmentsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(true);

  const [appointments, setAppointments] = useState<ManagedAppointment[]>([]);
  const [salespeople, setSalespeople] = useState<SalespersonProfile[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filter states - using string for dates now
  const [dateFromString, setDateFromString] = useState<string>(searchParams.get('date_from') || '');
  const [dateToString, setDateToString] = useState<string>(searchParams.get('date_to') || '');
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatusEnum | undefined>(searchParams.get('status') as AppointmentStatusEnum || undefined);
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | undefined>(searchParams.get('salesperson_id') || undefined);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      const spResult = await getTeamMembersAction();
      if (spResult.success && spResult.teamMembers) {
        setSalespeople(spResult.teamMembers);
      } else {
        setError('Failed to load salespeople for filtering.');
      }

      const filters: any = {}; 
      if (dateFromString) filters.date_from = dateFromString;
      if (dateToString) filters.date_to = dateToString;
      if (selectedStatus) filters.status = selectedStatus;
      if (selectedSalesperson) filters.salesperson_id = selectedSalesperson;
      
      const result = await getManagedTeamAppointmentsAction(filters);
      if (result.success && result.appointments) {
        setAppointments(result.appointments);
      } else {
        setError(result.error || 'Failed to load appointments.');
        setAppointments([]);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [dateFromString, dateToString, selectedStatus, selectedSalesperson]);

  const handleFilterChange = () => {
    const params = new URLSearchParams();
    if (dateFromString) params.set('date_from', dateFromString);
    if (dateToString) params.set('date_to', dateToString);
    if (selectedStatus) params.set('status', selectedStatus);
    if (selectedSalesperson) params.set('salesperson_id', selectedSalesperson);
    router.push(`${pathname}?${params.toString()}`);
  };
  
  const clearFilters = () => {
    setDateFromString('');
    setDateToString('');
    setSelectedStatus(undefined);
    setSelectedSalesperson(undefined);
    router.push(pathname);
  };

  const handleStatusSelectChange = (value: string) => {
    if (value === ALL_STATUSES_OPTION_VALUE) {
      setSelectedStatus(undefined);
    } else {
      setSelectedStatus(value as AppointmentStatusEnum);
    }
  };

  const handleSalespersonSelectChange = (value: string) => {
    if (value === ALL_SALESPEOPLE_OPTION_VALUE) {
      setSelectedSalesperson(undefined);
    } else {
      setSelectedSalesperson(value);
    }
  };

  if (error && !isLoading) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle className="text-destructive">Error Loading Appointments</CardTitle>
            </CardHeader>
            <CardContent>
                <p>{error}</p>
                <Button onClick={handleFilterChange} className="mt-4">Retry</Button>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Filter className="h-5 w-5 mr-2 text-muted-foreground"/> Filter Appointments</CardTitle>
          <CardDescription>Refine the list of team appointments by date, status, or salesperson. (Use YYYY-MM-DD for dates)</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
                <label htmlFor="dateFrom" className="text-sm font-medium text-muted-foreground">From Date</label>
                <Input 
                    type="text" 
                    id="dateFrom" 
                    placeholder="YYYY-MM-DD" 
                    value={dateFromString} 
                    onChange={(e) => setDateFromString(e.target.value)} 
                />
            </div>
            <div>
                <label htmlFor="dateTo" className="text-sm font-medium text-muted-foreground">To Date</label>
                <Input 
                    type="text" 
                    id="dateTo" 
                    placeholder="YYYY-MM-DD" 
                    value={dateToString} 
                    onChange={(e) => setDateToString(e.target.value)} 
                />
            </div>
            <div>
                <label htmlFor="statusFilter" className="text-sm font-medium text-muted-foreground">Status</label>
                <Select value={selectedStatus || ALL_STATUSES_OPTION_VALUE} onValueChange={handleStatusSelectChange}>
                    <SelectTrigger id="statusFilter"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ALL_STATUSES_OPTION_VALUE}>All Statuses</SelectItem>
                        {statusOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <label htmlFor="salespersonFilter" className="text-sm font-medium text-muted-foreground">Salesperson</label>
                <Select value={selectedSalesperson || ALL_SALESPEOPLE_OPTION_VALUE} onValueChange={handleSalespersonSelectChange}>
                    <SelectTrigger id="salespersonFilter"><SelectValue placeholder="All Salespeople" /></SelectTrigger>
                    <SelectContent>
                         <SelectItem value={ALL_SALESPEOPLE_OPTION_VALUE}>All Salespeople</SelectItem>
                        {salespeople.map(sp => <SelectItem key={sp.id} value={sp.id}>{sp.full_name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        </CardContent>
        <CardContent className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" onClick={clearFilters} disabled={isLoading || isPending}>Clear Filters</Button>
            <Button onClick={handleFilterChange} disabled={isLoading || isPending}>
                {isPending || isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Search className="mr-2 h-4 w-4" />} Apply Filters
            </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Appointment List</CardTitle>
          <CardDescription>
            Appointments scheduled for salespeople under your supervision.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
             <div className="p-10 text-center text-muted-foreground flex items-center justify-center">
                <Loader2 className="h-8 w-8 mr-3 animate-spin" /> Loading appointments...
             </div>
          ) : appointments.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">
              <CalendarDays className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold">No Appointments Found</h3>
              <p className="mt-1 text-sm">
                No appointments match the current filters, or your team has no scheduled appointments.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Service</TableHead>
                    <TableHead className="hidden lg:table-cell">Salesperson</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appt: ManagedAppointment) => (
                    <TableRow key={appt.id}>
                      <TableCell className="text-xs">{formatDate(appt.appointment_datetime)}</TableCell>
                      <TableCell className="font-medium">{appt.customers?.full_name || 'N/A'}</TableCell>
                      <TableCell className="hidden md:table-cell text-xs">{appt.service_type || 'N/A'}</TableCell>
                      <TableCell className="hidden lg:table-cell text-xs">{appt.salesperson?.full_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge 
                            variant="outline" 
                            className={`text-xs ${appointmentStatusColors[appt.status as AppointmentStatusEnum] || appointmentStatusColors['Scheduled']}`}
                        >
                            {appt.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/salesperson/appointments/${appt.id}`}> 
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
    </div>
  );
}

export default function ManagerTeamAppointmentsPage() {
    return (
        <div className="space-y-6">
            <header className="bg-card shadow-sm rounded-lg p-6">
                <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center">
                    <CalendarDays className="w-8 h-8 mr-3 text-primary"/> Team Appointments
                    </h1>
                    <p className="text-muted-foreground mt-1">
                    View and filter appointments for your entire team.
                    </p>
                </div>
                </div>
            </header>
            <Suspense fallback={<div className="p-10 text-center text-muted-foreground flex items-center justify-center"><Loader2 className="h-8 w-8 mr-3 animate-spin" /> Loading filter options and appointments...</div>}>
                 <TeamAppointmentsContent />
            </Suspense>
        </div>
    )
} 