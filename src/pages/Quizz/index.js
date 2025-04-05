import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function Quizz() {
    const params = useParams();
    const navigate = useNavigate();
    const [dataQuestion, setDataQuestion] = useState(null);
    const [check, setCheck] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
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
    
        // Tạo bộ lọc notch để cắt một dải tần số cụ thể
        // filter.type = "notch";
        // filter.frequency.value = 1000;  // Cắt tần số quanh 1000Hz để âm thanh trở nên rất méo mó
    
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
    return dataQuestion ? (
        <div style={{ padding: "20px" }}>
            <h2>Listening Quiz - Part {params.id}</h2>
            <div style={{ marginBottom: "30px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
                <p><strong>Question {dataQuestion[0].question}</strong></p>

                <audio ref={audioRef} controls src={dataQuestion[0].url}>
                    Your browser does not support the audio element.
                </audio>
                <div style={{ marginTop: "10px" }}>
                    <button onClick={handlePlayAudio}>Play with Filter</button>
                </div>
                <div style={{ marginTop: "10px" }}>
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
            <button onClick={handleCheck}>Check</button>
             <button onClick={handleNext}>Next</button>
        </div>
    ) : (
        <div style={{ padding: "20px" }}>Loading...</div>
    );
}

export default Quizz;
