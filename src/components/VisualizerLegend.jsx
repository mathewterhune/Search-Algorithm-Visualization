import React from 'react';

export const VisualizerLegend = () => (
  <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
    <h3 className="text-lg font-semibold mb-3">Legend</h3>
    <div className="flex flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-green-500 border"></div><span className="text-sm">Start</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-red-500 border"></div><span className="text-sm">End</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-gray-800 border"></div><span className="text-sm">Wall</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-blue-200 border"></div><span className="text-sm">Visited</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 bg-yellow-400 border"></div><span className="text-sm">Path</span>
      </div>
    </div>
  </div>
);

export default VisualizerLegend;
