"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Pencil, Trash, Minus, Check, Clock, Dumbbell } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Pill } from "@/components/ui/pill";
import { toast } from "sonner";


interface Set {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
  type?: 'normal' | 'warmup' | 'drop' | 'failure';
}

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  notes: string;
}

interface MuscleGroup {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface WorkoutSetup {
  day: string;
  muscleGroups: string[];
  notes: string;
  timestamp: string;
  startTime: number;
  name?: string;
  fromTemplate?: boolean;
  templateId?: Id<'workoutTemplates'>;
}

interface SavedWorkoutProgress {
  muscleGroups: MuscleGroup[];
  elapsedTime: number;
  lastSaved: number;
  warmups?: WarmupItem[];
  stretches?: StretchItem[];
  cardio?: CardioItem[];
}

type WarmupInputMode = 'reps' | 'duration' | 'distance';

interface WarmupSet {
  id: string;
  reps?: string;
  duration?: string; 
  distance?: string; 
  completed: boolean;
}

interface WarmupItem {
  id: string;
  name: string;
  mode: WarmupInputMode;
  sets: WarmupSet[];
}

interface StretchItem {
  id: string;
  name: string;
  target: string;
  imageUrl?: string;
  duration?: string; 
  completed: boolean;
}

interface CardioItem {
  id: string;
  name: string;
  distance?: string; 
  duration?: string; 
  pace?: string;     
  calories?: string;
  completed: boolean;
}

export default function NewWorkoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [workoutSetup, setWorkoutSetup] = useState<WorkoutSetup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [editingNotes, setEditingNotes] = useState<{ groupId: string, exerciseId: string } | null>(null);
  const [tempInputs, setTempInputs] = useState<Record<string, string>>({});  
  const [activeInputId, setActiveInputId] = useState<string | null>(null); 
  const [invalidSetInputs, setInvalidSetInputs] = useState<Record<string, boolean>>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastSaved, setLastSaved] = useState<number | null>(null);
  const [warmups, setWarmups] = useState<WarmupItem[]>([]);
  const [stretches, setStretches] = useState<StretchItem[]>([]);
  const [cardio, setCardio] = useState<CardioItem[]>([]);
  const [isWarmupActive, setIsWarmupActive] = useState<boolean>(false);

  const userProfile = useQuery(api.users.getProfile,
    user?.id ? { userId: user.id } : 'skip'
  );

  const createWorkout = useMutation(api.workouts.createWorkout);
  const completeWorkout = useMutation(api.workouts.completeWorkout);
  const saveWorkoutAsTemplate = useMutation(api.workouts.saveWorkoutAsTemplate);
  const createWorkoutFromTemplate = useMutation(api.workouts.createWorkoutFromTemplate); 
  const updateWorkout = useMutation(api.workouts.updateWorkout);

  const saveWorkoutProgress = (muscleGroups: MuscleGroup[], elapsedTime: number) => {
    if (typeof window !== 'undefined') {
      const progress: SavedWorkoutProgress = {
        muscleGroups,
        elapsedTime,
        lastSaved: Date.now(),
        warmups,
        stretches,
        cardio,
      };
      localStorage.setItem('workoutProgress', JSON.stringify(progress));
      setLastSaved(Date.now());
    }
  };

  const loadWorkoutProgress = (): SavedWorkoutProgress | null => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('workoutProgress');
      if (saved) {
        try {
          return JSON.parse(saved) as SavedWorkoutProgress;
        } catch (error) {
          console.error('Error parsing saved workout progress:', error);
          localStorage.removeItem('workoutProgress');
        }
      }
    }
    return null;
  };

  const clearWorkoutProgress = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('workoutProgress');
    }
  };

  useEffect(() => {
    if (muscleGroups.length > 0 && workoutSetup) {
      saveWorkoutProgress(muscleGroups, elapsedTime);
    }
  }, [muscleGroups, elapsedTime, workoutSetup, warmups, stretches, cardio]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasProgress = muscleGroups.some(group => 
        group.exercises.some(exercise => 
          exercise.sets.some(set => set.completed || set.weight || set.reps)
        )
      );
      
      if (hasProgress) {
        e.preventDefault();
        e.returnValue = 'You have unsaved workout progress. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [muscleGroups]);

  useEffect(() => {
    if (!workoutSetup?.startTime) return;

    setElapsedTime(Math.floor((Date.now() - workoutSetup.startTime) / 1000));

    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - workoutSetup.startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [workoutSetup?.startTime]);

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
      return;
    }

    if (isInitialized) {
      return;
    }

    if (typeof window !== 'undefined') {
      const setupData = localStorage.getItem('workoutSetup');
      const exercisesData = localStorage.getItem('selectedExercises');
      const warmupsData = localStorage.getItem('selectedWarmups');
      const stretchesData = localStorage.getItem('selectedStretches');
      const cardioData = localStorage.getItem('selectedCardio');

      if (!setupData || !exercisesData) {
        router.push('/workout/setup');
        return;
      }

      try {
        const parsedSetup = JSON.parse(setupData) as WorkoutSetup;
        const selectedExercises = JSON.parse(exercisesData) as Record<string, string[]>;
        const selectedWarmups = warmupsData ? JSON.parse(warmupsData) as { name: string; mode: WarmupInputMode }[] : [];
        const selectedStretches = stretchesData ? JSON.parse(stretchesData) as string[] : [];
        const selectedCardio = cardioData ? JSON.parse(cardioData) as string[] : [];

        const hasAllMuscleGroups = parsedSetup.muscleGroups.every(group =>
          selectedExercises.hasOwnProperty(group)
        );

        if (!hasAllMuscleGroups) {
          console.error('Selected exercises data does not match workout setup');
          localStorage.removeItem('selectedExercises');
          router.push('/workout/setup');
          return;
        }

        const cardioNameForHeader = selectedCardio.length > 0 ? selectedCardio[0] : undefined;
        setWorkoutSetup({ ...parsedSetup, ...(cardioNameForHeader ? { name: cardioNameForHeader } : {}) });

        const savedProgress = loadWorkoutProgress();
        
        if (savedProgress && savedProgress.muscleGroups.length > 0) {
          setMuscleGroups(savedProgress.muscleGroups);
          setElapsedTime(savedProgress.elapsedTime);
          setLastSaved(savedProgress.lastSaved);
          setWarmups(savedProgress.warmups || []);
          setStretches(savedProgress.stretches || []);
          setCardio(savedProgress.cardio || []);

          if ((!(savedProgress as any).cardio || (savedProgress.cardio || []).length === 0) && cardioData) {
            try {
              const selectedCardioNames = JSON.parse(cardioData) as string[];
              const makeId = () => Math.random().toString(36).slice(2, 8);
              const hydrated = selectedCardioNames.map(name => ({ id: makeId(), name, completed: false }));
              setCardio(hydrated);
            } catch (e) {}
          }
          
          toast.success('Workout progress restored!', {
            description: 'Your previous workout session has been recovered.'
          });
        } else {
          const muscleGroupLabels: Record<string, string> = {
            chest: 'Chest',
            back: 'Back',
            arms: 'Arms',
            legs: 'Legs',
            core: 'Core',
            shoulders: 'Shoulders',
            fullBody: 'Full Body',
          };

          const initialMuscleGroups = parsedSetup.muscleGroups.map(groupId => {
            const exercises = selectedExercises[groupId] || [];

            return {
              id: groupId,
              name: muscleGroupLabels[groupId] || groupId,
              exercises: exercises.length > 0
                ? exercises.map(exerciseName => ({
                  id: generateId(),
                  name: exerciseName,
                  sets: [createEmptySet()],
                  notes: '',
                }))
                : [createEmptyExercise(groupId)]
            };
          });

          setMuscleGroups(initialMuscleGroups);
          const makeId = () => Math.random().toString(36).slice(2, 8);
          setWarmups(selectedWarmups.map(w => ({ id: makeId(), name: w.name, mode: w.mode, sets: [{ id: makeId(), completed: false }] })));
          setStretches(selectedStretches.map(s => ({ id: makeId(), name: s, target: '', completed: false })));
          setCardio(selectedCardio.map(c => ({ id: makeId(), name: c, completed: false })));
        }

        const initialExpandedState: Record<string, boolean> = {};
        parsedSetup.muscleGroups.forEach(groupId => {
          initialExpandedState[groupId] = true;
        });
        setExpandedGroups(initialExpandedState);

        setIsLoading(false);
        setIsInitialized(true);
      } catch (error) {
        console.error('Error parsing workout data:', error);
        router.push('/workout/setup');
      }
    }
  }, [user, authLoading, router, isInitialized]);

  const generateId = () => Math.random().toString(36).substring(2, 10);

  const createEmptyExercise = (muscleGroupId: string): Exercise => ({
    id: generateId(),
    name: '',
    sets: [createEmptySet()],
    notes: '',
  });

  const createEmptySet = (): Set => ({
    id: generateId(),
    weight: '',
    reps: '',
    completed: false,
    type: 'normal',
  });

  const addExercise = (muscleGroupId: string) => {
    const newExerciseId = generateId();
    setMuscleGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === muscleGroupId
          ? { ...group, exercises: [...group.exercises, { ...createEmptyExercise(muscleGroupId), id: newExerciseId }] }
          : group
      )
    );
    setActiveExercise(newExerciseId);
  };

  const addSet = (muscleGroupId: string, exerciseId: string) => {
    setMuscleGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === muscleGroupId
          ? {
            ...group,
            exercises: group.exercises.map(exercise =>
              exercise.id === exerciseId
                ? { ...exercise, sets: [...exercise.sets, createEmptySet()] }
                : exercise
            )
          }
          : group
      )
    );
  };

  const updateExerciseName = (muscleGroupId: string, exerciseId: string, name: string) => {
    setMuscleGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === muscleGroupId
          ? {
            ...group,
            exercises: group.exercises.map(exercise =>
              exercise.id === exerciseId
                ? { ...exercise, name }
                : exercise
            )
          }
          : group
      )
    );
  };

  const updateSet = (muscleGroupId: string, exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => {
    setMuscleGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === muscleGroupId
          ? {
            ...group,
            exercises: group.exercises.map(exercise =>
              exercise.id === exerciseId
                ? {
                  ...exercise,
                  sets: exercise.sets.map(set =>
                    set.id === setId
                      ? { ...set, [field]: value }
                      : set
                  )
                }
                : exercise
            )
          }
          : group
      )
    );
  };

  const toggleSetCompletion = (muscleGroupId: string, exerciseId: string, setId: string) => {
    setMuscleGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === muscleGroupId
          ? {
            ...group,
            exercises: group.exercises.map(exercise =>
              exercise.id === exerciseId
                ? {
                  ...exercise,
                  sets: exercise.sets.map(set =>
                    set.id === setId
                      ? { ...set, completed: !set.completed }
                      : set
                  )
                }
                : exercise
            )
          }
          : group
      )
    );
  };

    const updateNotes = (muscleGroupId: string, exerciseId: string, notes: string) => {
    setMuscleGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === muscleGroupId
          ? {
            ...group,
            exercises: group.exercises.map(exercise =>
              exercise.id === exerciseId
                ? { ...exercise, notes }
                : exercise
            )
          }
          : group
      )
    );
  };

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleWeightChange = (muscleGroupId: string, exerciseId: string, setId: string, value: string) => {
    setTempInputs(prev => ({
      ...prev,
      [setId]: value
    }));

    if (!value || isNaN(parseFloat(value))) {
      updateSet(muscleGroupId, exerciseId, setId, 'weight', value);
      return;
    }

    updateSet(muscleGroupId, exerciseId, setId, 'weight', value);
  };

  const displayWeight = (weight: string, setId: string): string => {
    if (activeInputId === setId && tempInputs[setId] !== undefined) {
      return tempInputs[setId];
    }

    return weight;
  };

  const calculateTotalVolume = (): number => {
    let totalVolume = 0;

    muscleGroups.forEach(group => {
      group.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
          if (set.completed && set.weight && set.reps) {
            const weight = parseFloat(set.weight);
            const reps = parseInt(set.reps);

            if (!isNaN(weight) && !isNaN(reps)) {
              totalVolume += weight * reps;
            }
          }
        });
      });
    });

    return totalVolume;
  };

  const calculateCompletionPercentage = (): number => {
    let totalSets = 0;
    let completedSets = 0;

    muscleGroups.forEach(group => {
      group.exercises.forEach(exercise => {
        if (exercise.name.trim() !== '') {
          exercise.sets.forEach(set => {
            totalSets++;
            if (set.completed) {
              completedSets++;
            }
          });
        }
      });
    });

    return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
  };

  const finishWorkout = async () => {
    if (!user?.id || !workoutSetup) return;

    try {
      setIsSaving(true);

      const filteredMuscleGroups = muscleGroups.map(group => ({
        ...group,
        exercises: group.exercises.filter(ex => ex.name.trim() !== '')
      })).filter(group => group.exercises.length > 0);

      let workoutId;

      if (workoutSetup.fromTemplate && workoutSetup.templateId) {
        workoutId = await createWorkoutFromTemplate({
          userId: user.id,
          templateId: workoutSetup.templateId
        });
        const cardioName = (cardio && cardio.length > 0) ? cardio[0].name : undefined;
        await updateWorkout({
          workoutId,
          muscleGroups: filteredMuscleGroups,
          ...(cardioName ? { name: cardioName } : {}),
          cardio,
        });
      } else {
        const cardioName = (cardio && cardio.length > 0) ? cardio[0].name : undefined;
        workoutId = await createWorkout({
          userId: user.id,
          muscleGroups: filteredMuscleGroups,
          cardio,
          name: cardioName || workoutSetup.name
        });
      }

      await completeWorkout({
        workoutId,
        totalVolume: calculateTotalVolume(),
        duration: elapsedTime 
      });

      localStorage.removeItem('workoutSetup');
      localStorage.removeItem('selectedExercises');
      clearWorkoutProgress(); 

      toast.success('Workout completed successfully!', {
        description: `Total volume: ${calculateTotalVolume().toLocaleString()} lbs • Duration: ${formatTime(elapsedTime)}`
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const removeSet = (muscleGroupId: string, exerciseId: string, setId: string) => {
    setMuscleGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === muscleGroupId
          ? {
            ...group,
            exercises: group.exercises.map(exercise =>
              exercise.id === exerciseId
                ? {
                  ...exercise,
                  sets: exercise.sets.length > 1
                    ? exercise.sets.filter(set => set.id !== setId)
                    : exercise.sets
                }
                : exercise
            )
          }
          : group
      )
    );
  };

  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateDay, setTemplateDay] = useState('');
  const [includeWeights, setIncludeWeights] = useState(false);

  const handleSaveAsTemplate = async () => {
    if (!user?.id) return;

    try {
      const filteredMuscleGroups = muscleGroups.map(group => ({
        ...group,
        exercises: group.exercises.filter(ex => ex.name.trim() !== '')
      })).filter(group => group.exercises.length > 0);

      const workoutId = await createWorkout({
        userId: user.id,
        muscleGroups: filteredMuscleGroups
      });

      await saveWorkoutAsTemplate({
        userId: user.id,
        workoutId,
        name: templateName,
        description: templateDescription || undefined,
        targetDay: templateDay || undefined,
        includeWeights
      });

      setIsSavingTemplate(false);
      setTemplateName('');
      setTemplateDescription('');
      setTemplateDay('');
      setIncludeWeights(false);

      alert('Workout template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save workout template. Please try again.');
    }
  };

  const updateSetType = (muscleGroupId: string, exerciseId: string, setId: string, type: 'normal' | 'warmup' | 'drop' | 'failure') => {
    setMuscleGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === muscleGroupId
          ? {
            ...group,
            exercises: group.exercises.map(exercise =>
              exercise.id === exerciseId
                ? {
                  ...exercise,
                  sets: exercise.sets.map(set =>
                    set.id === setId ? { ...set, type } : set
                  )
                }
                : exercise
            )
          }
          : group
      )
    );
  };

  const isSetValid = (set: Set) => {
    const weightValid = set.weight && !isNaN(parseFloat(set.weight));
    const repsValid = set.reps && !isNaN(parseInt(set.reps));
    return weightValid && repsValid;
  };

  const tryToggleSetCompletion = (muscleGroupId: string, exerciseId: string, set: Set) => {
    if (isSetValid(set)) {
      setInvalidSetInputs(prev => {
        const n = { ...prev };
        delete n[set.id];
        return n;
      });
      toggleSetCompletion(muscleGroupId, exerciseId, set.id);
    } else {
      setInvalidSetInputs(prev => ({ ...prev, [set.id]: true }));
    }
  };

  if (authLoading || isLoading || !user || !workoutSetup) {
    return (
      <div className="flex justify-center items-center h-screen bg-[var(--ds-bg-primary)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--ds-accent-purple)]"></div>
      </div>
    );
  }

  const completionPercentage = calculateCompletionPercentage();
  const hasStrength = muscleGroups.some(group => group.exercises.some(ex => ex.name && ex.name.trim() !== ''));

  return (
    <div className="min-h-screen bg-[var(--ds-bg-primary)] pb-28">
      <div className="max-w-md mx-auto px-4 py-6">
        {/* Header Card */}
        <Card className="mb-4 border border-[color:var(--ds-border)] bg-[var(--ds-surface)] rounded-2xl">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div className="flex items-center">
                <div className="p-2 rounded-xl bg-[var(--ds-accent-purple)]/10 mr-3">
                  <Dumbbell className="h-5 w-5 text-[var(--ds-accent-purple)]" />
                </div>
                <span className="text-[color:var(--ds-text-primary)]">{cardio.length > 0 ? cardio[0].name : (workoutSetup.name || "Workout")}</span>
              </div>
              <Pill variant="accent" size="md" icon={<Clock size={14} strokeWidth={1.5} />}>
                {formatTime(elapsedTime)}
              </Pill>
            </CardTitle>
            <div className="text-[color:var(--ds-text-secondary)] text-sm flex justify-between items-center">
              <span>{workoutSetup.day} - {new Date(workoutSetup.timestamp).toLocaleDateString()}</span>
              {lastSaved && (
                <span className="text-xs text-[var(--ds-accent-purple)]">
                  Saved {Math.floor((Date.now() - lastSaved) / 1000)}s ago
                </span>
              )}
            </div>
          </CardHeader>
          {hasStrength && (
            <CardContent>
              <div className="flex items-center gap-4">
                <Progress value={completionPercentage} className="flex-1" />
                <span className="text-xs font-medium text-[color:var(--ds-text-primary)]">{completionPercentage}%</span>
                <span className="text-xs text-[color:var(--ds-text-secondary)]">{calculateTotalVolume().toLocaleString()} lbs</span>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Notes Alert */}
        {workoutSetup.notes && (
          <Alert className="mb-4 bg-[var(--ds-accent-purple)]/10 border border-[var(--ds-accent-purple)]/20 rounded-2xl">
            <AlertTitle className="text-[var(--ds-accent-purple)] font-semibold">Workout Notes</AlertTitle>
            <AlertDescription className="text-[color:var(--ds-text-primary)]">{workoutSetup.notes}</AlertDescription>
          </Alert>
        )}

        {/* Muscle Groups Accordion */}
        <Accordion type="multiple" className="mb-24">
          {muscleGroups.map(group => (
            <AccordionItem value={group.id} key={group.id} className="border border-[color:var(--ds-border)] rounded-2xl mb-4 bg-[var(--ds-surface)]">
              <AccordionTrigger className="px-4 py-4 hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-[var(--ds-accent-purple)]/10 text-[var(--ds-accent-purple)] flex items-center justify-center font-bold text-lg">{group.name.charAt(0)}</span>
                  <span className="text-lg font-semibold text-[color:var(--ds-text-primary)]">{group.name}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  {group.exercises.map(exercise => (
                    <Card key={exercise.id} className="border border-[color:var(--ds-border)] bg-[var(--ds-surface-elevated)] rounded-xl">
                      <CardContent className="p-4">
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <Input
                              type="text"
                              value={exercise.name}
                              onChange={e => updateExerciseName(group.id, exercise.id, e.target.value)}
                              placeholder="Exercise name"
                              className="font-medium text-base bg-transparent border-none px-0 focus:ring-0 focus:border-[var(--ds-accent-purple)] text-[color:var(--ds-text-primary)] placeholder:text-[color:var(--ds-text-secondary)]"
                            />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="p-1">
                                  <span className="sr-only">Exercise options</span>
                                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2" fill="currentColor" /><circle cx="12" cy="12" r="2" fill="currentColor" /><circle cx="19" cy="12" r="2" fill="currentColor" /></svg>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditingNotes({ groupId: group.id, exerciseId: exercise.id })}>
                                  <Pencil className="w-4 h-4" />
                                  {exercise.notes ? "Edit Notes" : "Add Notes"}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => {
                                  setMuscleGroups(prevGroups =>
                                    prevGroups.map(g =>
                                      g.id === group.id
                                        ? { ...g, exercises: g.exercises.filter(ex => ex.id !== exercise.id) }
                                        : g
                                    )
                                  );
                                }}>
                                  <Trash className="w-4 h-4" />
                                  Remove Exercise
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        {/* Notes Editor */}
                        {editingNotes && editingNotes.groupId === group.id && editingNotes.exerciseId === exercise.id && (
                          <div className="mt-3 p-4 bg-[var(--ds-surface)] border border-[color:var(--ds-border)] rounded-xl">
                            <Label htmlFor="exercise-notes" className="block mb-2 text-[color:var(--ds-text-primary)] font-medium">Notes</Label>
                            <textarea
                              id="exercise-notes"
                              value={exercise.notes}
                              onChange={e => updateNotes(group.id, exercise.id, e.target.value)}
                              placeholder="Add notes for this exercise..."
                              className="w-full h-20 resize-none border border-[color:var(--ds-border)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ds-accent-purple)] text-sm bg-[var(--ds-surface-elevated)] text-[color:var(--ds-text-primary)] placeholder:text-[color:var(--ds-text-secondary)]"
                            />
                            <div className="flex justify-end mt-3 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingNotes(null)}
                                className="rounded-xl"
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setEditingNotes(null)}
                                className="rounded-xl"
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        )}
                        {/* Display notes when not editing */}
                        {exercise.notes && (!editingNotes || editingNotes.groupId !== group.id || editingNotes.exerciseId !== exercise.id) && (
                          <div className="mb-3 bg-[var(--ds-accent-purple)]/10 p-3 rounded-xl text-sm text-[color:var(--ds-text-primary)] border border-[var(--ds-accent-purple)]/20">
                            {exercise.notes}
                          </div>
                        )}
                        {/* Sets Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-[color:var(--ds-text-secondary)]">
                                <th className="w-10 text-left pb-2">Set</th>
                                <th className="w-24 text-center pb-2">Lbs</th>
                                <th className="w-24 text-center pb-2">Reps</th>
                                <th className="w-10 text-center pb-2">
                                  <Check className="w-4 h-4 mx-auto" />
                                </th>
                                <th className="w-10 pb-2"></th>
                              </tr>
                            </thead>
                            <tbody className="">
                              {exercise.sets.map((set, idx) => {
                                const prevSet = idx > 0 ? exercise.sets[idx - 1] : null;
                                const weightPlaceholder = prevSet && prevSet.weight ? prevSet.weight : "0";
                                const repsPlaceholder = prevSet && prevSet.reps ? prevSet.reps : "0";
                                return (
                                  <tr
                                    key={set.id}
                                    className={`border-t border-[color:var(--ds-border)] last:border-b mt-4 ${set.completed ? "bg-[var(--ds-accent-purple)]/10 border-[var(--ds-accent-purple)]/20" : ""}`}
                                  >
                                    <td className={`text-center border-r border-[color:var(--ds-border)] ${set.completed ? 'border-[var(--ds-accent-purple)]/20' : ''}`}>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="p-0 rounded-none w-full">
                                            <span className="font-semibold">
                                              {set.type && set.type !== 'normal'
                                                ? (set.type === 'warmup' && 'W') ||
                                                  (set.type === 'drop' && 'D') ||
                                                  (set.type === 'failure' && 'F')
                                                : (() => {
                                                    // If previous set is warmup or drop, reset numbering to 1
                                                    let displayNum = 1;
                                                    for (let i = 0; i < idx; i++) {
                                                      if (
                                                        exercise.sets[i].type === 'warmup' ||
                                                        exercise.sets[i].type === 'drop'
                                                      ) {
                                                        displayNum = 1;
                                                      } else {
                                                        displayNum++;
                                                      }
                                                    }
                                                    return displayNum;
                                                  })()
                                              }
                                            </span>
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="start">
                                          <DropdownMenuItem onClick={() => updateSetType(group.id, exercise.id, set.id, 'warmup')}>Warmup Set</DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => updateSetType(group.id, exercise.id, set.id, 'drop')}>Drop Set</DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => updateSetType(group.id, exercise.id, set.id, 'failure')}>Failure</DropdownMenuItem>
                                          {set.type && set.type !== 'normal' && (
                                            <DropdownMenuItem onClick={() => updateSetType(group.id, exercise.id, set.id, 'normal')}>Normal Set</DropdownMenuItem>
                                          )}
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </td>
                                    <td className={`border-r border-[color:var(--ds-border)] ${set.completed ? 'border-[var(--ds-accent-purple)]/20' : ''}`}>
                                      <Input
                                        type="text"
                                        inputMode="decimal"
                                        value={displayWeight(set.weight, set.id)}
                                        onChange={e => handleWeightChange(group.id, exercise.id, set.id, e.target.value)}
                                        onFocus={() => setActiveInputId(set.id)}
                                        onBlur={() => {
                                          if (activeInputId === set.id) setActiveInputId(null);
                                          setTempInputs(prev => { const n = { ...prev }; delete n[set.id]; return n; });
                                        }}
                                        placeholder={weightPlaceholder}
                                        className={`text-center rounded-none w-full mx-auto px-2 font-medium border-none placeholder:text-[color:var(--ds-text-secondary)] text-[color:var(--ds-text-primary)] ${set.completed ? 'bg-transparent' : ''} ${invalidSetInputs[set.id] && (!set.weight || isNaN(parseFloat(set.weight))) ? 'border border-red-500 bg-red-100' : ''}`}
                                      />
                                    </td>
                                    <td className={`border-r border-[color:var(--ds-border)] ${set.completed ? 'border-[var(--ds-accent-purple)]/20' : ''}`}>
                                      <Input
                                        type="text"
                                        inputMode="numeric"
                                        value={set.reps}
                                        onChange={e => updateSet(group.id, exercise.id, set.id, "reps", e.target.value)}
                                        placeholder={repsPlaceholder}
                                        className={`text-center rounded-none w-full mx-auto px-2 font-medium border-none placeholder:text-[color:var(--ds-text-secondary)] text-[color:var(--ds-text-primary)] ${set.completed ? 'bg-transparent' : ' '} ${invalidSetInputs[set.id] && (!set.weight || isNaN(parseFloat(set.weight))) ? 'border border-red-500 bg-red-100' : ''}`}
                                      />
                                    </td>
                                    <td className={`text-center ${set.completed ? 'border-[var(--ds-accent-purple)]/20' : 'border-r border-[color:var(--ds-border)]'}`}>
                                      <Button
                                        variant={set.completed ? "default" : "outline"}
                                        size="icon"
                                        className={` mx-auto w-full rounded-none border-none ${set.completed ? "bg-[var(--ds-accent-purple)] text-white" : "bg-transparent text-[color:var(--ds-text-primary)]"} `}
                                        onClick={() => tryToggleSetCompletion(group.id, exercise.id, set)}
                                        title={set.completed ? "Completed" : "Mark as complete"}
                                      >
                                        <Check
                                          className="w-4 h-4"
                                          strokeWidth={set.completed ? 3 : 2.5}
                                        />
                                      </Button>
                                    </td>
                                    <td className="text-center">
                                      {exercise.sets.length > 1 && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="text-red-500"
                                          onClick={() => removeSet(group.id, exercise.id, set.id)}
                                          title="Remove set"
                                        >
                                          <Minus className="w-4 h-4" />
                                        </Button>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <div className="mt-3">
                          <Button
                            variant="accent"
                            size="sm"
                            onClick={() => addSet(group.id, exercise.id)}
                            className="w-full rounded-xl"
                          >
                            + Add Set
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  <Button
                    variant="secondary"
                    className="w-full mt-2"
                    onClick={() => addExercise(group.id)}
                  >
                    + Add Exercise
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>


      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-20 left-0 right-0 bg-[var(--ds-surface)] border-t border-[color:var(--ds-border)] p-4 z-20 backdrop-blur-sm">
        <div className="max-w-md mx-auto flex gap-2">
          <Button variant="outline" onClick={() => setIsSavingTemplate(true)} className="rounded-xl">
            Save Template
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm('Are you sure you want to cancel this workout? All progress will be lost.')) {
                localStorage.removeItem('workoutSetup');
                localStorage.removeItem('selectedExercises');
                clearWorkoutProgress(); 
                router.push('/dashboard');
              }
            }}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button variant="primary" size="lg" className="flex-1 rounded-xl" onClick={finishWorkout} disabled={isSaving}>
            {isSaving ? "Saving..." : "Finish Workout"}
          </Button>
        </div>
      </div>

      {/* Save as Template Dialog */}
      <Dialog open={isSavingTemplate} onOpenChange={setIsSavingTemplate}>
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle className="text-[color:var(--ds-text-primary)]">Save Workout as Template</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name" className="text-[color:var(--ds-text-primary)] font-medium">Template Name *</Label>
              <Input 
                id="template-name" 
                value={templateName} 
                onChange={e => setTemplateName(e.target.value)} 
                className="mt-1 rounded-xl border border-[color:var(--ds-border)] bg-[var(--ds-surface-elevated)] focus:border-[var(--ds-accent-purple)] text-[color:var(--ds-text-primary)]"
              />
            </div>
            <div>
              <Label htmlFor="template-description" className="text-[color:var(--ds-text-primary)] font-medium">Description (Optional)</Label>
              <textarea
                id="template-description"
                value={templateDescription}
                onChange={e => setTemplateDescription(e.target.value)}
                placeholder="Add notes about this workout template..."
                className="mt-1 w-full h-20 resize-none border border-[color:var(--ds-border)] rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ds-accent-purple)] text-sm bg-[var(--ds-surface-elevated)] text-[color:var(--ds-text-primary)] placeholder:text-[color:var(--ds-text-secondary)]"
              />
            </div>
            <div>
              <Label htmlFor="template-day" className="text-[color:var(--ds-text-primary)] font-medium">Target Day (Optional)</Label>
              <select
                id="template-day"
                value={templateDay}
                onChange={e => setTemplateDay(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-[color:var(--ds-border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--ds-accent-purple)] bg-[var(--ds-surface-elevated)] text-[color:var(--ds-text-primary)]"
              >
              <option value="">Select a day</option>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="includeWeights"
                checked={includeWeights}
                onChange={e => setIncludeWeights(e.target.checked)}
                className="h-4 w-4 text-[var(--ds-accent-purple)] focus:ring-[var(--ds-accent-purple)] border-[color:var(--ds-border)] rounded"
              />
              <Label htmlFor="includeWeights" className="text-[color:var(--ds-text-primary)]">Include weights in template</Label>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsSavingTemplate(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveAsTemplate} disabled={!templateName.trim()} className="rounded-xl">
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 