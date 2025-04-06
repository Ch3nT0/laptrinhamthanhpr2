import { useParams } from "react-router-dom";

export default function Header2() {
    const params=useParams();
    const practice = Math.ceil(parseInt(params.id) / 15);
    const quiz= params.id -(practice-1)*15;
    return (
        <div className="header2" style={{ width: '100%', background: '#4d90d9', color: '#fff', padding: '10px 200px',lineHeight: '30px',height:'60px',display:'flex',justifyContent: 'space-between' }}>
            <div>Practice {practice}</div>
            <div>{quiz}/15</div>
        </div>
    );
}
