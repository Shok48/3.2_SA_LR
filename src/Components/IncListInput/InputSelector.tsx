import React, { memo } from "react";
import type { Vertex } from "../../Types/GraphData.types";
import { Button, Select, Space } from "antd";
import { MinusOutlined } from '@ant-design/icons';

interface IInputSelectorProps {
    value: Vertex,
    allVertices: Vertex[],
    onNeighborRemove: () => void,
    onNeighborChange: (newValue: Vertex) => void,
}

const InputSelector: React.FC<IInputSelectorProps> = memo(({
    value,
    allVertices,
    onNeighborRemove,
    onNeighborChange,
}) => (
    <Space>
        <Select
            style={{ width: 80 }}
            value={value}
            onChange={onNeighborChange}
        >
            {
                allVertices.map(vertex => (
                    <Select.Option key={vertex} value={vertex}>
                        {vertex + 1}
                    </Select.Option>

                ))
            }
        </Select>
        <Button
            icon={<MinusOutlined />}
            onClick={onNeighborRemove}
            size="small"
            danger
        />
    </Space>
));

export default InputSelector;