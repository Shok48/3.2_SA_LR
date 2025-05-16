import type { Edge, IGraphData, Vertex } from "../Types/GraphData.types";

/**
 * Ошибка валидации графа.
 * Возникает, если структура графа нарушена (например, ребро ссылается на несуществующую вершину).
 */
export class GraphValidationError extends Error {
    /**
     * @param {string} message Сообщение об ошибке
     */
    constructor(message: string) {
        super(message);
        this.name = "GraphValidationError";
    }
}

/**
 * Ошибка аргументов графа.
 * Возникает при передаче некорректных аргументов в методы работы с графом.
 */
export class GraphArgumentError extends Error {
    /**
     * @param {string} message Сообщение об ошибке
     */
    constructor(message: string) {
        super(message);
        this.name = "GraphArgumentError";
    }
}

/**
 * Класс неизменяемого ориентированного графа.
 * Позволяет создавать граф, преобразовывать его между различными представлениями,
 * а также добавлять и удалять вершины и рёбра.
 */
export class Graph {
    /**
     * @group Properties
     * Список вершин графа.
     */
    private readonly _vertices: ReadonlyArray<Vertex>;
    
    /**
     * @group Properties
     * Список рёбер графа.
     */
    private readonly _edges: ReadonlyArray<Edge>;

    /**
     * @group Properties
     * Возвращает список вершин графа.
     */
    get vertices(): ReadonlyArray<Vertex> { return this._vertices; }

    /**
     * @group Properties
     * Возвращает список рёбер графа.
     */
    get edges(): ReadonlyArray<Edge> { return this._edges; }

    /**
     * @group Constructors
     * Создаёт новый экземпляр графа.
     * @param {Partial<IGraphData>} [params] Объект с вершинами и рёбрами графа
     * @throws {GraphArgumentError} Если вершины или рёбра заданы неверно
     * @throws {GraphValidationError} Если рёбра ссылаются на несуществующие вершины
     */
    public constructor({ vertices = [], edges = [] }: Partial<IGraphData> = {}) {
        if (!Array.isArray(vertices)) {
            throw new GraphArgumentError("Вершины должны быть массивом");
        }
        if (!Array.isArray(edges)) {
            throw new GraphArgumentError("Рёбра должны быть массивом");
        }
        this._vertices = Object.freeze([...vertices]);
        this._edges = Object.freeze([...edges]);
        this.validateGraph();
    }

    /**
     * @group Validation
     * Проверяет, что вершина корректна (является числом).
     * @param vertex Вершина для проверки
     * @throws {GraphArgumentError} Если вершина некорректна
     */
    private static validateVertex(vertex: Vertex): void {
        if (typeof vertex !== 'number') {
            throw new GraphArgumentError("Вершина должна быть числом");
        }
    }

    /**
     * @group Validation
     * Проверяет, что ребро корректно (является объектом с числовыми from и to).
     * @param edge Ребро для проверки
     * @throws {GraphArgumentError} Если ребро или его вершины некорректны
     */
    private static validateEdge(edge: Edge): void {
        if (!edge || typeof edge !== 'object') {
            throw new GraphArgumentError("Ребро должно быть объектом");
        }
        if (typeof edge.from !== 'number' || typeof edge.to !== 'number') {
            throw new GraphArgumentError("Вершины ребра должны быть числами");
        }
    }

    /**
     * @group Validation
     * Проверяет, что вершины ребра существуют в графе.
     * @param edge Ребро для проверки
     * @throws {GraphValidationError} Если вершины ребра отсутствуют в графе
     */
    private validateEdgeVertices(edge: Edge): void {
        if (!this._vertices.includes(edge.from)) {
            throw new GraphValidationError(`Вершина ${edge.from} не найдена в графе`);
        }
        if (!this._vertices.includes(edge.to)) {
            throw new GraphValidationError(`Вершина ${edge.to} не найдена в графе`);
        }
    }

