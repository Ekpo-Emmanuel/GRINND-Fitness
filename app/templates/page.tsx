'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import BottomNav from '@/app/components/BottomNav';
import { X } from 'lucide-react';

import Header from './components/Header';
import UnifiedSearch from './components/UnifiedSearch';
import UnifiedList from './components/UnifiedList';
import BreadcrumbNav from './components/BreadcrumbNav';
import TemplateDetails from './components/TemplateDetails';
import EmptyState from './components/EmptyState';
import FolderModal from './components/FolderModal';
import StartWorkoutButton from './components/StartWorkoutButton';
import TemplateModal from './components/TemplateModal';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function TemplatesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<Id<'workoutTemplates'> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStartingWorkout, setIsStartingWorkout] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<Id<'folders'> | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Id<'folders'> | null>(null);
  const [viewMode, setViewMode] = useState<'folders' | 'templates'>('folders');
  const userProfile = useQuery(api.users.getProfile, 
    user?.id ? { userId: user.id } : 'skip'
  );

  const allTemplates = useQuery(api.workouts.getWorkoutTemplates,
    user?.id ? { userId: user.id } : 'skip'
  ) || [];

  const folderTemplates = useQuery(api.folders.getTemplatesByFolder,
    user?.id && selectedFolder ? { userId: user.id, folderId: selectedFolder } : 'skip'
  ) || [];

  const templateDetails = useQuery(api.workouts.getWorkoutTemplate,
    selectedTemplate ? { templateId: selectedTemplate } : 'skip'
  );

  const folders = useQuery(api.folders.getFolders,
    user?.id ? { userId: user.id } : 'skip'
  ) || [];
  
  const templateFolder = useQuery(api.folders.getTemplateFolder,
    selectedTemplate ? { templateId: selectedTemplate } : 'skip'
  );
  
  // Mutations
  const deleteTemplate = useMutation(api.workouts.deleteWorkoutTemplate);
  const createWorkoutFromTemplate = useMutation(api.workouts.createWorkoutFromTemplate);
  const createFolder = useMutation(api.folders.createFolder);
  const deleteFolder = useMutation(api.folders.deleteFolder);
  const assignTemplateToFolder = useMutation(api.folders.assignTemplateToFolder);
  const removeTemplateFromFolder = useMutation(api.folders.removeTemplateFromFolder);
  const updateWorkoutTemplate = useMutation(api.workouts.updateWorkoutTemplate);
  const createWorkoutTemplate = useMutation(api.workouts.createWorkoutTemplate);
  const updateFolder = useMutation(api.folders.updateFolder);
  const pinFolder = useMutation(api.folders.pinFolder);
  const unpinFolder = useMutation(api.folders.unpinFolder);
  const pinTemplate = useMutation(api.workouts.pinWorkoutTemplate);
  const unpinTemplate = useMutation(api.workouts.unpinWorkoutTemplate);
  
  useEffect(() => {
    if (selectedTemplate) {
      setShowTemplateModal(true);
    }
  }, [selectedTemplate]);
  
  const handleCloseTemplateModal = () => {
    if (isEditing) {
      return;
    }
    setShowTemplateModal(false);
    setTimeout(() => {
      setSelectedTemplate(null);
      setSearchQuery(''); 
    }, 100);
  };
  
  const handleEditingState = (editing: boolean) => {
    setIsEditing(editing);
  };
  
  const handleSavingState = (saving: boolean) => {
    setIsSaving(saving);
  };
  
  const handleCancelEditing = () => {
    console.log("Parent handleCancelEditing called");
    const templateDetailsElement = document.querySelector('[data-template-details]');
    if (templateDetailsElement) {
      console.log("Found template details element");
      const cancelButton = templateDetailsElement.querySelector('[data-cancel-editing]') as HTMLButtonElement;
      if (cancelButton) {
        console.log("Found cancel button, clicking it");
        cancelButton.click();
      } else {
        console.log("Cancel button not found, setting isEditing to false directly");
        setIsEditing(false);
      }
    } else {
      console.log("Template details element not found, setting isEditing to false directly");
      setIsEditing(false);
    }
  };
  
  
  const handleDeleteTemplate = async (templateId: Id<'workoutTemplates'>) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setIsDeleting(true);
      try {
        await deleteTemplate({ templateId });
        setSelectedTemplate(null);
        setShowTemplateModal(false);
      } catch (error) {
        console.error('Error deleting template:', error);
        alert('Failed to delete template. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  const handleUpdateTemplate = async (updatedTemplate: any) => {
    if (!user?.id) return;
    try {
      await updateWorkoutTemplate({
        templateId: updatedTemplate._id,
        name: updatedTemplate.name,
        description: updatedTemplate.description,
        targetDay: updatedTemplate.targetDay,
        muscleGroups: updatedTemplate.muscleGroups
      });
      toast.success('Template updated!');
    } catch (error) {
      console.error('Error updating template:', error);
      throw new Error('Failed to update template');
    }
  };
  
  const handleStartWorkout = async (templateId: Id<'workoutTemplates'>) => {
    setIsStartingWorkout(true);
    try {
      if (!user?.id) return;
      
      if (!templateDetails) {
        throw new Error('Template details not available');
      }
      
      const now = new Date();
      const workoutSetup = {
        day: templateDetails.targetDay || now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase(),
        muscleGroups: templateDetails.muscleGroups.map((group: any) => group.id),
        notes: templateDetails.description || '',
        timestamp: now.toISOString(),
        startTime: Date.now(),
        name: templateDetails.name,
        fromTemplate: true,
        templateId: templateId
      };
      
      const selectedExercises: Record<string, string[]> = {};
      templateDetails.muscleGroups.forEach((group: any) => {
        selectedExercises[group.id] = group.exercises.map((ex: any) => ex.name);
      });
      
      localStorage.setItem('workoutSetup', JSON.stringify(workoutSetup));
      localStorage.setItem('selectedExercises', JSON.stringify(selectedExercises));
      
      router.push('/workout/new');
    } catch (error) {
      console.error('Error starting workout from template:', error);
      alert('Failed to start workout. Please try again.');
    } finally {
      setIsStartingWorkout(false);
    }
  };

  const handleCreateTemplate = () => {
    router.push('/templates/create');
  };

  const handleCreateFolder = () => {
    setShowFolderModal(true);
  };

  const handleSubmitFolder = async () => {
    if (folderName.trim() && user?.id) {
      try {
        await createFolder({
          userId: user.id,
          name: folderName
        });
        
        setFolderName('');
        setShowFolderModal(false);
        toast.success('Folder created!');
      } catch (error) {
        console.error('Error creating folder:', error);
        alert('Failed to create folder. Please try again.');
      }
    }
  };

  const handleDeleteFolderClick = (folderId: Id<'folders'>) => {
    const hasTemplates = allTemplates.some(template => template.folderId === folderId);
    if (hasTemplates) {
      setFolderToDelete(folderId);
      setShowDeleteFolderModal(true);
    } else {
      handleDeleteFolder(folderId, false);
    }
  };

  const handleDeleteFolder = async (folderId: Id<'folders'>, deleteTemplates: boolean = false) => {
    try {
      await deleteFolder({ 
        folderId,
        deleteTemplates
      });
      
      if (selectedFolder === folderId) {
        setSelectedFolder(null);
      }
      
      setShowDeleteFolderModal(false);
      setFolderToDelete(null);
      toast.success('Folder deleted!');
    } catch (error) {
      console.error('Error deleting folder:', error);
      alert('Failed to delete folder. Please try again.');
    }
  };

  const handleAssignTemplateToFolder = async (templateId: Id<'workoutTemplates'>, folderId: Id<'folders'>) => {
    if (!user?.id) return;
    
    try {
      await assignTemplateToFolder({
        userId: user.id,
        templateId,
        folderId
      });
    } catch (error) {
      console.error('Error assigning template to folder:', error);
      alert('Failed to assign template to folder. Please try again.');
    }
  };

  const handleRemoveTemplateFromFolder = async (templateId: Id<'workoutTemplates'>) => {
    try {
      await removeTemplateFromFolder({ templateId });
    } catch (error) {
      console.error('Error removing template from folder:', error);
      alert('Failed to remove template from folder. Please try again.');
    }
  };

  const handleDuplicateTemplate = async (template: any) => {
    if (!user?.id || !template) return;
    try {
      await createWorkoutTemplate({
        userId: user.id,
        name: `Copy of ${template.name}`,
        description: template.description,
        muscleGroups: template.muscleGroups,
        targetDay: template.targetDay,
        folderId: template.folderId,
      });
      toast.success('Template duplicated!');
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert('Failed to duplicate template. Please try again.');
    }
  };

  const handleEditFolderName = async (folderId: Id<'folders'>, newName: string) => {
    try {
      await updateFolder({
        folderId: folderId,
        name: newName
      });
    } catch (error) {
      console.error('Error renaming folder:', error);
      alert('Failed to rename folder. Please try again.');
    }
  };

  const getDisplayTemplates = () => {
    let templates = selectedFolder ? folderTemplates : allTemplates;

    if (!selectedFolder) {
      templates = templates.filter(template => template.folderId === undefined);
    }

    if (searchQuery && !selectedFolder) {
      templates = templates.filter(template => 
        template.name && template.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    templates = [...templates].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    return templates;
  };

  const getDisplayFolders = () => {
    if (selectedFolder) {
      return [];
    }
    const folderList = folders.map(folder => ({
      ...folder,
      templateCount: allTemplates.filter(template => template.folderId === folder._id).length
    }));
    return [...folderList].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  };

  const handleNavigateToFolder = (folderId: Id<'folders'> | null) => {
    setSelectedFolder(folderId);
    setSearchQuery('');
    if (folderId !== null) {
      setViewMode('templates');
    } else {
      setViewMode('folders');
    }
  };
  
  const handlePinFolder = async (folderId: Id<'folders'>) => {
    try {
      await pinFolder({ folderId });
    } catch (error) {
      toast.error('Failed to pin folder');
    }
  };
  const handleUnpinFolder = async (folderId: Id<'folders'>) => {
    try {
      await unpinFolder({ folderId });
    } catch (error) {
      toast.error('Failed to unpin folder');
    }
  };
  const handlePinTemplate = async (templateId: Id<'workoutTemplates'>) => {
    try {
      await pinTemplate({ templateId });
    } catch (error) {
      toast.error('Failed to pin template');
    }
  };
  const handleUnpinTemplate = async (templateId: Id<'workoutTemplates'>) => {
    try {
      await unpinTemplate({ templateId });
    } catch (error) {
      toast.error('Failed to unpin template');
    }
  };
  
  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  let displayTemplates = getDisplayTemplates();
  let displayFolders = getDisplayFolders();
  
  if (selectedFolder) {
    displayFolders = [];
  } else if (viewMode === 'folders') {
    displayTemplates = [];
  } else {
    displayFolders = [];
  }
  const hasItems = allTemplates.length > 0 || folders.length > 0;
  
  return (
    <div className="min-h-screen bg-[var(--ds-bg-primary)]">
      <Toaster />
      <div className="max-w-md mx-auto px-4 py-8 pb-24">
        {/* Header */}
        <Header 
          handleCreateFolder={handleCreateFolder} 
          handleCreateTemplate={handleCreateTemplate} 
        />
        
        {/* View toggle - only show when not in a folder */}
        {!selectedFolder && (
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'folders' | 'templates')} className="">
            <TabsList className="w-full grid grid-cols-2 rounded-xl bg-[var(--ds-surface-elevated)] border border-[color:var(--ds-border)] p-1">
              <TabsTrigger value="folders">
                Folders
              </TabsTrigger>
              <TabsTrigger value="templates">
                Templates
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Unified Search */}
        <div className="sticky top-13 z-20 bg-[var(--ds-bg-primary)] py-2">
          <UnifiedSearch
            folders={folders}
            templates={allTemplates}
            onSearchChange={setSearchQuery}
            onSelectFolder={setSelectedFolder}
            onSelectTemplate={setSelectedTemplate}
            selectedFolder={selectedFolder}
          />
        </div>
        
        {/* Breadcrumb Navigation */}
        <BreadcrumbNav
          selectedFolder={selectedFolder ? folders.find(f => f._id === selectedFolder) || null : null}
          onNavigateToFolder={handleNavigateToFolder}
        />
        
        {/* Unified List */}
        {hasItems ? (
          <UnifiedList
            folders={displayFolders}
            templates={displayTemplates}
            selectedTemplate={selectedTemplate}
            selectedFolder={selectedFolder}
            setSelectedTemplate={setSelectedTemplate}
            setSelectedFolder={setSelectedFolder}
            onNavigateToFolder={handleNavigateToFolder}
            isSearching={searchQuery.length > 0}
            onDeleteFolder={handleDeleteFolderClick}
            onEditFolderName={handleEditFolderName}
            onPinFolder={handlePinFolder}
            onUnpinFolder={handleUnpinFolder}
            onPinTemplate={handlePinTemplate}
            onUnpinTemplate={handleUnpinTemplate}
          />
        ) : (
          <EmptyState 
            isSearching={searchQuery.length > 0}
            searchQuery={searchQuery}
            hasFolders={folders.length > 0}
          />
        )}
        
        {/* Fixed bottom action button for starting workout from template */}
        {selectedTemplate && (
          <StartWorkoutButton 
            templateId={selectedTemplate}
            isStartingWorkout={isStartingWorkout}
            handleStartWorkout={handleStartWorkout}
          />
        )}
        
        {/* Bottom navigation */}
        <BottomNav />

        {/* Folder creation modal */}
        <FolderModal 
          showModal={showFolderModal}
          folderName={folderName}
          setFolderName={setFolderName}
          handleSubmit={handleSubmitFolder}
          handleClose={() => setShowFolderModal(false)}
        />

        {/* Template details modal */}
        <TemplateModal
          isOpen={showTemplateModal}
          selectedTemplate={selectedTemplate}
          templateDetails={templateDetails}
          isEditing={isEditing}
          isSaving={isSaving}
          isDeleting={isDeleting}
          isStartingWorkout={isStartingWorkout}
          templateFolder={templateFolder}
          folders={folders}
          onClose={handleCloseTemplateModal}
          onDeleteTemplate={handleDeleteTemplate}
          onAssignFolder={(folderId) => {
            if (selectedTemplate) {
              handleAssignTemplateToFolder(selectedTemplate, folderId as Id<'folders'>);
            }
          }}
          onRemoveFromFolder={() => {
            if (selectedTemplate) {
              handleRemoveTemplateFromFolder(selectedTemplate);
            }
          }}
          onUpdateTemplate={handleUpdateTemplate}
          onEditingStateChange={handleEditingState}
          onSavingStateChange={handleSavingState}
          onDuplicateTemplate={handleDuplicateTemplate}
          onStartWorkout={handleStartWorkout}
          onCancelEditing={handleCancelEditing}
        />

        {/* Folder deletion confirmation modal */}
        {showDeleteFolderModal && folderToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--ds-surface)] p-6 rounded-2xl shadow-2xl border border-[color:var(--ds-border)] w-full max-w-sm">
              <h3 className="text-xl font-bold text-[color:var(--ds-text-primary)] mb-3">
                Confirm Folder Deletion
              </h3>
              <div className="mb-6">
                <p className="text-sm text-[color:var(--ds-text-secondary)]">
                  Are you sure you want to delete the folder "{folders.find(f => f._id === folderToDelete)?.name}"?
                </p>
              </div>
              <div className="space-y-3">
                <Button
                  onClick={() => handleDeleteFolder(folderToDelete!, true)}
                  variant="destructive"
                  className="w-full h-12 font-semibold"
                >
                  Delete Folder and Templates
                </Button>
                <Button
                  onClick={() => handleDeleteFolder(folderToDelete!, false)}
                  variant="outline"
                  className="w-full h-12 font-semibold text-[color:var(--ds-text-primary)] border-[color:var(--ds-border)]"
                >
                  Move Templates to All
                </Button>
                <Button
                  onClick={() => setShowDeleteFolderModal(false)}
                  variant="ghost"
                  className="w-full h-12 font-semibold text-[color:var(--ds-text-secondary)]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 