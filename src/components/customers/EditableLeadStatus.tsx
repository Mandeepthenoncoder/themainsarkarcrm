'use client';

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { updateCustomerLeadStatusAction } from '@/app/salesperson/customers/actions';
import { Loader2, Edit2 } from 'lucide-react';
import { toast } from "sonner";

// Define your lead status enum values here - these should match your Supabase enum
const LEAD_STATUS_OPTIONS = [
  'New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 
  'Negotiation', 'Closed Won', 'Closed Lost', 'On Hold', 'Future Opportunity'
] as const;

type LeadStatus = typeof LEAD_STATUS_OPTIONS[number];

interface EditableLeadStatusProps {
  customerId: string;
  currentStatus: LeadStatus | null;
}

// Moved getStatusBadgeClass function here
const getStatusBadgeClass = (status: LeadStatus | null) => {
  if (status === null) { 
    return 'bg-slate-100 text-slate-700 border-slate-300';
  }
  switch (status) {
    case 'New Lead': return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'Contacted': return 'bg-cyan-100 text-cyan-700 border-cyan-300';
    case 'Qualified': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'Proposal Sent': return 'bg-indigo-100 text-indigo-700 border-indigo-300';
    case 'Negotiation': return 'bg-purple-100 text-purple-700 border-purple-300';
    case 'Closed Won': return 'bg-green-100 text-green-700 border-green-300';
    case 'Closed Lost': return 'bg-red-100 text-red-700 border-red-300';
    case 'On Hold': return 'bg-orange-100 text-orange-700 border-orange-300';
    case 'Future Opportunity': return 'bg-teal-100 text-teal-700 border-teal-300';
    default:
      // This ensures all non-null enum values are handled by the switch.
      // const exhaustiveCheck: never = status; // This line will cause a type error if a status is missed.
      return 'bg-slate-100 text-slate-700 border-slate-300'; 
  }
};

export function EditableLeadStatus({
  customerId,
  currentStatus,
}: EditableLeadStatusProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | null>(currentStatus);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (!selectedStatus) {
      toast.error("Please select a lead status.");
      return;
    }
    if (selectedStatus === currentStatus) {
      // toast.info("No changes made to lead status."); // Optional: inform user
      setIsOpen(false);
      return;
    }

    startTransition(async () => {
      const result = await updateCustomerLeadStatusAction(customerId, selectedStatus);
      if (result.success) {
        toast.success("Lead status updated successfully!");
        setIsOpen(false);
        // No need to manually re-fetch here as revalidatePath in action handles it
      } else {
        toast.error(result.error || "Failed to update lead status.");
      }
    });
  };
  
  const badgeClassName = getStatusBadgeClass(currentStatus); // Use local function

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="p-1 h-auto hover:bg-muted/50">
          {currentStatus ? (
            <Badge variant="outline" className={`cursor-pointer ${badgeClassName} text-xs`}>
              {currentStatus} <Edit2 className="h-3 w-3 ml-1.5 opacity-50" />
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs italic cursor-pointer hover:underline">
              Set Status <Edit2 className="h-3 w-3 ml-1 inline-block opacity-50" />
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Lead Status</DialogTitle>
          <DialogDescription>
            Select the new lead status for this customer.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select 
            value={selectedStatus || undefined} // Handle null case for Select value
            onValueChange={(value: LeadStatus) => setSelectedStatus(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a status" />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={isPending}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isPending || !selectedStatus || selectedStatus === currentStatus}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 