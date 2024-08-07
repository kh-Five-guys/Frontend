import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './../../css/ChatCss/JoinChatRoom.css'; // 스타일 파일 임포트

const JoinChatRoom = ({ roomId, onClose }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleJoin = async () => {
    try {
      // 비밀번호를 포함한 요청을 서버에 보냅니다.
      const response = await axios.post(`http://localhost:9999/api/room/join`, null, {
        params: { roomId, password }
      });

      if (response.data.success === 'true') { // 성공 여부 체크
        navigate(`/chat/room/${roomId}`); // Redirect to the chat room
        onClose(); // Close the modal
      } else {
        setError(response.data.message); // Show error message
      }
    } catch (error) {
      console.error('채팅방 입장 오류:', error);
      setError('채팅방 입장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="join-chat-room-modal">
      <h1>채팅방 비밀번호 입력</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호를 입력하세요"
      />
      <button onClick={handleJoin}>입장</button>
      {error && <p>{error}</p>}
      <button onClick={onClose}>닫기</button>
    </div>
  );
};

export default JoinChatRoom;
