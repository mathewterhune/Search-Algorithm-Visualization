import React from "react";
import { EMPTY_NODE, VISITED_NODE, BOUNDARY_WALL, SOURCE_NODE, TARGET_NODE, PLACED_WALL, SOLUTION_PATH } from "../logic/nodeTypes";

const GridSquare = React.memo(({ value, onMouseDown, onMouseEnter }) => {
    const setColour = (value) => {
        switch (value) {
            case EMPTY_NODE:          // E
                return "bg-gray-500";
            case VISITED_NODE:        // L
                return "bg-gray-600";
            case BOUNDARY_WALL:       // X
                return "bg-red-500";
            case SOURCE_NODE:         // S
                return "bg-blue-500";
            case TARGET_NODE:         // T
                return "bg-yellow-500";
            case PLACED_WALL:         // P
                return "bg-purple-500";
            case SOLUTION_PATH:       // A
                return "bg-green-500";
            default:
                return "bg-gray-500";
        }
    };

    return (
        <div
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            className={`w-4 h-4 ${setColour(
                value
            )} cursor-pointer hover:brightness-125 select-none`}
        ></div>
    );
}); // ✅ THIS is the missing piece

export default GridSquare;
