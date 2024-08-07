import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/UserCss/MyPage.css';
import { useAuth } from '../../contexts/AuthContext';
import PostcodeComponent from '../../contexts/PostcodeComponent';

export default function MyPage() {
  const { user, logout } = useAuth(); // 추가된 logout 함수
  const [nickName, setNickName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [address, setAddress] = useState('');
  const [extraAddress, setExtraAddress] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [showManualCoordinates, setShowManualCoordinates] = useState(false); // 수동 좌표 입력창 표시 여부
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setNickName(user.userNick);
      setAddress(user.userAddress);
      // 초기 주소로 좌표 가져오기
      fetchCoordinates(user.userAddress);
    }
  }, [user]);

  useEffect(() => {
    if (address || extraAddress) {
      fetchCoordinates(`${address} ${extraAddress}`);
    }
  }, [address, extraAddress]);

  const fetchCoordinates = (fullAddress) => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.services) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      geocoder.addressSearch(fullAddress, (result, status) => {
        if (status === window.kakao.maps.services.Status.OK && result[0]) {
          const { y: lat, x: lng } = result[0];
          setLatitude(lat);
          setLongitude(lng);
          setShowManualCoordinates(false); // 지오코딩 결과가 있으면 수동 입력창 숨기기
        } else {
          setLatitude(null);
          setLongitude(null);
          setShowManualCoordinates(true); // 지오코딩 결과가 없으면 수동 입력창 표시
          console.error('주소 검색 실패');
        }
      });
    } else {
      console.error('카카오 API가 로드되지 않았습니다.');
    }
  };

  const handleUpdate = () => {
    setError(''); // 기존 오류 메시지 초기화

    if (!currentPassword) {
      setError('현재 비밀번호를 입력해주세요.');
      return;
    }

    // 수동 입력이 있는 경우 기존 latitude, longitude 값을 업데이트합니다.
    const finalLatitude = latitude !== null ? latitude : manualLat;
    const finalLongitude = longitude !== null ? longitude : manualLng;

    const formData = new FormData();
    formData.append('nickName', nickName);
    formData.append('currentPassword', currentPassword);
    if (newPassword) formData.append('newPassword', newPassword);
    if (address) formData.append('address', address);
    if (extraAddress) formData.append('extraAddress', extraAddress);
    if (finalLatitude) formData.append('latitude', finalLatitude.toString()); // 최종 위도 값
    if (finalLongitude) formData.append('longitude', finalLongitude.toString()); // 최종 경도 값
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    axios.post('http://localhost:9999/updateProfile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // 이 줄을 추가하여 multipart/form-data 설정
      },
    })
    .then(response => {
      alert('변경 완료');
    })
    .catch(error => {
      if (error.response && error.response.status === 401) {
        setError('비밀번호를 다시 확인해주세요.');
      } else {
        console.error('Error updating profile:', error);
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setProfileImage(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDelete = () => {
    if (window.confirm('정말로 회원탈퇴 하시겠습니까?')) {
      axios.delete(`http://localhost:9999/members/${user.userId}`)
        .then(response => {
          alert('회원탈퇴가 완료되었습니다.');
          logout(); // 로그아웃 함수 호출 (세션 종료 등)
          navigate('/'); // 메인 페이지로 이동
        })
        .catch(error => {
          console.error('Error deleting account:', error);
          alert('회원탈퇴에 실패했습니다. 나중에 다시 시도해 주세요.');
        });
    }
  };

  return (
    <div className="mypage-container">
      <h1 className="hash-title">#</h1> <h1>마이페이지</h1>
      <div className="user-info">
        <div className="user-id">아이디 : {user?.userId}</div>
        <div className="user-profile">
          <div
            className="profile-pic-container"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {profileImage ? (
              <img src={URL.createObjectURL(profileImage)} alt="User Profile" className="profile-pic" />
            ) : user?.userProImg ? (
              <img src={user.userProImg} alt="User Profile" className="profile-pic" />
            ) : (
              <div className="profile-pic-placeholder">프로필 이미지 없음</div>
            )}
          </div>
        </div>
        <div className="input-group">
          <label>* 현재 비밀번호</label>
          <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="기존의 비밀번호를 입력해주세요" />
          {error && <div className="error-message">{error}</div>}
        </div>
        <div className="input-group">
          <label>* 변경할 비밀번호</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="변경할 비밀번호를 입력해주세요" />
        </div>
        <div className="input-group">
          <label>* 닉네임 변경</label>
          <input type="text" value={nickName} onChange={(e) => setNickName(e.target.value)} />
        </div>
        <div className="input-group">
          <label>* 주소 변경</label>
          <PostcodeComponent
            address={address}
            setAddress={setAddress}
            extraAddress={extraAddress}
            setExtraAddress={setExtraAddress}
          />
        </div>
        {showManualCoordinates && (
          <div className="manual-coordinates">
            <span className="separator-text">위도와 경도가 정확하지 않습니다. 수동으로 입력해 주세요.</span>
            <input
              type="text"
              placeholder="위도를 입력하세요"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
            />
            <input
              type="text"
              placeholder="경도를 입력하세요"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
            />
          </div>
        )}
        <button onClick={handleUpdate} className="btn-update">변경 완료</button>
      </div>

      <div className="separator">
        <span className="separator-text">
          <button onClick={handleDelete} className="btn-delete">회원탈퇴</button>
        </span>
      </div>
    </div>
  );
}
