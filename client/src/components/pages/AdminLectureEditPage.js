import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import LectureForm from '../lectures/LectureForm';
import lectureService from '../../services/lectureService';
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

function AdminLectureEditPage() {
  const { id } = useParams();
  const [lectureData, setLectureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        setLoading(true);
        const response = await lectureService.getLectureById(id);
        if (response.success) {
          setLectureData(response.data);
        } else {
          setError(response.message || '无法加载讲座数据');
        }
      } catch (err) {
        setError(err.message || '加载讲座失败');
      } finally {
        setLoading(false);
      }
    };
    fetchLecture();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage>错误: {error}</ErrorMessage>;
  if (!lectureData) return <ErrorMessage>未找到讲座数据</ErrorMessage>;

  return (
    <PageContainer>
      <Title>编辑讲座</Title>
      <LectureForm lectureData={lectureData} isEditing={true} />
    </PageContainer>
  );
}

export default AdminLectureEditPage; 