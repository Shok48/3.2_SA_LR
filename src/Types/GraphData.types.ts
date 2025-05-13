export type Vertex = number;

export type Edge = {
    from: Vertex;
    to: Vertex;
    weight?: number;
}

export interface GraphData {
    vertices: Vertex[];
    edges: Edge[];
}

export interface GraphActions {
    addVertex: (vertex: Vertex) => void;
    addEdge: (edge: Edge) => void;
    removeVertex: (vertex: Vertex) => void;
    removeEdge: (edge: Edge) => void;
    getVertices: () => Vertex[];
    getEdges: () => Edge[];
    getWeight: (edge: Edge) => number | undefined;
    changeEdge: (oldEdge: Edge, newEdge: Edge) => void;
}

