import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './../../css/ChatCss/NewChatRoom.css'; // 글로벌 CSS 파일 임포트

const NewChatRoom = () => {
  const [roomTitle, setRoomTitle] = useState('');
  const [region, setRegion] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // 로그인 상태에서 사용자 ID를 가져옵니다.
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.userId) {
      setUserId(storedUser.userId);
    } else {
      alert('로그인 후 사용 가능한 기능입니다.');
      navigate('/login'); // 로그인 페이지로 리디렉션
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      roomTitle,
      region,
      passwd: password,
      userId
    };
    
    try {
      const response = await axios.post('http://localhost:9999/api/room/create', payload);
      const roomId = response.data; // Assuming the response contains the room ID
      alert('채팅방이 생성되었습니다.');
      navigate(`/chat/room/${roomId}`);
    } catch (error) {
      console.error('채팅방 생성 오류:', error);
      alert('채팅방 생성에 실패했습니다.');
    }
  };

  return (
    <div id="new-chat-room-container">
      <h2 id="new-chat-room-title">새 채팅방 생성</h2>
      <form id="new-chat-room-form" onSubmit={handleSubmit}>
        <div className="formGroup">
          <label>채팅방 제목:</label>
          <input
            type="text"
            value={roomTitle}
            onChange={(e) => setRoomTitle(e.target.value)}
            required
          />
        </div>
        <div className="formGroup">
          <label>지역:</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            <option value="">-- 지역 선택 --</option>
            <option value="서울">서울</option>
            <option value="인천">인천</option>
            <option value="경기">경기</option>
            <option value="강원">강원</option>
            <option value="충북">충북</option>
            <option value="충남">충남</option>
            <option value="전북">전북</option>
            <option value="전남">전남</option>
            <option value="경북">경북</option>
            <option value="경남">경남</option>
            <option value="제주">제주</option>
            <option value="부산">부산</option>
            <option value="대구">대구</option>
            <option value="광주">광주</option>
            <option value="대전">대전</option>
            <option value="울산">울산</option>
            <option value="세종">세종</option>
          </select>
        </div>
        <div className="formGroup">
          <label>비밀번호:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">생성</button>
      </form>
    </div>
  );
};

export default NewChatRoom;
