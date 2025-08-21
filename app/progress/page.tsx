'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import CalendarView from '@/app/components/CalendarView';
import { CalendarDays, Dumbbell, Clock } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WorkoutHistory from './components/WorkoutHistory';
import Analytics from './components/Analytics';

interface Workout {
  _id: string;
  date: string;
  name: string;
  duration?: number;
  totalVolume?: number;
  muscleGroups?: {
    id: string;
    name: string;
    exercises: {
      id: string;
      name: string;
      sets: {
        id: string;
        weight: string;
        reps: string;
        completed: boolean;
      }[];
    }[];
  }[];
}

export default function ProgressPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showCalendar, setShowCalendar] = useState(false);

  const workouts = useQuery(api.workouts.getRecentWorkouts,
    user?.id ? { userId: user.id, limit: 100 } : 'skip'
  ) as Workout[] | undefined;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const processWorkoutData = () => {
    if (!workouts || workouts.length === 0) return {
      volumeData: [],
      muscleGroupData: [],
      frequencyData: []
    };

    const sortedWorkouts = [...workouts].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const volumeData = sortedWorkouts.map(workout => ({
      date: formatDate(workout.date),
      volume: workout.totalVolume || 0
    }));

    const muscleGroupCounts: Record<string, number> = {};

    workouts.forEach(workout => {
      if (workout.muscleGroups) {
        workout.muscleGroups.forEach(group => {
          muscleGroupCounts[group.name] = (muscleGroupCounts[group.name] || 0) + 1;
        });
      }
    });

    const muscleGroupData = Object.entries(muscleGroupCounts).map(([name, count]) => ({
      name,
      count
    }));

    const weekMap: Record<string, number> = {};

    sortedWorkouts.forEach(workout => {
      const date = new Date(workout.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      weekMap[weekKey] = (weekMap[weekKey] || 0) + 1;
    });

    const frequencyData = Object.entries(weekMap).map(([week, count]) => ({
      week: `Week of ${formatDate(week)}`,
      count
    }));

    return {
      volumeData,
      muscleGroupData,
      frequencyData
    };
  };

  const { volumeData, muscleGroupData, frequencyData } = processWorkoutData();

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[color:var(--ds-accent-purple)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--ds-bg-primary)]">
      <div className="max-w-md mx-auto px-4 py-8 pb-24 space-y-6">
        {/* Header */}
        <header className="">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-[color:var(--ds-text-primary)]">Progress</h1>
              <p className="text-sm text-[color:var(--ds-text-secondary)]">Track your workout history</p>
            </div>
            <button 
              onClick={() => setShowCalendar(!showCalendar)} 
              className="p-2 rounded-full border border-[color:var(--ds-border)] bg-[var(--ds-surface-elevated)] text-[color:var(--ds-text-primary)] hover:bg-[var(--ds-bg-secondary)]"
              aria-pressed={showCalendar}
            >
              <CalendarDays className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Calendar View */}
        {showCalendar && (
          <div className="bg-[var(--ds-surface)] rounded-xl border border-[color:var(--ds-border)] p-4">
            <div className="calendar-grid">
              <CalendarView workouts={workouts || []} />
            </div>
          </div>
        )}

        {/* Stats overview */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[var(--ds-surface)] border border-[color:var(--ds-border)] p-3 rounded-xl">
            <p className="text-xs text-[color:var(--ds-text-secondary)] mb-1">Total Workouts</p>
            <p className="text-xl font-bold text-[color:var(--ds-text-primary)]">{workouts?.length || 0}</p>
          </div>
          <div className="bg-[var(--ds-surface)] border border-[color:var(--ds-border)] p-3 rounded-xl">
            <p className="text-xs text-[color:var(--ds-text-secondary)] mb-1">
              This Month
            </p>
            <p className="text-xl font-bold text-[color:var(--ds-text-primary)]">
              {workouts?.filter((w: Workout) => {
                const date = new Date(w.date);
                const now = new Date();
                return date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear();
              }).length || 0}
            </p>
          </div>
        </div>

        <Tabs defaultValue="history" className="w-full">
          <TabsList className="w-full grid grid-cols-2 rounded-xl bg-[var(--ds-surface-elevated)] border border-[color:var(--ds-border)] p-1">
            <TabsTrigger 
              value="history"
              className="rounded-lg"
            >
              Workout History
            </TabsTrigger>
            <TabsTrigger 
              value="analytics"
              className="rounded-lg"
            >
              Analytics
            </TabsTrigger>
          </TabsList>
          <TabsContent value="history">
            <div className='mt-3'>
              <WorkoutHistory 
                workouts={workouts || []} 
              />
            </div>
          </TabsContent>
          <TabsContent value="analytics">
            <div className='mt-3'>

              <Analytics
                volumeData={volumeData}
                muscleGroupData={muscleGroupData}
                frequencyData={frequencyData}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
