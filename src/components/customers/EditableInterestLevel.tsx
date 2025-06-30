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
import { updateCustomerInterestLevelAction } from '@/app/salesperson/customers/actions';
import { Loader2, Edit2, Sparkles, Thermometer, Snowflake } from 'lucide-react'; // Added icons for interest levels
import { toast } from "sonner";

// Define your interest level enum values here - these should match your Supabase enum
const INTEREST_LEVEL_OPTIONS = [
  'Hot', 'Warm', 'Cold', 'None'
] as const;

type InterestLevel = typeof INTEREST_LEVEL_OPTIONS[number];

interface EditableInterestLevelProps {
  customerId: string;
  currentInterestLevel: InterestLevel | null;
}

// Helper function to get badge class and icon for interest level
const getInterestLevelDisplayProps = (level: InterestLevel | null) => {
  switch (level) {
    case 'Hot':
      return { className: 'bg-red-100 text-red-700 border-red-300', Icon: Sparkles };
    case 'Warm':
      return { className: 'bg-orange-100 text-orange-700 border-orange-300', Icon: Thermometer };
    case 'Cold':
      return { className: 'bg-blue-100 text-blue-700 border-blue-300', Icon: Snowflake };
    case 'None':
    default:
      return { className: 'bg-slate-100 text-slate-700 border-slate-300', Icon: Edit2 }; // Using Edit2 as a placeholder for unassessed
  }
};

export function EditableInterestLevel({
  customerId,
  currentInterestLevel,
}: EditableInterestLevelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedInterestLevel, setSelectedInterestLevel] = useState<InterestLevel | null>(currentInterestLevel);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    if (!selectedInterestLevel) {
      toast.error("Please select an interest level.");
      return;
    }
    if (selectedInterestLevel === currentInterestLevel) {
      setIsOpen(false);
      return;
    }

    startTransition(async () => {
      const result = await updateCustomerInterestLevelAction(customerId, selectedInterestLevel);
      if (result.success) {
        toast.success("Interest level updated successfully!");
        setIsOpen(false);
      } else {
        toast.error(result.error || "Failed to update interest level.");
      }
    });
  };

  const displayProps = getInterestLevelDisplayProps(currentInterestLevel);
  const { Icon } = displayProps;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="p-1 h-auto hover:bg-muted/50">
          {currentInterestLevel ? (
            <Badge variant="outline" className={`cursor-pointer ${displayProps.className} text-xs flex items-center`}>
              <Icon className="h-3 w-3 mr-1" /> 
              {currentInterestLevel} <Edit2 className="h-3 w-3 ml-1.5 opacity-50" />
            </Badge>
          ) : (
            <span className="text-muted-foreground text-xs italic cursor-pointer hover:underline">
              Set Interest <Edit2 className="h-3 w-3 ml-1 inline-block opacity-50" />
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Interest Level</DialogTitle>
          <DialogDescription>
            Select the current interest level for this customer.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select 
            value={selectedInterestLevel || undefined} 
            onValueChange={(value: InterestLevel) => setSelectedInterestLevel(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an interest level" />
            </SelectTrigger>
            <SelectContent>
              {INTEREST_LEVEL_OPTIONS.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost" disabled={isPending}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isPending || !selectedInterestLevel || selectedInterestLevel === currentInterestLevel}>
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 