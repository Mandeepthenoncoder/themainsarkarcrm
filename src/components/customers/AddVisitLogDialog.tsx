"use client";

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
import { Label } from "@/components/ui/label";
import { addVisitLogAction } from '@/app/salesperson/customers/actions';
import { TrendingUp, Loader2 } from 'lucide-react';
import { toast } from "sonner";

interface AddVisitLogDialogProps {
  customerId: string;
  onLogAdded?: () => void;
}

export function AddVisitLogDialog({ customerId, onLogAdded }: AddVisitLogDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async () => {
    if (!notes.trim()) {
      toast.error("Visit notes cannot be empty.");
      return;
    }

    startTransition(async () => {
      const result = await addVisitLogAction(customerId, { notes });
      if (result.success) {
        toast.success("Visit log added successfully!");
        setNotes("");
        setIsOpen(false);
        if (onLogAdded) {
          onLogAdded();
        }
      } else {
        toast.error(result.error || "Failed to add visit log.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <TrendingUp className="h-4 w-4 mr-2" /> Add New Visit Log
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Visit Log</DialogTitle>
          <DialogDescription>
            Record details about the customer\'s visit. Click save when you\'re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="visit-notes" className="text-right col-span-1">
              Notes
            </Label>
            <Textarea
              id="visit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3 min-h-[100px]"
              placeholder="Enter visit details, discussions, outcomes, etc."
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