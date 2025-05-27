

const Debug = ({ rows, cols, startPos, endPos, isRunning, placementMode }) => {
  return (
    <div className="p-4 text-sm bg-gray-100 text-black rounded shadow mt-4 w-fit mx-auto">
      <h3 className="font-bold mb-2 text-center">Debug Info</h3>
      <p><strong>Rows:</strong> {rows}</p>
      <p><strong>Cols:</strong> {cols}</p>
      <p><strong>Source:</strong> {startPos ? startPos.join(", ") : "None"}</p>
      <p><strong>Target:</strong> {endPos ? endPos.join(", ") : "None"}</p>
      <p><strong>Running:</strong> {isRunning.toString()}</p>
      <p><strong>Placement Mode:</strong> {placementMode}</p>
    </div>
  );
};

export default Debug;
