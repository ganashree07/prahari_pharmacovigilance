import { useState, useEffect, useCallback, useRef } from 'react';

export interface ExerciseBlock {
  id: string;
  name: string;
  duration: number; // in seconds
}

export interface WorkoutConfig {
  blocks: ExerciseBlock[];
  restDuration: number; // in seconds
  restFrequency: number; // every N blocks
  totalRounds: number;
}

export type TimerPhase = 'exercise' | 'rest';

export interface TimerState {
  isRunning: boolean;
  currentRound: number;
  currentBlockIndex: number;
  currentPhase: TimerPhase;
  secondsRemaining: number;
  isWorkoutComplete: boolean;
}

export const useWorkoutTimer = (config: WorkoutConfig) => {
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    currentRound: 1,
    currentBlockIndex: 0,
    currentPhase: 'exercise',
    secondsRemaining: config.blocks[0]?.duration || 0,
    isWorkoutComplete: false,
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onBeepRef = useRef<(() => void) | null>(null);

  // Calculate total blocks including rests
  const getTotalBlocks = useCallback(() => {
    const blocksPerRound = config.blocks.length;
    const restsPerRound = Math.floor(blocksPerRound / config.restFrequency);
    return (blocksPerRound + restsPerRound) * config.totalRounds;
  }, [config]);

  // Get current block info
  const getCurrentBlockInfo = useCallback(() => {
    const blocksPerRound = config.blocks.length;
    const restsPerRound = Math.floor(blocksPerRound / config.restFrequency);
    const totalBlocksPerRound = blocksPerRound + restsPerRound;

    let blockCount = 0;
    for (let r = 0; r < timerState.currentRound - 1; r++) {
      blockCount += totalBlocksPerRound;
    }
    blockCount += timerState.currentBlockIndex + 1;

    return {
      blockNumber: timerState.currentBlockIndex + 1,
      totalBlocksInRound: blocksPerRound,
      round: timerState.currentRound,
      totalRounds: config.totalRounds,
      currentExercise:
        timerState.currentPhase === 'exercise'
          ? config.blocks[timerState.currentBlockIndex]?.name || 'Unknown'
          : 'Rest',
      totalBlocks: getTotalBlocks(),
      currentBlock: blockCount,
    };
  }, [timerState, config, getTotalBlocks]);

  // Register beep callback
  const setOnBeep = useCallback((callback: () => void) => {
    onBeepRef.current = callback;
  }, []);

  // Transition to next phase or block
  const transitionToNextPhase = useCallback(() => {
    setTimerState((prev) => {
      const blocksPerRound = config.blocks.length;
      const shouldRest =
        (prev.currentBlockIndex + 1) % config.restFrequency === 0 &&
        prev.currentBlockIndex < blocksPerRound - 1;

      if (prev.currentPhase === 'exercise' && shouldRest) {
        // Transition to rest
        return {
          ...prev,
          currentPhase: 'rest',
          secondsRemaining: config.restDuration,
        };
      } else {
        // Move to next exercise or next round
        let nextBlockIndex = prev.currentBlockIndex + 1;
        let nextRound = prev.currentRound;

        if (nextBlockIndex >= blocksPerRound) {
          nextBlockIndex = 0;
          nextRound = prev.currentRound + 1;
        }

        if (nextRound > config.totalRounds) {
          return {
            ...prev,
            isRunning: false,
            isWorkoutComplete: true,
          };
        }

        return {
          ...prev,
          currentBlockIndex: nextBlockIndex,
          currentRound: nextRound,
          currentPhase: 'exercise',
          secondsRemaining: config.blocks[nextBlockIndex]?.duration || 0,
        };
      }
    });

    // Trigger beep
    onBeepRef.current?.();
  }, [config]);

  // Main timer tick
  useEffect(() => {
    if (!timerState.isRunning || timerState.isWorkoutComplete) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimerState((prev) => {
        const newTime = prev.secondsRemaining - 1;
        if (newTime < 0) {
          // Clamp to 0
          return { ...prev, secondsRemaining: 0 };
        }
        return {
          ...prev,
          secondsRemaining: newTime,
        };
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState.isRunning, timerState.isWorkoutComplete]);

  // Handle transition when time runs out
  useEffect(() => {
    if (
      timerState.isRunning &&
      timerState.secondsRemaining === 0 &&
      !timerState.isWorkoutComplete
    ) {
      transitionToNextPhase();
    }
  }, [timerState.secondsRemaining, timerState.isRunning, timerState.isWorkoutComplete, transitionToNextPhase]);

  const start = useCallback(() => {
    setTimerState((prev) => ({ ...prev, isRunning: true }));
  }, []);

  const pause = useCallback(() => {
    setTimerState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const restart = useCallback(() => {
    setTimerState({
      isRunning: false,
      currentRound: 1,
      currentBlockIndex: 0,
      currentPhase: 'exercise',
      secondsRemaining: config.blocks[0]?.duration || 0,
      isWorkoutComplete: false,
    });
  }, [config]);

  const getProgressPercentage = useCallback(() => {
    const totalBlocks = getTotalBlocks();
    const blocksPerRound = config.blocks.length;
    const restsPerRound = Math.floor(blocksPerRound / config.restFrequency);
    const totalBlocksPerRound = blocksPerRound + restsPerRound;

    let completedBlocks =
      (timerState.currentRound - 1) * totalBlocksPerRound +
      timerState.currentBlockIndex;

    return (completedBlocks / totalBlocks) * 100;
  }, [timerState, config, getTotalBlocks]);

  return {
    timerState,
    start,
    pause,
    restart,
    setOnBeep,
    getCurrentBlockInfo,
    getProgressPercentage,
  };
};
