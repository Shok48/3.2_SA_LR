import { useCallback, useEffect, useMemo, useState } from "react";
import { Graph } from "../../Utils/Graph";
import type { Vertex } from "../../Types/GraphData.types";
import { Button, Card, Dropdown, Flex, message, Popconfirm, Space, Splitter, Typography, type MenuProps } from "antd";
import { DeleteOutlined, DownloadOutlined, DownOutlined, UploadOutlined, PlusOutlined } from "@ant-design/icons"
import FieldManager from "./FieldManager";

const { Title, Text } = Typography;

interface IIncListInputProps {
    onGraphChange: (newGraph: Graph) => void,
    side?: 'right' | 'left',
}

const IncListInput: React.FC<IIncListInputProps> = ({ onGraphChange, side = 'left'}: IIncListInputProps) => {
    const [incList, setIncList] = useState<Record<Vertex, Vertex[]>>({
        0: [1, 2],
        1: [2],
        2: []
    });

    const fieldEntries = useMemo(() => 
        Object.entries(incList), 
        [incList]
    );
    
    const graph = useMemo(() => Graph.fromIncList(incList, side), [incList, side]);

    useEffect(() => onGraphChange(graph), [graph, onGraphChange]);

    const handleAddVertex = useCallback(() => {
        setIncList(prev => ({ ...prev, [Object.keys(prev).length]: []}))
    }, [])

    const handleRemoveVertex = useCallback((vertex: Vertex) => {
        setIncList(prev => (
            Object.fromEntries(
                Object.entries(prev)
                    .filter(([key]) => Number(key) !== vertex)
                    .map(([, value], index) => [
                        index,
                        value.filter(v => v !== vertex).map(v => v > vertex? v - 1 : v)
                    ])
            ) as Record<Vertex, Vertex[]>
        ))
    }, [])

    const handleAddNeighbor = useCallback((vertex: Vertex) => {
        setIncList(prev => ({ ...prev, [vertex]: [...prev[vertex], Number(Object.keys(prev)[0])] }))
    }, [])

    const handleRemoveNeighbor = useCallback((vertex: Vertex, neighvor: Vertex) => {
        setIncList(prev => ({...prev, [vertex]: prev[vertex].filter(v => v !== neighvor)}))
    }, [])

    const handleChangeNeighbor = useCallback((vertex: Vertex, neighvor: Vertex, newNeighbor: Vertex) => {
        setIncList(prev => ({...prev, [vertex]: prev[vertex].map((v, id) => id === neighvor ? newNeighbor : v)}))
    }, [])

    const handleClearIncList = useCallback(() => {
        setIncList({ 0: [] })
    }, [])

    const handleLoadFromJson = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const data = JSON.parse(content) as Record<number, number[]>;

                if (data && typeof data === 'object' && !Array.isArray(data)) {
                    setIncList(data);
                    message.success('Множество успешно загружено из файла');
                } else {
                    message.error('Файл не содержит корректных данных множества')
                }
            } catch (error) { 
                message.error('Ошибка чтения файла');
                console.error(error);
            }
        }

        reader.readAsText(file);
        event.target.value = '';
    }, []);

    const handleSaveToJson = useCallback(() => {
        const data: Record<number, number[]> = incList;
        const json = JSON.stringify(data, null, 2);

        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `graph_inclist_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        message.success('Множество сохранено в файл')
    }, [incList]);

    const actionItems: MenuProps['items'] = useMemo(() => [
        {
            key: 'load',
            label: (
                <Flex justify='space-between' gap={10}>
                    Загрузить
                    <input 
                        type="file" 
                        accept=".json" 
                        onChange={handleLoadFromJson}
                        style={{ 
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: '100%',
                            opacity: 0,
                            cursor: 'pointer'
                        }}
                    />
                    <UploadOutlined />
                </Flex>
            )
        },
        {
            key: 'save',
            label: (
                <Flex justify="space-between" gap={10}>
                    Сохранить
                    <DownloadOutlined />
                </Flex>
            ),
            onClick: handleSaveToJson
        }
    ], [handleLoadFromJson, handleSaveToJson]);

    const cardExtra = (
        <Space>
            <Popconfirm
                title={`Очистить множество ${side === 'left' ? 'левых' : 'правых'} инцидентов`}
                placement="topRight"
                okText='Да'
                cancelText='Нет'
                onConfirm={handleClearIncList}
            >
                <Button
                    size='small'
                    icon={<DeleteOutlined />}
                    danger
                >
                    Очистить
                </Button>
            </Popconfirm>
            <Dropdown menu={{ items: actionItems }} trigger={['hover']} placement="bottomRight">
                <Button>
                    <Space>
                        <Text>Действие</Text>
                        <DownOutlined />
                    </Space>
                </Button>
            </Dropdown>
        </Space>
    )
    
    return (
        <Card
            title={
                <Title level={4}>
                    {`Введите множество ${side === 'left' ? 'левых' : 'правых'}`}
                </Title>
            }
            extra={cardExtra}
        >
            <Splitter style={{ height: '450px', padding: '0 10px'}}>
                <Splitter.Panel min='60%' defaultSize='60%' style={{ height: '100%'}}>
                    <Flex vertical justify="space-between" style={{ height: '100%'}}>
                        <Space direction="vertical" size='small' style={{ overflowX: 'hidden' }}>
                            {
                                fieldEntries.map(([vertex, neighbors]) => (
                                    <FieldManager
                                        key={vertex}
                                        vertex={Number(vertex)}
                                        neighbors={neighbors}
                                        allVertices={fieldEntries.map(([key,]) => Number(key))}
                                        onNeighborAdd={handleAddNeighbor}
                                        onNeighborRemove={handleRemoveNeighbor}
                                        onNeighborChange={handleChangeNeighbor}
                                        onVertexRemove={handleRemoveVertex}
                                    />
                                ))
                            }
                        </Space>
                        <Button
                            style={{
                                backgroundColor: '#52c41a',
                                borderColor: '#52c41a',
                                width: '350px',
                                alignSelf: 'center'
                            }}
                            icon={<PlusOutlined />}
                            type="primary"
                            onClick={handleAddVertex}
                        >
                           Добавить поле 
                        </Button>
                    </Flex>
                </Splitter.Panel>

                <Splitter.Panel min='40%' defaultSize='40%' collapsible>
                    
                </Splitter.Panel>
            </Splitter>
        </Card>
    )
}

export default IncListInput;