'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExerciseBlock } from '@/hooks/use-workout-timer';
import { Trash2, Plus } from 'lucide-react';

interface WorkoutSetupProps {
  onStart: (config: {
    blocks: ExerciseBlock[];
    restDuration: number;
    restFrequency: number;
    totalRounds: number;
  }) => void;
}

export const WorkoutSetup: React.FC<WorkoutSetupProps> = ({ onStart }) => {
  const [blocks, setBlocks] = useState<ExerciseBlock[]>([
    { id: '1', name: 'Push-ups', duration: 30 },
    { id: '2', name: 'Squats', duration: 30 },
  ]);
  const [restDuration, setRestDuration] = useState(10);
  const [restFrequency, setRestFrequency] = useState(2);
  const [totalRounds, setTotalRounds] = useState(3);

  const addBlock = () => {
    const newBlock: ExerciseBlock = {
      id: Date.now().toString(),
      name: `Exercise ${blocks.length + 1}`,
      duration: 30,
    };
    setBlocks([...blocks, newBlock]);
  };

  const removeBlock = (id: string) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter((b) => b.id !== id));
    }
  };

  const updateBlock = (
    id: string,
    field: 'name' | 'duration',
    value: string | number
  ) => {
    setBlocks(
      blocks.map((b) =>
        b.id === id ? { ...b, [field]: value } : b
      )
    );
  };

  const handleStart = () => {
    if (blocks.length === 0) {
      alert('Please add at least one exercise block');
      return;
    }
    onStart({
      blocks,
      restDuration,
      restFrequency,
      totalRounds,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black p-6 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-white mb-2">RepClock</h1>
          <p className="text-gray-400 text-lg">Set up your workout circuit</p>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto space-y-8 pb-8">
          {/* Exercise Blocks Section */}
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Exercise Blocks</h2>
            <div className="space-y-3">
              {blocks.map((block, idx) => (
                <div key={block.id} className="flex gap-3 items-end">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-400 mb-2">
                      Exercise {idx + 1} Name
                    </label>
                    <Input
                      type="text"
                      value={block.name}
                      onChange={(e) =>
                        updateBlock(block.id, 'name', e.target.value)
                      }
                      className="bg-gray-900 border-gray-700 text-white"
                      placeholder="e.g., Push-ups"
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs font-semibold text-gray-400 mb-2">
                      Seconds
                    </label>
                    <Input
                      type="number"
                      min="5"
                      max="300"
                      value={block.duration}
                      onChange={(e) =>
                        updateBlock(block.id, 'duration', e.target.value ? parseInt(e.target.value) : 0)
                      }
                      className="bg-gray-900 border-gray-700 text-white"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBlock(block.id)}
                    disabled={blocks.length === 1}
                    className="text-red-500 hover:text-red-400 hover:bg-red-950 mb-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              onClick={addBlock}
              variant="outline"
              className="w-full mt-4 border-gray-700 text-green-400 hover:bg-green-950 hover:text-green-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Exercise
            </Button>
          </section>

          {/* Rest Settings Section */}
          <section className="border-t border-gray-700 pt-8">
            <h2 className="text-xl font-bold text-white mb-4">Rest Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Rest Duration (seconds)
                </label>
                <Input
                  type="number"
                  min="5"
                  max="120"
                  value={restDuration}
                  onChange={(e) => setRestDuration(e.target.value ? parseInt(e.target.value) : 0)}
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-400 mb-2">
                  Rest Every (every N exercises)
                </label>
                <Input
                  type="number"
                  min="1"
                  max={blocks.length}
                  value={restFrequency}
                  onChange={(e) => setRestFrequency(e.target.value ? parseInt(e.target.value) : 1)}
                  className="bg-gray-900 border-gray-700 text-white"
                />
              </div>
            </div>
          </section>

          {/* Rounds Section */}
          <section className="border-t border-gray-700 pt-8">
            <h2 className="text-xl font-bold text-white mb-4">Workout Rounds</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-400 mb-2">
                Total Rounds
              </label>
              <Input
                type="number"
                min="1"
                max="20"
                value={totalRounds}
                onChange={(e) => setTotalRounds(e.target.value ? parseInt(e.target.value) : 1)}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
          </section>

          {/* Summary */}
          <section className="border-t border-gray-700 pt-8">
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-gray-400 text-sm">
                <span className="font-semibold text-white">Workout Summary:</span>
                <br />
                {blocks.length} exercises × {totalRounds} rounds
                <br />
                Total time: ~{calculateTotalTime(blocks, restDuration, restFrequency, totalRounds)} minutes
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer Button */}
      <Button
        onClick={handleStart}
        className="w-full bg-green-500 hover:bg-green-600 text-black font-bold text-lg py-6 rounded-lg"
      >
        Start Workout
      </Button>
    </div>
  );
};

function calculateTotalTime(
  blocks: ExerciseBlock[],
  restDuration: number,
  restFrequency: number,
  totalRounds: number
): number {
  const exerciseTime = blocks.reduce((sum, b) => sum + b.duration, 0);
  const rests = Math.floor(blocks.length / restFrequency);
  const restTime = rests * restDuration;
  const totalPerRound = exerciseTime + restTime;
  return Math.round((totalPerRound * totalRounds) / 60);
}
