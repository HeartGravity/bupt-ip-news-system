// components/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { newsApi } from '../../services/api';
import LoadingSpinner from '../ui/LoadingSpinner';
import NewsCard from '../news/NewsCard';
import HeroSection from '../layout/HeroSection';
import FeaturedNews from '../news/FeaturedNews';
import CategorySection from '../news/CategorySection';
import ErrorAlert from '../ui/ErrorAlert';

// 移除模拟数据导入
// import { mockNewsData } from '../../utils/mockData';

// 移除 getMockData 函数
// const getMockData = () => { ... };

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [latestNews, setLatestNews] = useState([]);
  const [featuredNews, setFeaturedNews] = useState(null);
  const [error, setError] = useState(null);
  
  // 移除 loadMockData 函数
  // const loadMockData = () => { ... };
  
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 尝试获取最新新闻
        const response = await newsApi.getNews(1, 12);
        
        if (response.success) {
          setLatestNews(response.data);
          
          // 选择一篇作为特色新闻
          if (response.data.length > 0) {
            // 通常选择访问量最高的作为特色新闻
            const featured = [...response.data].sort((a, b) => b.views - a.views)[0];
            setFeaturedNews(featured);
          }
        } else {
          setError(response.message || '获取新闻失败');
          // 移除加载模拟数据的逻辑
          // if (process.env.NODE_ENV === 'development') {
          //   loadMockData();
          // }
        }
      } catch (err) {
        console.error('获取新闻出错:', err);
        setError('无法连接到服务器，请稍后重试');
        
         // 移除加载模拟数据的逻辑
        // if (process.env.NODE_ENV === 'development') {
        //   loadMockData();
        // }
      } finally {
        setLoading(false);
      }
    };
    
    fetchNews();
  }, []);
  
  // 显示加载状态
  if (loading) {
    return <LoadingSpinner />;
  }
  
  // 修改错误处理：如果获取新闻失败，直接显示错误，不再依赖模拟数据
  if (error && latestNews.length === 0) {
    return <ErrorAlert message={error} retry={() => window.location.reload()} />;
  }
  
  return (
    <>
      {/* 如果有错误但有数据显示(例如只有特色新闻加载失败)，可以考虑展示错误提示 */}
      {error && <ErrorBanner>{error}</ErrorBanner>} 
      
      {/* 英雄区域 */}
      <HeroSection />
      
      {/* 特色新闻 */}
      {/* 确保 featuredNews 有效才渲染 */}
      {featuredNews && featuredNews._id && (
        <SectionContainer className="container">
          <SectionTitle>特色内容</SectionTitle>
          <FeaturedNews news={featuredNews} />
        </SectionContainer>
      )}
      
      {/* 最新资讯 */}
      {/* 确保 latestNews 有效才渲染 */}
      {latestNews && latestNews.length > 0 && (
          <SectionContainer className="container">
            <SectionHeader>
              <SectionTitle>最新资讯</SectionTitle>
              <ViewAllLink to="/news">查看全部</ViewAllLink>
            </SectionHeader>
            
            <NewsGrid>
              {latestNews.slice(0, 6).map(news => (
                <NewsCard key={news._id} news={news} />
              ))}
            </NewsGrid>
        </SectionContainer>
      )}
      
      {/* 分类专区 */}
      <CategorySection 
        title="专利法规与案例" 
        category="专利法规" 
        backgroundColor="var(--bg-primary)"
      />
      
      <CategorySection 
        title="知识产权保护" 
        category="知识产权保护" 
        backgroundColor="var(--bg-secondary)"
      />
      
      <CategorySection 
        title="国际知识产权动态" 
        category="国际知识产权" 
        backgroundColor="var(--bg-primary)"
      />
      
      {/* 快速访问区 */}
      <QuickAccessSection>
        <div className="container">
          <SectionTitle light>快速访问</SectionTitle>
          <QuickAccessGrid>
            <QuickAccessCard to="/news?category=专利申请">
              <QuickAccessIcon>📝</QuickAccessIcon>
              <QuickAccessTitle>专利申请</QuickAccessTitle>
              <QuickAccessDesc>了解专利申请流程与策略</QuickAccessDesc>
            </QuickAccessCard>
            
            <QuickAccessCard to="/news?category=商标法规">
              <QuickAccessIcon>🔖</QuickAccessIcon>
              <QuickAccessTitle>商标法规</QuickAccessTitle>
              <QuickAccessDesc>商标注册与保护最新政策</QuickAccessDesc>
            </QuickAccessCard>
            
            <QuickAccessCard to="/news?category=著作权法规">
              <QuickAccessIcon>📚</QuickAccessIcon>
              <QuickAccessTitle>著作权法规</QuickAccessTitle>
              <QuickAccessDesc>著作权法律法规与案例</QuickAccessDesc>
            </QuickAccessCard>
            
            <QuickAccessCard to="/news?tag=AI创作">
              <QuickAccessIcon>🤖</QuickAccessIcon>
              <QuickAccessTitle>AI与知识产权</QuickAccessTitle>
              <QuickAccessDesc>人工智能创作的知识产权议题</QuickAccessDesc>
            </QuickAccessCard>
          </QuickAccessGrid>
        </div>
      </QuickAccessSection>
    </>
  );
};

// 新增的错误提示横幅样式
const ErrorBanner = styled.div`
  background-color: var(--error-light);
  color: var(--error-dark);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  text-align: center;
`;

// 以下是原有的样式组件定义
// ...
const SectionContainer = styled.section`
  padding: var(--spacing-xl) 0;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
`;

const SectionTitle = styled.h2`
  color: ${props => props.light ? 'var(--text-white)' : 'var(--text-primary)'};
  font-size: var(--font-size-xl);
  margin-bottom: var(--spacing-lg);
  position: relative;
  display: inline-block;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 60px;
    height: 3px;
    background-color: var(--primary-color);
  }
`;

const ViewAllLink = styled(Link)`
  color: var(--primary-color);
  font-weight: 500;
  display: flex;
  align-items: center;
  
  &:after {
    content: '→';
    margin-left: var(--spacing-xs);
    transition: transform var(--transition-fast);
  }
  
  &:hover:after {
    transform: translateX(5px);
  }
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--spacing-lg);
  
  @media (min-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const QuickAccessSection = styled.section`
  background-color: var(--bg-dark);
  padding: var(--spacing-xl) 0;
  color: var(--text-white);
`;

const QuickAccessGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
`;

const QuickAccessCard = styled(Link)`
  background-color: rgba(255, 255, 255, 0.05);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  text-align: center;
  text-decoration: none;
  color: var(--text-white);
  transition: all var(--transition-normal);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transform: translateY(-5px);
  }
`;

const QuickAccessIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
`;

const QuickAccessTitle = styled.h3`
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xs);
  font-weight: 600;
`;

const QuickAccessDesc = styled.p`
  font-size: var(--font-size-sm);
  color: var(--text-light);
`;

export default HomePage;