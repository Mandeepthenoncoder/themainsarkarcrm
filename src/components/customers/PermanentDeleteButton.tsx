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
  DialogTrigger 
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Trash2, AlertTriangle } from 'lucide-react';
import { permanentDeleteCustomerAction, PermanentDeleteResult } from '@/app/admin/customers/trash/server-actions';

interface PermanentDeleteButtonProps {
  customerId: string;
  customerName: string;
  customerEmail: string | null;
  size?: "default" | "sm" | "lg" | "icon";
}

export function PermanentDeleteButton({ 
  customerId, 
  customerName,
  customerEmail,
  size = "sm"
}: PermanentDeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    
    startTransition(async () => {
      try {
        const result: PermanentDeleteResult = await permanentDeleteCustomerAction(customerId);
        
        if (result.success) {
          setIsOpen(false);
          // Stay on the same page - it will refresh due to revalidatePath in the action
        } else {
          setError(result.error || "Failed to permanently delete customer");
        }
      } catch (err) {
        console.error("Permanent delete customer error:", err);
        setError("An unexpected error occurred");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        setError(null);
      }
    }}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size={size}
          className="gap-1"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
        >
          <Trash2 className="h-3 w-3" />
          {size !== "icon" && "Delete Forever"}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Permanent Delete - Final Warning
          </DialogTitle>
          <DialogDescription className="text-left">
            This action cannot be undone. The customer data will be permanently removed from the database.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="font-semibold text-sm text-destructive">Customer to Delete Forever:</p>
            <p className="text-sm mt-1">
              <strong>Name:</strong> {customerName}
            </p>
            {customerEmail && (
              <p className="text-sm">
                <strong>Email:</strong> {customerEmail}
              </p>
            )}
          </div>
          
          <Alert className="mt-4" variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>⚠️ PERMANENT ACTION:</strong> This will completely remove all customer data including:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Personal information and contact details</li>
                <li>Purchase history and transaction records</li>
                <li>Communication logs and preferences</li>
                <li>All associated data and relationships</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting Forever...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Forever
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 