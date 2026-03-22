import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import Alert from '../ui/Alert';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [alertInfo, setAlertInfo] = useState({ show: false, type: '', message: '' });

  const { login, isAuthenticated, error, clearError } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // 从 URL 参数中获取成功消息（使用白名单防止反射攻击）
  const ALLOWED_MESSAGES = {
    'register': '注册成功，请登录',
    'password-reset': '密码重置成功，请重新登录',
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const successKey = params.get('success');

    if (successKey && ALLOWED_MESSAGES[successKey]) {
      setAlertInfo({
        show: true,
        type: 'success',
        message: ALLOWED_MESSAGES[successKey]
      });

      // 5秒后自动关闭提示
      const timer = setTimeout(() => {
        setAlertInfo({ show: false, type: '', message: '' });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location]);

  // 如果用户已认证，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // 显示API错误
  useEffect(() => {
    if (error) {
      setAlertInfo({
        show: true,
        type: 'error',
        message: error
      });

      // 清除错误
      clearError();
    }
  }, [error, clearError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // 清除该字段的错误
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    const { email, password } = formData;

    // 验证电子邮件
    if (!email) {
      errors.email = '请输入邮箱';
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      errors.email = '请输入有效的邮箱地址';
    }

    // 验证密码
    if (!password) {
      errors.password = '请输入密码';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 表单验证
    if (!validateForm()) return;

    // 尝试登录
    const success = await login(formData);

    if (success) {
      // 成功登录后，清除表单
      setFormData({ email: '', password: '' });
    }
  };

  const closeAlert = () => {
    setAlertInfo({ show: false, type: '', message: '' });
  };

  return (
    <PageContainer>
      <FormSide>
        <FormContainer>
          <FormHeader>
            <FormTitle>登录</FormTitle>
            <FormSubtitle>登录您的知识产权资讯账户</FormSubtitle>
          </FormHeader>

          {alertInfo.show && (
            <Alert
              type={alertInfo.type}
              message={alertInfo.message}
              onClose={closeAlert}
            />
          )}

          <StyledForm onSubmit={handleSubmit}>
            <FormGroup>
              <FormLabel htmlFor="email">邮箱</FormLabel>
              <InputWrapper>
                <InputIcon>
                  <FaUser />
                </InputIcon>
                <StyledInput
                  type="email"
                  id="email"
                  name="email"
                  placeholder="请输入邮箱"
                  value={formData.email}
                  onChange={handleChange}
                  error={formErrors.email}
                />
              </InputWrapper>
              {formErrors.email && <ErrorMessage>{formErrors.email}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="password">密码</FormLabel>
              <InputWrapper>
                <InputIcon>
                  <FaLock />
                </InputIcon>
                <StyledInput
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="请输入密码"
                  value={formData.password}
                  onChange={handleChange}
                  error={formErrors.password}
                />
                <ShowPasswordToggle
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '隐藏' : '显示'}
                </ShowPasswordToggle>
              </InputWrapper>
              {formErrors.password && <ErrorMessage>{formErrors.password}</ErrorMessage>}
            </FormGroup>

            <FormOptions>
              <RememberMe>
                <Checkbox
                  type="checkbox"
                  id="remember"
                />
                <CheckboxLabel htmlFor="remember">记住我</CheckboxLabel>
              </RememberMe>

              <ForgotPassword to="/forgot-password">忘记密码？</ForgotPassword>
            </FormOptions>

            <SubmitButton type="submit">
              <FaSignInAlt />
              登录
            </SubmitButton>
          </StyledForm>

          <FormFooter>
            <FormFooterText>
              还没有账户？ <RegisterLink to="/register">立即注册</RegisterLink>
            </FormFooterText>
          </FormFooter>
        </FormContainer>
      </FormSide>

      <ImageContainer>
        <MeshOverlay />
        <BrandContent>
          <BrandLogo>BUPT</BrandLogo>
          <BrandTitle>探索知识产权的世界</BrandTitle>
          <BrandSubtitle>获取最新资讯、专业解读及实用指南</BrandSubtitle>
        </BrandContent>
      </ImageContainer>
    </PageContainer>
  );
};

// Animations
const meshShift = keyframes`
  0% {
    background-position: 0% 50%, 100% 50%, 50% 0%;
  }
  25% {
    background-position: 50% 0%, 0% 100%, 100% 50%;
  }
  50% {
    background-position: 100% 50%, 50% 100%, 0% 50%;
  }
  75% {
    background-position: 50% 100%, 100% 0%, 50% 100%;
  }
  100% {
    background-position: 0% 50%, 100% 50%, 50% 0%;
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
`;

// 样式组件
const PageContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  min-height: calc(100vh - 200px);
  background: linear-gradient(135deg, #f0f5ff 0%, #f8fafc 50%, #f0fdfa 100%);

  @media (min-width: 992px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const FormSide = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
`;

const FormContainer = styled.div`
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 24px;
  padding: 48px 40px;
  max-width: 460px;
  width: 100%;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.04),
    0 1px 2px rgba(0, 0, 0, 0.02);
`;

const FormHeader = styled.div`
  margin-bottom: var(--spacing-xl);
  text-align: center;
`;

const FormTitle = styled.h1`
  font-size: 1.85rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 6px;
`;

const FormSubtitle = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-size-md);
`;

const StyledForm = styled.form`
  margin-bottom: var(--spacing-lg);
`;

const FormGroup = styled.div`
  margin-bottom: var(--spacing-md);
`;

const FormLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  font-size: 0.9rem;
  color: var(--text-primary);
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 14px;
  color: var(--text-light);
  font-size: 0.9rem;
  z-index: 1;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 12px 12px 42px;
  border: 1.5px solid ${props => props.error ? 'var(--accent-color)' : '#e2e8f0'};
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-md);
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.25s ease;

  &:focus {
    outline: none;
    border-color: #60a5fa;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
    background: white;
  }

  &::placeholder {
    color: #cbd5e1;
  }
`;

const ShowPasswordToggle = styled.button`
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: #60a5fa;
  font-size: var(--font-size-sm);
  cursor: pointer;
  font-weight: 500;

  &:hover {
    color: #3b82f6;
  }
`;

const ErrorMessage = styled.div`
  color: var(--accent-color);
  font-size: var(--font-size-sm);
  margin-top: 4px;
`;

const FormOptions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
`;

const RememberMe = styled.div`
  display: flex;
  align-items: center;
`;

const Checkbox = styled.input`
  margin-right: var(--spacing-xs);
  accent-color: #3b82f6;
`;

const CheckboxLabel = styled.label`
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
`;

const ForgotPassword = styled(Link)`
  font-size: var(--font-size-sm);
  color: #3b82f6;
  font-weight: 500;

  &:hover {
    color: #2563eb;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 13px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-md);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;

  svg {
    font-size: 1rem;
  }

  &:hover {
    box-shadow: 0 8px 30px rgba(37, 99, 235, 0.35);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const FormFooter = styled.div`
  text-align: center;
`;

const FormFooterText = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-size-md);
`;

const RegisterLink = styled(Link)`
  color: #3b82f6;
  font-weight: 600;

  &:hover {
    color: #2563eb;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  @media (max-width: 991px) {
    display: none;
  }
`;

const MeshOverlay = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 50% at 0% 50%, rgba(37, 99, 235, 0.55), transparent),
    radial-gradient(ellipse 50% 60% at 100% 50%, rgba(6, 182, 212, 0.45), transparent),
    radial-gradient(ellipse 50% 50% at 50% 0%, rgba(99, 102, 241, 0.4), transparent);
  background-size: 200% 200%, 200% 200%, 200% 200%;
  animation: ${meshShift} 12s ease-in-out infinite;
`;

const BrandContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  padding: var(--spacing-xl);
  animation: ${float} 5s ease-in-out infinite;
`;

const BrandLogo = styled.div`
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: 6px;
  margin-bottom: 16px;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.15);
`;

const BrandTitle = styled.h2`
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: var(--spacing-sm);
  text-shadow: 0 1px 10px rgba(0, 0, 0, 0.1);
`;

const BrandSubtitle = styled.p`
  font-size: 1.05rem;
  opacity: 0.9;
  max-width: 320px;
  line-height: 1.6;
`;

export default LoginPage;
