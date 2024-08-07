import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../css/MainCss/MainNews.css';

function MainNews() {
    const [articles, setArticles] = useState([]);
    const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const apiKey = 'd6d9128e58c34dd8addd373daf069b1e';
    const region = '서울';

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const url = `https://newsapi.org/v2/everything?q=${region}&language=ko&apiKey=${apiKey}`;
            try {
                const response = await axios.get(url, { withCredentials: false });
                setArticles(response.data.articles);
            } catch (error) {
                console.error('뉴스를 가져오는 중 오류 발생:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentArticleIndex(prevIndex => (prevIndex + 1) % articles.length);
        }, 5000); 

        return () => clearInterval(interval);
    }, [articles]);

    const handlePrevClick = () => {
        setCurrentArticleIndex(prevIndex => (prevIndex - 1 + articles.length) % articles.length);
    };

    const handleNextClick = () => {
        setCurrentArticleIndex(prevIndex => (prevIndex + 1) % articles.length);
    };

    if (loading) {
        return <p>로딩 중...</p>;
    }

    if (articles.length === 0) {
        return <p>뉴스 기사를 불러오지 못했습니다.</p>;
    }

    const article = articles[currentArticleIndex];

    return (
        <div className="main-news-newsCardContainer">
            <div className="main-news-newsCard">
                <div className='main-news-card-top'>
                    {article.urlToImage ? (
                        <img src={article.urlToImage} alt={article.title} className="main-news-newsImage" />
                    ) : (
                        <div className="main-news-newsImagePlaceholder"></div>
                    )}
                    <div className="main-news-newsContent">
                        <h2 className="main-news-newsTitle">
                            {article.title.length > 45 ? `${article.title.slice(0, 45)}...` : article.title}
                        </h2>
                    </div>
                </div>

                <p className='main-news-bottom'>
                    {article.description.length > 95 ? `${article.description.slice(0, 95)}...` : article.description}
                </p>
                

                <div className="main-news-mainNewsBottom">
                    <button onClick={handlePrevClick} className="main-news-navButton">◀</button>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="main-news-newsLink">기사 보기</a>
                    <button onClick={handleNextClick} className="main-news-navButton">▶</button>
                </div>
            
            </div>
            
        </div>
    );
}

export default MainNews;
