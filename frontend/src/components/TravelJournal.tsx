import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Plus, Edit, Trash2, MapPin, CalendarDays, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import JournalEntryForm from './JournalEntryForm';
import JournalEntryCard from './JournalEntryCard';

interface TravelJournalProps {
  className?: string;
}

export interface JournalEntry {
  id: string;
  name: string;
  locations: string[];
  startDate: string;
  endDate: string;
  summary: string;
  aiSummary?: string;
}

const TravelJournal: React.FC<TravelJournalProps> = ({ className }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const handleAddEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry = {
      ...entry,
      id: Date.now().toString(),
      aiSummary: generateMockAISummary(entry)
    };
    setEntries([newEntry, ...entries]);
    setShowForm(false);
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEntries(entries.map(e => e.id === entry.id ? { ...entry, aiSummary: generateMockAISummary(entry) } : e));
    setEditingEntry(null);
    setShowForm(false);
  };

  const handleDeleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const generateMockAISummary = (entry: Omit<JournalEntry, 'id' | 'aiSummary'>) => {
    const locations = entry.locations.join(', ');
    return `This ${Math.ceil((new Date(entry.endDate).getTime() - new Date(entry.startDate).getTime()) / (1000 * 60 * 60 * 24))}-day adventure through ${locations} was a remarkable journey of discovery. The traveler explored diverse landscapes and cultures, creating lasting memories through authentic experiences and meaningful encounters.`;
  };

  return (
    <section className={cn('py-20 md:py-32 bg-background', className)} id="travel-journal">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight mb-6">
              Travel Journal
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Document your adventures, mark your locations, and cherish the memories of every journey.
            </p>
          </div>

          <div className="flex justify-center mb-12">
            <Button
              onClick={() => {
                setEditingEntry(null);
                setShowForm(true);
              }}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-lg"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Trip
            </Button>
          </div>

          {showForm && (
            <div className="mb-12">
              <JournalEntryForm
                entry={editingEntry}
                onSubmit={editingEntry ? handleEditEntry : handleAddEntry}
                onCancel={() => {
                  setShowForm(false);
                  setEditingEntry(null);
                }}
              />
            </div>
          )}

          {entries.length === 0 && !showForm && (
            <div className="text-center py-20">
              <div className="glass-panel rounded-lg p-12 max-w-md mx-auto">
                <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-serif mb-4">No trips yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start documenting your adventures by adding your first trip.
                </p>
                <Button
                  onClick={() => setShowForm(true)}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Trip
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-8 md:gap-12">
            {entries.map((entry) => (
              <JournalEntryCard
                key={entry.id}
                entry={entry}
                onEdit={() => {
                  setEditingEntry(entry);
                  setShowForm(true);
                }}
                onDelete={() => handleDeleteEntry(entry.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelJournal;