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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    UserCog, 
    Search, 
    Filter, 
    MoreHorizontal, 
    Eye, 
    Store, 
    UserCircle2, // Icon for Manager
    ShieldAlert // Icon for Flag Account
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSalespeopleForAdminView, SalespersonForAdminView } from './actions';

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
        return dateString;
    }
};

export default async function AdminSalespeopleListPage() {
    const { salespeople, error } = await getSalespeopleForAdminView();

    const getStatusBadgeVariant = (status: string | null) => {
        return status === 'Active' ? 'default' : 'destructive';
    };

    if (error) {
        return <div className="p-6 text-red-500">Error fetching salespeople: {error}</div>;
    }

    return (
        <div className="space-y-6">
            <header className="bg-card shadow-sm rounded-lg p-6">
                <div className="flex items-center gap-3">
                    <UserCog className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Salesperson Account Oversight</h1>
                        <p className="text-muted-foreground mt-1">View and filter salesperson accounts across the system.</p>
                    </div>
                </div>
            </header>

            {/* TODO: Re-implement filtering using Server Components and URL Search Params */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center"><Filter className="h-5 w-5 mr-2"/> Filters</CardTitle>
                    <CardDescription>Filtering will be re-enabled soon.</CardDescription>
                </CardHeader>
            </Card>

            {/* Salespeople Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Salesperson List ({salespeople.length})</CardTitle>
                    <CardDescription>Overview of all salesperson accounts.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[60px] hidden sm:table-cell">Avatar</TableHead>
                                    <TableHead className="min-w-[180px]">Name</TableHead>
                                    <TableHead>Employee ID</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Assigned Showroom</TableHead>
                                    <TableHead>Supervising Manager</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead>Date Hired</TableHead>
                                    <TableHead className="text-right w-[80px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {salespeople.length > 0 ? salespeople.map((sp) => (
                                    <TableRow key={sp.id} className="hover:bg-muted/50">
                                        <TableCell className="hidden sm:table-cell">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={sp.avatar_url || undefined} alt={sp.full_name || ''} />
                                                <AvatarFallback className="text-xs">
                                                    {sp.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <Link href={`/admin/salespeople/${sp.id}`} className="hover:underline text-primary">
                                                {sp.full_name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{sp.employee_id}</TableCell>
                                        <TableCell>{sp.email}</TableCell>
                                        <TableCell>
                                            {sp.assigned_showroom ? (
                                                <Link href={`/admin/showrooms/${sp.assigned_showroom.id}`} className="text-xs hover:underline">
                                                    {sp.assigned_showroom.name}
                                                </Link>
                                            ) : <span className="text-xs text-muted-foreground italic">Unassigned</span>}
                                        </TableCell>
                                        <TableCell>
                                            {sp.supervising_manager ? (
                                                <Link href={`/admin/managers/${sp.supervising_manager.id}`} className="text-xs hover:underline">
                                                    {sp.supervising_manager.full_name}
                                                </Link>
                                            ) : <span className="text-xs text-muted-foreground italic">Unassigned</span>}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={getStatusBadgeVariant(sp.status)} className="text-xs">
                                                {sp.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(sp.created_at)}</TableCell>
                                        <TableCell className="text-right">
                                           {/* Actions will be added back later */}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                            No salespeople found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                {/* TODO: Add Pagination Component */}
            </Card>
        </div>
    );
} 