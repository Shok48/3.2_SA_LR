import styles from './BasePage.module.css'
import { Card, Typography } from 'antd';

const { Title } = Typography;

interface IBasePageProps {
    title: string,
    children: React.ReactNode,
}

const BasePage = ({ title, children }: IBasePageProps) => (
    <Card
        title={
            <Title level={2} className={styles.title}>
                {title}
            </Title>
        }
        variant='borderless'
        className={styles.page}
    >
        {children}
    </Card>
)

export default BasePage;