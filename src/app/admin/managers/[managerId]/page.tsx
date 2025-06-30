"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Users as UsersIcon,
    User as UserIcon,
    Edit3 as EditIcon,
    ChevronLeft,
    Mail, 
    Phone, 
    Briefcase, 
    CalendarDays, 
    Store, 
    UsersRound, 
    BarChartHorizontalBig, 
    FileText, 
    Activity, 
    AlertTriangle,
    ShieldCheck
} from 'lucide-react';

interface ManagerDetail {
    id: string;
    name: string;
    employeeId: string;
    email: string;
    phoneNumber?: string;
    avatarUrl?: string;
    role: string;
    status: "Active" | "Pending Approval" | "Suspended";
    dateJoined: string;
    assignedShowrooms: Array<{ id: string; name: string; location?: string }>;
    salespeopleSupervised: number;
    notes?: string;
    performanceMetrics?: {
        totalTeamSalesYTD: string;
        averageCustomerRating: number;
        teamLeadConversionRate: string;
    };
    activityLog?: Array<{id: string, description: string, date: string, type: 'action' | 'system'}>;
}

// Placeholder data for manager details (similar to list, but potentially more detail)
const mockManagersList: ManagerDetail[] = [
    {
        id: 'mgr001',
        name: 'Ms. Priya Sharma',
        employeeId: 'EMP7001',
        email: 'priya.sharma@example.com',
        phoneNumber: '+91 98765 43210',
        avatarUrl: 'https://i.pravatar.cc/100?u=priya.sharma@example.com',
        role: 'Showroom Manager',
        status: 'Active',
        dateJoined: '2019-05-10',
        assignedShowrooms: [{ id: 'sr001', name: 'Jaipur Flagship', location: 'Jaipur' }],
        salespeopleSupervised: 15,
        notes: 'Experienced manager with a strong background in luxury retail. Consistently exceeds targets.',
        performanceMetrics: { totalTeamSalesYTD: '₹1.2 Cr', averageCustomerRating: 4.8, teamLeadConversionRate: '35%'},
        activityLog: [
            {id: 'log01', description: 'Account activated by Admin.', date: '2019-05-10', type: 'system'},
            {id: 'log02', description: 'Assigned to Jaipur Flagship showroom.', date: '2019-05-11', type: 'action'}
        ]
    },
    {
        id: 'mgr003',
        name: 'Ms. Sunita Rao',
        employeeId: 'EMP7003',
        email: 'sunita.rao@example.com',
        phoneNumber: '+91 99887 76655',
        avatarUrl: 'https://i.pravatar.cc/100?u=sunita.rao@example.com',
        role: 'Showroom Manager',
        status: 'Pending Approval',
        dateJoined: '2023-07-01',
        assignedShowrooms: [{ id: 'sr003', name: 'Delhi CP', location: 'Delhi'}],
        salespeopleSupervised: 0, // To be updated post-approval
        notes: 'New manager hire, pending final onboarding and system access approval.'
    },
];

