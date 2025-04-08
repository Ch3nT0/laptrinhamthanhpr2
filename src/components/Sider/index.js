import { useNavigate, useLocation} from "react-router-dom";
import './style.css'
export default function Sider() {
    const navigate = useNavigate();
    const location = useLocation();
    const handleL = () => {
        navigate('/listening');
    }
    const handleS = () => {
        navigate('/speaking')
    }
    return (
        <>
            <div className="sider">
                <img src="logo.jpg" alt="Logo" />
                <button onClick={handleL} className={(location.pathname === '/listening' || location.pathname.startsWith( '/quizz1')) ? 'active' : ''}>Listening</button>
                <button onClick={handleS} className={(location.pathname === '/speaking' || location.pathname.startsWith( '/quizz2')) ? 'active' : ''}>Speaking</button>
            </div>

        </>
    )
}