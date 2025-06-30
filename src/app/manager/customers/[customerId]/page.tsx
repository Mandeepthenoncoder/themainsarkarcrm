"use client";

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, User, Mail, Phone, Briefcase, DollarSign, MessageSquare, Edit2, Layers, NotebookPen, ShieldCheck } from 'lucide-react';

// TODO: Fetch actual customer data based on params.customerId and also their salesperson-added notes
const placeholderCustomer = {
  id: 'cust101',
  firstName: 'Aarav',
  lastName: 'Patel',
  email: 'aarav.patel@example.com',
  phoneNumber: '+91 98765 43210',
  address: '123 Diamond St, Mumbai, MH 400001',
  occasion: 'Anniversary',
  budgetRange: '₹80,000 - ₹1,50,000',
  preferences: 'Interested in platinum rings, diamond clarity VVS1+, modern designs.',
  nextVisitDate: '2024-07-25',
  status: 'Warm', // Lead status: New, Warm, Hot, Cold, Converted, Lost etc.
  addedBySalespersonId: 'sp1',
  assignedSalespersonName: "Aisha Sharma",
  showroom_id: 'sr1',
  salespersonNotes: [
    { id: 'note1', date: '2024-07-10', text: 'First visit. Showed interest in engagement rings. Budget around 1.2L. Scheduled follow-up.', salesperson: 'Aisha Sharma' },
    { id: 'note2', date: '2024-07-05', text: 'Initial inquiry via website. Looking for wedding jewelry for wife.', salesperson: 'Aisha Sharma' },
  ],
  managerNotes: [
      { id: 'mnote1', date: '2024-07-11', text: 'Salesperson mentioned high potential. Monitor closely. Override status to Warm based on my assessment.', manager: 'Manager Name'}
  ]
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'hot': return 'bg-primary/10 text-primary';
    case 'warm': return 'bg-warning/10 text-yellow-600';
    case 'cold': return 'bg-sky-100 text-sky-700';
    case 'new': return 'bg-success/10 text-success';
    case 'converted': return 'bg-purple-600/10 text-purple-700';
    default: return 'bg-muted text-muted-foreground';
  }
};

