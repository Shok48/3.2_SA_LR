import { Graph, GraphArgumentError, GraphValidationError } from "./Graph";
import type { Edge, Vertex } from "../Types/GraphData.types";

describe("Graph", () => {
    const vertices: Vertex[] = [0, 1, 2];
    const edges: Edge[] = [
        { from: 0, to: 1 },
        { from: 1, to: 2 }
    ];

    it("создаёт граф с вершинами и рёбрами", () => {
        const graph = new Graph({ vertices, edges });
        expect(graph.vertices).toEqual(vertices);
        expect(graph.edges).toEqual(edges);
    });

    it("выбрасывает ошибку при некорректных вершинах", () => {
        // @ts-expect-error Deliberately passing a string instead of Vertex[] to test error handling
        expect(() => new Graph({ vertices: "not array", edges })).toThrow(GraphArgumentError);
    });

    it("выбрасывает ошибку при некорректных рёбрах", () => {
        // @ts-expect-error Deliberately passing a string instead of Vertex[] to test error handling
        expect(() => new Graph({ vertices, edges: "not array" })).toThrow(GraphArgumentError);
    });

    it("выбрасывает ошибку при ребре на несуществующую вершину", () => {
        const badEdges = [{ from: 0, to: 99 }];
        expect(() => new Graph({ vertices, edges: badEdges })).toThrow(GraphValidationError);
    });

    it("добавляет вершину", () => {
        const graph = new Graph({ vertices, edges });
        const newGraph = graph.withVertex(3);
        expect(newGraph.vertices).toContain(3);
        expect(newGraph.vertices.length).toBe(vertices.length + 1);
    });

    it("не добавляет существующую вершину", () => {
        const graph = new Graph({ vertices, edges });
        const newGraph = graph.withVertex(1);
        expect(newGraph).toBe(graph);
    });

    it("удаляет вершину и связанные рёбра", () => {
        const graph = new Graph({ vertices, edges });
        const newGraph = graph.withoutVertex(1);
        expect(newGraph.vertices).not.toContain(1);
        expect(newGraph.edges.length).toBe(0);
    });

    it("добавляет ребро", () => {
        const graph = new Graph({ vertices, edges });
        const newGraph = graph.withEdge({ from: 2, to: 0 });
        expect(newGraph.edges).toContainEqual({ from: 2, to: 0 });
    });

    it("не добавляет существующее ребро", () => {
        const graph = new Graph({ vertices, edges });
        const newGraph = graph.withEdge({ from: 0, to: 1 });
        expect(newGraph).toBe(graph);
    });

    it("выбрасывает ошибку при добавлении ребра с несуществующей вершиной", () => {
        const graph = new Graph({ vertices, edges });
        expect(() => graph.withEdge({ from: 0, to: 99 })).toThrow(GraphValidationError);
    });

    it("удаляет ребро", () => {
        const graph = new Graph({ vertices, edges });
        const newGraph = graph.withoutEdge({ from: 0, to: 1 });
        expect(newGraph.edges).not.toContainEqual({ from: 0, to: 1 });
    });

    it("не удаляет несуществующее ребро", () => {
        const graph = new Graph({ vertices, edges });
        const newGraph = graph.withoutEdge({ from: 2, to: 0 });
        expect(newGraph).toBe(graph);
    });

    it("преобразует в матрицу смежности", () => {
        const graph = new Graph({ vertices, edges });
        const matrix = graph.toAdjMatrix();
        expect(matrix).toEqual([
            [0, 1, 0],
            [0, 0, 1],
            [0, 0, 0]
        ]);
    });

    it("преобразует в матрицу инцидентности", () => {
        const graph = new Graph({ vertices, edges });
        const matrix = graph.toIncMatrix();
        expect(matrix).toEqual([
            [-1, 0],
            [1, -1],
            [0, 1]
        ]);
    });

    it("преобразует в список инцидентности", () => {
        const graph = new Graph({ vertices, edges });
        const incList = graph.toIncList();
        expect(incList).toEqual({
            0: [1],
            1: [2],
            2: []
        });
    });

    it("клонирует граф", () => {
        const graph = new Graph({ vertices, edges });
        const clone = graph.clone();
        expect(clone).not.toBe(graph);
        expect(clone.vertices).toEqual(graph.vertices);
        expect(clone.edges).toEqual(graph.edges);
    });

    it("сериализует и десериализует граф", () => {
        const graph = new Graph({ vertices, edges });
        const json = graph.toJSON();
        const restored = Graph.fromJSON(json);
        expect(restored.vertices).toEqual(graph.vertices);
        expect(restored.edges).toEqual(graph.edges);
    });

    it("выбрасывает ошибку при десериализации некорректного JSON", () => {
        expect(() => Graph.fromJSON("not a json")).toThrow(GraphArgumentError);
    });

    it("выбрасывает ошибку при десериализации некорректной структуры", () => {
        expect(() => Graph.fromJSON("{}")).toThrow(GraphArgumentError);
    });

    it("выделение иерархических уровней графа", () => {
        const vertices: Vertex[] = [0, 1, 2, 3, 4, 5, 6];
        const edges: Edge[] =[
            { from: 0, to: 1 },
            { from: 0, to: 2 },
            { from: 1, to: 3 },
            { from: 2, to: 3 },
            { from: 3, to: 4 },
            { from: 4, to: 5 },
            { from: 5, to: 6 },
        ]
        const graph = new Graph({ vertices, edges });
        const HL = graph.getHierarchyLevels();
        const expected = [
            { level: [0] },
            { level: [1, 2] },
            { level: [3] },
            { level: [4] },
            { level: [5] },
            { level: [6] }
        ];
        expect(HL).toEqual(expected);
    })
});