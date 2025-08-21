'use client';

import { Id } from '@/convex/_generated/dataModel';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TemplateDetails from './TemplateDetails';
import StartWorkoutButton from './StartWorkoutButton';

interface TemplateModalProps {
  isOpen: boolean;
  selectedTemplate: Id<'workoutTemplates'> | null;
  templateDetails: any;
  isEditing: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  isStartingWorkout: boolean;
  templateFolder: any;
  folders: any[];
  onClose: () => void;
  onDeleteTemplate: (templateId: Id<'workoutTemplates'>) => void;
  onAssignFolder: (folderId: Id<'folders'>) => void;
  onRemoveFromFolder: () => void;
  onUpdateTemplate: (template: any) => Promise<void>;
  onEditingStateChange: (editing: boolean) => void;
  onSavingStateChange: (saving: boolean) => void;
  onDuplicateTemplate: (template: any) => void;
  onStartWorkout: (templateId: Id<'workoutTemplates'>) => void;
  onCancelEditing: () => void;
}

export default function TemplateModal({
  isOpen,
  selectedTemplate,
  templateDetails,
  isEditing,
  isSaving,
  isDeleting,
  isStartingWorkout,
  templateFolder,
  folders,
  onClose,
  onDeleteTemplate,
  onAssignFolder,
  onRemoveFromFolder,
  onUpdateTemplate,
  onEditingStateChange,
  onSavingStateChange,
  onDuplicateTemplate,
  onStartWorkout,
  onCancelEditing,
}: TemplateModalProps) {
  if (!isOpen || !selectedTemplate) {
    return null;
  }

  const handleSaveChanges = () => {
    const templateDetailsElement = document.querySelector('[data-template-details]');
    if (templateDetailsElement) {
      const saveButton = templateDetailsElement.querySelector('[data-save-changes]') as HTMLButtonElement;
      if (saveButton) {
        saveButton.click();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="relative bg-[var(--ds-surface)] rounded-2xl shadow-2xl border border-[color:var(--ds-border)] w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col">
        <button
          onClick={onClose}
          className="hidden"
          aria-label="Close modal"
          data-modal-close
        >
          <X className="h-6 w-6" />
        </button>
        
        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          <TemplateDetails 
            template={templateDetails}
            handleDeleteTemplate={onDeleteTemplate}
            isDeleting={isDeleting}
            currentFolder={templateFolder}
            folders={folders}
            onAssignFolder={onAssignFolder}
            onRemoveFromFolder={onRemoveFromFolder}
            onUpdateTemplate={onUpdateTemplate}
            onEditingStateChange={onEditingStateChange}
            onSavingStateChange={onSavingStateChange}
            onDuplicateTemplate={onDuplicateTemplate}
          />
        </div>
        
        <div className="p-4 border-t border-[color:var(--ds-border)] bg-[var(--ds-surface-elevated)]">
          {isEditing ? (
            <div className="flex space-x-3">
              <Button
                onClick={onCancelEditing}
                variant="outline"
                size="xl"
                className="w-full flex-1"
                id="modal-cancel-button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving}
                variant="primary"
                size="xl"
                id="modal-save-button"
                className='w-full flex-1'
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          ) : (
            <StartWorkoutButton 
              templateId={selectedTemplate}
              isStartingWorkout={isStartingWorkout}
              handleStartWorkout={onStartWorkout}
              inModal={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}
