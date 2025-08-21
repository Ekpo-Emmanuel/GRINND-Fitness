import { Id } from '@/convex/_generated/dataModel';
import { useState, useEffect, useRef } from 'react';
import { Calendar, Trash2, FolderIcon, FileText, X, ChevronDown, ChevronUp, Info, Target, Edit, Plus, Save, Ellipsis, Minus, Activity, BicepsFlexed, Pencil, FolderOpen, Trash } from 'lucide-react';
import { Pill } from '@/components/ui/pill';
import { Button } from '@/components/ui/button';
import { Input, EditableInput } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Exercise {
  id: string;
  name: string;
  notes?: string;
  sets: {
    id?: string;
    reps?: string | number;
    weight?: string | number;
  }[];
}

interface MuscleGroup {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface Template {
  _id: Id<'workoutTemplates'>;
  name: string;
  targetDay?: string;
  description?: string;
  muscleGroups: MuscleGroup[];
  _creationTime?: number;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Folder {
  _id: Id<'folders'>;
  name: string;
  userId?: string;
  createdAt?: string;
  _creationTime?: number;
}

interface TemplateDetailsProps {
  template: Template | null | undefined;
  handleDeleteTemplate: (templateId: Id<'workoutTemplates'>) => void;
  isDeleting: boolean;
  currentFolder: Folder | null | undefined;
  folders: Folder[];
  onAssignFolder: (folderId: Id<'folders'>) => void;
  onRemoveFromFolder: () => void;
  onUpdateTemplate?: (updatedTemplate: Template) => Promise<void>;
  onEditingStateChange?: (isEditing: boolean) => void;
  onSavingStateChange?: (isSaving: boolean) => void;
  onDuplicateTemplate?: (template: Template) => void;
}

// Available muscle groups for selection
const AVAILABLE_MUSCLE_GROUPS = [
  { id: 'chest', name: 'Chest' },
  { id: 'back', name: 'Back' },
  { id: 'shoulders', name: 'Shoulders' },
  { id: 'biceps', name: 'Biceps' },
  { id: 'triceps', name: 'Triceps' },
  { id: 'legs', name: 'Legs' },
  { id: 'glutes', name: 'Glutes' },
  { id: 'abs', name: 'Abs' },
  { id: 'calves', name: 'Calves' },
  { id: 'core', name: 'Core' },
  { id: 'fullBody', name: 'Full Body' }
];

// Generate a unique ID for new items
const generateId = () => Math.random().toString(36).substring(2, 10);

export default function TemplateDetails({
  template,
  handleDeleteTemplate,
  isDeleting,
  currentFolder,
  folders,
  onAssignFolder,
  onRemoveFromFolder,
  onUpdateTemplate,
  onEditingStateChange,
  onSavingStateChange,
  onDuplicateTemplate
}: TemplateDetailsProps) {
  const [showFolderSelector, setShowFolderSelector] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState<Template | null>(null);
  const [showAddMuscleGroup, setShowAddMuscleGroup] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'close' | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [swipeStates, setSwipeStates] = useState<Record<string, { isSwipedLeft: boolean; translateX: number }>>({});

  const originalTemplateRef = useRef<string>('');

  useEffect(() => {
    if (isEditing && editedTemplate) {
      const currentTemplateJson = JSON.stringify(editedTemplate);
      const hasChanges = currentTemplateJson !== originalTemplateRef.current;
      console.log("Checking for unsaved changes:", hasChanges, "isEditing:", isEditing);
      setHasUnsavedChanges(hasChanges);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [editedTemplate, isEditing]);

  useEffect(() => {
    if (onEditingStateChange) {
      onEditingStateChange(isEditing);
    }
  }, [isEditing, onEditingStateChange]);

  useEffect(() => {
    if (onSavingStateChange) {
      onSavingStateChange(isSaving);
    }
  }, [isSaving, onSavingStateChange]);

  // Reset description expansion when template changes
  useEffect(() => {
    setShowFullDescription(false);
  }, [template?._id]);

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const startEditing = () => {
    if (template) {
      const templateCopy = JSON.parse(JSON.stringify(template));
      setEditedTemplate(templateCopy);
      originalTemplateRef.current = JSON.stringify(templateCopy);
      setIsEditing(true);
      setShowFullDescription(false);
    }
  };

  const attemptCancelEditing = () => {
    console.log("attemptCancelEditing called, hasUnsavedChanges:", hasUnsavedChanges);
    if (hasUnsavedChanges) {
      setPendingAction('close');
      setShowUnsavedChangesDialog(true);
    } else {
      cancelEditing();
    }
  };

  const cancelEditing = () => {
    console.log("cancelEditing called");
    setIsEditing(false);
    setEditedTemplate(null);
    setShowAddMuscleGroup(false);
    setNewExerciseName({});
    setHasUnsavedChanges(false);
    setPendingAction(null);
    setShowUnsavedChangesDialog(false);
    setSwipeStates({});

    if (onEditingStateChange) {
      onEditingStateChange(false);
    }
  };

  const saveChanges = async () => {
    if (editedTemplate && onUpdateTemplate) {
      try {
        setIsSaving(true);
        await onUpdateTemplate(editedTemplate);
        setIsEditing(false);
        setEditedTemplate(null);
        setShowAddMuscleGroup(false);
        setHasUnsavedChanges(false);
        setSwipeStates({});
      } catch (error) {
        console.error('Error updating template:', error);
        alert('Failed to update template. Please try again.');
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedTemplate) {
      setEditedTemplate({
        ...editedTemplate,
        name: e.target.value
      });
    }
  };

  const handleDayChange = (day: string | undefined) => {
    if (editedTemplate) {
      setEditedTemplate({
        ...editedTemplate,
        targetDay: day
      });
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (editedTemplate) {
      setEditedTemplate({
        ...editedTemplate,
        description: e.target.value
      });
    }
  };

  const addMuscleGroup = (groupId: string, groupName: string) => {
    if (editedTemplate) {
      if (editedTemplate.muscleGroups.some(g => g.id === groupId)) {
        return;
      }

      const newGroup: MuscleGroup = {
        id: groupId,
        name: groupName,
        exercises: []
      };

      setEditedTemplate({
        ...editedTemplate,
        muscleGroups: [...editedTemplate.muscleGroups, newGroup]
      });

      setExpandedGroups(prev => ({
        ...prev,
        [groupId]: true
      }));

      setShowAddMuscleGroup(false);
    }
  };

  const removeMuscleGroup = (groupId: string) => {
    if (editedTemplate) {
      setEditedTemplate({
        ...editedTemplate,
        muscleGroups: editedTemplate.muscleGroups.filter(g => g.id !== groupId)
      });
    }
  };

  const addExercise = (groupId: string) => {
    if (editedTemplate && newExerciseName[groupId]?.trim()) {
      const updatedGroups = editedTemplate.muscleGroups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            exercises: [
              ...group.exercises,
              {
                id: generateId(),
                name: newExerciseName[groupId].trim(),
                notes: '',
                sets: []
              }
            ]
          };
        }
        return group;
      });

      setEditedTemplate({
        ...editedTemplate,
        muscleGroups: updatedGroups
      });

      setNewExerciseName({
        ...newExerciseName,
        [groupId]: ''
      });
    }
  };

  const removeExercise = (groupId: string, exerciseId: string) => {
    if (editedTemplate) {
      const updatedGroups = editedTemplate.muscleGroups.map(group => {
        if (group.id === groupId) {
          return {
            ...group,
            exercises: group.exercises.filter(ex => ex.id !== exerciseId)
          };
        }
        return group;
      });

      setEditedTemplate({
        ...editedTemplate,
        muscleGroups: updatedGroups
      });

      // Reset swipe state for the removed exercise
      setSwipeStates(prev => {
        const newState = { ...prev };
        delete newState[exerciseId];
        return newState;
      });
    }
  };

  const handleTouchStart = (exerciseId: string, e: React.TouchEvent) => {
    if (!isEditing) return;
    
    console.log('Touch start detected for exercise:', exerciseId);
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;
    let currentTranslateX = 0;
    
    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
      
      console.log('Touch move - deltaX:', deltaX, 'deltaY:', deltaY);
      
      // Only handle horizontal swipes that are more horizontal than vertical
      if (Math.abs(deltaX) > Math.abs(deltaY) + 10) {
        e.preventDefault(); // Prevent scrolling only when we're sure it's a horizontal swipe
        console.log('Horizontal swipe detected, deltaX:', deltaX);
        
        // Only allow left swipe (negative delta)
        if (deltaX < 0) {
          currentTranslateX = Math.max(deltaX, -80); // Limit to -80px
          console.log('Left swipe, translateX:', currentTranslateX);
          setSwipeStates(prev => ({
            ...prev,
            [exerciseId]: {
              isSwipedLeft: currentTranslateX < -40,
              translateX: currentTranslateX
            }
          }));
        } else {
          // Reset if swiping right
          currentTranslateX = 0;
          setSwipeStates(prev => ({
            ...prev,
            [exerciseId]: {
              isSwipedLeft: false,
              translateX: 0
            }
          }));
        }
      }
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      // Finalize the swipe state
      if (currentTranslateX < -40) {
        // Lock in the swiped state
        setSwipeStates(prev => ({
          ...prev,
          [exerciseId]: {
            isSwipedLeft: true,
            translateX: -80
          }
        }));
      } else {
        // Reset to original position
        setSwipeStates(prev => ({
          ...prev,
          [exerciseId]: {
            isSwipedLeft: false,
            translateX: 0
          }
        }));
      }
      
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  const resetSwipeState = (exerciseId: string) => {
    setSwipeStates(prev => ({
      ...prev,
      [exerciseId]: {
        isSwipedLeft: false,
        translateX: 0
      }
    }));
  };

  if (!template) {
    return (
      <div className="bg-[var(--ds-surface)] rounded-2xl border border-[color:var(--ds-border)] p-6 flex flex-col items-center justify-center h-48 shadow-sm">
        <FileText className="h-12 w-12 mb-3 text-[color:var(--ds-text-secondary)]" />
        <h3 className="text-lg font-medium text-[color:var(--ds-text-primary)] mb-1">Select a template</h3>
        <p className="text-sm text-[color:var(--ds-text-secondary)] text-center">
          Choose a template from the list to view details
        </p>
      </div>
    );
  }

  const formatDayName = (day: string | undefined) => {
    if (!day) return 'Any day';
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const totalExercises = template.muscleGroups.reduce(
    (sum, group) => sum + group.exercises.length, 0
  );

  const displayTemplate = isEditing && editedTemplate ? editedTemplate : template;

  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  return (
    <div className="p-4" data-template-details>
      <div className="hidden">
        <button
          onClick={saveChanges}
          data-save-changes
          type="button"
          aria-hidden="true"
        >
          Save Changes
        </button>

        <button
          onClick={attemptCancelEditing}
          data-cancel-editing
          type="button"
          aria-hidden="true"
        >
          Cancel Editing
        </button>
      </div>

      {/* Template name and dropdown */}
      <div className="flex justify-between items-start mb-2">
        <div className="w-full pr-10">
          {isEditing ? (
            <EditableInput
              type="text"
              value={displayTemplate.name}
              onChange={handleNameChange}
              className="text-2xl font-bold text-[color:var(--ds-text-primary)] mb-2 break-words overflow-auto bg-transparent border-0 focus:ring-0 focus:border-b-2 focus:border-[var(--ds-accent-purple)] rounded-none pb-1"
              placeholder="Template name"
            />
          ) : (
            <h2 className="text-2xl font-bold text-[color:var(--ds-text-primary)] break-words">
              {displayTemplate.name}
            </h2>
          )}
        </div>
        <div className="flex-shrink-0 flex items-center">
          {/* Edit template button */}
          {!isEditing && onUpdateTemplate && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={startEditing}
                  className="p-2 text-[color:var(--ds-text-secondary)] hover:text-[color:var(--ds-text-primary)] hover:bg-[var(--ds-surface-elevated)] rounded-xl transition-colors flex items-center justify-center h-10 w-10"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit template</p>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Assign to folder button */}
          {!isEditing && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowFolderSelector(!showFolderSelector)}
                  className="p-2 text-[color:var(--ds-text-secondary)] hover:text-[color:var(--ds-text-primary)] hover:bg-[var(--ds-surface-elevated)] rounded-xl transition-colors flex items-center justify-center h-10 w-10"
                >
                  <FolderOpen className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{showFolderSelector ? 'Hide folder options' : 'Assign to folder'}</p>
              </TooltipContent>
            </Tooltip>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 text-[color:var(--ds-text-secondary)] hover:text-[color:var(--ds-text-primary)] hover:bg-[var(--ds-surface-elevated)] rounded-xl transition-colors flex items-center justify-center h-10 w-10">
                <Ellipsis className="h-5 w-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[var(--ds-surface)] border-[color:var(--ds-border)] rounded-xl shadow-lg">
              {!isEditing && (
                <DropdownMenuItem
                  onClick={() => {
                    if (onDuplicateTemplate && template) {
                      onDuplicateTemplate(template);
                    }
                  }}
                  className="cursor-pointer flex items-center text-[color:var(--ds-text-primary)] hover:bg-[var(--ds-surface-elevated)]"
                >
                  <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span className="truncate">Duplicate template</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  if (!isEditing) {
                    handleDeleteTemplate(template._id);
                  }
                }}
                disabled={isEditing || isDeleting}
                className={`${isEditing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} text-[var(--ds-error)] hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center`}
                title={isEditing ? "Save or cancel your changes first" : ""}
              >
                <Trash2 className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Delete template</span>
              </DropdownMenuItem>

              {isEditing && (
                <>
                  <div className="h-px bg-[color:var(--ds-border)] my-1" />
                  <DropdownMenuItem onClick={saveChanges} disabled={isSaving} className="cursor-pointer flex items-center text-[color:var(--ds-text-primary)] hover:bg-[var(--ds-surface-elevated)]">
                    <Save className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Save changes</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={attemptCancelEditing} className="cursor-pointer text-[var(--ds-error)] hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center">
                    <X className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">Cancel editing</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Close button */}
          <button
            onClick={() => {
              if (isEditing && hasUnsavedChanges) {
                setPendingAction('close');
                setShowUnsavedChangesDialog(true);
              } else {
                console.log("Closing modal directly");
                const closeButton = document.querySelector('[data-modal-close]') as HTMLButtonElement;
                if (closeButton) {
                  closeButton.click();
                }
              }
            }}
            className="p-2 text-[color:var(--ds-text-secondary)] hover:text-[color:var(--ds-text-primary)] hover:bg-[var(--ds-surface-elevated)] rounded-xl transition-colors flex items-center justify-center h-10 w-10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Target day and exercise count */}
      <div className="flex flex-wrap gap-3 mb-6">
        {isEditing ? (
          <div className="w-full">
            <label className="block text-sm font-medium text-[color:var(--ds-text-primary)] mb-2">Target Day</label>
            <div className="grid grid-cols-7 gap-1">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayChange(displayTemplate.targetDay === day ? undefined : day)}
                  className={`p-3 font-medium rounded flex items-center justify-center transition-all ${displayTemplate.targetDay === day
                    ? 'bg-[var(--ds-accent-purple)] border border-[var(--ds-accent-purple)] text-[var(--ds-on-accent)] scale-105'
                    : 'bg-[var(--ds-surface-elevated)] border border-[color:var(--ds-border)] text-[color:var(--ds-text-primary)] hover:border-[var(--ds-accent-purple)] hover:bg-[var(--ds-surface)]'
                    }`}
                >
                  {day.charAt(0).toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        ) : (
          displayTemplate.targetDay && (
            <Pill variant="secondary" size="sm" icon={<Calendar />}>
              {formatDayName(displayTemplate.targetDay)}
            </Pill>
          )
        )}
        {!isEditing && (
          <Pill variant="secondary" size="sm" icon={<Activity />}>
            {displayTemplate.muscleGroups.reduce((sum, group) => sum + group.exercises.length, 0)} exercise{displayTemplate.muscleGroups.reduce((sum, group) => sum + group.exercises.length, 0) !== 1 ? 's' : ''}
          </Pill>
        )}
        {!isEditing && displayTemplate.muscleGroups.length > 0 && (
          <Pill variant="tertiary" size="sm" icon={<BicepsFlexed />}>
            {displayTemplate.muscleGroups.map(group => group.name).join(', ')}
          </Pill>
        )}
        {/* {currentFolder && !showFolderSelector && !isEditing && (
          <Pill variant="secondary" size="sm" icon={<FolderIcon />}>
            {currentFolder.name}
          </Pill>
        )} */}
      </div>

      {/* Folder assignment section */}
      {showFolderSelector && !isEditing && (
        <div className="mb-6 bg-[var(--ds-surface-elevated)] p-4 rounded-2xl border border-[color:var(--ds-border)]">
          <p className="text-sm font-medium text-[color:var(--ds-text-primary)] mb-3">Assign to folder:</p>
          <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto pr-1">
            {folders.map(folder => (
              <Button
                key={folder._id}
                onClick={() => {
                  onAssignFolder(folder._id);
                  setShowFolderSelector(false);
                }}
                variant={currentFolder?._id === folder._id ? "purple" : "outline-purple"}
                size="tag"
                className={currentFolder?._id === folder._id ? "scale-105" : ""}
              >
                {folder.name}
              </Button>
            ))}
            {currentFolder && (
              <Button
                onClick={() => {
                  onRemoveFromFolder();
                  setShowFolderSelector(false);
                }}
                variant="destructive"
                size="tag"
                className="bg-red-50 text-[var(--ds-error)] border-2 border-red-200 hover:bg-red-100"
              >
                Remove from folder
              </Button>
            )}
          </div>
        </div>
      )}


      {/* Description field - editable in edit mode */}
      {isEditing ? (
        <div className="mb-6">
          <label className="block text-sm font-medium text-[color:var(--ds-text-primary)] mb-2">Description (optional)</label>
          <textarea
            value={displayTemplate.description || ''}
            onChange={handleDescriptionChange}
            placeholder="Add a description for this template..."
            className="w-full p-4 border border-[color:var(--ds-border)] rounded-lg max-h-[120px] text-[color:var(--ds-text-primary)] bg-[var(--ds-surface)] placeholder:text-[color:var(--ds-text-secondary)] focus:outline-none focus:ring-0 focus:border-[var(--ds-accent-purple)] transition-colors resize-none placeholder:text-sm placeholder:text-sm"
          />
        </div>
      ) : displayTemplate.description ? (
        <div className="mb-6 bg-[var(--ds-surface-elevated)] p-4 rounded-xl border border-[color:var(--ds-border)]">
          <p className="text-sm text-[color:var(--ds-text-secondary)] whitespace-pre-wrap">
            {displayTemplate.description.length > 70 && !showFullDescription ? (
              <>
                {displayTemplate.description.slice(0, 70)}...{' '}
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-xs text-[var(--ds-accent-purple)] hover:text-[var(--ds-accent-purple)]/80 font-medium transition-colors inline"
                >
                  See all
                </button>
              </>
            ) : (
              <>
                {displayTemplate.description}
                {displayTemplate.description.length > 70 && showFullDescription && (
                  <>
                    {' '}
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="text-xs text-[var(--ds-accent-purple)] hover:text-[var(--ds-accent-purple)]/80 font-medium transition-colors inline"
                    >
                      Show less
                    </button>
                  </>
                )}
              </>
            )}
          </p>
        </div>
      ) : null}

      {/* Add Muscle Group button (edit mode only) */}
      {isEditing && (
        <div className="mb-4">
          {!showAddMuscleGroup ? (
            <Button
              onClick={() => setShowAddMuscleGroup(true)}
              variant="accent"
              size="sm"
              className="w-full"
            >
              <Plus className="h-4 w-4" />
              Add muscle group
            </Button>
          ) : (
            <div className="bg-[var(--ds-surface-elevated)] p-6 rounded-2xl border-2 border-[var(--ds-accent-purple)]/30 shadow-sm">
              <h3 className="text-base font-semibold text-[color:var(--ds-text-primary)] mb-4">Add Muscle Group</h3>
              <div className="grid grid-cols-2 gap-3">
                {AVAILABLE_MUSCLE_GROUPS
                  .filter(group => !editedTemplate?.muscleGroups.some(g => g.id === group.id))
                  .map(group => (
                    <Button
                      key={group.id}
                      onClick={() => addMuscleGroup(group.id, group.name)}
                      className="text-sm py-3 px-4 h-auto rounded-xl border-2 border-[color:var(--ds-border)] hover:border-[var(--ds-accent-purple)] hover:bg-[var(--ds-surface)] transition-all"
                      variant="outline"
                    >
                      {group.name}
                    </Button>
                  ))}
              </div>
              <Button
                onClick={() => setShowAddMuscleGroup(false)}
                className="mt-4 w-full text-sm py-3 h-auto rounded-xl bg-[var(--ds-surface)] hover:bg-[var(--ds-bg-secondary)] text-[color:var(--ds-text-secondary)] border-2 border-[color:var(--ds-border)]"
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Muscle groups container */}
      <div className="space-y-4">
        {displayTemplate.muscleGroups.map(group => {
          const isExpanded = expandedGroups[group.id] === true;
          return (
            <div key={group.id} className="border border-[color:var(--ds-border)] rounded-2xl overflow-hidden  bg-[var(--ds-surface)]">
              <button
                onClick={() => toggleGroupExpansion(group.id)}
                className={`w-full bg-[var(--ds-surface-elevated)] p-4 flex justify-between items-center transition-colors hover:bg-[var(--ds-bg-secondary)] ${isExpanded ? 'border-b-1 border-[color:var(--ds-border)]' : 'border-none'}`}
              >
                <div className='flex gap-2 items-center'>
                  <div className="flex items-center text-[color:var(--ds-text-secondary)] gap-3">
                    {isEditing && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMuscleGroup(group.id);
                        }}
                        variant="ghost"
                        size="icon"
                        className="text-[var(--ds-error)] hover:text-red-700 hover:bg-red-50 h-8 w-8"
                        title="Remove muscle group"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <h3 className="font-semibold text-lg text-[color:var(--ds-text-primary)]">{group.name}</h3>
                </div>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-[color:var(--ds-text-secondary)]'>
                    {group.exercises.length} exercise{group.exercises.length !== 1 ? 's' : ''}
                  </span>
                  {isExpanded 
                    ? <ChevronUp className="h-5 w-5 text-[color:var(--ds-text-secondary)]" /> 
                    : <ChevronDown className="h-5 w-5 text-[color:var(--ds-text-secondary)]" />
                  }
                </div>
              </button>

              {isExpanded && (
                <div className="p-6">
                  <div className="space-y-4">
                    {group.exercises.map((exercise, index) => {
                      const swipeState = swipeStates[exercise.id] || { isSwipedLeft: false, translateX: 0 };
                      
                      return (
                        <div key={exercise.id} className="border-b-2 border-[color:var(--ds-border)]/30 pb-4 last:border-b-0 last:pb-0 relative overflow-hidden">
                          {isEditing && (
                            <div className="absolute -translate-y-[5px] right-0 flex items-center justify-center">
                              <Button
                                onClick={() => removeExercise(group.id, exercise.id)}
                                size="icon"
                                className="text-red-500 hover:text-red-500 hover:bg-red-600 bg-transparent shadow-none"
                                title="Delete exercise"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          
                          {/* Exercise content (swipeable) */}
                          <div 
                            className="relative bg-[var(--ds-surface)] transition-transform duration-200 ease-out group touch-pan-y select-none"
                            style={{ 
                              transform: `translateX(${swipeState.translateX}px)`,
                              touchAction: isEditing ? 'pan-y' : 'auto'
                            }}
                            onTouchStart={isEditing ? (e) => handleTouchStart(exercise.id, e) : undefined}
                            onClick={swipeState.isSwipedLeft ? () => resetSwipeState(exercise.id) : undefined}
                          >
                            <div className="flex justify-between items-center">
                              <div className="font-medium text-base text-[color:var(--ds-text-primary)] mb-1">{exercise.name}</div>
                              {/* <div className="flex items-center gap-2">
                                {isEditing && !swipeState.isSwipedLeft && (
                                  <button
                                    onClick={() => removeExercise(group.id, exercise.id)}
                                    className="text-[var(--ds-error)] hover:text-red-700 transition-all p-2 rounded hover:bg-red-50"
                                    title="Remove exercise"
                                  >
                                    <Minus className="h-4 w-4" strokeWidth={4} />
                                  </button>
                                )}
                              </div> */}
                            </div>
                            {exercise.notes && (
                              <div className="text-sm text-[color:var(--ds-text-secondary)] italic mt-1">{exercise.notes}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add exercise input (edit mode only) */}
                  {isEditing && (
                    <div className="pt-4 flex gap-2">
                      <Input
                        type="text"
                        placeholder="Add new exercise..."
                        value={newExerciseName[group.id] || ''}
                        onChange={(e) => setNewExerciseName({
                          ...newExerciseName,
                          [group.id]: e.target.value
                        })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addExercise(group.id);
                          }
                        }}
                      />
                      <Button
                        onClick={() => addExercise(group.id)}
                        disabled={!newExerciseName[group.id]?.trim()}
                        variant="primary"
                        className='rounded-sm'
                      >
                        Add
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Unsaved changes confirmation dialog */}
      {showUnsavedChangesDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--ds-surface)] rounded-xl p-6 w-full max-w-sm shadow-2xl border border-[color:var(--ds-border)]">
            <h3 className="text-xl font-bold text-[color:var(--ds-text-primary)] mb-3">Unsaved Changes</h3>
            <p className="text-[color:var(--ds-text-secondary)] mb-6  text-sm">
              You have unsaved changes. Are you sure you want to exit? Any changes will be lost.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => {
                  console.log("Go Back clicked");
                  setShowUnsavedChangesDialog(false);
                }}
                variant="outline"
                size="lg"
              >
                Go Back
              </Button>
              <Button
                onClick={() => {
                  console.log("Discard Changes clicked");
                  cancelEditing();
                  if (onEditingStateChange) {
                    onEditingStateChange(false);
                  }

                  if (pendingAction === 'close') {
                    const closeButton = document.querySelector('[data-modal-close]') as HTMLButtonElement;
                    if (closeButton) {
                      closeButton.click();
                    }
                  }
                }}
                variant="destructive"
                size="lg"
              >
                Discard Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 