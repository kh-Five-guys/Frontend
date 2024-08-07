import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../css/FriendCss/Friend.css';

const { kakao } = window;

const Friend = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [displayedUsers, setDisplayedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [map, setMap] = useState(null);
  const [centerMarker, setCenterMarker] = useState(null);
  const [infowindow, setInfowindow] = useState(new kakao.maps.InfoWindow({ zIndex: 1 }));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState({ latitude: 37.497942, longitude: 127.027621 });
  const [circle, setCircle] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [circleRadius, setCircleRadius] = useState(1000);
  const [sentRequests, setSentRequests] = useState([]);
  const [activeInfowindows, setActiveInfowindows] = useState([]);

  const checkLoginStatus = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.userId) {
      alert('로그인 하셔야 이용할 수 있는 페이지입니다.');
      navigate('/login');
    }
  };

  const getUserLocation = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.latitude && user.longitude) {
      setUserLocation({ latitude: user.latitude, longitude: user.longitude });
    }
  };

  const fetchUsersAndFriends = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user')).userId;
      const [usersResponse, friendsResponse] = await Promise.all([
        axios.get('http://localhost:9999/user', { params: { userId } }),
        axios.get('http://localhost:9999/friend/friends', { params: { userId } })
      ]);

      const allUsers = usersResponse.data;
      const friendsList = friendsResponse.data;

      // 사용자 ID 가져오기
      console.log('Current User ID:', userId);

      // 친구 목록에서 ID만 추출하여 출력
      const friendIds = friendsList.reduce((ids, friend) => {
        const friendId = friend.userId1 === userId ? friend.userId2 : friend.userId1;
        ids.push(friendId);
        return ids;
      }, []);

      console.log('Friend IDs:', [...new Set(friendIds)]);  // 중복 제거하여 출력

      const filteredUsers = allUsers.filter(user => user.userId !== userId);
      
      setUsers(filteredUsers);
      setFriends(friendsList);
    } catch (error) {
      console.error("유저 또는 친구 데이터를 가져오는 중 오류 발생", error);
      setError("유저 또는 친구 데이터를 가져오는 데 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const userId = JSON.parse(localStorage.getItem('user')).userId;
      const response = await axios.get('http://localhost:9999/friend/sentRequests', {
        params: { userId }
      });
      setSentRequests(response.data);
    } catch (error) {
      console.error("보낸 친구 요청을 가져오는 중 오류 발생", error);
    }
  };

  useEffect(() => {
    checkLoginStatus();
    getUserLocation();
    fetchUsersAndFriends();
    fetchSentRequests();
  }, [navigate]);

  useEffect(() => {
    if (window.kakao && users.length > 0 && userLocation) {
      const container = document.getElementById('map');
      if (!container) {
        console.error('Map container not found');
        return;
      }

      const options = {
        center: new kakao.maps.LatLng(userLocation.latitude, userLocation.longitude),
        level: 5
      };

      const mapInstance = new kakao.maps.Map(container, options);
      setMap(mapInstance);

      const centerPosition = new kakao.maps.LatLng(userLocation.latitude, userLocation.longitude);
      const centerMarkerInstance = new kakao.maps.Marker({ position: centerPosition });
      centerMarkerInstance.setMap(mapInstance);
      setCenterMarker(centerMarkerInstance);

      kakao.maps.event.addListener(centerMarkerInstance, 'click', () => {
        setSelectedUser(null);
        if (infowindow) {
          infowindow.setContent('<div style="padding:5px;">나</div>');
          infowindow.open(mapInstance, centerMarkerInstance);
        }
      });

      const circleInstance = new kakao.maps.Circle({
        center: centerPosition,
        radius: circleRadius,
        strokeWeight: 1,
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeStyle: 'solid',
        fillColor: '#FF0000',
        fillOpacity: 0.3
      });
      circleInstance.setMap(mapInstance);
      setCircle(circleInstance);

      filterUsersWithinCircle(mapInstance, centerPosition, circleRadius);
    }
  }, [users, userLocation, circleRadius]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const radLat1 = lat1 * Math.PI / 180;
    const radLat2 = lat2 * Math.PI / 180;
    const deltaLat = (lat2 - lat1) * Math.PI / 180;
    const deltaLon = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(radLat1) * Math.cos(radLat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    return R * c;
  };

  const filterUsersWithinCircle = (mapInstance, centerPosition, radius) => {
    if (centerPosition && radius) {
      markers.forEach(marker => marker.setMap(null));

      const newMarkers = [];
      const filteredUsers = [];

      users.forEach(user => {
        const userLat = user.latitude;
        const userLon = user.longitude;
        const distance = calculateDistance(centerPosition.getLat(), centerPosition.getLng(), userLat, userLon);

        if (distance <= radius) {
          filteredUsers.push(user);
          const userPosition = new kakao.maps.LatLng(userLat, userLon);
          const userMarker = new kakao.maps.Marker({
            position: userPosition,
            map: mapInstance,
            title: user.userNick
          });

          kakao.maps.event.addListener(userMarker, 'click', () => {
            setSelectedUser(user);
            closeAllInfowindows();
            if (infowindow) {
              infowindow.setContent(`<div style="padding:5px;">${user.userNick}</div>`);
              infowindow.open(mapInstance, userMarker);
              setActiveInfowindows(prev => [...prev, infowindow]);
            }
          });

          newMarkers.push(userMarker);
        }
      });

      setMarkers(newMarkers);
      setDisplayedUsers(filteredUsers);
    }
  };

  const closeAllInfowindows = () => {
    activeInfowindows.forEach(infowindow => infowindow.close());
    setActiveInfowindows([]);
  };

  const moveToMyLocation = () => {
    if (map && centerMarker && infowindow) {
      const myPosition = new kakao.maps.LatLng(userLocation.latitude, userLocation.longitude);
      map.panTo(myPosition);
      setSelectedUser(null);
      if (infowindow) {
        infowindow.setContent('<div style="padding:5px;">나</div>');
        infowindow.open(map, centerMarker);
      }
    }
  };

  const closePopup = () => {
    setSelectedUser(null);
    closeAllInfowindows();
  };

  const sendFriendRequest = async (senderId, receiverId) => {
    const alreadySent = sentRequests.some(request => request.receiverId === receiverId);
    if (alreadySent) {
      alert('이미 친구 요청이 접수된 상태입니다.');
      return;
    }

    try {
      await axios.post('http://localhost:9999/friend/addFriendRequest', null, {
        params: {
          senderId: senderId,
          receiverId: receiverId
        }
      });
      alert('친구 요청이 전송되었습니다.');
      setSentRequests(prevRequests => [...prevRequests, { senderId, receiverId }]);
    } catch (error) {
      console.error('친구 요청 전송 중 오류 발생', error);
      if (error.response) {
        alert(`서버 오류: ${error.response.data.message || '알 수 없는 오류'}`);
      } else if (error.request) {
        alert('네트워크 오류가 발생했습니다. 인터넷 연결을 확인하세요.');
      } else {
        alert(`요청 설정 오류: ${error.message}`);
      }
    }
  };

  const handleAddFriend = () => {
    if (selectedUser) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.userId) {
        const isFriend = friends.some(friend => 
          (friend.userId1 === selectedUser.userId || friend.userId2 === selectedUser.userId) &&
          (friend.userId1 === user.userId || friend.userId2 === user.userId)
        );
        if (isFriend) {
          alert('이미 친구입니다.');
          return;
        }
        sendFriendRequest(user.userId, selectedUser.userId);
      }
    }
  };
  if (loading) {
    return <p>로딩 중...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="friend-container">
      <div className="map-container">
        <h1>주변 유저 찾기</h1>
        <div id="map" className="map">
          <button onClick={moveToMyLocation} className="refresh-button">
            <img src="./images/refresh.png" alt="Refresh" />
          </button>
        </div>
      </div>
      <div className="friend-list">
        <h2 className="friend-list-header">내 주변 추천유저</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {displayedUsers.map((user) => (
            <li 
              key={user.userId} 
              id={`user-${user.userId}`} 
              className="friend-item"
              onClick={() => {
                const userPosition = new kakao.maps.LatLng(user.latitude, user.longitude);
                map.panTo(userPosition);
                setSelectedUser(user);
                closeAllInfowindows();
                const userMarker = new kakao.maps.Marker({ position: userPosition });
                if (infowindow) {
                  infowindow.setContent(`<div style="padding:5px;">${user.userNick}</div>`);
                  infowindow.open(map, userMarker);
                  setActiveInfowindows([infowindow]);
                }
              }}
            >
              <img 
                src={user.userProImg || '/images/profile.png'} 
                alt="Profile" 
                className="friend-profile-img" 
              />
              <strong>{user.userId}</strong> - {user.userNick}
            </li>
          ))}
        </ul>
      </div>
      {selectedUser && (
        <div className="profile-popup">
          <h1 className="profile-header">
            프로필
            <button onClick={closePopup} style={{ position: 'absolute', right: '10px', top: '0' }}>X</button>
          </h1>
          <div className="profile-picture">
            <img 
              src={selectedUser.userProImg || '/images/profile.png'} 
              alt="Profile" 
            />
          </div>
          <div>{selectedUser.userNick}</div>
          <p>{selectedUser.userAddress}</p>
          <button 
            className="add-friend-button" 
            onClick={handleAddFriend}
            disabled={friends.some(friend => 
              (friend.userId1 === selectedUser.userId || friend.userId2 === selectedUser.userId) &&
              (friend.userId1 === JSON.parse(localStorage.getItem('user')).userId || friend.userId2 === JSON.parse(localStorage.getItem('user')).userId)
            )}
          >
            {friends.some(friend => 
              (friend.userId1 === selectedUser.userId || friend.userId2 === selectedUser.userId) &&
              (friend.userId1 === JSON.parse(localStorage.getItem('user')).userId || friend.userId2 === JSON.parse(localStorage.getItem('user')).userId)
            ) ? '이미 친구입니다' : '친구 추가'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Friend;
