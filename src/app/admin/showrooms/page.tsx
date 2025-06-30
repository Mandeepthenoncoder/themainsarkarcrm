"use client";

import { useState } from 'react';
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
    ChevronDown, 
    ChevronUp, 
    ChevronsUpDown
} from 'lucide-react';

interface Showroom {
    id: string;
    name: string;
    location: string; // e.g., "Jaipur, Rajasthan"
    addressSnippet: string;
    mainContact: string; // Manager name or primary contact
    salespeopleCount: number;
    ytdSales: string; // Formatted string like "₹25,00,000"
    status: "Active" | "Inactive";
    dateAdded: string;
}

// Placeholder data
const initialShowrooms: Showroom[] = [
    { 
        id: 'sr001', 
        name: 'Jaipur Flagship Store',
        location: 'Jaipur, Rajasthan',
        addressSnippet: '123 Johari Bazaar Rd',
        mainContact: 'Ms. Priya Sharma',
        salespeopleCount: 15,
        ytdSales: '₹25,75,000',
        status: 'Active',
        dateAdded: '2020-01-15'
    },
    { 
        id: 'sr002', 
        name: 'Mumbai Bandra Boutique',
        location: 'Mumbai, Maharashtra',
        addressSnippet: '45 Linking Road, Bandra West',
        mainContact: 'Mr. Anand Verma',
        salespeopleCount: 10,
        ytdSales: '₹18,50,200',
        status: 'Active',
        dateAdded: '2021-03-20'
    },
    { 
        id: 'sr003', 
        name: 'Delhi CP Showroom',
        location: 'Delhi, NCR',
        addressSnippet: 'A-5 Connaught Place',
        mainContact: 'Ms. Sunita Rao',
        salespeopleCount: 12,
        ytdSales: '₹15,10,800',
        status: 'Active',
        dateAdded: '2022-06-10'
    },
    { 
        id: 'sr004', 
        name: 'Bangalore Indiranagar',
        location: 'Bangalore, Karnataka',
        addressSnippet: '100 Feet Road, Indiranagar',
        mainContact: 'Mr. Rajeev Menon',
        salespeopleCount: 8,
        ytdSales: '₹9,80,000',
        status: 'Inactive',
        dateAdded: '2023-01-05'
    },
];

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

export default function ShowroomManagementPage() {
    const [showrooms, setShowrooms] = useState<Showroom[]>(initialShowrooms);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    // TODO: Implement sorting logic
    // const [sortColumn, setSortColumn] = useState<keyof Showroom | null>(null);
    // const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleToggleStatus = (showroomId: string) => {
        setShowrooms(prevShowrooms => 
            prevShowrooms.map(sr => 
                sr.id === showroomId ? { ...sr, status: sr.status === 'Active' ? 'Inactive' : 'Active' } : sr
            )
        );
        // TODO: API call to update status
    };

    const filteredShowrooms = showrooms.filter(sr => {
        const matchesSearch = sr.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              sr.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              sr.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || sr.status.toLowerCase() === statusFilter;
        return matchesSearch && matchesStatus;
    });

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
                        <label htmlFor="showroomSearch" className="block text-sm font-medium text-muted-foreground mb-1.5">Search by Name, ID, Location</label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                id="showroomSearch" 
                                placeholder="e.g., Jaipur, SR001..." 
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
                    {/* <Button><Filter className="h-4 w-4 mr-2"/> Apply</Button>
                    <Button variant="ghost">Clear</Button> */} 
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
                                    <TableHead>Main Contact</TableHead>
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
                                            <p className="text-xs text-muted-foreground block md:hidden">{sr.addressSnippet}</p>
                                        </TableCell>
                                        <TableCell>
                                            {sr.location}
                                            <p className="text-xs text-muted-foreground hidden md:block">{sr.addressSnippet}</p>
                                        </TableCell>
                                        <TableCell>{sr.mainContact}</TableCell>
                                        <TableCell className="text-center">{sr.salespeopleCount}</TableCell>
                                        <TableCell className="text-right font-mono">{sr.ytdSales}</TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={sr.status === 'Active' ? 'default' : 'destructive'} className="cursor-pointer text-xs" onClick={() => handleToggleStatus(sr.id)}>
                                                {sr.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(sr.dateAdded)}</TableCell>
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
                                                    <DropdownMenuItem onClick={() => handleToggleStatus(sr.id)} className="cursor-pointer">
                                                        {sr.status === 'Active' ? <ToggleLeft className="mr-2 h-4 w-4 text-destructive"/> : <ToggleRight className="mr-2 h-4 w-4 text-success"/>}
                                                        {sr.status === 'Active' ? 'Deactivate' : 'Activate'}
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
                {/* TODO: Add Pagination Component */}
            </Card>
        </div>
    );
} 