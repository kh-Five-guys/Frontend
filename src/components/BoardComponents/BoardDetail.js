import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import styles from '../../css/BoardCss/BoardDetail.module.css';
axios.defaults.withCredentials = true;

const fetchBoardDetail = async (boardNo, setBoard, setCommentList, setFileList) => {
  try {
    const { data } = await axios.get(`http://localhost:9999/board/${boardNo}`);
    setBoard(data.board);
    setCommentList(data.commentList);
    setFileList(data.fileList);
  } catch (error) {
    console.error('Error fetching board detail:', error);
  }
};

const BoardDetail = () => {
  const { boardNo } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [board, setBoard] = useState(null);
  const [commentList, setCommentList] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [fileList, setFileList] = useState([]); // 파일 목록 상태 추가
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchBoardDetail(boardNo, setBoard, setCommentList, setFileList).finally(() => setIsLoading(false));
  }, [boardNo]);

  const handleBoardReaction = useCallback(async (type) => {
    if (!user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }

    try {
      const { data } = await axios.get(`http://localhost:9999/board${type}/${boardNo}`);
      setBoard(prevBoard => ({ ...prevBoard, [type === 'Like' ? 'boardLike' : 'boardHate']: data.count }));
    } catch (error) {
      console.error(`Error ${type.toLowerCase()}ing board:`, error);
    }
  }, [user, boardNo, navigate]);

  const handleCommentReaction = useCallback(async (type, cno) => {
    if (!user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }

    try {
      const { data } = await axios.get(`http://localhost:9999/comment${type}/${cno}`);
      setCommentList(prevComments =>
        prevComments.map(comment =>
          comment.commentNo === cno ? { ...comment, [type === 'Like' ? 'commentLike' : 'commentHate']: data.count } : comment
        )
      );
    } catch (error) {
      console.error(`Error ${type.toLowerCase()}ing comment:`, error);
    }
  }, [user, navigate]);

  const handleNewCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleNewCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }

    if (newComment.trim() === '' || newComment.length > 300) {
      alert('댓글은 공백일 수 없으며 300자를 초과할 수 없습니다.');
      return;
    }

    try {
      await axios.post('http://localhost:9999/comment/add', {
        boardNo: boardNo,
        userId: user.userId,
        commentContent: newComment,
      });
      // 댓글 작성 후 전체 댓글 목록을 다시 가져옵니다.
      await fetchBoardDetail(boardNo, setBoard, setCommentList, setFileList);
      setNewComment('');
    } catch (error) {
      console.error("Error adding comment", error);
      alert('댓글 추가 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteComment = async (cno) => {
    if (!user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }
  
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      try {
        const response = await axios.delete(`http://localhost:9999/comment/delete`, { params: { cno: cno, bno: boardNo } });
        if (response.data.status === 'success') {
          // 댓글 삭제 후 전체 댓글 목록을 다시 가져옵니다.
          await fetchBoardDetail(boardNo, setBoard, setCommentList, setFileList);
        } else {
          alert('댓글 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error("Error deleting comment", error);
        alert('댓글 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleDeleteBoard = async () => {
    if (!user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }
  
    if (window.confirm('게시글을 삭제하시겠습니까?')) {
      if (user.userId !== board.userId) {
        alert('삭제 권한이 없습니다.');
        return;
      }
  
      try {
        const response = await axios.delete(`http://localhost:9999/board/delete/${boardNo}`);
        if (response.data.status === 'success') {
          alert('게시글이 삭제되었습니다.');
          navigate('/board');
        } else {
          alert('게시글 삭제에 실패했습니다.');
        }
      } catch (error) {
        console.error("Error deleting board", error);
        alert('게시글 삭제 중 오류가 발생했습니다.');
      }
    }
  };


  const handleCommentInputClick = () => {
    if (!user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
    }
  };
  

  const handleEditBoard = () => {
    if (!user) {
      if (window.confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
        navigate('/login');
      }
      return;
    }

    if (user.userId !== board.userId) {
      alert('수정 권한이 없습니다.');
      return;
    }

    navigate(`/board/update/${boardNo}`);
  };

  if (isLoading) return <div>Loading...</div>; // 로딩 중일 때 표시



  if (!board) return <div>게시글을 불러오지 못했습니다.</div>;



  const formatDate = (dateString) => {
    const options = {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
  
    return new Date(dateString)
      .toLocaleString('ko-KR', options)
      .replace(/\.\s/g, '.') // 점 뒤의 공백 제거
      .replace(/\./g, '.  ') // 모든 점 뒤에 두 칸의 공백 추가
      .replace(/(\d{2})\.\s\s(\d{2})\.\s\s(\d{2})\.\s\s/, '$1.$2.$3  ') // 날짜 부분의 점 뒤의 공백 조정
      .trim(); // 양 끝의 공백 제거
  };
  

  const removeUUID = (fileName) => {
    const parts = fileName.split('_');
    return parts.length > 1 ? parts.slice(1).join('_') : fileName;
  }

  return (
    <div className={styles.boardDetailContainer}>
      <div className={`${styles.categorieNameStyle} ${styles[`categorie${board.categorieNo}`]}`}>
        <p>{board.categorieName}</p>

      </div>

      <div className={styles.boardDetailHeader}>
        

        <div className={styles.boardDetailMain}>
          <p className={styles.boardTitleSt}>{board.boardTitle}</p>

          <div className={styles.profileDown}>
          <div className={styles.memberProfile}>
            
            <img 
              src={board.userProImg} 
              alt={`${board.userNick}의 프로필 사진`} 
              className={styles.profileImage}
            />
            <p className={styles.author}>{board.userId}</p>
            <div className={styles.separator}>|</div>
            <p className={styles.date}>{board.boardWriteDate}</p>
          </div>

          <div className={styles.boardItemInfo}>
                      <div className={styles.statItem}>
                        <img src="/images/board/view.png" alt="조회수 아이콘" className={styles.statIcon_1} />
                        <span>{board.boardCount}</span>
                      </div>
                      <div className={styles.statItem}>
                        <img src="/images/board/like.png" alt="추천수 아이콘" className={styles.statIcon_2} />
                        <span>{board.boardLike}</span>
                      </div>
                      <div className={styles.statItem}>
                        <img src="/images/board/comment.png" alt="댓글수 아이콘" className={styles.statIcon_3} />
                        
                        <span>{board.commentCount}</span>
                      </div>
                    </div>


          </div>

          
          


          
        </div>

        

        
        
        
        


        <div className={styles.contenttt} dangerouslySetInnerHTML={{ __html: board.boardContent }} /> {/* HTML content 출력 */}

        
        
        
        
        
      </div>
      <div className={styles.boardDetailButtons}>
        <p>{board.boardLike}</p>
        <button onClick={() => handleBoardReaction('Like')} className={styles.boardDetaillikeButtons}>추천</button>
        <button onClick={() => handleBoardReaction('Hate')} className={styles.boardDetailhateButtons}>비추천</button>
        <p>{board.boardHate}</p>
      </div>
      <hr />
      <div className={styles.updateButton}>
      <button onClick={handleDeleteBoard} className={styles.deleteButton}>삭제</button>
      <button onClick={handleEditBoard} className={styles.updaButton}>수정</button>

      </div>
      

        
      {fileList.length > 0 && (
        <>
        <div className={styles.boardAttachments}>
        <p className={styles.fileNamaa}>
          첨부파일 <span className={styles.fileCount}>{fileList.length}</span>
        </p>
        <ul className={styles.fileList}>
          {fileList.map((file, index) => (
            <li key={index}>
              <a href={`http://localhost:9999/download/${file.fno}`} download={removeUUID(file.fileName)}>{removeUUID(file.fileName)}</a>
            </li>
          ))}
        </ul>
        
      </div>
      <hr className={styles.fileHr}></hr>
      </>
      )}

      
      <div className={styles.boardComments}>
        
        <form onSubmit={handleNewCommentSubmit} className={styles.commentForm}>
          <textarea className={styles.userComment}
            value={newComment}
            onChange={handleNewCommentChange}
            onClick={handleCommentInputClick}
            placeholder="댓글을 입력하세요"
          />
          <button type="submit" className={styles.commentButton}>댓글 작성</button>
        </form>


        {commentList.length > 0 ? (
          <ul className={styles.commentList}>
            {commentList.map((comment, index) => (
              <li key={index} className={styles.commentItem}>

                <div className={styles.commentPro}>
                  <div className={styles.forComment}>
                    <img
                      src={board.userProImg}
                      alt={`${board.userNick}의 프로필 사진`}
                      className={styles.profileImage}
                    />
                    <p className={styles.author}>{comment.userId}</p>
                  </div>

                  <div className={styles.forComment2}>
                    {user && user.userId === comment.userId && (
                      <button onClick={() => handleDeleteComment(comment.commentNo)} className={styles.commentXButton}>삭제</button>
                    )}
                    <p className={styles.date}>{comment.commentWriteDate}</p>
                  </div>
                </div>




                <div className={styles.commentPro2}>
                  <p className={styles.commentConn}>{comment.commentContent}</p>
                  <div className={styles.commentActions}>
                    <button className={styles.commentlikeButton} onClick={() => handleCommentReaction('Like', comment.commentNo)}>
                      <img src="/images/board/commentlike.png" alt="좋아요" />
                    </button>
                    <p className={styles.smallMargin}>{comment.commentLike}</p>
                    <button className={styles.commentlikeButton} onClick={() => handleCommentReaction('Hate', comment.commentNo)}>
                      <img src="/images/board/commentdislike.png" alt="싫어요" />
                    </button>
                    <p>{comment.commentHate}</p>
                  </div>
                </div>
                
                

                



              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.noComment}>댓글이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

export default BoardDetail;