export default function ManagerCustomerDetailPage() {
  const params = useParams<{ customerId: string }>();
  const customer = placeholderCustomer; // Replace with actual data fetching
  
  const [managerNoteText, setManagerNoteText] = useState('');
  const [currentStatus, setCurrentStatus] = useState(customer?.status || '');

  if (!customer) {
    return <div>Loading customer details...</div>;
  }

  const handleAddManagerNote = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!managerNoteText.trim()) return;
    console.log(`Manager adding note for customer ${params.customerId}:`, managerNoteText);
    // TODO: Implement actual Supabase call to save the manager's note (ensure it's distinct from salesperson notes)
    // placeholderCustomer.managerNotes.unshift({ id: `mnote${Date.now()}`, date: new Date().toISOString().split('T')[0], text: managerNoteText, manager: 'Current Manager' });
    setManagerNoteText('');
  };

  const handleStatusOverride = () => {
    console.log(`Manager overriding status for customer ${params.customerId} to:`, currentStatus);
    // TODO: Implement actual Supabase call to update customer status, logging the change by manager
    // customer.status = currentStatus; // Update local placeholder
    alert(`Status for ${customer.firstName} ${customer.lastName} updated to ${currentStatus} by manager.`);
  };

  return (
    <div className="space-y-6">
      <header className="bg-card shadow-sm rounded-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <Link href="/manager/customers">
                    <Button variant="outline" size="icon" className="h-9 w-9">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Back to Showroom Customers</span>
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground flex items-center">
                        {customer.firstName} {customer.lastName}
                        <span className={`ml-3 px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(customer.status)}`}>
                            {customer.status} (Current)
                        </span>
                    </h1>
                    <p className="text-muted-foreground mt-1">Customer ID: {params.customerId} | Assigned to: {customer.assignedSalespersonName}</p>
                </div>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Customer Details & Manager Actions */}
        <div className="lg:col-span-1 space-y-6">
            <section className="bg-card shadow-sm rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Customer Details (Read-Only)</h2>
                <dl className="space-y-3 text-sm">
                    <div><dt className="text-xs font-medium text-muted-foreground">Full Name</dt><dd className="mt-0.5 text-foreground">{customer.firstName} {customer.lastName}</dd></div>
                    <div><dt className="text-xs font-medium text-muted-foreground">Email</dt><dd className="mt-0.5 text-foreground">{customer.email}</dd></div>
                    <div><dt className="text-xs font-medium text-muted-foreground">Phone</dt><dd className="mt-0.5 text-foreground">{customer.phoneNumber}</dd></div>
                    {customer.address && <div><dt className="text-xs font-medium text-muted-foreground">Address</dt><dd className="mt-0.5 text-foreground">{customer.address}</dd></div>}
                    {customer.occasion && <div><dt className="text-xs font-medium text-muted-foreground">Occasion</dt><dd className="mt-0.5 text-foreground">{customer.occasion}</dd></div>}
                    {customer.budgetRange && <div><dt className="text-xs font-medium text-muted-foreground">Budget</dt><dd className="mt-0.5 text-foreground">{customer.budgetRange}</dd></div>}
                    {customer.preferences && <div><dt className="text-xs font-medium text-muted-foreground">Preferences</dt><dd className="mt-0.5 text-foreground whitespace-pre-wrap">{customer.preferences}</dd></div>}
                    {customer.nextVisitDate && <div><dt className="text-xs font-medium text-muted-foreground">Scheduled Next Visit</dt><dd className="mt-0.5 text-foreground">{customer.nextVisitDate}</dd></div>}
                </dl>
            </section>

            <section className="bg-card shadow-sm rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center">
                    <ShieldCheck className="h-5 w-5 mr-2 text-primary" /> Manager Actions
                </h2>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="statusOverride" className="block text-sm font-medium text-foreground mb-1.5">Override Lead Status</label>
                        <Select value={currentStatus} onValueChange={setCurrentStatus}>
                            <SelectTrigger id="statusOverride">
                                <SelectValue placeholder="Select new status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="New">New</SelectItem>
                                <SelectItem value="Cold">Cold</SelectItem>
                                <SelectItem value="Warm">Warm</SelectItem>
                                <SelectItem value="Hot">Hot</SelectItem>
                                <SelectItem value="Converted">Converted</SelectItem>
                                <SelectItem value="Lost">Lost</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleStatusOverride} className="w-full mt-2.5">
                            Apply Status Override
                        </Button>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-foreground mb-1.5">Assign to different Salesperson (Placeholder)</label>
                        <Button variant="outline" className="w-full">
                            Re-assign Customer
                        </Button>
                    </div>
                </div>
            </section>
        </div>

        {/* Right Column: Salesperson Notes, Manager Notes */}
        <div className="lg:col-span-2 space-y-6">
            <section className="bg-card shadow-sm rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                    <NotebookPen className="h-5 w-5 mr-2 text-muted-foreground" /> Add Manager Note
                </h2>
                <form onSubmit={handleAddManagerNote} className="space-y-3">
                    <Textarea
                        id="managerNote"
                        value={managerNoteText}
                        onChange={(e) => setManagerNoteText(e.target.value)}
                        placeholder={`Add a managerial note for ${customer.firstName}... (e.g., observed interaction, strategic advice)`}
                        className="min-h-[80px] focus-visible:ring-ring"
                    />
                    <Button type="submit" className="w-full sm:w-auto">
                        Save Manager Note
                    </Button>
                </form>
            </section>
            
            {customer.managerNotes && customer.managerNotes.length > 0 && (
                <section className="bg-card shadow-sm rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-4">Manager Notes Log</h2>
                    <ul className="space-y-3">
                        {customer.managerNotes.map((note) => (
                        <li key={note.id} className="p-3 border border-primary/30 rounded-md bg-primary/5">
                            <div className="flex justify-between items-start text-xs mb-0.5">
                            <p className="font-semibold text-primary">Manager: {note.manager}</p>
                            <p className="text-muted-foreground">{note.date}</p>
                            </div>
                            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{note.text}</p>
                        </li>
                        ))}
                    </ul>
                </section>
            )}

            <section className="bg-card shadow-sm rounded-lg p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Salesperson's Notes (Read-Only)</h2>
                {customer.salespersonNotes && customer.salespersonNotes.length > 0 ? (
                <ul className="space-y-3">
                    {customer.salespersonNotes.map((note) => (
                    <li key={note.id} className="p-3 border border-border/70 rounded-md bg-muted/30">
                        <div className="flex justify-between items-start text-xs mb-0.5">
                        <p className="font-medium text-foreground">{note.salesperson}</p>
                        <p className="text-muted-foreground">{note.date}</p>
                        </div>
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap">{note.text}</p>
                    </li>
                    ))}
                </ul>
                ) : (
                <p className="text-sm text-muted-foreground">No notes from salesperson yet.</p>
                )}
            </section>
        </div>
      </div>
    </div>
  );
} 