import React from "react";

export const VisualizerGraph = ({ graphDisplay }) => {
  return (
    <div className="flex justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6">{graphDisplay}</div>
    </div>
  );
};

export default VisualizerGraph;
