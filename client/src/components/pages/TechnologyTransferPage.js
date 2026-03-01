import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { updatePageTitle } from '../../utils/seoUtils';
import { FaChevronRight, FaArrowLeft, FaCogs, FaExclamationTriangle, FaUsers } from 'react-icons/fa';

const PageContainer = styled.div` /* ... same as PatentRetrievalPage ... */ `;
const PageHeader = styled.div` /* ... same as PatentRetrievalPage ... */ `;
const PageTitle = styled.h1` /* ... same as PatentRetrievalPage ... */ `;
const BackLink = styled(Link)` /* ... same as PatentRetrievalPage ... */ `;
const PageContent = styled.div` /* ... same as PatentRetrievalPage ... */ `;
const MainContent = styled.div` /* ... same as PatentRetrievalPage ... */ `;
const ServiceList = styled.ul` /* ... same as PatentRetrievalPage ... */ `;
const ServiceListItem = styled.li` /* ... same as PatentRetrievalPage ... */ `;
const Sidebar = styled.aside` /* ... same as PatentRetrievalPage ... */ `;

const TechnologyTransferPage = () => {
  useEffect(() => { updatePageTitle('成果转化服务 - 服务中心'); }, []);
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>成果转化服务</PageTitle>
        <BackLink to="/ip-service">
          <FaArrowLeft /> 返回服务中心
        </BackLink>
      </PageHeader>
      
      <PageContent>
        <MainContent>
          <p>促进学校科研成果向现实生产力转化，提供专利技术转让、许可、作价投资等专业服务，搭建技术供需对接平台。</p>
          
          <h2><FaCogs />服务流程：</h2>
          <ServiceList>
            <ServiceListItem><FaChevronRight />技术评估与价值分析</ServiceListItem>
            <ServiceListItem><FaChevronRight />市场调研与推广策略制定</ServiceListItem>
            <ServiceListItem><FaChevronRight />潜在合作方寻源与对接</ServiceListItem>
            <ServiceListItem><FaChevronRight />交易结构设计与谈判支持</ServiceListItem>
            <ServiceListItem><FaChevronRight />合同拟定与签约协助</ServiceListItem>
            <ServiceListItem><FaChevronRight />转化项目后期跟踪与管理</ServiceListItem>
          </ServiceList>

          {/* 可以添加更多关于成功案例、合作模式等内容 */}

        </MainContent>
        
        <Sidebar>
           <h3><FaExclamationTriangle /> 寻求合作？</h3>
           <p>如果您有技术成果希望转化，或寻求与本校进行技术合作，请直接与我们联系，我们将为您提供专业的对接服务。</p>
           
           <h3 style={{marginTop: 'var(--spacing-lg)'}}><FaUsers /> 联系我们</h3>
           <p>电话：010-6228xxxx<br/>邮箱：ipservice@bupt.edu.cn</p>
        </Sidebar>
      </PageContent>
    </PageContainer>
  );
};
export default TechnologyTransferPage; 