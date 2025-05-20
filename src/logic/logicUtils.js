// Function to initialize the grid with walls
export const InitializeArray = (rows, cols, defaultValue = "E") => {
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

export const buildAdjacencyList = (grid) => {
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

