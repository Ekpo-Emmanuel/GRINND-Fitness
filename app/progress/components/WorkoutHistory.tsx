"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Clock, Dumbbell, Timer, Repeat, X, Calendar, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Pill } from "@/components/ui/pill";

interface Workout {
    _id: string;
    date: string;
    name: string;
    duration?: number;
    totalVolume?: number;
    cardio?: {
        id: string;
        name: string;
        distance?: string;
        duration?: string;
        pace?: string;
        calories?: string;
        completed: boolean;
    }[];
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

type SortOption = 'date-newest' | 'date-oldest' | 'volume-highest' | 'volume-lowest' | 'duration-longest' | 'duration-shortest';
type FilterOption = 'all' | string;

export default function WorkoutHistory({ workouts }: { workouts: Workout[] }) {
    const router = useRouter();
    const [sortBy, setSortBy] = useState<SortOption>('date-newest');
    const [filterMuscleGroup, setFilterMuscleGroup] = useState<FilterOption>('all');
    const [isFiltered, setIsFiltered] = useState(false);

    const resetFiltersAndSorts = () => {
        setSortBy('date-newest');
        setFilterMuscleGroup('all');
        setIsFiltered(false);
    };

    useMemo(() => {
        const isCurrentlyFiltered = 
            sortBy !== 'date-newest' || 
            filterMuscleGroup !== 'all';
        
        setIsFiltered(isCurrentlyFiltered);
    }, [sortBy, filterMuscleGroup]);

    const isEmpty = !workouts || workouts.length === 0;

    const allMuscleGroups = useMemo(() => {
        if (!workouts || workouts.length === 0) return [];
        
        const muscleGroupSet = new Set<string>();
        workouts.forEach(workout => {
            workout.muscleGroups?.forEach(group => {
                if (group.name) {
                    muscleGroupSet.add(group.name);
                }
            });
        });
        
        return Array.from(muscleGroupSet).sort();
    }, [workouts]);

    return (
        <div className="">
            {isEmpty ? (
                <>
                    <div className="text-center py-12 bg-[var(--ds-surface)] rounded-xl border border-[color:var(--ds-border)]">
                        <Dumbbell className="mx-auto text-[color:var(--ds-text-secondary)] w-12 h-12 mb-4" />
                        <h3 className="text-lg font-medium text-[color:var(--ds-text-primary)] mb-1">No workouts yet</h3>
                        <p className="text-sm text-[color:var(--ds-text-secondary)] mb-4">Start logging your workouts to track progress.</p>
                        <Button
                            onClick={() => router.push("/workout/setup")}
                            variant="outline"
                            className="text-[var(--ds-bg-primary)] transition"
                            style={{ backgroundImage: 'linear-gradient(135deg, var(--ds-gradient-purple-from), var(--ds-gradient-purple-to))' }}
                        >
                            Start Your First Workout
                        </Button>
                    </div>
                </>
            ) : (
                <WorkoutCardList 
                    workouts={workouts || []} 
                    sortBy={sortBy} 
                    filterMuscleGroup={filterMuscleGroup} 
                />
            )}
        </div>
    );
}

function WorkoutCardList({ 
    workouts, 
    sortBy, 
    filterMuscleGroup 
}: { 
    workouts: Workout[]; 
    sortBy: SortOption;
    filterMuscleGroup: FilterOption;
}) {
    const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
    
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const calculateTotalReps = (workout: Workout): number => {
        let reps = 0;
        workout.muscleGroups?.forEach((group) =>
            group.exercises.forEach((ex) =>
                ex.sets.forEach((s) => {
                    if (s.completed) {
                        reps += parseInt(s.reps) || 0;
                    }
                })
            )
        );
        return reps;
    };

    const getExercisesWithSets = (workout: Workout): { name: string; completedSets: number }[] => {
        const exerciseMap = new Map<string, number>();
        
        workout.muscleGroups?.forEach((group) => {
            group.exercises.forEach((exercise) => {
                if (!exercise.name) return;
                
                const completedSets = exercise.sets.filter(set => set.completed).length;
                
                if (exerciseMap.has(exercise.name)) {
                    exerciseMap.set(exercise.name, exerciseMap.get(exercise.name)! + completedSets);
                } else {
                    exerciseMap.set(exercise.name, completedSets);
                }
            });
        });
        
        return Array.from(exerciseMap.entries()).map(([name, completedSets]) => ({
            name,
            completedSets
        }));
    };

    const formatDuration = (seconds?: number): string => {
        if (!seconds) return "0m";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    };

    const calculate1RM = (weight: string, reps: string): number => {
        const weightNum = parseFloat(weight);
        const repsNum = parseInt(reps);
        
        if (isNaN(weightNum) || isNaN(repsNum) || repsNum <= 0 || repsNum >= 37) {
            return 0;
        }
        
        return Math.round(weightNum * (36 / (37 - repsNum)));
    };

    const getBestSets = (workout: Workout) => {
        const bestSets = new Map<string, { weight: string; reps: string; oneRM: number }>();
        
        workout.muscleGroups?.forEach(group => {
            group.exercises.forEach(exercise => {
                if (!exercise.name) return;
                
                let bestOneRM = 0;
                let bestSet = { weight: "0", reps: "0" };
                
                exercise.sets.forEach(set => {
                    if (set.completed && set.weight && set.reps) {
                        const oneRM = calculate1RM(set.weight, set.reps);
                        if (oneRM > bestOneRM) {
                            bestOneRM = oneRM;
                            bestSet = { weight: set.weight, reps: set.reps };
                        }
                    }
                });
                
                if (bestOneRM > 0) {
                    if (bestSets.has(exercise.name)) {
                        const existing = bestSets.get(exercise.name)!;
                        if (bestOneRM > existing.oneRM) {
                            bestSets.set(exercise.name, { ...bestSet, oneRM: bestOneRM });
                        }
                    } else {
                        bestSets.set(exercise.name, { ...bestSet, oneRM: bestOneRM });
                    }
                }
            });
        });
        
        return bestSets;
    };

    const workoutContainsMuscleGroup = (workout: Workout, muscleGroup: string): boolean => {
        if (muscleGroup === 'all') return true;
        
        return !!workout.muscleGroups?.some(group => 
            group.name.toLowerCase() === muscleGroup.toLowerCase()
        );
    };

    const filteredAndSortedWorkouts = useMemo(() => {
        const filtered = workouts.filter(workout => 
            workoutContainsMuscleGroup(workout, filterMuscleGroup)
        );
        
        return [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'date-newest':
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                case 'date-oldest':
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'volume-highest':
                    return (b.totalVolume || 0) - (a.totalVolume || 0);
                case 'volume-lowest':
                    return (a.totalVolume || 0) - (b.totalVolume || 0);
                case 'duration-longest':
                    return (b.duration || 0) - (a.duration || 0);
                case 'duration-shortest':
                    return (a.duration || 0) - (b.duration || 0);
                default:
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
            }
        });
    }, [workouts, sortBy, filterMuscleGroup]);

    return (
        <div className="space-y-4">
            {filteredAndSortedWorkouts.length === 0 ? (
                <div className="text-center py-8 bg-[var(--ds-surface)] rounded-xl border border-[color:var(--ds-border)]">
                    <p className="text-[color:var(--ds-text-secondary)]">No workouts match your filter criteria.</p>
                </div>
            ) : (
                filteredAndSortedWorkouts.map((workout) => {
                const totalReps = calculateTotalReps(workout);
                const exercisesWithSets = getExercisesWithSets(workout);
                const duration = formatDuration(workout.duration);

                return (
                    <div
                        key={workout._id}
                        className="rounded-xl bg-[var(--ds-surface)] border border-[color:var(--ds-border)] p-4 hover:shadow-md transition cursor-pointer"
                        onClick={() => setSelectedWorkout(workout)}
                    >
                        <div className="w-full">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-md font-semibold text-[color:var(--ds-text-primary)]">
                                        {workout.name || "Workout"}
                                    </h3>
                                </div>
                                <p className="text-xs text-[color:var(--ds-text-secondary)] opacity-75">{formatDate(workout.date)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 mt-3 text-sm text-[color:var(--ds-text-primary)]">
                            {(workout.cardio && workout.cardio.length > 0 && (!workout.muscleGroups || workout.muscleGroups.length === 0)) ? (
                                <div className="flex flex-wrap gap-2">
                                    {(workout.cardio && workout.cardio.length > 0 && (!workout.muscleGroups || workout.muscleGroups.length === 0)) && (
                                        <Pill variant="tertiary" size="sm" icon={<Activity />}>Cardio</Pill>
                                    )}
                                    <Pill variant="tertiary" size="sm" icon={<Timer />}>{duration}</Pill>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-1">
                                        <Dumbbell className="w-4 h-4 text-[color:var(--ds-text-secondary)]" />
                                        <span className="font-medium">{workout.totalVolume?.toLocaleString() || 0}</span>
                                        <span className="text-xs text-[color:var(--ds-text-secondary)] ml-0.5">lbs</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Repeat className="w-4 h-4 text-[color:var(--ds-text-secondary)]" />
                                        <span className="font-medium">{totalReps}</span>
                                        <span className="text-xs text-[color:var(--ds-text-secondary)] ml-0.5">reps</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4 text-[color:var(--ds-text-secondary)]" />
                                        <span className="font-medium">{duration}</span>
                                    </div>
                                </>
                            )}
                        </div>

                            {exercisesWithSets.length > 0 && (
                            <div className="mt-4">
                                <div className="flex flex-wrap gap-2">
                                        {exercisesWithSets.slice(0, 4).map((exercise, i) => (
                                        <Pill key={i} variant="tertiary" size="sm">
                                            {exercise.completedSets}x {exercise.name}
                                        </Pill>
                                        ))}
                                        {exercisesWithSets.length > 4 && (
                                        <Pill variant="accent" size="sm">+{exercisesWithSets.length - 4} more</Pill>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })
            )}

            {/* Detailed Workout Modal */}
            {selectedWorkout && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--ds-surface)] rounded-xl shadow-xl max-w-md w-full max-h-[90svh] overflow-y-auto border border-[color:var(--ds-border)]">
                        <div className="sticky top-0 bg-[var(--ds-surface)] px-4 py-3 border-b border-[color:var(--ds-border)] flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-[color:var(--ds-text-primary)]">{selectedWorkout.name || "Workout Details"}</h3>
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedWorkout(null);
                                }}
                                className="p-1 rounded-full hover:bg-[var(--ds-bg-tertiary)]"
                            >
                                <X className="w-5 h-5 text-[color:var(--ds-text-secondary)]" />
                            </button>
                        </div>
                        
                        <div className="p-4">
                            <div className="flex flex-col space-y-4">
                                {/* Workout Info */}
                                <div className="flex flex-wrap gap-3">
                                    <Pill
                                        variant="tertiary"
                                        size="sm"
                                        icon={<Calendar />}
                                    >
                                        {formatDate(selectedWorkout.date)}
                                    </Pill>
                                    <Pill
                                        variant="tertiary"
                                        size="sm"
                                        icon={<Clock />}
                                    >
                                        {formatTime(selectedWorkout.date)}
                                    </Pill>
                                    <Pill
                                        variant="tertiary"
                                        size="sm"
                                        icon={<Timer />}
                                    >
                                        {formatDuration(selectedWorkout.duration)}
                                    </Pill>
                                    {(selectedWorkout.cardio && selectedWorkout.cardio.length > 0 && (!selectedWorkout.muscleGroups || selectedWorkout.muscleGroups.length === 0)) && (
                                        <Pill variant="tertiary" size="sm" icon={<Activity />}>Cardio</Pill>
                                    )}
                                </div>
                                {/* Cardio-only details OR Strength details */}
                                {(selectedWorkout.cardio && selectedWorkout.cardio.length > 0 && (!selectedWorkout.muscleGroups || selectedWorkout.muscleGroups.length === 0)) ? (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <Pill variant="tertiary" size="sm" icon={<Activity />}>{selectedWorkout.cardio[0].name}</Pill>
                                        {selectedWorkout.cardio[0].duration && (
                                            <Pill variant="tertiary" size="sm" icon={<Timer />}>{selectedWorkout.cardio[0].duration}</Pill>
                                        )}
                                        {selectedWorkout.cardio[0].calories && (
                                            <Pill variant="tertiary" size="sm">{selectedWorkout.cardio[0].calories} kcal</Pill>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {/* Workout Stats */}
                                        <div className="grid grid-cols-2 gap-3 mt-2">
                                            <div className="p-3 rounded-xl bg-[var(--ds-bg-secondary)]">
                                                <p className="text-xs text-[color:var(--ds-text-secondary)] mb-1">Total Volume</p>
                                                <p className="text-xl font-bold text-[color:var(--ds-text-primary)]">{selectedWorkout.totalVolume?.toLocaleString() || 0} <span className="text-sm font-normal">lbs</span></p>
                                            </div>
                                            <div className="p-3 rounded-xl bg-[var(--ds-bg-secondary)]">
                                                <p className="text-xs text-[color:var(--ds-text-secondary)] mb-1">Total Reps</p>
                                                <p className="text-xl font-bold text-[color:var(--ds-text-primary)]">{calculateTotalReps(selectedWorkout)}</p>
                                            </div>
                                        </div>
                                        {/* Exercises */}
                                        <div className="mt-4">
                                            <h4 className="text-sm font-medium text-[color:var(--ds-text-primary)] mb-3">Exercise Details</h4>
                                            {selectedWorkout.muscleGroups?.map((group) => (
                                                <div key={group.id} className="mb-4">
                                                    <h5 className="text-sm font-medium text-[color:var(--ds-text-secondary)] mb-2">{group.name}</h5>
                                                    <div className="space-y-4">
                                                        {group.exercises.filter(e => e.name).map((exercise) => {
                                                            const bestSets = getBestSets(selectedWorkout);
                                                            const bestSet = bestSets.get(exercise.name);
                                                            const completedSets = exercise.sets.filter(set => set.completed);
                                                            if (completedSets.length === 0) return null;
                                                            return (
                                                                <div key={exercise.id} className="border border-[color:var(--ds-border)] rounded-xl p-3 bg-[var(--ds-bg-tertiary)] shadow-sm">
                                                                    <div className="flex justify-between items-center">
                                                                        <h6 className="font-medium text-[color:var(--ds-text-primary)]">{exercise.name}</h6>
                                                                        {bestSet && (
                                                                            <div className="px-2 py-1 rounded text-xs text-[var(--ds-bg-primary)]" style={{ backgroundImage: 'linear-gradient(135deg, var(--ds-gradient-yellow-from), var(--ds-gradient-yellow-to))' }}>
                                                                                e1RM: {bestSet.oneRM} lbs
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="mt-2">
                                                                        <div className="grid grid-cols-4 gap-1 text-xs font-medium text-[var(--ds-text-primary)]/80 mb-1">
                                                                            <div>SET</div>
                                                                            <div>WEIGHT</div>
                                                                            <div>REPS</div>
                                                                            <div>VOLUME</div>
                                                                        </div>
                                                                        {completedSets.map((set, idx) => {
                                                                            const weight = parseFloat(set.weight) || 0;
                                                                            const reps = parseInt(set.reps) || 0;
                                                                            const volume = weight * reps;
                                                                            return (
                                                                                <div key={set.id} className="grid grid-cols-4 gap-1 text-sm py-1 text-[color:var(--ds-text-primary)]/80 border-t border-[color:var(--ds-border)]/50">
                                                                                    <div>{idx + 1}</div>
                                                                                    <div>{set.weight} lbs</div>
                                                                                    <div>{set.reps}</div>
                                                                                    <div>{volume.toLocaleString()}</div>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
