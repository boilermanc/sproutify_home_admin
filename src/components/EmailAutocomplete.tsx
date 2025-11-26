import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Mail } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface UserEmail {
  email: string;
  id: string;
  first_name: string | null;
  last_name: string | null;
}

interface EmailAutocompleteProps {
  value: string;
  onChange: (email: string) => void;
  onSelect?: (email: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function EmailAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "user@example.com",
  className,
  disabled,
}: EmailAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<UserEmail[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const searchEmails = async () => {
      const query = value.trim().toLowerCase();
      
      if (query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('v_user_dashboard')
          .select('*')
          .ilike('email', `%${query}%`)
          .limit(10);

        if (error) {
          console.error('Error searching emails:', error);
          setSuggestions([]);
        } else {
          const users = (data || []) as unknown as UserEmail[];
          setSuggestions(users);
          setShowSuggestions(users.length > 0);
        }
      } catch (error) {
        console.error('Error searching emails:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchEmails, 300);
    return () => clearTimeout(timeoutId);
  }, [value]);

  const handleSelect = (email: string) => {
    onChange(email);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSelect?.(email);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex].email || '');
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          className={cn("pl-9", className)}
          disabled={disabled}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {suggestions.map((user, index) => {
            const fullName = user.first_name && user.last_name
              ? `${user.first_name} ${user.last_name}`
              : null;
            const displayName = fullName || user.email;

            return (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelect(user.email || '')}
                className={cn(
                  "w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground transition-colors flex items-center gap-3",
                  index === selectedIndex && "bg-accent text-accent-foreground"
                )}
              >
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{displayName}</div>
                  {fullName && (
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

