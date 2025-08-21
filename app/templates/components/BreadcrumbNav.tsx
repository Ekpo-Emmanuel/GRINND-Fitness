import { Id } from '@/convex/_generated/dataModel';
import { ChevronRight, Home } from 'lucide-react';

interface Folder {
  _id: Id<'folders'>;
  name: string;
}

interface BreadcrumbNavProps {
  selectedFolder: Folder | null;
  onNavigateToFolder: (folderId: Id<'folders'> | null) => void;
}

export default function BreadcrumbNav({ selectedFolder, onNavigateToFolder }: BreadcrumbNavProps) {
  if (!selectedFolder) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onNavigateToFolder(null)}
        className="flex items-center space-x-2 text-[var(--ds-accent-purple)] transition-colors p-2 rounded-lg hover:bg-[var(--ds-surface)] group"
        aria-label="Go back to all templates"
      >
        <div className="p-1 rounded-md  bg-[var(--ds-accent-purple)]/10 transition-colors">
          <Home className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">Back</span>
      </button>
      <ChevronRight className="h-4 w-4 text-[color:var(--ds-text-secondary)]/50" />
      <div className="flex items-center space-x-2">
        <div className="p-1 rounded-md bg-[var(--ds-accent-purple)]/10">
          <div className="w-2 h-2 rounded-full bg-[var(--ds-accent-purple)]"></div>
        </div>
        <span className="text-[color:var(--ds-text-primary)] font-semibold text-sm">{selectedFolder.name}</span>
      </div>
    </div>
  );
} 