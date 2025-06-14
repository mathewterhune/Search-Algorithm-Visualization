# Algorithm Visualizer

An interactive web application for visualizing pathfinding algorithms in real-time. Built with React and JavaScript, this tool helps users understand how different graph traversal algorithms work by providing step-by-step visual feedback.

---

![Overview](/images/Overview.png)

## Features

### Algorithms
- **Breadth-First Search (BFS)** – Guarantees shortest path in unweighted graphs
- **Depth-First Search (DFS)** – Explores as far as possible along each branch

### Interactive Controls
- **Draw Modes**: Toggle between placing walls, start point, and end point
![Drawmodes](/images/Draw%20Modes.png)
- **Speed Control**: Adjust algorithm execution speed (1–100ms delay)
![SpeedControl](/images/SpeedControl.png)
- **Real-time Controls**: Start, pause, resume, and stop algorithms mid-execution
- **Grid Management**: Clear paths, reset grid, or generate random mazes
![Controls](/images/buttons.png)

### Visual Elements
- **Color-coded nodes**: Different colors represent walls, visited nodes, path, start, and end points
- **Animated execution**: Watch algorithms explore the graph in real-time
- **Path highlighting**: Final shortest path is highlighted after completion

---

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository:**

```bash
git clone <repository-url>
cd algorithm-visualizer
```

2. **Install dependencies:**

```bash
npm install
# or
yarn install
```

3. **Start the development server:**

```bash
npm start
# or
yarn start
```

4. **Open** `http://localhost:3000` in your browser.

---

## How to Use

### Basic Usage
- **Select an Algorithm**: Choose between BFS or DFS from the dropdown
- **Set Start/End Points**: Use draw mode to place start (green) and end (red)
- **Draw Walls**: Use "Wall" mode and click/drag to create obstacles
- **Run Algorithm**: Click "Start" to begin visualization
- **Control Execution**: Use pause/resume or stop buttons

### Draw Modes
![DrawModes](/images/Draw%20Modes.png)
- **Wall Mode**: Click to toggle walls on/off (cannot modify border walls)
- **Start Mode**: Click to relocate the starting point
- **End Mode**: Click to relocate the destination point

### Additional Features
- **Generate Maze**: Creates a random maze layout
- **Clear Path**: Removes visited nodes and path, keeps walls
- **Reset Grid**: Clears everything and resets the grid

---

## Examples


Graph Initial State
![EmptyGraph](/images/Empty.png)
Graph After Pressing Generate Maze
![MazeGraph](/images/Randomized.png)
Graph After running BFS
![CompletedGraph](/images/Complete.png)

---

## Project Structure

```
src/
├── components/
│   ├── GraphVisualizer.jsx      # Main component orchestrating the visualization
│   ├── Node.jsx                 # Individual grid cell component
│   ├── VisualizerActions.jsx   # Control buttons (start, pause, stop, etc.)
│   ├── VisualizerControls.jsx  # Algorithm and mode selection controls
│   ├── VisualizerGraph.jsx     # Grid display wrapper
│   ├── VisualizerHeader.jsx    # Application header
│   └── VisualizerLegend.jsx    # Color legend for node types
└── logic/
    ├── AlgorithmEngine.js      # Core algorithm execution engine
    ├── GraphManager.js         # Graph data structure and operations
    ├── constants.js            # Application constants and enums
    └── drawModes.js            # Draw mode definitions
```

---

## Architecture

### Core Components

#### 🔹 GraphManager
- Manages the underlying graph data structure
- Uses a flattened `Uint8Array` for efficient memory
- Handles node types, neighbors, grid operations
- Methods for cloning, resetting, validating state

#### 🔹 AlgorithmEngine
- Executes pathfinding algorithms with animation
- Supports pause/resume, speed control
- Uses `async/await` for non-blocking execution
- Provides UI update and completion callbacks

#### 🔹 GraphVisualizer
- Main React component orchestrating logic and rendering
- Manages grid state, user interaction, algorithm execution
- Uses `useState`, `useCallback`, `useMemo`, `useRef` for efficiency
- Handles mouse events for interactive drawing

---

## Key Features

### Performance Optimizations
- **Memoization**: via `React.memo`, `useCallback`, and `useMemo`
- **Compact Data**: uses `Uint8Array` to store grid info
- **Batch Processing**: for smoother step-by-step animation

### User Experience
- **Responsive Design**: clean Tailwind CSS interface
- **Interactive Drawing**: drag to place/remove walls
- **Real-time Feedback**: updates as you interact
- **Clear Controls**: intuitive, accessible interface

---

## Algorithm Details

### Breadth-First Search (BFS)
- **Time Complexity**: O(V + E)
- **Space Complexity**: O(V)
- **Guarantees**: Shortest path in unweighted graphs
- **Visualization**: Explores level-by-level in a wave

### Depth-First Search (DFS)
- **Time Complexity**: O(V + E)
- **Space Complexity**: O(V)
- **Behavior**: Goes deep, then backtracks
- **Visualization**: Windy, recursive path patterns

---

## Technical Implementation

### State Management
- Local state via React hooks
- Refs for engine instance and persistent objects
- Memoized callbacks for render efficiency

### Grid Representation
- Stored as 1D array with 2D coordinate math
- `index = row * cols + col`
- Validated and type-safe node handling

### Asynchronous Execution
- Algorithms use `async/await` to prevent blocking
- Visualization delay with `Promise`-based sleep
- Supports pause/resume and safe cancellation

---

## Future Enhancements

### Planned Features
- Dijkstra's Algorithm, A* Search, Greedy Best-First
- Weighted Graphs support
- Customizable grid sizes
- Step-by-step execution mode

### Technical Improvements
- Algorithm statistics: visited count, path length, time
- Mobile support: better touch experience
- Accessibility: keyboard support, screen reader tags

---

## License

This project is open source and available under the **MIT License**.

---

## Acknowledgments

- Built with **React** and modern **JavaScript**
- Styled with **Tailwind CSS**
- Icons via **Lucide React**
- Inspired by classic algorithm visualizers