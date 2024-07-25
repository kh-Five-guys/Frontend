import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './css/main.css';
import Layout from './components/Layout'; // 기본 레이아웃 컴포넌트
import Board from './components/BoardComponents/Board';
import BoardDetail from './components/BoardComponents/BoardDetail';
import Home from './components/Home';
import Chat from './components/ChatComponents/Chat';
import Friend from './components/FriendComponents/Friend';
import Lost from './components/LostComponents/Lost';
import News from './components/NewsComponents/News';
import Login from './components/UserComponents/Login';
import Register from './components/UserComponents/Register';
import MyPage from './components/UserComponents/MyPage'; // 추가된 컴포넌트
import Admin from './components/UserComponents/Admin'; // 추가된 컴포넌트
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* 기본 레이아웃을 사용하는 라우트 */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="board" element={<Board />} />
            <Route path="board/:boardNo" element={<BoardDetail />} />
            <Route path="chat" element={<Chat />} />
            <Route path="friend" element={<Friend />} />
            <Route path="lost" element={<Lost />} />
            <Route path="news" element={<News />} />
            <Route path="mypage" element={<MyPage />} /> {/* 추가된 라우트 */}
            <Route path="admin" element={<Admin />} /> {/* 추가된 라우트 */}
          </Route>
          {/* 헤더가 없는 라우트 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
