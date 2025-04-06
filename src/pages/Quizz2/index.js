import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header2 from "../../components/Header/Header2";
import { Button } from "antd";
import { RightOutlined, SearchOutlined } from "@ant-design/icons";
import { CiMicrophoneOn } from "react-icons/ci";
function Quizz2() {
    const navigate = useNavigate();
    const params = useParams();
    const [dataQuestion, setDataQuestion] = useState(null);
    const [check, setCheck] = useState(false);
    const [textFromAudio, setTextFromAudio] = useState("");
    const [isListening, setIsListening] = useState(false);
    const audioRef = useRef(null); // Tham chiếu đến thẻ <audio>
    const audioContextRef = useRef(null); // Lưu AudioContext

    // Set up speech recognition
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = "en-US";
    recognition.interimResults = true;

    useEffect(() => {
        fetch(`http://localhost:5000/speaking/${params.id}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => setDataQuestion(data))
            .catch(error => console.error("Fetch error:", error));
    }, [params.id]);

    useEffect(() => {
        if (!audioRef.current) return;

        // Khởi tạo AudioContext và kết nối bộ lọc
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const audioElement = audioRef.current;
        const track = audioContextRef.current.createMediaElementSource(audioElement);

        const filter = audioContextRef.current.createBiquadFilter();
        filter.type = "highpass";
        filter.frequency.value = 500; // Cắt tần số trên 500Hz

        track.connect(filter);
        filter.connect(audioContextRef.current.destination);

        return () => {
            // Hủy kết nối khi component unmount
            if (audioContextRef.current && audioContextRef.current.state !== "closed") {
                audioContextRef.current.close();
            }
        };
    }, []); // Chạy lại khi có audio mới

    const handlePlayAudio = () => {
        if (audioContextRef.current && audioContextRef.current.state === "suspended") {
            audioContextRef.current.resume();
        }
        audioRef.current.play();
    };

    const handleCheck = () => {
        setCheck(!check);
    };

    const startVoiceRecognition = () => {
        if (isListening) {
            console.log("Voice recognition is already in progress.");
            return;
        }

        recognition.start();
        setIsListening(true);
    };

    recognition.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        setTextFromAudio(transcript);
    };

    recognition.onend = () => {
        setIsListening(false);
    };

    recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
    };

    const handleNext = () => {
        setCheck(false);
        navigate(`/quizz2/${parseInt(params.id) + 1}`);
    };

    const compareAnswers = () => {
        const userWords = textFromAudio.trim().split(" ");
        const correctWords = dataQuestion.textAnswer.trim().split(" ");
        return correctWords.map((word, index) => {
            const isCorrect = userWords[index] && word.toLowerCase() === userWords[index].toLowerCase();
            return {
                word,
                isCorrect,
            };
        });
    };
    const handleBack=()=>{
        navigate(`/listening`);
    }
    return (
        <>
            <Header2/>
            {dataQuestion ? (
                <div style={{ padding: "20px" }}>
                    <div style={{ marginBottom: "30px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
                        <audio ref={audioRef} controls src={dataQuestion.url}>
                            Your browser does not support the audio element.
                        </audio>
                        <div style={{ marginTop: "10px" }}>
                            <button onClick={handlePlayAudio}>Play with Filter</button>
                        </div>
                        <div>
                            <textarea value={textFromAudio} readOnly></textarea>
                            <button onClick={startVoiceRecognition}><CiMicrophoneOn /></button>
                        </div>
                        <div style={{ marginTop: "10px" }}>
                            {check && (
                                <p>
                                    {compareAnswers().map((result, index) => (
                                        <span
                                            key={index}
                                            style={{
                                                color: result.isCorrect ? "green" : "red",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {result.word}{" "}
                                        </span>
                                    ))}
                                </p>
                            )}
                        </div>
                    </div>
                    <div style={{display:'flex',justifyContent: 'space-between'}}>
                        <Button onClick={handleCheck} ><i><SearchOutlined /></i>Check</Button>
                        {parseInt(params.id) % 15 === 0 ? (
                            <Button type="primary" onClick={handleBack}>Back</Button>
                        ):(
                        <Button type="primary" onClick={handleNext}>Next<RightOutlined /></Button>)}
                        
                    </div>
                </div>
            ) : (
                <div style={{ padding: "20px" }}>Loading...</div>
            )}
        </>
    );
}

export default Quizz2;
