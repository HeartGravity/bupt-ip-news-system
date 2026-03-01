import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { updatePageTitle } from '../../utils/seoUtils';
import { FaChevronRight, FaArrowLeft, FaChalkboardTeacher, FaCalendarAlt, FaUsers } from 'react-icons/fa';

const PageContainer = styled.div` /* ... same as PatentRetrievalPage ... */ `;
const PageHeader = styled.div` /* ... same as PatentRetrievalPage ... */ `;
const PageTitle = styled.h1` /* ... same as PatentRetrievalPage ... */ `;
const BackLink = styled(Link)` /* ... same as PatentRetrievalPage ... */ `;
const PageContent = styled.div` /* ... same as PatentRetrievalPage ... */ `;
const MainContent = styled.div` /* ... same as PatentRetrievalPage ... */ `;
const ServiceList = styled.ul` /* ... same as PatentRetrievalPage ... */ `;
const ServiceListItem = styled.li` /* ... same as PatentRetrievalPage ... */ `;
const Sidebar = styled.aside` /* ... same as PatentRetrievalPage ... */ `;

const TrainingPage = () => {
  useEffect(() => { updatePageTitle('知识产权培训 - 服务中心'); }, []);
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>知识产权培训</PageTitle>
        <BackLink to="/ip-service">
          <FaArrowLeft /> 返回服务中心
        </BackLink>
      </PageHeader>
      
      <PageContent>
        <MainContent>
          <p>定期面向全校师生及社会公众开展知识产权相关的培训讲座，内容涵盖专利、商标、著作权的基础知识、申请流程、保护策略等。</p>
          
          <h2><FaChalkboardTeacher />近期培训主题：</h2>
          <ServiceList>
            <ServiceListItem><FaChevronRight />专利信息检索与利用</ServiceListItem>
            <ServiceListItem><FaChevronRight />技术交底书撰写技巧</ServiceListItem>
            <ServiceListItem><FaChevronRight />高价值专利培育</ServiceListItem>
            <ServiceListItem><FaChevronRight />企业知识产权管理</ServiceListItem>
            <ServiceListItem><FaChevronRight />开源软件的知识产权风险</ServiceListItem>
          </ServiceList>

          {/* 可以添加更多关于培训计划、报名方式等内容 */}

        </MainContent>
        
        <Sidebar>
           <h3><FaCalendarAlt /> 培训预告</h3>
           <p>最新的培训计划和讲座安排将发布在网站首页或新闻动态栏目，敬请关注。</p>
           
           <h3 style={{marginTop: 'var(--spacing-lg)'}}><FaUsers /> 联系我们</h3>
           <p>电话：010-6228xxxx<br/>邮箱：ipservice@bupt.edu.cn</p>
        </Sidebar>
      </PageContent>
    </PageContainer>
  );
};
export default TrainingPage; 