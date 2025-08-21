'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import BottomNav from '@/app/components/BottomNav';
import { ChevronLeft, Plus, Trash2, X, Target, FileText, Calendar, Search, Dumbbell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pill } from '@/components/ui/pill';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Exercise {
  id: string;
  name: string;
  sets: {
    id: string;
    reps: string;
    weight: string;
  }[];
  notes?: string;
  muscleGroup?: string; 
}

interface MuscleGroup {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface ExerciseSuggestion {
  name: string;
  muscleGroup: string;
}

export default function CreateTemplatePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [templateName, setTemplateName] = useState('');
  const [description, setDescription] = useState('');
  const [targetDay, setTargetDay] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [exerciseName, setExerciseName] = useState('');
  const [exerciseMode, setExerciseMode] = useState<'muscle-groups' | 'direct'>('muscle-groups');
  const [directExercises, setDirectExercises] = useState<Exercise[]>([]);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [showDirectExerciseModal, setShowDirectExerciseModal] = useState(false);
  
  const createTemplate = useMutation(api.workouts.createWorkoutTemplate);
  
  const exerciseSuggestions: ExerciseSuggestion[] = selectedMuscleGroup ? getMockExerciseSuggestions(selectedMuscleGroup) : [];
  
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  const predefinedMuscleGroups = [
    'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 
    'Legs', 'Glutes', 'Abs', 'Calves'
  ];
  
  function getMockExerciseSuggestions(muscleGroup: string): ExerciseSuggestion[] {
    const suggestions: Record<string, string[]> = {
      'chest': ['Bench Press', 'Incline Bench Press', 'Chest Fly', 'Push-ups', 'Dips'],
      'back': ['Pull-ups', 'Lat Pulldown', 'Bent Over Row', 'Deadlift', 'T-Bar Row'],
      'shoulders': ['Overhead Press', 'Lateral Raise', 'Front Raise', 'Face Pull', 'Upright Row'],
      'biceps': ['Bicep Curl', 'Hammer Curl', 'Preacher Curl', 'Chin-ups', 'Concentration Curl'],
      'triceps': ['Tricep Pushdown', 'Skull Crushers', 'Tricep Kickback', 'Close-Grip Bench Press', 'Dips'],
      'legs': ['Squat', 'Leg Press', 'Lunges', 'Leg Extension', 'Leg Curl'],
      'glutes': ['Hip Thrust', 'Glute Bridge', 'Bulgarian Split Squat', 'Deadlift', 'Cable Kickback'],
      'abs': ['Crunches', 'Leg Raises', 'Plank', 'Russian Twist', 'Ab Rollout'],
      'calves': ['Calf Raise', 'Seated Calf Raise', 'Donkey Calf Raise', 'Jump Rope', 'Box Jumps']
    };
    
    const group = muscleGroup.toLowerCase();
    const exercises = suggestions[group] || [];
    
    return exercises.map(name => ({
      name,
      muscleGroup: group
    }));
  }
  
  const addMuscleGroup = (name: string) => {
    const id = name.toLowerCase().replace(/\s/g, '-');
    
    if (muscleGroups.some(group => group.id === id)) {
      return;
    }
    
    setMuscleGroups([
      ...muscleGroups,
      {
        id,
        name,
        exercises: []
      }
    ]);
  };
  
  const removeMuscleGroup = (id: string) => {
    setMuscleGroups(muscleGroups.filter(group => group.id !== id));
  };
  
  const openAddExerciseModal = (muscleGroupId: string) => {
    setSelectedMuscleGroup(muscleGroupId);
    setSelectedExercises([]);
    setExerciseName('');
    setShowAddExerciseModal(true);
  };
  
  const toggleExerciseSelection = (exerciseName: string) => {
    setSelectedExercises(prev => {
      if (prev.includes(exerciseName)) {
        return prev.filter(name => name !== exerciseName);
      } else {
        return [...prev, exerciseName];
      }
    });
  };
  
