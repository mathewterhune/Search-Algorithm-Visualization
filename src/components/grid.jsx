
const create2DArray = (rows, cols, defaultValue) => {
    return Array.from( { length: rows }, () => Array.from ( { length : cols }, () => defaultValue));
}

const Grid = ( { rows = 3, cols = 4} ) => {
    return (
        <div>

        </div>
    );

}

export default Grid;