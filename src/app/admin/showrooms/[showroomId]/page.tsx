"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Store, 
    Edit, 
    ArrowLeft, 
    MapPin, 
    Phone, 
    Mail, 
    CalendarDays, 
    Users, 
    UserCheck, 
    DollarSign, 
    LineChart, 
    UsersRound, 
    Activity, 
    AlertTriangle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

// Assuming Showroom interface is similar to one in list page or defined globally
interface Showroom {
    id: string;
    name: string;
    location: string; 
    addressSnippet: string; // Simplified, full address would be better
    fullAddress?: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    mainContact: string; // Or primaryManagerId/Name
    contactPhone?: string;
    contactEmail?: string;
    salespeopleCount: number;
    ytdSales: string; 
    status: "Active" | "Inactive" | "Planned" | "Under Renovation";
    openingDate?: string; // Date string
    notes?: string;
    // Potentially more detailed fields
    managers?: Array<{id: string, name: string}>; // Example for assigned managers
    kpis?: {
        recentSalesTrend: 'up' | 'down' | 'flat';
        customerCount: number;
        leadConversionRate: string; // e.g. "25%"
    };
    recentActivity?: Array<{id: string, description: string, date: string, type: 'info' | 'alert'}>;
}

// Placeholder data - this would typically come from an API call based on showroomId
const mockShowroomsList: Showroom[] = [
    { 
        id: 'sr001', 
        name: 'Jaipur Flagship Store',
        location: 'Jaipur, Rajasthan',
        addressSnippet: '123 Johari Bazaar Rd',
        fullAddress: { line1: '123 Johari Bazaar Rd', city: 'Jaipur', state: 'Rajasthan', postalCode: '302001', country: 'India'},
        mainContact: 'Ms. Priya Sharma',
        contactPhone: '+91 141 234 5678',
        contactEmail: 'jaipur.store@mangathriya.com',
        salespeopleCount: 15,
        ytdSales: '₹25,75,000',
        status: 'Active',
        openingDate: '2020-01-15',
        notes: 'Our flagship store, specializing in high-end bridal jewelry and custom designs. Features a private viewing lounge.',
        managers: [{id: 'mgr001', name: 'Ms. Priya Sharma'}, {id: 'mgr002', name: 'Mr. Alok Nath (Asst.)'}],
        kpis: { recentSalesTrend: 'up', customerCount: 1250, leadConversionRate: '30%'},
        recentActivity: [
            {id: 'act01', description: 'New diamond collection launched.', date: '2024-07-20', type: 'info'},
            {id: 'act02', description: 'Security system upgrade scheduled.', date: '2024-07-15', type: 'alert'}
        ]
    },
    // ... (add sr002, sr003, sr004 from previous list page if needed, with more details)
     { 
        id: 'sr002', 
        name: 'Mumbai Bandra Boutique',
        location: 'Mumbai, Maharashtra',
        addressSnippet: '45 Linking Road, Bandra West',
        fullAddress: { line1: '45 Linking Road', line2: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', postalCode: '400050', country: 'India'},
        mainContact: 'Mr. Anand Verma',
        contactPhone: '+91 22 2600 1234',
        contactEmail: 'mumbai.store@mangathriya.com',
        salespeopleCount: 10,
        ytdSales: '₹18,50,200',
        status: 'Active',
        openingDate: '2021-03-20',
        notes: 'Focuses on contemporary designs and celebrity clientele.',
        managers: [{id: 'mgr003', name: 'Mr. Anand Verma'}],
        kpis: { recentSalesTrend: 'flat', customerCount: 850, leadConversionRate: '22%'},
    },
    {
        id: 'sr004',
        name: 'Bangalore Indiranagar',
        location: 'Bangalore, Karnataka',
        addressSnippet: '100 Feet Road, Indiranagar',
        fullAddress: { line1: '7G, 100 Feet Rd', line2: 'HAL 2nd Stage, Indiranagar', city: 'Bengaluru', state: 'Karnataka', postalCode: '560038', country: 'India'},
        mainContact: 'Mr. Rajeev Menon',
        contactPhone: '+91 80 4567 8900',
        contactEmail: 'blr.store@mangathriya.com',
        salespeopleCount: 8,
        ytdSales: '₹9,80,000',
        status: 'Inactive',
        openingDate: '2023-01-05',
        notes: 'Currently inactive. Planned for reopening Q4 2024 after renovation.',
        managers: [{id: 'mgr005', name: 'Mr. Rajeev Menon'}],
        kpis: { recentSalesTrend: 'down', customerCount: 320, leadConversionRate: '15%'},
        recentActivity: [
            {id: 'act03', description: 'Renovation tender awarded.', date: '2024-06-10', type: 'info'},
        ]
    },
];

const fetchShowroomDetails = async (id: string): Promise<Showroom | null> => {
    console.log(`Fetching details for showroom ID: ${id}`);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    const showroom = mockShowroomsList.find(sr => sr.id === id);
    return showroom || null;
};

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return original if invalid date
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return dateString;
    }
};

