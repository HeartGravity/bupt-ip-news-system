import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import userService from '../../services/userService'; // 导入我们修改过的 service

// (基础样式)
const FavoritesWrapper = styled.div`
  max-width: 800px;
`;

const Loading = styled.p`
  text-align: center;
  font-size: 1.2rem;
`;

const Error = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: red;
`;

const FavoriteList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FavoriteItem = styled.li`
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FavoriteContent = styled.div`
  flex: 1;
  margin-right: 1rem;
`;

const FavoriteTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  font-size: 1.2rem;

  a {
    text-decoration: none;
    color: var(--text-primary, #333);
    &:hover {
      color: var(--primary-color, #007bff);
    }
  }
`;

const FavoriteSummary = styled.p`
  margin: 0;
  color: #666;
`;

const UnfavoriteButton = styled.button`
  background-color: #dc3545;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #c82333;
  }
  
  &:disabled {
    background-color: #ccc;
  }
`;


const MyFavorites = () => {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [removingId, setRemovingId] = useState(null); // 用于禁用按钮

    useEffect(() => {
        const fetchFavorites = async () => {
            setLoading(true);
            const result = await userService.getFavorites();
            if (result.success) {
                setFavorites(result.data);
            } else {
                setError(result.message);
            }
            setLoading(false);
        };

        fetchFavorites();
    }, []);

    const handleUnfavorite = async (newsId) => {
        if (window.confirm('确定要取消收藏吗？')) {
            setRemovingId(newsId);
            const result = await userService.removeFavorite(newsId);
            if (result.success) {
                // 从 UI 中移除
                setFavorites(favorites.filter(fav => fav._id !== newsId));
            } else {
                alert(`取消收藏失败: ${result.message}`);
            }
            setRemovingId(null);
        }
    };

    if (loading) return <Loading>正在加载收藏列表...</Loading>;
    if (error) return <Error>加载失败: {error}</Error>;

    return (
        <FavoritesWrapper>
            <h2>我的收藏</h2>
            {favorites.length === 0 ? (
                <p>您还没有收藏任何新闻。</p>
            ) : (
                <FavoriteList>
                    {favorites.map(news => (
                        <FavoriteItem key={news._id}>
                            <FavoriteContent>
                                <FavoriteTitle>
                                    {/* 假设你的新闻详情路由是 /news/:id */}
                                    <Link to={`/news/${news._id}`}>{news.title}</Link>
                                </FavoriteTitle>
                                <FavoriteSummary>{news.summary}</FavoriteSummary>
                            </FavoriteContent>
                            <UnfavoriteButton
                                onClick={() => handleUnfavorite(news._id)}
                                disabled={removingId === news._id}
                            >
                                {removingId === news._id ? '取消中...' : '取消收藏'}
                            </UnfavoriteButton>
                        </FavoriteItem>
                    ))}
                </FavoriteList>
            )}
        </FavoritesWrapper>
    );
};

export default MyFavorites;