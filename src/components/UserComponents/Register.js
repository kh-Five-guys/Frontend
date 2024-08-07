import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import '../../css/UserCss/Register.css';
import PostcodeComponent from '../../contexts/PostcodeComponent';
import defaultProfileImage from '../../img/register/user.png'; // 기본 이미지 경로

const ProfileImageUpload = ({ setUserProImg }) => {
  const [preview, setPreview] = useState('');

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
        setUserProImg(e.target.result); // Base64 인코딩된 이미지 설정
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="profile-image-upload"
         onDrop={handleDrop}
         onDragOver={handleDragOver}>
      {preview ? (
        <img src={preview} alt="Profile Preview" className="profile-preview" />
      ) : (
        <p>프로필 사진을 <br/>드래그 해주세요</p>
      )}
    </div>
  );
};

// 회원가입 컴포넌트
function Register() {
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userEmailProvider, setUserEmailProvider] = useState('naver.com'); // 기본 이메일 제공자 설정
  const [userPasswd, setUserPasswd] = useState('');
  const [userNick, setUserNick] = useState('');
  const [address, setAddress] = useState('');
  const [detailAddress, setDetailAddress] = useState('');
  const [extraAddress, setExtraAddress] = useState('');
  const [userProImg, setUserProImg] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [showManualCoordinates, setShowManualCoordinates] = useState(false); // 수동 좌표 입력창 표시 여부

  const navigate = useNavigate(); // useNavigate 훅 사용

  useEffect(() => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const geocoder = new window.kakao.maps.services.Geocoder();

      const fetchCoordinates = (address) => {
        console.log('Fetching coordinates for address:', address); // 디버깅: 주소 확인
        geocoder.addressSearch(address, (result, status) => {
          console.log('Geocoder result:', result); // 디버깅: 결과 확인
          console.log('Geocoder status:', status); // 디버깅: 상태 확인
          if (status === window.kakao.maps.services.Status.OK && result[0]) {
            const { y: latitude, x: longitude } = result[0];
            setLatitude(latitude);
            setLongitude(longitude);
            setShowManualCoordinates(false); // 지오코딩 결과가 있으면 수동 입력창 숨기기
          } else {
            setLatitude(null);
            setLongitude(null);
            setShowManualCoordinates(true); // 지오코딩 결과가 없으면 수동 입력창 표시
            console.error('주소 검색 실패');
          }
        });
      };

      const fullAddress = `${address} ${extraAddress} ${detailAddress}`.trim();
      if (fullAddress) {
        fetchCoordinates(fullAddress);
      }
    } else {
      console.error('카카오 API가 로드되지 않았습니다.');
    }
  }, [address, extraAddress, detailAddress]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userEmailFull = `${userEmail}@${userEmailProvider}`;
    
    // 위도와 경도 값을 결정
    const finalLatitude = latitude !== null ? latitude : null;
    const finalLongitude = longitude !== null ? longitude : null;

    const user = {
      userId,
      userEmail: userEmailFull,
      userPasswd,
      userNick,
      userAddress: `${address} ${extraAddress} ${detailAddress}`,
      userProImg: userProImg || defaultProfileImage, // 프로필 이미지가 없으면 기본 이미지 사용
      latitude: finalLatitude,
      longitude: finalLongitude
    };

    try {
      const response = await fetch('http://localhost:9999/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });

      if (response.ok) {
        alert('회원가입 성공');
        navigate('/login'); // 회원가입 성공 시 /login 경로로 리디렉션
      } else {
        alert('회원가입 실패');
      }
    } catch (error) {
      console.error('회원가입 오류:', error);
      alert('회원가입 과정에서 오류가 발생했습니다.');
    }
  };

  return (
    <div className="register-container">
      <Link to="/" className="logo_link">
        <img src={`${process.env.PUBLIC_URL}/images/login/login_logo.png`} alt="Logo" className="register_logo" />
      </Link>
      <p className="intro_1">동네방네에 오신 것을 환영합니다.</p>
      <p className="intro_2">동네방네는 다양한 기능을 제공하는<br/> 지역 기반 커뮤니티입니다.</p>
      <h2>회원가입</h2>
      <ProfileImageUpload setUserProImg={setUserProImg} />
      <form onSubmit={handleSubmit}>
        <div className="separator">
          <span className="separator-text">회원 정보를 입력해주세요</span>
        </div>
        <input type="text" placeholder="아이디를 입력하세요" required value={userId} onChange={(e) => setUserId(e.target.value)} />
        <div className="email-container">
          <input type="text" placeholder="e-mail" required value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
          <p>@</p>
          <select value={userEmailProvider} onChange={(e) => setUserEmailProvider(e.target.value)}>
            <option value="naver.com">naver.com</option>
            <option value="gmail.com">gmail.com</option>
            <option value="daum.net">daum.net</option>
            <option value="nate.com">nate.com</option>
          </select>
        </div>
        <input type="password" placeholder="비밀번호를 입력하세요" required value={userPasswd} onChange={(e) => setUserPasswd(e.target.value)} />
        <input type="text" placeholder="닉네임을 입력하세요" required value={userNick} onChange={(e) => setUserNick(e.target.value)} />
        <div className="separator">
          <span className="separator-text">주소를 입력해주세요</span>
        </div>
        <PostcodeComponent
          address={address}
          setAddress={setAddress}
          detailAddress={detailAddress}
          setDetailAddress={setDetailAddress}
          extraAddress={extraAddress}
          setExtraAddress={setExtraAddress}
        />
        {showManualCoordinates && (
          <div className="manual-coordinates">
            <span className="separator-text">위도 경도정보가 정확하지 않습니다 위도 경도를 입력해주세요</span>
            <input
              type="text"
              placeholder="위도를 입력하세요"
              value={latitude !== null ? latitude : ''}
              onChange={(e) => setLatitude(e.target.value)}
            />
            <input
              type="text"
              placeholder="경도를 입력하세요"
              value={longitude !== null ? longitude : ''}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </div>
        )}
        <button type="submit">회원가입</button>
      </form>
    </div>
  );
}

export default Register;
