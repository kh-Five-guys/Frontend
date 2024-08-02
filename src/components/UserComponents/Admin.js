import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../../css/UserCss/Admin.module.css';

export default function Admin() {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchOption, setSearchOption] = useState('userId');
  const [inquiries, setInquiries] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:9999/members')
      .then(response => setMembers(response.data))
      .catch(error => console.error('Error fetching members:', error));

    axios.get('http://localhost:9999/inquiries/member')
      .then(response => setInquiries(response.data))
      .catch(error => console.error('Error fetching inquiries:', error));
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleOptionChange = (e) => {
    setSearchOption(e.target.value);
  };

  const handleDeleteMember = (userId) => {
    const confirmed = window.confirm('회원 삭제를 하시겠습니까?');
    if (confirmed) {
      axios.delete(`http://localhost:9999/members/${userId}`)
        .then(() => {
          setMembers(members.filter(member => member.userId !== userId));
        })
        .catch(error => console.error('Error deleting member:', error));
    }
  };

  const handleRankChange = (userId, adjustment) => {
    const action = adjustment > 0 ? '올리겠습니까?' : '내리겠습니까?';
    const confirmed = window.confirm(`등급을 ${action}`);
    if (confirmed) {
      const member = members.find(member => member.userId === userId);
      if (!member) return;

      const newRankNo = member.rankNo + adjustment;

      axios.post(`http://localhost:9999/members/${userId}/rank`, { rankNo: newRankNo })
        .then(() => {
          setMembers(members.map(member =>
            member.userId === userId ? { ...member, rankNo: newRankNo } : member
          ));
        })
        .catch(error => console.error('Error updating rank:', error));
    }
  };

  const filteredMembers = members.filter(member => {
    if (searchOption === 'userId') {
      return member.userId.includes(searchTerm);
    } else if (searchOption === 'userNick') {
      return member.userNick.includes(searchTerm);
    } else if (searchOption === 'userAddress') {
      return member.userAddress.includes(searchTerm);
    } else if (searchOption === 'rankNo') {
      return member.rankNo.toString().includes(searchTerm);
    }
    return false;
  });

  return (
    <>
      <div className={styles.adminContainer1}>
        <h1>관리자 페이지</h1>
        <div className={styles.separator}>
          <span className={styles.separatorText}>회원 정보를 입력해 등급을 관리해주세요</span>
        </div>
        <div className={styles.searchContainer}>
          <select value={searchOption} onChange={handleOptionChange} className={styles.searchSelect}>
            <option value="userId">아이디</option>
            <option value="userNick">닉네임</option>
            <option value="userAddress">주소</option>
            <option value="rankNo">회원등급</option>
          </select>
          <input
            type="text"
            placeholder="회원 정보를 입력하세요"
            value={searchTerm}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
          <button className={styles.searchButton}>🔍</button>
        </div>
        <table className={styles.membersTable}>
          <thead>
            <tr>
              <th>프로필</th>
              <th>아이디</th>
              <th>닉네임</th>
              <th>주소</th>
              <th>회원등급</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member, index) => (
              <tr key={index}>
                <td><img src={member.userProImg} alt="profile" className={styles.profileImg} /></td>
                <td>{member.userId}</td>
                <td>{member.userNick}</td>
                <td>{member.userAddress}</td>
                <td>{member.rankNo}</td>
                <td>
                  <button className={styles.rankButton} onClick={() => handleRankChange(member.userId, 1)}>올리기</button>
                  <button className={styles.rankButton} onClick={() => handleRankChange(member.userId, -1)}>내리기</button>
                  <button className={styles.deleteButton} onClick={() => handleDeleteMember(member.userId)}>회원 삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.adminContainer2}>
        <h1>문의사항 목록</h1>
        <div className={styles.separator}>
          <span className={styles.separatorText}>문의사항을 확인해주세요</span>
        </div>
        <table className={styles.inquiriesTable}>
          <thead>
            <tr>
              <th>번호</th>
              <th>아이디</th>
              <th>제목</th>
              <th>내용</th>
              <th>작성일</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry, index) => (
              <tr key={index}>
                <td>{inquiry.id}</td>
                <td>{inquiry.userId}</td>
                <td>{inquiry.title}</td>
                <td>{inquiry.message}</td>
                <td>{inquiry.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
