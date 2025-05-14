export type Vertex = number;

export type Edge = {
    readonly from: Vertex;
    readonly to: Vertex;
    readonly weight?: number;
}

export interface IGraphData {
    vertices: Vertex[];
    edges: Edge[];
}
