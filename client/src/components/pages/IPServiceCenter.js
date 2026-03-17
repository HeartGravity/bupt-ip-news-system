import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaFilePdf, FaGraduationCap, FaLightbulb, FaGavel, FaBookOpen } from 'react-icons/fa';
import { updatePageTitle } from '../../utils/seoUtils';
import {
  PageContainer,
  HeroSection,
  HeroOverlay,
  HeroContent,
  HeroTitle,
  HeroSubtitle,
  HeroButtons,
  PrimaryButton,
  SecondaryButton,
  ServicesSection,
  SectionHeader,
  SectionTitle,
  SectionDescription,
  ServiceGrid,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
  ServiceLink,
  AboutSection,
  AboutContent,
  AboutText,
  AboutImage,
  ContactSection,
  ContactGrid,
  ContactInfo,
  ContactForm,
  FormGroup,
  FormInput,
  FormTextarea,
  FormButton,
  ResourcesSection,
  ResourceGrid,
  ResourceCard,
  ResourceTitle,
  ResourceDescription,
  ResourceDownload,
  PartnerSection,
  PartnerGrid,
  PartnerLogo
} from './IPServiceCenterStyles';

const IPServiceCenter = () => {
  useEffect(() => {
    // 更新页面标题
    updatePageTitle('知识产权服务中心 - 北京邮电大学图书馆');
  }, []);
  
  return (
    <PageContainer>
      {/* 英雄区域 */}
      <HeroSection>
        <HeroOverlay />
        <HeroContent>
          <HeroTitle>北京邮电大学知识产权服务中心</HeroTitle>
          <HeroSubtitle>为创新提供全方位知识产权支持与服务</HeroSubtitle>
          <HeroButtons>
            <PrimaryButton as="a" href="#services">了解服务内容</PrimaryButton>
            <SecondaryButton as="a" href="#contact">联系我们</SecondaryButton>
          </HeroButtons>
        </HeroContent>
      </HeroSection>
      
      {/* 服务内容 */}
      <ServicesSection id="services">
        <div className="container">
          <SectionHeader>
            <SectionTitle>服务内容</SectionTitle>
            <SectionDescription>我们提供专业的知识产权服务，助力创新成果保护与转化</SectionDescription>
          </SectionHeader>
          
          <ServiceGrid>
            <ServiceCard>
              <ServiceIcon><FaSearch /></ServiceIcon>
              <ServiceTitle>专利检索与分析</ServiceTitle>
              <ServiceDescription>提供专业的专利信息检索、分析和导航服务，为科研创新提供参考</ServiceDescription>
              <ServiceLink as={Link} to="/ip-service/retrieval">了解更多</ServiceLink>
            </ServiceCard>
            
            <ServiceCard>
              <ServiceIcon><FaFilePdf /></ServiceIcon>
              <ServiceTitle>专利申请代理</ServiceTitle>
              <ServiceDescription>提供专利撰写、申请、审查和授权全过程的专业代理服务</ServiceDescription>
              <ServiceLink as={Link} to="/ip-service/application">了解更多</ServiceLink>
            </ServiceCard>
            
            <ServiceCard>
              <ServiceIcon><FaGavel /></ServiceIcon>
              <ServiceTitle>法律咨询服务</ServiceTitle>
              <ServiceDescription>提供知识产权相关法律咨询，解答专利、商标、著作权等问题</ServiceDescription>
              <ServiceLink as={Link} to="/ip-service/legal">了解更多</ServiceLink>
            </ServiceCard>
            
            <ServiceCard>
              <ServiceIcon><FaGraduationCap /></ServiceIcon>
              <ServiceTitle>知识产权培训</ServiceTitle>
              <ServiceDescription>定期开展知识产权相关培训讲座，提升师生知识产权意识</ServiceDescription>
              <ServiceLink as={Link} to="/ip-service/training">了解更多</ServiceLink>
            </ServiceCard>
            
            <ServiceCard>
              <ServiceIcon><FaLightbulb /></ServiceIcon>
              <ServiceTitle>成果转化服务</ServiceTitle>
              <ServiceDescription>提供专利技术转让、许可、作价投资等专业成果转化服务</ServiceDescription>
              <ServiceLink as={Link} to="/ip-service/transfer">了解更多</ServiceLink>
            </ServiceCard>
            
            <ServiceCard>
              <ServiceIcon><FaBookOpen /></ServiceIcon>
              <ServiceTitle>资源共享服务</ServiceTitle>
              <ServiceDescription>提供专业知识产权数据库资源，支持学术科研创新</ServiceDescription>
              <ServiceLink as={Link} to="/ip-service/sharing">了解更多</ServiceLink>
            </ServiceCard>
          </ServiceGrid>
        </div>
      </ServicesSection>
      
      {/* 关于我们 */}
      <AboutSection id="about">
        <div className="container">
          <SectionHeader>
            <SectionTitle>关于我们</SectionTitle>
            <SectionDescription>北京邮电大学知识产权服务中心简介</SectionDescription>
          </SectionHeader>
          
          <AboutContent>
            <AboutText>
              <p>北京邮电大学知识产权服务中心隶属于<a href="https://lib.bupt.edu.cn/" target="_blank" rel="noreferrer">北京邮电大学图书馆</a>，是学校知识产权管理与服务的专门机构。中心立足学校"新工科"建设和"双一流"建设目标，面向学校师生和社会各界，开展知识产权信息服务、专利申请代理、专利转化运营、知识产权教育培训等工作。</p>
              
              <p>中心现有专业人员10余人，包括专利代理师、高级工程师等专业技术人员，拥有丰富的专利代理经验和知识产权管理经验。中心与国家知识产权局、中国专利信息中心等机构保持密切合作，为用户提供高质量的知识产权服务。</p>
              
              <p>多年来，中心协助学校师生申请专利数千项，授权率保持在80%以上；开展专利转化项目数十项；举办各类知识产权培训讲座百余场；为学校科研创新和成果转化提供了有力支持。</p>
            </AboutText>
            
            <AboutImage>
              <img src="/images/ip-service/about-center.jpg" alt="北京邮电大学知识产权服务中心" />
            </AboutImage>
          </AboutContent>
        </div>
      </AboutSection>
      
      {/* 资源下载 */}
      <ResourcesSection id="resources">
        <div className="container">
          <SectionHeader>
            <SectionTitle>资源下载</SectionTitle>
            <SectionDescription>提供知识产权相关资料与表格下载</SectionDescription>
          </SectionHeader>
          
          <ResourceGrid>
            <ResourceCard>
              <ResourceTitle>专利申请指南</ResourceTitle>
              <ResourceDescription>详细介绍专利申请的流程、要点和注意事项</ResourceDescription>
              <ResourceDownload href="/downloads/patent-application-guide.pdf" download="专利申请指南.pdf">下载文档</ResourceDownload>
            </ResourceCard>
            
            <ResourceCard>
              <ResourceTitle>校内专利资助申请表</ResourceTitle>
              <ResourceDescription>申请学校专利资助的表格及填写说明</ResourceDescription>
              <ResourceDownload href="/downloads/funding-application-form.docx" download="校内专利资助申请表.docx">下载文档</ResourceDownload>
            </ResourceCard>
            
            <ResourceCard>
              <ResourceTitle>专利检索指南</ResourceTitle>
              <ResourceDescription>介绍专利检索的方法、技巧和工具</ResourceDescription>
              <ResourceDownload href="/downloads/patent-retrieval-guide.pdf" download="专利检索指南.pdf">下载文档</ResourceDownload>
            </ResourceCard>
            
            <ResourceCard>
              <ResourceTitle>专利转化协议模板</ResourceTitle>
              <ResourceDescription>专利技术转让、许可等协议的标准模板</ResourceDescription>
              <ResourceDownload href="/downloads/transfer-agreement-template.docx" download="专利转化协议模板.docx">下载文档</ResourceDownload>
            </ResourceCard>
          </ResourceGrid>
        </div>
      </ResourcesSection>
      
      {/* 合作伙伴 */}
      <PartnerSection>
        <div className="container">
          <SectionHeader>
            <SectionTitle>合作伙伴</SectionTitle>
            <SectionDescription>我们与以下机构建立了长期合作关系</SectionDescription>
          </SectionHeader>
          
          <PartnerGrid>
            <PartnerLogo>
              <img src="/images/ip-service/partner-1.png" alt="合作伙伴" />
            </PartnerLogo>
            
            <PartnerLogo>
              <img src="/images/ip-service/partner-2.png" alt="合作伙伴" />
            </PartnerLogo>
            
            <PartnerLogo>
              <img src="/images/ip-service/partner-3.png" alt="合作伙伴" />
            </PartnerLogo>
            
            <PartnerLogo>
              <img src="/images/ip-service/partner-4.png" alt="合作伙伴" />
            </PartnerLogo>
            
            <PartnerLogo>
              <img src="/images/ip-service/partner-5.png" alt="合作伙伴" />
            </PartnerLogo>
          </PartnerGrid>
        </div>
      </PartnerSection>
      
      {/* 联系我们 */}
      <ContactSection id="contact">
        <div className="container">
          <SectionHeader>
            <SectionTitle>联系我们</SectionTitle>
            <SectionDescription>如有任何问题，欢迎随时联系我们</SectionDescription>
          </SectionHeader>
          
          <ContactGrid>
            <ContactInfo>
              <h3>联系方式</h3>
              <p><strong>地址：</strong>北京市海淀区西土城路10号北京邮电大学</p>
              <p><strong>电话：</strong>010-62283334</p>
              <p><strong>邮箱：</strong>ipservice@bupt.edu.cn</p>
              <p><strong>工作时间：</strong>周一至周五 9:00-17:00</p>
              
              <iframe 
                src="https://map.baidu.com/poi/%E5%8C%97%E4%BA%AC%E9%82%AE%E7%94%B5%E5%A4%A7%E5%AD%A6/@12949354.095945291,4837436.284939091,16z?uid=85e2706aebcf8fece91e5e65&ugc_type=3&ugc_ver=1&device_ratio=1&compat=1&pcevaname=pc4.1&newfrom=zhuzhan_webmap&querytype=detailConInfo&da_src=shareurl" 
                width="100%" 
                height="250" 
                frameBorder="0" 
                title="北京邮电大学地图"
              ></iframe>
            </ContactInfo>
            
            <ContactForm>
              <h3>留言咨询</h3>
              <form>
                <FormGroup>
                  <FormInput type="text" placeholder="您的姓名" required />
                </FormGroup>
                
                <FormGroup>
                  <FormInput type="email" placeholder="您的邮箱" required />
                </FormGroup>
                
                <FormGroup>
                  <FormInput type="tel" placeholder="联系电话" required />
                </FormGroup>
                
                <FormGroup>
                  <FormTextarea placeholder="您的咨询内容..." rows="5" required></FormTextarea>
                </FormGroup>
                
                <FormButton type="submit">提交咨询</FormButton>
              </form>
            </ContactForm>
          </ContactGrid>
        </div>
      </ContactSection>
    </PageContainer>
  );
};

export default IPServiceCenter;