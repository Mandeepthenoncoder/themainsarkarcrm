"use client";

import { useState, useEffect } from 'react';
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
    Store, 
    PlusCircle, 
    Search, 
    Filter, 
    MoreHorizontal, 
    Eye, 
    Edit3, 
    Users, 
    ToggleLeft, 
    ToggleRight, 
    Trash2,
    Loader2
} from 'lucide-react';
import { getShowroomsForAdminView, updateShowroomStatus, ShowroomForAdminView } from './actions';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

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

const getLocationDisplay = (showroom: ShowroomForAdminView) => {
    const parts = [];
    if (showroom.city) parts.push(showroom.city);
    if (showroom.state) parts.push(showroom.state);
    return parts.join(', ') || 'Location not specified';
};

const getAddressDisplay = (showroom: ShowroomForAdminView) => {
    return showroom.location_address || 'Address not specified';
};

export default function ShowroomManagementPage() {
    const [showrooms, setShowrooms] = useState<ShowroomForAdminView[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchShowrooms();
    }, []);

    const fetchShowrooms = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const result = await getShowroomsForAdminView();
            if (result.error) {
                setError(result.error);
            } else {
                setShowrooms(result.showrooms);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load showrooms');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (showroomId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        
        try {
            const result = await updateShowroomStatus(showroomId, newStatus);
            if (result.success) {
                // Update local state
                setShowrooms(prevShowrooms => 
                    prevShowrooms.map(sr => 
                        sr.id === showroomId ? { ...sr, status: newStatus } : sr
                    )
                );
            } else {
                alert(result.error || 'Failed to update showroom status');
            }
        } catch (err: any) {
            alert(err.message || 'Failed to update showroom status');
        }
    };

    const filteredShowrooms = showrooms.filter(sr => {
        const matchesSearch = sr.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              sr.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              getLocationDisplay(sr).toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (sr.manager?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
        const matchesStatus = statusFilter === "all" || sr.status.toLowerCase() === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin mr-2" />
                Loading showrooms...
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-10">
                <div className="text-destructive text-lg mb-2">{error}</div>
                <Button onClick={fetchShowrooms}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="bg-card shadow-sm rounded-lg p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Store className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Showroom Management</h1>
                            <p className="text-muted-foreground mt-1">View, add, and manage all your business locations.</p>
                        </div>
                    </div>
                    <Link href="/admin/showrooms/new" passHref>
                        <Button className="w-full md:w-auto">
                            <PlusCircle className="h-4 w-4 mr-2" /> Add New Showroom
                        </Button>
                    </Link>
                </div>
            </header>

            {/* Filters and Search Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center"><Filter className="h-5 w-5 mr-2"/> Filter & Search Showrooms</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 md:space-y-0 md:flex md:items-end md:gap-4">
                    <div className="flex-grow">
                        <label htmlFor="showroomSearch" className="block text-sm font-medium text-muted-foreground mb-1.5">Search by Name, ID, Location, Manager</label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                id="showroomSearch" 
                                placeholder="e.g., Ahmedabad, SR001, Manager name..." 
                                className="pl-8" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="md:w-1/4">
                        <label htmlFor="statusFilter" className="block text-sm font-medium text-muted-foreground mb-1.5">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger id="statusFilter"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button variant="ghost" onClick={() => { setSearchTerm(""); setStatusFilter("all"); }}>Clear</Button>
                </CardContent>
            </Card>

            {/* Showrooms Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Showroom List ({filteredShowrooms.length})</CardTitle>
                    <CardDescription>Overview of all registered showrooms.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[200px]">Name</TableHead>
                                    <TableHead className="min-w-[150px]">Location</TableHead>
                                    <TableHead>Manager</TableHead>
                                    <TableHead className="text-center">Salespeople</TableHead>
                                    <TableHead className="text-right">YTD Sales</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead>Date Added</TableHead>
                                    <TableHead className="text-right w-[80px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredShowrooms.length > 0 ? filteredShowrooms.map((sr) => (
                                    <TableRow key={sr.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium">
                                            <Link href={`/admin/showrooms/${sr.id}`} className="hover:underline text-primary">
                                                {sr.name}
                                            </Link>
                                            <p className="text-xs text-muted-foreground block md:hidden">{getAddressDisplay(sr)}</p>
                                        </TableCell>
                                        <TableCell>
                                            {getLocationDisplay(sr)}
                                            <p className="text-xs text-muted-foreground hidden md:block">{getAddressDisplay(sr)}</p>
                                        </TableCell>
                                        <TableCell>
                                            {sr.manager?.full_name || 'No Manager Assigned'}
                                            {sr.manager?.email && (
                                                <p className="text-xs text-muted-foreground">{sr.manager.email}</p>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">{sr.salesperson_count}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {sr.ytd_sales > 0 ? formatCurrency(sr.ytd_sales) : '₹0'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge 
                                                variant={sr.status === 'active' ? 'default' : 'destructive'} 
                                                className="cursor-pointer text-xs" 
                                                onClick={() => handleToggleStatus(sr.id, sr.status)}
                                            >
                                                {sr.status.charAt(0).toUpperCase() + sr.status.slice(1)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(sr.created_at)}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/showrooms/${sr.id}`}><Eye className="mr-2 h-4 w-4"/>View Details</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/showrooms/${sr.id}/edit`}><Edit3 className="mr-2 h-4 w-4"/>Edit Showroom</Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                         <Users className="mr-2 h-4 w-4"/>Manage Managers
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(sr.id, sr.status)}>
                                                        {sr.status === 'active' ? <ToggleLeft className="mr-2 h-4 w-4 text-destructive"/> : <ToggleRight className="mr-2 h-4 w-4 text-success"/>}
                                                        {sr.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4"/>Delete Showroom
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                            No showrooms found matching your criteria.
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