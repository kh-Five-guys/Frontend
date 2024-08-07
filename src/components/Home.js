import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; 
import { Link, useNavigate } from 'react-router-dom';
import MainNews from './MainComponents/MainNews'; 
import Quiz from './MainComponents/Quiz'; 
import PopularPosts from './MainComponents/PopularPosts'; 
import FriendManage from './FriendComponents/FriendManage'; // FriendManage 컴포넌트 가져오기

export default function Home() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const { user, logout } = useAuth();
  const [userRankNo, setUserRankNo] = useState(null); // userRankNo 상태 추가
  const [isFriendManageOpen, setIsFriendManageOpen] = useState(false); // 추가된 상태
  const navigate = useNavigate();

  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  const mapRef = useRef(null);

  const [articles, setArticles] = useState([]);
  const [newsIndex, setNewsIndex] = useState(0);
  const newsInterval = useRef(null);

  const articlesPerPage = 1; 

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
        withCredentials: true 
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

  const toggleFriendManage = () => {
    setIsFriendManageOpen(!isFriendManageOpen);
  };

  useEffect(() => {
    if (user) {
      setUserRankNo(user.rankNo);
    }
  }, [user]);

  useEffect(() => {
    const fetchArticles = async () => {
      const apiKey = 'd6d9128e58c34dd8addd373daf069b1e';
      const region = '서울';
      const url = `https://newsapi.org/v2/everything?q=${region}&language=ko&apiKey=${apiKey}`;
      try {
        const response = await axios.get(url, { withCredentials: false });
        setArticles(response.data.articles);
      } catch (error) {
        console.error('뉴스를 가져오는 중 오류 발생:', error);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => {
    newsInterval.current = setInterval(() => {
      setNewsIndex((prevIndex) => (prevIndex + 1) % articles.length);
    }, 5000);

    return () => clearInterval(newsInterval.current);
  }, [articles.length]);

  const handleNextNews = () => {
    setNewsIndex((prevIndex) => (prevIndex + 1) % articles.length);
  };

  const handlePrevNews = () => {
    setNewsIndex((prevIndex) => (prevIndex - 1 + articles.length) % articles.length);
  };

  return (
    <>
    <div className="container">
      <div className="section1" ref={section3Ref}>
        <div className="section1_div1">
          <p className='section1_div1_h'>동네방네 - 지역기반 커뮤니티 사이트 ✨</p>
          <p className='section1_div1_p'>
            지역 주민들을 위한 다양한 커뮤니티 기능을 제공합니다!<br/>
            게시판, 실시간 채팅, 지도 서비스 등 다양한 기능을 통해
            지역사회와 소통하고 정보를 공유하세요!
          </p>
          <img src={`${process.env.PUBLIC_URL}/images/main/main_img.png`} alt="section1_div1" className="section1_div1_image" />
        </div>

        <div className='section1_div2'>
          <div className='section1_div2_div1'>
            <PopularPosts />
          </div>

          <div className='section1_div2_div1'>
            <MainNews/>
          </div>

          <div className='section1_div2_div1'>
            {user ? (
              <div className='section1_login'>
                <div className='section1_login_div1'>

                  <img 
                    src={user.userProImg} 
                    alt={`${user.userNick}의 프로필 사진`} 
                    className="mainuserprof"
                  />

                  <div>
                    <span className="header-welcome_message">{user.userNick}님 안녕하세요</span>  
                    
                  </div>
                  
                </div>


                <Link to={userRankNo === 0 ? "/admin" : "/mypage"} className="header-btn_mypage">
                  {userRankNo === 0 ? "관리자 페이지" : "마이페이지"}
                </Link>
                
                
                <div className='header-login-margin'>
                  <button onClick={toggleFriendManage} className="header-btn_friendmanage">친구목록</button>
                  <button onClick={handleLogout} className="header-btn_logout">로그아웃</button>  
                </div>

                

                

                

              </div>
            ) : (
              <div className='section1_logout'>
                <p className='loginalignleft1'>로그인</p>
                <p className='loginalignleft2'>동네방네에 로그인하시면 <br></br> 다양한 서비스를 이용하실 수 있어요!</p>
                <div className='loginAndRegis'>
                  <Link to="/login" className="header-btn_login">로그인</Link>
                  <Link to="/register" className="header-btn_register">회원가입</Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="section2">
        <div className="section2_div1">
          <Quiz />
        </div>
        <div className="section2_div2">
          <div className="section2_div2_friend">
            <p className='friendTitle'>친구 찾기</p>
            <Link to="/friend" className='home-friend-button'>▶</Link>
          </div>
          <p className='mainbold'>지도를 통해 주변 친구를 찾고 메시지를 주고받을 수 있어요!</p>
          <img 
            src={`${process.env.PUBLIC_URL}/images/main/mainfriend.png`} 
            alt="지도에서 친구 찾기" 
            className="main-friend-image"
          />
          
        </div>
      </div>

      <div className="section3">
        <div className="section3_div1">
          <div className='mainchatcss'>
            <img src={`${process.env.PUBLIC_URL}/images/main/mainchat.png`} alt="친구 찾기" className="mainchatimg" />
            <Link to="/chat" className='home-friend-button'>▶</Link>
          </div>
          
          
          
        </div>
      </div>

      <div className="section4">
        <div className="section4_div1">

          <p className="section4_div1_p">동네방네 특징들 🔥</p>

          <div className="section4_div1_p_info">

          <div className='section4_div1_p_info_item'>
            <img src={`${process.env.PUBLIC_URL}/images/main/info/board.png`} alt="게시글 작성" className="info_item_img" />
            <p className='info_item_p'>CKEditor를 통한 손쉬운 게시글 작성</p>
          </div>

          <div className='section4_div1_p_info_item'>
            <img src={`${process.env.PUBLIC_URL}/images/main/info/chat.png`} alt="실시간 채팅" className="info_item_img" />
            <p className='info_item_p'>웹소켓을 활용한 실시간 채팅</p>
          </div>

          <div className='section4_div1_p_info_item'>
            <img src={`${process.env.PUBLIC_URL}/images/main/info/friends.png`} alt="친구 찾기" className="info_item_img" />
            <p className='info_item_p'>카카오 지도 API를 활용한 주변 친구 찾기</p>
          </div>

          <div className='section4_div1_p_info_item'>
            <img src={`${process.env.PUBLIC_URL}/images/main/info/lost.png`} alt="분실물 검색" className="info_item_img" />
            <p className='info_item_p'>분실물 API를 활용한 분실물 검색</p>
          </div>

          <div className='section4_div1_p_info_item'>
            <img src={`${process.env.PUBLIC_URL}/images/main/info/news.png`} alt="지역별 뉴스" className="info_item_img" />
            <p className='info_item_p'>뉴스 API를 활용한 지역별 뉴스</p>
          </div>

          <div className='section4_div1_p_info_item'>
            <img src={`${process.env.PUBLIC_URL}/images/main/info/question.png`} alt="문의 접수" className="info_item_img" />
            <p className='info_item_p'>고객의 의견과 요청을 신속하게 처리하는 문의 접수 기능</p>
          </div>

          <div className='section4_div1_p_info_item'>
            <img src={`${process.env.PUBLIC_URL}/images/main/info/quiz.png`} alt="상식 퀴즈" className="info_item_img" />
            <p className='info_item_p'>다양한 주제로 재미있게 풀어보는 상식 퀴즈</p>
          </div>






          </div>

        


        </div>
      </div>


      






      {/* FriendManage 오버레이 */}
      {isFriendManageOpen && (
        <div className="header-overlay_container" onClick={toggleFriendManage}>
          <div className="header-overlay_content" onClick={e => e.stopPropagation()}>
            <FriendManage onClose={toggleFriendManage} />
            {/* <button className="header-overlay_close" onClick={toggleFriendManage}>닫기</button> */}
          </div>
        </div>
      )}
    </div>
    <div className="main-footer">
  <p className="main-footer_text">
    Chatting 상담하기 | 카카오톡 채널: OOOO | 텔레그램: 메시지 보내기
  </p>
  <p className="main-footer_text">
    OOOO 대표: 홍길동 | 소재지: 경기도 용인시 기흥구 강남서로 O, O층 OOO호 OOO호
  </p>
  <p className="main-footer_text">
    사업자등록번호: OOO-OO-OOOOO | 호스팅제공: OOO
  </p>
  <p className="main-footer_text">
    라이센스 및 교환환불정책
  </p>
</div>
    </>
  );
}