    /**
     * @group Validation
     * Проверяет, что все рёбра ссылаются на существующие вершины.
     * @private
     * @throws {GraphValidationError} Если найдено некорректное ребро
     */
    private validateGraph(): void {
        const vertexSet = new Set(this._vertices);
        for (const { from, to } of this._edges) {
            if (!vertexSet.has(from)) {
                throw new GraphValidationError(`Вершина ${from} не найдена в графе`);
            }
            if (!vertexSet.has(to)) {
                throw new GraphValidationError(`Вершина ${to} не найдена в графе`);
            }
        }
    }

    /**
     * @group Factory Methods
     * Создаёт граф из матрицы смежности.
     * @param {number[][]} matrix Матрица смежности
     * @returns {Graph} Новый граф
     * @throws {GraphArgumentError} Если матрица некорректна
     */
    static fromAdjMatrix(matrix: number[][]): Graph {
        if (!Array.isArray(matrix)) {
            throw new GraphArgumentError("Матрица должна быть не-null массивом");
        }
        if (matrix.length > 0 && !matrix.every(row => row.length === matrix.length)) {
            throw new GraphArgumentError("Матрица смежности должна быть квадратной");
        }
        const vertices: Vertex[] = matrix.map((_, i) => i);
        const edges: Edge[] = matrix.flatMap((row, i) =>
            row.flatMap((val, j) =>
                val !== 0 ? [{ from: i, to: j }] : []
            )
        );
        return new Graph({ vertices, edges });
    }

    /**
     * @group Factory Methods
     * Создаёт граф из списка инцидентности.
     * @param {Record<Vertex, number[]>} list Список инцидентности
     * @param {"left"|"right"} [side="left"] Сторона (откуда-куда)
     * @returns {Graph} Новый граф
     * @throws {GraphArgumentError} Если список или сторона некорректны
     */
    static fromIncList(list: Record<Vertex, number[]>, side: "left" | "right" = "left"): Graph {
        if (!list || typeof list !== 'object') {
            throw new GraphArgumentError("Список инцидентности должен быть объектом");
        }
        if (side !== 'left' && side !== 'right') {
            throw new GraphArgumentError("Сторона должна быть 'left' или 'right'");
        }
        const vertices: Vertex[] = Object.keys(list).map(Number);
        const edges = Object.entries(list).flatMap(([key, values]) => {
            if (!Array.isArray(values)) {
                throw new GraphArgumentError(`Значения для вершины ${key} должны быть массивом`);
            }
            return values.map(value => {
                if (typeof value !== 'number') {
                    throw new GraphArgumentError(`Ссылка на вершину должна быть числом, получено ${value}`);
                }
                return side === 'left'
                    ? { from: +key, to: +value }
                    : { from: +value, to: +key };
            });
        });
        return new Graph({ vertices, edges });
    }

    /**
     * @group Factory Methods
     * Десериализует граф из строки JSON.
     * @param {string} json Строка JSON
     * @returns {Graph} Новый граф
     * @throws {GraphArgumentError} Если формат данных некорректен
     */
    static fromJSON(json: string): Graph {
        let data: IGraphData;
        try {
            data = JSON.parse(json);
        } catch (e) {
            throw new GraphArgumentError("Ошибка парсинга JSON: " + (e instanceof Error ? e.message : String(e)));
        }
        if (
            !data ||
            !Array.isArray(data.vertices) ||
            !Array.isArray(data.edges)
        ) {
            throw new GraphArgumentError("Некорректный формат данных графа");
        }
        return new Graph({
            vertices: data.vertices,
            edges: data.edges
        });
    }

    /**
     * @group Mutation Methods
     * Возвращает новый граф с добавленной вершиной.
     * @param {Vertex} vertex Вершина для добавления
     * @returns {Graph} Новый граф
     * @throws {GraphArgumentError} Если вершина некорректна
     */
    withVertex(vertex: Vertex): Graph {
        Graph.validateVertex(vertex);
        if (this._vertices.includes(vertex)) {
            return this;
        }
        return new Graph({
            vertices: [...this._vertices, vertex],
            edges: [...this._edges]
        });
    }

