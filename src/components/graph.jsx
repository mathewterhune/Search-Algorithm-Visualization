import React, { useState, useEffect } from "react";
import GridSquare from "./GridSquare";

// Function to initialize the grid with walls
const InitializeArray = (rows, cols, defaultValue = "E") => {
  console.log("Initializing grid with walls");
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        row.push("X");
      } else {
        row.push(defaultValue);
      }
    }
    grid.push(row);
  }

  console.table(grid);

  return grid;
};

// Build adjacency list (used for search algorithms)
const buildAdjacencyList = (grid) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const adjList = {};
  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  console.log("Building adjacency list");

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const node = `${r},${c}`;
      adjList[node] = [];

      if (grid[r][c] === "X") continue;

      for (let [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (
          nr >= 0 &&
          nr < rows &&
          nc >= 0 &&
          nc < cols &&
          grid[nr][nc] !== "X" &&
          grid[nr][nc] !== "P"
        ) {
          adjList[node].push(`${nr},${nc}`);
        }
      }
    }
  }
  console.log("Adjacency List created");

  // Print the adjacency list
  console.table(adjList);

  return adjList;
};


const BFS = (grid, adjacencyList, start, end) => {
  const queue = [start];
  const visited = new Set();
  const parent = {};

  visited.add(start);

  while (queue.length > 0) {
    const current = queue.shift();

    if (current === end) {
      break;
    }

    for (const neighbor of adjacencyList[current]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        parent[neighbor] = current;
      }
    }
  }

  // Reconstruct the path
  const path = [];
  let current = end;
  while (current !== start) {
    path.unshift(current);
    current = parent[current];
  }
  path.unshift(start);

  return path;  
}

const Graph = () => {
  const [rows, setRows] = useState(20);
  const [cols, setCols] = useState(30);
  const [grid, setGrid] = useState(() => InitializeArray(20, 30));

  const [isMouseDown, setIsMouseDown] = useState(false);

  const [placementMode, setPlacementMode] = useState("source");
  const [startPos, setStartPos] = useState(null);
  const [endPos, setEndPos] = useState(null);

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
  setGrid((prevGrid) => {
    const newGrid = prevGrid.map((r, rIndex) =>
      r.map((cell, cIndex) => {
        if (rIndex !== row || cIndex !== col) return cell;

        const isStart = cell === "S";
        const isTarget = cell === "T";

        // Don't allow modifying border walls
        if (cell === "X") return cell;

        // SOURCE mode
        if (placementMode === "source") {
          // Clicked current source again = remove it
          // console.log("Mode: Place source");
          if (isStart) {
            setStartPos(null);
            return "E";
          }
          // Set a new source
          if (startPos) {
            const [sr, sc] = startPos;
            prevGrid[sr][sc] = "E"; // Clear previous source
            // console.log(`Source Position set to: [${sr},${sc}]`);
          }
          setStartPos([row, col]);
          return "S";
        }

        // TARGET mode
        if (placementMode === "target") {
          // console.log("Mode: Place Target");

          if (isTarget) {
            setEndPos(null);
            return "E";
          }
          // Set a new target
          if (endPos) {
            const [er, ec] = endPos;
            prevGrid[er][ec] = "E";
          }
          setEndPos([row, col]);
          // console.log(`Target Position set to: [${row},${col}]`);
          return "T";
        }

        // WALL mode
        if (placementMode === "walls") {
          if (!startPos || !endPos) {
            console.warn("Place source and target before drawing walls.");
            return cell;
          }
          if (cell === "P") return "E";
          if (isStart || isTarget) return cell;
          return "P";
        }

        return cell;
      })
    );

    return [...newGrid]; // Return a new reference
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
    const path = BFS(grid, adjList, startKey, endKey);

    console.log("BFS Path:", path);

    setGrid((prevGrid) => {
      const newGrid = prevGrid.map((row, r) =>
        row.map((cell, c) => {
          const key = `${r},${c}`;
          if (path.includes(key) && cell !== "S" && cell !== "T") {
            return "L";
          }
          return cell;
        })
      );
      return newGrid;
    });
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
