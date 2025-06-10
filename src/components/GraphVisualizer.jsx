import React, { useState, useCallback, useMemo, useRef, useEffect, } from "react";


import { GraphManager } from "../logic/GraphManager";
import { AlgorithmEngine } from "../logic/algorithmEngine";
import { NODE_TYPES, ALGORITHMS, DRAW_MODES } from "../logic/constants";
// import { DRAW_MODES } from "../logic/drawModes";
import { Node } from "./Node";

import { VisualizerHeader } from "./VisualizerHeader";
import { VisualizerControls } from "./VisualizerControls";
import { VisualizerActions } from "./VisualizerActions";
import { VisualizerLegend } from "./VisualizerLegend";
import { VisualizerGraph } from "./VisualizerGraph";

const GraphVisualizer = () => {
  // Core state
  const [dimensions, setDimensions] = useState({ rows: 25, cols: 40 }); // Defines the graph size
  const [gridManager, setGridManager] = useState(
    () => new GraphManager(25, 40)
  ); // manages local grid state
  const [visualGrid, setVisualGrid] = useState(() => gridManager.graph.slice()); // shallow copy that is used to trigger react re-renders
  const [startPos, setStartPos] = useState([2, 2]);
  const [endPos, setEndPos] = useState([22, 37]);

  // Algorithm state
  const [algorithm, setAlgorithm] = useState(ALGORITHMS.BFS);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(50);

  // Interaction state
  const [drawMode, setDrawMode] = useState(DRAW_MODES.WALL); // What tool is active
  const [isMouseDown, setIsMouseDown] = useState(false); // Whether the mouse is being pressed down to draw on the grid

  // Refs
  const engineRef = useRef(null); // Holds the current algorithm engine instance, used to control the execution

  useEffect(() => {
    // Ensures that the visual grid updates when the start, end, or GraphManager changes
    const newGrid = gridManager.clone();
    newGrid.setNode(startPos[0], startPos[1], NODE_TYPES.START);
    newGrid.setNode(endPos[0], endPos[1], NODE_TYPES.END);
    setVisualGrid(newGrid.graph.slice());
  }, [gridManager, startPos, endPos]); // Dependencies indicate when to re-run this effect.

  const handleAlgorithmUpdate = useCallback(
    (updates) => {
      // useCallback hook is used to memoize callback functions, it returns the same function instance between renders

      // This function is called by AlgorithmEngine when a cell is visited or updated during execution
      setVisualGrid((prev) => {
        const newGrid = prev.slice();
        for (const [row, col, type] of updates) {
          const index = row * dimensions.cols + col;
          if (
            newGrid[index] !== NODE_TYPES.START &&
            newGrid[index] !== NODE_TYPES.END
          )
            newGrid[index] = type; // Update the cell type
        }

        // Return the updated graph, triggering a re-render
        return newGrid;
      });
    },
    [dimensions.cols]
  ); // -------------> look into this

  const handleAlgorithmComplete = useCallback(
    (path) => {
      // useCallback hook is used to memoize callback functions, it returns the same function instance between renders

      setIsRunning(false);
      setIsPaused(false);

      // When algorithm finds a path, animate the path on the graph
      if (path) {
        // Animate path
        path.forEach((pos, index) => {
          // Use setTimeout to create a delay for each cell in the path
          setTimeout(() => {
            setVisualGrid((prev) => {
              const newGrid = prev.slice();
              const gridIndex = pos[0] * dimensions.cols + pos[1];

              // Make sure that you dont overwrite the start and end nodes.
              if (
                newGrid[gridIndex] !== NODE_TYPES.START &&
                newGrid[gridIndex] !== NODE_TYPES.END
              )
                newGrid[gridIndex] = NODE_TYPES.PATH;

              // Return the updated graph, triggering a re-render
              return newGrid;
            });
          }, index * 30);
        });
      }
    },
    [dimensions.cols]
  );

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
    const engine = new AlgorithmEngine(
      gridManager,
      handleAlgorithmUpdate,
      handleAlgorithmComplete,
      (error) => console.error("Algorithm error:", error)
    );
    engine.speed = speed;
    engine.isRunning = true;
    engineRef.current = engine;
    // Update these as functions in AlgorithmEngine

    try {
      await engine.runAlgorithm(algorithm, startPos, endPos);
    } catch (error) {
      console.error("Algorithm error:", error);
      setIsRunning(false);
    }
  }, [
    algorithm,
    startPos,
    endPos,
    gridManager,
    speed,
    isRunning,
    handleAlgorithmUpdate,
    handleAlgorithmComplete,
  ]);

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
      if (gridManager.graph[i] > NODE_TYPES.END)
        cleanGrid.graph[i] = NODE_TYPES.EMPTY;
    }

    // Set start/end nodes back to positions
    cleanGrid.setNode(startPos[0], startPos[1], NODE_TYPES.START);
    cleanGrid.setNode(endPos[0], endPos[1], NODE_TYPES.END);
    setGridManager(cleanGrid);
    setVisualGrid(cleanGrid.graph.slice());
  }, [gridManager, startPos, endPos, stopAlgorithm]);

  // Handle cell interactions
  const handleCellClick = useCallback(
    (row, col) => {
      if (isRunning) return;

      const currentType = gridManager.getNode(row, col);
      const newGrid = gridManager.clone();

      switch (drawMode) {
        case DRAW_MODES.WALL:
          if (currentType === NODE_TYPES.EMPTY) {
            newGrid.setNode(row, col, NODE_TYPES.WALL);
          } else if (
            currentType === NODE_TYPES.WALL &&
            row !== 0 &&
            row !== dimensions.rows - 1 &&
            col !== 0 &&
            col !== dimensions.cols - 1
          ) {
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
    },
    [drawMode, isRunning, gridManager, startPos, endPos, dimensions]
  );

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
            onMouseDown={() => setIsMouseDown(true)}
          />
        );
      }
      rows.push(
        <div key={r} className="flex">
          {cells}
        </div>
      );
    }
    return <div className="inline-block border-2 border-gray-400">{rows}</div>;
  }, [visualGrid, dimensions, handleCellClick, isMouseDown]); // Only re-render when these update

  // Global mouse up handler
  useEffect(() => {
    const handleMouseUp = () => setIsMouseDown(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <VisualizerHeader />

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <VisualizerControls
            algorithm={algorithm}
            setAlgorithm={setAlgorithm}
            speed={speed}
            setSpeed={setSpeed}
            drawMode={drawMode}
            setDrawMode={setDrawMode}
            isRunning={isRunning}
            engineRef={engineRef}
          />

          <VisualizerActions
            runAlgorithm={runAlgorithm}
            isRunning={isRunning}
            isPaused={isPaused}
            pauseAlgorithm={pauseAlgorithm}
            stopAlgorithm={stopAlgorithm}
            clearPath={clearPath}
            resetGrid={resetGrid}
            generateMaze={generateMaze}
          />
        </div>

        <VisualizerLegend />
        <VisualizerGraph graphDisplay={gridDisplay} />



      </div>
    </div>
  );
};

export default GraphVisualizer;
