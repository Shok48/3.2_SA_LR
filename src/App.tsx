import '@ant-design/v5-patch-for-react-19';
import { Header } from 'antd/es/layout/layout';
import type { ReactNode } from 'react';
import { BrowserRouter as Router, Link, Routes, Route } from 'react-router-dom';
import styles from './App.module.css';

interface IRouteConfig {
    path: string,
    label: string,
    component: ReactNode | null,
}

const routes: IRouteConfig[] = [
    {
        path: '/',
        label: 'Главная',
        component: null,
    }
]

const Navigation = () => (
    <Header className={styles['header']}>
        {routes.map(({path, label}) => (
            <Link className={styles['link']} to={path} key={path}>{label}</Link>
        ))}
    </Header>
)

const App = () => {

    return (
        <Router>
            <Navigation />
            <Routes>
                {routes.map(({path, component}) => (
                    <Route path={path} element={component} key={path} />
                ))}
            </Routes>
        </Router>
    )
}

export default App
