import { useNavigate } from "react-router-dom";

export default function Sider(){
    const navigate=useNavigate();
    const handleL=()=>{
        navigate('/listening');
    }
    const handleS=()=>{
        navigate('/speaking')
    }
    return(
        <>
            <button onClick={handleL}>Listening</button>
            <button onClick={handleS}>Speaking</button>
        </>
    )
}