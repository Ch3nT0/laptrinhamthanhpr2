import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import Sider1 from "../../components/Sider";
const {Sider, Content } = Layout;
export default function LayoutDefault() {

    const layoutStyle = {
        borderRadius: 8,
        overflow: 'hidden',
        height: '100vh',
    };
    const siderStyle = {
        textAlign: 'center',
        lineHeight: '120px',
        color: '#000',
        backgroundColor: '#fff',
        borderRight: '1px solid #000',
    };
    const contentStyle = {
        textAlign: 'center',
        minHeight: 120,
        lineHeight: '120px',
    };
    return (<>
        <Layout style={layoutStyle}>
            <Sider width="20%" style={siderStyle}>
                <Sider1/>
            </Sider>
            <Layout >
                <Content style={contentStyle}><Outlet/></Content>
            </Layout>
        </Layout>
    </>)
}