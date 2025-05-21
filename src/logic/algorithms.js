export const BFS = (grid, adjacencyList, start, end, handleVisit, handlePathCompletion) => {
  // Initialize
  const queue = [start];
  const visited = new Set([start]); // Mark start as visited immediately
  const parent = {};

  let step = 0;
  let foundPath = false;

  // BFS CONTROL LOOP - Set @ 30ms interval, which controls the speed of the animation
  const interval = setInterval(() => {
    // Check if the queue is empty
    if (queue.length === 0) {
      clearInterval(interval); // Stop the interval if no path is found
      handlePathCompletion(null); // no path found
      return;
    }

    // Process multiple nodes per interval to reduce stuttering
    const nodesToProcess = Math.min(5, queue.length);
    
    for (let i = 0; i < nodesToProcess; i++) {
      // Dequeue the next node
      const current = queue.shift();

      // Handle visiting the next node
      handleVisit(current);

      // Check if we reached the end node
      if (current === end) {
        foundPath = true;
        
        // Reconstruct path
        const path = [];
        let curr = end;
        while (curr !== start) {
          path.unshift(curr);
          curr = parent[curr];
        }
        path.unshift(start);

        clearInterval(interval); // Stop the interval
        handlePathCompletion(path); // Function to animate the path
        return;
      }

      // Process neighbors
      for (const neighbor of adjacencyList[current] || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
          parent[neighbor] = current;
        }
      }
    }

    step++;
  }, 30); // 30ms delay between batches of nodes
};

export const DFS = (grid, adjList, source, sink, handleVisit, handlePathCompletion) => {
    // Handle edge case: source is the sink
    if (source === sink) {
        handlePathCompletion([source]);
        return;
    }

    // Track visited nodes and parent relationships for path reconstruction
    const visited = new Set([source]);
    const parent = {};
    let foundPath = false;
    
    // Define the recursive DFS function with controlled timing
    const dfsStep = (current, depth = 0) => {
        // Visit the current node
        handleVisit(current);
        
        // Base case: reached the sink
        if (current === sink) {
            foundPath = true;
            
            // Reconstruct the path
            const path = [];
            let node = sink;
            while (node !== source) {
                path.unshift(node);
                node = parent[node];
            }
            path.unshift(source);
            
            handlePathCompletion(path);
            return true;
        }
        
        // Get neighbors for the current node
        const neighbors = adjList[current] || [];
        
        // Process neighbor nodes
        return { 
            current,
            neighbors: neighbors.filter(neighbor => !visited.has(neighbor)),
            index: 0
        };
    };
    
    // Initialize DFS with the source node
    const stack = [dfsStep(source)];
    
    // Start timer for controlled visualization
    const interval = setInterval(() => {
        // If stack is empty, no path exists
        if (stack.length === 0 || foundPath) {
            clearInterval(interval);
            if (!foundPath) {
                handlePathCompletion(null);
            }
            return;
        }
        
        // Get the current frame from the top of the stack
        const frame = stack[stack.length - 1];
        
        // Process multiple steps per interval to reduce stuttering
        // But still maintain the correct DFS order
        let stepsProcessed = 0;
        const maxStepsPerInterval = 3;
        
        while (stepsProcessed < maxStepsPerInterval && stack.length > 0 && !foundPath) {
            // Get the current frame from the top of the stack
            const frame = stack[stack.length - 1];
            
            // If we've processed all neighbors, backtrack
            if (frame.index >= frame.neighbors.length) {
                stack.pop();
                stepsProcessed++;
                continue;
            }
            
            // Get the next neighbor to explore
            const neighbor = frame.neighbors[frame.index];
            frame.index++;
            
            // Mark as visited and set parent
            visited.add(neighbor);
            parent[neighbor] = frame.current;
            
            // Process this neighbor
            const result = dfsStep(neighbor, stack.length);
            
            // If we found the sink, stop processing
            if (result === true) {
                foundPath = true;
                clearInterval(interval);
                break;
            }
            
            // Otherwise, push the new frame to the stack
            stack.push(result);
            stepsProcessed++;
        }
    }, 30);
};


