import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { newsApi } from '../../services/api';
import NewsCard from '../news/NewsCard';
import LoadingSpinner from '../ui/LoadingSpinner';
import ErrorAlert from '../ui/ErrorAlert';
// import Pagination from '../ui/Pagination'; // 如果需要分页

const PageContainer = styled.div`
  padding: 2rem var(--container-padding);
  max-width: var(--container-max-width);
  margin: 2rem auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--primary-color);
`;

const Title = styled.h1`
  color: #333;
  font-size: 2rem;
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--spacing-lg);
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 1rem;
  color: var(--primary-color);
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

function CategoryPage() {
  const { categoryName } = useParams(); // 从 URL 获取分类名称
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9, // 每页显示数量
    total: 0,
    pages: 1
  });

  useEffect(() => {
    const fetchNewsByCategory = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await newsApi.getNews(pagination.page, pagination.limit, categoryName);
        if (response.success) {
          setNews(response.data);
          setPagination(prev => ({ 
              ...prev, 
              total: response.total, 
              pages: response.totalPages || 1 
            }));
        } else {
          setError(response.message || '获取该分类新闻失败');
        }
      } catch (err) {
        console.error(`获取分类 ${categoryName} 新闻出错:`, err);
        setError('无法连接到服务器，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    if (categoryName) {
      fetchNewsByCategory();
      // 更新页面标题
      document.title = `${categoryName} - 北邮一站式知识产权服务中心`;
    }
    
    // 组件卸载时恢复默认标题
    return () => {
        document.title = '北邮一站式知识产权服务中心';
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryName, pagination.page, pagination.limit]);

//   const handlePageChange = (newPage) => { // 如果需要分页
//     setPagination(prev => ({ ...prev, page: newPage }));
//   };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorAlert message={error} />; 

  return (
    <PageContainer>
      <Header>
         <BackLink to="/">&larr; 返回首页</BackLink> 
        <Title>{categoryName}</Title>
      </Header>
      
      {news.length > 0 ? (
        <NewsGrid>
          {news.map(item => (
            <NewsCard key={item._id} news={item} />
          ))}
        </NewsGrid>
      ) : (
        <p>该分类下暂无新闻。</p>
      )}

      {/* 如果需要分页 */}
      {/* {pagination.pages > 1 && (
          <Pagination 
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
          />
      )} */}
    </PageContainer>
  );
}

export default CategoryPage; 