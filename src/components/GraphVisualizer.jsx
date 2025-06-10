import React, { useState, useEffect } from 'react';

import { GraphManager } from '../logic/GraphManager';
import { AlgorithmEngine } from '../logic/algorithmEngine';

const GraphVisualizer = () => {
    const ROWS = 20;
    const COLS = 30;


    const [GraphManager] = useState(() => new GraphManager(ROWS,COLS));

    // const [algorithmEngine, setAlgorithmEngine] = useState(null);
    // const [startPos, setStartPos] = useState([1,1]);
    // const [endPos, setEndPos] = useState([18,28]);

    const getNodeClass = (nodeType) => {
        switch (nodeType) {
            case NODE_TYPES.EMPTY: 
                return 'bg-white border-gray-300';
            case NODE_TYPES.WALL: 
                return 'bg-gray-800';
            case NODE_TYPES.START: 
                return 'bg-green-500';
            case NODE_TYPES.END:
                return 'bg-red-500';
            default: 
                return 'bg-white border-gray-300';
        }
    };  
    


    return (
        <div className='p-6 bg-gray-50 min-h-screen'>
            <div className='max-w-4xl mx-auto'>


                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Legend:</h3>
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-white border border-gray-300"></div>
                            <span>Empty</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-gray-800"></div>
                            <span>Wall</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default GraphVisualizer;