    /**
     * @group Mutation Methods
     * Возвращает новый граф без указанной вершины и всех инцидентных ей рёбра.
     * @param {Vertex} vertex Вершина для удаления
     * @returns {Graph} Новый граф
     * @throws {GraphArgumentError} Если вершина некорректна
     */
    withoutVertex(vertex: Vertex): Graph {
        Graph.validateVertex(vertex);
        if (!this._vertices.includes(vertex)) {
            return this;
        }
        const newVertices = this._vertices.filter(v => v !== vertex);
        const newEdges = this._edges.filter(e => e.from !== vertex && e.to !== vertex);
        return new Graph({
            vertices: newVertices,
            edges: newEdges
        });
    }

    /**
     * @group Mutation Methods
     * Возвращает новый граф с добавленным рёбром.
     * @param {Edge} edge Ребро для добавления
     * @returns {Graph} Новый граф
     * @throws {GraphArgumentError} Если ребро или его вершины некорректны
     * @throws {GraphValidationError} Если вершины ребра отсутствуют в графе
     */
    withEdge(edge: Edge): Graph {
        Graph.validateEdge(edge);
        this.validateEdgeVertices(edge);
        if (this._edges.some(e => e.from === edge.from && e.to === edge.to)) {
            return this;
        }
        return new Graph({
            vertices: [...this._vertices],
            edges: [...this._edges, edge]
        });
    }

    /**
     * @group Mutation Methods
     * Возвращает новый граф без указанного ребра.
     * @param {Edge} edge Ребро для удаления
     * @returns {Graph} Новый граф
     * @throws {GraphArgumentError} Если ребро или его вершины некорректны
     * @throws {GraphValidationError} Если вершины ребра отсутствуют в графе
     */
    withoutEdge(edge: Edge): Graph {
        Graph.validateEdge(edge);
        this.validateEdgeVertices(edge);
        if (!this._edges.some(e => e.from === edge.from && e.to === edge.to)) {
            return this;
        }
        return new Graph({
            vertices: [...this._vertices],
            edges: this._edges.filter(e => e.from !== edge.from || e.to !== edge.to)
        });
    }

    /**
     * @group Conversion Methods
     * Преобразует граф в матрицу смежности.
     * @returns {number[][]} Матрица смежности
     * @throws {GraphValidationError} Если граф пустой
     */
    get asAdjMatrix(): number[][] {
        if (this._vertices.length === 0) {
            throw new GraphValidationError("Невозможно создать матрицу для пустого графа");
        }
        const matrix = Array.from({ length: this._vertices.length },
            () => Array(this._vertices.length).fill(0));
        for (const { from, to } of this._edges) {
            const sourceIndex = this._vertices.indexOf(from);
            const targetIndex = this._vertices.indexOf(to);
            if (sourceIndex === -1 || targetIndex === -1) continue;
            matrix[sourceIndex][targetIndex] = 1;
        }
        return matrix;
    }

    /**
     * @group Conversion Methods
     * Преобразует граф в матрицу инцидентности.
     * @returns {number[][]} Матрица инцидентности
     * @throws {GraphValidationError} Если граф пустой
     */
    get asIncMatrix(): number[][] {
        if (this._vertices.length === 0) {
            throw new GraphValidationError("Невозможно создать матрицу для пустого графа");
        }
        if (this._edges.length === 0) {
            return Array.from({ length: this._vertices.length }, () => []);
        }
        const matrix = Array.from({ length: this._vertices.length },
            () => Array(this._edges.length).fill(0));
        this._edges.forEach(({ from, to }, index) => {
            const sourceIndex = this._vertices.indexOf(from);
            const targetIndex = this._vertices.indexOf(to);
            if (sourceIndex === -1 || targetIndex === -1) return;
            matrix[sourceIndex][index] = -1;
            matrix[targetIndex][index] = 1;
        });
        return matrix;
    }

