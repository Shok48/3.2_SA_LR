import { Card, Space, Table, Tag, Typography, type TableColumnProps } from "antd"
import BasePage from "../BasePage/BasePage"
import DistanceMatrixInput from "../../Components/DistanceMatrixInput/DistanceMatrixInput";
import { useEffect, useMemo, useState } from "react";
import { Graph } from "../../Utils/Graph";

const { Title } = Typography;

interface IDataSource {
    key: string | number;
    vertex: string;
    [key: string]: string | number | React.ReactNode; 
}

const ShortestPathsPage: React.FC = () => {
    const [graph, setGraph] = useState<Graph>(new Graph());

    useEffect(() => console.log('Данные графа: ', graph.asObject), [graph]);

    const shortestPaths = useMemo(() => graph.johnson(), [graph]);

    const columns = useMemo<TableColumnProps[]>(() => {
        if (!graph?.vertices) return []

        return [
            {
                title: 'Вершины',
                dataIndex: 'vertex',
                key: 'vertex',
                width: 100,
                fixed: 'left',
                align: 'center' as const,
                render: (_: unknown, __: unknown, index: number) => `V${index + 1}`,
            },
            ...graph.vertices.map((vertex, index) => ({
                title: `V${vertex + 1}`,
                dataIndex: `col${index}`,
                key: `col${index}`,
                width: 80,
                align: 'center' as const,
            })),
        ];
    }, [graph])

    const dataSource = useMemo<IDataSource[]>(() => {
        if (!graph?.vertices) return [];

        return graph.vertices.map((vertex, index) => {
            const distances = shortestPaths[vertex] || {};
            const row: IDataSource = {
                key: vertex,
                vertex: `V${index + 1}`,
            };

            graph.vertices.forEach((to, idx) => {
                const distance = distances[to];
                row[`col${idx}`] = distance === Infinity 
                    ? <Tag>∞</Tag>
                    : index === idx 
                    ? <Tag>0</Tag>
                    : <Tag color="green">{distance}</Tag>; 
            });

            return row;
        });
    }, [graph, shortestPaths]);

    return (
        <BasePage title="Поиск кратчайших путей">
            <Space direction="vertical">
                <DistanceMatrixInput onGraphChange={setGraph} />
                <Card
                    title={
                        <Title level={4}>Матрица кратчайших путей, полученная алгоритмом Джонсона</Title>
                    }
                >
                    <Table
                        columns={columns}
                        dataSource={dataSource}
                        scroll={{ x: 'max-content' }}
                        pagination={false}
                        bordered
                    />
                </Card>
            </Space>
        </BasePage>
    )
}

export default ShortestPathsPage;