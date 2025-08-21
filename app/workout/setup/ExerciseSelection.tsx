'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Activity, Check, Plus, Search } from 'lucide-react';
import { WorkoutSetup, SelectedExercises } from './types';
import { Pill } from '@/components/ui/pill';
import { Input } from '@/components/ui/input';

const exerciseDatabase: Record<string, string[]> = {
  chest: ["Bench Press","Incline Bench Press","Decline Bench Press","Dumbbell Fly","Cable Crossover","Chest Dip","Push-Up","Machine Chest Press","Pec Deck","Landmine Press"],
  back: ["Pull-Up","Lat Pulldown","Bent Over Row","T-Bar Row","Seated Cable Row","Deadlift","Single-Arm Dumbbell Row","Face Pull","Straight-Arm Pulldown","Inverted Row"],
  shoulders: ["Overhead Press","Lateral Raise","Front Raise","Reverse Fly","Upright Row","Arnold Press","Face Pull","Shrug","Military Press","Pike Push-Up"],
  arms: ["Bicep Curl","Tricep Extension","Hammer Curl","Skull Crusher","Preacher Curl","Cable Pushdown","Concentration Curl","Dip","Chin-Up","Close-Grip Bench Press"],
  legs: ["Squat","Deadlift","Leg Press","Lunge","Leg Extension","Leg Curl","Calf Raise","Romanian Deadlift","Hip Thrust","Bulgarian Split Squat"],
  core: ["Plank","Crunch","Russian Twist","Leg Raise","Mountain Climber","Ab Rollout","Hanging Leg Raise","Side Plank","Bicycle Crunch","Dead Bug"],
  fullBody: ["Burpee","Clean and Press","Thruster","Turkish Get-Up","Kettlebell Swing","Medicine Ball Slam","Battle Rope","Mountain Climber","Jumping Jack","Bear Crawl"],
};

const muscleGroupToExerciseKey: Record<string, string> = {
  chest: 'chest', back: 'back', shoulders: 'shoulders', biceps: 'arms', triceps: 'arms', legs: 'legs', glutes: 'legs', abs: 'core', calves: 'legs', fullBody: 'fullBody'
};

const muscleGroupLabels: Record<string, string> = {
  chest: 'Chest', back: 'Back', arms: 'Arms', legs: 'Legs', core: 'Core', shoulders: 'Shoulders', fullBody: 'Full Body', biceps: 'Biceps', triceps: 'Triceps', glutes: 'Glutes', abs: 'Abs', calves: 'Calves'
};

