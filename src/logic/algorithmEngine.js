import { NODE_TYPES, ALGORITHMS } from './constants.js'



export class AlgorithmEngine {
    constructor(grid, onUpdate, onComplete, onError) {
        this.grid = grid;
        this.onUpdate = onUpdate;
        this.onComplete = onComplete;
        this.onError = onError || console.error;
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 50;
        this.algorithm = null;
    }

    async runAlgorithm (algorithm, start, end) {
        if (this.isRunning) {
            console.warn('An algorithm is already running!!');
            return;
        }

        this.isRunnning = true;
        this.isPaused = false;

        try {
            switch (algorithm) {
                case ALGORITHMS.BFS:
                    await this.runBFS(start, end);
                    break;
                case ALGORITHMS.DFS:
                    await this.runDFS(start, end);
                    break;
                default:
                    throw new Error(`Unknown algorithm: ${algorithm}`);
            }
        } catch (error) {
            this.onError('Algorithm error:', error);
            this.stop();
        }
    }



    sleep (ms) {return new Promise(resolve => setTimeout(resolve, ms));}
    pause () { if (this.isRunning) this.isPaused = !this.isPaused; }
    stop () {
        this.isRunning = false;
        this.isPaused = false;
    }
    setSpeed (speed) { this.speed = Math.max(1, Math.min(100, speed)); }
    getState () {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            speed: this.speed,
        };
    }

    reconstructPath (parent, start, end) {
        const path = [];
        let current = `${end[0]},${end[1]}`;
        const startKey = `${start[0]},${start[1]}`;

        while (current !== startKey) {
            const [row,col] = current.split(',').map(Number);
            path.unshift([row,col]);

            const parentNode = parent.get(current);
            if(!parentNode) break;
            current = `${parentNode[0]},${parentNode[1]}`;
        }
        
        return path;
    }

    async waitForResume () {
        return new Promise(resolve => {
            const checkPause = () => {
                if (!this.isPaused || !this.isRunning) {
                    resolve();
                }
                else {
                    setTimeout(checkPause, 16); // Check every 100ms
                }
            };
            checkPause();
        });
    }

    async runBFS (start, end) {
        const queue = [start];
        const visited = new Set([`${start[0], start[1]}`]);
        const parentMap = new Map();

        while (queue.length > 0 && this.isRunning) {
            
            if (this.isPaused) await this.waitForResume();
            
            const batchSize = Math.max(1, Math.floor(100 / this.speed));
            const batch = [];

            for (let i = 0; i < batchSize && queue.length > 0; ++i) {
                const [row,col] = queue.shift();
                const key = `${row},${col}`;

                if (row === end[0] && col === end[1]) {
                    const path = this.reconstructPath(parentMap, start, end);
                    this.onComplete(path);
                    return;
                }

                batch.push([row, col, NODE_TYPES.visited]);

                // Explore neighbours
                for( const [nr,nc] of this.grid.getNeighbours(row,col)) {
                    const neighbourKey = `${nr},${nc}`;

                    if(!visited.has(neighbourKey)) {
                        visited.add(neighbourKey);
                        queue.push([nr,nc]);
                        parentMap.set(neighbourKey, [row,col]);
                    }
                }
            }

            if (batch.length > 0) {
                this.onUpdate(batch);
                await this.sleep(this.speed);
            }
        }

        // No path found
        this.onComplete(null);
    }

      async runDFS(start, end) {
    const stack = [start];
    const visited = new Set();
    const parent = new Map();

    while (stack.length > 0 && this.isRunning) {
      // Handle pause state
      if (this.isPaused) {
        await this.waitForResume();
      }

      const [row, col] = stack.pop();
      const key = `${row},${col}`;

      // Skip if already visited
      if (visited.has(key)) continue;
      visited.add(key);

      // Check if we reached the destination
      if (row === end[0] && col === end[1]) {
        const path = this.reconstructPath(parent, start, end);
        this.onComplete(path);
        return;
      }

      // Mark as visited for visualization
      this.onUpdate([[row, col, NODE_TYPES.VISITED]]);

      // Add neighbors to stack (in reverse order for proper DFS behavior)
      const neighbors = this.grid.getNeighbors(row, col);
      for (let i = neighbors.length - 1; i >= 0; i--) {
        const [nr, nc] = neighbors[i];
        const neighborKey = `${nr},${nc}`;
        if (!visited.has(neighborKey)) {
          stack.push([nr, nc]);
          if (!parent.has(neighborKey)) {
            parent.set(neighborKey, [row, col]);
          }
        }
      }

      await this.sleep(this.speed);
    }

    // No path found
    this.onComplete(null);
  }


}