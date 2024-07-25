import { useEffect, useState } from "react";
import { Link } from 'react-router-dom';
import axios from 'axios';
import ScrollToTop from '../ScrollToTop';
import '../../css/BoardCss/Board.css'; // 스타일 시트 추가

export default function Board() {
  const [boardList, setBoardList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);



  useEffect(() => {
    const readData = async (pageNo) => {
      axios.get(`http://localhost:9999/board/list?pageNo=${pageNo}`)
        .then(response => {
          console.log('Response:', response); // 응답 데이터 확인
          setBoardList(response.data.list);
          const pageCount = response.data.pagging.totalPage; // Spring에서 계산된 totalPage 사용
          console.log('Total Pages:', pageCount); // 계산된 페이지 수 확인
          setTotalPages(pageCount);
        })
        .catch(error => {
          console.error("Error fetching board data", error);
        });
    };

    readData(currentPage);
  }, [currentPage]);

  if (boardList.length === 0) return <div>Loading...</div>;

  const handlePageChange = (pageNo) => {
    setCurrentPage(pageNo);
  };

  return (
    <div className="board-container">
    <h2>게시판 목록</h2>
    <table>
      <thead>
        <tr>
          <th>번호</th>
          <th>제목</th>
          {/* <th>내용</th> */}
          <th>작성일</th>
          <th>수정일</th>
          <th>조회수</th>
          <th>작성자</th>
          <th>카테고리</th>
        </tr>
      </thead>
      <tbody>
        {boardList.map((item, idx) => (
          <tr key={idx}>
            <td>{item.boardNo}</td>
            <td>
              <Link to={`/board/${item.boardNo}`}>
                {item.boardTitle}
              </Link>
            </td>
            {/* <td>{item.boardContent}</td> */}
            <td>{item.boardWriteDate}</td>
            <td>{item.boardUpdateDate}</td>
            <td>{item.boardCount}</td>
            <td>{item.userID}</td>
            <td>{item.categorieNo}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="pagination">
      {totalPages > 1 && Array.from({ length: totalPages }, (_, i) => (
        <button key={i + 1} onClick={() => handlePageChange(i + 1)}>
          {i + 1}
        </button>
      ))}
    </div>
  </div>
  );
}
