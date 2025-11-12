import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2, Sparkles, MapPin, Calendar, Users, Star } from "lucide-react";
import Header from "@/components/Header";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import JournalEntryForm from '@/components/JournalEntryForm';

// Mock journal data
const initialJournals = [
  {
    id: '1',
    name: 'Summer in Paris',
    locations: ['Paris, France', 'Versailles, France'],
    startDate: '2025-06-15',
    endDate: '2025-06-30',
    summary: 'An unforgettable journey through the City of Light.',
    aiSummary: 'This 15-day adventure through Paris and Versailles was a remarkable journey of discovery. The traveler explored the iconic landmarks of the French capital, from the Eiffel Tower to the Louvre, while also experiencing the grandeur of Versailles Palace. The trip was filled with cultural immersion, culinary delights, and romantic moments along the Seine. The blend of historic architecture, world-class museums, and charming cafés created lasting memories of authentic French culture.',
    coverImage: '/placeholder.svg',
    rating: 5,
    companions: ['Sarah', 'Mike'],
    highlights: ['Eiffel Tower at sunset', 'Louvre Museum', 'Versailles Palace', 'Seine River cruise']
  },
  {
    id: '2',
    name: 'Tokyo Adventure',
    locations: ['Tokyo, Japan', 'Kyoto, Japan'],
    startDate: '2025-07-10',
    endDate: '2025-07-25',
    summary: 'Exploring the perfect blend of tradition and modernity.',
    aiSummary: 'This 15-day exploration of Tokyo and Kyoto showcased the incredible contrast between Japan\'s ultra-modern capital and its ancient cultural heart. The journey included visits to bustling districts like Shibuya and Harajuku, traditional temples in Kyoto, and the serene beauty of Japanese gardens. The experience was enriched by authentic cuisine, from street food to kaiseki dining, and the warm hospitality of the Japanese people. The trip perfectly captured the essence of modern Japan while honoring its deep cultural traditions.',
    coverImage: '/placeholder.svg',
    rating: 5,
    companions: ['Alex'],
    highlights: ['Shibuya Crossing', 'Fushimi Inari Shrine', 'Traditional tea ceremony', 'Tsukiji Fish Market']
  }
];

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

  const handleCreateJournal = (journalData: Omit<Journal, 'id'>) => {
    const newJournal: Journal = {
      ...journalData,
      id: Math.random().toString(36).substr(2, 9)
    };
    setJournals([...journals, newJournal]);
    setIsCreateDialogOpen(false);
  };

  const handleDeleteJournal = (id: string) => {
    setJournals(journals.filter(journal => journal.id !== id));
  };

  const handleEditJournal = (journal: Journal) => {
    setEditingJournal(journal);
    setIsCreateDialogOpen(true);
  };

  const handleUpdateJournal = (journalData: Omit<Journal, 'id'>) => {
    if (editingJournal) {
      setJournals(journals.map(journal => 
        journal.id === editingJournal.id 
          ? { ...journalData, id: editingJournal.id }
          : journal
      ));
      setEditingJournal(null);
      setIsCreateDialogOpen(false);
    }
  };

  return (
    <>
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