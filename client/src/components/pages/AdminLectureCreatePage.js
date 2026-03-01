import React from 'react';
import LectureForm from '../lectures/LectureForm';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
`;

function AdminLectureCreatePage() {
  return (
    <PageContainer>
      <Title>发布新讲座</Title>
      <LectureForm isEditing={false} />
    </PageContainer>
  );
}

export default AdminLectureCreatePage; 