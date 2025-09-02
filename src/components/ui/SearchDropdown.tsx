import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchSuggestion } from '@/hooks/useSearch';

interface SearchDropdownProps {
  suggestions: SearchSuggestion[];
  isOpen: boolean;
  query: string;
  onClose: () => void;
  className?: string;
}

const SearchDropdown = forwardRef<HTMLDivElement, SearchDropdownProps>(
  ({ suggestions, isOpen, query, onClose, className }, ref) => {
    if (!isOpen || suggestions.length === 0) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "absolute top-full left-0 right-0 mt-2 bg-popover border rounded-md shadow-lg z-50 max-h-80 overflow-y-auto",
          className
        )}
      >
        <div className="p-2">
          <div className="text-xs text-muted-foreground mb-2 px-2">
            {suggestions.length} result{suggestions.length !== 1 ? 's' : ''} for "{query}"
          </div>
          {suggestions.map((suggestion) => (
            <Link
              key={suggestion.id}
              to={`/article/${suggestion.id}`}
              onClick={onClose}
              className="flex items-start gap-3 p-3 hover:bg-accent rounded-md transition-colors group"
            >
              <div className="flex-shrink-0 mt-0.5">
                <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-foreground group-hover:text-primary line-clamp-1">
                  {suggestion.title}
                </h4>
                {suggestion.excerpt && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {suggestion.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                    {suggestion.category}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {suggestions.length === 5 && (
          <div className="border-t p-2">
            <Link
              to={`/articles?search=${encodeURIComponent(query)}`}
              onClick={onClose}
              className="flex items-center justify-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              <Search className="h-4 w-4" />
              View all results
            </Link>
          </div>
        )}
      </div>
    );
  }
);

SearchDropdown.displayName = 'SearchDropdown';

export { SearchDropdown };