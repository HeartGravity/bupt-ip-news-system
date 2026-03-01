import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { updatePageTitle } from '../../utils/seoUtils';
import { FaChevronRight, FaArrowLeft, FaClipboardCheck, FaExclamationTriangle, FaUsers } from 'react-icons/fa';

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
    svg { margin-right: var(--spacing-sm); color: var(--primary-color); opacity: 0.8; }
  }
  h2:not(:first-child) { margin-top: var(--spacing-xl); }
  p { margin-bottom: var(--spacing-md); }
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
  &:last-child { border-bottom: none; }
  svg { color: var(--primary-color); margin-right: var(--spacing-md); font-size: 1.1em; flex-shrink: 0; }
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
  p { font-size: var(--font-size-sm); line-height: 1.6; margin-bottom: 0; }
`;

const PatentApplicationPage = () => {
  useEffect(() => { updatePageTitle('专利申请代理 - 服务中心'); }, []);
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>专利申请代理</PageTitle>
        <BackLink to="/ip-service">
          <FaArrowLeft /> 返回服务中心
        </BackLink>
      </PageHeader>
      
      <PageContent>
        <MainContent>
          <p>提供从技术交底到专利授权的全流程专业代理服务，包括专利申请文件的撰写、提交、审查意见答复、授权登记等。</p>
          
          <h2><FaClipboardCheck />服务类型：</h2>
          <ServiceList>
            <ServiceListItem><FaChevronRight />发明专利申请</ServiceListItem>
            <ServiceListItem><FaChevronRight />实用新型专利申请</ServiceListItem>
            <ServiceListItem><FaChevronRight />外观设计专利申请</ServiceListItem>
            <ServiceListItem><FaChevronRight />PCT国际申请</ServiceListItem>
          </ServiceList>

          {/* 可以添加更多关于申请流程、所需材料等内容 */}

        </MainContent>
        
        <Sidebar>
           <h3><FaExclamationTriangle /> 注意事项</h3>
           <p>为提高授权率，请确保技术交底清晰、完整，并及时提供审查意见答复所需的实验数据或补充材料。</p>
           
           <h3 style={{marginTop: 'var(--spacing-lg)'}}><FaUsers /> 联系我们</h3>
           <p>电话：010-6228xxxx<br/>邮箱：ipservice@bupt.edu.cn</p>
        </Sidebar>
      </PageContent>
    </PageContainer>
  );
};
export default PatentApplicationPage; 