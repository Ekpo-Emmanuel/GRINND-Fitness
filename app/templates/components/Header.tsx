import { Button } from "@/components/ui/button";
import { Folder, Plus } from 'lucide-react';

interface HeaderProps {
  handleCreateFolder: () => void;
  handleCreateTemplate: () => void;
}

export default function Header({ handleCreateFolder, handleCreateTemplate }: HeaderProps) {
  return (
    <header className="mb-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[color:var(--ds-text-primary)]">Templates</h1>
          <p className="text-sm text-[color:var(--ds-text-secondary)] mt-1">Save and reuse your favorite workouts</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={handleCreateFolder}
            title="Create folder"
            size="icon"
            variant="outline"
            className="border-[color:var(--ds-border)] text-[color:var(--ds-text-primary)] bg-[var(--ds-surface-elevated)] shadow-sm rounded-full hover:bg-[var(--ds-bg-secondary)] transition-colors"
          >
            <Folder className="h-5 w-5" />
          </Button>
          <Button
            onClick={handleCreateTemplate}
            className="text-[var(--ds-on-accent)] border-0 shadow-sm font-semibold"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--ds-gradient-purple-from), var(--ds-gradient-purple-to))' }}
          >
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>
      </div>
    </header>
  );
} 