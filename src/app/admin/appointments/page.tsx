import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    CalendarClock, // Icon for Appointments
    Search, 
    Filter, 
    MoreHorizontal, 
    Eye,
    Store, // For showroom context
    UserCircle2, // For salesperson context
    Users // For Customer
} from 'lucide-react';
import { getAppointmentsForAdminView, AppointmentForAdminView } from './actions';
// import { DateRangePicker } from "@/components/ui/date-range-picker"; // Assuming this component exists or will be created

interface Appointment {
    id: string;
    customerName: string;
    customerId: string;
    salespersonName?: string;
    salespersonId?: string;
    showroomName: string;
    showroomId: string;
    appointmentDate: string; // ISO string or YYYY-MM-DD
    appointmentTime: string; // HH:MM
    serviceType: string; // e.g., Consultation, Viewing, Repair Drop-off
    status: "Scheduled" | "Confirmed" | "Completed" | "Cancelled" | "Rescheduled" | "No Show";
    notes?: string;
}

const formatDate = (dateString: string, timeString?: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString + (timeString ? 'T' + timeString : ''));
        if (isNaN(date.getTime())) return dateString;
        const options: Intl.DateTimeFormatOptions = {
            day: '2-digit', month: 'short', year: 'numeric',
            ...(timeString && { hour: '2-digit', minute: '2-digit', hour12: true })
        };
        return date.toLocaleTimeString('en-GB', options).replace(', ', ' - '); // Custom formatting for combined date and time
    } catch {
        return dateString + (timeString ? ` ${timeString}` : '');
    }
};

const getAppointmentStatusBadgeVariant = (status: string | null) => {
    switch (status) {
        case 'Scheduled': return 'outline';
        case 'Confirmed': return 'default'; // Often blue or green
        case 'Completed': return 'default'; // Consider a success variant (e.g. green)
        case 'Cancelled': return 'destructive';
        case 'Rescheduled': return 'secondary'; // Often yellow
        case 'No Show': return 'destructive';
        default: return 'outline';
    }
};

export default async function AdminAllAppointmentsPage() {
    const { appointments, error } = await getAppointmentsForAdminView();

    if (error) {
        return <div className="p-6 text-red-500">Error fetching appointments: {error}</div>;
    }

    return (
        <div className="space-y-6">
            <header className="bg-card shadow-sm rounded-lg p-6">
                <div className="flex items-center gap-3">
                    <CalendarClock className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">All Appointments</h1>
                        <p className="text-muted-foreground mt-1">View and manage appointments across all showrooms.</p>
                    </div>
                </div>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center"><Filter className="h-5 w-5 mr-2"/> Filters</CardTitle>
                    <CardDescription>Filtering will be re-enabled soon.</CardDescription>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Appointment List ({appointments.length})</CardTitle>
                    <CardDescription>Overview of all scheduled and past appointments.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[100px]">Appt. ID</TableHead>
                                    <TableHead className="min-w-[180px]">Customer</TableHead>
                                    <TableHead className="min-w-[150px]">Date & Time</TableHead>
                                    <TableHead className="min-w-[150px]">Showroom</TableHead>
                                    <TableHead className="min-w-[150px]">Salesperson</TableHead>
                                    <TableHead className="min-w-[150px]">Service Type</TableHead>
                                    <TableHead className="text-center min-w-[120px]">Status</TableHead>
                                    <TableHead className="text-right w-[80px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {appointments.length > 0 ? appointments.map((apt) => (
                                    <TableRow key={apt.id} className="hover:bg-muted/50 text-xs">
                                        <TableCell className="font-mono">{apt.id}</TableCell>
                                        <TableCell>
                                            {apt.customer_id && apt.customer_name ? (
                                                <Link href={`/admin/customers/${apt.customer_id}`} className="hover:underline text-primary font-medium">
                                                    {apt.customer_name}
                                                </Link>
                                            ) : <span className="text-muted-foreground italic">N/A</span>}
                                        </TableCell>
                                        <TableCell>{formatDate(apt.appointment_datetime)}</TableCell>
                                        <TableCell>
                                            {apt.showroom_id && apt.showroom_name ? (
                                                <Link href={`/admin/showrooms/${apt.showroom_id}`} className="hover:underline">
                                                    {apt.showroom_name}
                                                </Link>
                                            ) : <span className="text-muted-foreground italic">N/A</span>}
                                        </TableCell>
                                        <TableCell>
                                            {apt.salesperson_id && apt.salesperson_name ? (
                                                <Link href={`/admin/salespeople/${apt.salesperson_id}`} className="hover:underline">
                                                    {apt.salesperson_name}
                                                </Link>
                                            ) : <span className="text-muted-foreground italic">N/A</span>}
                                        </TableCell>
                                        <TableCell>{apt.service_type}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={getAppointmentStatusBadgeVariant(apt.status)} className="whitespace-nowrap">
                                                {apt.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                           {/* Actions will be added later */}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                            No appointments found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                {/* TODO: Add Pagination Component & DateRangePicker component */}
            </Card>
        </div>
    );
} 