import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './../../css/ChatCss/ChatRoomList.css'; // 수정된 CSS 파일 임포트
import JoinChatRoom from './JoinChatRoom'; // JoinChatRoom 컴포넌트 임포트

const ChatRoomList = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null); // 현재 선택된 채팅방 상태
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false); // 비밀번호 입력 모달 상태
  const navigate = useNavigate();

  useEffect(() => {
    // 로그인 상태 확인
    const checkLoginStatus = () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user.userId) {
        alert('로그인 하셔야 이용할 수 있는 페이지입니다.');
        navigate('/login');
      }
    };

    // 로그인 상태 확인
    checkLoginStatus();

    // 채팅방 목록 가져오기
    const fetchChatRooms = async () => {
      try {
        const response = await axios.get('http://localhost:9999/api/room');
        console.log('Response data:', response.data); // Debugging line

        if (Array.isArray(response.data)) {
          setChatRooms(response.data);
        } else {
          console.error('Unexpected response data:', response.data);
          setChatRooms([]);
        }
      } catch (error) {
        console.error('채팅방 가져오기 오류:', error);
        setChatRooms([]);
      }
    };

    fetchChatRooms();
  }, [navigate]); // Add `navigate` to the dependency array

  const handleCreateChatRoom = () => {
    navigate('/room/new');
  };

  const handleJoinRoom = (roomId, requiresPassword) => {
    if (requiresPassword) {
      setSelectedRoom(roomId);
      setIsJoinModalOpen(true);
    } else {
      navigate(`/chat/room/${roomId}`);
    }
  };

  const formatDate = (date) => {
    const options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    };
    return new Date(date).toLocaleString('en-GB', options).replace(',', '');
  };

  return (
    <div className="chat-room-container">
      <h2 className="chat-room-title">채팅방 목록</h2>
      <div className="chat-room-table-container">
        <table className="chat-room-table">
          <thead>
            <tr>
              <th>채팅방 ID</th>
              <th>채팅방 제목</th>
              <th>비밀번호</th>
              <th>시간</th>
              <th>지역</th>
              <th>입장</th>
            </tr>
          </thead>
          <tbody>
            {chatRooms.length > 0 ? (
              chatRooms.map(room => (
                <tr key={room.id}>
                  <td>{room.id}</td>
                  <td>{room.roomTitle}</td>
                  <td>{room.passwd ? 'O' : 'X'}</td>
                  <td>{formatDate(room.regDate)}</td>
                  <td>{room.region}</td>
                  <td>
                    <button onClick={() => handleJoinRoom(room.id, room.passwd)}>
                      입장
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6">현재 채팅방이 없습니다.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="chat-room-button-container">
        <button onClick={handleCreateChatRoom}>새 채팅방 생성</button>
      </div>

      {isJoinModalOpen && selectedRoom && (
        <JoinChatRoom roomId={selectedRoom} onClose={() => setIsJoinModalOpen(false)} />
      )}
    </div>
  );
};

export default ChatRoomList;
