import { NODE_TYPES } from './constants.js';


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
    setNode(row,col,type) {
        if (this.isValidNode(row,col)) {
            this.graph[this.getIndex(row,col)] = type;
        }
    }
    setBorders() {
        console.error('Setting Borders');
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if(r ===0 || r === this.rows - 1 || c === 0 || c === this.cols - 1) {
                    this.graph[this.getIndex(r,c)] = NODE_TYPES.WALL;
                }
            }
        }
    }

    setSource(row,col) {this.setNode(row,col,NODE_TYPES.START);}
    setSink(row,col) {this.setNode(row,col,NODE_TYPES.END);}

    // UTILITY
    resetGraph() {
        this.graph.fill(NODE_TYPES.EMPTY);
        this.setBorders();
    }
    clone () {
        const newManager = new GraphManager(this.rows, this.cols);
        newManager.graph = new Uint8Array(this.graph); // Create a copy of the graph
        return newManager;
    }
    
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