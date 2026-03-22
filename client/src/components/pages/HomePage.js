// components/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { newsApi } from '../../services/api';
import LoadingSpinner from '../ui/LoadingSpinner';
import NewsCard from '../news/NewsCard';
import HeroSection from '../layout/HeroSection';
import FeaturedNews from '../news/FeaturedNews';
import CategorySection from '../news/CategorySection';
import ErrorAlert from '../ui/ErrorAlert';

const HomePage = () => {
  const [loading, setLoading] = useState(true);
  const [latestNews, setLatestNews] = useState([]);
  const [featuredNews, setFeaturedNews] = useState(null);
  const [error, setError] = useState(null);

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
        }
      } catch (err) {
        console.error('获取新闻出错:', err);
        setError('无法连接到服务器，请稍后重试');
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
      {/* 如果有错误但有数据显示，可以展示错误提示 */}
      {error && <ErrorBanner>{error}</ErrorBanner>}

      {/* 英雄区域 */}
      <HeroSection />

      {/* 数据统计 */}
      <StatsSection className="container">
        <StatItem>
          <StatNumber>5000+</StatNumber>
          <StatLabel>知识产权资讯</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>200+</StatNumber>
          <StatLabel>公益讲座</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>50+</StatNumber>
          <StatLabel>合作机构</StatLabel>
        </StatItem>
        <StatItem>
          <StatNumber>10000+</StatNumber>
          <StatLabel>注册用户</StatLabel>
        </StatItem>
      </StatsSection>

      {/* 特色新闻 */}
      {featuredNews && featuredNews._id && (
        <SectionContainer className="container">
          <SectionTitle>特色内容</SectionTitle>
          <FeaturedNews news={featuredNews} />
        </SectionContainer>
      )}

      {/* 最新资讯 */}
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

/* ===== Animations ===== */

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

/* ===== Styled Components ===== */

const ErrorBanner = styled.div`
  background-color: var(--error-light);
  color: var(--error-dark);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  text-align: center;
`;

/* --- Stats Section --- */

const StatsSection = styled.section`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-top: -40px;
  position: relative;
  z-index: 10;
  padding-bottom: var(--spacing-lg);

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-top: -28px;
  }
`;

const StatItem = styled.div`
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg) var(--spacing-md);
  text-align: center;
  animation: ${fadeInUp} 0.6s var(--transition-normal) both;

  &:nth-child(2) { animation-delay: 0.1s; }
  &:nth-child(3) { animation-delay: 0.2s; }
  &:nth-child(4) { animation-delay: 0.3s; }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
  margin-bottom: var(--spacing-xs);
`;

const StatLabel = styled.div`
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: 500;
`;

/* --- Section Layout --- */

const SectionContainer = styled.section`
  padding: var(--spacing-section) 0;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
`;

const SectionTitle = styled.h2`
  color: ${props => props.light ? 'var(--text-white)' : 'var(--text-primary)'};
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
  position: relative;
  display: inline-block;

  &::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 48px;
    height: 3px;
    background: var(--gradient-primary);
    border-radius: var(--border-radius-full);
  }
`;

const ViewAllLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--primary-600);
  font-weight: 600;
  font-size: var(--font-size-sm);
  padding: 0.5rem 1.25rem;
  border: 1.5px solid var(--primary-600);
  border-radius: var(--border-radius-full);
  background: transparent;
  transition: all var(--transition-normal);
  text-decoration: none;

  &::after {
    content: '→';
    transition: transform var(--transition-fast);
  }

  &:hover {
    color: var(--text-white);
    background: var(--gradient-primary);
    border-color: transparent;
    box-shadow: var(--shadow-glow);
    transform: translateY(-1px);

    &::after {
      transform: translateX(4px);
    }
  }
`;

/* --- News Grid --- */

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 24px;

  @media (min-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

/* --- Quick Access Section --- */

const QuickAccessSection = styled.section`
  background: var(--gradient-dark);
  padding: var(--spacing-section) 0;
  color: var(--text-white);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -20%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -40%;
    right: -15%;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(6, 182, 212, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }
`;

const QuickAccessGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
  position: relative;
  z-index: 1;
`;

const QuickAccessCard = styled(Link)`
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: var(--spacing-xl) var(--spacing-lg);
  border-radius: var(--border-radius-md);
  text-align: center;
  text-decoration: none;
  color: var(--text-white);
  transition: all var(--transition-normal);

  &:hover {
    border-color: var(--primary-400);
    transform: translateY(-6px);
    box-shadow: 0 8px 32px rgba(37, 99, 235, 0.2);
    background: rgba(255, 255, 255, 0.08);
  }
`;

const QuickAccessIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: var(--spacing-md);
  line-height: 1;
`;

const QuickAccessTitle = styled.h3`
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xs);
  font-weight: 600;
  color: var(--text-white);
`;

const QuickAccessDesc = styled.p`
  font-size: var(--font-size-sm);
  color: var(--text-light);
  margin-bottom: 0;
`;

export default HomePage;
