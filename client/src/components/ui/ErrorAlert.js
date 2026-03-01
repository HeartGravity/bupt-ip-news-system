import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

/**
 * 错误提示组件
 * 
 * @param {Object} props 组件属性
 * @param {string} props.message 错误消息
 * @param {Function} props.retry 重试函数（可选）
 * @param {string} props.redirectPath 重定向路径（可选）
 * @param {string} props.redirectText 重定向文本（可选）
 */
const ErrorAlert = ({ 
  message, 
  retry, 
  redirectPath, 
  redirectText = '返回首页' 
}) => {
  return (
    <ErrorContainer>
      <ErrorIcon>⚠️</ErrorIcon>
      <ErrorTitle>出错了</ErrorTitle>
      <ErrorMessage>{message || '发生了未知错误'}</ErrorMessage>
      
      <ButtonContainer>
        {retry && (
          <RetryButton type="button" onClick={retry}>
            重试
          </RetryButton>
        )}
        
        {redirectPath && (
          <RedirectLink to={redirectPath}>
            {redirectText}
          </RedirectLink>
        )}
        
        {!redirectPath && !retry && (
          <RedirectLink to="/">
            返回首页
          </RedirectLink>
        )}
      </ButtonContainer>
    </ErrorContainer>
  );
};

// 样式组件
const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  margin: var(--spacing-xl) auto;
  max-width: 600px;
  text-align: center;
  background-color: var(--bg-light);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
`;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: var(--spacing-md);
`;

const ErrorTitle = styled.h2`
  color: var(--error-dark);
  margin-bottom: var(--spacing-md);
`;

const ErrorMessage = styled.p`
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
`;

const RetryButton = styled.button`
  background-color: var(--primary-color);
  color: var(--text-white);
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  font-weight: 500;
  transition: background-color var(--transition-fast);
  
  &:hover {
    background-color: var(--primary-dark);
  }
`;

const RedirectLink = styled(Link)`
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-sm);
  text-decoration: none;
  font-weight: 500;
  transition: background-color var(--transition-fast);
  
  &:hover {
    background-color: var(--bg-secondary-hover);
  }
`;

export default ErrorAlert; 