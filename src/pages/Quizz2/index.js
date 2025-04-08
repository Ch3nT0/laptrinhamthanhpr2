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
    const [difficulty, setDifficulty] = useState("easy");
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

    const setupAudio = () => {
        if (!audioRef.current) return;

        const audio = audioRef.current;

        // Kiểm tra và khởi tạo AudioContext nếu chưa có
        if (!audioContextRef.current) {
            const context = new (window.AudioContext || window.webkitAudioContext)();
            audioContextRef.current = context;

            // Tạo MediaElementSource MỘT LẦN DUY NHẤT
            const source = context.createMediaElementSource(audio);
            audioRef.current._sourceNode = source; // Lưu lại để không tạo lại nữa
        }

        const context = audioContextRef.current;
        const source = audioRef.current._sourceNode;

        // Ngắt các kết nối cũ nếu có
        source.disconnect();

        // Reset chain
        let lastNode = source;

        // Thêm hiệu ứng tùy thuộc vào độ khó
        if (difficulty === "medium") {
            const distortion = context.createWaveShaper();
            distortion.curve = makeDistortionCurve(50);
            distortion.oversample = '4x';
            lastNode.connect(distortion);
            lastNode = distortion;
        }

        // Kết nối đến AudioContext destination (output)
        lastNode.connect(context.destination);

        // Đặt tốc độ phát lại cho "hard"
        if (difficulty === "hard") {
            audio.playbackRate = 1.5;
        } else {
            audio.playbackRate = 1.0;
        }
    };

    const makeDistortionCurve = (amount = 50) => {
        const k = typeof amount === 'number' ? amount : 50;
        const n_samples = 44100;
        const curve = new Float32Array(n_samples);
        const deg = Math.PI / 180;
        for (let i = 0; i < n_samples; ++i) {
            const x = (i * 2) / n_samples - 1;
            curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
        }
        return curve;
    };

    // Đảm bảo khi chọn độ khó, âm thanh sẽ được áp dụng đúng hiệu ứng
    useEffect(() => {
        setupAudio();
    }, [difficulty]);

    const handlePlayAudio = () => {
        const audio = audioRef.current;
        if (audioContextRef.current?.state === "suspended") {
            audioContextRef.current.resume();
        }
        audio.play();
    };

    const handleCheck = () => {
        if (isListening) {
            recognition.stop();
            setIsListening(false);
        }
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
        if (isListening) {
            recognition.stop();
            setIsListening(false);
        }
        setCheck(false);
        setDifficulty("easy");
        setTextFromAudio(''); 
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
        navigate(`/speaking`);
    }
    return (
        <>
            <Header2/>
            {dataQuestion ? (
                <div style={{ padding: "20px", lineHeight: '50px' }}>
                    <div style={{ marginBottom: "30px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
                        <audio ref={audioRef} controls  src={`/audio/${dataQuestion.id}.mp3`} 
                                    style={{ width: "50%",
                                    height: "60px"}} >
                            {/* src={`/audio/${dataQuestion.id}.mp3`} */}
                            Your browser does not support the audio element.
                        </audio>
                        <div style={{ marginTop: "10px" }}>
                            <span>Choose Difficulty: </span>
                            {["easy", "medium", "hard"].map(level => (
                                <Button
                                    key={level}
                                    type={difficulty === level ? "primary" : "default"}
                                    onClick={() => setDifficulty(level)}
                                    style={{ margin: '0 5px' }}
                                >
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                </Button>
                            ))}
                        </div>
                        <div style={{ position: 'relative', display: 'inline-block' }}>
                            <textarea value={textFromAudio} readOnly
                            style={{
                                width: '600px',         
                                height: '220px',        
                                fontSize: '16px',       
                                padding: '10px',        
                                borderRadius: '8px',    
                                resize: 'none'          
                            }}
                            ></textarea>
                            <button onClick={startVoiceRecognition}
                            style={{
                                position: 'absolute',
                                bottom: '10px',
                                right: '10px',
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                backgroundColor: isListening ? '#f44336' : '#4caf50', // đỏ khi đang ghi
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: isListening
                                    ? '0 0 0 0 rgba(244, 67, 54, 0.7)'
                                    : '0 2px 5px rgba(0,0,0,0.3)',
                                animation: isListening ? 'pulse 1.5s infinite' : 'none',
                            }}                           
                            ><CiMicrophoneOn size={28} color="#fff" /></button>
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
                    <div style={{display:'flex',justifyContent: 'center' , gap:'350px'}}>
                        <Button onClick={handleCheck} style={{
                                padding: '10px 24px',
                                fontSize: '20px',
                                height: 'auto',
                                borderRadius: '6px'
                            }}><i><SearchOutlined /></i>Check</Button>
                        {parseInt(params.id) % 15 === 0 ? (
                            <Button type="primary" onClick={handleBack} style={{
                                padding: '10px 24px',
                                fontSize: '20px',
                                height: 'auto',
                                borderRadius: '6px'
                            }}>Back</Button>
                        ):(
                        <Button type="primary" onClick={handleNext} style={{
                            padding: '10px 24px',
                            fontSize: '20px',
                            height: 'auto',
                            borderRadius: '6px'
                        }}>Next<RightOutlined /></Button>)}
                        
                    </div>
                </div>
            ) : (
                <div style={{ padding: "20px" }}>Loading...</div>
            )}
        </>
    );
}

export default Quizz2;
