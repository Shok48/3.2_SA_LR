import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Graph } from "../../Utils/Graph";
import { Button, Card, Collapse, Dropdown, Flex, InputNumber, message, Popconfirm, Space, Table, Typography, type MenuProps, type TableColumnProps } from "antd";
import { DeleteOutlined, DownloadOutlined, DownOutlined, UploadOutlined, PlusOutlined, DeleteColumnOutlined } from "@ant-design/icons"

const { Title, Text } = Typography

interface IDistanceMatrixInput {
    onGraphChange: (newGraph: Graph) => void,
    initialSize?: number,
}

interface IDataRow {
    key: number;
    index: number;
    [key: number]: number | null;
}

const DistanceMatrixInput: React.FC<IDistanceMatrixInput> = ({ initialSize = 3, onGraphChange }) => {
    const createEmptyMatrix = useCallback(() => Array.from({ length: initialSize }, () => Array(initialSize).fill(null)), [initialSize])

    const [disMatrix, setDisMatrix] = useState<(number | null)[][]>(createEmptyMatrix());

    const handleAddVertex = useCallback(() => {
        setDisMatrix(prev => {
            const size = prev.length + 1;
            return prev.map(row => [...row, null]).concat([Array(size).fill(null)]);
        })
    }, [])

    const handleRemoveVertex = useCallback((index: number) => {
        setDisMatrix(prev =>
            prev.filter((_, i) => i !== index).map(row => row.filter((_, j) => j !== index))
        )
    }, [])

    const handleChangeCell = useCallback((rowId: number, colId: number, value: number | null) => {
        setDisMatrix(prev => {
            const newMatrix = prev.map(r => [...r]);
            newMatrix[rowId][colId] = value;
            return newMatrix;
        })
    }, [])

    const handleLoadData = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            const data = JSON.parse(content) as number[][];
            
            if (data && Array.isArray(data)) {
              setDisMatrix(data);
              message.success('Матрица успешно загружена из файла');
            } else {
              message.error('Файл не содержит корректных данных матрицы');
            }
          } catch (error) {
            message.error('Ошибка при чтении файла');
            console.error(error);
          }
        };
        reader.readAsText(file);
        event.target.value = '';
    }, [])

    const handleSaveData = useCallback(() => {
        const json = JSON.stringify(disMatrix, null, 2);

        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `graph_matrix_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        message.success('Матрица успешно сохранена в файл'); 
    }, [disMatrix])

    const columns = useMemo<TableColumnProps<IDataRow>[]>(() => [
        {
            title: 'Вершины',
            dataIndex: 'index',
            key: 'index',
            width: 100,
            fixed: 'left',
            render: (_: unknown, __: unknown, index: number) => `V${index + 1}`
        },
        ...disMatrix.map((_, colIndex) => ({
            title: (
                <Flex justify="space-between" align="center">
                    {`V${colIndex + 1}`}
                    <Popconfirm
                        title={`Удалить вершину V${colIndex + 1}?`}
                        okText='Да'
                        cancelText='Нет'
                        disabled={disMatrix.length <= 1}
                        onConfirm={() => handleRemoveVertex(colIndex)}
                    >
                        <Button
                            size='small'
                            icon={<DeleteColumnOutlined />}
                            danger
                            disabled={disMatrix.length <= 1}
                        />
                    </Popconfirm>
                </Flex>
            ),
            dataIndex: colIndex,
            key: colIndex,
            width: 120,
            render: (_: unknown, __: unknown, rowIndex: number) => (
                <InputNumber
                    min={-100}
                    max={100}
                    placeholder="∞"
                    value={colIndex === rowIndex ? 0 :disMatrix[rowIndex][colIndex]}
                    style={{ width: '100%' }}
                    disabled={rowIndex === colIndex}
                    onChange={value => handleChangeCell(rowIndex, colIndex, value)}
                />
            ),
        })),
        {
            title: (
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddVertex}
                >
                    Добавить вершину
                </Button>
            ),
            key: 'add',
            width: 80,
            fixed: 'right',
            render: () => null,
        }
    ], [disMatrix, handleAddVertex, handleRemoveVertex, handleChangeCell])

    const dataSource = useMemo<IDataRow[]>(() =>
        disMatrix.map((row, index) => ({
            key: index,
            index: index + 1,
            ...row.reduce((acc, value, colIndex) => ({ ...acc, [colIndex]: value }), {})
        })),
        [disMatrix]
    )

    const actionItems: MenuProps['items'] = useMemo(() => [
        {
            key: 'load',
            label: (
                <Flex justify='space-between' gap={10}>
                    Загрузить
                    <input 
                        type="file" 
                        accept=".json" 
                        onChange={handleLoadData}
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
            onClick: handleSaveData
        }
    ], [handleLoadData, handleSaveData])

    const cardExtra = useMemo(() => (
        <Space>
            <Popconfirm
                title='Очистить матрицу расстояний?'
                placement="topRight"
                okText='Да'
                cancelText='Нет'
                onConfirm={() => setDisMatrix(createEmptyMatrix())}
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
    ), [createEmptyMatrix, actionItems])

    useEffect(() => {
        onGraphChange(Graph.fromDisMatrix(disMatrix))
    }, [disMatrix, onGraphChange])

    return (
        <Card
            title={<Title level={4}>Введите матрицу расстояний</Title>}
            extra={cardExtra}
        >
            <Table
                columns={columns}
                dataSource={dataSource}
                size="small"
                bordered
                pagination={false}
                scroll={{ x: 'max-content' }}
            />
            <Collapse
                ghost
                style={{ marginTop: 16 }}
            />
        </Card>
    )
}

export default DistanceMatrixInput;