import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; 
import { Link, useNavigate } from 'react-router-dom';

export default function Home() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  const mapRef = useRef(null); // Kakao map reference

  const [mostViewedPosts, setMostViewedPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const handleLogout = async () => {
    if (window.confirm('정말로 로그아웃 하시겠습니까?')) {
      try {
        await logout();
        navigate('/');
      } catch (error) {
        console.error('로그아웃 중 오류 발생:', error);
        alert('로그아웃 중 오류가 발생했습니다.');
      }
    }
  };

  useEffect(() => {
    const fetchMostViewedPosts = async () => {
      try {
        const response = await axios.get('http://localhost:9999/board/list?sortOrder=views&pageNo=1&pageSize=5');
        setMostViewedPosts(response.data.list);
      } catch (error) {
        console.error("Error fetching most viewed posts", error);
      }
    };

    fetchMostViewedPosts();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: '2-digit', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('ko-KR', options).replace(/\./g, '.').replace(/\.$/, '').replace(/\s/g, '');
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % mostViewedPosts.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + mostViewedPosts.length) % mostViewedPosts.length);
  };

  const navigateToBoard = () => {
    navigate('/board');
  };

  const navigateToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="container">
      <div className="section1" ref={section1Ref}>
        <div className="image-container">
          
          {user ? (
            <> <p>
                 마이페이지에 버튼을 클릭하시면<br/> 친구관리, 회원정보수정을 하실수있습니다! 
                 
          </p>
            <Link to="/mypage" className="btn-register">마이페이지</Link>
            </>
          ) : (
            <>
            <p>아직 동네방네 회원이 아니신가요? <br/>
            아래 회원가입 버튼을 눌러 회원가입을 하시고 <br/>주변 이웃들과 소통해보세요!</p>
            <Link to="/register" className="btn-register">회원가입</Link>
            </>
          )}
          <img src={`${process.env.PUBLIC_URL}/images/main/main_img.jpg`} alt="Section 1" className="section1-image" />
        </div>
        <div className="section1-content">
          <Link to="/">
            <img src={`${process.env.PUBLIC_URL}/images/logo.png`} alt="Logo" className="logo" />
          </Link>
          {user ? (
            <>
              <div className='user-name'>  <span className='user-nick'>'{user.userNick}'</span> 님 안녕하세요</div>
              <p>
               지금부터 동네방네의 더 다양한 기능을 사용하실수 있습니다.<br />
               이제 동네 이웃들과 채팅을 하거나,<br />
                친구를 추가하고 지역별 게시판에 참여하실수 있습니다.<br />
                다양한 활동으로 동네방네를 즐겨보세요.<br/>
                
             
              </p>
              <button onClick={handleLogout} className="btn-logout">LOGOUT</button>
            </>
          ) : (
            <>
              <p>
                동네방네는 이웃들과 소통할 수 있는 커뮤니티 사이트입니다.<br/> 게시판, 실시간 채팅, 친구 만들기, 분실물 찾기, 지역 뉴스를 통해 <br/>이웃과 더 가까워지세요. 다양한 소식과 정보를 동네방네에서 만나보세요. 따뜻한 이웃들과 새로운 인연을 만들고, 지역사람들과의 교류를 통해 <br/>더 많은 정보를 공유하세요. 그리고 서로의 관심사에 대해 <br/>이야기하며 즐거운 시간을 보내세요.<br/> 동네방네는 여러분의 소중한 커뮤니티 공간입니다.<br/> 지금 바로 로그인하시고, 동네방네와 함께하세요!
              </p>
              <Link to="/login" className="btn-login">LOGIN</Link>
            </>
          )}
        </div>
        <button className="scroll-button" onClick={() => scrollToSection(section2Ref, -40)}>↓</button>
      </div>

      <div className="section2" ref={section2Ref}>
        <button className="scroll-button top" onClick={() => scrollToSection(section1Ref, -100)}>↑</button>
        <div>Section 2 Content</div>
        <button className="scroll-button bottom" onClick={() => scrollToSection(section3Ref, -40)}>↓</button>
      </div>

      <div className="section3" ref={section3Ref}>
        {mostViewedPosts.length > 0 && (
          <div className="most-viewed-post">
            <button className="slider-button prev" onClick={handlePrev}>‹</button>
            <div className={`slide ${currentIndex === 0 ? 'active' : ''}`}>
              <h3>게시물 TOP {currentIndex + 1} 🔥</h3>
              <Link to={`/board/${mostViewedPosts[currentIndex].boardNo}`}>
                <h4>{mostViewedPosts[currentIndex].boardTitle}</h4>
              </Link>
              <p>작성자: {mostViewedPosts[currentIndex].userNick}</p>
              <p>조회수: {mostViewedPosts[currentIndex].boardCount}</p>
              <p>작성일: {formatDate(mostViewedPosts[currentIndex].boardWriteDate)}</p>
              <p>지역명: {mostViewedPosts[currentIndex].regionName}</p>
              <button className="btn-view-more" onClick={navigateToBoard}>게시물 보러가기</button>
            </div>
            <button className="slider-button next" onClick={handleNext}>›</button>
          </div>
        )}
        <div className="additional-div"> 
          {!user && (
            <div className="overlay">
              <h3>주변 친구 찾기👬</h3>
              <p>로그인 후 서비스 이용이 가능합니다.<br/>로그인 버튼을 클릭해 로그인해주세요.</p>
              <button className="btn-login" onClick={navigateToLogin}>로그인</button>
            </div>
          )}
        </div>
        <div>랜덤 뉴스</div>
        <div>채팅 바로가기</div>
        <button className="scroll-button" onClick={() => scrollToSection(section2Ref, -100)}>↑</button>
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
