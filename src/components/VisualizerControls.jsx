// VisualizerControls.jsx
import React from 'react';
import { ALGORITHMS, NODE_TYPES } from '../logic/constants';
import { DRAW_MODES } from '../logic/drawModes';

const VisualizerControls = ({ algorithm, setAlgorithm, speed, setSpeed, drawMode, setDrawMode, isRunning, engineRef }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Algorithm Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Algorithm
          </label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            disabled={isRunning}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={ALGORITHMS.BFS}>Breadth-First Search</option>
            <option value={ALGORITHMS.DFS}>Depth-First Search</option>
          </select>
        </div>

        {/* Speed Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Speed: {speed}ms
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={speed}
            onChange={(e) => {
              const newSpeed = parseInt(e.target.value);
              setSpeed(newSpeed);
              if (engineRef.current) {
                engineRef.current.setSpeed(newSpeed);
              }
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Draw Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Draw Mode
          </label>
          <div className="flex gap-2">
            {Object.entries(DRAW_MODES).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setDrawMode(value)}
                disabled={isRunning}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  drawMode === value
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {key.charAt(0) + key.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualizerControls;
