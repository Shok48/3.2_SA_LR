import { Space } from "antd"
import BasePage from "../BasePage/BasePage"
import { useState } from "react"
import { Graph } from "../../Utils/Graph"

const ConverterPage: React.FC = () => {
    const [graph, setGraph] = useState<Graph>(new Graph());

    function handleGraphChange(newGraph: (prev: Graph) => Graph): void {
        setGraph(newGraph);
    }

    return (
        <BasePage
            title="Конвертер левых инцидентов в матрицы смежности и инцидентности"
        >
            <Space direction="vertical" style={{ width: '100%' }}>

            </Space>
        </BasePage>
    )
}

export default ConverterPage;