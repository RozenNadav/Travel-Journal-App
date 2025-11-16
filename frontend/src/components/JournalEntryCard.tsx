import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { MapPin, CalendarDays, Edit, Trash2, Sparkles } from 'lucide-react';
import type { JournalEntry } from './TravelJournal';

interface JournalEntryCardProps {
  entry: JournalEntry;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
}

const JournalEntryCard: React.FC<JournalEntryCardProps> = ({
  entry,
  onEdit,
  onDelete,
  className
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDuration = () => {
    const start = new Date(entry.startDate);
    const end = new Date(entry.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return '1 day';
    }
    return `${diffDays} days`;
  };

  return (
    <Card className={cn('glass-panel hover:shadow-lg transition-all duration-300', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-2xl font-serif font-medium mb-3">{entry.name}</h3>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <CalendarDays className="w-4 h-4" />
                <span>
                  {formatDate(entry.startDate)}
                  {entry.endDate !== entry.startDate && ` - ${formatDate(entry.endDate)}`}
                </span>
                <span className="ml-2 px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs">
                  {getDuration()}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 mb-4">
              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="flex flex-wrap gap-2">
                {entry.locations.map((location, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm"
                  >
                    {location}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="h-8 w-8 p-0"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="h-8 w-8 p-0 text-destructive hover:text-destructive-foreground hover:bg-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div>
          <h4 className="font-medium mb-3 flex items-center gap-2">
            <span>My Adventure</span>
          </h4>
          <p className="text-muted-foreground leading-relaxed">
            {entry.summary}
          </p>
        </div>

        {entry.aiSummary && (
          <div className="border-t pt-6">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Trip Summary</span>
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                AI Generated
              </span>
            </h4>
            <div className="bg-accent/30 rounded-lg p-4">
              <p className="text-muted-foreground leading-relaxed italic">
                {entry.aiSummary}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JournalEntryCard;