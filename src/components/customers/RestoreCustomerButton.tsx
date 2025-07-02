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
import { RotateCcw, CheckCircle } from 'lucide-react';
import { restoreCustomerAction, RestoreCustomerResult } from '@/app/admin/customers/trash/server-actions';

interface RestoreCustomerButtonProps {
  customerId: string;
  customerName: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function RestoreCustomerButton({ 
  customerId, 
  customerName,
  size = "sm"
}: RestoreCustomerButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleRestore = () => {
    setError(null);
    
    startTransition(async () => {
      try {
        const result: RestoreCustomerResult = await restoreCustomerAction(customerId);
        
        if (result.success) {
          setIsOpen(false);
          // The page will automatically refresh due to revalidatePath in the action
        } else {
          setError(result.error || "Failed to restore customer");
        }
      } catch (err) {
        console.error("Restore customer error:", err);
        setError("An unexpected error occurred");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className="gap-1 border-green-200 text-green-700 hover:bg-green-50"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOpen(true);
          }}
        >
          <RotateCcw className="h-3 w-3" />
          {size !== "icon" && "Restore"}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            Restore Customer
          </DialogTitle>
          <DialogDescription className="text-left">
            This will restore the customer back to the active customers list.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold text-sm text-green-800">Customer to Restore:</p>
            <p className="text-sm mt-1 text-green-700">
              <strong>Name:</strong> {customerName}
            </p>
          </div>
          
          <Alert className="mt-4 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              <strong>Safe Operation:</strong> The customer will be moved back to the active customers list 
              and will be visible to all relevant staff members.
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
            onClick={handleRestore}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Restoring...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Restore Customer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 