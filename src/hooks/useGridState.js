import { useState, useCallback, useMemo } from 'react';
import { InitializeArray, buildAdjacencyList } from '../logic/logicUtils';
import { DEFAULT_DATA, NODE_TYPES } from '../logic/nodeTypes';

export const useGridState = () => {
  // Grid dimensions
  const [rows, setRows] = useState(DEFAULT_DATA.default_rows);
  const [cols, setCols] = useState(DEFAULT_DATA.default_cols);
  
  // Grid data
  const [grid, setGrid] = useState(() => 
    InitializeArray(DEFAULT_DATA.default_rows, DEFAULT_DATA.default_cols)
  );
  
  // Source and target positions
  const [startPos, setStartPos] = useState(null);
  const [endPos, setEndPos] = useState(null);

  // Memoized adjacency list - only recompute when grid changes
  const adjacencyList = useMemo(() => buildAdjacencyList(grid), [grid]);

  // Handle grid resize
  const handleResize = useCallback(() => {
    const parsedRows = parseInt(rows);
    const parsedCols = parseInt(cols);
    
    if (!isNaN(parsedRows) && !isNaN(parsedCols) && parsedRows > 0 && parsedCols > 0) {
      const newGrid = InitializeArray(parsedRows, parsedCols);
      setGrid(newGrid);
      // Reset positions when grid changes
      setStartPos(null);
      setEndPos(null);
      return true; // Success
    }
    return false; // Invalid input
  }, [rows, cols]);

  // Reset grid to empty state (keeping same dimensions)
  const resetGrid = useCallback(() => {
    setGrid(InitializeArray(parseInt(rows), parseInt(cols)));
    setStartPos(null);
    setEndPos(null);
  }, [rows, cols]);

  // Update a specific cell in the grid
  const updateCell = useCallback((row, col, newValue) => {
    setGrid(prev => {
      const newGrid = [...prev];
      const newRow = [...prev[row]];
      newRow[col] = newValue;
      newGrid[row] = newRow;
      return newGrid;
    });
  }, []);

  // Set source position (removes old source if exists)
  const setSourcePosition = useCallback((row, col) => {
    setGrid(prev => {
      const newGrid = [...prev];
      
      // Remove old source if it exists
      if (startPos) {
        const [oldRow, oldCol] = startPos;
        const oldSourceRow = [...prev[oldRow]];
        oldSourceRow[oldCol] = NODE_TYPES.EMPTY_NODE;
        newGrid[oldRow] = oldSourceRow;
      }
      
      // Set new source
      const newRow = [...prev[row]];
      newRow[col] = NODE_TYPES.SOURCE_NODE;
      newGrid[row] = newRow;
      
      return newGrid;
    });
    
    setStartPos([row, col]);
  }, [startPos]);

  // Set target position (removes old target if exists)
  const setTargetPosition = useCallback((row, col) => {
    setGrid(prev => {
      const newGrid = [...prev];
      
      // Remove old target if it exists
      if (endPos) {
        const [oldRow, oldCol] = endPos;
        const oldTargetRow = [...prev[oldRow]];
        oldTargetRow[oldCol] = NODE_TYPES.EMPTY_NODE;
        newGrid[oldRow] = oldTargetRow;
      }
      
      // Set new target
      const newRow = [...prev[row]];
      newRow[col] = NODE_TYPES.TARGET_NODE;
      newGrid[row] = newRow;
      
      return newGrid;
    });
    
    setEndPos([row, col]);
  }, [endPos]);

  // Remove source position
  const removeSource = useCallback(() => {
    if (startPos) {
      const [row, col] = startPos;
      updateCell(row, col, NODE_TYPES.EMPTY_NODE);
      setStartPos(null);
    }
  }, [startPos, updateCell]);

  // Remove target position
  const removeTarget = useCallback(() => {
    if (endPos) {
      const [row, col] = endPos;
      updateCell(row, col, NODE_TYPES.EMPTY_NODE);
      setEndPos(null);
    }
  }, [endPos, updateCell]);

  // Toggle wall at position
  const toggleWall = useCallback((row, col) => {
    const currentCell = grid[row][col];
    
    // Don't allow walls on source/target or boundary walls
    if (currentCell === NODE_TYPES.SOURCE_NODE || 
        currentCell === NODE_TYPES.TARGET_NODE || 
        currentCell === NODE_TYPES.BOUNDARY_WALL) {
      return false; // Action not allowed
    }
    
    const newValue = currentCell === NODE_TYPES.PLACED_WALL 
      ? NODE_TYPES.EMPTY_NODE 
      : NODE_TYPES.PLACED_WALL;
    
    updateCell(row, col, newValue);
    return true; // Action successful
  }, [grid, updateCell]);

  // Get cell value at position
  const getCellValue = useCallback((row, col) => {
    if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
      return grid[row][col];
    }
    return null; // Invalid position
  }, [grid]);

  // Validation helpers
  const isValidPosition = useCallback((row, col) => {
    return row >= 0 && row < grid.length && col >= 0 && col < grid[0].length;
  }, [grid]);

  const hasSourceAndTarget = useCallback(() => {
    return startPos !== null && endPos !== null;
  }, [startPos, endPos]);

  return {
    // State values
    rows,
    cols,
    grid,
    startPos,
    endPos,
    adjacencyList,
    
    // State setters
    setRows,
    setCols,
    
    // Grid operations
    handleResize,
    resetGrid,
    updateCell,
    
    // Position management
    setSourcePosition,
    setTargetPosition,
    removeSource,
    removeTarget,
    
    // Wall management
    toggleWall,
    
    // Utilities
    getCellValue,
    isValidPosition,
    hasSourceAndTarget,
  };
};