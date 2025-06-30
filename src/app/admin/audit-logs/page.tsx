"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // Added for action type badges
import {
    ListChecks, 
    Search, 
    Filter, 
    CalendarIcon, // For date picker trigger
    Eye
} from 'lucide-react';
// Popover and Calendar would be needed for a real date picker
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { Calendar } from "@/components/ui/calendar";
// import { format } from "date-fns";

interface AuditLogEntry {
    id: string;
    timestamp: string; // ISO string or formatted date string
    userId?: string; // ID of the user performing the action
    userName?: string; // Name of the user
    actionType: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "VIEW" | "SYSTEM";
    entityType?: string; // e.g., Showroom, Manager, Customer
    entityId?: string; // ID of the affected entity
    entityName?: string; // Optional: Name of the entity for easier display
    description: string; // Short description of the action
    details?: Record<string, any>; // e.g., old values vs new values for UPDATE
}

// Placeholder data
const initialAuditLogs: AuditLogEntry[] = [
    {
        id: 'log001', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), userId: 'admin01', userName: 'Admin User',
        actionType: 'UPDATE', entityType: 'Showroom', entityId: 'sr001', entityName: 'Jaipur Flagship Store',
        description: 'Updated showroom status to Inactive.',
        details: { old: { status: 'Active' }, new: { status: 'Inactive' } }
    },
    {
        id: 'log002', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), userId: 'mgr001', userName: 'Ms. Priya Sharma',
        actionType: 'CREATE', entityType: 'Appointment', entityId: 'apt056', entityName: 'Consultation with Mr. R. Singh',
        description: 'Scheduled new appointment for customer.'
    },
    {
        id: 'log003', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), userId: 'system', 
        actionType: 'SYSTEM', entityType: 'Backup',
        description: 'Automated system backup completed successfully.'
    },
    {
        id: 'log004', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), userId: 'sales002', userName: 'Binita Das',
        actionType: 'LOGIN',
        description: 'User Binita Das logged in from IP 192.168.1.10.'
    },
     {
        id: 'log005', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), userId: 'admin01', userName: 'Admin User',
        actionType: 'CREATE', entityType: 'Manager', entityId: 'mgr005', entityName: 'Mr. Vikram Singh',
        description: 'Created new manager account for Vikram Singh.'
    },
];

const formatDate = (dateString: string, includeTime = true) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const options: Intl.DateTimeFormatOptions = {
            day: '2-digit', month: 'short', year: 'numeric',
            ...(includeTime && { hour: '2-digit', minute: '2-digit', hour12: true })
        };
        return date.toLocaleTimeString('en-GB', options);
    } catch {
        return dateString;
    }
};

