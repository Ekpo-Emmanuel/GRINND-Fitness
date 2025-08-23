'use client';

import { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

import { Workout } from '@/types/workout';

interface CalendarViewProps {
  workouts: Workout[];
}

export default function CalendarView({ workouts }: CalendarViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const hasWorkout = (date: Date | undefined): boolean => {
    if (!date) return false;
    
    const dateToCheck = date.toISOString().split('T')[0];
    return workouts.some(workout => {
      const workoutDate = new Date(workout.date).toISOString().split('T')[0];
      return workoutDate === dateToCheck;
    });
  };
  
  const getWorkoutsForDate = (date: Date | undefined) => {
    if (!date) return [];
    
    const dateToCheck = date.toISOString().split('T')[0];
    return workouts.filter(workout => {
      const workoutDate = new Date(workout.date).toISOString().split('T')[0];
      return workoutDate === dateToCheck;
    });
  };
  
  const selectedDateWorkouts = getWorkoutsForDate(date);
  
  return (
    <div className="w-full">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-xl border border-[color:var(--ds-border)] w-full bg-[var(--ds-surface)] text-[color:var(--ds-text-primary)]"
        modifiers={{
          workout: (date) => hasWorkout(date),
          selected: (d) => !!d,
          today: (d) => {
            const t = new Date();
            return d?.toDateString() === t.toDateString();
          }
        }}
        modifiersClassNames={{
          workout: "rounded font-medium text-[var(--ds-bg-primary)]",
          selected: "rounded font-semibold ring-2 ring-offset-2 ring-[var(--ds-accent-purple)]",
          today: "rounded font-medium",
        }}
      />
      
      {selectedDateWorkouts.length > 0 && (
        <div className="mt-4">
          <h3 className="text-md font-medium mb-2 text-[color:var(--ds-text-primary)]">
            Workouts on {date ? format(date, 'MMMM d, yyyy') : ''}
          </h3>
          <div className="space-y-2">
            {selectedDateWorkouts.map((workout) => (
              <div key={workout._id} className="p-2 border rounded-md bg-[var(--ds-surface)] border-[color:var(--ds-border)]">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-sm text-[color:var(--ds-text-secondary)]">{workout.name}</span>
                  {/* <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                    Completed
                  </Badge> */}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex justify-center space-x-4 mt-4 text-xs text-[color:var(--ds-text-secondary)]">
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full mr-1" style={{ backgroundImage: 'linear-gradient(135deg, var(--ds-gradient-purple-from), var(--ds-gradient-purple-to))' }}></div>
          <span>Today</span>
        </div>
        <div className="flex items-center">
          <div className="h-3 w-3 rounded-full bg-green-500 mr-1"></div>
          <span>Workout</span>
        </div>
      </div>
    </div>
  );
} 