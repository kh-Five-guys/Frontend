import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; 
import { Link } from 'react-router-dom'; 

export default function Home() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const { user } = useAuth();

  const section1Ref = useRef(null);
  const section2Ref = useRef(null);

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

  const scrollToSection = (sectionRef, offset = 0) => {
    window.scrollTo({
      top: sectionRef.current.offsetTop + offset,
      behavior: 'smooth'
    });
  };

  return (
    <div className="container">
      <div className="section1" ref={section1Ref}>
     
        <div className="image-container">
          <p>아직 동네방네 회원이 아니신가요? <br/>
          아래 회원가입 버튼을 눌러 회원가입을 하시고 <br/>주변 이웃들과 소통해보세요!</p>
        <Link to="/register" className="btn-register">회원가입</Link>
          <img src={`${process.env.PUBLIC_URL}/images/main/main_img.jpg`} alt="Section 1" className="section1-image" />
          
        </div>
        <div className="section1-content">
          <Link to="/">
            <img src={`${process.env.PUBLIC_URL}/images/logo.png`} alt="Logo" className="logo" />
          </Link>
          <p>
            동네방네는 이웃들과 소통할 수 있는 커뮤니티 사이트입니다.<br/> 게시판, 실시간 채팅, 친구 만들기, 분실물 찾기, 지역 뉴스를 통해 <br/>이웃과 더 가까워지세요. 다양한 소식과 정보를 동네방네에서 만나보세요. 따뜻한 이웃들과 새로운 인연을 만들고, 지역사람들과의 교류를 통해 <br/>더 많은 정보를 공유하세요. 그리고 서로의 관심사에 대해 <br/>이야기하며 즐거운 시간을 보내세요.<br/> 동네방네는 여러분의 소중한 커뮤니티 공간입니다.<br/> 지금 바로 로그인하시고, 동네방네와 함께하세요!
          </p>
          <Link to="/login" className="btn-login">LOGIN</Link>
        </div>

        <button className="scroll-button" onClick={() => scrollToSection(section2Ref, -40)}>↓</button>
      </div>
      <div className="section2" ref={section2Ref}>
        
        <button className="scroll-button" onClick={() => scrollToSection(section1Ref, -100)}>↑</button>
      </div>
     
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
    </div>
  );
}
