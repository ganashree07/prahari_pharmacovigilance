'use client';

import React, { useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { CircularTimer } from './circular-timer';
import { playBeep, playWarningBeep } from '@/lib/audio';
import { TimerState } from '@/hooks/use-workout-timer';

interface TimerDisplayProps {
  timerState: TimerState;
  blockInfo: {
    blockNumber: number;
    totalBlocksInRound: number;
    round: number;
    totalRounds: number;
    currentExercise: string;
    totalBlocks: number;
    currentBlock: number;
  };
  totalDuration: number;
  onStart: () => void;
  onPause: () => void;
  onRestart: () => void;
  progressPercentage: number;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timerState,
  blockInfo,
  totalDuration,
  onStart,
  onPause,
  onRestart,
  progressPercentage,
}) => {
  // Play warning beep when entering final 5 seconds of exercise
  useEffect(() => {
    if (
      timerState.currentPhase === 'exercise' &&
      timerState.secondsRemaining === 5 &&
      timerState.isRunning
    ) {
      playWarningBeep();
    }
  }, [timerState.secondsRemaining, timerState.currentPhase, timerState.isRunning]);

  const isWarning =
    timerState.secondsRemaining <= 5 &&
    timerState.currentPhase === 'exercise';

  // Determine background color and styling
  const getBackgroundStyle = useCallback(() => {
    if (isWarning) {
      return 'from-red-950 to-black';
    }
    return timerState.currentPhase === 'exercise'
      ? 'from-green-950 to-black'
      : 'from-blue-950 to-black';
  }, [timerState.currentPhase, isWarning]);

  const getAccentColor = useCallback(() => {
    if (isWarning) return 'text-red-500';
    return timerState.currentPhase === 'exercise'
      ? 'text-green-500'
      : 'text-blue-500';
  }, [timerState.currentPhase, isWarning]);

  return (
    <div
      className={`min-h-screen bg-gradient-to-b ${getBackgroundStyle()} transition-all duration-1000 flex flex-col overflow-hidden`}
    >
      {/* Top info bar */}
      <div className="px-6 py-4 border-b border-gray-700">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-400 text-sm font-semibold">
            Block {blockInfo.blockNumber} of {blockInfo.totalBlocksInRound} ·
            Round {blockInfo.round} of {blockInfo.totalRounds}
          </p>
          {/* Progress bar */}
          <div className="mt-3 h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                timerState.currentPhase === 'exercise'
                  ? 'bg-green-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Exercise name */}
        <div className="mb-8 text-center">
          <p className={`text-sm font-semibold text-gray-400 mb-2`}>
            {timerState.currentPhase === 'rest' ? 'RECOVERY TIME' : 'CURRENT EXERCISE'}
          </p>
          <h1
            className={`text-5xl md:text-7xl font-black transition-all duration-300 ${getAccentColor()}`}
          >
            {blockInfo.currentExercise}
          </h1>
        </div>

        {/* Circular timer */}
        <div className="mb-12 animate-fade-in">
          <CircularTimer
            secondsRemaining={timerState.secondsRemaining}
            totalSeconds={totalDuration}
            phase={timerState.currentPhase}
          />
        </div>

        {/* Controls */}
        <div className="flex gap-4 justify-center w-full max-w-sm">
          {!timerState.isRunning ? (
            <Button
              onClick={onStart}
              className="flex-1 bg-green-500 hover:bg-green-600 text-black font-bold py-6 text-lg rounded-lg"
            >
              Start
            </Button>
          ) : (
            <Button
              onClick={onPause}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-6 text-lg rounded-lg"
            >
              Pause
            </Button>
          )}
          <Button
            onClick={onRestart}
            variant="outline"
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-900 font-bold py-6 text-lg rounded-lg"
          >
            Restart
          </Button>
        </div>
      </div>

      {/* Bottom stats */}
      <div className="px-6 py-6 border-t border-gray-700">
        <div className="max-w-4xl mx-auto flex justify-between text-xs text-gray-500 font-semibold">
          <span>Workout Progress: {Math.round(progressPercentage)}%</span>
          <span>
            {blockInfo.currentBlock} / {blockInfo.totalBlocks} blocks
          </span>
        </div>
      </div>
    </div>
  );
};
