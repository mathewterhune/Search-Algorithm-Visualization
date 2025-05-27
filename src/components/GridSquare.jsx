import { NODE_TYPES, NODE_COLOURS } from '../logic/nodeTypes';
import React from 'react';

const GridSquare = React.memo(({ value, onMouseDown, onMouseEnter }) => {
    const setColour = (value) => {
        switch (value) {
            case NODE_TYPES.EMPTY_NODE:          return NODE_COLOURS.EMPTY_NODE;
            case NODE_TYPES.VISITED_NODE:        return NODE_COLOURS.VISITED_NODE;
            case NODE_TYPES.BOUNDARY_WALL:       return NODE_COLOURS.BOUNDARY_WALL;
            case NODE_TYPES.SOURCE_NODE:         return NODE_COLOURS.SOURCE_NODE;
            case NODE_TYPES.TARGET_NODE:         return NODE_COLOURS.TARGET_NODE;
            case NODE_TYPES.PLACED_WALL:         return NODE_COLOURS.PLACED_WALL;
            case NODE_TYPES.SOLUTION_PATH:       return NODE_COLOURS.SOLUTION_PATH;
            default:                  return NODE_COLOURS.DEFAULT;
        }
    };

    return (
        <div
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            style={{ backgroundColor: setColour(value) }}
            className="w-4 h-4 cursor-pointer hover:brightness-150 select-none"
        ></div>
    );
});

export default GridSquare;
