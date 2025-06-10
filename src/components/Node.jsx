import React from 'react';
import { NODE_TYPES } from '../logic/constants.js';

const Node = React.memo(({ type, onClick, onMouseEnter, onMouseDown }) => {
  const getClassName = () => {
    const base = "w-4 h-4 border border-gray-300 transition-colors duration-75";
    switch (type) {
      case NODE_TYPES.EMPTY: return `${base} bg-white hover:bg-gray-100`;
      case NODE_TYPES.WALL: return `${base} bg-gray-800`;
      case NODE_TYPES.START: return `${base} bg-green-500`;
      case NODE_TYPES.END: return `${base} bg-red-500`;
      case NODE_TYPES.VISITED: return `${base} bg-blue-200`;
      case NODE_TYPES.PATH: return `${base} bg-yellow-400`;
      case NODE_TYPES.CURRENT: return `${base} bg-purple-500`;
      default: return `${base} bg-white`;
    }
  };

  return (
    <div
      className={getClassName()}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseDown={onMouseDown}
    />
  );
});

export default Node;