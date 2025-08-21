'use client';

import { Card, CardDescription, CardTitle, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Dumbbell, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';
import { Pill } from '@/components/ui/pill';

const ALL_MUSCLE_GROUPS = [
  { name: 'chest' },
  { name: 'back' },
  { name: 'shoulders' },
  { name: 'biceps' },
  { name: 'triceps' },
  { name: 'legs' },
  { name: 'glutes' },
  { name: 'abs' },
  { name: 'calves' }
];

const cardioDatabase: string[] = ['Treadmill', 'Outdoor Run', 'Cycling', 'Rowing', 'Elliptical'];

type MuscleGroupSelectionProps = {
    selectedMuscleGroups: string[];
    setSelectedMuscleGroups: (groups: string[]) => void;
    selectedCardio: string[];
    setSelectedCardio: (cardio: string[]) => void;
    notes: string;
    setNotes: (notes: string) => void;
    onNext: () => void;
    userHasSelectedGroups: boolean;
    setUserHasSelectedGroups: (value: boolean) => void;
};
  
export default function MuscleGroupSelection({
    selectedMuscleGroups,
    setSelectedMuscleGroups,
    selectedCardio,
    setSelectedCardio,
    notes,
    setNotes,
    onNext,
    userHasSelectedGroups,
    setUserHasSelectedGroups,
  }: MuscleGroupSelectionProps) {
    const toggleMuscleGroup = (group: string) => {
    const normalizedGroup = group.toLowerCase();
    
    if (!userHasSelectedGroups) {
      setUserHasSelectedGroups(true);
      if (selectedMuscleGroups.includes(normalizedGroup)) {
        setSelectedMuscleGroups([normalizedGroup]);
        return;
      }
      setSelectedMuscleGroups([normalizedGroup]);
      return;
    }
    
    const updatedGroups = [...selectedMuscleGroups];
    if (updatedGroups.includes(normalizedGroup)) {
      setSelectedMuscleGroups(updatedGroups.filter(g => g !== normalizedGroup));
    } else {
      const similarIndex = updatedGroups.findIndex(g => g.toLowerCase() === normalizedGroup);
      if (similarIndex >= 0) {
        updatedGroups[similarIndex] = normalizedGroup;
        setSelectedMuscleGroups(updatedGroups);
      } else {
        setSelectedMuscleGroups([...updatedGroups, normalizedGroup]);
      }
    }
  };

  return (
    <Card className="flex flex-col rounded-2xl bg-[var(--ds-surface)] border border-[color:var(--ds-border)]">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-[color:var(--ds-text-primary)]">
          <span className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-[color:var(--ds-text-primary)]" />
            Select Muscle Groups
          </span>
          <Pill variant="tertiary" size="sm">Step 1 of 2</Pill>
        </CardTitle>
        <CardDescription className="text-[color:var(--ds-text-secondary)]">Choose the muscle groups you want to train today</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-4">
        <div className="grid grid-cols-3 gap-3">
          {ALL_MUSCLE_GROUPS.map(group => {
            const isActive = selectedMuscleGroups.includes(group.name);
            return (
              <button
                key={group.name}
                onClick={() => toggleMuscleGroup(group.name)}
                className={`px-3.5 py-2 rounded-md text-center text-sm transition-all ${
                  isActive
                    ? 'bg-[var(--ds-accent-purple)] text-[var(--ds-on-accent)] border border-transparent shadow-sm'
                    : 'bg-[var(--ds-surface-elevated)] text-[color:var(--ds-text-primary)] border border-[color:var(--ds-border)] hover:bg-[var(--ds-bg-secondary)]'
                }`}
              >
                <span className="inline-flex items-center gap-2 justify-center">
                  {group.name.charAt(0).toUpperCase() + group.name.slice(1)}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-[color:var(--ds-text-secondary)] mt-3">Tip: You can select multiple groups</p>

        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-[color:var(--ds-text-primary)] flex items-center gap-2"><Activity className="h-4 w-4 text-[color:var(--ds-text-secondary)]" /> Add Cardio</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {cardioDatabase.map(c => {
              const isSelected = selectedCardio.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => setSelectedCardio(isSelected ? selectedCardio.filter((x: string) => x !== c) : [...selectedCardio, c])}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isSelected 
                    ? 'bg-[var(--ds-accent-purple)] text-[var(--ds-on-accent)] border border-transparent' 
                    : 'bg-[var(--ds-surface-elevated)] text-[color:var(--ds-text-primary)] border border-[color:var(--ds-border)] hover:bg-[var(--ds-bg-secondary)]'}`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="notes" className="block text-sm font-medium text-[color:var(--ds-text-primary)] mb-1">
            Workout Notes <span className="text-[color:var(--ds-text-secondary)] text-xs">(Optional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 rounded-lg bg-[var(--ds-surface-elevated)] border border-[color:var(--ds-border)] text-[color:var(--ds-text-primary)] focus:outline-none"
            rows={3}
            placeholder="How are you feeling today? Any specific goals?"
          />
        </div>

        <div className="flex w-full mt-4">
          <Button
            onClick={onNext}
            disabled={(selectedMuscleGroups.length === 0 && selectedCardio.length === 0)}
            className="flex-1 items-center justify-center gap-2 text-[var(--ds-on-accent)] border-0"
            style={{ backgroundImage: 'linear-gradient(135deg, var(--ds-gradient-purple-from), var(--ds-gradient-purple-to))' }}
          >
            <span>{selectedMuscleGroups.length > 0 ? 'Continue to Exercises' : 'Start Workout'}</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      {/* <CardFooter className="pb-4 flex flex-col gap-4">
        {selectedMuscleGroups.length === 0 && (
          <p className="text-center text-sm text-amber-600">Please select at least one muscle group to continue</p>
        )}
      </CardFooter> */}
    </Card>
  );
}