const getActionBadgeVariant = (actionType: AuditLogEntry['actionType']) => {
    switch(actionType) {
        case 'CREATE': return 'default'; // Often green
        case 'UPDATE': return 'secondary'; // Often blue or yellow
        case 'DELETE': return 'destructive'; // Often red
        case 'LOGIN': return 'outline';
        case 'LOGOUT': return 'outline';
        case 'VIEW': return 'outline';
        case 'SYSTEM': return 'outline';
        default: return 'secondary';
    }
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLogEntry[]>(initialAuditLogs);
    const [searchTerm, setSearchTerm] = useState("");
    // Placeholder states for filters - a real date range picker would be more complex
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [userFilter, setUserFilter] = useState("");
    const [actionTypeFilter, setActionTypeFilter] = useState("all");
    const [entityTypeFilter, setEntityTypeFilter] = useState("all");

    const filteredLogs = logs.filter(log => {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = log.description.toLowerCase().includes(searchLower) ||
                              (log.userName && log.userName.toLowerCase().includes(searchLower)) ||
                              (log.userId && log.userId.toLowerCase().includes(searchLower)) ||
                              (log.entityName && log.entityName.toLowerCase().includes(searchLower)) ||
                              (log.entityId && log.entityId.toLowerCase().includes(searchLower));

        // Date filtering (basic string comparison, needs improvement for real dates)
        const matchesDateFrom = dateFrom === "" || new Date(log.timestamp) >= new Date(dateFrom);
        const matchesDateTo = dateTo === "" || new Date(log.timestamp) <= new Date(dateTo + "T23:59:59.999Z"); // include whole day for 'to' date

        const matchesUser = userFilter === "" || 
                            (log.userId && log.userId.toLowerCase().includes(userFilter.toLowerCase())) ||
                            (log.userName && log.userName.toLowerCase().includes(userFilter.toLowerCase()));
        
        const matchesActionType = actionTypeFilter === "all" || log.actionType.toLowerCase() === actionTypeFilter;
        const matchesEntityType = entityTypeFilter === "all" || (log.entityType && log.entityType.toLowerCase() === entityTypeFilter);

        return matchesSearch && matchesDateFrom && matchesDateTo && matchesUser && matchesActionType && matchesEntityType;
    });

    // TODO: Implement actual API calls for fetching/filtering and pagination

    return (
        <div className="space-y-6">
            <header className="bg-card shadow-sm rounded-lg p-6">
                <div className="flex items-center gap-3">
                    <ListChecks className="h-8 w-8 text-primary" />
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">System Audit Logs</h1>
                        <p className="text-muted-foreground mt-1">Track significant activities and changes within the CRM.</p>
                    </div>
                </div>
            </header>

            {/* Filters Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center"><Filter className="h-5 w-5 mr-2"/> Filter Audit Logs</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
                    <div>
                        <label htmlFor="dateFrom" className="block text-sm font-medium text-muted-foreground mb-1.5">Date From</label>
                        <Input id="dateFrom" type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                        {/* Placeholder for actual DateRangePicker */}
                    </div>
                     <div>
                        <label htmlFor="dateTo" className="block text-sm font-medium text-muted-foreground mb-1.5">Date To</label>
                        <Input id="dateTo" type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                    </div>
                     <div>
                        <label htmlFor="userFilter" className="block text-sm font-medium text-muted-foreground mb-1.5">User (ID or Name)</label>
                        <Input id="userFilter" placeholder="e.g., admin01, Priya Sharma" value={userFilter} onChange={e => setUserFilter(e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="actionTypeFilter" className="block text-sm font-medium text-muted-foreground mb-1.5">Action Type</label>
                        <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
                            <SelectTrigger id="actionTypeFilter"><SelectValue placeholder="Filter by action" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                <SelectItem value="create">Create</SelectItem>
                                <SelectItem value="update">Update</SelectItem>
                                <SelectItem value="delete">Delete</SelectItem>
                                <SelectItem value="login">Login</SelectItem>
                                <SelectItem value="logout">Logout</SelectItem>
                                <SelectItem value="view">View</SelectItem>
                                <SelectItem value="system">System</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div>
                        <label htmlFor="entityTypeFilter" className="block text-sm font-medium text-muted-foreground mb-1.5">Entity Type</label>
                        <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                            <SelectTrigger id="entityTypeFilter"><SelectValue placeholder="Filter by entity" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Entities</SelectItem>
                                <SelectItem value="showroom">Showroom</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="salesperson">Salesperson</SelectItem>
                                <SelectItem value="customer">Customer</SelectItem>
                                <SelectItem value="appointment">Appointment</SelectItem>
                                <SelectItem value="task">Task</SelectItem>
                                <SelectItem value="backup">Backup</SelectItem>
                                {/* Add more as needed */}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="xl:col-span-5 sm:col-span-2 col-span-1">
                        <label htmlFor="searchTerm" className="block text-sm font-medium text-muted-foreground mb-1.5">Search in Description/Details</label>
                         <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                id="searchTerm" 
                                placeholder="e.g., status updated, new appointment..." 
                                className="pl-8 w-full" 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Log Entries ({filteredLogs.length})</CardTitle>
                    <CardDescription>Detailed record of system activities.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[180px]">Timestamp</TableHead>
                                    <TableHead className="min-w-[150px]">User</TableHead>
                                    <TableHead className="min-w-[100px] text-center">Action</TableHead>
                                    <TableHead className="min-w-[120px]">Entity Type</TableHead>
                                    <TableHead className="min-w-[200px]">Entity</TableHead>
                                    <TableHead className="min-w-[250px]">Description</TableHead>
                                    <TableHead className="text-right w-[80px]">Details</TableHead> 
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length > 0 ? filteredLogs.map((log) => (
                                    <TableRow key={log.id} className="hover:bg-muted/50 text-xs">
                                        <TableCell>{formatDate(log.timestamp)}</TableCell>
                                        <TableCell>
                                            {log.userName || log.userId || 'N/A'}
                                            {log.userId && <span className="block text-muted-foreground text-[0.7rem]">({log.userId})</span>}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant={getActionBadgeVariant(log.actionType)} className="text-[0.7rem] px-1.5 py-0.5">
                                                {log.actionType}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{log.entityType || 'N/A'}</TableCell>
                                        <TableCell>
                                            {log.entityId ? (
                                                <Link 
                                                    href={`/admin/${log.entityType?.toLowerCase()}s/${log.entityId}`} 
                                                    className="hover:underline text-primary truncate block max-w-[200px]"
                                                    title={log.entityName || log.entityId}
                                                >
                                                    {log.entityName || log.entityId}
                                                </Link>
                                            ) : (log.entityName || 'N/A')}
                                        </TableCell>
                                        <TableCell className="max-w-[300px] truncate" title={log.description}>{log.description}</TableCell>
                                        <TableCell className="text-right">
                                            {log.details && Object.keys(log.details).length > 0 ? (
                                                <Button variant="outline" size="sm" className="h-7 px-2" disabled> {/* Placeholder for modal, changed size to sm and adjusted padding */}
                                                    <Eye className="h-3.5 w-3.5"/>
                                                </Button>
                                            ) : '-'}
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                            No audit logs found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                {/* TODO: Add Pagination Component & Detail Modal */}
            </Card>
        </div>
    );
} 