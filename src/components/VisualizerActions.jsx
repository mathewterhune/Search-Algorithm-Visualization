import React from 'react'
import { Play, Pause, Square, RotateCcw, Zap, Settings } from 'lucide-react';

export const VisualizerActions = ({runAlgorithm, isRunning, isPaused, pauseAlgorithm, stopAlgorithm, clearPath, resetGrid, generateMaze}) => {
  return (    
          <div className="flex flex-wrap gap-4 mt-6 justify-center">
            <button
              onClick={runAlgorithm}
              disabled={isRunning && !isPaused}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
            >
              <Play size={16} />
              {isRunning ? 'Running...' : 'Start'}
            </button>

            <button
              onClick={pauseAlgorithm}
              disabled={!isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 disabled:opacity-50"
            >
              <Pause size={16} />
              {isPaused ? 'Resume' : 'Pause'}
            </button>

            <button
              onClick={stopAlgorithm}
              disabled={!isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
            >
              <Square size={16} />
              Stop
            </button>

            <button
              onClick={clearPath}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              <RotateCcw size={16} />
              Clear Path
            </button>

            <button
              onClick={resetGrid}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
            >
              <Settings size={16} />
              Reset Grid
            </button>

            <button
              onClick={generateMaze}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:opacity-50"
            >
              <Zap size={16} />
              Generate Maze
            </button>
          </div>
  )
}

export default VisualizerActions
