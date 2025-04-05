import React from 'react';
import './style.css';
import { useNavigate } from 'react-router-dom';

function Listening() {
  const practices = Array.from({ length: 10 }, (_, i) => `Practice ${i + 1}`);
  const navigate = useNavigate();

  const handleClick = (index) => {
    navigate(`/quizz/${index*15+1}`);
  };

  return (
    <div className="container">
      {practices.map((text, index) => (
        <div key={index} className="box" onClick={() => handleClick(index)}>
          {text}
        </div>
      ))}
    </div>
  );
}

export default Listening;
