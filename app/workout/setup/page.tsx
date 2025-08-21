'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import MuscleGroupSelectionComponent from './MuscleGroupSelection';
import ExerciseSelectionComponent from './ExerciseSelection';
import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';


type WarmupInputMode = 'reps' | 'duration' | 'distance';
interface WarmupDef { name: string; mode: WarmupInputMode }

interface WorkoutSetup {
  day: string;
  muscleGroups: string[];
  notes: string;
  timestamp: string;
  startTime: number;
}

interface SelectedExercises {
  [muscleGroup: string]: string[];
}

interface SelectedWarmup { name: string; mode: WarmupInputMode }

function WorkoutSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedMuscleGroups, setSelectedMuscleGroups] = useState<string[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercises>({});
  const [selectedCardio, setSelectedCardio] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [userHasSelectedGroups, setUserHasSelectedGroups] = useState(false);

  const fromTodaysWorkout = searchParams.get('from') === 'todaysWorkout';

  const userProfile = useQuery(api.users.getProfile,
    user?.id ? { userId: user.id } : 'skip'
  );

  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

  const createWorkout = useMutation(api.workouts.createWorkout);

  useEffect(() => {
    if (userProfile && !userHasSelectedGroups && fromTodaysWorkout) {
      const todayMuscleGroups = userProfile?.muscleFocus || [];
      
      if (userProfile?.trainingDays?.[dayOfWeek as keyof typeof userProfile.trainingDays] && 
          todayMuscleGroups.length > 0) {
        setSelectedMuscleGroups([...todayMuscleGroups]);
      }
    }
  }, [userProfile, dayOfWeek, userHasSelectedGroups, fromTodaysWorkout]);

  useEffect(() => {
    const initialSelected: SelectedExercises = {};
    selectedMuscleGroups.forEach(group => {
      initialSelected[group] = [];
    });
    setSelectedExercises(initialSelected);
  }, [selectedMuscleGroups]);

  const handleContinueToExercises = () => {
    if (selectedMuscleGroups.length === 0 && selectedCardio.length > 0) {
      handleStartWorkout();
      return;
    }
    setStep(2);
  };

  const handleBackToMuscleGroups = () => {
    setStep(1);
  };

  const handleStartWorkout = () => {
    if (!user?.id) return;

    setIsCreating(true);

    try {
      const workoutSetup = {
        day: today.toLocaleDateString('en-US', { weekday: 'long' }),
        muscleGroups: selectedMuscleGroups,
        notes: notes,
        timestamp: today.toISOString(),
        startTime: Date.now()
      };

      router.push('/workout/new');

      localStorage.setItem('workoutSetup', JSON.stringify(workoutSetup));
      localStorage.setItem('selectedExercises', JSON.stringify(selectedExercises));
      localStorage.setItem('selectedCardio', JSON.stringify(selectedCardio));
      
    } catch (error) {
      console.error('Error setting up workout:', error);
      alert('Failed to set up workout. Please try again.');
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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const workoutSetup: WorkoutSetup = {
    day: today.toLocaleDateString('en-US', { weekday: 'long' }),
    muscleGroups: selectedMuscleGroups,
    notes: notes,
    timestamp: today.toISOString(),
    startTime: Date.now()
  };

  return (
    <div className="bg-[var(--ds-bg-primary)]" key="workout-setup-page">
      <div className="max-w-md mx-auto px-4 py-8 pb-24">
        {step === 1 && (
    <>
            <header className="mb-6 flex items-center gap-4">
              <Button
                variant="back"
                size="icon"
                onClick={() => router.push('/dashboard')}
                aria-label="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-[color:var(--ds-text-primary)]">New Workout</h1>
                <p className="text-[color:var(--ds-text-secondary)] text-xs">
              {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
              </div>
          </header>

            <MuscleGroupSelectionComponent
              selectedMuscleGroups={selectedMuscleGroups}
              setSelectedMuscleGroups={setSelectedMuscleGroups}
              selectedCardio={selectedCardio}
              setSelectedCardio={setSelectedCardio}
              notes={notes}
              setNotes={setNotes}
              onNext={handleContinueToExercises}
              userHasSelectedGroups={userHasSelectedGroups}
              setUserHasSelectedGroups={setUserHasSelectedGroups}
            />
          </>
        )}
        
        {step === 2 && (
          <ExerciseSelectionComponent
            workoutSetup={workoutSetup}
            selectedExercises={selectedExercises}
            setSelectedExercises={setSelectedExercises}
            selectedCardio={selectedCardio}
            onBack={handleBackToMuscleGroups}
            onNext={handleStartWorkout}
          />
        )}
      </div>
    </div>
  );
}

export default function WorkoutSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <WorkoutSetupContent />
    </Suspense>
  );
} 