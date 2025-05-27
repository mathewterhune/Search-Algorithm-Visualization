import { NODE_TYPES, ALGO } from "../logic/nodeTypes";

// Function to initialize the grid with walls
export const InitializeArray = (rows, cols, defaultValue = NODE_TYPES.EMPTY_NODE) => {
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      if (r === 0 || r === rows - 1 || c === 0 || c === cols - 1) {
        row.push(NODE_TYPES.BOUNDARY_WALL);
      } else {
        row.push(defaultValue);
      }
    }
    grid.push(row);
  }
  return grid;
};

// Create a more efficient adjacency list builder
export const buildAdjacencyList = (grid) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const adjList = {};
  
  // Pre-compute directions for reuse
  const directions = [
    [0, 1],  // right
    [1, 0],  // down
    [0, -1], // left
    [-1, 0], // up
  ];

  // First pass: collect wall and obstacle positions
  const obstacles = new Set();
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === NODE_TYPES.BOUNDARY_WALL || grid[r][c] === NODE_TYPES.PLACED_WALL) {
        obstacles.add(`${r},${c}`);
      }
    }
  }

  // Second pass: build adjacency list, only for non-obstacle cells
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const currentKey = `${r},${c}`;
      
      // Skip if this cell is an obstacle
      if (obstacles.has(currentKey)) {
        adjList[currentKey] = [];
        continue;
      }
      
      // Initialize neighbors array
      const neighbors = [];
      
      // Check all four directions
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        const neighborKey = `${nr},${nc}`;
        
        // Add neighbor if it's valid and not an obstacle
        if ( nr >= 0 && nr < rows && nc >= 0 && nc < cols && !obstacles.has(neighborKey)) {
          neighbors.push(neighborKey);
        }
      }
      
      adjList[currentKey] = neighbors;
    }
  }

  return adjList;
};