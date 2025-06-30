'use client';

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addCallLogAction } from '@/app/salesperson/customers/actions'; // Adjust path if necessary
import { Phone, Loader2 } from 'lucide-react';
// Assuming you use sonner for toasts, otherwise replace with your notification system
import { toast } from "sonner"; 

// Define CallLogEntry input type based on what addCallLogAction expects for logData
// This should align with the CallLogEntry definition in actions.ts (for the input part)
interface CallLogData {
  notes: string;
  duration_minutes?: number;
  call_type?: 'Incoming' | 'Outgoing' | 'Missed';
}

interface AddCallLogDialogProps {
  customerId: string;
  onLogAdded?: () => void; // Optional callback after log is added
}

export function AddCallLogDialog({ customerId, onLogAdded }: AddCallLogDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState<string>(""); // Store as string to allow empty input
  const [callType, setCallType] = useState<'Incoming' | 'Outgoing' | 'Missed' | undefined>(undefined); // Added state for callType
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () => {
    if (!notes.trim()) {
      toast.error("Call notes cannot be empty.");
      return;
    }
    if (!callType) {
      toast.error("Please select a call type.");
      return;
    }

    const durationMinutes = duration ? parseInt(duration, 10) : undefined;
    if (duration && (isNaN(durationMinutes!) || durationMinutes! < 0)) {
      toast.error("Please enter a valid call duration (positive number).");
      return;
    }

    const logData: CallLogData = {
      notes,
      duration_minutes: durationMinutes,
      call_type: callType, 
    };

    startTransition(async () => {
      const result = await addCallLogAction(customerId, logData);
      if (result.success) {
        toast.success("Call log added successfully!");
        setNotes("");
        setDuration("");
        setCallType(undefined);
        setIsOpen(false);
        if (onLogAdded) {
          onLogAdded();
        }
      } else {
        toast.error(result.error || "Failed to add call log.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Phone className="h-4 w-4 mr-2" /> Add New Call Log
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Call Log</DialogTitle>
          <DialogDescription>
            Record details about your call with the customer. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="call-notes" className="text-right col-span-1 pt-2">
              Notes
            </Label>
            <Textarea
              id="call-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3 min-h-[100px]"
              placeholder="Enter call details, discussion points, outcomes, etc."
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="call-type" className="text-right col-span-1">
              Call Type
            </Label>
            <Select value={callType} onValueChange={(value: any) => setCallType(value)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select call type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Incoming">Incoming</SelectItem>
                <SelectItem value="Outgoing">Outgoing</SelectItem>
                <SelectItem value="Missed">Missed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="call-duration" className="text-right col-span-1">
              Duration (min)
            </Label>
            <Input
              id="call-duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="col-span-3"
              placeholder="Optional, e.g., 15"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={isPending}>Cancel</Button>
          </DialogClose>
          <Button type="submit" onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Log"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 