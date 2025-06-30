"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
    ChevronLeft, User, Mail, Phone, Home, FileText, Store, UserCheck, ListOrdered, Tag, Activity, AlertTriangle, Edit3, CalendarPlus, ArrowLeft, Info, Users, Gift, ShoppingBag, Heart, MessageSquare, Edit, Eye, Briefcase, MapPin, Star, Clock, TrendingUp, CalendarCheck, ShieldAlert, Target, KeyRound, Trash2
} from 'lucide-react';
import { getCustomerDetailsForAdmin, CustomerDetailForAdmin } from './actions';
import { AddVisitLogDialog } from '@/components/customers/AddVisitLogDialog';
import { AddCallLogDialog } from '@/components/customers/AddCallLogDialog';
import { EditableLeadStatus } from '@/components/customers/EditableLeadStatus';
import { EditableInterestLevel } from '@/components/customers/EditableInterestLevel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

// This is now a comprehensive view matching the salesperson's detail page.

const getFollowUpStatus = (dateString: string | null): { text: string; className: string; isActionable: boolean, date: string | null } => {
  if (!dateString) return { text: 'Not set', className: 'text-muted-foreground', isActionable: false, date: null };
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  const parts = dateString.split('-');
  const followUpDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  followUpDate.setHours(0,0,0,0);
  const formattedDate = followUpDate.toLocaleDateString();
  if (followUpDate < today) return { text: `Overdue`, className: 'text-red-600 font-semibold', isActionable: true, date: formattedDate };
  if (followUpDate.getTime() === today.getTime()) return { text: `Today`, className: 'text-orange-500 font-semibold', isActionable: true, date: formattedDate };
  return { text: `Upcoming`, className: 'text-green-600', isActionable: true, date: formattedDate };
};

