'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/providers';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Link from 'next/link';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Play, Dumbbell, Clock, Weight, LayoutPanelTop, FileText, UserRound, History } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const userProfile = useQuery(api.users.getProfile, user?.id ? { userId: user.id } : 'skip');
  const lastWorkout = useQuery(api.workouts.getLastWorkout, user?.id ? { userId: user.id } : 'skip');
  const workouts = useQuery(api.workouts.getRecentWorkouts, user?.id ? { userId: user.id, limit: 20 } : 'skip');

  const recentWorkouts = workouts ? [...workouts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 2) : [];

  const today = new Date();
  const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const isTodayTrainingDay = userProfile?.trainingDays?.[dayOfWeek as keyof typeof userProfile.trainingDays] || false;
  const todayMuscleGroups = userProfile?.muscleFocus || [];

  const formatWorkoutDate = (workout: any) => {
    if (!workout?.date) return null;
    const date = new Date(workout.date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const muscleGroups = workout.muscleGroups?.map((group: any) => group.name).join(', ') || '';
    return { day: dayName, focus: muscleGroups };
  };

  const formatDuration = (seconds: number | undefined): string => {
    if (!seconds) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const calculateWeekProgress = () => {
    if (!workouts || !userProfile?.trainingDays) return { completed: 0, total: 0, percentage: 0 };
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    const workoutsThisWeek = workouts.filter((workout: any) => {
      const workoutDate = new Date(workout.date);
      return workoutDate >= startOfWeek && workoutDate <= endOfWeek && workout.completed;
    });
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const plannedDays = weekdays.reduce((count, day) => count + ((userProfile.trainingDays && userProfile.trainingDays[day as keyof typeof userProfile.trainingDays]) ? 1 : 0), 0);
    return { completed: workoutsThisWeek.length, total: plannedDays, percentage: plannedDays > 0 ? (workoutsThisWeek.length / plannedDays) * 100 : 0 };
  };

  const weekProgress = calculateWeekProgress();
  const lastWorkoutInfo = formatWorkoutDate(lastWorkout);

  const startWorkout = () => {
    router.push('/workout/setup?from=todaysWorkout');
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[color:var(--ds-accent-purple)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--ds-bg-primary)]">
      <div className="max-w-md mx-auto px-4 py-6 pb-28 space-y-6">
        {/* Header / Top Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[color:var(--ds-text-primary)]">GRND</h1>
            <p className="text-[color:var(--ds-text-secondary)] text-sm">Hi, {userProfile?.name?.split(' ')[0] || user.email?.split('@')[0] || 'Athlete'} 👋</p>
          </div>
          <Badge className="rounded-full bg-[var(--ds-surface-elevated)] text-[color:var(--ds-text-secondary)] px-3 py-1 text-xs border border-[color:var(--ds-border)]">Dashboard</Badge>
        </div>

        {/* Today's Workout Card */}
        <Card className="rounded-2xl overflow-hidden p-0">
          <CardContent className="p-0">
            <div className="p-5" style={{ backgroundImage: 'linear-gradient(135deg, var(--ds-gradient-purple-from), var(--ds-gradient-purple-to))' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white/80 text-xs flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                  <h2 className="text-white text-xl font-semibold mt-2">{isTodayTrainingDay ? "Today's Workout" : "Rest Day"}</h2>
                </div>
                <div className="text-right">
                  <div className="bg-white/15 text-white text-[10px] px-2 py-1 rounded-full border border-white/20 inline-block">Week Progress</div>
                  <div className="mt-2 text-white font-semibold text-sm">{weekProgress.completed}/{weekProgress.total}</div>
                </div>
              </div>

              {/* Focus tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {(isTodayTrainingDay ? todayMuscleGroups : ['Recovery']).map((tag) => (
                  <span key={tag} className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-white/15 text-white border border-white/20">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Start button */}
              <Button onClick={startWorkout} className="w-full mt-4 bg-white text-indigo-700 hover:bg-white/90 font-semibold py-6 rounded-xl shadow-md">
                <Play className="w-5 h-5 mr-2" /> Start Workout
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[color:var(--ds-text-primary)]">Recent Activity</h3>
            {lastWorkoutInfo && (
              <span className="text-xs text-[color:var(--ds-text-secondary)]">Last: {lastWorkoutInfo.day}</span>
            )}
          </div>

          <div className="space-y-3">
            {(recentWorkouts.length > 0 ? recentWorkouts : [null, null]).slice(0, 2).map((workout, idx) => {
              if (!workout) {
                return (
                  <Card key={`placeholder-${idx}`} className="rounded-xl border border-[color:var(--ds-border)] bg-[var(--ds-surface)]">
                    <CardContent className="p-4">
                      <div className="h-4 w-24 bg-[var(--ds-bg-tertiary)] rounded mb-2" />
                      <div className="h-3 w-40 bg-[var(--ds-bg-secondary)] rounded" />
                    </CardContent>
                  </Card>
                );
              }
              const info = formatWorkoutDate(workout);
              return (
                <Card key={workout._id} className="rounded-xl border border-[color:var(--ds-border)] bg-[var(--ds-surface)]">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-green-100">
                          <Dumbbell className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[color:var(--ds-text-primary)]">{info?.day}</p>
                          <p className="text-xs text-[color:var(--ds-text-secondary)]">{info?.focus}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {workout?.totalVolume && (
                          <span className="text-xs text-[color:var(--ds-text-secondary)] flex items-center gap-1"><Weight className="w-3.5 h-3.5" /> {workout.totalVolume.toLocaleString()} lbs</span>
                        )}
                        {workout?.duration && (
                          <span className="text-xs text-[color:var(--ds-text-secondary)] flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDuration(workout.duration)}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Workout History (Horizontal scroll) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[color:var(--ds-text-primary)]">Workout History</h3>
            <Link href="/progress" className="text-xs font-medium text-[color:var(--ds-accent-purple)]">View all</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {(workouts || []).slice(0, 8).map((w: any) => {
              const d = new Date(w.date);
              const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              return (
                <div key={w._id} className="min-w-[140px] rounded-xl border border-[color:var(--ds-border)] bg-[var(--ds-surface)] p-4 flex-shrink-0">
                  <p className="text-xs text-[color:var(--ds-text-secondary)] mb-1">{label}</p>
                  <p className="text-sm font-medium text-[color:var(--ds-text-primary)] truncate">{(w.muscleGroups || []).map((g: any) => g.name).join(' • ') || '—'}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-[color:var(--ds-text-secondary)]">
                    <span className="flex items-center gap-1"><Weight className="w-3.5 h-3.5" /> {w.totalVolume ? w.totalVolume.toLocaleString() : 0}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDuration(w.duration)}</span>
                  </div>
                </div>
              );
            })}
            {(!workouts || workouts.length === 0) && (
              <>
                {[1,2,3].map(i => (
                  <div key={i} className="min-w-[140px] rounded-xl border border-[color:var(--ds-border)] bg-[var(--ds-surface)] p-4 flex-shrink-0">
                    <div className="h-3 w-16 bg-[var(--ds-bg-tertiary)] rounded mb-2" />
                    <div className="h-4 w-24 bg-[var(--ds-bg-secondary)] rounded" />
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-3 w-10 bg-[var(--ds-bg-secondary)] rounded" />
                      <div className="h-3 w-10 bg-[var(--ds-bg-secondary)] rounded" />
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}