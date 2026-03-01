import React from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const HeroSection = () => {
  return (
    <HeroContainer>
      <HeroOverlay />
      <HeroContent className="container">
        <HeroHeading>
          <span className="highlight">北邮一站式</span>知识产权服务中心
        </HeroHeading>
        <HeroSubheading>
          整合校内外资源，提供全方位知识产权咨询、检索、申请与转化服务
        </HeroSubheading>
        <HeroActions>
          <PrimaryButton as={Link} to="/ip-service">了解服务</PrimaryButton>
          <SecondaryButton as={Link} to="/news">浏览资讯</SecondaryButton>
        </HeroActions>
      </HeroContent>
      
      <PatternOverlay />
    </HeroContainer>
  );
};

// 动画
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const moveBackground = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

// 样式组件
const HeroContainer = styled.section`
  position: relative;
  min-height: 550px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  background-color: var(--bg-dark);
  background-image: url('/images/hero-bg.jpg');
  background-size: cover;
  background-position: center;
  
  @media (max-width: 768px) {
    min-height: 450px;
  }
`;

const HeroOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 80, 160, 0.75) 0%, rgba(15, 15, 35, 0.85) 100%);
  z-index: 1;
`;

const PatternOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.05' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E");
  z-index: 2;
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 3;
  text-align: center;
  padding: var(--spacing-xl) var(--container-padding);
  animation: ${fadeIn} 1.2s ease-out;
`;

const HeroHeading = styled.h1`
  color: white;
  font-size: 3.2rem;
  line-height: 1.2;
  font-weight: 700;
  margin-bottom: var(--spacing-lg);
  letter-spacing: 0.5px;
  
  .highlight {
    background: linear-gradient(90deg, var(--primary-light) 0%, var(--accent-light) 100%);
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    animation: ${moveBackground} 5s ease infinite;
    background-size: 200% 200%;
  }
  
  @media (max-width: 992px) {
    font-size: 2.8rem;
  }
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const HeroSubheading = styled.p`
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.1rem;
  line-height: 1.6;
  max-width: 650px;
  margin: 0 auto var(--spacing-lg);
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin: 0 auto var(--spacing-md);
  }
`;

const HeroActions = styled.div`
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
`;

const ButtonBase = styled(Link)`
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-xl);
  font-size: var(--font-size-md);
  font-weight: 500;
  border-radius: var(--border-radius-md);
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
`;

const PrimaryButton = styled(ButtonBase)`
  padding: calc(var(--spacing-sm) * 1.1) calc(var(--spacing-xl) * 1.1);
  font-size: 1rem;
  background-color: var(--primary-color);
  color: white;
  border: 2px solid var(--primary-color);
  
  &:hover {
    background-color: var(--primary-dark);
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
    color: white;
  }
`;

const SecondaryButton = styled(ButtonBase)`
  padding: calc(var(--spacing-sm) * 1.1) calc(var(--spacing-xl) * 1.1);
  font-size: 1rem;
  background-color: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.8);
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: white;
    transform: translateY(-3px);
    color: white;
  }
`;

export default HeroSection;