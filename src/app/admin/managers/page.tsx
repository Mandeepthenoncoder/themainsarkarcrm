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
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
    DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import {
    Users as UsersIcon, // Renamed to avoid conflict with component name
    PlusCircle, 
    Search, 
    Filter, 
    MoreHorizontal, 
    Eye, 
    Edit3, 
    Store, 
    CheckCircle, 
    XCircle, 
    Clock, 
    KeyRound, 
    Trash2,
    UserPlus
} from 'lucide-react';
import { getManagersForAdminView, ManagerForAdminView } from './actions';

interface Manager {
    id: string;
    name: string;
    employeeId: string;
    email: string;
    assignedShowrooms: Array<{ id: string; name: string }>;
    salespeopleSupervised: number;
    status: "Active" | "Pending Approval" | "Suspended";
    dateJoined: string;
    avatarUrl?: string; // Optional: for an avatar image
}

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

export default async function ManagerAccountsPage() {
    const { managers, error } = await getManagersForAdminView();

    // The client-side filtering logic is no longer needed here as we will use search params.
    // For now, we will just display the fetched data.

    const getStatusBadgeVariant = (status: string | null) => {
        switch (status) {
            case 'Active': return 'default';
            case 'Pending Approval': return 'secondary';
            case 'Suspended': return 'destructive';
            default: return 'outline';
        }
    };

    if (error) {
        return <div className="p-6 text-red-500">Error fetching managers: {error}</div>;
    }

    return (
        <div className="space-y-6">
            <header className="bg-card shadow-sm rounded-lg p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <UsersIcon className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Manager Account Management</h1>
                            <p className="text-muted-foreground mt-1">Oversee all manager accounts in the system.</p>
                        </div>
                    </div>
                    <Link href="/admin/managers/new" passHref>
                        <Button className="w-full md:w-auto">
                            <UserPlus className="h-4 w-4 mr-2" /> Add New Manager
                        </Button>
                    </Link>
                </div>
            </header>

            {/* TODO: Re-implement filtering using Server Components and URL Search Params */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center"><Filter className="h-5 w-5 mr-2"/> Filters</CardTitle>
                    <CardDescription>Filtering will be re-enabled soon.</CardDescription>
                </CardHeader>
            </Card>

            {/* Managers Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Manager List ({managers.length})</CardTitle>
                    <CardDescription>Details of all registered managers.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px] hidden sm:table-cell">Avatar</TableHead>
                                    <TableHead className="min-w-[180px]">Name</TableHead>
                                    <TableHead className="min-w-[120px]">Employee ID</TableHead>
                                    <TableHead className="min-w-[200px]">Email</TableHead>
                                    <TableHead className="min-w-[180px]">Assigned Showroom(s)</TableHead>
                                    <TableHead className="text-center">Supervising</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead>Date Joined</TableHead>
                                    <TableHead className="text-right w-[80px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {managers.length > 0 ? managers.map((manager) => (
                                    <TableRow key={manager.id} className="hover:bg-muted/50">
                                        <TableCell className="hidden sm:table-cell">
                                            {manager.avatar_url ? (
                                                <img src={manager.avatar_url} alt={manager.full_name || ''} className="h-10 w-10 rounded-full object-cover"/>
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs">
                                                    {manager.full_name?.split(' ').map(n=>n[0]).join('').toUpperCase()}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <Link href={`/admin/managers/${manager.id}`} className="hover:underline text-primary">
                                                {manager.full_name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{manager.employee_id}</TableCell>
                                        <TableCell>{manager.email}</TableCell>
                                        <TableCell>
                                            {manager.assigned_showrooms && manager.assigned_showrooms.length > 0 
                                                ? manager.assigned_showrooms.map(sr => sr.name).join(', ') 
                                                : <span className="text-xs text-muted-foreground italic">Unassigned</span>}
                                        </TableCell>
                                        <TableCell className="text-center">{manager.salespeople_supervised_count}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={getStatusBadgeVariant(manager.status)} className="text-xs">
                                                {manager.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(manager.created_at)}</TableCell>
                                        <TableCell className="text-right">
                                            {/* Actions Dropdown Here - actions will need to be server actions */}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                            No managers found.
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