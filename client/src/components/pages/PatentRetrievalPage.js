import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { updatePageTitle } from '../../utils/seoUtils';
import { FaChevronRight, FaArrowLeft, FaSearchPlus, FaChartBar, FaExclamationTriangle, FaUsers } from 'react-icons/fa';

const PageContainer = styled.div`
  padding: var(--spacing-xl) var(--container-padding);
  max-width: var(--container-max-width);
  margin: 0 auto;
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow-light);
  margin-top: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color-light);
  padding-bottom: var(--spacing-lg);
`;

const PageTitle = styled.h1`
  font-size: var(--font-size-xxl);
  color: var(--text-primary);
  margin: 0;
`;

const BackLink = styled(Link)`
  display: flex;
  align-items: center;
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius-md);
  transition: background-color var(--transition-fast);

  &:hover {
    background-color: var(--primary-light-hover);
    text-decoration: none;
  }

  svg {
    margin-right: var(--spacing-xs);
  }
`;

const PageContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
  
  @media (min-width: 992px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const MainContent = styled.div`
  font-size: var(--font-size-md);
  line-height: 1.8;
  color: var(--text-secondary);

  h2 {
    font-size: var(--font-size-xl);
    margin-top: 0;
    margin-bottom: var(--spacing-md);
    color: var(--text-primary);
    display: flex;
    align-items: center;

    svg {
      margin-right: var(--spacing-sm);
      color: var(--primary-color);
      opacity: 0.8;
    }
  }
  
  h2:not(:first-child) {
      margin-top: var(--spacing-xl);
  }

  p {
    margin-bottom: var(--spacing-md);
  }
`;

const ServiceList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 var(--spacing-md) 0;
`;

const ServiceListItem = styled.li`
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-sm) 0;
  border-bottom: 1px dashed var(--border-color-light);

  &:last-child {
    border-bottom: none;
  }

  svg {
    color: var(--primary-color);
    margin-right: var(--spacing-md);
    font-size: 1.1em;
    flex-shrink: 0;
  }
`;

const Sidebar = styled.aside`
  background-color: white;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-md);
  box-shadow: var(--box-shadow-sm);
  height: fit-content;

  h3 {
    font-size: var(--font-size-lg);
    color: var(--text-primary);
    margin-top: 0;
    margin-bottom: var(--spacing-md);
    border-bottom: 1px solid var(--border-color-light);
    padding-bottom: var(--spacing-sm);
  }
  
  p {
      font-size: var(--font-size-sm);
      line-height: 1.6;
      margin-bottom: 0;
  }
`;


const PatentRetrievalPage = () => {
  useEffect(() => {
    updatePageTitle('专利检索与分析 - 服务中心');
  }, []);

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>专利检索与分析</PageTitle>
        <BackLink to="/ip-service">
          <FaArrowLeft /> 返回服务中心
        </BackLink>
      </PageHeader>
      
      <PageContent>
        <MainContent>
          <p>
            提供专业的专利信息检索、分析和导航服务，为您的科研创新提供强有力的信息支撑。我们利用先进的检索工具和数据库，结合经验丰富的分析师团队，为您提供定制化的服务。
          </p>
          
          <h2><FaSearchPlus />服务内容包括：</h2>
          <ServiceList>
            <ServiceListItem><FaChevronRight />新颖性检索</ServiceListItem>
            <ServiceListItem><FaChevronRight />无效宣告检索</ServiceListItem>
            <ServiceListItem><FaChevronRight />自由实施（FTO）检索</ServiceListItem>
            <ServiceListItem><FaChevronRight />技术主题检索与分析</ServiceListItem>
            <ServiceListItem><FaChevronRight />竞争对手专利分析</ServiceListItem>
            <ServiceListItem><FaChevronRight />专利预警分析</ServiceListItem>
          </ServiceList>

          <h2><FaChartBar />我们的优势：</h2>
          <p>
            全面覆盖全球主要国家和地区的专利数据，拥有专业的检索分析团队，能够快速准确地定位关键信息，提供深度分析报告。
          </p>
          
          {/* 可以继续添加更多内容，例如服务流程、收费标准等 */}
          
        </MainContent>
        
        <Sidebar>
           <h3><FaExclamationTriangle /> 服务提示</h3>
           <p>为确保检索分析的准确性，请尽可能提供详细的技术背景、关键词和需求说明。如有疑问，欢迎随时联系我们。</p>
           
           <h3 style={{marginTop: 'var(--spacing-lg)'}}><FaUsers /> 联系我们</h3>
           <p>电话：010-6228xxxx<br/>邮箱：ipservice@bupt.edu.cn</p>
        </Sidebar>
      </PageContent>
    </PageContainer>
  );
};

export default PatentRetrievalPage; 