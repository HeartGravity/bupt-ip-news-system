import React from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaWeixin, FaWeibo } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterWrapper>
        <FooterSection>
          <FooterLogo>
            <span className="logo-text">BUPT</span>
            <span className="logo-subtext">一站式知识产权服务中心</span>
          </FooterLogo>
          <FooterDescription>
            北邮一站式知识产权服务中心致力于提供专业、全面的知识产权信息与资讯，为创新者提供有价值的知识产权保护与应用指导。
          </FooterDescription>
          <SocialLinks>
            <SocialLink href="#" title="微信">
              <FaWeixin />
            </SocialLink>
            <SocialLink href="#" title="微博">
              <FaWeibo />
            </SocialLink>
          </SocialLinks>
        </FooterSection>

        <FooterSection>
          <FooterTitle>快速链接</FooterTitle>
          <FooterLinks>
            <FooterLink to="/">首页</FooterLink>
            <FooterLink to="/news?category=专利法规">专利法规</FooterLink>
            <FooterLink to="/news?category=商标法规">商标法规</FooterLink>
            <FooterLink to="/news?category=著作权法规">著作权法规</FooterLink>
            <FooterLink to="/news?category=知识产权保护">知识产权保护</FooterLink>
            <FooterLink to="/news?category=国际知识产权">国际动态</FooterLink>
            <FooterLink to="/ip-service">知识产权服务中心</FooterLink>
          </FooterLinks>
        </FooterSection>

        <FooterSection>
          <FooterTitle>服务指南</FooterTitle>
          <FooterLinks>
            <FooterLink to="/page/about">关于我们</FooterLink>
            <FooterLink to="/page/services">服务内容</FooterLink>
            <FooterLink to="/page/privacy">隐私政策</FooterLink>
            <FooterLink to="/page/terms">使用条款</FooterLink>
            <FooterLink to="/page/faq">常见问题</FooterLink>
          </FooterLinks>
        </FooterSection>

        <FooterSection>
          <FooterTitle>联系我们</FooterTitle>
          <ContactInfo>
            <ContactItem>
              <ContactIcon><FaMapMarkerAlt /></ContactIcon>
              <span>北京市海淀区西土城路10号</span>
            </ContactItem>
            <ContactItem>
              <ContactIcon><FaPhone /></ContactIcon>
              <span>010-12345678</span>
            </ContactItem>
            <ContactItem>
              <ContactIcon><FaEnvelope /></ContactIcon>
              <span>ipinfo@bupt.edu.cn</span>
            </ContactItem>
          </ContactInfo>
        </FooterSection>
      </FooterWrapper>

      <FooterBottom>
        <Copyright>
          © {currentYear} 北邮一站式知识产权服务中心. 保留所有权利.
        </Copyright>
        <ExtraLinks>
          <ExtraLink href="https://www.bupt.edu.cn/" target="_blank">北京邮电大学</ExtraLink>
          <Separator>|</Separator>
          <ExtraLink href="https://lib.bupt.edu.cn/" target="_blank">北京邮电大学图书馆</ExtraLink>
        </ExtraLinks>
      </FooterBottom>
    </FooterContainer>
  );
};

// 样式组件
const FooterContainer = styled.footer`
  background: var(--gradient-dark);
  color: var(--text-white);
  padding-top: var(--spacing-section);
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(37,99,235,0.4), rgba(6,182,212,0.4), transparent);
  }
`;

const FooterWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding);

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 992px) {
    grid-template-columns: 2fr 1fr 1fr 1.5fr;
  }
`;

const FooterSection = styled.div`
  margin-bottom: var(--spacing-lg);
`;

const FooterLogo = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-md);

  .logo-text {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--text-white);
    letter-spacing: 1px;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .logo-subtext {
    font-size: var(--font-size-xs);
    color: rgba(255, 255, 255, 0.5);
    letter-spacing: 3px;
    margin-top: 4px;
  }
`;

const FooterDescription = styled.p`
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: var(--spacing-md);
  line-height: 1.8;
  font-size: 0.9rem;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: var(--spacing-sm);
`;

const SocialLink = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  font-size: var(--font-size-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: var(--gradient-primary);
    color: white;
    border-color: transparent;
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(37, 99, 235, 0.35);
  }
`;

const FooterTitle = styled.h3`
  color: var(--text-white);
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-md);
  font-weight: 600;
  position: relative;
  padding-bottom: var(--spacing-sm);

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 2px;
    background: var(--gradient-primary);
    border-radius: 1px;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const FooterLink = styled(Link)`
  color: rgba(255, 255, 255, 0.55);
  text-decoration: none;
  transition: all 0.25s ease;
  font-size: 0.9rem;

  &:hover {
    color: rgba(255, 255, 255, 0.95);
    padding-left: var(--spacing-xs);
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
`;

const ContactItem = styled.div`
  display: flex;
  align-items: flex-start;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.9rem;
  line-height: 1.6;
`;

const ContactIcon = styled.span`
  margin-right: var(--spacing-sm);
  color: rgba(37, 99, 235, 0.7);
  margin-top: 3px;
`;

const FooterBottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding: var(--spacing-md) 0;
  text-align: center;
  margin-top: var(--spacing-xl);
`;

const Copyright = styled.p`
  color: rgba(255, 255, 255, 0.35);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xs);
`;

const ExtraLinks = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-xs);
`;

const ExtraLink = styled.a`
  color: rgba(37, 99, 235, 0.6);
  font-size: var(--font-size-sm);
  text-decoration: none;
  transition: color 0.25s ease;

  &:hover {
    color: rgba(37, 99, 235, 0.9);
  }
`;

const Separator = styled.span`
  color: rgba(255, 255, 255, 0.2);
`;

export default Footer;
