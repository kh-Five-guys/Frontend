import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import '../css/Header.css'; 
import { useAuth } from '../contexts/AuthContext'; 

export default function Header() {
  const { user, logout } = useAuth();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const [userRankNo, setUserRankNo] = useState(null);

  useEffect(() => {
    if (user) {
      setUserRankNo(user.rankNo);
    }
  }, [user]);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleSubmit = async () => {
    try {
      console.log('Submitting inquiry:', {
        userId: user.userId,
        title,
        message
      });

      await axios.post('http://localhost:9999/inquiries', {
        userId: user.userId,
        title,
        message
      }, {
        withCredentials: true // CORS 설정을 위한 추가 옵션
      });
      alert('문의사항이 성공적으로 제출되었습니다.');
      togglePopup();
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      alert('문의사항 제출에 실패했습니다.');
    }
  };

  const handleLogout = async () => {
    if (window.confirm('정말로 로그아웃 하시겠습니까?')) {
      try {
        await logout();
        navigate('/?logoutMessage=success');
      } catch (error) {
        console.error('로그아웃 중 오류 발생:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <>
      <header>
        <div className="header_container">
          <Link to="/">
            <img src={`${process.env.PUBLIC_URL}/images/logo.png`} alt="Logo" className="logo" />
          </Link>
          <nav>
            <ul>
              <li><Link to="/board">게시판</Link></li>
              <li><Link to="/chat">실시간 채팅</Link></li>
              <li><Link to="/friend">친구 찾기</Link></li>
              <li><Link to="/lost">분실물</Link></li>
              <li><Link to="/news">지역 뉴스</Link></li>
            </ul>
          </nav>
          <div className="auth_buttons">
            {user ? (
              <>
                
                <button onClick={handleLogout} className="btn_logout">로그아웃</button>
                {userRankNo === 0 && ( <Link to="/admin" className="btn_mypage"> 관리자 페이지 </Link> )}
              </>
            ) : (
              <>
                <Link to="/login" className="btn_login">로그인</Link>
                <Link to="/register" className="btn_register">회원가입</Link>
              </>
            )}
          </div>
        </div>
      </header>
      
      {user && (
        <>
          <button className="fixed-button" onClick={togglePopup}>+</button>
          <div className={`popup ${isPopupOpen ? 'popup-active' : ''}`}>
            <h3>문의사항✅</h3>
            <input 
              type="text" 
              placeholder="제목" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea 
              placeholder="문의 내용을 적어주세요" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={handleSubmit}>보내기</button>
          </div>
        </>
      )}
    </>
  );
}
