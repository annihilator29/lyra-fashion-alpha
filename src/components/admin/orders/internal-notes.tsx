/**
 * Internal Notes Component
 * Story 7.3: Order Management & Fulfillment Tools
 * AC8: Internal Notes & Communication
 */

'use client';

import * as React from 'react';
import { Loader2, MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  addInternalNote,
  deleteInternalNote,
  type InternalNote as InternalNoteType,
} from '@/app/admin/orders/actions';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface InternalNotesProps {
  orderId: string;
  initialNotes?: InternalNoteType[];
}

export function InternalNotes({ orderId, initialNotes = [] }: InternalNotesProps) {
  const [notes, setNotes] = React.useState<InternalNoteType[]>(initialNotes);
  const [newNote, setNewNote] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [noteToDelete, setNoteToDelete] = React.useState<string | null>(null);

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      toast.error('Note cannot be empty');
      return;
    }

    if (newNote.length > 1000) {
      toast.error('Note must be less than 1000 characters');
      return;
    }

    setIsAdding(true);

    try {
      const result = await addInternalNote(orderId, newNote);

      if (result.success && result.note) {
        setNotes([result.note, ...notes]);
        setNewNote('');
        toast.success('Note added');
      } else {
        toast.error(result.error || 'Failed to add note');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Add note error:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      const result = await deleteInternalNote(orderId, noteToDelete);

      if (result.success) {
        setNotes(notes.filter((n) => n.id !== noteToDelete));
        toast.success('Note deleted');
        setDeleteDialogOpen(false);
        setNoteToDelete(null);
      } else {
        toast.error(result.error || 'Failed to delete note');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error('Delete note error:', error);
    }
  };

  const openDeleteDialog = (noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Internal Notes
          <span className="text-sm font-normal text-muted-foreground">
            ({notes.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Note */}
        <div className="space-y-2">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add an internal note (visible to admins only)..."
            maxLength={1000}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              {newNote.length}/1000 characters
            </p>
            <Button
              size="sm"
              onClick={handleAddNote}
              disabled={isAdding || !newNote.trim()}
            >
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Note'
              )}
            </Button>
          </div>
        </div>

        {/* Notes List */}
        {notes.length > 0 ? (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {notes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                onDelete={() => openDeleteDialog(note.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No internal notes yet</p>
            <p className="text-xs">
              Add notes to track important information about this order
            </p>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this note? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false);
                setNoteToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteNote}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

interface NoteItemProps {
  note: InternalNoteType;
  onDelete: () => void;
}

function NoteItem({ note, onDelete }: NoteItemProps) {
  const timeAgo = formatDistanceToNow(new Date(note.created_at), {
    addSuffix: true,
  });

  return (
    <div className="p-3 bg-muted rounded-lg space-y-2">
      <div className="flex justify-between items-start">
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">{(note as any).customers?.name || 'Admin'}</span>
          {' • '}
          <span>{timeAgo}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={onDelete}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
      <p className="text-sm whitespace-pre-wrap">{note.note}</p>
    </div>
  );
}
