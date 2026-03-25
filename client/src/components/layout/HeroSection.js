import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaChevronDown } from 'react-icons/fa';

const keywords = ['专利检索', '商标申请', '法律咨询', '技术转化', '资源共享'];

const HeroSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % keywords.length);
        setVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <HeroContainer>
      <FloatingShape $top="15%" $left="10%" $size="300px" $delay="0s" />
      <FloatingShape $top="60%" $left="75%" $size="200px" $delay="2s" />
      <FloatingShape $top="30%" $left="65%" $size="250px" $delay="4s" />
      <FloatingShape $top="70%" $left="20%" $size="180px" $delay="6s" />

      <HeroContent>
        <HeroBadge>BUPT Knowledge IP Center</HeroBadge>

        <HeroHeading>
          <GradientText>北邮一站式</GradientText>
          <br />
          知识产权服务中心
        </HeroHeading>

        <HeroSubtitle>
          整合校内外资源，提供全方位知识产权咨询、检索、申请与转化服务
        </HeroSubtitle>

        <RotatingKeyword $visible={visible}>
          {keywords[currentIndex]}
        </RotatingKeyword>

        <HeroActions>
          <PrimaryButton as={Link} to="/ip-service">
            了解服务
          </PrimaryButton>
          <SecondaryButton as={Link} to="/news">
            浏览资讯
          </SecondaryButton>
        </HeroActions>
      </HeroContent>

      <ScrollIndicator href="#main-content" aria-label="向下滚动">
        <FaChevronDown />
      </ScrollIndicator>
    </HeroContainer>
  );
};

/* ===== Keyframes ===== */

const meshShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(5deg); }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const chevronBounce = keyframes`
  0%, 100% { transform: translateY(0); opacity: 0.6; }
  50% { transform: translateY(10px); opacity: 1; }
`;

const gradientMove = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

/* ===== Styled Components ===== */

const HeroContainer = styled.section`
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(37, 99, 235, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 20%, rgba(6, 182, 212, 0.25) 0%, transparent 50%),
    radial-gradient(ellipse at 60% 80%, rgba(139, 92, 246, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%);
  background-size: 200% 200%;
  animation: ${meshShift} 15s ease infinite;
`;

const FloatingShape = styled.div`
  position: absolute;
  top: ${({ $top }) => $top};
  left: ${({ $left }) => $left};
  width: ${({ $size }) => $size};
  height: ${({ $size }) => $size};
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.02);
  animation: ${float} 8s ease-in-out infinite;
  animation-delay: ${({ $delay }) => $delay};
  pointer-events: none;
  z-index: 0;
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  padding: 0 var(--spacing-lg, 2rem);
  max-width: 900px;
  animation: ${fadeInUp} 1s ease-out;
`;

const HeroBadge = styled.span`
  display: inline-block;
  padding: 6px 20px;
  margin-bottom: var(--spacing-md, 1.5rem);
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: 1px;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: var(--border-radius-full, 9999px);
  backdrop-filter: blur(8px);
`;

const HeroHeading = styled.h1`
  color: white;
  font-size: var(--font-size-display, 4rem);
  line-height: 1.15;
  font-weight: 800;
  margin-bottom: var(--spacing-md, 1.5rem);
  letter-spacing: -0.5px;

  @media (max-width: 992px) {
    font-size: 3rem;
  }
  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const GradientText = styled.span`
  background: linear-gradient(
    135deg,
    var(--primary-400, #60a5fa) 0%,
    var(--accent-cyan-light, #22d3ee) 50%,
    var(--primary-400, #60a5fa) 100%
  );
  background-size: 200% 200%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: ${gradientMove} 5s ease infinite;
`;

const HeroSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.15rem;
  line-height: 1.7;
  max-width: 650px;
  margin: 0 auto var(--spacing-md, 1.5rem);

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const RotatingKeyword = styled.div`
  font-size: 1.6rem;
  font-weight: 700;
  min-height: 2.4rem;
  margin-bottom: var(--spacing-lg, 2rem);
  background: var(--gradient-primary, linear-gradient(135deg, #3b82f6, #06b6d4));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.4s var(--transition-normal, ease);

  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
`;

const HeroActions = styled.div`
  display: flex;
  justify-content: center;
  gap: var(--spacing-md, 1rem);
  flex-wrap: wrap;
`;

const PrimaryButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 36px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: var(--gradient-primary, linear-gradient(135deg, #2563eb, #06b6d4));
  border: none;
  border-radius: var(--border-radius-full, 9999px);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-glow, 0 4px 20px rgba(37, 99, 235, 0.35));

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 30px rgba(37, 99, 235, 0.5);
    color: white;
  }
`;

const SecondaryButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 14px 36px;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-radius: var(--border-radius-full, 9999px);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.7);
    transform: translateY(-3px);
    color: white;
  }
`;

const ScrollIndicator = styled.a`
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.4rem;
  text-decoration: none;
  animation: ${chevronBounce} 2s ease-in-out infinite;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: rgba(255, 255, 255, 0.9);
  }
`;

export default HeroSection;