export default function ShowroomDetailPage() {
    const params = useParams();
    const router = useRouter();
    const showroomId = params.showroomId as string;
    
    const [showroom, setShowroom] = useState<Showroom | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (showroomId) {
            setIsLoading(true);
            fetchShowroomDetails(showroomId)
                .then(data => {
                    if (data) {
                        setShowroom(data);
                    } else {
                        setError('Showroom not found.');
                    }
                })
                .catch(err => {
                    console.error(err);
                    setError('Failed to load showroom details.');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [showroomId]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-64"><Activity className="h-8 w-8 animate-spin mr-2" /> Loading showroom details...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
                <p className="text-destructive text-lg mb-2">{error}</p>
                <Button onClick={() => router.push('/admin/showrooms')}>Back to Showrooms List</Button>
            </div>
        );
    }

    if (!showroom) {
        // This case should ideally be covered by error state, but as a fallback:
        return <div className="text-center py-10">Showroom data is unavailable.</div>;
    }

    const { name, fullAddress, contactPhone, contactEmail, status, openingDate, notes, mainContact, salespeopleCount, ytdSales, managers, kpis, recentActivity } = showroom;

    return (
        <div className="space-y-6">
            {/* Header and Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                <div>
                    <div className="mb-2">
                        <Link href="/admin/showrooms" className="text-sm text-muted-foreground hover:text-primary flex items-center">
                           <ChevronLeft className="h-4 w-4 mr-1"/> Showrooms
                        </Link>
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center">
                        <Store className="h-7 w-7 mr-3 text-primary" /> {name}
                    </h1>
                </div>
                <Link href={`/admin/showrooms/${showroomId}/edit`} passHref>
                    <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" /> Edit Showroom
                    </Button>
                </Link>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Showroom Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                <div>
                                    <h4 className="font-semibold">Address</h4>
                                    {fullAddress ? (
                                        <p className="text-muted-foreground">
                                            {fullAddress.line1}{fullAddress.line2 && `, ${fullAddress.line2}`}<br/>
                                            {fullAddress.city}, {fullAddress.state} {fullAddress.postalCode}<br/>
                                            {fullAddress.country}
                                        </p>
                                    ) : <p className="text-muted-foreground">{showroom.addressSnippet}</p>}
                                </div>
                            </div>
                            <Separator />
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start space-x-3">
                                    <Phone className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">Contact Phone</h4>
                                        <p className="text-muted-foreground">{contactPhone || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Mail className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">Contact Email</h4>
                                        <p className="text-muted-foreground">{contactEmail || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start space-x-3">
                                    <UserCheck className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">Primary Contact / Manager</h4>
                                        <p className="text-muted-foreground">{mainContact || 'N/A'}</p>
                                    </div>
                                </div>
                                 <div className="flex items-start space-x-3">
                                    <UsersRound className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">Sales Team Size</h4>
                                        <p className="text-muted-foreground">{salespeopleCount} members</p>
                                    </div>
                                </div>
                            </div>
                           <Separator />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start space-x-3">
                                    <CalendarDays className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">Opening Date</h4>
                                        <p className="text-muted-foreground">{formatDate(openingDate)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Activity className="h-5 w-5 text-muted-foreground mt-1 shrink-0" /> {/* Changed Icon for status */}
                                    <div>
                                        <h4 className="font-semibold">Status</h4>
                                        <Badge variant={status === 'Active' ? 'default' : (status === 'Inactive' ? 'destructive' : 'secondary') }>{status}</Badge>
                                    </div>
                                </div>
                            </div>
                            {notes && (<>
                                <Separator />
                                <div>
                                    <h4 className="font-semibold mb-1">Notes</h4>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notes}</p>
                                </div>
                            </>)}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Assigned Manager(s)</CardTitle>
                            {/* <Button variant="outline" size="sm" className="ml-auto">Manage Assignments</Button> */} 
                        </CardHeader>
                        <CardContent>
                            {managers && managers.length > 0 ? (
                                <ul className="space-y-2">
                                    {managers.map(manager => (
                                        <li key={manager.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                            <span className="text-sm font-medium">{manager.name}</span>
                                            <Link href={`/admin/managers/${manager.id}`} className="text-xs text-primary hover:underline">View Profile</Link>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-muted-foreground">No managers explicitly assigned to this showroom via this view.</p>}
                        </CardContent>
                         <CardFooter className="border-t pt-4">
                            <Button variant="outline" className="w-full" disabled> {/* Placeholder */}
                                <Users className="mr-2 h-4 w-4"/> Manage Manager Assignments
                            </Button>
                        </CardFooter>
                    </Card>
                </div>

                {/* Right Column - KPIs and Activity */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center"><LineChart className="h-5 w-5 mr-2 text-primary"/> Key Performance Indicators</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">YTD Sales</span>
                                <span className="font-semibold text-lg">{ytdSales}</span>
                            </div>
                            {kpis && <>
                                <Separator/>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Recent Sales Trend</span>
                                    <Badge variant={kpis.recentSalesTrend === 'up' ? 'default' : (kpis.recentSalesTrend === 'down' ? 'destructive' : 'secondary')}>{kpis.recentSalesTrend}</Badge>
                                </div>
                                <Separator/>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Total Customers</span>
                                    <span className="font-semibold">{kpis.customerCount}</span>
                                </div>
                                <Separator/>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Lead Conversion Rate</span>
                                    <span className="font-semibold">{kpis.leadConversionRate}</span>
                                </div>
                            </>}
                        </CardContent>
                        <CardFooter className="border-t pt-4">
                            <Button variant="link" className="w-full p-0 h-auto text-primary" disabled>View Detailed Analytics</Button> {/* Placeholder */}
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity & Alerts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {recentActivity && recentActivity.length > 0 ? (
                                <ul className="space-y-3">
                                    {recentActivity.map(activity => (
                                        <li key={activity.id} className={`p-2.5 rounded-md border-l-4 ${activity.type === 'alert' ? 'border-destructive bg-destructive/5' : 'border-primary bg-primary/5'}`}>
                                            <p className={`text-sm font-medium ${activity.type === 'alert' ? 'text-destructive-foreground' : 'text-primary-foreground'}`}>{activity.description}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{formatDate(activity.date)}</p>
                                        </li>
                                    ))}
                                </ul>
                            ) : <p className="text-sm text-muted-foreground">No recent activity recorded.</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 