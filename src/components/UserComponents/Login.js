import { Link } from "react-router-dom";
import styles from '../../css/UserCss/Login.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import React, { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function Login() {
  const idRef = useRef();
  const passwdRef = useRef();
  const emailRef = useRef();
  const userIdRef = useRef();
  const userEmailRef = useRef();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [foundId, setFoundId] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = idRef.current.value;
    const passwd = passwdRef.current.value;
    axios.post('http://localhost:9999/login', {
      id: id,
      passwd: passwd
    })
    .then(response => {
      alert('로그인 성공');
      login(response.data);
      navigate('/');
    })
    .catch(error => {
      setError('로그인 실패. 아이디와 비밀번호를 확인하세요.');
    });
  };

  const handleFindId = () => {
    const userEmail = emailRef.current.value;
    axios.post('http://localhost:9999/find-id', { email: userEmail })
      .then(response => {
        setFoundId(response.data);
      })
      .catch(error => {
        setError('아이디 찾기 실패. 이메일을 확인하세요.');
      });
  };

  const handleFindPassword = () => {
    const userId = userIdRef.current.value;
    const userEmail = userEmailRef.current.value;
    axios.post('http://localhost:9999/find-password', { id: userId, email: userEmail })
      .then(response => {
        alert('임시 비밀번호가 이메일로 전송되었습니다.');
        setShowPasswordPopup(false);
      })
      .catch(error => {
        setError('비밀번호 찾기 실패. 아이디와 이메일을 확인하세요.');
      });
  };

  return (
    <>
      <div className={styles.login_container}>
        <div className={styles.login_container_form}>
          <Link to="/" className={styles.logo_link}>
            <img src={`${process.env.PUBLIC_URL}/images/login/login_logo.png`} alt="Logo" className={styles.login_logo} />
          </Link>
          <p className={styles.intro_1}>동네방네에 오신것을 환영합니다.</p>
          <p className={styles.intro_2}>동네방네는 다양한 기능을 제공하는 지역 기반 커뮤니티입니다.</p>

         

         

          <div className={styles.separator}>
            <span className={styles.separator_text}>동네방네 아이디로 로그인</span>
          </div>

          <form onSubmit={handleSubmit}>   
            <div className={styles.form_group}>
              <label htmlFor="id">아이디</label>
              <input type="text" id="id" className={styles.login_input} name="id" ref={idRef} />
              <label htmlFor="passwd">비밀번호</label>
              <input type="password" id="passwd" className={styles.login_input} name="passwd" ref={passwdRef} />
            </div>
            <button type="submit" className={styles.btn_login_submit}>로그인</button>
          </form>
          {error && <div className={styles.error_message}>{error}</div>}
          <button onClick={() => setShowPopup(true)} className={styles.btn_find_id}>아이디 찾기</button>
<button onClick={() => setShowPasswordPopup(true)} className={styles.btn_find_password}>비밀번호 찾기</button>

<p className={styles.noregister}>
  아직 회원이 아니신가요? <Link to="/register">회원가입</Link>
</p>
        </div>
      </div>

      {showPopup && (
        <div className={styles.popup}>
          <div className={styles.popup_inner}>
            <h2>아이디 찾기🔐</h2>
            {error && <div className={styles.error_message}>{error}</div>}
            <input type="email" placeholder="이메일 입력" ref={emailRef} />
            <button onClick={handleFindId}>찾기</button>
            {foundId && <div>아이디: {foundId}</div>}
            <button onClick={() => setShowPopup(false)}>닫기</button>
          </div>
        </div>
      )}

      {showPasswordPopup && (
        <div className={styles.popup}>
          <div className={styles.popup_inner}>
            <h2>비밀번호 찾기🔐</h2>
            {error && <div className={styles.error_message}>{error}</div>}
            <input type="text" placeholder="아이디 입력" ref={userIdRef} />
            <input type="email" placeholder="이메일 입력" ref={userEmailRef} />
            <button onClick={handleFindPassword}>찾기</button>
            <button onClick={() => setShowPasswordPopup(false)}>닫기</button>
          </div>
        </div>
      )}
    </>
  );
}
