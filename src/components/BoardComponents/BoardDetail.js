import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import ScrollToTop from '../ScrollToTop';
import '../../css/BoardCss/BoardDetail.css'; // 스타일 시트 추가

axios.defaults.withCredentials = true;

const BoardDetail = () => {
  const { boardNo } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [board, setBoard] = useState(null);
  const [commentList, setCommentList] = useState([]);

  useEffect(() => {
    const fetchBoardDetail = async () => {
      try {
        const { data } = await axios.get(`http://localhost:9999/board/${boardNo}`);
        setBoard(data.board);
        setCommentList(data.commentList);
      } catch (error) {
        console.error('Error fetching board detail:', error);
      }
    };

    fetchBoardDetail();
  }, [boardNo]);

  const handleBoardReaction = async (type) => {
    if (!user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }

    try {
      const { data } = await axios.get(`http://localhost:9999/board${type}/${boardNo}`);
      console.log(`${type} response:`, data);
      setBoard(prevBoard => ({ ...prevBoard, [type === 'Like' ? 'boardLike' : 'boardHate']: data.count }));
    } catch (error) {
      console.error(`Error ${type.toLowerCase()}ing board:`, error);
    }
  };

  const handleCommentReaction = async (type, cno) => {
    if (!user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }

    try {
      const { data } = await axios.get(`http://localhost:9999/comment${type}/${cno}`);
      console.log(`${type} response:`, data);
      setCommentList(prevComments =>
        prevComments.map(comment =>
          comment.commentNo === cno ? { ...comment, [type === 'Like' ? 'commentLike' : 'commentHate']: data.count } : comment
        )
      );
    } catch (error) {
      console.error(`Error ${type.toLowerCase()}ing comment:`, error);
    }
  };

  if (!board) return <div>Loading...</div>;

  return (
    <div className="board-detail-container">
    <ScrollToTop />
    <div className="board-detail-header">
      <h2>{board.boardTitle}</h2>
      <p className="content">{board.boardContent}</p>
      <p className="author">작성자: {board.userId}</p>
      <p className="date">작성일: {board.boardWriteDate}</p>
      <p className="views">조회수: {board.boardCount}</p>
      <p className="likes">좋아요: {board.boardLike}</p>
      <p className="dislikes">싫어요: {board.boardHate}</p>
    </div>
    <div className="board-detail-buttons">
      <button onClick={() => handleBoardReaction('Like')}>좋아요</button>
      <button onClick={() => handleBoardReaction('Hate')}>싫어요</button>
    </div>
    <hr />
    <div className="board-comments">
      <h3>댓글</h3>
      {commentList.length > 0 ? (
        <ul className="comment-list">
          {commentList.map((comment, index) => (
            <li key={index} className="comment-item">
              <p className="author">{comment.userId}: {comment.commentContent}</p>
              <p className="date">{comment.commentWriteDate}</p>
              <p className="likes">Likes: {comment.commentLike}, Dislikes: {comment.commentHate}</p>
              <div className="comment-actions">
                <button onClick={() => handleCommentReaction('Like', comment.commentNo)}>좋아요</button>
                <button className="dislike-button" onClick={() => handleCommentReaction('Hate', comment.commentNo)}>싫어요</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>댓글이 없습니다.</p>
      )}
    </div>
  </div>
  );
};

export default BoardDetail;
