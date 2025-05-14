import { Space, Table, Tabs, Tag, Tooltip, type TabsProps } from "antd"
import BasePage from "../BasePage/BasePage"
import { useEffect, useMemo, useState } from "react"
import { Graph, GraphValidationError } from "../../Utils/Graph"
import IncListInput from "../../Components/IncListInput/IncListInput"

interface IDataSource {
    key: string;
    vertex: string;
    [key: string]: string;
}

const ConverterPage: React.FC = () => {
    const [graph, setGraph] = useState<Graph>(new Graph({vertices: [], edges: []}));

    const adjMatrix = useMemo(() => {
        try {
            return graph.toAdjMatrix();
        } catch (e) {
            if (e instanceof GraphValidationError){
                console.error(e.message);
                return [[]];
            }
        }
    }, [graph]);

    const incMatrix = useMemo(() => {
        try {
            return graph.toIncMatrix();
        } catch (e) {
            if (e instanceof GraphValidationError){
                console.error(e.message);
                return [[]];
            }
        }
    }, [graph]);

    function handleGraphChange(newGraph: Graph): void {
        setGraph(newGraph);
    }

    useEffect(() => console.log('Новые значения графа: ', graph.toObject()), [graph]);

    const abjColumns = useMemo(() => [
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
    ], [graph])

    const incColumns = useMemo(() => [
        {
            title: '',
            dataIndex: 'vertex',
            key: 'vertex',
            fixed: 'left' as const,
            width: 60
        },
        ...graph.edges.map((_, index) => ({
            title: `E${index + 1}`,
            dataIndex: `col${index}`,
            key: `col${index}`,
            width: 60,
            align: 'center' as const,
            render: (value: number) => (
                <Tooltip title={value === -1 ? `Начало дуги: e${index + 1}` : value === 1 ? `Конец дуги: e${index + 1}` : ''}>
                    <Tag color={value === -1 ? 'red' : value === 1 ? 'green' : 'default'}>{value}</Tag>
                </Tooltip>
            )
        }))
    ], [graph])

    const abjDataSource = useMemo(() => adjMatrix!.map((row, rowIndex) => ({
        key: `row-${rowIndex}`,
        vertex: `V${rowIndex + 1}`,
        ...Object.fromEntries(row.map((value, colIndex) => [`col${colIndex}`, value]))
    })), [adjMatrix])

    const incDataSource = useMemo(() => incMatrix!.map((row, rowIndex) => ({
        key: `row-${rowIndex}`,
        vertex: `V${rowIndex + 1}`,
        ...Object.fromEntries(row.map((value, colIndex) => [`col${colIndex}`, value]))
    })), [incMatrix])

    const matrixTabs: TabsProps['items'] = [
        {
            key: 'abj',
            label: 'Матрица смежности',
            children: (
                <Table columns={abjColumns} dataSource={abjDataSource} scroll={{ x: 'max-content'}} pagination={false} bordered/>
            )
        },
        {
            key: 'inc',
            label: 'Матрица инциденций',
            children: (
                <Table columns={incColumns} dataSource={incDataSource} scroll={{ x: 'max-content'}} pagination={false} bordered/>
            )
        }
    ]

    return (
        <BasePage
            title="Конвертер левых инцидентов в матрицы смежности и инцидентности"
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <IncListInput onGraphChange={handleGraphChange}/>
                <Tabs
                    defaultActiveKey="1"
                    items={matrixTabs}
                    style={{ background: '#fff', padding: '10px', borderRadius: '8px'}}
                />
            </Space>
        </BasePage>
    )
}

export default ConverterPage;