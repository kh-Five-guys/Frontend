import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import '../../css/MainCss/PopularPosts.css';

export default function PopularPosts() {
  const [mostViewedPosts, setMostViewedPosts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const postsPerPage = 5; // 한 번에 보여줄 게시물 수를 컴포넌트 내에서 관리

  useEffect(() => {
    const fetchMostViewedPosts = async () => {
      try {
        const response = await axios.get('http://localhost:9999/board/mainlist');
        setMostViewedPosts(response.data.list);
      } catch (error) {
        console.error("Error fetching most viewed posts", error);
      }
    };

    fetchMostViewedPosts();
  }, []);

  const handleNext = () => {
    if (currentIndex + postsPerPage < mostViewedPosts.length) {
      setCurrentIndex(currentIndex + postsPerPage);
    }
  };

  const handlePrev = () => {
    if (currentIndex - postsPerPage >= 0) {
      setCurrentIndex(currentIndex - postsPerPage);
    }
  };

  return (
    <div>
      <div className='popular-container'>
      <div className='board-popular-top'>
        <h3>실시간 인기글</h3>
        <Link to="/board" className='board-popular-link'>게시판으로 이동</Link>
      </div>
      

      {mostViewedPosts.length > 0 ? (
        <>
          <table className="board-table">
            <thead>
              <tr>
                <th>순위</th>
                <th>제목</th>
                <th>작성자</th>
                <th>추천수</th>
                <th>지역</th>
              </tr>
            </thead>
            <tbody>
              {mostViewedPosts.slice(currentIndex, currentIndex + postsPerPage).map((post, index) => (
                <tr key={index}>
                  <td>{currentIndex + index + 1}</td>
                  <td>
                    <Link to={`/board/${post.boardNo}`}>
                      {post.boardTitle}
                    </Link>
                  </td>
                  <td>{post.userNick}</td>
                  <td>{post.boardLike}</td>
                  <td>
                    <div className={`popular-categorie-name-style popular-categorie${post.categorieNo}`}>
                      <p>{post.categorieName}</p>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="slider-buttons">
            <button onClick={handlePrev} disabled={currentIndex === 0}>이전</button>
            <button onClick={handleNext} disabled={currentIndex + postsPerPage >= mostViewedPosts.length}>다음</button>
          </div>
        </>
      ) : (
        <p>게시물이 없습니다.</p>
      )}
      </div>
    </div>
  );
}
