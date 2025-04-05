import React, { useState } from 'react';
import axios from 'axios';

const SpeechToText = () => {
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);

  const transcribeAudio = async (audioUrl) => {
    setLoading(true);

    try {
      // Tải file âm thanh từ URL
      const audioData = await fetch(audioUrl);
      const audioBuffer = await audioData.arrayBuffer();
      const audioContent = Buffer.from(audioBuffer).toString('base64');  // Chuyển đổi sang base64

      // Dữ liệu gửi lên Cloud Function hoặc API Gateway
      const data = {
        audioContent: audioContent,
        encoding: "MP3",  // Định dạng âm thanh (MP3 trong trường hợp này)
        sampleRateHertz: 16000,  // Tốc độ mẫu (nên khớp với file âm thanh)
        languageCode: "en-US",  // Ngôn ngữ
      };

      // Gửi yêu cầu tới Cloud Function hoặc API Gateway của bạn
      const response = await axios.post(
        'https://your-cloud-function-url.com/api/transcribe',  // Thay URL này bằng Cloud Function của bạn
        data
      );

      // Cập nhật kết quả nhận dạng
      if (response.data && response.data.transcript) {
        setTranscription(response.data.transcript);
      } else {
        setTranscription('Không thể nhận dạng được văn bản từ âm thanh.');
      }

    } catch (error) {
      console.error('Lỗi khi nhận dạng âm thanh:', error);
      setTranscription('Đã xảy ra lỗi.');
    }
    setLoading(false);
  };

  return (
    <div>
      <h1>Chuyển Đổi Âm Thanh Thành Văn Bản</h1>
      <button
        onClick={() => transcribeAudio('https://s4-media1.study4.com/media/tez_media/sound/eco_toeic_1000_test_1_8.mp3')}
        disabled={loading}
      >
        {loading ? 'Đang tải...' : 'Chuyển đổi âm thanh'}
      </button>
      <div>
        <h2>Văn bản nhận dạng:</h2>
        <p>{transcription}</p>
      </div>
    </div>
  );
};

export default SpeechToText;
