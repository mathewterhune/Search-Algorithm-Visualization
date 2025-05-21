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
    if (source === sink) {
        handlePathCompletion([source]);
        return;
    }

    const stack = [source];
    const visited = new Set([source]); // mark source as visited upfront
    const parent = {};
    let foundPath = false;

    handleVisit(source); // visit source

    const interval = setInterval(() => {
        if (stack.length === 0 || foundPath) {
            clearInterval(interval);
            if (!foundPath) {
                handlePathCompletion(null); // no path found
            }
            return;
        }

        // Process multiple nodes per interval to reduce stuttering
        const nodesToProcess = Math.min(5, stack.length);
        
        for (let i = 0; i < nodesToProcess && !foundPath && stack.length > 0; i++) {
            const current = stack.pop();

            if (current === sink) {
                foundPath = true;
                
                const path = [];
                let node = sink;

                while (node !== source) {
                    path.unshift(node);
                    node = parent[node];
                }
                path.unshift(source);

                clearInterval(interval);
                handlePathCompletion(path);
                return;
            }

            // Get neighbors and process them
            const neighbors = adjList[current] || [];
            
            // Process in reverse order for DFS to maintain expected behavior
            for (let j = neighbors.length - 1; j >= 0; j--) {
                const neighbor = neighbors[j];
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    parent[neighbor] = current;
                    stack.push(neighbor);
                    handleVisit(neighbor);
                }
            }
        }
    }, 30);
};