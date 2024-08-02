import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../css/UserCss/MyPage.module.css'; // CSS 모듈 import
import { useAuth } from '../../contexts/AuthContext';
import PostcodeComponent from '../../contexts/PostcodeComponent';

export default function MyPage() {
  const { user, setUser } = useAuth();
  const [nickName, setNickName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [address, setAddress] = useState('');
  const [extraAddress, setExtraAddress] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setNickName(user.userNick);
      setAddress(user.userAddress);
    }
  }, [user]);

  const handleUpdate = () => {
    setError(''); // 기존 오류 메시지 초기화

    if (!currentPassword) {
      setError('현재 비밀번호를 입력해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('nickName', nickName);
    formData.append('currentPassword', currentPassword);
    formData.append('newPassword', newPassword);
    formData.append('address', address);
    formData.append('extraAddress', extraAddress);
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }

    axios.post('http://localhost:9999/updateProfile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then(response => {
        alert('변경 완료');
        setUser(response.data); // 업데이트된 사용자 데이터를 설정
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

  return (
    <div className={styles['mypage-container']}>
      <h1 className={styles['hash-title']}>#</h1> <h1>마이페이지</h1>
      <div className={styles['user-info']}>
        <div className={styles['user-id']}>아이디 : {user?.userId}</div>
        <div className={styles['user-profile']}>
          <div
            className={styles['profile-pic-container']}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {profileImage ? (
              <img src={URL.createObjectURL(profileImage)} alt="User Profile" className={styles['profile-pic']} />
            ) : user?.userProImg ? (
              <img src={user.userProImg} alt="User Profile" className={styles['profile-pic']} />
            ) : (
              <div className={styles['profile-pic-placeholder']}>프로필 이미지 없음</div>
            )}
          </div>
        </div>
        <div className={styles['input-group']}>
          <label>* 현재 비밀번호</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="기존의 비밀번호를 입력해주세요"
          />
          {error && <div className={styles['error-message']}>{error}</div>}
        </div>
        <div className={styles['input-group']}>
          <label>* 변경할 비밀번호</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="변경할 비밀번호를 입력해주세요"
          />
        </div>
        <div className={styles['input-group']}>
          <label>* 닉네임 변경</label>
          <input
            type="text"
            value={nickName}
            onChange={(e) => setNickName(e.target.value)}
          />
        </div>

        <div className={styles['input-group']}>
          <label>* 주소 변경</label>
          <PostcodeComponent
            address={address}
            setAddress={setAddress}
            extraAddress={extraAddress}
            setExtraAddress={setExtraAddress}
          />
        </div>
        <button onClick={handleUpdate} className={styles['btn-update']}>
          변경 완료
        </button>
      </div>
    </div>
  );
}
