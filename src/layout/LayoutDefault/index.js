import { Outlet } from "react-router-dom";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "../../components/Sider";
export default function LayoutDefault() {

    const layoutStyle = {
        borderRadius: 8,
        overflow: 'hidden',
        width: 'calc(50% - 8px)',
        maxWidth: 'calc(50% - 8px)',
    };
    const siderStyle = {
        textAlign: 'center',
        lineHeight: '120px',
        color: '#fff',
        backgroundColor: '#1677ff',
    };
    const contentStyle = {
        textAlign: 'center',
        minHeight: 120,
        lineHeight: '120px',
    };


    return (<>
        <Layout style={layoutStyle}>
            <Sider width="25%" style={siderStyle}>
                <Sider/>
            </Sider>
            <Layout>
                <Content style={contentStyle}><Outlet/></Content>
            </Layout>
        </Layout>
    </>)
}