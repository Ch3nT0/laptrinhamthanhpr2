import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from 'antd';
import { RightOutlined, SearchOutlined } from '@ant-design/icons';
import Header2 from "../../components/Header/Header2";

function Quizz() {
    const params = useParams();
    const navigate = useNavigate();
    const [dataQuestion, setDataQuestion] = useState(null);
    const [check, setCheck] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [filterEnabled, setFilterEnabled] = useState(false); // Thêm trạng thái để theo dõi bộ lọc
    const audioContextRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        fetch(`http://localhost:5000/listen?question=${params.id}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => setDataQuestion(data))
            .catch(error => console.error("Fetch error:", error));
    }, [params.id]);

    const handleCheck = () => {
        setCheck(!check);
    };

    const handleNext = () => {
        setCheck(false)
        navigate(`/quizz/${parseInt(params.id) + 1}`);
    };

    useEffect(() => {
        if (!audioRef.current) return;

        // Khởi tạo AudioContext và kết nối bộ lọc
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const audioElement = audioRef.current;
        const track = audioContextRef.current.createMediaElementSource(audioElement);

        // Tạo một bộ lọc bandpass hoặc high-pass mạnh
        const filter = audioContextRef.current.createBiquadFilter();
        filter.type = "highpass";  // Sử dụng highpass để cắt các tần số thấp
        filter.frequency.value = 1500;  // Cắt tần số dưới 1500Hz (chỉ để lại âm thanh cao)

        track.connect(filter);
        filter.connect(audioContextRef.current.destination);

        return () => {
            // Hủy kết nối khi component unmount
            if (audioContextRef.current && audioContextRef.current.state !== "closed") {
                audioContextRef.current.close();
            }
        };
    }, []);  // Chạy lại khi có audio mới

    const handlePlayAudio = () => {
        if (audioContextRef.current && audioContextRef.current.state === "suspended") {
            audioContextRef.current.resume();
        }
        audioRef.current.play();
    };

    const handleFilterToggle = () => {
        setFilterEnabled(!filterEnabled); // Bật/Tắt bộ lọc
    };

    const handleBack = () => {
        navigate(`/listening`);
    };

    return (
        <>
            <Header2 />
            {dataQuestion ? (
                <div style={{ padding: "20px", lineHeight: '10px' }}>
                    <div style={{ marginBottom: "30px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
                        <audio ref={audioRef} controls src="/audio/1C.mp3">
                            Your browser does not support the audio element.
                        </audio>
                        <div style={{ marginTop: "10px" }}>
                            <button onClick={handlePlayAudio}>Play Audio</button>
                        </div>
                        <div style={{ marginTop: "10px", textAlign: "left", paddingLeft: '300px' }}>
                            {check && (<p>{dataQuestion[0].textQ}</p>)}

                            {["A", "B", "C"].map((option, index) => (
                                <div key={option} style={{ marginBottom: "10px" }}>
                                    <label>
                                        <input
                                            type="radio"
                                            name="question"
                                            value={option}
                                            onChange={() => setSelectedAnswer(option)}
                                        />
                                        {option}
                                        {check && (
                                            <>
                                                : {dataQuestion[0].textA[index]}
                                                {dataQuestion[0].answer === option && (
                                                    <span style={{ color: "green", marginLeft: "10px" }}>✓ Correct</span>
                                                )}
                                                {selectedAnswer === option && dataQuestion[0].answer !== option && (
                                                    <span style={{ color: "red", marginLeft: "10px" }}>✗ Wrong</span>
                                                )}
                                            </>
                                        )}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{display:'flex',justifyContent: 'space-between'}}>
                        <Button onClick={handleCheck} ><i><SearchOutlined /></i>Check</Button>
                        {parseInt(params.id) % 15 === 0 ? (
                            <Button type="primary" onClick={handleBack}>Back</Button>
                        ):( 
                            <Button type="primary" onClick={handleNext}>Next<RightOutlined /></Button>)}
                        
                    </div>
                    <div style={{ marginTop: "20px" }}>
                        <Button onClick={handleFilterToggle}>
                            {filterEnabled ? "Turn off Filter" : "Turn on Filter"}
                        </Button>
                    </div>
                </div>
            ) : (
                <div style={{ padding: "20px" }}>Loading...</div>)}
        </>
    );
}

export default Quizz;
