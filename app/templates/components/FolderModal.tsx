import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FolderPlus } from 'lucide-react';

interface FolderModalProps {
  showModal: boolean;
  folderName: string;
  setFolderName: (name: string) => void;
  handleSubmit: () => void;
  handleClose: () => void;
}

export default function FolderModal({ 
  showModal, 
  folderName, 
  setFolderName, 
  handleSubmit, 
  handleClose 
}: FolderModalProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && folderName.trim()) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={open => { if (!open) handleClose(); }}>
      <DialogContent className="max-w-sm bg-[var(--ds-surface)] border-[color:var(--ds-border)] rounded-2xl shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-4 ">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-[var(--ds-accent-purple)]/10">
              <FolderPlus className="h-6 w-6 text-[var(--ds-accent-purple)]" />
            </div>
            <DialogTitle className="text-2xl font-bold text-[color:var(--ds-text-primary)]">
              New Folder
            </DialogTitle>
          </div>
          <p className="text-sm text-[color:var(--ds-text-secondary)] text-left leading-relaxed">
            Organize your workout templates by creating a new folder.
          </p>
        </DialogHeader>
        
        <div className="space-y-4 p-4">
          <div className="space-y-2 ">
            <Label 
              htmlFor="folder-name" 
              className="text-sm font-medium text-[color:var(--ds-text-primary)]"
            >
              Folder name
            </Label>
            <Input
              id="folder-name"
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter folder name..."
              className="h-12 px-4  border-2 border-[color:var(--ds-border)] bg-[var(--ds-surface-elevated)] text-[color:var(--ds-text-primary)] placeholder:text-[color:var(--ds-text-secondary)] focus:border-[var(--ds-accent-purple)] focus:ring-0 transition-colors"
              autoFocus
            />
          </div>
        </div>
        
        <DialogFooter className="space-x-3 p-4 border-t border-[color:var(--ds-border)] bg-[var(--ds-surface-elevated)]">
          <Button 
            variant="outline" 
            onClick={handleClose} 
            type="button"
            size="sm"
            className="md:flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!folderName.trim()} 
            type="button"
            variant="primary"
            size="sm"
            className="md:flex-1"
          >
            Create Folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 