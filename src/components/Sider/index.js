import { useNavigate } from "react-router-dom";
import './style.css'
export default function Sider() {
    const navigate = useNavigate();
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
                <button onClick={handleL}>Listening</button>
                <button onClick={handleS}>Speaking</button>
            </div>

        </>
    )
}