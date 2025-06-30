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
    MapPin, 
    Phone, 
    Mail, 
    CalendarDays, 
    Users, 
    UserCheck, 
    UsersRound, 
    Activity, 
    AlertTriangle,
    ChevronLeft,
    Loader2
} from 'lucide-react';
import { getShowroomDetailForAdmin, DetailedShowroom } from '../actions';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
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

const getLocationDisplay = (showroom: DetailedShowroom) => {
    const parts = [];
    if (showroom.city) parts.push(showroom.city);
    if (showroom.state) parts.push(showroom.state);
    return parts.join(', ') || 'Location not specified';
};

const getFullAddress = (showroom: DetailedShowroom) => {
    const parts = [];
    if (showroom.location_address) parts.push(showroom.location_address);
    if (showroom.city) parts.push(showroom.city);
    if (showroom.state) parts.push(showroom.state);
    if (showroom.zip_code) parts.push(showroom.zip_code);
    return parts.join(', ') || 'Address not specified';
};

export default function ShowroomDetailPage() {
    const params = useParams();
    const router = useRouter();
    const showroomId = params.showroomId as string;
    
    const [showroom, setShowroom] = useState<DetailedShowroom | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (showroomId) {
            setIsLoading(true);
            setError(null);
            
            getShowroomDetailForAdmin(showroomId)
                .then(result => {
                    if (result.error) {
                        setError(result.error);
                    } else if (result.showroom) {
                        setShowroom(result.showroom);
                    } else {
                        setError('Showroom not found.');
                    }
                })
                .catch(err => {
                    console.error('Error fetching showroom details:', err);
                    setError('Failed to load showroom details.');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [showroomId]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                Loading showroom details...
            </div>
        );
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
        return <div className="text-center py-10">Showroom data is unavailable.</div>;
    }

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
                        <Store className="h-7 w-7 mr-3 text-primary" /> {showroom.name}
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
                                    <p className="text-muted-foreground">
                                        {getFullAddress(showroom)}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start space-x-3">
                                    <Phone className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">Contact Phone</h4>
                                        <p className="text-muted-foreground">{showroom.phone_number || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Mail className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">Contact Email</h4>
                                        <p className="text-muted-foreground">{showroom.email_address || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start space-x-3">
                                    <UserCheck className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">Manager</h4>
                                        <p className="text-muted-foreground">
                                            {showroom.manager?.full_name || 'No Manager Assigned'}
                                        </p>
                                        {showroom.manager?.email && (
                                            <p className="text-xs text-muted-foreground">{showroom.manager.email}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <UsersRound className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">Sales Team Size</h4>
                                        <p className="text-muted-foreground">{showroom.salesperson_count} members</p>
                                    </div>
                                </div>
                            </div>
                            <Separator />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-start space-x-3">
                                    <CalendarDays className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">Date Established</h4>
                                        <p className="text-muted-foreground">{formatDate(showroom.date_established || undefined)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <Activity className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
                                    <div>
                                        <h4 className="font-semibold">Status</h4>
                                        <Badge variant={showroom.status === 'active' ? 'default' : 'destructive'}>
                                            {showroom.status.charAt(0).toUpperCase() + showroom.status.slice(1)}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sales Team ({showroom.salespeople.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {showroom.salespeople && showroom.salespeople.length > 0 ? (
                                <div className="space-y-2">
                                    {showroom.salespeople.map((salesperson) => (
                                        <div key={salesperson.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                                            <div>
                                                <span className="text-sm font-medium">{salesperson.full_name || 'Unknown Name'}</span>
                                                {salesperson.email && (
                                                    <p className="text-xs text-muted-foreground">{salesperson.email}</p>
                                                )}
                                                {salesperson.employee_id && (
                                                    <p className="text-xs text-muted-foreground">ID: {salesperson.employee_id}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={salesperson.status === 'active' ? 'default' : 'secondary'}>
                                                    {salesperson.status}
                                                </Badge>
                                                <Link 
                                                    href={`/admin/salespeople/${salesperson.id}`} 
                                                    className="text-xs text-primary hover:underline"
                                                >
                                                    View Profile
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">No salespeople assigned to this showroom.</p>
                            )}
                        </CardContent>
                        <CardFooter className="border-t pt-4">
                            <Link href={`/admin/salespeople?showroom=${showroomId}`} className="w-full">
                                <Button variant="outline" className="w-full">
                                    <Users className="mr-2 h-4 w-4"/> Manage Sales Team
                                </Button>
                            </Link>
                        </CardFooter>
                    </Card>
                </div>

                {/* Right Column - KPIs */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Activity className="h-5 w-5 mr-2 text-primary"/>
                                Performance Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">YTD Sales</span>
                                <span className="font-semibold text-lg">
                                    {showroom.ytd_sales > 0 ? formatCurrency(showroom.ytd_sales) : '₹0'}
                                </span>
                            </div>
                            <Separator/>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Active Salespeople</span>
                                <span className="font-semibold">{showroom.salesperson_count}</span>
                            </div>
                            <Separator/>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Created</span>
                                <span className="font-semibold text-sm">{formatDate(showroom.created_at)}</span>
                            </div>
                            <Separator/>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Last Updated</span>
                                <span className="font-semibold text-sm">{formatDate(showroom.updated_at)}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="border-t pt-4">
                            <Button variant="link" className="w-full p-0 h-auto text-primary" disabled>
                                View Detailed Analytics
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Operating Hours</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {showroom.operating_hours ? (
                                <div className="text-sm">
                                    <pre className="text-muted-foreground whitespace-pre-wrap">
                                        {JSON.stringify(showroom.operating_hours, null, 2)}
                                    </pre>
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground">Operating hours not specified.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 