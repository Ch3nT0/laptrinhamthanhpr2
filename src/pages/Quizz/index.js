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
    const [difficulty, setDifficulty] = useState("easy"); // easy | medium | hard
    const audioContextRef = useRef(null);
    const audioRef = useRef(null);

    // Fetch data cho câu hỏi từ server
    useEffect(() => {
        fetch(`http://localhost:5000/listen?question=${params.id}`)
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => setDataQuestion(data))
            .catch(error => console.error("Fetch error:", error));
    }, [params.id]);

    const handleCheck = () => setCheck(!check);

    const handleNext = () => {
        setCheck(false);
        navigate(`/quizz/${parseInt(params.id) + 1}`);
    };

    const handleBack = () => navigate(`/listening`);

    // Tạo các hiệu ứng âm thanh và tốc độ phát lại tùy theo độ khó
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

    // Hàm tạo hiệu ứng distortion
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [difficulty]);

    // Hàm phát âm thanh
    const handlePlayAudio = () => {
        console.log(dataQuestion)
        const audio = audioRef.current;
        if (audioContextRef.current?.state === "suspended") {
            audioContextRef.current.resume();
        }
        audio.play();
    };
    
    return (
        <>
            <Header2 />
            {dataQuestion ? (
                <div style={{ padding: "20px", lineHeight: '10px' }}>
                    <div style={{ marginBottom: "30px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
                        <audio ref={audioRef} controls src={`/${dataQuestion[0].url}`} onClick={handlePlayAudio}>
                            Your browser does not support the audio element.
                        </audio>

                        {/* Chọn độ khó */}
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

                        {/* Hiển thị câu hỏi và đáp án */}
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

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button onClick={handleCheck}><SearchOutlined /> Check</Button>
                        {parseInt(params.id) % 15 === 0 ? (
                            <Button type="primary" onClick={handleBack}>Back</Button>
                        ) : (
                            <Button type="primary" onClick={handleNext}>Next <RightOutlined /></Button>
                        )}
                    </div>
                </div>
            ) : (
                <div style={{ padding: "20px" }}>Loading...</div>
            )}
        </>
    );
}

export default Quizz;