const fetchManagerDetails = async (id: string): Promise<ManagerDetail | null> => {
    console.log(`Fetching details for manager ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    const manager = mockManagersList.find(m => m.id === id);
    return manager || null;
};

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; 
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return dateString;
    }
};

const getStatusBadgeVariant = (status: ManagerDetail['status']) => {
    switch (status) {
        case 'Active': return 'default';
        case 'Pending Approval': return 'secondary';
        case 'Suspended': return 'destructive';
        default: return 'outline';
    }
};

export default function ManagerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const managerId = params.managerId as string;
    
    const [manager, setManager] = useState<ManagerDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (managerId) {
            setIsLoading(true);
            fetchManagerDetails(managerId)
                .then(data => {
                    if (data) {
                        setManager(data);
                    } else {
                        setError('Manager not found.');
                    }
                })
                .catch(err => {
                    console.error("Error fetching manager details:", err);
                    setError('Failed to load manager details.');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [managerId]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-64"><Activity className="h-8 w-8 animate-spin mr-2" /> Loading manager details...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
                <p className="text-destructive text-lg mb-2">{error}</p>
                <Button onClick={() => router.push('/admin/managers')}>Back to Managers List</Button>
            </div>
        );
    }

    if (!manager) {
        return <div className="text-center py-10">Manager data is unavailable.</div>;
    }

    const { name, employeeId, email, phoneNumber, avatarUrl, role, status, dateJoined, assignedShowrooms, salespeopleSupervised, notes, performanceMetrics, activityLog } = manager;
    const fallbackName = name.split(' ').map(n=>n[0]).join('').toUpperCase();

    return (
        <div className="space-y-6">
            {/* Header and Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <div className="mb-2">
                        <Link href="/admin/managers" className="text-sm text-muted-foreground hover:text-primary flex items-center">
                           <ChevronLeft className="h-4 w-4 mr-1"/> Managers
                        </Link>
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center">
                        <UserIcon className="h-7 w-7 mr-3 text-primary" /> {name}
                    </h1>
                </div>
                <Link href={`/admin/managers/${managerId}/edit`} passHref>
                    <Button variant="outline">
                        <EditIcon className="h-4 w-4 mr-2" /> Edit Account
                    </Button>
                </Link>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile & Assignments */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                            <Avatar className="h-20 w-20 border-2 border-primary/50">
                                <AvatarImage src={avatarUrl} alt={name} />
                                <AvatarFallback className="text-2xl bg-muted">{fallbackName}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <CardTitle className="text-2xl">{name}</CardTitle>
                                <CardDescription className="mt-1">{role} | Employee ID: {employeeId}</CardDescription>
                                <div className="mt-2 flex items-center gap-2">
                                    <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
                                    <span className="text-xs text-muted-foreground">Joined: {formatDate(dateJoined)}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="mt-2 space-y-3">
                            <div className="flex items-center text-sm">
                                <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                                <span className="text-muted-foreground">{email}</span>
                            </div>
                            {phoneNumber && (
                                <div className="flex items-center text-sm">
                                    <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">{phoneNumber}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Showroom(s)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {assignedShowrooms && assignedShowrooms.length > 0 ? (
                                <ul className="space-y-3">
                                    {assignedShowrooms.map(sr => (
                                        <li key={sr.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md hover:bg-muted transition-colors">
                                            <div>
                                                <Link href={`/admin/showrooms/${sr.id}`} className="font-medium text-primary hover:underline">{sr.name}</Link>
                                                {sr.location && <p className="text-xs text-muted-foreground">{sr.location}</p>}
                                            </div>
                                            <Link href={`/admin/showrooms/${sr.id}`} passHref>
                                                <Button variant="outline" size="sm">View Showroom</Button>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-muted-foreground">Currently not assigned to any specific showroom.</p>}
                        </CardContent>
                         <CardFooter className="border-t pt-4">
                            <Button variant="outline" className="w-full" disabled> {/* Placeholder */}
                                <Store className="mr-2 h-4 w-4"/> Manage Showroom Assignments
                            </Button>
                        </CardFooter>
                    </Card>

                     {notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center"><FileText className="h-5 w-5 mr-2"/> Admin Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Right Column - Team & Performance */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center"><UsersRound className="h-5 w-5 mr-2 text-primary"/> Team Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Salespeople Supervised</span>
                                <span className="font-semibold">{salespeopleSupervised}</span>
                            </div>
                            {/* Placeholder for more team details */}
                        </CardContent>
                        <CardFooter className="border-t pt-4">
                            <Button variant="link" className="w-full p-0 h-auto text-primary" disabled>View Supervised Team</Button>
                        </CardFooter>
                    </Card>

                    {performanceMetrics && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center"><BarChartHorizontalBig className="h-5 w-5 mr-2 text-primary"/> Performance Snapshot</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Total Team Sales (YTD)</span>
                                    <span className="font-semibold">{performanceMetrics.totalTeamSalesYTD}</span>
                                </div>
                                <Separator/>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Avg. Customer Rating</span>
                                    <span className="font-semibold">{performanceMetrics.averageCustomerRating} / 5</span>
                                </div>
                                <Separator/>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Team Lead Conversion</span>
                                    <span className="font-semibold">{performanceMetrics.teamLeadConversionRate}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {activityLog && activityLog.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center"><Activity className="h-5 w-5 mr-2"/> Account Activity Log</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 max-h-60 overflow-y-auto scrollbar-thin">
                                    {activityLog.map(log => (
                                        <li key={log.id} className={`text-xs p-2 rounded-md ${log.type === 'system' ? 'bg-blue-500/10' : 'bg-muted/70'}`}>
                                            <span className="block font-medium">{log.description}</span>
                                            <span className="text-muted-foreground">{formatDate(log.date)} - {log.type}</span>
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