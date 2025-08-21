import { Button } from '@/components/ui/button';
import { Id } from '@/convex/_generated/dataModel';
import { Play } from 'lucide-react';

interface StartWorkoutButtonProps {
  templateId: Id<'workoutTemplates'> | null;
  isStartingWorkout: boolean;
  handleStartWorkout: (templateId: Id<'workoutTemplates'>) => void;
  inModal?: boolean;
}

export default function StartWorkoutButton({ 
  templateId, 
  isStartingWorkout, 
  handleStartWorkout,
  inModal = false
}: StartWorkoutButtonProps) {
  if (!templateId) {
    return null;
  }
  
  if (inModal) {
    return (
      <Button
        onClick={() => handleStartWorkout(templateId)}
        disabled={isStartingWorkout}
        variant="primary"
        size="lg"
        className="w-full"
      >
        {isStartingWorkout ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
            Starting...
          </>
        ) : (
          <>
            <Play className="h-5 w-5" />
            Start Workout
          </>
        )}
      </Button>
    );
  }
  
  return (
    <div className="fixed bottom-18 left-0 right-0 bg-[var(--ds-bg-primary)] border-t border-[color:var(--ds-border)] px-4 py-6 z-20 backdrop-blur-sm">
      <div className="max-w-md mx-auto">
        <Button
          onClick={() => handleStartWorkout(templateId)}
          disabled={isStartingWorkout}
          variant="primary"
          size="xl"
          className="w-full"
        >
          {isStartingWorkout ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
              Starting...
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-3" />
              Start Workout
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 