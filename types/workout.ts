import { Id } from '@/convex/_generated/dataModel';

export interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  notes?: string;
}

export interface ExerciseSet {
  id: string;
  weight: string;
  reps: string;
  completed: boolean;
  type?: 'normal' | 'warmup' | 'drop' | 'failure';
}

export interface MuscleGroup {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface CardioItem {
  id: string;
  name: string;
  distance?: string;
  duration?: string;
  pace?: string;
  calories?: string;
  completed: boolean;
}

export type WarmupInputMode = 'reps' | 'duration' | 'distance';

export interface WarmupSet {
  id: string;
  reps?: string;
  duration?: string;
  distance?: string;
  completed: boolean;
}

export interface WarmupItem {
  id: string;
  name: string;
  mode: WarmupInputMode;
  sets: WarmupSet[];
}

export interface StretchItem {
  id: string;
  name: string;
  target: string;
  imageUrl?: string;
  duration?: string;
  completed: boolean;
}

export interface Workout {
  _id: string;
  userId: string;
  templateId?: Id<'workoutTemplates'>;
  name: string;
  date: string;
  duration?: number;
  totalVolume?: number;
  muscleGroups?: MuscleGroup[];
  cardio?: CardioItem[];
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSetup {
  day: string;
  muscleGroups: string[];
  notes: string;
  timestamp: string;
  startTime: number;
  name?: string;
  fromTemplate?: boolean;
  templateId?: Id<'workoutTemplates'>;
}

export interface SavedWorkoutProgress {
  muscleGroups: MuscleGroup[];
  elapsedTime: number;
  lastSaved: number;
  warmups?: WarmupItem[];
  stretches?: StretchItem[];
  cardio?: CardioItem[];
}

export interface WorkoutTemplate {
  _id: Id<'workoutTemplates'>;
  userId: string;
  folderId?: Id<'folders'>;
  name: string;
  description?: string;
  targetDay?: string;
  muscleGroups: MuscleGroup[];
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
}

export interface VolumeData {
  date: string;
  volume: number;
}

export interface MuscleGroupData {
  name: string;
  count: number;
}

export interface FrequencyData {
  week: string;
  count: number;
}

export interface ProgressData {
  name: string;
  data: Array<{
    date: string;
    estimatedMax?: number;
    volume?: number;
  }>;
}

export type SortOption = 'date-newest' | 'date-oldest' | 'volume-highest' | 'volume-lowest' | 'duration-longest' | 'duration-shortest';
export type FilterOption = 'all' | string;
