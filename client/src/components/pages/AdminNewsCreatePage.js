import React from 'react';
import NewsForm from '../news/NewsForm';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 2rem;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
`;

function AdminNewsCreatePage() {
  return (
    <PageContainer>
      <Title>发布新新闻</Title>
      <NewsForm isEditing={false} />
    </PageContainer>
  );
}

export default AdminNewsCreatePage; 