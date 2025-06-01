import { NODE_TYPES } from './constants.js';

/**
 * GraphManager is a class that only manages the graph structure as it stands.
 * 
 * It is responsible for:
 *      1. Initalizing the graph given a number of rows and columsn
 *      2. Setting the borders of the graph.
 *      3. Getting the neighbours of a node.
 *      4. Setting nodes to different types (wall, start, end, etc).
 *      5. Resetting the graph to its initial state.
 *      6. Cloning the graph manager to create a new instance with the same graph.
 *      7. Setting the source and sink nodes explicitly.
 * 
 * 
 *  The graph is represented as a 1D array (Uint8Array) where each index corresponds to a node in the graph.
 * 
 */
export class GraphManager {
    constructor(rows,cols) {
        this.rows = rows;
        this.cols = cols;
        this.graph = new Uint8Array(rows * cols); // Flattended array to represent the graph
        this.setBorders();
    }

    // CHECKERS 
    isValidNode(row,col) {return row >= 0 && row < this.rows && col >= 0 && col < this.cols;}
    
    // GETTERS
    getIndex(row,col) { return (row * this.cols + col);  }
    getNode(row,col) { return this.isValidNode(row,col) ? this.graph[this.getIndex(row,col)] : NODE_TYPES.WALL;}
    getGraph() { return this.graph; }


    /**
     * Get the valid neighbours of a node in the graph.
     * @param {*} row : the row of the node
     * @param {*} col : the column of the node
     * @returns {Array} : an array of valid neighbours, each represented as [row, col]. The neighbours of this node
     *  are the nodes that are directly adjacent to it (up, down, left, right) and are not walls.
     *  
     *  This agrid is a 1D array, so the neighbours are not calculated through using 2D cooridinates, rather using the formula
     *  index = (row * cols + col) to get the index of the node in the graph.
     */
    getNeighbours(row,col) {
        const neighbours = [];
        const dir = [[0,1],[1,0],[0,-1],[-1,0]];

        for (const [dr,dc] of dir) {
            const newRow = row + dr;
            const newCol = col + dc;
            // Check if that position in the array is in fact valid and not a wall
            if (this.isValidNode(newRow, newCol) && this.getNode(newRow, newCol) !== NODE_TYPES.WALL) {
                neighbours.push([newRow, newCol]);
            }
        }
        return neighbours;
    }

    // SETTERS
    /**
     * Set a node in the graph to a specific type.
     * @param {number} row : the row of the node
     * @param {number} col : the column of the node
     * @param {number} type : the type of the node (e.g. NODE_TYPES.WALL, NODE_TYPES.START, NODE_TYPES.END, etc)
     */
    setNode(row,col,type) {
        if (this.isValidNode(row,col)) {
            this.graph[this.getIndex(row,col)] = type;
        }
    }


    /**
     * Set the border of the graph to be walls 
     *  @param {number} rows: the row of the graph that is being set
     *  @param {number} cols: the column of the graph that is being set
     *  @param {number} type: the type of the node that is being set
     */
    setBorders() {
        console.log('Setting borders');
        let counter = 0;
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if(r ===0 || r === this.rows - 1 || c === 0 || c === this.cols - 1) {
                    counter++;
                    this.graph[this.getIndex(r,c)] = NODE_TYPES.WALL;
                }
            }
        }
        console.log(`Set ${counter} borders`);
    }

    setSource(row,col) {this.setNode(row,col,NODE_TYPES.START);}
    setSink(row,col) {this.setNode(row,col,NODE_TYPES.END);}

    // UTILITY
    /**
     * Reset the graph to its initial state, which is all nodes set to EMPTY.
     * It also sets the borders of the graph to be walls.
     */
    resetGraph() {
        this.graph.fill(NODE_TYPES.EMPTY);
        this.setBorders();
    }
    /**
     * Clone the current graph manager instance.
     * This creates a new instance with the same rows, cols, and graph data.
     * @returns {GraphManager} : a new instance of GraphManager with the same graph data.
     */
    clone () {
        const newManager = new GraphManager(this.rows, this.cols);
        newManager.graph = new Uint8Array(this.graph); // Create a copy of the graph
        return newManager;
    }
    /**
     * Print the graph to the console in a readable format.
     * Each node is represented by its type, and the output is formatted as a grid.
     */
    printGraph() {
        let output = '';
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                output += this.graph[this.getIndex(r,c)] + ' ';
            }
            output += '\n';
        }
        console.log(output);
    }

}