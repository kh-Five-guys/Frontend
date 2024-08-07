import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './../../css/ChatCss/ChatRoom.css'; // CSS 파일 임포트

const ChatRoom = () => {
  const { id } = useParams(); // 채팅방 ID
  const [messages, setMessages] = useState([]); // 채팅 메시지 상태
  const [message, setMessage] = useState(''); // 입력 중인 메시지 상태
  const [participants, setParticipants] = useState([]); // 참여자 목록 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [userName, setUserName] = useState(''); // 사용자 이름 상태
  const chatLogRef = useRef(null); // 채팅 로그 참조
  const textareaRef = useRef(null); // 텍스트 영역 참조
  const wsRef = useRef(null); // WebSocket 참조
  const [wsConnected, setWsConnected] = useState(false); // WebSocket 연결 상태
  const navigate = useNavigate(); // 페이지 이동 함수
  const messagesEndRef = useRef(null); // 메시지 끝 참조

  // 사용자 정보 가져오는 함수
  const fetchUserInfo = async () => {
    try {
      const response = await axios.get('http://localhost:9999/api/user/me', { withCredentials: true });
      if (response.data && response.data.userNick) {
        setUserName(response.data.userNick); // 사용자 이름 설정
      } else {
        setUserName('Unknown User'); // 기본 사용자 이름 설정
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        navigate('/login'); // 401 오류 시 로그인 페이지로 리디렉션
      } else {
        setUserName('Unknown User'); // 오류 발생 시 기본 사용자 이름 설정
      }
    }
  };

  // WebSocket 연결 및 메시지 처리
  const connectWebSocket = () => {
    wsRef.current = new WebSocket(`ws://localhost:9999/ws/multiRoom?roomId=${id}`);

    wsRef.current.onopen = () => {
      console.log('WebSocket connection opened');
      setWsConnected(true);

      wsRef.current.send(JSON.stringify({
        chatRoomId: id,
        type: "JOIN",
        message: `${userName}님이 채팅에 입장하셨습니다`,
        userName: userName
      }));
    };

    wsRef.current.onmessage = (e) => {
      try {
        const content = JSON.parse(e.data);
        if (content && content.message && content.type) {
          if (content.type === "SEND") {
            setMessages(prevMessages => [
              ...prevMessages,
              { 
                text: content.message, 
                userName: content.userName,
                timestamp: content.timestamp,
                sent: content.userName === userName 
              }
            ]);
          } else if (content.type === "JOIN" || content.type === "LEAVE") {
            // 입장 및 퇴장 처리
            setParticipants(prevParticipants => {
              const updatedParticipants = content.participants || [];
              return updatedParticipants;
            });
            setMessages(prevMessages => [
              ...prevMessages,
              { 
                text: content.message, 
                userName: '', 
                timestamp: '', 
                sent: false 
              }
            ]);
          } else if (content.type === "ERROR") {
            console.error('Error message from server:', content.message);
          }
        }
      } catch (error) {
        console.error('메시지 파싱 오류:', error);
      }
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket connection closed');
      setWsConnected(false);
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  useEffect(() => {
    const initialize = async () => {
      await fetchUserInfo();
      connectWebSocket();
    };

    initialize();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [id, navigate, userName]);

  // Enter 키로 메시지 전송 설정
  useEffect(() => {
    const sendMessage = () => {
      if (message.trim() !== '' && wsRef.current && wsConnected) {
        wsRef.current.send(JSON.stringify({
          chatRoomId: id,
          type: "SEND",
          message: message,
          userName: userName
        }));
        setMessage('');
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    };

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [id, userName, message, wsConnected]);

  const handleSendMessage = (event) => {
    event.preventDefault();
    if (message.trim() !== '' && wsRef.current && wsConnected) {
      wsRef.current.send(JSON.stringify({
        chatRoomId: id,
        type: "SEND",
        message: message,
        userName: userName
      }));
      setMessage('');
    }
  };

  const handleDeleteChatRoom = async () => {
    try {
      const response = await fetch(`http://localhost:9999/api/room/delete?roomId=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      const responseText = await response.text();
      alert(responseText);

      if (response.ok) {
        navigate("/chat");
      }
    } catch (error) {
      console.error("채팅방 삭제 오류:", error);
      alert("채팅방 삭제 중 오류가 발생했습니다.");
    }
  };

  // 메시지 목록이 업데이트 될 때 스크롤을 자동으로 내리기
  useEffect(() => {
    if (chatLogRef.current) {
      chatLogRef.current.scrollTop = chatLogRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div id="chatroom-container">
      <h3>Room {id}</h3>
      <div id="chatroom-chat-section">
        <div id="chatroom-chat-log" ref={chatLogRef} style={{ overflowY: 'auto', height: '400px' }}>
          {messages.map((msg, index) => (
            <p key={index} className={`chatroom-message ${msg.sent ? "chatroom-sent" : "chatroom-received"}`}>
              <strong>{msg.userName || 'System'}:</strong> {msg.text}
              {msg.timestamp && <span className="chatroom-timestamp"> [{msg.timestamp}]</span>}
            </p>
          ))}
          <div ref={messagesEndRef} /> {/* 스크롤을 위한 참조 */}
        </div>
        
        <form onSubmit={handleSendMessage} className="messageForm">
          <textarea
            ref={textareaRef}
            id="chatroom-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="채팅을 입력해주세요"
            required
          />
          <input
            type="submit"
            value="전송"
            id="chatroom-input-submit"
          />
        </form>
      </div>
      
      <div id="chatroom-button-section">
        <button id="chatroom-btn-out" onClick={() => navigate("/chat")}>나가기</button>
        <button id="chatroom-btn-delete" onClick={handleDeleteChatRoom}>삭제</button>
      </div>
    </div>
  );
};

export default ChatRoom;
