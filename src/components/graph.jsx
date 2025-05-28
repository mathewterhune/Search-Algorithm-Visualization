import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

// Components
import GridSquare from "./GridSquare";
import Debug from "./Debug";

// Custom Hooks
import { useGridState } from "../hooks/useGridState";

// Logic and utility functions
import { BFS, DFS } from "../logic/algorithms";
import { NODE_TYPES, ALGORITHM_CONTROL_STATES } from "../logic/nodeTypes";

const Graph = () => {
  // Use the custom grid state hook
  const {
    rows,
    cols,
    grid,
    startPos,
    endPos,
    adjacencyList,
    setRows,
    setCols,
    handleResize,
    resetGrid,
    setSourcePosition,
    setTargetPosition,
    removeSource,
    removeTarget,
    toggleWall,
    getCellValue,
    hasSourceAndTarget,
  } = useGridState();

  // Remaining state that's not grid-related
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [placementMode, setPlacementMode] = useState("source");
  const [algorithmState, setAlgorithmState] = useState(ALGORITHM_CONTROL_STATES.IDLE);
  const [algorithmType, setAlgorithmType] = useState('BFS');
  const [speed, setSpeed] = useState(30);

  const algorithmStateRef = useRef({
    queue: [],
    visited: new Set(),
    parent: {},
    stack: [],
    currentPath: null,
    pathIndex: 0,
    isAnimatingPath: false
  });

  const animationRef = useRef(null);
  const lastStepTime = useRef(0);

  // State visualization
  const [visitedCells, setVisitedCells] = useState(new Set());
  const [pathCells, setPathCells] = useState(new Set());
  const [isRunning, setIsRunning] = useState(false);
  
  // Hold current values of state variables to avoid triggering multiple re-renders
  const gridRef = useRef(grid);
  const visitedRef = useRef(visitedCells);
  const pathRef = useRef(pathCells);
  
  // Make it so the .current property of each ref is always reflecting the most recent state.
  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);
  
  useEffect(() => {
    visitedRef.current = visitedCells;
  }, [visitedCells]);
  
  useEffect(() => {
    pathRef.current = pathCells;
  }, [pathCells]);

  // Global mouse up listener
  useEffect(() => {
    const handleMouseUp = () => setIsMouseDown(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // Reset the visualization state
  const resetVisualization = useCallback(() => {
    setVisitedCells(new Set());
    setPathCells(new Set());
  }, []);

  // Enhanced resize handler that also resets visualization
  const handleGridResize = useCallback(() => {
    const success = handleResize();
    if (success) {
      resetVisualization();
    }
    return success;
  }, [handleResize, resetVisualization]);

  // Enhanced reset that also resets visualization
  const handleGridReset = useCallback(() => {
    resetGrid();
    resetVisualization();
  }, [resetGrid, resetVisualization]);

  /**
   * Updated toggleCell function using the new grid state methods
   */
  const toggleCell = useCallback((row, col) => {
    const currentCell = getCellValue(row, col);
    
    if (placementMode === "walls") {
      const success = toggleWall(row, col);
      if (success) {
        resetVisualization();
      }
    }
    else if (placementMode === "source") {
      if (currentCell === NODE_TYPES.SOURCE_NODE) {
        removeSource();
      } else {
        setSourcePosition(row, col);
      }
      resetVisualization();
    }
    else if (placementMode === "target") {
      if (currentCell === NODE_TYPES.TARGET_NODE) {
        removeTarget();
      } else {
        setTargetPosition(row, col);
      }
      resetVisualization();
    }
  }, [placementMode, getCellValue, toggleWall, setSourcePosition, setTargetPosition, removeSource, removeTarget, resetVisualization]);

  // Optimized visit handler - doesn't update grid state for every visit
  const handleVisit = useCallback((node) => {
    const [x, y] = node.split(",").map(Number);
    setVisitedCells(prev => {
      const newVisited = new Set(prev);
      newVisited.add(`${x},${y}`);
      return newVisited;
    });
  }, []);

  // Optimized path handler - uses a separate state instead of updating grid
  const handlePathCompletion = useCallback((path) => {
    if (!path) {
      setIsRunning(false);
      return;
    }

    // Animate path over time
    path.forEach((node, i) => {
      setTimeout(() => {
        setPathCells(prev => {
          const newPath = new Set(prev);
          newPath.add(node);
          return newPath;
        });
        
        // Mark when animation is complete
        if (i === path.length - 1) {
          setIsRunning(false);
        }
      }, i * 40);
    });
  }, []);

  // Run algorithm function - now uses the hasSourceAndTarget helper
  const runAlgorithm = useCallback(() => {
    if (!hasSourceAndTarget()) {
      alert("Please place both a source and a target node.");
      return;
    }

    // Reset visualization
    resetVisualization();
    setIsRunning(true);

    const startKey = `${startPos[0]},${startPos[1]}`;
    const endKey = `${endPos[0]},${endPos[1]}`;

    // Use the memoized adjacency list from the hook
    DFS(grid, adjacencyList, startKey, endKey, handleVisit, handlePathCompletion);
  }, [grid, adjacencyList, startPos, endPos, handleVisit, handlePathCompletion, resetVisualization, hasSourceAndTarget]);

  // Calculate cell status once - handles both base grid and visualization overlays
  const getCellStatus = useCallback((rowIndex, colIndex) => {
    const key = `${rowIndex},${colIndex}`;
    const baseValue = getCellValue(rowIndex, colIndex);
    
    // Path visualization takes precedence
    if (pathCells.has(key) && baseValue !== NODE_TYPES.SOURCE_NODE && baseValue !== NODE_TYPES.TARGET_NODE) {
      return NODE_TYPES.SOLUTION_PATH;
    }
    
    // Visited cells next
    if (visitedCells.has(key) && baseValue !== NODE_TYPES.SOURCE_NODE && baseValue !== NODE_TYPES.TARGET_NODE) {
      return NODE_TYPES.VISITED_NODE;
    }

    // Base grid value otherwise
    return baseValue;
  }, [getCellValue, visitedCells, pathCells]);

  // Memo-ize grid rendering to prevent unnecessary re-renders
  const gridDisplay = useMemo(() => (
    <table className="border-separate border-spacing-0.5 mx-auto">
      <tbody>
        {grid.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((_, colIndex) => {
              const cellStatus = getCellStatus(rowIndex, colIndex);
              return (
                <td key={colIndex}>
                  <GridSquare
                    value={cellStatus}
                    onMouseDown={() => {
                      setIsMouseDown(true);
                      toggleCell(rowIndex, colIndex);
                    }}
                    onMouseEnter={() => {
                      if (isMouseDown) toggleCell(rowIndex, colIndex);
                    }}
                  />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  ), [grid, getCellStatus, toggleCell, isMouseDown]);

  return (
    <div className="w-3/4 select-none">
      <div className="bg-white rounded-xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 pt-10 pb-5">
          Graph Visualization
        </h1>
        <h2 className="text-2xl font-semibold text-center text-gray-600 pb-10">
          WIP to visualize Graph Algorithms
        </h2>
      </div>

      <div className="flex justify-center items-center gap-4 pb-6">
        <input
          type="number"
          min="1"
          value={rows}
          onChange={(e) => setRows(e.target.value)}
          className="border rounded px-3 py-1 text-center w-20"
          placeholder="Rows"
          disabled={isRunning}
        />
        <input
          type="number"
          min="1"
          value={cols}
          onChange={(e) => setCols(e.target.value)}
          className="border rounded px-3 py-1 text-center w-20"
          placeholder="Cols"
          disabled={isRunning}
        />
        <button
          onClick={handleGridResize}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
          disabled={isRunning}
        >
          Generate Grid
        </button>
      </div>

      <div className="">
        <div className="flex justify-center items-center gap-2 mb-4">
          <button
            onClick={() => setPlacementMode("source")}
            className={`pt-1 pl-4 pr-4 pb-1 rounded-xl text-white ${
              placementMode === "source" ? "bg-blue-700" : "bg-blue-500"
            }`}
            disabled={isRunning}
          >
            Source
          </button>
          <button
            onClick={() => setPlacementMode("target")}
            className={`pt-1 pl-4 pr-4 pb-1 rounded-xl text-white ${
              placementMode === "target" ? "bg-green-700" : "bg-green-500"
            }`}
            disabled={isRunning}
          >
            Sink
          </button>
          <button
            onClick={() => setPlacementMode("walls")}
            className={`pt-1 pl-4 pr-4 pb-1 rounded-xl text-white ${
              placementMode === "walls" ? "bg-purple-700" : "bg-purple-500"
            }`}
            disabled={isRunning}
          >
            Walls
          </button>
        </div>

        {gridDisplay}
        
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={handleGridReset}
            className={`pt-1 pl-4 pr-4 pb-1 rounded-xl text-white bg-red-500 hover:bg-red-600 mt-4`}
            disabled={isRunning}
          >
            Reset
          </button>

          <button
            onClick={runAlgorithm}
            className={`pt-1 pl-4 pr-4 pb-1 rounded-xl text-white ${
              isRunning ? "bg-gray-400" : "bg-gray-500 hover:bg-gray-600"
            } mt-4`}
            disabled={isRunning}
          >
            {isRunning ? "Running..." : "Run"}
          </button>
        </div>
      </div>
      <Debug
        rows={rows}
        cols={cols}
        startPos={startPos}
        endPos={endPos}
        isRunning={isRunning}
        placementMode={placementMode}
      />
    </div>
  );
};

export default React.memo(Graph);