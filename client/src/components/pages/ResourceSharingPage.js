import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { updatePageTitle } from '../../utils/seoUtils';
import { FaChevronRight, FaArrowLeft, FaDatabase, FaKey, FaUsers } from 'react-icons/fa';

const PageContainer = styled.div` /* ... same as PatentRetrievalPage ... */ `;
const PageHeader = styled.div` /* ... same as PatentRetrievalPage ... */ `;
const PageTitle = styled.h1` /* ... same as PatentRetrievalPage ... */ `;
const BackLink = styled(Link)` /* ... same as PatentRetrievalPage ... */ `;
const PageContent = styled.div` /* ... same as PatentRetrievalPage ... */ `;
const MainContent = styled.div` /* ... same as PatentRetrievalPage ... */ `;
const ServiceList = styled.ul` /* ... same as PatentRetrievalPage ... */ `;
const ServiceListItem = styled.li` /* ... same as PatentRetrievalPage ... */ `;
const Sidebar = styled.aside` /* ... same as PatentRetrievalPage ... */ `;

const ResourceSharingPage = () => {
  useEffect(() => { updatePageTitle('资源共享服务 - 服务中心'); }, []);
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>资源共享服务</PageTitle>
        <BackLink to="/ip-service">
          <FaArrowLeft /> 返回服务中心
        </BackLink>
      </PageHeader>
      
      <PageContent>
        <MainContent>
          <p>提供专业的知识产权数据库资源访问权限，支持校内师生的学术研究和科研创新活动。部分数据库可能需要校园网环境或图书馆账号登录。</p>
          
          <h2><FaDatabase />主要数据库：</h2>
          <ServiceList>
            <ServiceListItem><FaChevronRight />Derwent Innovations Index (DII)</ServiceListItem>
            <ServiceListItem><FaChevronRight />中国知网专利数据库</ServiceListItem>
            <ServiceListItem><FaChevronRight />incoPat 专利数据库</ServiceListItem>
            <ServiceListItem><FaChevronRight />PQDT Global (ProQuest博硕士论文全文数据库)</ServiceListItem>
            <ServiceListItem><FaChevronRight />其他相关学术与专业数据库</ServiceListItem>
          </ServiceList>

          {/* 可以添加更多关于数据库使用指南、访问方式等内容 */}

        </MainContent>
        
        <Sidebar>
           <h3><FaKey /> 访问权限</h3>
           <p>大多数数据库资源仅限校园网内部访问。部分资源可能需要使用您的图书馆账号登录。校外访问请使用 VPN 服务。</p>
           
           <h3 style={{marginTop: 'var(--spacing-lg)'}}><FaUsers /> 联系我们</h3>
           <p>电话：010-6228xxxx<br/>邮箱：ipservice@bupt.edu.cn</p>
        </Sidebar>
      </PageContent>
    </PageContainer>
  );
};
export default ResourceSharingPage; 