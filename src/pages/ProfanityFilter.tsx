import { useCallback, useEffect, useMemo, useState } from 'react';
import { Filter, Plus, RefreshCw, Search, X, Edit, Trash2, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import clsx from 'clsx';

type ProfanityWord = {
  id: string;
  word: string;
  severity: 'low' | 'medium' | 'high';
  context: string;
  enabled: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

type FilterType = 'all' | 'enabled' | 'disabled';
type SeverityType = 'all' | 'low' | 'medium' | 'high';

export function ProfanityFilter() {
  const [words, setWords] = useState<ProfanityWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [severityFilter, setSeverityFilter] = useState<SeverityType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState<ProfanityWord | null>(null);

  const loadWords = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profanity_filter')
        .select('*')
        .order('word', { ascending: true });

      if (fetchError) throw fetchError;

      setWords((data as ProfanityWord[]) ?? []);
    } catch (err) {
      console.error('Error loading profanity words:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profanity words');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWords();
  }, [loadWords]);

  const addWord = useCallback(
    async (word: string, severity: 'low' | 'medium' | 'high', context: string) => {
      try {
        const { error: insertError } = await supabase.from('profanity_filter').insert({
          word: word.toLowerCase().trim(),
          severity,
          context,
          enabled: true,
        });

        if (insertError) throw insertError;

        await loadWords();
        setAddDialogOpen(false);
        setError(null);
      } catch (err) {
        console.error('Error adding word:', err);
        setError(err instanceof Error ? err.message : 'Failed to add word');
      }
    },
    [loadWords]
  );

  const updateWord = useCallback(
    async (id: string, updates: { enabled?: boolean; severity?: string; context?: string }) => {
      try {
        const { error: updateError } = await supabase
          .from('profanity_filter')
          .update(updates)
          .eq('id', id);

        if (updateError) throw updateError;

        await loadWords();
        setEditDialogOpen(false);
        setSelectedWord(null);
        setError(null);
      } catch (err) {
        console.error('Error updating word:', err);
        setError(err instanceof Error ? err.message : 'Failed to update word');
      }
    },
    [loadWords]
  );

  const deleteWord = useCallback(
    async (id: string, wordText: string) => {
      if (!confirm(`Are you sure you want to delete "${wordText}"?`)) {
        return;
      }

      try {
        const { error: deleteError } = await supabase.from('profanity_filter').delete().eq('id', id);

        if (deleteError) throw deleteError;

        await loadWords();
        setError(null);
      } catch (err) {
        console.error('Error deleting word:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete word');
      }
    },
    [loadWords]
  );

  const openEditDialog = useCallback((word: ProfanityWord) => {
    setSelectedWord(word);
    setEditDialogOpen(true);
  }, []);

  const filteredWords = useMemo(() => {
    let filtered = words;

    // Filter by enabled/disabled
    if (filter === 'enabled') {
      filtered = filtered.filter((w) => w.enabled === true);
    } else if (filter === 'disabled') {
      filtered = filtered.filter((w) => w.enabled === false);
    }

    // Filter by severity
    if (severityFilter !== 'all') {
      filtered = filtered.filter((w) => w.severity === severityFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((w) => {
        return w.word.toLowerCase().includes(query) || w.context.toLowerCase().includes(query);
      });
    }

    return filtered;
  }, [words, filter, severityFilter, searchQuery]);

  const stats = useMemo(() => {
    const enabledCount = words.filter((w) => w.enabled).length;
    return {
      total: words.length,
      enabled: enabledCount,
      disabled: words.length - enabledCount,
      showing: filteredWords.length,
    };
  }, [words, filteredWords]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profanity Filter Management</h1>
          <p className="text-gray-600 mt-1">Manage words that are filtered in community posts.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => void loadWords()} disabled={isLoading} variant="outline" className="flex items-center gap-2">
            <RefreshCw className={clsx('w-4 h-4', isLoading && 'animate-spin')} />
            Refresh
          </Button>
          <Button onClick={() => setAddDialogOpen(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Word
          </Button>
        </div>
      </div>

      {/* Search and filters */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search words or context..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 self-center">Status:</span>
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="rounded-full"
            >
              All
            </Button>
            <Button
              variant={filter === 'enabled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('enabled')}
              className="rounded-full"
            >
              Enabled
            </Button>
            <Button
              variant={filter === 'disabled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('disabled')}
              className="rounded-full"
            >
              Disabled
            </Button>

            <span className="text-sm font-medium text-gray-700 self-center ml-4">Severity:</span>
            <Button
              variant={severityFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSeverityFilter('all')}
              className="rounded-full"
            >
              All
            </Button>
            <Button
              variant={severityFilter === 'low' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSeverityFilter('low')}
              className="rounded-full"
            >
              Low
            </Button>
            <Button
              variant={severityFilter === 'medium' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSeverityFilter('medium')}
              className="rounded-full"
            >
              Medium
            </Button>
            <Button
              variant={severityFilter === 'high' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSeverityFilter('high')}
              className="rounded-full"
            >
              High
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <span className="font-semibold text-gray-700">Total: {stats.total}</span>
        <span className="text-green-600">Enabled: {stats.enabled}</span>
        <span className="text-gray-500">Disabled: {stats.disabled}</span>
        <span className="text-gray-500">Showing: {stats.showing}</span>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <p className="font-semibold">Error</p>
          <p className="mt-1">{error}</p>
          <Button onClick={() => setError(null)} variant="ghost" size="sm" className="mt-2">
            Dismiss
          </Button>
        </div>
      )}

      {/* Words list */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, idx) => (
            <Card key={`skeleton-${idx}`} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredWords.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No words found</h3>
            <p className="text-gray-500 text-center mb-4">
              Try adjusting your filters or add a new word
            </p>
            <Button onClick={() => setAddDialogOpen(true)}>Add Word</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredWords.map((word) => (
            <Card key={word.id} className={clsx(!word.enabled && 'opacity-60')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center', word.enabled ? 'bg-green-100' : 'bg-gray-100')}>
                      {word.enabled ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={clsx('font-semibold text-lg', !word.enabled && 'line-through text-gray-400')}>
                          {word.word}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={clsx('rounded-full', getSeverityColor(word.severity))}>
                          {word.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="rounded-full">
                          {word.context.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(word)}
                      className="flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => void deleteWord(word.id, word.word)}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Word Dialog */}
      <AddWordDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={addWord}
      />

      {/* Edit Word Dialog */}
      {selectedWord && (
        <EditWordDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          word={selectedWord}
          onUpdate={updateWord}
        />
      )}
    </div>
  );
}

function AddWordDialog({
  open,
  onOpenChange,
  onAdd,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (word: string, severity: 'low' | 'medium' | 'high', context: string) => void;
}) {
  const [word, setWord] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [context, setContext] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!word.trim()) return;

    setIsSubmitting(true);
    try {
      await onAdd(word.trim(), severity, context);
      setWord('');
      setSeverity('medium');
      setContext('general');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Profanity Word</DialogTitle>
          <DialogDescription>Add a new word to the profanity filter list.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="word">Word</Label>
            <Input
              id="word"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              placeholder="Enter word to filter"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && word.trim()) {
                  void handleSubmit();
                }
              }}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="severity">Severity</Label>
            <Select value={severity} onValueChange={(value) => setSeverity(value as 'low' | 'medium' | 'high')}>
              <SelectTrigger id="severity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="context">Context</Label>
            <Select value={context} onValueChange={setContext}>
              <SelectTrigger id="context">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="hate_speech">Hate Speech</SelectItem>
                <SelectItem value="violence">Violence</SelectItem>
                <SelectItem value="drugs">Drugs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!word.trim() || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              'Add'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditWordDialog({
  open,
  onOpenChange,
  word,
  onUpdate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  word: ProfanityWord;
  onUpdate: (id: string, updates: { enabled?: boolean; severity?: string; context?: string }) => void;
}) {
  const [enabled, setEnabled] = useState(word.enabled);
  const [severity, setSeverity] = useState(word.severity);
  const [context, setContext] = useState(word.context);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setEnabled(word.enabled);
    setSeverity(word.severity);
    setContext(word.context);
  }, [word]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onUpdate(word.id, {
        enabled,
        severity,
        context,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasChanges = enabled !== word.enabled || severity !== word.severity || context !== word.context;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit: {word.word}</DialogTitle>
          <DialogDescription>Update the word's settings.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Enabled</Label>
            <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-severity">Severity</Label>
            <Select value={severity} onValueChange={(value) => setSeverity(value as 'low' | 'medium' | 'high')}>
              <SelectTrigger id="edit-severity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-context">Context</Label>
            <Select value={context} onValueChange={setContext}>
              <SelectTrigger id="edit-context">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="hate_speech">Hate Speech</SelectItem>
                <SelectItem value="violence">Violence</SelectItem>
                <SelectItem value="drugs">Drugs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!hasChanges || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

