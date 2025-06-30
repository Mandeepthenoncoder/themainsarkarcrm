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
    User as UserIcon,
    ChevronLeft,
    Mail, 
    Phone, 
    Briefcase, // Using for Employee ID or Role context
    CalendarDays, 
    Store, 
    UserCircle2, // For Manager
    BarChartHorizontalBig, 
    AlertOctagon, // For Flags/Alerts
    Activity, 
    AlertTriangle
} from 'lucide-react';

interface SalespersonDetail {
    id: string;
    name: string;
    employeeId: string;
    email: string;
    phoneNumber?: string;
    avatarUrl?: string;
    status: "Active" | "Inactive";
    dateHired: string;
    assignedShowroom: { id: string; name: string; location?: string };
    supervisingManager: { id: string; name: string; role?: string };
    performanceMetrics?: {
        ytdSales: string;
        customersAcquired: number;
        leadConversionRate: string;
        averageSaleValue: string;
    };
    accountFlags?: Array<{id: string, description: string, date: string, severity: 'low' | 'medium' | 'high'}>;
}

// Placeholder data for salesperson details (expanded from list view)
const mockSalespeopleList: SalespersonDetail[] = [
    {
        id: 'sp001', name: 'Aarav Patel', employeeId: 'EMP8001', email: 'aarav.patel@example.com', phoneNumber: '+91 91234 56780', avatarUrl: 'https://i.pravatar.cc/100?u=aarav.patel@example.com',
        status: 'Active', dateHired: '2021-02-15',
        assignedShowroom: { id: 'sr001', name: 'Jaipur Flagship', location: 'Jaipur' }, 
        supervisingManager: { id: 'mgr001', name: 'Ms. Priya Sharma', role: 'Showroom Manager' }, 
        performanceMetrics: { ytdSales: '₹45, Lakh', customersAcquired: 120, leadConversionRate: '28%', averageSaleValue: '₹37,500'},
        accountFlags: [
            {id: 'flag01', description: 'Consistently high customer satisfaction scores.', date: '2024-06-15', severity: 'low'}
        ]
    },
    {
        id: 'sp003', name: 'Chetan Kumar', employeeId: 'EMP8003', email: 'chetan.kumar@example.com', 
        status: 'Inactive', dateHired: '2020-11-01',
        assignedShowroom: { id: 'sr002', name: 'Mumbai Bandra', location: 'Mumbai' }, 
        supervisingManager: { id: 'mgr002', name: 'Mr. Anand Verma', role: 'Showroom Manager' }, 
        performanceMetrics: { ytdSales: '₹12 Lakh (Last Active Year)', customersAcquired: 45, leadConversionRate: '15%', averageSaleValue: '₹26,600'},
        accountFlags: [
            {id: 'flag02', description: 'Account marked inactive due to extended leave.', date: '2023-05-01', severity: 'medium'}
        ]
    },
];

