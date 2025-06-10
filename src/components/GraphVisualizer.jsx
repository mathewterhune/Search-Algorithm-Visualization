import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Play, Pause, Square, RotateCcw, Zap, Settings } from 'lucide-react';
import { GraphManager } from '../logic/GraphManager';
import { AlgorithmEngine } from '../logic/algorithmEngine';
import { NODE_TYPES, ALGORITHMS } from '../logic/constants';
import { DRAW_MODES } from '../logic/drawModes';
import Node from './Node';

import { VisualizerHeader } from './VisualizerHeader';
// import { VisualizerControls } from './VisualizerControls';

const GraphVisualizer = () => {
  // Core state
  const [dimensions, setDimensions] = useState({ rows: 25, cols: 40 });             // Defines the graph size
  const [gridManager, setGridManager] = useState(() => new GraphManager(25, 40));   // manages local grid state 
  const [visualGrid, setVisualGrid] = useState(() => gridManager.graph.slice());    // shallow copy that is used to trigger react re-renders
  const [startPos, setStartPos] = useState([2, 2]); 
  const [endPos, setEndPos] = useState([22, 37]);
  
  // Algorithm state
  const [algorithm, setAlgorithm] = useState(ALGORITHMS.BFS);
  const [isRunning, setIsRunning] = useState(false);                                
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(50);
  
  // Interaction state
  const [drawMode, setDrawMode] = useState(DRAW_MODES.WALL);          // What tool is active
  const [isMouseDown, setIsMouseDown] = useState(false);              // Whether the mouse is being pressed down to draw on the grid
  
  // Refs
  const engineRef = useRef(null);                                     // Holds the current algorithm engine instance, used to control the execution


  useEffect(() => {
    // Ensures that the visual grid updates when the start, end, or GraphManager changes
    const newGrid = gridManager.clone();
    newGrid.setNode(startPos[0], startPos[1], NODE_TYPES.START);
    newGrid.setNode(endPos[0], endPos[1], NODE_TYPES.END);
    setVisualGrid(newGrid.graph.slice());
  }, [gridManager, startPos, endPos]); // Dependencies indicate when to re-run this effect.

  const handleAlgorithmUpdate = useCallback((updates) => {
    // useCallback hook is used to memoize callback functions, it returns the same function instance between renders
    
    // This function is called by AlgorithmEngine when a cell is visited or updated during execution
    setVisualGrid(prev => {
      const newGrid = prev.slice();
      for (const [row, col, type] of updates) {
        const index = row * dimensions.cols + col;
        if (newGrid[index] !== NODE_TYPES.START && newGrid[index] !== NODE_TYPES.END) newGrid[index] = type; // Update the cell type
      }

      // Return the updated graph, triggering a re-render
      return newGrid;
    });
  }, [dimensions.cols]); // -------------> look into this 


  const handleAlgorithmComplete = useCallback((path) => {
    // useCallback hook is used to memoize callback functions, it returns the same function instance between renders
    
    setIsRunning(false);
    setIsPaused(false);
    
    // When algorithm finds a path, animate the path on the graph
    if (path) {
      // Animate path
      path.forEach((pos, index) => {
        // Use setTimeout to create a delay for each cell in the path
        setTimeout(() => {
          setVisualGrid(prev => {
            const newGrid = prev.slice();
            const gridIndex = pos[0] * dimensions.cols + pos[1];
            
            // Make sure that you dont overwrite the start and end nodes.
            if (newGrid[gridIndex] !== NODE_TYPES.START && newGrid[gridIndex] !== NODE_TYPES.END) newGrid[gridIndex] = NODE_TYPES.PATH;
            
            // Return the updated graph, triggering a re-render
            return newGrid;
          });
        }, index * 30);
      });
    }
  }, [dimensions.cols]);

  
  const runAlgorithm = useCallback(async () => {
  // useCallback hook is used to memoize callback functions, it returns the same function instance between renders
    if (isRunning) return;
      
      // Prepare graph for algorithm: Clean previous graph, set the start and end nodes
      const cleanGrid = gridManager.clone();
      cleanGrid.setNode(startPos[0], startPos[1], NODE_TYPES.START);
      cleanGrid.setNode(endPos[0], endPos[1], NODE_TYPES.END);
      setVisualGrid(cleanGrid.graph.slice());   
      setIsRunning(true);

      // new algorithm engine instance is created using current gridManager
      const engine = new AlgorithmEngine(gridManager,handleAlgorithmUpdate,handleAlgorithmComplete,(error) => console.error('Algorithm error:', error) );
      engine.speed = speed;
      engine.isRunning = true;
      engineRef.current = engine;
      // Update these as functions in AlgorithmEngine
      
      try {
          await engine.runAlgorithm(algorithm, startPos, endPos);
          } 
          catch (error) {
              console.error('Algorithm error:', error);
              setIsRunning(false);
              }
  }, [algorithm, startPos, endPos, gridManager, speed, isRunning, handleAlgorithmUpdate, handleAlgorithmComplete]);



  // Control functions
  const stopAlgorithm = useCallback(() => {
    if (engineRef.current) engineRef.current.stop();
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  // Pause/Resume the aglorithm
  const pauseAlgorithm = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.pause();
      setIsPaused(!isPaused);
    }
  }, [isPaused]);

  // Build a cleaned version of the grid with start, end, and walls
  const resetGrid = useCallback(() => {
    stopAlgorithm();
    const newGrid = new GraphManager(dimensions.rows, dimensions.cols);
    newGrid.setNode(startPos[0], startPos[1], NODE_TYPES.START);
    newGrid.setNode(endPos[0], endPos[1], NODE_TYPES.END);
    setGridManager(newGrid);
    setVisualGrid(newGrid.graph.slice());
  }, [dimensions, startPos, endPos, stopAlgorithm]);

  // Clear the path and visited cells, but keep start and end nodes intact
  const clearPath = useCallback(() => {
    stopAlgorithm();
    const cleanGrid = gridManager.clone();
    // Clear only visited and path cells
    for (let i = 0; i < gridManager.graph.length; i++) {
      if (gridManager.graph[i] > NODE_TYPES.END) cleanGrid.graph[i] = NODE_TYPES.EMPTY;
    }
    
    // Set start/end nodes back to positions
    cleanGrid.setNode(startPos[0], startPos[1], NODE_TYPES.START);
    cleanGrid.setNode(endPos[0], endPos[1], NODE_TYPES.END);
    setGridManager(cleanGrid);
    setVisualGrid(cleanGrid.graph.slice());
  }, [gridManager, startPos, endPos, stopAlgorithm]);

  // Handle cell interactions
  const handleCellClick = useCallback((row, col) => {
    if (isRunning) return;
    
    const currentType = gridManager.getNode(row, col);
    const newGrid = gridManager.clone();
    
    switch (drawMode) {
      case DRAW_MODES.WALL:
        if (currentType === NODE_TYPES.EMPTY) {
          newGrid.setNode(row, col, NODE_TYPES.WALL);
        } else if (currentType === NODE_TYPES.WALL && (row !== 0 && row !== dimensions.rows - 1 && col !== 0 && col !== dimensions.cols - 1)) {
          newGrid.setNode(row, col, NODE_TYPES.EMPTY);
        }
        break;
      case DRAW_MODES.START:
        if (currentType !== NODE_TYPES.WALL) {
          newGrid.setNode(startPos[0], startPos[1], NODE_TYPES.EMPTY);
          newGrid.setNode(row, col, NODE_TYPES.START);
          setStartPos([row, col]);
        }
        break;
      case DRAW_MODES.END:
        if (currentType !== NODE_TYPES.WALL) {
          newGrid.setNode(endPos[0], endPos[1], NODE_TYPES.EMPTY);
          newGrid.setNode(row, col, NODE_TYPES.END);
          setEndPos([row, col]);
        }
        break;
    }
    
    setGridManager(newGrid);
    setVisualGrid(newGrid.graph.slice());
  }, [drawMode, isRunning, gridManager, startPos, endPos, dimensions]);

  // Generate maze
  const generateMaze = useCallback(() => {
    if (isRunning) return;
    
    const newGrid = new GraphManager(dimensions.rows, dimensions.cols);
    
    // Simple random maze generation
    for (let r = 1; r < dimensions.rows - 1; r++) {
      for (let c = 1; c < dimensions.cols - 1; c++) {
        if (Math.random() < 0.3) {
          newGrid.setNode(r, c, NODE_TYPES.WALL);
        }
      }
    }
    
    newGrid.setNode(startPos[0], startPos[1], NODE_TYPES.START);
    newGrid.setNode(endPos[0], endPos[1], NODE_TYPES.END);
    
    setGridManager(newGrid);
    setVisualGrid(newGrid.graph.slice());
  }, [dimensions, startPos, endPos, isRunning]);

  // Memoized grid rendering
  const gridDisplay = useMemo(() => {
    // useMemo hook memoizes the graph, and only will re-render when the dependencies at the end change
    
    // Build the grid display based on the visualGrid
    const rows = [];
    for (let r = 0; r < dimensions.rows; r++) {
      const cells = [];
      for (let c = 0; c < dimensions.cols; c++) {
        const index = r * dimensions.cols + c;
        
        // Push a node component for each cell in the grid.
        cells.push(
          <Node
              key={`${r}-${c}`}
              type={visualGrid[index]}
              onClick={() => handleCellClick(r, c)}
              onMouseEnter={() => isMouseDown && handleCellClick(r, c)}
              onMouseDown={() => setIsMouseDown(true)}/>
        );
      }
      rows.push(<div key={r} className="flex">{cells}</div>);
    }
    return <div className="inline-block border-2 border-gray-400">{rows}</div>;
  }, [visualGrid, dimensions, handleCellClick, isMouseDown]); // Only re-render when these update

  // Global mouse up handler
  useEffect(() => {
    const handleMouseUp = () => setIsMouseDown(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <VisualizerHeader />


        {/* Controls */}
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

          {/* Action Buttons */}
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
        </div>

        {/* Legend */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 border"></div>
              <span className="text-sm">Start</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 border"></div>
              <span className="text-sm">End</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 border"></div>
              <span className="text-sm">Wall</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200 border"></div>
              <span className="text-sm">Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 border"></div>
              <span className="text-sm">Path</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="flex justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {gridDisplay}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphVisualizer;