"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from "@/components/ui/dialog";
import {
    Megaphone, // Main icon
    PlusCircle, 
    Search, 
    Filter, 
    Edit, 
    Trash2,
    Pin,
    PinOff,
    Users // for target audience
} from 'lucide-react';

interface Announcement {
    id: string;
    title: string;
    content: string;
    author: string; // Admin name or system
    dateCreated: string;
    lastUpdated?: string;
    status: "Draft" | "Published" | "Archived";
    isPinned: boolean;
    targetAudience: "All Users" | "Managers Only" | "Salespeople Only" | "Specific Showrooms"; // Example targets
    showroomsAffected?: Array<{ id: string; name: string }>; // if target is Specific Showrooms
}

const initialAnnouncements: Announcement[] = [
    {
        id: 'anno001', title: 'New Feature: Advanced Reporting Tools', 
        content: 'We are excited to announce the rollout of new advanced reporting tools available in the Manager and Admin portals. Please familiarize yourselves with these new capabilities.',
        author: 'Admin System', dateCreated: '2024-07-28T10:00:00Z', status: 'Published', isPinned: true, targetAudience: 'All Users'
    },
    {
        id: 'anno002', title: 'Quarterly Sales Targets Discussion', 
        content: 'All showroom managers are requested to attend a mandatory meeting on August 5th to discuss Q4 sales targets.',
        author: 'CRM Admin Team', dateCreated: '2024-07-25T14:30:00Z', status: 'Published', isPinned: false, targetAudience: 'Managers Only'
    },
    {
        id: 'anno003', title: 'Upcoming System Maintenance', 
        content: 'The CRM will undergo scheduled maintenance on August 10th from 2 AM to 4 AM. Access may be intermittent during this period.',
        author: 'Admin System', dateCreated: '2024-07-20T09:00:00Z', status: 'Archived', isPinned: false, targetAudience: 'All Users'
    },
    {
        id: 'anno004', title: 'New Sales Training Module', 
        content: 'A new training module for upselling techniques has been added to the salesperson portal. Completion is mandatory by end of August.',
        author: 'CRM Admin Team', dateCreated: '2024-08-01T11:00:00Z', status: 'Draft', isPinned: false, targetAudience: 'Salespeople Only'
    },
];

const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return dateString; }
};

