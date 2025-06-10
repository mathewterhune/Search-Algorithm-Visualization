export const NODE_TYPES = {
    EMPTY: 0,
    WALL: 1,
    START: 2,
    END: 3,
    VISITED: 4,
    PATH: 5,
    CURRENT: 6,
}

export const ALGORITHMS = {
    BFS: 'bfs',
    DFS: 'dfs',
    DIJKSTRA: 'dijkstra',
    A_STAR: 'a_star',
    GREEDY_BFS: 'greedy_bfs',
}

export const DRAW_MODES = {
    WALL: 'wall',
    START: 'start',
    END: 'end',
}

export default { NODE_TYPES, ALGORITHMS, DRAW_MODES};