"use client";

import { useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Search, ChevronsUpDown } from 'lucide-react';

export function CustomerFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    
    // Initialize state from URL search params
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [status, setStatus] = useState(searchParams.get('status') || 'all');
    const [interestCategory, setInterestCategory] = useState(searchParams.get('interestCategory') || 'any');
    const [interestLevel, setInterestLevel] = useState(searchParams.get('interestLevel') || 'any');
    const [location, setLocation] = useState(searchParams.get('location') || '');

    const handleApplyFilters = () => {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        if (status !== 'all') params.set('status', status);
        if (interestCategory !== 'any') params.set('interestCategory', interestCategory);
        if (interestLevel !== 'any') params.set('interestLevel', interestLevel);
        if (location) params.set('location', location);
        
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                <div>
                    <label htmlFor="customerSearch" className="block text-sm font-medium text-muted-foreground mb-1.5">Search by Name, Email, Phone</label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="customerSearch" placeholder="e.g., Rohan Mehra..." className="pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
                    </div>
                </div>
                <div>
                    <label htmlFor="statusFilter" className="block text-sm font-medium text-muted-foreground mb-1.5">Lead Status</label>
                    <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger id="statusFilter"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Closed Won', 'Closed Lost'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <Collapsible className="mt-4">
                <CollapsibleTrigger asChild>
                    <Button variant="link" className="p-0 text-sm"><ChevronsUpDown className="h-4 w-4 mr-2" /> Advanced Search</Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-md">
                        <div>
                            <label htmlFor="interestFilter" className="block text-sm font-medium text-muted-foreground mb-1.5">Interest Category</label>
                            <Select value={interestCategory} onValueChange={setInterestCategory}>
                                <SelectTrigger id="interestFilter"><SelectValue placeholder="Any Interest" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="any">Any Interest</SelectItem>
                                    <SelectItem value="Diamond">Diamond</SelectItem>
                                    <SelectItem value="Gold">Gold</SelectItem>
                                    <SelectItem value="Polki">Polki</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label htmlFor="intentFilter" className="block text-sm font-medium text-muted-foreground mb-1.5">Customer Intent</label>
                            <Select value={interestLevel} onValueChange={setInterestLevel}>
                                <SelectTrigger id="intentFilter"><SelectValue placeholder="Any Intent" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="any">Any Intent</SelectItem>
                                    <SelectItem value="Hot">Hot</SelectItem>
                                    <SelectItem value="Warm">Warm</SelectItem>
                                    <SelectItem value="Cold">Cold</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label htmlFor="locationFilter" className="block text-sm font-medium text-muted-foreground mb-1.5">Location (City)</label>
                            <Input id="locationFilter" placeholder="e.g., Jaipur" value={location} onChange={(e) => setLocation(e.target.value)} />
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
            <div className="flex justify-end mt-4">
                <Button onClick={handleApplyFilters}>Apply Filters</Button>
            </div>
        </>
    );
} 