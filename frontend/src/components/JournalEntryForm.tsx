import React, { useState, useEffect } from 'react';

type Journal = {
  id?: string;
  name: string;
  locations: string[];
  startDate: string;
  endDate: string;
  summary: string;
  coverImage?: string;
  rating?: number;
  companions?: string[];
  highlights?: string[];
};

interface Props {
  entry?: Journal | null;
  onSubmit: (data: Omit<Journal, 'id'>) => void;
  onCancel: () => void;
}

const csvToArray = (s?: string | string[]) => {
  if (!s) return [];
  if (Array.isArray(s)) return s;
  return s
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
};

const JournalEntryForm: React.FC<Props> = ({ entry, onSubmit, onCancel }) => {
  const [name, setName] = useState(entry?.name || '');
  const [locations, setLocations] = useState((entry?.locations || []).join(', '));
  const [startDate, setStartDate] = useState(entry?.startDate || '');
  const [endDate, setEndDate] = useState(entry?.endDate || '');
  const [summary, setSummary] = useState(entry?.summary || '');
  const [highlights, setHighlights] = useState((entry?.highlights || []).join(', '));
  const [companions, setCompanions] = useState((entry?.companions || []).join(', '));
  const [coverImage, setCoverImage] = useState(entry?.coverImage || '/placeholder.svg');
  const [rating, setRating] = useState<number | ''>(entry?.rating ?? '');

  useEffect(() => {
    if (entry) {
      setName(entry.name || '');
      setLocations((entry.locations || []).join(', '));
      setStartDate(entry.startDate || '');
      setEndDate(entry.endDate || '');
      setSummary(entry.summary || '');
      setHighlights((entry.highlights || []).join(', '));
      setCompanions((entry.companions || []).join(', '));
      setCoverImage(entry.coverImage || '/placeholder.svg');
      setRating(entry.rating ?? '');
    }
  }, [entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Omit<Journal, 'id'> = {
      name,
      locations: csvToArray(locations),
      startDate,
      endDate,
      summary,
      highlights: csvToArray(highlights),
      companions: csvToArray(companions),
      coverImage,
      rating: rating === '' ? undefined : Number(rating),
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium">Title</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full" />
      </div>

      <div>
        <label className="block text-sm font-medium">Locations (comma separated)</label>
        <input value={locations} onChange={(e) => setLocations(e.target.value)} className="w-full" />
      </div>

      <div className="flex gap-2">
        <div>
          <label className="block text-sm font-medium">Start</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="" />
        </div>
        <div>
          <label className="block text-sm font-medium">End</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Summary</label>
        <textarea value={summary} onChange={(e) => setSummary(e.target.value)} className="w-full h-24" />
      </div>

      <div>
        <label className="block text-sm font-medium">Highlights (comma separated)</label>
        <input value={highlights} onChange={(e) => setHighlights(e.target.value)} className="w-full" />
      </div>

      <div>
        <label className="block text-sm font-medium">Companions (comma separated)</label>
        <input value={companions} onChange={(e) => setCompanions(e.target.value)} className="w-full" />
      </div>

      <div>
        <label className="block text-sm font-medium">Cover Image URL</label>
        <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} className="w-full" />
      </div>

      <div>
        <label className="block text-sm font-medium">Rating (1-5)</label>
        <input type="number" min={1} max={5} value={rating as any} onChange={(e) => setRating(e.target.value === '' ? '' : Number(e.target.value))} />
      </div>

      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel} className="px-3 py-1">Cancel</button>
        <button type="submit" className="px-3 py-1 bg-blue-500 text-white">Save</button>
      </div>
    </form>
  );
};

export default JournalEntryForm;
