import { NODE_TYPES, ALGORITHMS } from './constants.js'


export class AlgorithmEngine {
    constructor(GraphManager, onUpdateCallback, onCompleteCallback, onErrorCallback) {
        /**
         * @param {GraphManager} GraphManager - The graph manager instance, to provide access to the graph and its nodes
         * @param {function} onUpdateCallback - Callback function that will be called to send visual update data  to the UI
         * @param {function} onCompleteCallback
         * @param {function} onErrorCallback 
         */
        this.GraphManager = GraphManager;                               
        this.onUpdate = onUpdateCallback;
        this.onComplete = onCompleteCallback;
        this.onError = onErrorCallback || console.error; 

        this.isRunning = false;     // Indicates if an algorithm is currently running or not 
        this.isPaused = false;      // Indicates if the algorithm is paused
        this.speed = 50;            // Speed of the algorithm execution in milliseconds    
        this.algorithm = null;      // Current algorithm, if any.
    }

    /**
     * Async functions return a function that returns a promise and allows the use of await inside of it
     * 
     * Await temporarily pauses the execution inside an async function until the promise is resolved. 
     * Promise is a wrapper for async results, it represents the value that will be available in the future. 
     */
    
    async runAlgorithm(algorithm, start, end) {
        this.isRunning = true;
        this.isPaused = false;
        this.algorithm = algorithm;

        try {
            if (algorithm === ALGORITHMS.BFS) {
                await this.runBFS(start, end);
            } else if (algorithm === ALGORITHMS.DFS) {
                await this.runDFS(start, end);
            } else {
                throw new Error('Unknown algorithm: ' + algorithm);
            }
        } catch (error) {
            this.onError(error);
            this.isRunning = false;
        }
    }



    sleep (ms) {
        // Makes use of a raw promise, creating a delay. SetTimeout only fires after a delay, and the promise is resolved after that delay.
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    pause () {
        // If the algorithm state is running, toggle the pause state.
        if (this.isRunning) this.isPaused = !this.isPaused;
    
    }
    stop () {
        // stop the algorithm execution, reset the state and notify the UI
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
        /**
         * Polling loop to pause the algorithms execution until the pause state is toggled off.
         * 
         * returns a promise that only resolves when the algorithm should continue (isPaused is false)
         *
         */

        return new Promise(resolve => {
            const checkPause = () => {
                if (!this.isPaused || !this.isRunning) resolve(); // If its not running or not paused resolve the promise, continuing execution
                else setTimeout(checkPause, 16); // Check every 16ms
            };
            checkPause();
        });
    }

    async runBFS (start, end) {
        const queue = [start];
        const visited = new Set([`${start[0]},${start[1]}`]);
        const parentMap = new Map();

        // Check if the algorithm is running
        while (queue.length > 0 && this.isRunning) {
            
            // CONTROL STATE
            if (this.isPaused) await this.waitForResume(); // If the algorithm is paused, wait for it to resume.
            
            // Determine how many nodes to process per frame based on the speed.
            const batchSize = Math.max(1, Math.floor(100 / this.speed));
            const batch = []; // Batch is the number of nodes that will be sent to the UI for visualization in a single frame.

            // Process the current batch of nodes
            for (let i = 0; i < batchSize && queue.length > 0; ++i) {

                const [row,col] = queue.shift(); // removes first element from the queue and returns it 
                const key = `${row},${col}`;   

                if (row === end[0] && col === end[1]) {
                    // if the current node is the end node, reconstruct the path and notify the UI
                    const path = this.reconstructPath(parentMap, start, end);
                    this.onComplete(path);
                    return;
                }
                
                // add batch of nodes to the visualization
                batch.push([row, col, NODE_TYPES.VISITED]);

                // Explore neighbours
                for( const [nr,nc] of this.GraphManager.getNeighbours(row,col)) {
                    const neighbourKey = `${nr},${nc}`;

                    // If the neighbour has not been visited and is not a wall
                    if(!visited.has(neighbourKey)) {
                        visited.add(neighbourKey);
                        queue.push([nr,nc]);
                        parentMap.set(neighbourKey, [row,col]);
                    }
                }
            }

            // Trigger a re-render with the visited nodes in the current batch
            if (batch.length > 0) {
                this.onUpdate(batch);
                await this.sleep(this.speed); // paused to see the algorithm execute
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
        const neighbors = this.GraphManager.getNeighbours(row, col);
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