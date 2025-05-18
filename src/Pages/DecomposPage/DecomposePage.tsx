import type React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Graph } from "../../Utils/Graph";
import BasePage from "../BasePage/BasePage";
import { Card, Flex, Space, Table, Tag, Typography } from "antd";
import { NodeIndexOutlined } from '@ant-design/icons'
import IncListInput from "../../Components/IncListInput/IncListInput";
import type { Vertex } from "../../Types/GraphData.types";

const { Title, Text } = Typography;

const DecomposePage: React.FC = () => {
    const [graph, setGraph] = useState<Graph>();
    const { subGraphs, links } = useMemo(() => {
        if (!graph) return { subGraphs: new Set<Graph>(), links: new Set<{ from: number, to: number }>() };
        return graph.decompose();
    }, [graph]);

    const dataSource = useMemo(
        () => [...subGraphs].map((subgraph, index) => ({
            subsystem: `S${index + 1}`,
            vertices: subgraph.vertices,
            lefInc: [...links].filter(edge => edge.to === index)
                // .map(edge => edge.to),
        })),
        [subGraphs, links]
    )

    useEffect(() => {
        console.log("Ребра графа: ", graph?.edges.map(edge => `V${edge.from + 1} → V${edge.to + 1}`).sort());
        console.log("Множество правых инцидентов графа: ", graph?.asRightIncList);
        console.log("Подграфы: ", subGraphs);
        console.log("Связи подграфов", links)    
    }, [graph, subGraphs, links])

    const renderIncList = useCallback((leftInc: { from: number, to: number }[]) => {
        return leftInc?.length > 0 ? (
            <Space>
                <Text>&#123;</Text>
                {
                    leftInc.sort((a, b) => a.from - b.from).map((inc, index) => (
                        <Flex align="center" gap='4px'>
                            <Tag color='red-inverse' style={{marginRight: 0}}>S{inc.from + 1}</Tag>
                            <Text>{index === leftInc.length - 1 ? '' : ';' }</Text>
                        </Flex>
                    ))
                }
                <Text style={{ margin: '0' }}>&#125;</Text>
                <Text style={{ margin: '0 4px' }}>→</Text>
                <Tag color='green-inverse'>S{leftInc[0].to + 1}</Tag>                      
            </Space>
        ) : <Text type='secondary'>Нет входящих рёбер</Text>
    }, [])

    const columns = [
        {
            title: '',
            dataIndex: 'subsystem',
            key: 'subsystem',
            render: (text: string) => <Tag color='blue-inverse'>{text}</Tag>
        },
        {
            title: 'Вершины',
            dataIndex: 'vertices',
            key: 'vertices',
            render: (vertices: Vertex[]) => {
                return vertices.map((node) => (<Tag key={node} color='green-inverse'>V{node + 1}</Tag>))
            }
        },
        {
            title: 'Левые инциденты',
            dataIndex: 'lefInc',
            key: 'lefInc',
            render: (leftInc: { from: number, to: number }[]) => renderIncList(leftInc)
        }
    ]

    return (
        <BasePage title="Топографическая декомпозиция">
            <Space direction="vertical">
                <IncListInput side="right" onGraphChange={setGraph} />
                <Card
                    title = {
                        <Space>
                            <NodeIndexOutlined style={{ fontSize: '24px', marginRight: '8px'}}/>
                            <Title level={4}>Левые инциденты подграфов</Title>
                        </Space>
                    }
                >
                    <Table
                        columns={columns}
                        dataSource={dataSource}
                        bordered
                        pagination={false}
                    />
                </Card>
            </Space>
        </BasePage>
    )
}

export default DecomposePage;