const fetchSalespersonDetails = async (id: string): Promise<SalespersonDetail | null> => {
    console.log(`Fetching details for salesperson ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    const salesperson = mockSalespeopleList.find(sp => sp.id === id);
    return salesperson || null;
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

const getStatusBadgeVariant = (status: SalespersonDetail['status']) => {
    return status === 'Active' ? 'default' : 'destructive';
};

const getFlagSeverityBadgeVariant = (severity: 'low' | 'medium' | 'high') => {
    switch(severity) {
        case 'high': return 'destructive';
        case 'medium': return 'secondary'; // Or 'warning' if you have custom orange variant
        case 'low': return 'outline';
        default: return 'outline';
    }
};

export default function AdminSalespersonDetailPage() {
    const params = useParams();
    const router = useRouter();
    const salespersonId = params.salespersonId as string;
    
    const [salesperson, setSalesperson] = useState<SalespersonDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (salespersonId) {
            setIsLoading(true);
            fetchSalespersonDetails(salespersonId)
                .then(data => {
                    if (data) {
                        setSalesperson(data);
                    } else {
                        setError('Salesperson not found.');
                    }
                })
                .catch(err => {
                    console.error("Error fetching salesperson details:", err);
                    setError('Failed to load salesperson details.');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [salespersonId]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-64"><Activity className="h-8 w-8 animate-spin mr-2" /> Loading salesperson details...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
                <p className="text-destructive text-lg mb-2">{error}</p>
                <Button onClick={() => router.push('/admin/salespeople')}>Back to Salespeople List</Button>
            </div>
        );
    }

    if (!salesperson) {
        return <div className="text-center py-10">Salesperson data is unavailable.</div>;
    }

    const { name, employeeId, email, phoneNumber, avatarUrl, status, dateHired, assignedShowroom, supervisingManager, performanceMetrics, accountFlags } = salesperson;
    const fallbackName = name.split(' ').map(n=>n[0]).join('').toUpperCase();

    return (
        <div className="space-y-6">
            {/* Header and Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <div className="mb-2">
                        <Link href="/admin/salespeople" className="text-sm text-muted-foreground hover:text-primary flex items-center">
                           <ChevronLeft className="h-4 w-4 mr-1"/> Salespeople
                        </Link>
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center">
                        <UserIcon className="h-7 w-7 mr-3 text-primary" /> {name}
                    </h1>
                </div>
                {/* No edit button for Admin oversight view */}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Profile & Assignments */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                            <Avatar className="h-20 w-20 border">
                                <AvatarImage src={avatarUrl} alt={name} />
                                <AvatarFallback className="text-2xl bg-muted">{fallbackName}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <CardTitle className="text-2xl">{name}</CardTitle>
                                <CardDescription className="mt-1">Employee ID: {employeeId}</CardDescription>
                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                    <Badge variant={getStatusBadgeVariant(status)}>{status}</Badge>
                                    <span className="text-xs text-muted-foreground">Hired: {formatDate(dateHired)}</span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="mt-2 space-y-3">
                            <div className="flex items-center text-sm">
                                <Mail className="h-4 w-4 mr-3 text-muted-foreground shrink-0" />
                                <span className="text-muted-foreground break-all">{email}</span>
                            </div>
                            {phoneNumber && (
                                <div className="flex items-center text-sm">
                                    <Phone className="h-4 w-4 mr-3 text-muted-foreground shrink-0" />
                                    <span className="text-muted-foreground">{phoneNumber}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Assignment Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <Store className="h-5 w-5 text-primary mt-1 shrink-0" />
                                <div>
                                    <h4 className="font-semibold">Assigned Showroom</h4>
                                    <Link href={`/admin/showrooms/${assignedShowroom.id}`} className="text-primary hover:underline">
                                        {assignedShowroom.name}
                                    </Link>
                                    {assignedShowroom.location && <p className="text-xs text-muted-foreground">{assignedShowroom.location}</p>}
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-start space-x-3">
                                <UserCircle2 className="h-5 w-5 text-primary mt-1 shrink-0" />
                                <div>
                                    <h4 className="font-semibold">Supervising Manager</h4>
                                     <Link href={`/admin/managers/${supervisingManager.id}`} className="text-primary hover:underline">
                                        {supervisingManager.name}
                                    </Link>
                                    {supervisingManager.role && <p className="text-xs text-muted-foreground">{supervisingManager.role}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Performance & Flags */}
                <div className="space-y-6">
                    {performanceMetrics && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center"><BarChartHorizontalBig className="h-5 w-5 mr-2 text-primary"/> Performance Snapshot</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">YTD Sales</span>
                                    <span className="font-semibold text-base">{performanceMetrics.ytdSales}</span>
                                </div>
                                <Separator/>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Customers Acquired</span>
                                    <span className="font-semibold">{performanceMetrics.customersAcquired}</span>
                                </div>
                                <Separator/>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Lead Conversion Rate</span>
                                    <span className="font-semibold">{performanceMetrics.leadConversionRate}</span>
                                </div>
                                <Separator/>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Average Sale Value</span>
                                    <span className="font-semibold">{performanceMetrics.averageSaleValue}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {accountFlags && accountFlags.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center"><AlertOctagon className="h-5 w-5 mr-2 text-amber-600"/> Account Flags / Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 max-h-60 overflow-y-auto scrollbar-thin">
                                    {accountFlags.map(flag => (
                                        <li key={flag.id} className={`p-2.5 rounded-md border-l-4 ${flag.severity === 'high' ? 'border-destructive bg-destructive/5' : (flag.severity === 'medium' ? 'border-yellow-500 bg-yellow-500/5' : 'border-blue-500 bg-blue-500/5')}`}>
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm font-medium mb-0.5">{flag.description}</p>
                                                <Badge variant={getFlagSeverityBadgeVariant(flag.severity)} className="text-xs ml-2 shrink-0">{flag.severity}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{formatDate(flag.date)}</p>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}
                     {!accountFlags || accountFlags.length === 0 && (
                        <Card className="border-dashed">
                            <CardHeader>
                                 <CardTitle className="flex items-center text-sm text-muted-foreground"><AlertOctagon className="h-4 w-4 mr-2"/> No Account Flags</CardTitle>
                            </CardHeader>
                             <CardContent>
                                <p className="text-xs text-muted-foreground">There are no specific flags or admin notes recorded for this salesperson.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
} 