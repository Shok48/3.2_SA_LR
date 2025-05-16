import { useCallback, useEffect, useMemo, useState } from "react"
import IncListInput from "../../Components/IncListInput/IncListInput"
import { Graph, GraphValidationError } from "../../Utils/Graph"
import BasePage from "../BasePage/BasePage"
import type { Edge, Vertex } from "../../Types/GraphData.types"
import { Space, Table, Tag, Tooltip } from "antd"

interface IDataSource {
    key: string;
    vertex: string;
    [key: string]: string;
}

const HierarchyPage: React.FC = () => {
    const [graph, setGraph] = useState<Graph>(new Graph());
    
    const handleGraphChange = useCallback(
        (newGraph: Graph): void => {
            setGraph(newGraph);
        },
        []
    );

    const { newGraph: reassignGraph, vertexMapping } = useMemo(
        (): { newGraph: Graph | null, vertexMapping: Map<Vertex, Vertex> | null } => {
            const vertexMapping = new Map<Vertex, Vertex>();
            let currentNum = 0;

            try {
                graph.HL.map(
                    level => level.map(
                        vertex => {
                            vertexMapping.set(vertex, currentNum++);
                            return currentNum;
                        }
                    )
                )

                const newEdges: Edge[] = graph.edges.map(edge => ({
                    from: vertexMapping.get(edge.from)!,
                    to: vertexMapping.get(edge.to)!
                }));

                return {
                    newGraph: new Graph({ vertices: graph.vertices.map(v => v), edges: newEdges}),
                    vertexMapping
                };
            }
            catch (e) {
                if (e instanceof GraphValidationError) {
                    console.error(e.message)
                }
            }

            return {
                newGraph: new Graph(),
                vertexMapping
            }
        },
        [graph]
    )

    const graphColumns = useMemo(
        () => [
            {
                title: '',
                dataIndex: 'vertex',
                key: 'vertex',
                fixed: 'left' as const,
                width: 60,
            },
            ...graph.vertices.map((_, index) => ({
                title: `V${index + 1}`,
                dataIndex: `col${index}`,
                key: `col${index}`,
                width: 60,
                align: 'center' as const,
                render: (value: number, record: IDataSource) => (
                    <Tooltip title={value === 1 ? `Дуга: ${record.vertex} → V${index + 1}` : ''}>
                        <Tag color={value === 1 ? 'green' : 'default'}>{value}</Tag>
                    </Tooltip>
                )
            }))
        ],
        [graph]
    );

    const graphAdjMatrix = useMemo(
        () => graph.vertices.length !== 0 && graph.edges.length !== 0
        ? graph.asAdjMatrix.map((row, rowIndex) => ({
            key: `row-${rowIndex}`,
            vertex: `V${rowIndex + 1}`,
            ...Object.fromEntries(row.map((value, colIndex) => [`col${colIndex}`, value]))
        }))
        : [[]],
        [graph]
    )

    const reassignGraphColumns = useMemo(
        () => [
            {
                title: '',
                dataIndex:'vertex',
                key:'vertex',
                fixed: 'left' as const,
                width: 60,
            },
           ...reassignGraph!.vertices.map((_, index) => ({
                title: `V${index + 1} (V${vertexMapping!.get(index)! + 1})`,
                dataIndex: `col${index}`,
                key: `col${index}`,
                width: 60,
                align: 'center' as const,
                render: (value: number, record: IDataSource) => (
                    <Tooltip title={value === 1? `Дуга: ${record.vertex} → V${index + 1}` : ''}>
                        <Tag color={value === 1? 'green' : 'default'}>{value}</Tag>
                    </Tooltip>
                )
           }))
        ],
        [reassignGraph, vertexMapping]
    )

    const reassignGraphAdjMatrix = useMemo(
        () => reassignGraph!.vertices.length!== 0 && reassignGraph!.edges.length!== 0
       ? reassignGraph!.asAdjMatrix.map((row, rowIndex) => ({
            key: `row-${rowIndex}`,
            vertex: `V${rowIndex + 1}`,
           ...Object.fromEntries(row.map((value, colIndex) => [`col${colIndex}`, value]))
        }))
        : [[]],
        [reassignGraph]
    )

    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log("Значения графа: ", graph.asObject);
            if (graph.vertices.length !== 0 && graph.edges.length !== 0) console.log("HL: ", graph.HL);
            console.log("vertexMapping: ", vertexMapping);
        }
    }, [graph, vertexMapping]);

    return(
        <BasePage title="Выделение иерархических уровней">
            <Space direction="vertical">
                <IncListInput onGraphChange={handleGraphChange} />
                <Table columns={graphColumns} dataSource={graphAdjMatrix.length > 1 ? graphAdjMatrix as IDataSource[] : []} scroll={{ x: 'max-content'}} pagination={false} bordered />
                <Table columns={reassignGraphColumns} dataSource={reassignGraphAdjMatrix.length > 1 ? reassignGraphAdjMatrix as IDataSource[] : []} scroll={{ x: 'max-content'}} pagination={false} bordered />
            </Space>
            
        </BasePage>
    )
}

export default HierarchyPage;