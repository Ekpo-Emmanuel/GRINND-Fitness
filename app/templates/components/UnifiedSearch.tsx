import { Input } from '@/components/ui/input';
import { Id } from '@/convex/_generated/dataModel';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Folder } from 'lucide-react'; 

interface Folder {
  _id: Id<'folders'>;
  name: string;
}

interface Template {
  _id: Id<'workoutTemplates'>;
  name: string;
  targetDay?: string;
  muscleGroups: any[];
}

interface UnifiedSearchProps {
  folders: Folder[];
  templates: Template[];
  onSearchChange: (query: string) => void;
  onSelectFolder: (folderId: Id<'folders'> | null) => void;
  onSelectTemplate: (templateId: Id<'workoutTemplates'>) => void;
  selectedFolder: Id<'folders'> | null;
}

export default function UnifiedSearch({
  folders,
  templates,
  onSearchChange,
  onSelectFolder,
  onSelectTemplate,
  selectedFolder
}: UnifiedSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  
  // Filter folders and templates based on search query
  const filteredFolders = folders.filter(folder => 
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredTemplates = templates.filter(template => 
    template.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Hide results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.search-container')) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearchChange(query);
    setShowResults(query.length > 0);
  };
  
  // Handle selecting a folder from search results
  const handleSelectFolder = (folderId: Id<'folders'> | null) => {
    onSelectFolder(folderId);
    setShowResults(false);
    setSearchQuery('');
  };
  
  // Handle selecting a template from search results
  const handleSelectTemplate = (templateId: Id<'workoutTemplates'>) => {
    onSelectTemplate(templateId);
    setShowResults(false);
    setSearchQuery('');
  };
  
  return (
    <div className="search-container relative">
      {/* Search input with icon inside */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[color:var(--ds-text-secondary)]" />
        </div>
        <Input
          type="text"
          placeholder="Search folders and templates"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full bg-[var(--ds-surface-elevated)] pl-12 pr-4 py-3"
        />
      </div>
      
      {/* Search results dropdown */}
      {showResults && searchQuery.length > 0 && (
        <div className="absolute z-10 mt-2 w-full bg-[var(--ds-surface)] rounded-xl shadow-2xl border border-[color:var(--ds-border)] max-h-[300px] overflow-y-auto">
          {/* Folders section */}
          {filteredFolders.length > 0 && (
            <div className="p-3">
              <div className="text-xs font-semibold text-[color:var(--ds-text-secondary)] uppercase tracking-wider px-3 py-2">
                Folders
              </div>
              <div className="space-y-1">
                {filteredFolders.map(folder => (
                  <button
                    key={folder._id}
                    onClick={() => handleSelectFolder(folder._id)}
                    className={`w-full text-left px-3 py-3 rounded-xl text-sm flex items-center space-x-3 transition-colors ${
                      selectedFolder === folder._id 
                        ? 'bg-[var(--ds-accent-purple)] text-[var(--ds-on-accent)]' 
                        : 'hover:bg-[var(--ds-surface-elevated)] text-[color:var(--ds-text-primary)]'
                    }`}
                  >
                    <Folder className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium">{folder.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Templates section */}
          {filteredTemplates.length > 0 && (
            <div className="p-3 border-t border-[color:var(--ds-border)]">
              <div className="text-xs font-semibold text-[color:var(--ds-text-secondary)] uppercase tracking-wider px-3 py-2">
                Templates
              </div>
              <div className="space-y-1">
                {filteredTemplates.map(template => (
                  <button
                    key={template._id}
                    onClick={() => handleSelectTemplate(template._id)}
                    className="w-full text-left px-3 py-3 rounded-xl text-sm hover:bg-[var(--ds-surface-elevated)] text-[color:var(--ds-text-primary)] transition-colors font-medium"
                  >
                    {template.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* No results message */}
          {filteredFolders.length === 0 && filteredTemplates.length === 0 && (
            <div className="p-6 text-center text-[color:var(--ds-text-secondary)] text-sm">
              No results found for "{searchQuery}"
            </div>
          )}
        </div>
      )}
    </div>
  );
} 