import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  :root {
    /* === 色板 - 北邮蓝色系 === */
    --primary-950: #0a1628;
    --primary-900: #1e3a5f;
    --primary-800: #1e4d8c;
    --primary-700: #1a5fb5;
    --primary-600: #2563eb;
    --primary-500: #3b82f6;
    --primary-400: #60a5fa;
    --primary-300: #93c5fd;
    --primary-100: #dbeafe;

    /* 兼容旧变量名 */
    --primary-color: #2563eb;
    --primary-light: #60a5fa;
    --primary-dark: #1e3a5f;

    /* 青色强调 - 科技/电信 */
    --accent-cyan: #06b6d4;
    --accent-cyan-light: #22d3ee;

    /* 暖色强调 */
    --accent-color: #f59e0b;
    --accent-light: #fbbf24;
    --accent-dark: #d97706;

    /* 中性灰 */
    --gray-50: #f8fafc;
    --gray-100: #f1f5f9;
    --gray-200: #e2e8f0;
    --gray-300: #cbd5e1;
    --gray-400: #94a3b8;
    --gray-500: #64748b;
    --gray-600: #475569;
    --gray-700: #334155;
    --gray-800: #1e293b;
    --gray-900: #0f172a;

    /* 语义背景 */
    --bg-primary: #f8fafc;
    --bg-secondary: #ffffff;
    --bg-dark: #0f172a;
    --bg-glass: rgba(255, 255, 255, 0.72);
    --bg-glass-dark: rgba(15, 23, 42, 0.8);

    /* 文本 */
    --text-primary: #1e293b;
    --text-secondary: #475569;
    --text-light: #94a3b8;
    --text-white: #ffffff;

    /* === 玻璃拟态 === */
    --glass-bg: rgba(255, 255, 255, 0.72);
    --glass-border: rgba(255, 255, 255, 0.2);
    --glass-blur: blur(20px);
    --glass-shadow: 0 8px 32px rgba(30, 58, 95, 0.12);
    --glass-dark-bg: rgba(15, 23, 42, 0.75);
    --glass-dark-border: rgba(255, 255, 255, 0.08);

    /* === 阴影 (蓝色调) === */
    --shadow-sm: 0 1px 3px rgba(30, 58, 95, 0.06);
    --shadow-md: 0 4px 16px rgba(30, 58, 95, 0.1);
    --shadow-lg: 0 8px 32px rgba(30, 58, 95, 0.12);
    --shadow-xl: 0 16px 48px rgba(30, 58, 95, 0.16);
    --shadow-glow: 0 0 24px rgba(37, 99, 235, 0.25);

    /* 兼容旧变量名 */
    --border-color: #e2e8f0;
    --box-shadow: 0 4px 16px rgba(30, 58, 95, 0.1);
    --box-shadow-hover: 0 8px 32px rgba(30, 58, 95, 0.16);

    /* === 间距 === */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-xxl: 3rem;
    --spacing-section: 5rem;
    --spacing-section-lg: 6.25rem;

    /* === 过渡 === */
    --transition-fast: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-normal: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-slow: 0.6s cubic-bezier(0.4, 0, 0.2, 1);
    --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

    /* === 圆角 === */
    --border-radius-sm: 8px;
    --border-radius-md: 12px;
    --border-radius-lg: 16px;
    --border-radius-xl: 24px;
    --border-radius-full: 9999px;

    /* === 字体 === */
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-md: 1.0625rem;
    --font-size-lg: 1.25rem;
    --font-size-xl: 1.5rem;
    --font-size-xxl: 2rem;
    --font-size-xxxl: 2.75rem;
    --font-size-display: 3.5rem;

    /* === 渐变 === */
    --gradient-primary: linear-gradient(135deg, #2563eb 0%, #06b6d4 100%);
    --gradient-hero: linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #06b6d4 100%);
    --gradient-dark: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
    --gradient-card-hover: linear-gradient(135deg, rgba(37,99,235,0.05), rgba(6,182,212,0.05));

    /* === 容器 === */
    --container-max-width: 1280px;
    --container-padding: 1.5rem;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
    -webkit-text-size-adjust: 100%;
  }

  body {
    font-family: 'Inter', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.7;
  }

  a {
    color: var(--primary-600);
    text-decoration: none;
    transition: color var(--transition-fast);

    &:hover {
      color: var(--primary-400);
    }
  }

  button, input, select, textarea {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }

  h1, h2, h3, h4, h5, h6 {
    margin-bottom: var(--spacing-md);
    font-weight: 700;
    line-height: 1.25;
    letter-spacing: -0.01em;
    color: var(--text-primary);
  }

  h1 { font-size: var(--font-size-xxxl); }
  h2 { font-size: var(--font-size-xxl); }
  h3 { font-size: var(--font-size-xl); }
  h4 { font-size: var(--font-size-lg); }
  h5 { font-size: var(--font-size-md); }
  h6 { font-size: var(--font-size-sm); }

  p {
    margin-bottom: var(--spacing-md);
  }

  img {
    max-width: 100%;
    height: auto;
  }

  ul, ol {
    margin-bottom: var(--spacing-md);
    padding-left: var(--spacing-xl);
  }

  .container {
    width: 100%;
    max-width: var(--container-max-width);
    margin: 0 auto;
    padding: 0 var(--container-padding);
  }

  .section {
    padding: var(--spacing-section) 0;
  }

  /* 现代滚动条 */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--gray-300);
    border-radius: 3px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--gray-400);
  }

  /* 按钮样式 */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-weight: 600;
    text-align: center;
    white-space: nowrap;
    user-select: none;
    border: 1px solid transparent;
    padding: 0.625rem 1.5rem;
    font-size: var(--font-size-sm);
    line-height: 1.5;
    border-radius: var(--border-radius-full);
    transition: all var(--transition-normal);
    cursor: pointer;

    &:focus, &:hover {
      outline: none;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.btn-primary {
      color: var(--text-white);
      background: var(--gradient-primary);
      border: none;

      &:hover {
        box-shadow: var(--shadow-glow);
        transform: translateY(-1px);
      }
    }

    &.btn-secondary {
      color: var(--text-white);
      background-color: var(--accent-color);
      border-color: var(--accent-color);

      &:hover {
        background-color: var(--accent-dark);
        transform: translateY(-1px);
      }
    }

    &.btn-outline {
      color: var(--primary-600);
      background-color: transparent;
      border-color: var(--primary-600);

      &:hover {
        color: var(--text-white);
        background: var(--gradient-primary);
        border-color: transparent;
      }
    }
  }

  /* 表单样式 */
  .form-group {
    margin-bottom: var(--spacing-lg);
  }

  .form-label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-weight: 500;
    color: var(--text-secondary);
  }

  .form-control {
    display: block;
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: var(--font-size-md);
    line-height: 1.5;
    color: var(--text-primary);
    background-color: var(--bg-secondary);
    border: 1.5px solid var(--gray-200);
    border-radius: var(--border-radius-md);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

    &:focus {
      border-color: var(--primary-400);
      outline: 0;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08);
    }
  }

  /* 卡片样式 */
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    word-wrap: break-word;
    background: var(--glass-bg);
    backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur);
    border: 1px solid var(--glass-border);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-md);
    transition: transform var(--transition-normal), box-shadow var(--transition-normal);

    &:hover {
      transform: translateY(-4px) scale(1.01);
      box-shadow: var(--shadow-xl);
    }
  }

  .card-body {
    flex: 1 1 auto;
    padding: var(--spacing-lg);
  }

  .card-title {
    margin-bottom: var(--spacing-md);
    font-weight: 700;
  }

  .card-text {
    margin-bottom: var(--spacing-md);
  }

  /* 工具类 */
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .text-muted { color: var(--text-light); }

  .mt-1 { margin-top: var(--spacing-xs); }
  .mt-2 { margin-top: var(--spacing-sm); }
  .mt-3 { margin-top: var(--spacing-md); }
  .mt-4 { margin-top: var(--spacing-lg); }
  .mt-5 { margin-top: var(--spacing-xl); }
  .mb-1 { margin-bottom: var(--spacing-xs); }
  .mb-2 { margin-bottom: var(--spacing-sm); }
  .mb-3 { margin-bottom: var(--spacing-md); }
  .mb-4 { margin-bottom: var(--spacing-lg); }
  .mb-5 { margin-bottom: var(--spacing-xl); }

  /* 动画关键帧 */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50%      { transform: translateY(-20px) rotate(5deg); }
  }

  @keyframes floatReverse {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50%      { transform: translateY(20px) rotate(-5deg); }
  }

  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
    50%      { box-shadow: 0 0 20px 4px rgba(37, 99, 235, 0.2); }
  }

  @keyframes meshShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes loading {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  .loading {
    display: inline-block;
    position: relative;
    width: 64px;
    height: 64px;

    &:after {
      content: " ";
      display: block;
      border-radius: 50%;
      width: 46px;
      height: 46px;
      margin: 1px;
      border: 3px solid var(--primary-400);
      border-color: var(--primary-400) transparent var(--primary-400) transparent;
      animation: loading 1.2s linear infinite;
    }
  }

  /* 响应式 */
  @media (max-width: 1200px) {
    .container { max-width: 960px; }
  }

  @media (max-width: 992px) {
    .container { max-width: 720px; }
  }

  @media (max-width: 768px) {
    .container { max-width: 540px; }

    h1 { font-size: calc(var(--font-size-xxxl) * 0.75); }
    h2 { font-size: calc(var(--font-size-xxl) * 0.8); }
  }

  @media (max-width: 576px) {
    .container { max-width: 100%; }
  }
`;

export default GlobalStyles;
