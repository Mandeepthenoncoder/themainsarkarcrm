import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users2, Filter } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCustomersForAdminView, CustomerForAdminView } from './actions';
import { CustomerFilters } from '@/components/customers/CustomerFilters';

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

const getLeadStatusBadgeVariant = (status: string | null) => {
    switch (status) {
        case 'New Lead': return 'secondary';
        case 'Contacted': return 'outline';
        case 'Qualified': return 'default';
        case 'Proposal Sent': return 'default';
        case 'Negotiation': return 'default';
        case 'Closed Won': return 'default';
        case 'Closed Lost': return 'destructive';
        default: return 'outline';
    }
};

export default async function AdminAllCustomersPage({ 
    searchParams 
}: { 
    searchParams?: { [key: string]: string | undefined }
}) {
    const { customers, error } = await getCustomersForAdminView(searchParams);

    if (error) {
        return <div className="p-6 text-red-500">Error fetching customers: {error}</div>;
    }

    return (
        <div className="space-y-6">
            <header className="bg-card shadow-sm rounded-lg p-6">
                 <div className="flex items-center gap-3">
                    <Users2 className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">All Customers Database</h1>
                        <p className="text-muted-foreground mt-1">View and manage customer records across all showrooms.</p>
                    </div>
                </div>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center"><Filter className="h-5 w-5 mr-2"/> Filter & Search Customers</CardTitle>
                </CardHeader>
                <CardContent>
                    <CustomerFilters />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Customer List ({customers.length})</CardTitle>
                    <CardDescription>Details of all customers in the system.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60px] hidden sm:table-cell">Avatar</TableHead>
                                    <TableHead className="min-w-[180px]">Name</TableHead>
                                    <TableHead className="min-w-[200px]">Contact</TableHead>
                                    <TableHead className="min-w-[150px]">Showroom</TableHead>
                                    <TableHead className="min-w-[150px]">Salesperson</TableHead>
                                    <TableHead className="text-center min-w-[120px]">Lead Status</TableHead>
                                    <TableHead>Date Added</TableHead>
                                    <TableHead>Last Contacted</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.length > 0 ? customers.map((customer) => (
                                    <TableRow key={customer.id} className="hover:bg-muted/50">
                                        <TableCell className="hidden sm:table-cell">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={customer.avatar_url || undefined} alt={customer.full_name || ''} />
                                                <AvatarFallback className="text-xs">
                                                    {customer.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <Link href={`/admin/customers/${customer.id}`} className="hover:underline text-primary">
                                                {customer.full_name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-xs">{customer.email}</div>
                                            {customer.phone_number && <div className="text-xs text-muted-foreground">{customer.phone_number}</div>}
                                        </TableCell>
                                        <TableCell>
                                            {customer.assigned_showroom ? (
                                                <Link href={`/admin/showrooms/${customer.assigned_showroom.id}`} className="text-xs hover:underline">
                                                    {customer.assigned_showroom.name}
                                                </Link>
                                            ) : <span className="text-xs text-muted-foreground italic">Unassigned</span>}
                                        </TableCell>
                                        <TableCell className="text-xs">
                                            {customer.salesperson ? (
                                                <Link href={`/admin/salespeople/${customer.salesperson.id}`} className="hover:underline">
                                                    {customer.salesperson.full_name}
                                                </Link>
                                            ) : <span className="text-muted-foreground italic">Unassigned</span>}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={getLeadStatusBadgeVariant(customer.lead_status)} className="text-xs whitespace-nowrap">
                                                {customer.lead_status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs">{formatDate(customer.created_at)}</TableCell>
                                        <TableCell className="text-xs">{formatDate(customer.last_contacted_date || undefined)}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                            No customers found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
} 