    /**
     * @group Conversion Methods
     * Возвращает оба списка инцидентности: по исходящим и входящим рёбрам.
     * @returns Объект с leftInc и rightInc.
     */
    get asIncList(): { leftInc: Record<Vertex, Vertex[]>, rightInc: Record<Vertex, Vertex[]> } {
        const leftInc: Record<Vertex, Vertex[]> = {};
        const rightInc: Record<Vertex, Vertex[]> = {};
        
        this._vertices.forEach(vertex => {
            leftInc[vertex] = [];
            rightInc[vertex] = [];
        });
    
        this._edges.forEach(({ from, to }) => {
            leftInc[from].push(to);
            rightInc[to].push(from);
        });
    
        return { leftInc, rightInc };
    }

    /**
     * @group Conversion Methods
     * Возвращает список инцидентности по исходящим рёбрам.
     */
    get asLeftIncList(): Record<Vertex, Vertex[]> { return this.asIncList.leftInc };

    /**
     * @group Conversion Methods
     * Возвращает список инцидентности по входящим рёбрам.
     */
    get asRightIncList(): Record<Vertex, Vertex[]> { return this.asIncList.rightInc };

    /**
     * @group Conversion Methods
     * Преобразует граф в список смежности.
     */
    get asAdjList(): Record<Vertex, { target: Vertex, weight?: number }[]> {
        const adjList: Record<Vertex, { target: Vertex, weight?: number }[]> = {};
        this._vertices.forEach(vertex => adjList[vertex] = []);
        this._edges.forEach(({ from, to, weight }) => adjList[from].push({ target: to, weight }));
        return adjList;
    }

    /**
     * @group Conversion Methods
     * Преобразует граф в объект, соответствующий интерфейсу IGraphData.
     * Возвращает новый объект с массивами вершин и рёбрами, пригодный для сериализации или передачи.
     * @returns {IGraphData} Объект с вершинами и рёбрами графа
     */
    get asObject(): IGraphData {
        return {
            vertices: [...this._vertices],
            edges: [...this._edges]
        };
    }

    /**
     * @group Conversion Methods
     * Сериализует граф в строку JSON.
     * @returns {string} Строка JSON с вершинами и рёбрами графа
     */
    get asJSON(): string {
        return JSON.stringify(this.asObject);
    }

    /**
     * @group Utility Methods
     * Создаёт глубокую копию графа.
     * @returns {Graph} Копия графа
     */
    clone(): Graph {
        return new Graph({
            vertices: [...this._vertices],
            edges: [...this._edges]
        });
    }

    /**
     * @group Graph Analysis
     * Возвращает иерархические уровни графа.
     * Использует алгоритм Кана для топологической сортировки:
     * - Считает входящие степени для всех вершин.
     * - На каждом шаге выбирает вершины с нулевой входящей степенью (текущий уровень).
     * - Удаляет их и уменьшает входящие степени у смежных вершин.
     * Если после завершения остались вершины с ненулевой входящей степенью — граф содержит цикл.
     * @throws {GraphValidationError} Если граф пустой или содержит цикл
     */
    get HL(): number[][] {
        if (this._vertices.length === 0) {
            throw new GraphValidationError("Невозможно выделить иерархические уровни из пустого графа");
        }

        // Считаем входящие степени для всех вершин
        const inDegree = new Map<Vertex, number>();
        this._vertices.forEach(v => inDegree.set(v, 0));
        this._edges.forEach(({ to }) => {
            inDegree.set(to, (inDegree.get(to) ?? 0) + 1);
        });

        const HL: number[][] = [];
        const verticesLeft = new Set(this._vertices);

        while (verticesLeft.size > 0) {
            // Находим вершины с нулевой входящей степенью
            const currentLevel: number[] = [];
            for (const v of verticesLeft) {
                if (inDegree.get(v) === 0) {
                    currentLevel.push(v);
                }
            }

            if (currentLevel.length === 0) {
                throw new GraphValidationError("Граф содержит цикл, иерархические уровни не могут быть определены");
            }

            HL.push(currentLevel);

            // Удаляем вершины текущего уровня и обновляем входящие степени
            for (const v of currentLevel) {
                verticesLeft.delete(v);
                this._edges.forEach(({ from, to }) => {
                    if (from === v && verticesLeft.has(to)) {
                        inDegree.set(to, (inDegree.get(to) ?? 1) - 1);
                    }
                });
            }
        }

        return HL;
    }
}