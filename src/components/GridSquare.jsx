import React from "react";

const GridSquare = React.memo(({ value, onMouseDown, onMouseEnter }) => {
    const setColour = (value) => {
        switch (value) {
            case "E":
                return "bg-gray-500";
            case "L":
                return "bg-gray-600";
            case "X":
                return "bg-red-500";
            case "S":
                return "bg-blue-500";
            case "T":
                return "bg-yellow-500";
            case "P":
                return "bg-purple-500";
            case "A":
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