export default function AdminCustomerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const customerId = params.customerId as string;
    
    const [customer, setCustomer] = useState<CustomerDetailForAdmin | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (customerId) {
            setIsLoading(true);
            getCustomerDetailsForAdmin(customerId)
                .then(result => {
                    if (result.error || !result.customer) {
                        setError(result.error || 'Customer not found.');
                    } else {
                        setCustomer(result.customer);
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [customerId]);

    if (isLoading) return <div className="flex items-center justify-center h-64"><Activity className="h-8 w-8 animate-spin mr-2" /> Loading customer details...</div>;
    if (error) return <div className="text-center py-10"><AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" /><p className="text-destructive text-lg mb-2">{error}</p><Button onClick={() => router.push('/admin/customers')}>Back to Customers List</Button></div>;
    if (!customer) return <div className="text-center py-10">Customer data is unavailable.</div>;
    
    const fullAddress = [customer.address_street, customer.address_city, customer.address_state, customer.address_zip, customer.address_country].filter(Boolean).join(', ');

    return (
        <div className="space-y-6 lg:space-y-8 p-4 md:p-6">
            <header className="bg-card shadow-sm rounded-lg p-6">
                <div className="flex flex-wrap justify-between items-start gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center flex-wrap gap-x-3 gap-y-1">
                    <span>{customer.full_name || 'N/A'}</span>
                    {/* Admins can view status, but may not have edit rights on this page */}
                    <Badge>{customer.lead_status}</Badge>
                    <Badge variant="secondary">{customer.interest_level}</Badge>
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">Customer ID: {customer.id}</p>
                </div>
                <Button variant="outline" asChild>
                    <Link href="/admin/customers"><ArrowLeft className="h-4 w-4 mr-2"/> Back to Customer List</Link>
                </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                    <Card>
                        <CardHeader className="flex flex-row justify-between items-center">
                        <CardTitle>Customer Information</CardTitle>
                        <Link href={`/admin/customers/${customerId}/edit`}>
                            <Button variant="outline" size="sm"><Edit3 className="h-4 w-4 mr-2" />Edit Customer</Button>
                        </Link>
                        </CardHeader>
                        <CardContent>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                             <div><dt className="text-xs font-medium text-muted-foreground">Full Name</dt><dd className="mt-0.5 text-sm">{customer.full_name || 'N/A'}</dd></div>
                             <div><dt className="text-xs font-medium text-muted-foreground">Lead Status</dt><dd className="mt-0.5 text-sm"><Badge>{customer.lead_status || 'N/A'}</Badge></dd></div>
                             <div><dt className="text-xs font-medium text-muted-foreground">Email</dt><dd className="mt-0.5 text-sm">{customer.email || 'N/A'}</dd></div>
                             <div><dt className="text-xs font-medium text-muted-foreground">Phone</dt><dd className="mt-0.5 text-sm">{customer.phone_number || 'N/A'}</dd></div>
                             {fullAddress && <div className="md:col-span-2"><dt className="text-xs font-medium text-muted-foreground">Address</dt><dd className="mt-0.5 text-sm">{fullAddress}</dd></div>}
                             {customer.catchment_area && <div><dt className="text-xs font-medium text-muted-foreground">Catchment Area</dt><dd className="mt-0.5 text-sm">{customer.catchment_area}</dd></div>}
                             
                             {customer.purchase_amount && customer.purchase_amount > 0 && (
                                 <div className="md:col-span-2 p-3 bg-green-50 border border-green-200 rounded-md">
                                     <dt className="text-xs font-medium text-green-800 flex items-center">💰 Converted Revenue</dt>
                                     <dd className="mt-0.5 text-lg font-semibold text-green-700">₹{customer.purchase_amount.toLocaleString('en-IN')}</dd>
                                     <p className="text-xs text-green-600 mt-1">Customer has made a purchase - counted as converted revenue</p>
                                 </div>
                             )}
                             {customer.community && <div><dt className="text-xs font-medium text-muted-foreground">Community</dt><dd className="mt-0.5 text-sm">{customer.community}</dd></div>}
                             {customer.mother_tongue && <div><dt className="text-xs font-medium text-muted-foreground">Mother Tongue</dt><dd className="mt-0.5 text-sm">{customer.mother_tongue}</dd></div>}
                             {customer.reason_for_visit && <div><dt className="text-xs font-medium text-muted-foreground">Reason for Visit</dt><dd className="mt-0.5 text-sm">{customer.reason_for_visit}</dd></div>}
                             {customer.age_of_end_user && <div><dt className="text-xs font-medium text-muted-foreground">Age of End User</dt><dd className="mt-0.5 text-sm">{customer.age_of_end_user}</dd></div>}
                             {customer.monthly_saving_scheme_status && <div><dt className="text-xs font-medium text-muted-foreground">Monthly Saving Scheme</dt><dd className="mt-0.5 text-sm">{customer.monthly_saving_scheme_status}</dd></div>}
                        </dl>
                        </CardContent>
                    </Card>

                    {customer.notes && (
                        <Card>
                            <CardHeader><CardTitle>Salesperson Notes</CardTitle></CardHeader>
                            <CardContent><p className="text-sm whitespace-pre-wrap">{customer.notes}</p></CardContent>
                        </Card>
                    )}

                    {customer.manager_notes && (
                        <Card>
                            <CardHeader><CardTitle>Manager Notes</CardTitle></CardHeader>
                            <CardContent><p className="text-sm whitespace-pre-wrap">{customer.manager_notes}</p></CardContent>
                        </Card>
                    )}

                    {/* Customer Preferences Cards */}

                    {customer.interest_categories_json && customer.interest_categories_json.length > 0 && (
                        <Card>
                        <CardHeader><CardTitle>Interest Categories</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {customer.interest_categories_json.map((interest: any, index: number) => (
                            <div key={index} className="p-3 border rounded-md">
                                <h4 className="font-semibold">{interest.category_type || 'Uncategorized'}</h4>
                                {interest.products?.map((product: any, pIndex: number) => (
                                <div key={pIndex} className="text-sm ml-2">
                                    <p><strong>Product:</strong> {product.product_name}</p>
                                    <p><strong>Price Range:</strong> {product.price_range}</p>
                                </div>
                                ))}
                                {interest.customer_preferences && (
                                <div className="mt-3 pt-3 border-t">
                                    <h5 className="font-semibold text-sm">Preferences</h5>
                                    <ul className="list-disc list-inside text-sm">
                                        {interest.customer_preferences.design_selected && <li>Selected a design</li>}
                                        {/* etc. */}
                                    </ul>
                                </div>
                                )}
                            </div>
                            ))}
                        </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardHeader><CardTitle>Interaction Logs</CardTitle></CardHeader>
                        <CardContent>
                        <Tabs defaultValue="visits">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="visits">Visit Logs</TabsTrigger>
                                <TabsTrigger value="calls">Call Logs</TabsTrigger>
                            </TabsList>
                            <TabsContent value="visits">
                                <ScrollArea className="h-72 w-full rounded-md border p-4">
                                    {customer.visit_logs && customer.visit_logs.length > 0 ? (
                                    <ul className="space-y-4">
                                        {customer.visit_logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log: any) => (
                                        <li key={log.id} className="p-3 bg-muted/20 rounded-md border">
                                            <p className="text-xs text-muted-foreground">{new Date(log.date).toLocaleString()}</p>
                                            <p className="text-sm mt-1">{log.notes}</p>
                                        </li>
                                        ))}
                                    </ul>
                                    ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No visit logs recorded.</p>
                                    )}
                                </ScrollArea>
                            </TabsContent>
                            <TabsContent value="calls">
                                 <ScrollArea className="h-72 w-full rounded-md border p-4">
                                    {customer.call_logs && customer.call_logs.length > 0 ? (
                                    <ul className="space-y-4">
                                        {customer.call_logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log: any) => (
                                        <li key={log.id} className="p-3 bg-muted/20 rounded-md border">
                                            <div className="flex justify-between items-start">
                                                <p className="text-xs text-muted-foreground">{new Date(log.date).toLocaleString()}</p>
                                                <div>
                                                    {log.call_type && <Badge variant="outline" className="text-xs">{log.call_type}</Badge>}
                                                    {log.duration_minutes && <Badge variant="secondary" className="text-xs ml-2">{log.duration_minutes} min</Badge>}
                                                </div>
                                            </div>
                                            <p className="text-sm mt-1">{log.notes}</p>
                                        </li>
                                        ))}
                                    </ul>
                                    ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No call logs recorded.</p>
                                    )}
                                </ScrollArea>
                            </TabsContent>
                        </Tabs>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-1 space-y-6 lg:space-y-8">
                     <Card>
                        <CardHeader><CardTitle>Key Dates & Follow-up</CardTitle></CardHeader>
                        <CardContent>
                        <dl className="grid grid-cols-1 gap-y-4">
                             {customer.birth_date && <div><dt className="text-xs font-medium">Birth Date</dt><dd className="text-sm">{customer.birth_date}</dd></div>}
                             {customer.anniversary_date && <div><dt className="text-xs font-medium">Anniversary Date</dt><dd className="text-sm">{customer.anniversary_date}</dd></div>}
                             <div><dt className="text-xs font-medium">Follow-up Status</dt><dd className={`text-sm ${getFollowUpStatus(customer.follow_up_date).className}`}>{getFollowUpStatus(customer.follow_up_date).text}</dd></div>
                        </dl>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Additional Info</CardTitle></CardHeader>
                        <CardContent>
                           <dl className="grid grid-cols-1 gap-y-4">
                                <div><dt className="text-xs font-medium">Lead Source</dt><dd className="text-sm">{customer.lead_source || 'N/A'}</dd></div>
                                <div><dt className="text-xs font-medium">Assigned Salesperson</dt><dd className="text-sm">{customer.profiles?.full_name || 'N/A'}</dd></div>
                                <div><dt className="text-xs font-medium">Supervising Manager</dt><dd className="text-sm">{customer.profiles?.manager?.full_name || 'N/A'}</dd></div>
                                <div><dt className="text-xs font-medium">Assigned Showroom</dt><dd className="text-sm">{customer.showrooms?.name || 'N/A'}</dd></div>
                                <div><dt className="text-xs font-medium">Date Added</dt><dd className="text-sm">{customer.created_at}</dd></div>
                                <div><dt className="text-xs font-medium">Last Updated</dt><dd className="text-sm">{customer.updated_at}</dd></div>
                           </dl>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
} 