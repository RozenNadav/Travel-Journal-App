import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Sparkles, MapPin, Calendar, Users, Star } from "lucide-react";
import Header from "@/components/Header";
import { API_BASE_URL } from "@/config";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import JournalEntryForm from '@/components/JournalEntryForm';

// start with empty; will be loaded from backend
const initialJournals: any[] = [];

interface Journal {
  id: string;
  name: string;
  locations: string[];
  startDate: string;
  endDate: string;
  summary: string;
  aiSummary?: string;
  coverImage: string;
  rating?: number;
  companions?: string[];
  highlights?: string[];
}

const Journals = () => {
  const [journals, setJournals] = useState<Journal[]>(initialJournals);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/journals`);
        if (!res.ok) return;
        const json = await res.json();
        if (!mounted) return;
        const mapped = (json.journals || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          locations: r.locations || [],
          startDate: r.start_date || '',
          endDate: r.end_date || '',
          summary: r.summary || '',
          aiSummary: r.ai_summary || undefined,
          coverImage: r.cover_image || '/placeholder.svg',
          rating: r.rating || undefined,
          companions: r.companions || [],
          highlights: r.highlights || [],
        }));
        setJournals(mapped);
      } catch (err) {
        console.error('Failed to load journals', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleCreateJournal = async (journalData: Omit<Journal, 'id'>) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/journals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(journalData),
      });
      if (!res.ok) {
        console.error('Failed to create journal', await res.text());
        return;
      }
      const json = await res.json();
      const r = json.journal;
      const mapped: Journal = {
        id: r.id,
        name: r.name,
        locations: r.locations || [],
        startDate: r.start_date || '',
        endDate: r.end_date || '',
        summary: r.summary || '',
        aiSummary: r.ai_summary || undefined,
        coverImage: r.cover_image || '/placeholder.svg',
        rating: r.rating || undefined,
        companions: r.companions || [],
        highlights: r.highlights || [],
      };
      setJournals((s) => [...s, mapped]);
      setIsCreateDialogOpen(false);
    } catch (err) {
      console.error('Error creating journal', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteJournal = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/journals/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        console.error('Failed to delete journal', await res.text());
        return;
      }
      setJournals(journals.filter(journal => journal.id !== id));
    } catch (err) {
      console.error('Error deleting journal', err);
    }
  };

  const handleEditJournal = (journal: Journal) => {
    setEditingJournal(journal);
    setIsCreateDialogOpen(true);
  };

  const handleUpdateJournal = async (journalData: Omit<Journal, 'id'>) => {
    if (!editingJournal) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/journals/${editingJournal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...journalData, regenerateAI: true }),
      });
      if (!res.ok) {
        console.error('Failed to update journal', await res.text());
        return;
      }
      const json = await res.json();
      const r = json.journal;
      const mapped: Journal = {
        id: r.id,
        name: r.name,
        locations: r.locations || [],
        startDate: r.start_date || '',
        endDate: r.end_date || '',
        summary: r.summary || '',
        aiSummary: r.ai_summary || undefined,
        coverImage: r.cover_image || '/placeholder.svg',
        rating: r.rating || undefined,
        companions: r.companions || [],
        highlights: r.highlights || [],
      };
      setJournals(journals.map(j => j.id === mapped.id ? mapped : j));
      setEditingJournal(null);
      setIsCreateDialogOpen(false);
    } catch (err) {
      console.error('Error updating journal', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {isProcessing && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 px-6 py-3 rounded shadow">Generating AI summary…</div>
        </div>
      )}
      <Header />
      <div className="container mx-auto px-4 py-24">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif font-medium">My Journals</h1>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="h-5 w-5" />
                New Journal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingJournal ? 'Edit Journal' : 'Create New Journal'}</DialogTitle>
              </DialogHeader>
              <JournalEntryForm
                entry={editingJournal}
                onSubmit={(data) => editingJournal ? handleUpdateJournal(data as Omit<Journal, 'id'>) : handleCreateJournal(data as Omit<Journal, 'id'>)}
                onCancel={() => {
                  setIsCreateDialogOpen(false);
                  setEditingJournal(null);
                }}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journals.map((journal) => (
            <Card key={journal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <img
                  src={journal.coverImage}
                  alt={journal.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="bg-white/90 hover:bg-white"
                    onClick={() => handleEditJournal(journal)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="destructive"
                    onClick={() => handleDeleteJournal(journal.id)}
                    className="bg-red-500/90 hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {journal.rating && (
                  <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded-full text-sm">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {journal.rating}
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {journal.name}
                  {journal.aiSummary && (
                    <Sparkles className="h-4 w-4 text-blue-500" title="AI Enhanced" />
                  )}
                </CardTitle>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {journal.locations.join(' • ')}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {new Date(journal.startDate).toLocaleDateString()} - {new Date(journal.endDate).toLocaleDateString()}
                </div>
                
                {journal.companions && journal.companions.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    With {journal.companions.join(', ')}
                  </div>
                )}
                
                <p className="text-sm line-clamp-2">{journal.summary}</p>
                
                {journal.aiSummary && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">AI Summary</span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 line-clamp-3">
                      {journal.aiSummary}
                    </p>
                  </div>
                )}
                
                {journal.highlights && journal.highlights.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Highlights:</div>
                    <div className="flex flex-wrap gap-1">
                      {journal.highlights.slice(0, 3).map((highlight, index) => (
                        <span key={index} className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                          {highlight}
                        </span>
                      ))}
                      {journal.highlights.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{journal.highlights.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
};

export default Journals;