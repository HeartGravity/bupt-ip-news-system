import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { updatePageTitle } from '../../utils/seoUtils';
import { FaChevronRight, FaArrowLeft, FaBalanceScale, FaExclamationTriangle, FaUsers } from 'react-icons/fa';

const PageContainer = styled.div` /* ... same as PatentRetrievalPage ... */ `;
const PageHeader = styled.div` /* ... same as PatentRetrievalPage ... */ `;
const PageTitle = styled.h1` /* ... same as PatentRetrievalPage ... */ `;
const BackLink = styled(Link)` /* ... same as PatentRetrievalPage ... */ `;
const PageContent = styled.div` /* ... same as PatentRetrievalPage ... */ `;
const MainContent = styled.div` /* ... same as PatentRetrievalPage ... */ `;
const ServiceList = styled.ul` /* ... same as PatentRetrievalPage ... */ `;
const ServiceListItem = styled.li` /* ... same as PatentRetrievalPage ... */ `;
const Sidebar = styled.aside` /* ... same as PatentRetrievalPage ... */ `;

const LegalConsultingPage = () => {
  useEffect(() => { updatePageTitle('法律咨询服务 - 服务中心'); }, []);
  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>法律咨询服务</PageTitle>
        <BackLink to="/ip-service">
          <FaArrowLeft /> 返回服务中心
        </BackLink>
      </PageHeader>
      
      <PageContent>
        <MainContent>
          <p>提供与知识产权相关的各类法律咨询服务，包括但不限于专利权、商标权、著作权的取得、维持、运用和保护等方面的问题解答。</p>
          
          <h2><FaBalanceScale />咨询范围：</h2>
          <ServiceList>
            <ServiceListItem><FaChevronRight />知识产权侵权风险评估</ServiceListItem>
            <ServiceListItem><FaChevronRight />知识产权合同审查（许可、转让等）</ServiceListItem>
            <ServiceListItem><FaChevronRight />维权策略咨询（侵权警告函、诉讼等）</ServiceListItem>
            <ServiceListItem><FaChevronRight />商业秘密保护咨询</ServiceListItem>
            <ServiceListItem><FaChevronRight />其他知识产权相关法律问题</ServiceListItem>
          </ServiceList>

          {/* 可以添加更多关于咨询流程、律师团队等内容 */}

        </MainContent>
        
        <Sidebar>
           <h3><FaExclamationTriangle /> 服务声明</h3>
           <p>本中心提供的法律咨询仅供参考，不构成正式法律意见。如需具体法律服务，建议寻求专业律师帮助。</p>
           
           <h3 style={{marginTop: 'var(--spacing-lg)'}}><FaUsers /> 联系我们</h3>
           <p>电话：010-6228xxxx<br/>邮箱：ipservice@bupt.edu.cn</p>
        </Sidebar>
      </PageContent>
    </PageContainer>
  );
};
export default LegalConsultingPage; 