export default function AdminCommunicationPage() {
    const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [audienceFilter, setAudienceFilter] = useState("all");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAnnouncement, setCurrentAnnouncement] = useState<Partial<Announcement> | null>(null);

    const handleOpenModal = (announcement?: Announcement) => {
        setCurrentAnnouncement(announcement ? {...announcement} : { 
            title: '', content: '', status: 'Draft', isPinned: false, targetAudience: 'All Users', author: 'Admin User' // Default author
        });
        setIsModalOpen(true);
    };

    const handleSaveAnnouncement = () => {
        if (!currentAnnouncement || !currentAnnouncement.title || !currentAnnouncement.content) {
            // Basic validation: add more robust validation as needed
            alert("Title and content are required.");
            return;
        }

        if (currentAnnouncement.id) { // Editing existing
            setAnnouncements(prev => prev.map(a => a.id === currentAnnouncement!.id ? { ...a, ...currentAnnouncement as Announcement, lastUpdated: new Date().toISOString() } : a));
        } else { // Creating new
            const newAnnouncement: Announcement = {
                ...currentAnnouncement,
                id: `anno${Math.random().toString(36).substr(2, 7)}${Date.now().toString(36)}`,
                dateCreated: new Date().toISOString(),
            } as Announcement;
            setAnnouncements(prev => [newAnnouncement, ...prev]);
        }
        setIsModalOpen(false);
        setCurrentAnnouncement(null);
    };
    
    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this announcement?')) {
            setAnnouncements(prev => prev.filter(a => a.id !== id));
        }
    };

    const togglePin = (id: string) => {
        setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, isPinned: !a.isPinned } : a));
    };

    const filteredAnnouncements = announcements
        .filter(a => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = a.title.toLowerCase().includes(searchLower) || a.content.toLowerCase().includes(searchLower);
            const matchesStatus = statusFilter === "all" || a.status.toLowerCase() === statusFilter;
            const matchesAudience = audienceFilter === "all" || a.targetAudience.toLowerCase().replace(" ","") === audienceFilter;
            return matchesSearch && matchesStatus && matchesAudience;
        })
        .sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
        });

    const getStatusBadgeVariant = (status: Announcement['status']) => {
        if (status === 'Published') return 'default';
        if (status === 'Draft') return 'secondary';
        if (status === 'Archived') return 'outline';
        return 'outline';
    };

    return (
        <div className="space-y-6">
            <header className="bg-card shadow-sm rounded-lg p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Megaphone className="h-8 w-8 text-primary" />
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">System Communications</h1>
                            <p className="text-muted-foreground mt-1">Manage and broadcast announcements to users.</p>
                        </div>
                    </div>
                    <Button onClick={() => handleOpenModal()} className="w-full md:w-auto">
                        <PlusCircle className="h-4 w-4 mr-2" /> Create New Announcement
                    </Button>
                </div>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg flex items-center"><Filter className="h-5 w-5 mr-2"/> Filter Announcements</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-1">
                        <label htmlFor="announceSearch" className="block text-sm font-medium text-muted-foreground mb-1.5">Search by Title/Content</label>
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input id="announceSearch" placeholder="e.g., Maintenance, New Feature..." className="pl-8" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="announceStatusFilter" className="block text-sm font-medium text-muted-foreground mb-1.5">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger id="announceStatusFilter"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="published">Published</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label htmlFor="announceAudienceFilter" className="block text-sm font-medium text-muted-foreground mb-1.5">Target Audience</label>
                        <Select value={audienceFilter} onValueChange={setAudienceFilter}>
                            <SelectTrigger id="announceAudienceFilter"><SelectValue placeholder="Filter by audience" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Audiences</SelectItem>
                                <SelectItem value="allusers">All Users</SelectItem>
                                <SelectItem value="managersonly">Managers Only</SelectItem>
                                <SelectItem value="salespeopleonly">Salespeople Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredAnnouncements.map(ann => (
                    <Card key={ann.id} className={`flex flex-col ${ann.isPinned ? 'border-primary border-2' : ''}`}>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <CardTitle className="text-lg leading-tight flex-1 pr-2">{ann.title}</CardTitle>
                                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => togglePin(ann.id)} title={ann.isPinned ? 'Unpin' : 'Pin'}>
                                    {ann.isPinned ? <PinOff className="h-4 w-4 text-primary" /> : <Pin className="h-4 w-4" />}
                                </Button>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                                <Badge variant={getStatusBadgeVariant(ann.status)} className="text-xs">{ann.status}</Badge>
                                <span>|</span>
                                <Users className="h-3 w-3"/> {ann.targetAudience}
                            </div>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground flex-grow pb-3">
                            <p className="line-clamp-4">{ann.content}</p> 
                        </CardContent>
                        <CardFooter className="flex flex-col items-start gap-2 text-xs text-muted-foreground border-t pt-3">
                            <div className="w-full flex justify-between items-center">
                                <span>By: {ann.author}</span>
                                <div className="flex gap-1">
                                    <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => handleOpenModal(ann)}><Edit className="h-3 w-3 mr-1"/> Edit</Button>
                                    <Button variant="outline" size="sm" className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(ann.id)}><Trash2 className="h-3 w-3 mr-1"/> Delete</Button>
                                </div>
                            </div>
                            <span>Created: {formatDate(ann.dateCreated)}</span>
                            {ann.lastUpdated && <span>Updated: {formatDate(ann.lastUpdated)}</span>}
                        </CardFooter>
                    </Card>
                ))}
                {filteredAnnouncements.length === 0 && (
                    <Card className="md:col-span-2 lg:col-span-3 xl:col-span-4 h-40 flex items-center justify-center">
                        <p className="text-muted-foreground">No announcements found matching your criteria.</p>
                    </Card>
                )}
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{currentAnnouncement?.id ? 'Edit' : 'Create New'} Announcement</DialogTitle>
                        <DialogDescription>
                            {currentAnnouncement?.id ? 'Modify the details of the announcement.' : 'Compose a new announcement for system users.'}
                        </DialogDescription>
                    </DialogHeader>
                    {currentAnnouncement && (
                        <div className="grid gap-4 py-4">
                            <div className="space-y-1.5">
                                <label htmlFor="title" className="text-sm font-medium">Title <span className="text-destructive">*</span></label>
                                <Input id="title" value={currentAnnouncement.title} onChange={e => setCurrentAnnouncement(p => ({...p, title: e.target.value}))} placeholder="Announcement Title" />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="content" className="text-sm font-medium">Content <span className="text-destructive">*</span></label>
                                <Textarea id="content" value={currentAnnouncement.content} onChange={e => setCurrentAnnouncement(p => ({...p, content: e.target.value}))} placeholder="Detailed message..." rows={6} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="targetAudience" className="text-sm font-medium">Target Audience</label>
                                    <Select 
                                        value={currentAnnouncement.targetAudience} 
                                        onValueChange={val => setCurrentAnnouncement(p => ({...p, targetAudience: val as Announcement['targetAudience']}))}
                                    >
                                        <SelectTrigger id="targetAudience"><SelectValue placeholder="Select audience" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="All Users">All Users</SelectItem>
                                            <SelectItem value="Managers Only">Managers Only</SelectItem>
                                            <SelectItem value="Salespeople Only">Salespeople Only</SelectItem>
                                            {/* <SelectItem value="Specific Showrooms" disabled>Specific Showrooms (future)</SelectItem> */}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="status" className="text-sm font-medium">Status</label>
                                    <Select 
                                        value={currentAnnouncement.status} 
                                        onValueChange={val => setCurrentAnnouncement(p => ({...p, status: val as Announcement['status']}))}
                                    >
                                        <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Draft">Draft</SelectItem>
                                            <SelectItem value="Published">Published</SelectItem>
                                            <SelectItem value="Archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                                <input type="checkbox" id="isPinned" checked={currentAnnouncement.isPinned} onChange={e => setCurrentAnnouncement(p => ({...p, isPinned: e.target.checked}))} className="h-4 w-4 accent-primary"/>
                                <label htmlFor="isPinned" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    Pin this announcement?
                                </label>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="button" onClick={handleSaveAnnouncement}>Save Announcement</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 