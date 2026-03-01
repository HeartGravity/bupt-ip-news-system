import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import lectureService from '../../services/lectureService';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 900px;
  margin: 2rem auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 1rem;
  text-align: center;
`;

const LectureDetail = styled.div`
  line-height: 1.8;
  color: #444;
`;

const InfoItem = styled.p`
  margin: 0.8rem 0;
  strong {
    color: #111;
    min-width: 80px;
    display: inline-block;
  }
`;

const Description = styled.div`
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
  h3 {
      margin-bottom: 0.5rem;
  }
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 1.5rem;
  color: #007bff;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
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

const StatusBadge = styled.span`
  padding: 0.2em 0.6em;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: bold;
  color: white;
  background-color: ${props => {
    switch (props.status) {
      case 'upcoming': return '#28a745'; // green
      case 'ongoing': return '#007bff'; // blue
      case 'finished': return '#6c757d'; // grey
      case 'cancelled': return '#dc3545'; // red
      default: return '#6c757d';
    }
  }};
`;

function LectureDetailPage() {
  const { id } = useParams();
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        setLoading(true);
        const response = await lectureService.getLectureById(id);
        setLecture(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || '无法加载讲座详情');
        console.error(`获取讲座 ${id} 失败:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchLecture();
  }, [id]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('zh-CN', options);
  };

  const getStatusText = (status) => {
      switch (status) {
          case 'upcoming': return '即将开始';
          case 'ongoing': return '进行中';
          case 'finished': return '已结束';
          case 'cancelled': return '已取消';
          default: return '未知';
      }
  }

  if (loading) return <Loading>加载中...</Loading>;
  if (error) return <ErrorMessage>错误: {error}</ErrorMessage>;
  if (!lecture) return <p>未找到讲座信息。</p>;

  return (
    <PageContainer>
      <BackLink to="/lectures">&larr; 返回讲座列表</BackLink>
      <Title>{lecture.title}</Title>
      <LectureDetail>
        <InfoItem><strong>主讲人:</strong> {lecture.speaker}</InfoItem>
        <InfoItem><strong>时间:</strong> {formatDate(lecture.lectureTime)}</InfoItem>
        <InfoItem><strong>地点:</strong> {lecture.location}</InfoItem>
        <InfoItem><strong>组织方:</strong> {lecture.organizer}</InfoItem>
        <InfoItem>
          <strong>状态:</strong> <StatusBadge status={lecture.status}>{getStatusText(lecture.status)}</StatusBadge>
        </InfoItem>
        <InfoItem><strong>需要报名:</strong> {lecture.registrationRequired ? '是' : '否'}</InfoItem>
        {lecture.registrationRequired && lecture.registrationLink && (
          <InfoItem>
            <strong>报名链接:</strong> <a href={lecture.registrationLink} target="_blank" rel="noopener noreferrer">点击报名</a>
          </InfoItem>
        )}
        <Description>
          <h3>讲座描述</h3>
          <p>{lecture.description}</p>
        </Description>
      </LectureDetail>
    </PageContainer>
  );
}

export default LectureDetailPage; 