  const addExercise = () => {
    if (!selectedMuscleGroup || selectedExercises.length === 0) return;
    
    const updatedMuscleGroups = muscleGroups.map(group => {
      if (group.id === selectedMuscleGroup) {
        return {
          ...group,
          exercises: [
            ...group.exercises,
            ...selectedExercises.map(name => ({
              id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
              name: name,
              sets: [{ id: '1', reps: '10', weight: '' }],
              notes: ''
            }))
          ]
        };
      }
      return group;
    });
    
    setMuscleGroups(updatedMuscleGroups);
    setShowAddExerciseModal(false);
  };
  
  const removeExercise = (muscleGroupId: string, exerciseId: string) => {
    const updatedMuscleGroups = muscleGroups.map(group => {
      if (group.id === muscleGroupId) {
        return {
          ...group,
          exercises: group.exercises.filter(exercise => exercise.id !== exerciseId)
        };
      }
      return group;
    });
    
    setMuscleGroups(updatedMuscleGroups);
  };
  
  const getAllExercises = (): ExerciseSuggestion[] => {
    const allExercises: ExerciseSuggestion[] = [];
    predefinedMuscleGroups.forEach(group => {
      const groupExercises = getMockExerciseSuggestions(group.toLowerCase());
      allExercises.push(...groupExercises);
    });
    return allExercises;
  };
  
  const addDirectExercise = (exerciseName: string, muscleGroup: string) => {
    const newExercise: Exercise = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      name: exerciseName,
      sets: [{ id: '1', reps: '10', weight: '' }],
      notes: '',
      muscleGroup: muscleGroup 
    };
    
