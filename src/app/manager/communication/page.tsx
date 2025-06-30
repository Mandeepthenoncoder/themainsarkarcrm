"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Megaphone, PlusCircle, Edit3, Trash2, Pin, AlertTriangle, Info, Loader2, Send } from 'lucide-react';
import { useState, useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { getTeamMessagesAction, createTeamMessageAction, TeamMessage, CreateMessageData, DisplayTeamMessage } from './actions';

const announcementFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }).max(100),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }).max(2000),
  is_pinned: z.boolean(),
});

type AnnouncementFormValues = z.infer<typeof announcementFormSchema>;

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), "MMM dd, yyyy 'at' HH:mm");
  } catch (e) {
    return dateString;
  }
};

export default function ManagerCommunicationPage() {
  const [announcements, setAnnouncements] = useState<DisplayTeamMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  // const [editingAnnouncement, setEditingAnnouncement] = useState<TeamMessage | null>(null); // For future edit functionality
  const [isSubmitting, startSubmitTransition] = useTransition();

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      title: '',
      content: '',
      is_pinned: false,
    },
  });

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    setError(null);
    const result = await getTeamMessagesAction();
    if (result.success) {
      setAnnouncements(result.messages);
    } else {
      setError(result.error);
      toast.error("Failed to load announcements", { description: result.error });
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const onSubmit = async (values: AnnouncementFormValues) => {
    startSubmitTransition(async () => {
      const result = await createTeamMessageAction(values);
      if (result.success) {
        toast.success('Announcement posted successfully!');
        // Optimistically update or re-fetch
        // For placeholder, let's assume re-fetch is handled by revalidatePath in action
        // or add it to the local state manually to reflect placeholder action
        setAnnouncements(prev => [result.message!, ...prev].sort((a,b) => {
            if(a.is_pinned && !b.is_pinned) return -1;
            if(!a.is_pinned && b.is_pinned) return 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })); 
        setShowModal(false);
        form.reset();
      } else {
        toast.error('Failed to post announcement', {
          description: result.error,
        });
        if (result.fieldErrors) {
          for (const [field, message] of Object.entries(result.fieldErrors)) {
            form.setError(field as keyof AnnouncementFormValues, { type: 'server', message });
          }
        }
      }
    });
  };

  // Placeholder for delete/pin actions - for future implementation
  // const handleDelete = async (id: string) => { console.log("Delete", id); toast.info("Delete functionality not yet implemented.")};
  // const handlePinToggle = async (id: string, currentPinStatus: boolean) => { console.log("Pin", id, currentPinStatus); toast.info("Pin functionality not yet implemented.")};

  const sortedAnnouncements = [...announcements]; // Already sorted by action or optimistic update

  return (
    <div className="space-y-6">
      <header className="bg-card shadow-sm rounded-lg p-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
                <Megaphone className="h-7 w-7 text-primary" />
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Team Announcements</h1>
                    <p className="text-muted-foreground mt-1">Broadcast messages and updates to your sales team.</p>
                </div>
            </div>
            <Button onClick={() => { form.reset(); setShowModal(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Announcement
            </Button>
        </div>
      </header>

      {isLoading && (
        <div className="flex items-center justify-center p-10">
          <Loader2 className="h-8 w-8 mr-2 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading announcements...</p>
        </div>
      )}

      {!isLoading && error && (
        <Card className="border-destructive bg-destructive/10">
          <CardHeader className="flex flex-row items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <CardTitle className="text-destructive">Error Loading Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button variant="outline" onClick={fetchAnnouncements} className="mt-4">Retry</Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && sortedAnnouncements.length === 0 && (
        <Card>
          <CardContent className="p-10 text-center">
            <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Announcements Yet</h3>
            <p className="text-muted-foreground mb-4">
              Use the button above to create the first announcement for your team.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && sortedAnnouncements.length > 0 && (
        <div className="space-y-4">
          {sortedAnnouncements.map((msg) => (
            <Card key={msg.id} className={`shadow-sm ${msg.is_pinned ? 'border-primary border-2 bg-primary/5' : ''}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    {msg.is_pinned && <Pin className="h-5 w-5 mr-2 text-primary transform -rotate-45" />}
                    {msg.title}
                  </CardTitle>
                  {/* Action buttons (for future) */}
                  {/* <div className="space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handlePinToggle(msg.id, msg.is_pinned)} title={msg.is_pinned ? "Unpin" : "Pin"}><Pin className={`h-4 w-4 ${msg.is_pinned ? 'text-primary' : ''}`} /></Button>
                    <Button variant="ghost" size="icon" onClick={() => { setEditingAnnouncement(msg); setShowModal(true); }} title="Edit"><Edit3 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(msg.id)} title="Delete"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div> */}
                </div>
                <CardDescription className="text-xs text-muted-foreground pt-1">
                  Posted by {msg.author_full_name_display || 'Manager'} on {formatDate(msg.created_at)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create New Announcement</DialogTitle>
            <DialogDescription>
              Compose a message to broadcast to your team. Pinned messages stay at the top.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Weekly Sales Meeting Reminder" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Provide details about the announcement..." {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_pinned"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 shadow-sm">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Pin this announcement?</FormLabel>
                      <FormDescription>
                        Pinned announcements will appear at the top of the list.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />} Post Announcement
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

    </div>
  );
} 