export default function ExerciseSelection({
  workoutSetup,
  selectedExercises,
  setSelectedExercises,
  selectedCardio,
  onBack,
  onNext,
}: {
  workoutSetup: WorkoutSetup;
  selectedExercises: SelectedExercises;
  setSelectedExercises: (exercises: SelectedExercises) => void;
  selectedCardio: string[];
  onBack: () => void;
  onNext: () => void;
}) {
  const [customExercise, setCustomExercise] = useState<{[key: string]: string}>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [exerciseSearchByGroup, setExerciseSearchByGroup] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const initialCustom: {[key: string]: string} = {};
    workoutSetup.muscleGroups.forEach(group => { initialCustom[group] = ''; });
    setCustomExercise(initialCustom);
    
    const initialExpandedState: Record<string, boolean> = {};
    workoutSetup.muscleGroups.forEach((group, index) => { 
      initialExpandedState[group] = workoutSetup.muscleGroups.length > 1 ? index === 0 : true; 
    });
    setExpandedGroups(initialExpandedState);
  }, [workoutSetup.muscleGroups]);

  const toggleExercise = (muscleGroup: string, exercise: string) => {
    const currentSelected = selectedExercises[muscleGroup] || [];
    if (currentSelected.includes(exercise)) {
      const updated = { ...selectedExercises, [muscleGroup]: currentSelected.filter(ex => ex !== exercise) };
      setSelectedExercises(updated);
    } else {
      const updated = { ...selectedExercises, [muscleGroup]: [...currentSelected, exercise] };
      setSelectedExercises(updated);
    }
  };

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const addCustomExercise = (muscleGroup: string) => {
    if (customExercise[muscleGroup]?.trim()) {
      const updated = { ...selectedExercises, [muscleGroup]: [...(selectedExercises[muscleGroup] || []), customExercise[muscleGroup].trim()] };
      setSelectedExercises(updated);
      setCustomExercise({ ...customExercise, [muscleGroup]: '' });
    }
  };

  const hasMuscleGroups = workoutSetup.muscleGroups.length > 0;
  const hasAllExercises = hasMuscleGroups && workoutSetup.muscleGroups.every(group => selectedExercises[group] && selectedExercises[group].length > 0);
  const isValid = hasAllExercises;

  return (
    <div className="space-y-6">
      <header className="mb-6">
        <div className="flex items-center space-x-2 mb-1">
          <Button variant="back" onClick={onBack} className="flex items-center gap-1 px-0 text-[color:var(--ds-text-primary)]" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-[color:var(--ds-text-primary)]">Select Exercises</h1>
        </div>
        <p className="mt-2 text-sm text-[color:var(--ds-text-secondary)]">Choose exercises for each muscle group in your workout</p>
      </header>

      <div className="mb-6 rounded-xl p-4 bg-[var(--ds-surface)] border border-[color:var(--ds-border)]">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-medium text-[color:var(--ds-text-primary)]">Exercise Selection</h2>
          <Pill variant="tertiary" size="sm">{Object.values(selectedExercises).reduce((sum, ex) => sum + ex.length, 0)} selected</Pill>
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {(workoutSetup.muscleGroups.length > 0 ? workoutSetup.muscleGroups : Object.keys(selectedExercises)).map(group => (
            <button
              key={group}
              onClick={() => {
                toggleGroupExpansion(group);
                document.getElementById(`group-${group}`)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium ${selectedExercises[group]?.length > 0 ? 'bg-[var(--ds-accent-purple)] text-[var(--ds-on-accent)]' : 'bg-[var(--ds-surface-elevated)] text-[color:var(--ds-text-primary)] border border-[color:var(--ds-border)]'}`}
            >
              {muscleGroupLabels[group] || group.charAt(0).toUpperCase() + group.slice(1)}: {selectedExercises[group]?.length || 0}
            </button>
          ))}
        </div>
      </div>



      {/* Per-muscle group exercise selection */}
      <div className="space-y-6">
        {(workoutSetup.muscleGroups.length > 0 ? workoutSetup.muscleGroups : Object.keys(selectedExercises)).map(muscleGroup => {
          const allExercises = exerciseDatabase[muscleGroupToExerciseKey[muscleGroup]] || [];
          const searchQuery = (exerciseSearchByGroup[muscleGroup] || '').trim();
          const filteredExercises = searchQuery
            ? allExercises.filter(ex => ex.toLowerCase().includes(searchQuery.toLowerCase()))
            : allExercises;
          return (
          <div key={muscleGroup} id={`group-${muscleGroup}`} className="rounded-xl overflow-hidden bg-[var(--ds-surface)] border border-[color:var(--ds-border)]">
            <div
              className="p-4 bg-[var(--ds-bg-secondary)] border-b border-[color:var(--ds-border)] cursor-pointer hover:bg-[var(--ds-accent-purple)]"
              onClick={() => toggleGroupExpansion(muscleGroup)}
            >
              <div className="flex justify-between items-center ">
                <div className=''>
                  <h2 className="font-semibold text-[color:var(--ds-text-primary)] flex items-center">
                    {muscleGroupLabels[muscleGroup] || muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1)} Exercises
                    {(selectedExercises[muscleGroup]?.length || 0) === 0 && (
                      <span className="ml-2"><Pill variant="tertiary" size="sm">Required</Pill></span>
                    )}
                  </h2>
                  <p className="text-xs text-[color:var(--ds-text-secondary)] mt-1">
                    Selected: {selectedExercises[muscleGroup]?.length || 0} exercises
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 text-[color:var(--ds-text-secondary)] transition-transform ${expandedGroups[muscleGroup] ? 'transform rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>

            {expandedGroups[muscleGroup] && (
              <div className="p-4">
                {/* Per-group search */}
                <div className="mb-3">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--ds-text-secondary)]">
                      <Search className="h-4 w-4" />
                    </span>
                    <Input
                      value={exerciseSearchByGroup[muscleGroup] || ''}
                      onChange={(e) => setExerciseSearchByGroup(prev => ({ ...prev, [muscleGroup]: e.target.value }))}
                      placeholder="Search exercises in this group..."
                      className="pl-9 bg-[var(--ds-surface-elevated)] border-[color:var(--ds-border)] text-[color:var(--ds-text-primary)]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 mb-4">
                  {filteredExercises.length === 0 && searchQuery ? (
                    <div className="text-xs text-[color:var(--ds-text-secondary)] p-2">No exercises match your search.</div>
                  ) : (
                    filteredExercises.map(exercise => (
                    <button
                      key={exercise}
                      onClick={() => toggleExercise(muscleGroup, exercise)}
                      className={`p-3 text-left rounded-lg flex items-center transition-colors ${selectedExercises[muscleGroup]?.includes(exercise)
                        ? 'bg-[var(--ds-accent-purple)] text-[var(--ds-on-accent)] border border-transparent shadow-sm'
                        : 'bg-[var(--ds-surface-elevated)] border border-[color:var(--ds-border)] text-[color:var(--ds-text-primary)] hover:bg-[var(--ds-bg-secondary)]'
                      }`}
                    >
                      <span className="mr-3">
                        {selectedExercises[muscleGroup]?.includes(exercise) ? (
                          <Check className="h-5 w-5 text-[var(--ds-on-accent)]" />
                        ) : (
                          <Plus className="h-5 w-5 text-[color:var(--ds-text-secondary)]" />
                        )}
                      </span>
                      {exercise}
                    </button>
                  )))}

                  {(!exerciseDatabase[muscleGroupToExerciseKey[muscleGroup]] ||
                    exerciseDatabase[muscleGroupToExerciseKey[muscleGroup]]?.length === 0) && (
                    <div className="p-4 text-center bg-[var(--ds-surface-elevated)] rounded-lg border border-[color:var(--ds-border)]">
                      <p className="text-[color:var(--ds-text-primary)]">No predefined exercises available for {muscleGroup}.</p>
                      <p className="text-sm text-[color:var(--ds-text-secondary)] mt-1">Please add custom exercises below.</p>
                    </div>
                  )}
                </div>

                {/* Custom exercise input */}
                <div className="mt-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={customExercise[muscleGroup] || ''}
                      onChange={(e) => setCustomExercise(prev => ({ ...prev, [muscleGroup]: e.target.value }))}
                      placeholder="Add custom exercise..."
                      className="flex-1 px-3 py-2 rounded-md bg-[var(--ds-surface-elevated)] border border-[color:var(--ds-border)] text-[color:var(--ds-text-primary)] focus:outline-none"
                      onKeyDown={(e) => { if (e.key === 'Enter') { addCustomExercise(muscleGroup); } }}
                    />
                    <button
                      onClick={() => addCustomExercise(muscleGroup)}
                      className="px-3 py-2 rounded-md text-[var(--ds-on-accent)]"
                      style={{ backgroundImage: 'linear-gradient(135deg, var(--ds-gradient-purple-from), var(--ds-gradient-purple-to))' }}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Show selected custom exercises */}
                {selectedExercises[muscleGroup]?.filter(ex => {
                  const dbKey = muscleGroupToExerciseKey[muscleGroup];
                  return !dbKey || !exerciseDatabase[dbKey]?.includes(ex);
                }).length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-[color:var(--ds-text-primary)] mb-2">Custom Exercises</h3>
                    <div className="space-y-2">
                      {selectedExercises[muscleGroup]
                        .filter(ex => {
                          const dbKey = muscleGroupToExerciseKey[muscleGroup];
                          return !dbKey || !exerciseDatabase[dbKey]?.includes(ex);
                        })
                        .map(customEx => (
                          <div key={customEx} className="flex justify-between items-center p-2 bg-[var(--ds-surface-elevated)] rounded border border-[color:var(--ds-border)]">
                            <span>{customEx}</span>
                            <button onClick={() => toggleExercise(muscleGroup, customEx)} className="text-red-500 hover:text-red-700">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
        })}
      </div>

      {/* Cardio section */}
      {selectedCardio && selectedCardio.length > 0 && (
        <div className="rounded-xl p-3 bg-[var(--ds-surface)] border border-[color:var(--ds-border)]">
          <div className="flex items-center gap-2 mb-2 text-[color:var(--ds-text-primary)]">
            <Activity className="h-4 w-4 text-[color:var(--ds-text-secondary)]" />
            <span className="text-sm font-medium">Cardio</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedCardio.map((c) => (
              <Pill key={c} variant="tertiary" size="sm">{c}</Pill>
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-[var(--ds-surface-elevated)] border-t border-[color:var(--ds-border)] p-4 z-20">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-[color:var(--ds-text-secondary)]">Total exercises: {Object.values(selectedExercises).reduce((sum, ex) => sum + ex.length, 0)}</div>
          </div>
          <div className="flex space-x-3">
            <Button variant="destructive" onClick={() => { if (confirm('Are you sure you want to cancel this workout? All progress will be lost.')) { window.location.href = '/dashboard'; } }} className="bg-red-100 text-red-700 hover:bg-red-200 border-0">Cancel</Button>
            <Button onClick={onNext} disabled={!isValid} className="flex-1 items-center justify-center gap-2 text-[var(--ds-on-accent)] border-0" style={{ backgroundImage: 'linear-gradient(135deg, var(--ds-gradient-purple-from), var(--ds-gradient-purple-to))' }}>
              <span>Start Workout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


