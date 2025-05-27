// Node Types
export const NODE_TYPES = {
    EMPTY_NODE: "EMPTY_NODE",
    VISITED_NODE: "VISITED_NODE",
    BOUNDARY_WALL: "BOUNDARY_WALL",
    SOURCE_NODE: "SOURCE_NODE",
    TARGET_NODE: "TARGET_NODE",
    PLACED_WALL: "PLACED_WALL",
    SOLUTION_PATH: "SOLUTION_PATH",
};

export const NODE_COLOURS = {
    EMPTY_NODE: "#ecf0f1",
    VISITED_NODE: "#abb2b9",
    BOUNDARY_WALL: "#212f3d",
    SOURCE_NODE: "#f1c40f",
    TARGET_NODE: "#d68910",
    PLACED_WALL: "#808b96",
    SOLUTION_PATH: "#239b56",
};


// Default data
export const DEFAULT_DATA = {
    default_cols: 30,
    default_rows: 20,
    default_source: [1,1],
    default_target: [20 - 2, 30 - 2],
    default_walls: [],
};

export const ALGORITHM_CONTROL_STATES = {
    IDLE: 'idle',
    RUNNING: 'running',
    PAUSED: 'paused',
    STEPPING: 'stepping',
    COMPLETED: 'completed',
};

