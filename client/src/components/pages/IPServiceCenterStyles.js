import styled from 'styled-components';

// 页面容器
export const PageContainer = styled.div`
  min-height: 100vh;
`;

// 英雄区域
export const HeroSection = styled.section`
  height: 600px;
  background-image: url('/images/ip-service/hero-bg.jpg');
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    height: 500px;
  }
`;

export const HeroOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.4));
`;

export const HeroContent = styled.div`
  position: relative;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
  text-align: center;
  color: white;
`;

export const HeroTitle = styled.h1`
  font-size: 3rem;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

export const HeroSubtitle = styled.p`
  font-size: 1.5rem;
  margin-bottom: 30px;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

export const HeroButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 20px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: center;
  }
`;

export const PrimaryButton = styled.a`
  display: inline-block;
  padding: 12px 30px;
  background-color: var(--primary-color);
  color: white;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  text-decoration: none;
  transition: background-color var(--transition-fast);
  
  &:hover {
    background-color: var(--primary-dark);
    color: white;
  }
`;

export const SecondaryButton = styled.a`
  display: inline-block;
  padding: 12px 30px;
  background-color: transparent;
  color: white;
  border: 2px solid white;
  border-radius: var(--border-radius-md);
  font-weight: 500;
  text-decoration: none;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: white;
    color: var(--primary-color);
  }
`;

// 服务内容区域
export const ServicesSection = styled.section`
  padding: 80px 0;
  background-color: var(--bg-primary);
`;

export const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 50px;
`;

export const SectionTitle = styled.h2`
  font-size: 2.5rem;
  color: var(--text-primary);
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

export const SectionDescription = styled.p`
  font-size: 1.2rem;
  color: var(--text-secondary);
  max-width: 700px;
  margin: 0 auto;
`;

export const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

export const ServiceCard = styled.div`
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  padding: 30px;
  text-align: center;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: var(--box-shadow-hover);
  }
`;

export const ServiceIcon = styled.div`
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 20px;
`;

export const ServiceTitle = styled.h3`
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 15px;
`;

export const ServiceDescription = styled.p`
  color: var(--text-secondary);
  margin-bottom: 20px;
`;

export const ServiceLink = styled.a`
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  
  &:after {
    content: ' →';
    transition: transform var(--transition-fast);
  }
  
  &:hover:after {
    transform: translateX(5px);
  }
`;

// 关于我们区域
export const AboutSection = styled.section`
  padding: 80px 0;
  background-color: var(--bg-secondary);
`;

export const AboutContent = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 50px;
  align-items: center;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

export const AboutText = styled.div`
  p {
    margin-bottom: 20px;
    line-height: 1.7;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  a {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

export const AboutImage = styled.div`
  img {
    width: 100%;
    border-radius: var(--border-radius-lg);
    box-shadow: var(--box-shadow);
  }
  
  @media (max-width: 992px) {
    max-width: 500px;
    margin: 0 auto;
  }
`;

// 统计数据区域
export const StatsSection = styled.section`
  padding: 60px 0;
  background-color: var(--primary-color);
  color: white;
`;

export const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 30px;
  }
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

export const StatItem = styled.div`
  text-align: center;
`;

export const StatNumber = styled.div`
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 10px;
`;

export const StatLabel = styled.div`
  font-size: 1.2rem;
  opacity: 0.9;
`;

// 资源下载区域
export const ResourcesSection = styled.section`
  padding: 80px 0;
  background-color: var(--bg-primary);
`;

export const ResourceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const ResourceCard = styled.div`
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  padding: 30px;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--box-shadow-hover);
  }
`;

export const ResourceTitle = styled.h3`
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 10px;
`;

export const ResourceDescription = styled.p`
  color: var(--text-secondary);
  margin-bottom: 20px;
`;

export const ResourceDownload = styled.a`
  display: inline-block;
  padding: 10px 20px;
  background-color: var(--primary-color);
  color: white;
  border-radius: var(--border-radius-md);
  text-decoration: none;
  font-weight: 500;
  transition: background-color var(--transition-fast);
  
  &:hover {
    background-color: var(--primary-dark);
    color: white;
  }
`;

// 合作伙伴区域
export const PartnerSection = styled.section`
  padding: 80px 0;
  background-color: var(--bg-secondary);
`;

export const PartnerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 30px;
  
  @media (max-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const PartnerLogo = styled.div`
  background-color: white;
  border-radius: var(--border-radius-md);
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  img {
    max-width: 100%;
    max-height: 80px;
    filter: grayscale(100%);
    opacity: 0.7;
    transition: all var(--transition-normal);
  }
  
  &:hover img {
    filter: grayscale(0);
    opacity: 1;
  }
`;

// 联系我们区域
export const ContactSection = styled.section`
  padding: 80px 0;
  background-color: var(--bg-primary);
`;

export const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 50px;
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

export const ContactInfo = styled.div`
  h3 {
    font-size: 1.8rem;
    margin-bottom: 20px;
    color: var(--text-primary);
  }
  
  p {
    margin-bottom: 15px;
    color: var(--text-secondary);
  }
  
  iframe {
    margin-top: 30px;
    border-radius: var(--border-radius-md);
  }
`;

export const ContactForm = styled.div`
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--box-shadow);
  padding: 30px;
  
  h3 {
    font-size: 1.8rem;
    margin-bottom: 20px;
    color: var(--text-primary);
  }
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const FormInput = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

export const FormTextarea = styled.textarea`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

export const FormButton = styled.button`
  padding: 12px 30px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-md);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  
  &:hover {
    background-color: var(--primary-dark);
  }
`;