    setDirectExercises([...directExercises, newExercise]);
  };
  
  const removeDirectExercise = (exerciseId: string) => {
    setDirectExercises(directExercises.filter(exercise => exercise.id !== exerciseId));
  };
  
  const getFilteredExercises = () => {
    const allExercises = getAllExercises();
    if (!exerciseSearch.trim()) return allExercises;
    
    return allExercises.filter(exercise =>
      exercise.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
      exercise.muscleGroup.toLowerCase().includes(exerciseSearch.toLowerCase())
    );
  };
  
  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      alert('Please enter a template name');
      return;
    }
    
    const hasExercises = exerciseMode === 'muscle-groups' 
      ? muscleGroups.length > 0 && muscleGroups.some(group => group.exercises.length > 0)
      : directExercises.length > 0;
      
    if (!hasExercises) {
      alert('Please add at least one exercise to your template');
      return;
    }
    
    setIsCreating(true);
    
    try {
      if (!user?.id) return;
      
      let finalMuscleGroups = muscleGroups;
      
      if (exerciseMode === 'direct') {
        const groupedExercises: { [key: string]: Exercise[] } = {};
        
        directExercises.forEach(exercise => {
          const group = exercise.muscleGroup || 'Other';
          if (!groupedExercises[group]) {
            groupedExercises[group] = [];
          }
          groupedExercises[group].push({
            ...exercise,
            muscleGroup: undefined 
          });
        });
        
        finalMuscleGroups = Object.entries(groupedExercises).map(([groupName, exercises]) => ({
          id: groupName.toLowerCase().replace(/\s/g, '-'),
          name: groupName.charAt(0).toUpperCase() + groupName.slice(1),
          exercises
        }));
      }
      
      await createTemplate({
        userId: user.id,
        name: templateName,
        description: description,
        targetDay: targetDay || undefined,
        muscleGroups: finalMuscleGroups
      });
      
      router.push('/templates');
    } catch (error) {
      console.error('Error creating template:', error);
      alert('Failed to create template. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);
  
  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-[var(--ds-bg-primary)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--ds-accent-purple)]"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[var(--ds-bg-primary)]">
      <div className="max-w-md mx-auto px-4 py-8 pb-24">
        <header className="mb-6">
          <div className="flex items-center">
            <Button
              variant="back"
              size="sm"
              onClick={() => router.back()}
              className="mr-3 text-[color:var(--ds-text-secondary)] hover:text-[color:var(--ds-text-primary)]"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-[color:var(--ds-text-primary)]">New Template</h1>
          </div>
          <p className="text-[color:var(--ds-text-secondary)] text-sm ml-10">Create a custom workout template</p>
        </header>
        
        <Card className="mb-6 border border-[color:var(--ds-border)] bg-[var(--ds-surface)] rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg text-[color:var(--ds-text-primary)]">
              <div className="p-2 rounded-xl bg-[var(--ds-accent-purple)]/10 mr-3">
                <FileText className="h-5 w-5 text-[var(--ds-accent-purple)]" />
              </div>
              Template Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Template name */}
            <div>
              <Label htmlFor="templateName" className="text-sm font-medium text-[color:var(--ds-text-primary)] mb-2">
                Template Name*
              </Label>
              <Input
                id="templateName"
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="e.g., Push Day, Leg Day, Full Body"
                className="mt-1 rounded-xl border border-[color:var(--ds-border)] bg-[var(--ds-surface-elevated)] focus:border-[var(--ds-accent-purple)] text-[color:var(--ds-text-primary)] placeholder:text-[color:var(--ds-text-secondary)]"
              />
            </div>
            
            {/* Description */}
            <div> 
              <Label htmlFor="description" className="text-sm font-medium text-[color:var(--ds-text-primary)] mb-2">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add notes about this template"
                className="mt-1 rounded-xl border border-[color:var(--ds-border)] bg-[var(--ds-surface-elevated)] focus:border-[var(--ds-accent-purple)] text-[color:var(--ds-text-primary)] placeholder:text-[color:var(--ds-text-secondary)]"
                rows={3}
              />
            </div>
            
            {/* Target day */}
            <div>
              <Label className="text-sm font-medium text-[color:var(--ds-text-primary)] mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-[var(--ds-accent-purple)]" />
                Target Day (Optional)
              </Label>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setTargetDay(targetDay === day ? '' : day)}
                    className={`p-2 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${
                      targetDay === day
                        ? 'bg-[var(--ds-accent-purple)] text-white border border-[var(--ds-accent-purple)] scale-105 shadow-md'
                        : 'bg-[var(--ds-surface-elevated)] text-[color:var(--ds-text-secondary)] border border-[color:var(--ds-border)] hover:bg-[var(--ds-surface)] hover:border-[var(--ds-accent-purple)]/30'
                    }`}
                  >
                    {day.charAt(0).toUpperCase()}
                  </button>
                ))}
              </div>
              <p className="text-xs text-[color:var(--ds-text-secondary)] mt-2">
                {targetDay 
                  ? `This template will be suggested on ${targetDay.charAt(0).toUpperCase() + targetDay.slice(1)}s` 
                  : 'No specific day selected'}
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Muscle Groups and Exercises */}
        <Card className="mb-6 border border-[color:var(--ds-border)] bg-[var(--ds-surface)] rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg text-[color:var(--ds-text-primary)]">
              <div className="flex items-center">
                <div className="p-2 rounded-xl bg-[var(--ds-accent-purple)]/10 mr-3">
                  <Target className="h-5 w-5 text-[var(--ds-accent-purple)]" />
                </div>
                Exercises
              </div>
              
              {/* Mode Toggle */}
              <div className="flex bg-[var(--ds-surface-elevated)] rounded-xl p-1 border border-[color:var(--ds-border)]">
                <button
                  onClick={() => setExerciseMode('muscle-groups')}
                  className={`px-3 py-1 text-sm font-medium rounded-lg transition-all ${
                    exerciseMode === 'muscle-groups'
                      ? 'bg-[var(--ds-accent-purple)] text-white shadow-sm'
                      : 'text-[color:var(--ds-text-secondary)] hover:text-[color:var(--ds-text-primary)]'
                  }`}
                >
                  By Groups
                </button>
                <button
                  onClick={() => setExerciseMode('direct')}
                  className={`px-3 py-1 text-sm font-medium rounded-lg transition-all ${
                    exerciseMode === 'direct'
                      ? 'bg-[var(--ds-accent-purple)] text-white shadow-sm'
                      : 'text-[color:var(--ds-text-secondary)] hover:text-[color:var(--ds-text-primary)]'
                  }`}
                >
                  Direct
                </button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {exerciseMode === 'muscle-groups' ? (
              <>
                {/* Add Muscle Group */}
                <div className="mb-6">
                  <Label className="text-sm font-medium text-[color:var(--ds-text-primary)] mb-2">
                    Add Muscle Group
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {predefinedMuscleGroups.map(group => (
                      <button
                        key={group}
                        onClick={() => addMuscleGroup(group)}
                        className={`py-2 px-4 text-sm rounded-xl font-medium transition-all ${
                          muscleGroups.some(g => g.name === group)
                            ? 'bg-[var(--ds-accent-purple)] text-white border border-[var(--ds-accent-purple)] scale-105 shadow-md'
                            : 'bg-[var(--ds-surface-elevated)] text-[color:var(--ds-text-primary)] border border-[color:var(--ds-border)] hover:bg-[var(--ds-surface)] hover:border-[var(--ds-accent-purple)]/30'
                        }`}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>
              
                {/* Muscle Groups List */}
                {muscleGroups.length > 0 ? (
                  <div className="space-y-4">
                    {muscleGroups.map(group => (
                      <div key={group.id} className="border border-[color:var(--ds-border)] rounded-2xl overflow-hidden bg-[var(--ds-surface-elevated)]">
                        <div className="bg-[var(--ds-surface)] p-4 border-b border-[color:var(--ds-border)] flex justify-between items-center">
                          <div className="flex items-center">
                            <h3 className="font-medium text-[color:var(--ds-text-primary)]">{group.name}</h3>
                            <Pill variant="secondary" size="sm" className="ml-2">
                              {group.exercises.length} exercises
                            </Pill>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openAddExerciseModal(group.id)}
                              className="text-[var(--ds-accent-purple)] hover:bg-[var(--ds-accent-purple)]/10 rounded-xl"
                              title="Add exercise"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeMuscleGroup(group.id)}
                              className="text-red-500 hover:bg-red-50 rounded-xl"
                              title="Remove muscle group"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {group.exercises.length > 0 ? (
                          <div className="p-4">
                            <div className="space-y-3">
                              {group.exercises.map(exercise => (
                                <div key={exercise.id} className="border-b border-[color:var(--ds-border)] pb-3 last:border-b-0 last:pb-0">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="font-medium text-sm text-[color:var(--ds-text-primary)]">{exercise.name}</div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeExercise(group.id, exercise.id)}
                                      className="text-red-500 hover:bg-red-50 rounded-lg h-6 w-6"
                                      title="Remove exercise"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  
                                  <div className="flex text-xs text-[color:var(--ds-text-secondary)] space-x-4">
                                    {exercise.sets[0]?.weight && (
                                      <div>Weight: {exercise.sets[0].weight} lbs</div>
                                    )}
                                  </div>
                                  
                                  {exercise.notes && (
                                    <div className="mt-1 text-xs text-[color:var(--ds-text-secondary)] italic">
                                      Note: {exercise.notes}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-6 text-center text-[color:var(--ds-text-secondary)] text-sm">
                            No exercises added yet. Click the + button to add exercises.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-[var(--ds-accent-purple)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Target className="h-8 w-8 text-[var(--ds-accent-purple)]" />
                    </div>
                    <h3 className="text-lg font-medium text-[color:var(--ds-text-primary)] mb-2">Add Muscle Groups</h3>
                    <p className="text-sm text-[color:var(--ds-text-secondary)]">
                      Select muscle groups to add exercises to your template
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Direct Exercise Selection */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-sm font-medium text-[color:var(--ds-text-primary)]">
                      Browse & Add Exercises
                    </Label>
                    <Button
                      onClick={() => setShowDirectExerciseModal(true)}
                      variant="primary"
                      size="sm"
                      className="rounded-xl"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Exercises
                    </Button>
                  </div>
                  
                  {/* Selected Direct Exercises */}
                  {directExercises.length > 0 ? (
                    <div className="space-y-3">
                      {directExercises.map(exercise => (
                        <div key={exercise.id} className="border border-[color:var(--ds-border)] rounded-xl p-4 bg-[var(--ds-surface-elevated)]">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center">
                              <div className="font-medium text-sm text-[color:var(--ds-text-primary)]">{exercise.name}</div>
                              <Pill variant="secondary" size="sm" className="ml-2">
                                {exercise.muscleGroup}
                              </Pill>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeDirectExercise(exercise.id)}
                              className="text-red-500 hover:bg-red-50 rounded-lg h-6 w-6"
                              title="Remove exercise"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <div className="flex text-xs text-[color:var(--ds-text-secondary)] space-x-4">
                            {exercise.sets[0]?.weight && (
                              <div>Weight: {exercise.sets[0].weight} lbs</div>
                            )}
                          </div>
                          
                          {exercise.notes && (
                            <div className="mt-1 text-xs text-[color:var(--ds-text-secondary)] italic">
                              Note: {exercise.notes}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-[var(--ds-accent-purple)]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Dumbbell className="h-8 w-8 text-[var(--ds-accent-purple)]" />
                      </div>
                      <h3 className="text-lg font-medium text-[color:var(--ds-text-primary)] mb-2">No Exercises Added</h3>
                      <p className="text-sm text-[color:var(--ds-text-secondary)] mb-4">
                        Click "Add Exercises" to browse and select exercises for your template
                      </p>
                      <Button
                        onClick={() => setShowDirectExerciseModal(true)}
                        variant="accent"
                        size="sm"
                        className="rounded-xl"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Exercises
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        <Button
          onClick={handleCreateTemplate}
          disabled={isCreating || !templateName.trim() || (exerciseMode === 'muscle-groups' ? muscleGroups.length === 0 : directExercises.length === 0)}
          variant="primary"
          size="lg"
          className="w-full rounded-xl"
        >
          {isCreating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Creating...
            </div>
          ) : (
            'Create Template'
          )}
        </Button>
        
        {/* Add Exercise Modal */}
        <Dialog open={showAddExerciseModal} onOpenChange={setShowAddExerciseModal}>
          <DialogContent className="p-6 max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-[color:var(--ds-text-primary)] mb-4">
                Add Exercises to {muscleGroups.find(g => g.id === selectedMuscleGroup)?.name}
              </DialogTitle>
            </DialogHeader>
              
            {/* Exercise Suggestions - Multi-select Grid */}
            {selectedMuscleGroup && (
              <div className="mb-6">
                <Label className="text-sm font-medium text-[color:var(--ds-text-primary)] mb-2">Select Exercises:</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {getMockExerciseSuggestions(selectedMuscleGroup).map((exercise, index) => (
                    <button
                      key={index}
                      onClick={() => toggleExerciseSelection(exercise.name)}
                      className={`py-2 px-3 text-sm rounded-xl border font-medium transition-all ${
                        selectedExercises.includes(exercise.name)
                          ? 'bg-[var(--ds-accent-purple)] border-[var(--ds-accent-purple)] text-white scale-105 shadow-md'
                          : 'bg-[var(--ds-surface-elevated)] border-[color:var(--ds-border)] text-[color:var(--ds-text-primary)] hover:bg-[var(--ds-surface)] hover:border-[var(--ds-accent-purple)]/30'
                      }`}
                    >
                      {exercise.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
              
            {/* Custom Exercise Input */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-[color:var(--ds-text-primary)] mb-2">Or add a custom exercise:</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  type="text"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="Enter custom exercise name"
                  className="flex-1 rounded-xl border border-[color:var(--ds-border)] bg-[var(--ds-surface-elevated)] focus:border-[var(--ds-accent-purple)] text-[color:var(--ds-text-primary)] placeholder:text-[color:var(--ds-text-secondary)]"
                />
                <Button
                  onClick={() => {
                    if (exerciseName.trim()) {
                      toggleExerciseSelection(exerciseName.trim());
                      setExerciseName('');
                    }
                  }}
                  disabled={!exerciseName.trim()}
                  variant="primary"
                  className="px-4 rounded-xl"
                >
                  Add
                </Button>
              </div>
            </div>
              
            {/* Selected Exercises List */}
            {selectedExercises.length > 0 && (
              <div className="mb-6">
                <Label className="text-sm font-medium text-[color:var(--ds-text-primary)] mb-2">Selected ({selectedExercises.length}):</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedExercises.map((name, index) => (
                    <Pill key={index} variant="accent" size="md" className="flex items-center">
                      <span className="text-sm">{name}</span>
                      <button
                        onClick={() => toggleExerciseSelection(name)}
                        className="ml-2 text-white hover:text-white/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Pill>
                  ))}
                </div>
              </div>
            )}
              
            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAddExerciseModal(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={addExercise}
                disabled={selectedExercises.length === 0}
                className="rounded-xl"
              >
                Add Exercises ({selectedExercises.length})
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Direct Exercise Modal */}
        <Dialog open={showDirectExerciseModal} onOpenChange={setShowDirectExerciseModal}>
          <DialogContent className="p-6 max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-[color:var(--ds-text-primary)] mb-4">
                Browse & Add Exercises
              </DialogTitle>
            </DialogHeader>
            
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[color:var(--ds-text-secondary)]" />
                <Input
                  type="text"
                  value={exerciseSearch}
                  onChange={(e) => setExerciseSearch(e.target.value)}
                  placeholder="Search exercises by name or muscle group..."
                  className="pl-10 rounded-xl border border-[color:var(--ds-border)] bg-[var(--ds-surface-elevated)] focus:border-[var(--ds-accent-purple)] text-[color:var(--ds-text-primary)] placeholder:text-[color:var(--ds-text-secondary)]"
                />
              </div>
            </div>
            
            {/* Exercise List */}
            <div className="mb-6 max-h-80 overflow-y-auto">
              <Label className="text-sm font-medium text-[color:var(--ds-text-primary)] mb-2">Available Exercises:</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                {getFilteredExercises().map((exercise, index) => {
                  const isAlreadyAdded = directExercises.some(e => e.name === exercise.name);
                  return (
                    <button
                      key={index}
                      onClick={() => !isAlreadyAdded && addDirectExercise(exercise.name, exercise.muscleGroup)}
                      disabled={isAlreadyAdded}
                      className={`p-3 text-left rounded-xl border font-medium transition-all ${
                        isAlreadyAdded
                          ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-[var(--ds-surface-elevated)] border-[color:var(--ds-border)] text-[color:var(--ds-text-primary)] hover:bg-[var(--ds-surface)] hover:border-[var(--ds-accent-purple)]/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{exercise.name}</div>
                          <div className="text-xs text-[color:var(--ds-text-secondary)] capitalize">
                            {exercise.muscleGroup}
                          </div>
                        </div>
                        {isAlreadyAdded && (
                          <Pill variant="secondary" size="sm">
                            Added
                          </Pill>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Custom Exercise Input */}
            <div className="mb-6">
              <Label className="text-sm font-medium text-[color:var(--ds-text-primary)] mb-2">Add Custom Exercise:</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  type="text"
                  value={exerciseName}
                  onChange={(e) => setExerciseName(e.target.value)}
                  placeholder="Enter custom exercise name"
                  className="flex-1 rounded-xl border border-[color:var(--ds-border)] bg-[var(--ds-surface-elevated)] focus:border-[var(--ds-accent-purple)] text-[color:var(--ds-text-primary)] placeholder:text-[color:var(--ds-text-secondary)]"
                />
                <Button
                  onClick={() => {
                    if (exerciseName.trim()) {
                      addDirectExercise(exerciseName.trim(), 'Other');
                      setExerciseName('');
                    }
                  }}
                  disabled={!exerciseName.trim()}
                  variant="primary"
                  className="px-4 rounded-xl"
                >
                  Add
                </Button>
              </div>
            </div>
            
            {/* Currently Selected Summary */}
            {directExercises.length > 0 && (
              <div className="mb-6 p-4 bg-[var(--ds-surface-elevated)] rounded-xl border border-[color:var(--ds-border)]">
                <Label className="text-sm font-medium text-[color:var(--ds-text-primary)] mb-2">
                  Added to Template ({directExercises.length}):
                </Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {directExercises.map(exercise => (
                    <Pill key={exercise.id} variant="accent" size="sm">
                      {exercise.name}
                    </Pill>
                  ))}
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowDirectExerciseModal(false)}
                className="rounded-xl"
              >
                Done
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Bottom navigation */}
        <BottomNav />
      </div>
    </div>
  );
} 