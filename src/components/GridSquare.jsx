const GridSquare = React.memo(({ value, onMouseDown, onMouseEnter }) => {
    const setColour = (value) => {
        switch (value) {
            case EMPTY_NODE:          return COLOUR_EMPTY_NODE;
            case VISITED_NODE:        return COLOUR_VISITED_NODE;
            case BOUNDARY_WALL:       return COLOUR_BOUNDARY_WALL;
            case SOURCE_NODE:         return COLOUR_SOURCE_NODE;
            case TARGET_NODE:         return COLOUR_TARGET_NODE;
            case PLACED_WALL:         return COLOUR_PLACED_WALL;
            case SOLUTION_PATH:       return COLOUR_SOLUTION_PATH;
            default:                  return COLOUR_DEFAULT;
        }
    };

    return (
        <div
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
            style={{ backgroundColor: setColour(value) }}
            className="w-4 h-4 cursor-pointer hover:brightness-125 select-none"
        ></div>
    );
});
