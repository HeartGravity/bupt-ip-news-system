import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import lectureService from '../../services/lectureService';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 2rem auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
`;

const LectureList = styled.ul`
  list-style: none;
  padding: 0;
`;

const LectureItem = styled.li`
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 5px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const LectureTitle = styled.h2`
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #0056b3;
  a {
    text-decoration: none;
    color: inherit;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const LectureInfo = styled.p`
  margin: 0.3rem 0;
  color: #555;
  font-size: 0.9rem;
  strong {
    color: #333;
  }
`;

const Loading = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: red;
`;

function LectureListPage() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        setLoading(true);
        const response = await lectureService.getLectures();
        setLectures(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || '无法加载讲座列表');
        console.error('获取讲座失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('zh-CN', options);
  };

  if (loading) return <Loading>加载中...</Loading>;
  if (error) return <ErrorMessage>错误: {error}</ErrorMessage>;

  return (
    <PageContainer>
      <Title>公益讲座与培训</Title>
      {lectures.length > 0 ? (
        <LectureList>
          {lectures.map((lecture) => (
            <LectureItem key={lecture._id}>
              <LectureTitle>
                <Link to={`/lectures/${lecture._id}`}>{lecture.title}</Link>
              </LectureTitle>
              <LectureInfo><strong>主讲人:</strong> {lecture.speaker}</LectureInfo>
              <LectureInfo><strong>时间:</strong> {formatDate(lecture.lectureTime)}</LectureInfo>
              <LectureInfo><strong>地点:</strong> {lecture.location}</LectureInfo>
               <LectureInfo><strong>状态:</strong> {lecture.status === 'upcoming' ? '即将开始' : lecture.status === 'ongoing' ? '进行中' : lecture.status === 'finished' ? '已结束' : '已取消'}</LectureInfo>
              {/* 可以根据需要添加更多信息，如描述摘要 */} 
            </LectureItem>
          ))}
        </LectureList>
      ) : (
        <p>目前没有即将开始的讲座或培训。</p>
      )}
    </PageContainer>
  );
}

export default LectureListPage; 