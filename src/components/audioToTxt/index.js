import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from 'antd';
import { RightOutlined, SearchOutlined } from '@ant-design/icons';
import Header2 from "../../components/Header/Header2";

function Quizz0() {
  const params = useParams();
  const navigate = useNavigate();
  const [check, setCheck] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isFilterOn, setIsFilterOn] = useState(false); // Trạng thái bật/tắt bộ lọc âm thanh
  const audioContextRef = useRef(null);
  const audioRef = useRef(null);
  const audioSourceRef = useRef(null);  // Ref for MediaElementSourceNode
  const filterRef = useRef(null); // Ref for the audio filter

  const handleCheck = () => {
    setCheck(!check);
  };

  const handleNext = () => {
    setCheck(false);
    navigate(`/quizz/${parseInt(params.id) + 1}`);
  };

  useEffect(() => {
    if (!audioRef.current) return;

    // Khởi tạo AudioContext và kết nối bộ lọc chỉ một lần
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    // Check if the audio source has already been connected
    if (!audioSourceRef.current) {
      const audioElement = audioRef.current;
      audioSourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);

      // Tạo một bộ lọc bandpass hoặc high-pass mạnh
      const filter = audioContextRef.current.createBiquadFilter();
      filter.type = "highpass";  // Sử dụng highpass để cắt các tần số thấp
      filter.frequency.value = 1500;  // Cắt tần số dưới 1500Hz (chỉ để lại âm thanh cao)

      filterRef.current = filter; // Lưu lại ref bộ lọc

      audioSourceRef.current.connect(filter);
      filter.connect(audioContextRef.current.destination);
    }

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
    setIsFilterOn(prevState => {
      const newState = !prevState;
      if (filterRef.current) {
        filterRef.current.frequency.value = newState ? 1500 : 0; // Bật/tắt bộ lọc
      }
      return newState;
    });
  };

  const handleBack = () => {
    navigate(`/listening`);
  };

  return (
    <>
      <Header2 />
      <div style={{ padding: "20px", lineHeight: '10px' }}>
        <div style={{ marginBottom: "30px", borderBottom: "1px solid #ccc", paddingBottom: "10px" }}>
          {/* Sử dụng file MP3 từ thư mục public/audio */}
          <audio ref={audioRef} controls src="/audio/1C.mp3">
            Your browser does not support the audio element.
          </audio>
          <div style={{ marginTop: "10px" }}>
            <button onClick={handlePlayAudio}>Play</button>
          </div>
          <div style={{ marginTop: "10px", textAlign: "left", paddingLeft: '300px' }}>
            {check && (
              <p>Câu hỏi: Mô tả câu hỏi ở đây.</p>
            )}

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
                      : Mô tả đáp án ở đây
                      {selectedAnswer === option && (
                        <span style={{ color: "green", marginLeft: "10px" }}>✓ Đúng</span>
                      )}
                    </>
                  )}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={handleCheck}><i><SearchOutlined /></i> Kiểm tra</Button>
          <Button type="primary" onClick={handleNext}>Tiếp theo <RightOutlined /></Button>
        </div>
        <div style={{ marginTop: "20px" }}>
          <Button onClick={handleFilterToggle}>
            {isFilterOn ? "Tắt bộ lọc" : "Bật bộ lọc"} {/* Hiển thị nút bật/tắt bộ lọc */}
          </Button>
        </div>
      </div>
    </>
  );
}

export default Quizz0;
