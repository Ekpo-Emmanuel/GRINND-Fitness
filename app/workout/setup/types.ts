'use client';

export type WarmupInputMode = 'reps' | 'duration' | 'distance';

export interface SelectedWarmup { name: string; mode: WarmupInputMode }

export interface WorkoutSetup {
  day: string;
  muscleGroups: string[];
  notes: string;
  timestamp: string;
  startTime: number;
}

export interface SelectedExercises {
  [muscleGroup: string]: string[];
}


