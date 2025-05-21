export const BFS = (grid,adjacencyList,start,end,handleVisit,handlePathCompletion) => {
  // Initialize
  const queue = [start];
  const visited = new Set();
  const parent = {};

  // Add the start node to the queue
  visited.add(start);

  let step = 0;

  // BFS CONTROL LOOP - Set @ 30ms interval, which controls the speed of the animation
  const interval = setInterval(() => {
    // Check if the queue is empty
    if (queue.length === 0) {
      clearInterval(interval); // Stop the interval if no path is found
      handlePathCompletion(null); // no path found
      return;
    }

    // Dequeue the next node
    const current = queue.shift();

    // Handle visiting the next node
    handleVisit(current);

    // Check if we reached the end node
    if (current === end) {
      clearInterval(interval); // Stop the interval from running if we found the node

      // Reconstruct path
      const path = [];
      let curr = end;
      while (curr !== start) {
        path.unshift(curr);
        curr = parent[curr];
      }
      path.unshift(start);

      handlePathCompletion(path); // Function to animate the path
      return;
    }

    // Reaching here implies we haven't reached the end node yet
    for (const neighbor of adjacencyList[current]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
        parent[neighbor] = current;
      }
    }

    step++;
  }, 30); // 30ms delay between steps
};

export const DFS = (grid, adjList, source, sink, handleVisit, handlePathCompletion) => {
    if (source === sink) {
        handlePathCompletion([source]);
        return;
    }

    const stack = [source];
    const visited = new Set([source]); // mark source as visited upfront
    const parent = {};

    handleVisit(source); // visit source

    const interval = setInterval(() => {
        if (stack.length === 0) {
            clearInterval(interval);
            handlePathCompletion(null); // no path found
            return;
        }

        const current = stack.pop();

        if (current === sink) {
            clearInterval(interval);

            const path = [];
            let node = sink;

            while (node !== source) {
                path.unshift(node);
                node = parent[node];
            }
            path.unshift(source);

            handlePathCompletion(path);
            return;
        }

        for (const neighbor of adjList[current] || []) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                parent[neighbor] = current;
                stack.push(neighbor);
                handleVisit(neighbor); // visit only newly discovered nodes
            }
        }
    }, 30);
};



