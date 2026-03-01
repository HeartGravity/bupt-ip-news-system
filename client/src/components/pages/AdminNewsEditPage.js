import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NewsForm from '../news/NewsForm';
import { newsApi } from '../../services/api';
import LoadingSpinner from '../ui/LoadingSpinner';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
`;

const ErrorMessage = styled.p`
  color: red;
  text-align: center;
`;

function AdminNewsEditPage() {
  const { id } = useParams();
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await newsApi.getNewsById(id);
        if (response.success) {
          setNewsData(response.data);
        } else {
          setError(response.message || '无法加载新闻数据');
        }
      } catch (err) {
        setError(err.message || '加载新闻失败');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage>错误: {error}</ErrorMessage>;
  if (!newsData) return <ErrorMessage>未找到新闻数据</ErrorMessage>;

  return (
    <PageContainer>
      <Title>编辑新闻</Title>
      <NewsForm newsData={newsData} isEditing={true} />
    </PageContainer>
  );
}

export default AdminNewsEditPage; 