import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import GridSquare from "./GridSquare";
import { InitializeArray, buildAdjacencyList } from "../logic/logicUtils";
import { BFS, DFS } from "../logic/algorithms";

const Graph = () => {
  const [rows, setRows] = useState(20);
  const [cols, setCols] = useState(30);
  const [grid, setGrid] = useState(() => InitializeArray(20, 30));
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [placementMode, setPlacementMode] = useState("source");
  const [startPos, setStartPos] = useState(null);
  const [endPos, setEndPos] = useState(null);
  
  // For visualization state
  const [visitedCells, setVisitedCells] = useState(new Set());
  const [pathCells, setPathCells] = useState(new Set());
  const [isRunning, setIsRunning] = useState(false);
  
  // Create refs to avoid re-creating objects/functions when not needed
  const gridRef = useRef(grid);
  const visitedRef = useRef(visitedCells);
  const pathRef = useRef(pathCells);
  
  // Update refs when state changes
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

  // Memoize adjacency list - only recompute when grid changes
  const adjacencyList = useMemo(() => buildAdjacencyList(grid), [grid]);

  // Reset visualization state
  const resetVisualization = useCallback(() => {
    setVisitedCells(new Set());
    setPathCells(new Set());
  }, []);

  // Handle resize with memoization
  const handleResize = useCallback(() => {
    const parsedRows = parseInt(rows);
    const parsedCols = parseInt(cols);
    if (!isNaN(parsedRows) && !isNaN(parsedCols)) {
      setGrid(InitializeArray(parsedRows, parsedCols));
      resetVisualization();
      setStartPos(null);
      setEndPos(null);
    }
  }, [rows, cols, resetVisualization]);

  // Optimized cell toggle
  const toggleCell = useCallback((row, col) => {
    setGrid(prev => {
      const cell = prev[row][col];

      // Early return if nothing would change
      if (placementMode === "walls" && (cell === "S" || cell === "T" || cell === "X")) return prev;

      // Create a new grid copy only when necessary
      const newGrid = [...prev];
      const newRow = [...prev[row]];

      if (placementMode === "walls") {
        newRow[col] = cell === "P" ? "E" : "P";
      }
      else if (placementMode === "source") {
        if (cell === "S") {
          newRow[col] = "E";
          setStartPos(null);
        } else {
          if (startPos) {
            const [sr, sc] = startPos;
            const updatedStartRow = [...prev[sr]];
            updatedStartRow[sc] = "E";
            newGrid[sr] = updatedStartRow;
          }
          newRow[col] = "S";
          setStartPos([row, col]);
        }
      }
      else if (placementMode === "target") {
        if (cell === "T") {
          newRow[col] = "E";
          setEndPos(null);
        } else {
          if (endPos) {
            const [er, ec] = endPos;
            const updatedEndRow = [...prev[er]];
            updatedEndRow[ec] = "E";
            newGrid[er] = updatedEndRow;
          }
          newRow[col] = "T";
          setEndPos([row, col]);
        }
      }

      newGrid[row] = newRow;
      return newGrid;
    });
    
    // Reset visualization when grid changes
    resetVisualization();
  }, [placementMode, startPos, endPos, resetVisualization]);

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

  // Run algorithm function
  const runAlgorithm = useCallback(() => {
    if (!startPos || !endPos) {
      alert("Please place both a source and a target node.");
      return;
    }

    // Reset visualization
    resetVisualization();
    setIsRunning(true);

    const startKey = `${startPos[0]},${startPos[1]}`;
    const endKey = `${endPos[0]},${endPos[1]}`;

    // Use the memoized adjacency list
    // BFS(grid, adjacencyList, startKey, endKey, handleVisit, handlePathCompletion);
    DFS(grid, adjacencyList, startKey, endKey, handleVisit, handlePathCompletion);
  }, [grid, adjacencyList, startPos, endPos, handleVisit, handlePathCompletion, resetVisualization]);

  // Calculate cell status once - handles both base grid and visualization overlays
  const getCellStatus = useCallback((rowIndex, colIndex) => {
    const key = `${rowIndex},${colIndex}`;
    const baseValue = grid[rowIndex][colIndex];
    
    // Path visualization takes precedence
    if (pathCells.has(key) && baseValue !== "S" && baseValue !== "T") {
      return "A";
    }
    
    // Visited cells next
    if (visitedCells.has(key) && baseValue !== "S" && baseValue !== "T") {
      return "L";
    }
    
    // Base grid value otherwise
    return baseValue;
  }, [grid, visitedCells, pathCells]);

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
          onClick={handleResize}
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
            onClick={handleResize}
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
    </div>
  );
};

export default React.memo(Graph);