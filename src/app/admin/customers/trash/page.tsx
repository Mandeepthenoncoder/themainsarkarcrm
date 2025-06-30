import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, RotateCcw, ArrowLeft, AlertTriangle, User, Clock } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getDeletedCustomers, DeletedCustomer } from './actions';
import { RestoreCustomerButton } from '@/components/customers/RestoreCustomerButton';
import { PermanentDeleteButton } from '@/components/customers/PermanentDeleteButton';

const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return dateString;
    }
};

const getTimeAgo = (dateString: string) => {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    } catch {
        return 'Unknown';
    }
};

export default async function AdminCustomersTrashPage() {
    const { customers, error } = await getDeletedCustomers();

    if (error) {
        return <div className="p-6 text-red-500">Error fetching deleted customers: {error}</div>;
    }

    return (
        <div className="space-y-6">
            <header className="bg-card shadow-sm rounded-lg p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Trash2 className="h-8 w-8 text-destructive" />
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Customer Trash</h1>
                            <p className="text-muted-foreground mt-1">
                                Recently deleted customers - restore or permanently delete
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/admin/customers">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Customers
                            </Link>
                        </Button>
                    </div>
                </div>
            </header>

            {customers.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <Trash2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Trash is Empty</h3>
                        <p className="text-muted-foreground mb-4">
                            No customers have been deleted recently.
                        </p>
                        <Button variant="outline" asChild>
                            <Link href="/admin/customers">View All Customers</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-destructive" />
                                    Deleted Customers ({customers.length})
                                </CardTitle>
                                <CardDescription>
                                    Customers can be restored or permanently deleted
                                </CardDescription>
                            </div>
                            <Badge variant="destructive" className="gap-1">
                                <Clock className="h-3 w-3" />
                                Recently Deleted
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[60px] hidden sm:table-cell">Avatar</TableHead>
                                        <TableHead className="min-w-[180px]">Customer</TableHead>
                                        <TableHead className="min-w-[200px]">Contact</TableHead>
                                        <TableHead className="min-w-[150px]">Showroom</TableHead>
                                        <TableHead className="min-w-[150px]">Salesperson</TableHead>
                                        <TableHead>Purchase Amount</TableHead>
                                        <TableHead>Deleted</TableHead>
                                        <TableHead>Deleted By</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.map((customer) => (
                                        <TableRow key={customer.id} className="bg-destructive/5">
                                            <TableCell className="hidden sm:table-cell">
                                                <Avatar className="h-9 w-9 opacity-60">
                                                    <AvatarFallback className="text-xs bg-destructive/10">
                                                        {customer.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-muted-foreground line-through">
                                                        {customer.full_name}
                                                    </span>
                                                    <Badge variant="destructive" className="text-xs">
                                                        Deleted
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs text-muted-foreground">{customer.email}</div>
                                                {customer.phone_number && (
                                                    <div className="text-xs text-muted-foreground">{customer.phone_number}</div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {customer.assigned_showroom?.name || 'Unassigned'}
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {customer.salesperson?.full_name || 'Unassigned'}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {customer.purchase_amount && customer.purchase_amount > 0 ? (
                                                    <span className="font-semibold text-green-600">
                                                        ₹{customer.purchase_amount.toLocaleString('en-IN')}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                <div>{formatDate(customer.deleted_at)}</div>
                                                <div className="text-destructive font-medium">
                                                    {getTimeAgo(customer.deleted_at)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs">
                                                {customer.deleted_by_admin ? (
                                                    <div>
                                                        <div className="font-medium">{customer.deleted_by_admin.full_name}</div>
                                                        <div className="text-muted-foreground">{customer.deleted_by_admin.email}</div>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">Unknown</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex gap-1 justify-center">
                                                    <RestoreCustomerButton
                                                        customerId={customer.id}
                                                        customerName={customer.full_name || 'Unknown'}
                                                        size="icon"
                                                    />
                                                    <PermanentDeleteButton
                                                        customerId={customer.id}
                                                        customerName={customer.full_name || 'Unknown'}
                                                        customerEmail={customer.email}
                                                        size="icon"
                                                    />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
} 