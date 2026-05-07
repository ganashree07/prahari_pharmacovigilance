'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

interface CompletionScreenProps {
  onRestart: () => void;
  totalRounds: number;
  blockCount: number;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  onRestart,
  totalRounds,
  blockCount,
}) => {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Generate confetti on mount
  useEffect(() => {
    const newConfetti = Array.from({ length: 50 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
    }));
    setConfetti(newConfetti);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-950 via-black to-black flex flex-col items-center justify-center px-6 overflow-hidden relative">
      {/* Confetti animation */}
      {confetti.map((item) => (
        <div
          key={item.id}
          className="fixed w-2 h-2 animate-pulse pointer-events-none"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            backgroundColor: ['#10b981', '#3b82f6', '#ef4444', '#fbbf24'][
              Math.floor(Math.random() * 4)
            ],
            animation: `fall ${2 + Math.random() * 2}s linear forwards`,
          }}
        />
      ))}

      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>

      <div className="text-center max-w-md z-10">
        {/* Trophy icon */}
        <div className="mb-8 text-7xl animate-bounce">🏆</div>

        {/* Heading */}
        <h1 className="text-6xl font-black text-white mb-4">
          Workout
          <br />
          Complete!
        </h1>

        {/* Stats */}
        <div className="bg-gray-900 rounded-xl p-8 mb-8 border border-gray-700">
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Rounds</p>
              <p className="text-4xl font-black text-green-500">{totalRounds}</p>
            </div>
            <div className="border-t border-gray-700 pt-4">
              <p className="text-gray-400 text-sm mb-1">Exercises Completed</p>
              <p className="text-4xl font-black text-blue-500">
                {blockCount}
              </p>
            </div>
          </div>
        </div>

        {/* Motivational message */}
        <p className="text-gray-300 text-lg mb-8 font-semibold">
          Great effort! You&apos;ve crushed your workout. 💪
        </p>

        {/* Restart button */}
        <Button
          onClick={onRestart}
          className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-6 text-lg rounded-lg"
        >
          Start Another Workout
        </Button>
      </div>
    </div>
  );
};
