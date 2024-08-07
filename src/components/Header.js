import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/Header.css'; 
import { useAuth } from '../contexts/AuthContext'; 
import FriendManage from './FriendComponents/FriendManage'; // 추가된 FriendManage 컴포넌트

export default function Header() {
  const { user, logout } = useAuth();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [userRankNo, setUserRankNo] = useState(null);
  const [isFriendManageOpen, setIsFriendManageOpen] = useState(false); // 추가된 상태
  const navigate = useNavigate();

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
        await logout(); // 로그아웃 처리
        setIsFriendManageOpen(false); // FriendManage 오버레이 닫기
        // 로그아웃 후 '/'로 이동하며 쿼리 파라미터로 메시지 전달
        navigate('/?logoutMessage=success');
      } catch (error) {
        console.error('로그아웃 중 오류 발생:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
      }
    }
  };

  const toggleFriendManage = () => {
    setIsFriendManageOpen(!isFriendManageOpen);
  };

  useEffect(() => {
    if (isFriendManageOpen) {
      document.body.style.overflow = 'hidden'; // Prevent body scroll
    } else {
      document.body.style.overflow = ''; // Restore body scroll
    }

    // Cleanup on component unmount
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFriendManageOpen]);

  return (
    <>
      <header className="header-header">
        <div className="header-header_container">
          <Link to="/">
            <img src={`${process.env.PUBLIC_URL}/images/logo.png`} alt="Logo" className="header-logo" />
          </Link>
          <nav className="header-nav">
            <ul className="header-nav_ul">
              <li className="header-nav_li"><Link to="/board" className="header-nav_link">게시판</Link></li>
              <li className="header-nav_li"><Link to="/chat" className="header-nav_link">실시간 채팅</Link></li>
              <li className="header-nav_li"><Link to="/friend" className="header-nav_link">친구 찾기</Link></li>
              <li className="header-nav_li"><Link to="/lost" className="header-nav_link">분실물</Link></li>
              <li className="header-nav_li"><Link to="/news" className="header-nav_link">지역 뉴스</Link></li>
            </ul>
          </nav>
          
        </div>
      </header>
      
      {/* 문의, 팝업창 */}
      {user && (
        <>
          <button className="header-fixed-button" onClick={togglePopup}>+</button>
          <div className={`header-popup ${isPopupOpen ? 'header-popup-active' : ''}`}>
            <h3>문의사항✅</h3>
            <input 
              type="text" 
              placeholder="제목" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="header-input_title"
            />
            <textarea 
              placeholder="문의 내용을 적어주세요" 
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="header-textarea_message"
            />
            <button onClick={handleSubmit} className="header-btn_submit">보내기</button>
          </div>
        </>
      )}

      {/* FriendManage 오버레이 */}
      {isFriendManageOpen && (
        <div className="header-overlay_container" onClick={toggleFriendManage}>
          {/* <div className="header-overlay_content" onClick={e => e.stopPropagation()}>
            <FriendManage onClose={toggleFriendManage} />
            
          </div> */}
        </div>
      )}
    </>
  );
}
