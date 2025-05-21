import React, { useState, useEffect } from "react";
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

  // Inside Graph.jsx
const handleVisit = (node) => {
  const [x, y] = node.split(",").map(Number);
  setGrid(prev => {
    if (prev[x][y] !== "E") return prev;
    const newRow = [...prev[x]];
    newRow[y] = "L";
    const newGrid = [...prev];
    newGrid[x] = newRow;
    return newGrid;
  });
};




const handlePathCompletion = (path) => {
  if (!path) return;

  path.forEach((node, i) => {
    setTimeout(() => {
      const [x, y] = node.split(",").map(Number);

      setGrid(prev => {
        const val = prev[x][y];
        if (val === "S" || val === "T" || val === "A") return prev;

        const newRow = [...prev[x]];
        newRow[y] = "A";

        const newGrid = [...prev];
        newGrid[x] = newRow;

        return newGrid;
      });
    }, i * 40);
  });
};


  // Global mouse up listener
  useEffect(() => {
    const handleMouseUp = () => setIsMouseDown(false);
    window.addEventListener("mouseup", handleMouseUp);
    return () => window.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // Resize grid
  const handleResize = () => {
    const parsedRows = parseInt(rows);
    const parsedCols = parseInt(cols);
    if (!isNaN(parsedRows) && !isNaN(parsedCols)) {
      setGrid(InitializeArray(parsedRows, parsedCols));
    }
  };

  // Toggle cell between wall and empty
const toggleCell = (row, col) => {
  setGrid(prev => {
    const cell = prev[row][col];

    // early return if nothing would change
    if (placementMode === "walls" && (cell === "S" || cell === "T" || cell === "X")) return prev;

    const newRow = [...prev[row]];
    const newGrid = [...prev];

    // example: placing a wall
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
};


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
        />
        <input
          type="number"
          min="1"
          value={cols}
          onChange={(e) => setCols(e.target.value)}
          className="border rounded px-3 py-1 text-center w-20"
          placeholder="Cols"
        />
        <button
          onClick={handleResize}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
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
          >
            Source
          </button>
          <button
            onClick={() => setPlacementMode("target")}
            className={`pt-1 pl-4 pr-4 pb-1 rounded-xl text-white ${
              placementMode === "target" ? "bg-green-700" : "bg-green-500"
            }`}
          >
            Sink
          </button>
          <button
            onClick={() => setPlacementMode("walls")}
            className={`pt-1 pl-4 pr-4 pb-1 rounded-xl text-white ${
              placementMode === "walls" ? "bg-purple-700" : "bg-purple-500"
            }`}
          >
            Walls
          </button>
        </div>

        <table className="border-separate border-spacing-0.5 mx-auto">
          <tbody>
            {grid.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, colIndex) => (
                  <td key={colIndex}>
                    <GridSquare
                      value={cell}
                      onMouseDown={() => {
                        setIsMouseDown(true);
                        toggleCell(rowIndex, colIndex);
                      }}
                      onMouseEnter={() => {
                        if (isMouseDown) toggleCell(rowIndex, colIndex);
                      }}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={() => handleResize(rows, cols)}
            className={`pt-1 pl-4 pr-4 pb-1 rounded-xl text-white bg-red-500 hover:bg-red-600 mt-4`}
          >
            Reset
          </button>

          <button
            onClick={() => {
              if (!startPos || !endPos) {
                alert("Please place both a source and a target node.");
                return;
              }

              const startKey = `${startPos[0]},${startPos[1]}`;
              const endKey = `${endPos[0]},${endPos[1]}`;
              const adjList = buildAdjacencyList(grid);

              BFS(grid,adjList,startKey,endKey,handleVisit,handlePathCompletion);
              // DFS(grid,adjList,startKey,endKey,handleVisit,handlePathCompletion);
            }}
            className={`pt-1 pl-4 pr-4 pb-1 rounded-xl text-white bg-gray-500 hover:bg-gray-600 mt-4`}
          >
            Run
          </button>
        </div>
      </div>
    </div>
  );
};

export default Graph;
