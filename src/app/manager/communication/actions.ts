'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/lib/database.types';
import { revalidatePath } from 'next/cache';

// Updated interface to match DB structure and join
export interface TeamMessage {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string; 
  author_id: string; 
  is_pinned: boolean;
  // showroom_id?: string | null; // If messages are showroom-specific
  // Joined data from profiles table:
  profiles: { full_name: string | null; } | null; 
}

// Helper type for frontend display convenience
export interface DisplayTeamMessage extends TeamMessage {
    author_full_name_display: string;
}

export interface CreateMessageData {
  title: string;
  content: string;
  is_pinned?: boolean;
}

// --- Get Team Messages --- //
interface GetMessagesSuccessResult {
  success: true;
  messages: DisplayTeamMessage[];
}
interface GetMessagesErrorResult {
  success: false;
  error: string;
}
export type GetTeamMessagesResult = GetMessagesSuccessResult | GetMessagesErrorResult;

export async function getTeamMessagesAction(): Promise<GetTeamMessagesResult> {
  const supabase = createServerActionClient<Database>({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'User not authenticated.' };

  try {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        id,
        title,
        content,
        created_at,
        updated_at,
        author_id,
        is_pinned,
        profiles ( 
          full_name
        )
      `)
      .eq('status', 'Published')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching team messages:', error);
      return { success: false, error: 'Failed to retrieve announcements from the database.' };
    }

    const displayMessages: DisplayTeamMessage[] = (data || []).map(msg => ({
        id: msg.id,
        title: msg.title,
        content: msg.content,
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        author_id: msg.author_id,
        is_pinned: msg.is_pinned || false,
        profiles: msg.profiles,
        author_full_name_display: msg.profiles?.full_name || 'Unknown Author'
    }));

    return { success: true, messages: displayMessages };

  } catch (e: any) {
    console.error('Unexpected error in getTeamMessagesAction:', e);
    return { success: false, error: 'An unexpected error occurred while fetching announcements.' };
  }
}

// --- Create Team Message --- //
interface CreateMessageSuccessResult {
  success: true;
  message: DisplayTeamMessage; // Return the created message, adapted for display
}
interface CreateMessageErrorResult {
  success: false;
  error: string;
  fieldErrors?: Record<string, string>; // For form-specific errors
}
export type CreateTeamMessageResult = CreateMessageSuccessResult | CreateMessageErrorResult;

export async function createTeamMessageAction(data: CreateMessageData): Promise<CreateTeamMessageResult> {
  const supabase = createServerActionClient<Database>({ cookies });
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: 'User not authenticated. Please log in again.' };
  }

  // Validate input (matches Zod schema on client, but good to have server-side checks too)
  if (!data.title || data.title.trim().length < 3 || data.title.trim().length > 255) {
    return { success: false, error: 'Title must be between 3 and 255 characters.', fieldErrors: { title: 'Title must be between 3 and 255 characters.'} };
  }
  if (!data.content || data.content.trim().length < 10) {
    return { success: false, error: 'Content must be at least 10 characters long.', fieldErrors: { content: 'Content must be at least 10 characters long.'} };
  }

  try {
    const messageToInsert = {
      title: data.title.trim(),
      content: data.content.trim(),
      author_id: user.id,
      is_pinned: data.is_pinned || false,
      // showroom_id: managerShowroomId, // If implementing showroom-specific messages
    };

    const { data: newMessage, error: insertError } = await supabase
      .from('announcements')
      .insert({
        ...messageToInsert,
        status: 'Published'
      })
      .select(`
        id,
        title,
        content,
        created_at,
        updated_at,
        author_id,
        is_pinned,
        profiles ( 
          full_name
        )
      `)
      .single();

    if (insertError) {
      console.error('Error creating team message:', insertError);
      // Check for specific DB errors if needed, e.g., RLS violation, constraint violation
      if (insertError.message.includes('violates row-level security policy')) {
          return { success: false, error: 'Permission denied. You may not have the rights to post announcements.' };
      }
      if (insertError.message.includes('violates check constraint')) {
          // This can be more specific if we parse which constraint (e.g. title_length, content_length)
          return { success: false, error: 'Invalid input. Please check title and content length.' };
      }
      return { success: false, error: 'Failed to post announcement to the database.' };
    }

    if (!newMessage) {
      return { success: false, error: 'Announcement was posted, but failed to retrieve the confirmation.' };
    }
    
    const displayMessage: DisplayTeamMessage = {
        id: newMessage.id,
        title: newMessage.title,
        content: newMessage.content,
        created_at: newMessage.created_at,
        updated_at: newMessage.updated_at,
        author_id: newMessage.author_id,
        is_pinned: newMessage.is_pinned || false,
        profiles: newMessage.profiles,
        author_full_name_display: newMessage.profiles?.full_name || 'Current Manager'
    };

    revalidatePath('/manager/communication'); // Revalidate to show new message on the list
    revalidatePath('/manager/dashboard'); // Also revalidate dashboard
    return { success: true, message: displayMessage };

  } catch (e: any) {
    console.error('Unexpected error in createTeamMessageAction:', e);
    return { success: false, error: 'An unexpected error occurred while posting the announcement.' };
  }
}

// TODO: Implement actions for updating (pin/unpin, edit content) and deleting messages.
// Example skeleton for delete:
/*
export async function deleteTeamMessageAction(messageId: string): Promise<{success: boolean, error?: string}> {
    const supabase = createServerActionClient<Database>({ cookies });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return { success: false, error: 'User not authenticated.' };

    // Add check: only author or admin can delete
    // const { data: message, error: fetchError } = await supabase.from('team_messages').select('author_id').eq('id', messageId).single();
    // if (fetchError || !message) return { success: false, error: 'Message not found.' };
    // if (message.author_id !== user.id && !(await userIsAdmin())) return { success: false, error: 'Permission denied.' };
    
    const { error } = await supabase.from('team_messages').delete().eq('id', messageId);
    if (error) {
        console.error('Error deleting message:', error);
        return { success: false, error: 'Failed to delete message.' };
    }
    revalidatePath('/manager/communication');
    return { success: true };
}
*/ 