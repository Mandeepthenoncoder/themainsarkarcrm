"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    CalendarClock, // Main icon
    ChevronLeft,
    User as UserIcon, // For Customer
    UserCircle2, // For Salesperson
    Store, // For Showroom
    ClipboardList, // For Service Type
    FileText, // For Notes
    CalendarDays, // For Date
    Clock, // For Time
    Activity, 
    AlertTriangle,
    Info // For Status
} from 'lucide-react';

interface AppointmentDetail {
    id: string;
    customerName: string;
    customerId: string;
    salespersonName?: string;
    salespersonId?: string;
    salespersonRole?: string;
    showroomName: string;
    showroomId: string;
    showroomLocation?: string;
    appointmentDate: string; 
    appointmentTime: string; 
    serviceType: string; 
    status: "Scheduled" | "Confirmed" | "Completed" | "Cancelled" | "Rescheduled" | "No Show";
    notes?: string;
    internalNotes?: string; // Admin/Manager specific notes
    createdAt: string;
    updatedAt?: string;
    history?: Array<{ timestamp: string; status: string; changedBy?: string; remark?: string }>;
}

// Placeholder data for appointment details
const mockAppointmentsList: AppointmentDetail[] = [
    {
        id: 'appt001', customerName: 'Rohan Mehra', customerId: 'cust001', 
        salespersonName: 'Aarav Patel', salespersonId: 'sp001', salespersonRole: 'Sales Executive',
        showroomName: 'Jaipur Flagship', showroomId: 'sr001', showroomLocation: 'Jaipur',
        appointmentDate: '2024-08-15', appointmentTime: '14:30',
        serviceType: 'Bridal Consultation', status: 'Confirmed',
        notes: 'Client is looking for a full bridal set. Budget approx 5 Lakhs.',
        internalNotes: 'Ensure VIP room is prepared. Ms. Priya to oversee briefly.',
        createdAt: '2024-08-01T10:00:00Z', updatedAt: '2024-08-02T11:30:00Z',
        history: [
            { timestamp: '2024-08-01T10:00:00Z', status: 'Scheduled', changedBy: 'Aarav Patel'},
            { timestamp: '2024-08-02T11:30:00Z', status: 'Confirmed', changedBy: 'System', remark: 'Client confirmed via SMS reply.'}
        ]
    },
    {
        id: 'appt003', customerName: 'Amitabh Bachchan', customerId: 'cust003', 
        salespersonName: 'Ms. Priya Sharma', salespersonId: 'mgr001', salespersonRole: 'Showroom Manager',
        showroomName: 'Jaipur Flagship', showroomId: 'sr001', showroomLocation: 'Jaipur',
        appointmentDate: '2024-07-20', appointmentTime: '16:00',
        serviceType: 'Custom Design Discussion', status: 'Completed',
        notes: 'Discussed custom Jodhpur-style ring. Design sent for approval.',
        createdAt: '2024-07-15T14:00:00Z', updatedAt: '2024-07-20T17:00:00Z',
        history: [
            { timestamp: '2024-07-15T14:00:00Z', status: 'Scheduled', changedBy: 'Admin Assistant'},
            { timestamp: '2024-07-20T17:00:00Z', status: 'Completed', changedBy: 'Priya Sharma', remark: 'Successful consultation.'}
        ]
    },
];

