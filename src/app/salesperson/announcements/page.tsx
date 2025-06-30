"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Megaphone, Pin } from 'lucide-react';

// Placeholder data for announcements (same as manager communication for consistency)
const initialAnnouncements = [
  {
    id: 'anno1',
    title: 'New Collection Launch Next Week!',
    content: 'Get ready for the exciting launch of our new Summer Breeze collection next Monday. All marketing materials are now available in the shared drive. Let\'s make it a huge success!',
    author: 'Showroom Manager',
    date: '2024-07-18',
    isPinned: true,
  },
  {
    id: 'anno2',
    title: 'Q3 Sales Training Session',
    content: 'Mandatory sales training session for all staff on Wednesday, July 24th at 10:00 AM in the main conference room. Please confirm your attendance.',
    author: 'Showroom Manager',
    date: '2024-07-15',
    isPinned: false,
  },
  {
    id: 'anno3',
    title: 'Reminder: Showroom Maintenance on Sunday',
    content: 'A quick reminder that the showroom will be closed this Sunday for scheduled maintenance. Please ensure all personal belongings are cleared by Saturday evening.',
    author: 'Showroom Manager',
    date: '2024-07-12',
    isPinned: false,
  },
  {
    id: 'anno4',
    title: 'Welcome New Team Member: Karan!',
    content: 'Please join us in welcoming Karan Singh to our sales team! Karan brings 5 years of experience in luxury retail and will be a great asset. He starts on Monday.',
    author: 'Showroom Manager',
    date: '2024-07-10',
    isPinned: false,
  },
];

export default function SalespersonAnnouncementsPage() {
  // In a real app, announcements would be fetched
  const [announcements, setAnnouncements] = useState(initialAnnouncements);

  // Sort announcements: pinned first, then by date descending
  const sortedAnnouncements = [...announcements].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="space-y-6">
      <header className="bg-card shadow-sm rounded-lg p-6">
        <div className="flex items-center gap-3">
          <Megaphone className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Announcements</h1>
            <p className="text-muted-foreground mt-1">Stay updated with the latest news and announcements from your manager.</p>
          </div>
        </div>
      </header>

      {/* Announcements List Section */}
      <section className="space-y-4">
        {sortedAnnouncements.length > 0 ? sortedAnnouncements.map((anno) => (
          <Card key={anno.id} id={anno.id} className={`border-l-4 ${anno.isPinned ? 'border-primary shadow-md' : 'border-transparent'}`}>
            <CardHeader>
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-lg md:text-xl">{anno.title}</CardTitle>
                    {anno.isPinned && <Pin className="h-5 w-5 text-primary shrink-0" />}
                </div>
              <CardDescription className="text-xs text-muted-foreground pt-1">
                Posted by {anno.author} on {new Date(anno.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/90 whitespace-pre-wrap">{anno.content}</p>
            </CardContent>
          </Card>
        )) : (
             <Card>
                <CardContent className="text-center py-12">
                    <Megaphone className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No announcements have been posted yet.</p>
                </CardContent>
            </Card>
        )}
      </section>
    </div>
  );
} 