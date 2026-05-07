'use client';

import React, { useMemo } from 'react';

interface CircularTimerProps {
  secondsRemaining: number;
  totalSeconds: number;
  phase: 'exercise' | 'rest';
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  secondsRemaining,
  totalSeconds,
  phase,
}) => {
  const progress = (secondsRemaining / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 90; // radius = 90
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const isWarning = secondsRemaining <= 5 && phase === 'exercise';

  // Color based on phase and warning state
  const getColor = useMemo(() => {
    if (isWarning) return '#ef4444'; // red
    return phase === 'exercise' ? '#10b981' : '#3b82f6'; // green or blue
  }, [phase, isWarning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative w-64 h-64 mx-auto">
      <svg
        width="256"
        height="256"
        viewBox="0 0 256 256"
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx="128"
          cy="128"
          r="90"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="8"
        />

        {/* Progress circle with smooth animation */}
        <circle
          cx="128"
          cy="128"
          r="90"
          fill="none"
          stroke={getColor}
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-linear"
        />

        {/* Glow effect during warning */}
        {isWarning && (
          <circle
            cx="128"
            cy="128"
            r="90"
            fill="none"
            stroke={getColor}
            strokeWidth="8"
            opacity="0.3"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Time display in center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div
            className={`text-7xl font-black font-mono transition-colors duration-300 ${
              isWarning ? 'text-red-500' : getColor === '#10b981' ? 'text-green-500' : 'text-blue-500'
            }`}
          >
            {formatTime(secondsRemaining)}
          </div>
        </div>
      </div>
    </div>
  );
};