const fetchAppointmentDetails = async (id: string): Promise<AppointmentDetail | null> => {
    console.log(`Fetching details for appointment ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 300)); 
    const appointment = mockAppointmentsList.find(apt => apt.id === id);
    return appointment || null;
};

const formatDate = (dateString?: string, includeTime = false, timeString?: string) => {
    if (!dateString) return 'N/A';
    try {
        let fullDateStr = dateString;
        if (includeTime && timeString) {
            fullDateStr = `${dateString}T${timeString}`;
        } else if (includeTime && !timeString && dateString.includes('T')) {
            // Date string already has time
        } else if (includeTime && !timeString && !dateString.includes('T')) {
            // No time provided, but time is requested - maybe just show date then
            includeTime = false;
        }

        const date = new Date(fullDateStr);
        if (isNaN(date.getTime())) return dateString; 

        const options: Intl.DateTimeFormatOptions = {
            day: '2-digit', month: 'short', year: 'numeric',
            ...(includeTime && { hour: '2-digit', minute: '2-digit', hour12: true })
        };
        return date.toLocaleDateString('en-GB', options);
    } catch {
        return dateString;
    }
};

const getAppointmentStatusBadgeVariant = (status: AppointmentDetail['status']) => {
    switch (status) {
        case 'Scheduled': return 'outline';
        case 'Confirmed': return 'default';
        case 'Completed': return 'default'; // Consider 'success' variant
        case 'Cancelled': return 'destructive';
        case 'Rescheduled': return 'secondary';
        case 'No Show': return 'destructive';
        default: return 'outline';
    }
};

export default function AdminAppointmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const appointmentId = params.appointmentId as string;
    
    const [appointment, setAppointment] = useState<AppointmentDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (appointmentId) {
            setIsLoading(true);
            fetchAppointmentDetails(appointmentId)
                .then(data => {
                    if (data) {
                        setAppointment(data);
                    } else {
                        setError('Appointment not found.');
                    }
                })
                .catch(err => {
                    console.error("Error fetching appointment details:", err);
                    setError('Failed to load appointment details.');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [appointmentId]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-64"><Activity className="h-8 w-8 animate-spin mr-2" /> Loading appointment details...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
                <p className="text-destructive text-lg mb-2">{error}</p>
                <Button onClick={() => router.push('/admin/appointments')}>Back to Appointments List</Button>
            </div>
        );
    }

    if (!appointment) {
        return <div className="text-center py-10">Appointment data is unavailable.</div>;
    }

    const { 
        id, customerName, customerId, salespersonName, salespersonId, salespersonRole, 
        showroomName, showroomId, showroomLocation, appointmentDate, appointmentTime, 
        serviceType, status, notes, internalNotes, createdAt, updatedAt, history 
    } = appointment;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <div className="mb-2">
                        <Link href="/admin/appointments" className="text-sm text-muted-foreground hover:text-primary flex items-center">
                           <ChevronLeft className="h-4 w-4 mr-1"/> All Appointments
                        </Link>
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center">
                        <CalendarClock className="h-7 w-7 mr-3 text-primary" /> Appointment: {id}
                    </h1>
                </div>
                {/* Admin actions for an appointment could be here if needed (e.g., reassign, cancel with reason) */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Core Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center justify-between">
                                <span>{serviceType}</span>
                                <Badge variant={getAppointmentStatusBadgeVariant(status)} className="text-sm">{status}</Badge>
                            </CardTitle>
                            <CardDescription>
                                Scheduled for: {formatDate(appointmentDate, true, appointmentTime)}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground flex items-center"><UserIcon className="h-4 w-4 mr-2" /> Customer</h4>
                                    <Link href={`/admin/customers/${customerId}`} className="text-primary hover:underline font-semibold text-base">
                                        {customerName}
                                    </Link>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground flex items-center"><ClipboardList className="h-4 w-4 mr-2" /> Service Type</h4>
                                    <p className="text-base">{serviceType}</p>
                                </div>
                            </div>
                            <Separator/>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground flex items-center"><Store className="h-4 w-4 mr-2" /> Showroom</h4>
                                    <Link href={`/admin/showrooms/${showroomId}`} className="text-primary hover:underline font-semibold">
                                        {showroomName}
                                    </Link>
                                    {showroomLocation && <p className="text-xs text-muted-foreground">{showroomLocation}</p>}
                                </div>
                                {salespersonName && (
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-medium text-muted-foreground flex items-center"><UserCircle2 className="h-4 w-4 mr-2" /> Salesperson</h4>
                                        <Link href={`/admin/salespeople/${salespersonId}`} className="text-primary hover:underline font-semibold">
                                            {salespersonName}
                                        </Link>
                                        {salespersonRole && <p className="text-xs text-muted-foreground">{salespersonRole}</p>}
                                    </div>
                                )}
                            </div>
                            <Separator/>
                            {notes && (
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground flex items-center"><FileText className="h-4 w-4 mr-2" /> Customer Notes</h4>
                                    <p className="text-sm bg-muted/30 p-3 rounded-md whitespace-pre-wrap">{notes}</p>
                                </div>
                            )}
                            {internalNotes && (
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-muted-foreground flex items-center"><FileText className="h-4 w-4 mr-2 text-amber-600" /> Internal Admin/Manager Notes</h4>
                                    <p className="text-sm bg-amber-500/10 p-3 rounded-md whitespace-pre-wrap">{internalNotes}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Meta & History */}
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Meta Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created:</span>
                                <span>{formatDate(createdAt, true)}</span>
                            </div>
                            {updatedAt && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Last Updated:</span>
                                    <span>{formatDate(updatedAt, true)}</span>
                                </div>
                            )}
                             <div className="flex justify-between">
                                <span className="text-muted-foreground">Appointment ID:</span>
                                <span className="font-mono">{id}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {history && history.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center"><Activity className="h-5 w-5 mr-2"/> Status History</CardTitle>
                            </CardHeader>
                            <CardContent className="max-h-96 overflow-y-auto scrollbar-thin">
                                <ul className="space-y-4">
                                    {history.map((entry, index) => (
                                        <li key={index} className="relative pl-7 text-xs after:absolute after:left-2.5 after:top-3.5 after:bottom-0 after:w-px after:bg-border last:after:hidden">
                                             <div className={`absolute left-0 top-1.5 flex h-5 w-5 items-center justify-center rounded-full ${ getAppointmentStatusBadgeVariant(entry.status as AppointmentDetail['status']) === 'destructive' ? 'bg-destructive' : (getAppointmentStatusBadgeVariant(entry.status as AppointmentDetail['status']) === 'secondary' ? 'bg-yellow-500' : 'bg-primary')}`}>
                                                <Info className="h-3 w-3 text-primary-foreground" />
                                            </div>
                                            <p className="font-semibold">{entry.status}</p>
                                            <p className="text-muted-foreground">{formatDate(entry.timestamp, true)}</p>
                                            {entry.changedBy && <p className="text-muted-foreground">By: {entry.changedBy}</p>}
                                            {entry.remark && <p className="italic text-muted-foreground mt-0.5">Remark: {entry.remark}</p>}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
} 