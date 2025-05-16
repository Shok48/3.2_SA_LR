import { memo } from "react";
import type { Vertex } from "../../Types/GraphData.types";
import { Button, Popconfirm, Space, Typography } from "antd";
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import InputSelector from "./InputSelector";

const { Text } = Typography;

interface IFieldManagerProps {
    vertex: Vertex,
    neighbors: Vertex[],
    allVertices: Vertex[],
    onNeighborAdd: (vertex: Vertex) => void,
    onNeighborRemove: (vertex: Vertex, neighbor: Vertex) => void,
    onNeighborChange: (vertex: Vertex, neighbor: Vertex, newNeighbor: Vertex) => void,
    onVertexRemove: (vertex: Vertex) => void
}

const FieldManager: React.FC<IFieldManagerProps> = memo(
    ({
        vertex,
        neighbors,
        allVertices,
        onNeighborAdd,
        onNeighborRemove,
        onNeighborChange,
        onVertexRemove
    }) => (
        <Space
            style={{
                minHeight: '32px',
                display: 'flex',
                flexWrap: 'wrap',
            }}
        >
            <Text>{vertex + 1}: &#123;</Text>
            {
                neighbors.map((neighbor, id) => (
                    <InputSelector
                        key={`${vertex}-${id}`}
                        value={neighbor}
                        allVertices={allVertices}
                        onNeighborRemove={() => onNeighborRemove(vertex, neighbor)}
                        onNeighborChange={(newNeighbor) => onNeighborChange(vertex, id, newNeighbor)}
                    />
                ))
            }
            <Button
                style={{
                    backgroundColor: '#52c41a',
                    borderColor: '#52c41a'
                }}
                icon={<PlusOutlined />}
                onClick={() => onNeighborAdd(vertex)}
                type="primary"
                size="small"
            />
            <Text>&#125;</Text>
            <Popconfirm
                title={`Удалить вершину ${vertex + 1}?`}
                okText='Да'
                cancelText='Нет'
                disabled={allVertices.length <= 1}
                onConfirm={() => onVertexRemove(vertex)}
            >
                <Button
                    icon={<DeleteOutlined />}
                    size="small"
                    danger
                />
            </Popconfirm>
        </Space>
    )
)

export default FieldManager;