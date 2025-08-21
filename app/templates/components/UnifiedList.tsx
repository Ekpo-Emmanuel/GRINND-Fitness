import { Id } from '@/convex/_generated/dataModel';
import { Folder, ChevronRight, Calendar, Target, MoreVertical, Edit3, Trash2, Pin, PinOff } from 'lucide-react';
import { Pill } from '@/components/ui/pill';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

interface Folder {
  _id: Id<'folders'>;
  name: string;
  templateCount?: number;
  pinned?: boolean;
}

interface Template {
  _id: Id<'workoutTemplates'>;
  name: string;
  targetDay?: string;
  muscleGroups: any[];
  folderId?: Id<'folders'>;
  pinned?: boolean;
}

interface UnifiedListProps {
  folders: Folder[];
  templates: Template[];
  selectedTemplate: Id<'workoutTemplates'> | null;
  selectedFolder: Id<'folders'> | null;
  setSelectedTemplate: (id: Id<'workoutTemplates'>) => void;
  setSelectedFolder: (id: Id<'folders'> | null) => void;
  onNavigateToFolder: (folderId: Id<'folders'>) => void;
  isSearching?: boolean;
}

export default function UnifiedList({
  folders,
  templates,
  selectedTemplate,
  selectedFolder,
  setSelectedTemplate,
  setSelectedFolder,
  onNavigateToFolder,
  isSearching = false,
  onDeleteFolder,
  onEditFolderName,
  onPinFolder,
  onUnpinFolder,
  onPinTemplate,
  onUnpinTemplate,
}: UnifiedListProps & {
  onDeleteFolder?: (folderId: Id<'folders'>) => void;
  onEditFolderName?: (folderId: Id<'folders'>, newName: string) => void;
  onPinFolder?: (folderId: Id<'folders'>) => void;
  onUnpinFolder?: (folderId: Id<'folders'>) => void;
  onPinTemplate?: (templateId: Id<'workoutTemplates'>) => void;
  onUnpinTemplate?: (templateId: Id<'workoutTemplates'>) => void;
}) {
  const [editingFolderId, setEditingFolderId] = useState<Id<'folders'> | null>(null);
  const [editName, setEditName] = useState('');

  const formatDayName = (day: string | undefined) => {
    if (!day) return 'Any day';
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const getExerciseCount = (template: Template) => {
    return template.muscleGroups.reduce((sum, group) => sum + group.exercises.length, 0);
  };

  const folderItems = folders.map(folder => ({ ...folder, type: 'folder' as const }));
  const templateItems = templates.map(template => ({ ...template, type: 'template' as const }));

  return (
    <>
      {/* Folder grid */}
      {folderItems.length > 0 && (
        <div className="grid grid-cols-1 gap-4 mb-6 mt-2">
          {folderItems.map(folder => (
            <div
              key={folder._id}
              onClick={() => editingFolderId !== folder._id && onNavigateToFolder(folder._id)}
              className={`rounded-2xl p-6 flex flex-col justify-between transition-all cursor-pointer min-h-[120px] border-2 ${
                selectedFolder === folder._id 
                  ? 'bg-[var(--ds-accent-purple)] border-[var(--ds-accent-purple)] text-[var(--ds-on-accent)] ' 
                  : 'bg-[var(--ds-surface)] border-[color:var(--ds-border)] hover:bg-[var(--ds-surface-elevated)] hover:border-[var(--ds-accent-purple)]'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-xl ${
                    selectedFolder === folder._id 
                      ? 'bg-white/20' 
                      : 'bg-[var(--ds-accent-purple)]/10'
                  }`}>
                    <Folder className={`h-5 w-5 ${
                      selectedFolder === folder._id 
                        ? 'text-white' 
                        : 'text-[var(--ds-accent-purple)]'
                    }`} />
                  </div>
                  {editingFolderId === folder._id ? (
                    <Input
                      className={`text-md font-bold flex-1 bg-transparent border-0 p-0 focus:ring-0 ${
                        selectedFolder === folder._id 
                          ? 'text-white placeholder:text-white/70' 
                          : 'text-[color:var(--ds-text-primary)]'
                      }`}
                      value={editName}
                      autoFocus
                      onChange={e => setEditName(e.target.value)}
                      onBlur={() => {
                        setEditingFolderId(null);
                        if (editName !== folder.name && onEditFolderName) {
                          onEditFolderName(folder._id, editName);
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          setEditingFolderId(null);
                          if (editName !== folder.name && onEditFolderName) {
                            onEditFolderName(folder._id, editName);
                          }
                        } else if (e.key === 'Escape') {
                          setEditingFolderId(null);
                          setEditName(folder.name);
                        }
                      }}
                    />
                  ) : (
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold flex items-center gap-2 ${
                        selectedFolder === folder._id 
                          ? 'text-white' 
                          : 'text-[color:var(--ds-text-primary)]'
                      }`}>
                        {folder.name.length > 12 ? folder.name.slice(0, 12) + '...' : folder.name}
                        {folder.pinned && <Pin className={`h-4 w-4 ${
                          selectedFolder === folder._id ? 'text-white' : 'text-[var(--ds-accent-purple)]'
                        }`} />}
                      </h3>
                    </div>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`p-2 rounded-full transition-colors focus:outline-none ${
                        selectedFolder === folder._id 
                          ? 'text-white/70 hover:text-white hover:bg-white/20' 
                          : 'text-[color:var(--ds-text-secondary)] hover:text-[color:var(--ds-text-primary)] hover:bg-[var(--ds-surface-elevated)]'
                      }`}
                      onClick={e => e.stopPropagation()}
                      aria-label="Folder actions"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[var(--ds-surface)] border-[color:var(--ds-border)]">
                    <DropdownMenuItem
                      onClick={e => {
                        e.stopPropagation();
                        if (folder.pinned) {
                          onUnpinFolder && onUnpinFolder(folder._id);
                        } else {
                          onPinFolder && onPinFolder(folder._id);
                        }
                      }}
                      className="flex items-center cursor-pointer text-[color:var(--ds-text-primary)] hover:bg-[var(--ds-surface-elevated)]"
                    >
                      {folder.pinned ? <PinOff className="h-4 w-4 mr-2" /> : <Pin className="h-4 w-4 mr-2" />}
                      {folder.pinned ? 'Unpin folder' : 'Pin folder'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={e => {
                        e.stopPropagation();
                        setEditingFolderId(folder._id);
                        setEditName(folder.name);
                      }}
                      className="flex items-center cursor-pointer text-[color:var(--ds-text-primary)] hover:bg-[var(--ds-surface-elevated)]"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      Edit name
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={e => {
                        e.stopPropagation();
                        if (onDeleteFolder) onDeleteFolder(folder._id);
                      }}
                      className="flex items-center text-[var(--ds-error)] cursor-pointer hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete folder
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center justify-between">
                <Pill 
                  variant={selectedFolder === folder._id ? "secondary" : "tertiary"} 
                  size="sm"
                  className={selectedFolder === folder._id ? "bg-white/20 text-white border-white/30" : ""}
                >
                  {folder.templateCount || 0} template{folder.templateCount !== 1 ? 's' : ''}
                </Pill>
                {selectedFolder !== folder._id && (
                  <ChevronRight className="h-4 w-4 text-[color:var(--ds-text-secondary)]" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template list */}
      {templateItems.length > 0 ? (
        <div className="space-y-4">
          {templateItems.map(template => (
            <div
              key={template._id}
              onClick={() => setSelectedTemplate(template._id)}
              className={`p-6 rounded-2xl cursor-pointer transition-all border-2 ${
                selectedTemplate === template._id 
                  ? 'bg-[var(--ds-accent-purple)] border-[var(--ds-accent-purple)] text-[var(--ds-on-accent)]' 
                  : 'bg-[var(--ds-surface)] border-[color:var(--ds-border)] hover:bg-[var(--ds-surface-elevated)] hover:border-[var(--ds-accent-purple)]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    {template.pinned && (
                      <Pin className={`h-4 w-4 ${
                        selectedTemplate === template._id ? 'text-white' : 'text-[var(--ds-accent-purple)]'
                      }`} />
                    )}
                    <h3 className={`font-bold text-xl ${
                      selectedTemplate === template._id 
                        ? 'text-white' 
                        : 'text-[color:var(--ds-text-primary)]'
                    }`}>
                      {template.name.length > 30 ? template.name.slice(0, 30) + '...' : template.name}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Pill 
                      variant={selectedTemplate === template._id ? "secondary" : "tertiary"} 
                      size="sm"
                      className={selectedTemplate === template._id ? "bg-white/20 text-white border-white/30" : ""}
                      icon={<Calendar />}
                    >
                      {formatDayName(template.targetDay)}
                    </Pill>
                    <Pill 
                      variant={selectedTemplate === template._id ? "secondary" : "tertiary"} 
                      size="sm"
                      className={selectedTemplate === template._id ? "bg-white/20 text-white border-white/30" : ""}
                      icon={<Target />}
                    >
                      {getExerciseCount(template)} exercise{getExerciseCount(template) !== 1 ? 's' : ''}
                    </Pill>
                  </div>
                </div>
                {/* Pin/unpin button for template */}
                <button
                  className={`p-2 rounded-full transition-colors focus:outline-none ${
                    selectedTemplate === template._id 
                      ? 'text-white/70 hover:text-white hover:bg-white/20' 
                      : 'text-[color:var(--ds-text-secondary)] hover:text-[var(--ds-accent-purple)] hover:bg-[var(--ds-surface-elevated)]'
                  }`}
                  onClick={e => {
                    e.stopPropagation();
                    if (template.pinned) {
                      onUnpinTemplate && onUnpinTemplate(template._id);
                    } else {
                      onPinTemplate && onPinTemplate(template._id);
                    }
                  }}
                  aria-label={template.pinned ? 'Unpin template' : 'Pin template'}
                >
                  {template.pinned ? <PinOff className="h-5 w-5" /> : <Pin className="h-5 w-5" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        isSearching && folders.length === 0 && templates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-[color:var(--ds-text-secondary)] text-lg font-medium">No items found</div>
            <p className="text-[color:var(--ds-text-secondary)]/70 text-sm mt-2">Try adjusting your search terms</p>
          </div>
        ) : null
      )}
    </>
  );
} 