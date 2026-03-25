import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaUserCircle, FaBars, FaTimes, FaSignOutAlt, FaChevronDown } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const dropdownRef = useRef(null);

  // 监听滚动
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 关闭菜单当窗口变宽
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 搜索框展开时自动聚焦
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  // 处理搜索提交
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  // 处理登出
  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  // 切换菜单
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 切换搜索框
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  // 切换用户下拉菜单
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <HeaderWrapper $scrolled={scrolled}>
      <Container>
        <NavContent $scrolled={scrolled}>
          {/* Logo区域 */}
          <LogoContainer as={Link} to="/">
            <LogoMain>BUPT</LogoMain>
            <LogoSubtitle $scrolled={scrolled}>知识产权服务中心</LogoSubtitle>
          </LogoContainer>

          {/* 桌面端导航链接 */}
          <DesktopNav>
            <NavLinks>
              <NavItem>
                <NavLink to="/">首页</NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/category/专利法规">专利法规</NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/category/商标法规">商标法规</NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/category/著作权法规">著作权法规</NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/category/知识产权保护">知识产权保护</NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/category/国际知识产权">国际动态</NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/ip-service">服务中心</NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/lectures">公益讲座</NavLink>
              </NavItem>
              <NavItem>
                <NavLink to="/ai-agent">智能助手</NavLink>
              </NavItem>
            </NavLinks>
          </DesktopNav>

          {/* 右侧操作区 */}
          <RightActions>
            {/* 可展开搜索 */}
            <SearchWrapper $isOpen={isSearchOpen}>
              <SearchForm onSubmit={handleSearchSubmit} $isOpen={isSearchOpen}>
                <SearchInput
                  ref={searchInputRef}
                  type="text"
                  placeholder="搜索知识产权资讯..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  $isOpen={isSearchOpen}
                />
                <SearchToggle
                  type="button"
                  onClick={isSearchOpen && searchQuery.trim() ? (e) => { e.preventDefault(); handleSearchSubmit(e); } : toggleSearch}
                  aria-label="搜索"
                >
                  {isSearchOpen ? <FaTimes /> : <FaSearch />}
                </SearchToggle>
              </SearchForm>
            </SearchWrapper>

            {/* 用户区域 */}
            {isAuthenticated ? (
              <UserMenu ref={dropdownRef}>
                <UserMenuTrigger onClick={toggleDropdown} $isOpen={isDropdownOpen}>
                  <FaUserCircle />
                  <UserName>{user?.nickname || user?.username}</UserName>
                  <FaChevronDown style={{ fontSize: '10px', transition: 'transform var(--transition-fast)', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)' }} />
                </UserMenuTrigger>
                <UserMenuDropdown $isOpen={isDropdownOpen}>
                  <UserMenuItem as={Link} to="/profile" onClick={() => setIsDropdownOpen(false)}>
                    个人中心
                  </UserMenuItem>
                  {user?.role === 'admin' && (
                    <UserMenuItem as={Link} to="/admin" onClick={() => setIsDropdownOpen(false)}>
                      管理控制台
                    </UserMenuItem>
                  )}
                  <DropdownDivider />
                  <UserMenuItem onClick={handleLogout}>
                    <FaSignOutAlt /> 退出登录
                  </UserMenuItem>
                </UserMenuDropdown>
              </UserMenu>
            ) : (
              <AuthLinks>
                <AuthLink as={Link} to="/login">登录</AuthLink>
                <AuthDivider />
                <AuthLink as={Link} to="/register">注册</AuthLink>
              </AuthLinks>
            )}

            {/* 移动端菜单按钮 */}
            <MobileMenuButton onClick={toggleMenu} aria-label="菜单">
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </MobileMenuButton>
          </RightActions>
        </NavContent>
      </Container>

      {/* 移动端菜单 */}
      <MobileNav $isOpen={isMenuOpen}>
        <MobileNavInner>
          <MobileNavLinks>
            <MobileNavItem>
              <MobileNavLink to="/" onClick={() => setIsMenuOpen(false)}>首页</MobileNavLink>
            </MobileNavItem>
            <MobileNavItem>
              <MobileNavLink to="/category/专利法规" onClick={() => setIsMenuOpen(false)}>专利法规</MobileNavLink>
            </MobileNavItem>
            <MobileNavItem>
              <MobileNavLink to="/category/商标法规" onClick={() => setIsMenuOpen(false)}>商标法规</MobileNavLink>
            </MobileNavItem>
            <MobileNavItem>
              <MobileNavLink to="/category/著作权法规" onClick={() => setIsMenuOpen(false)}>著作权法规</MobileNavLink>
            </MobileNavItem>
            <MobileNavItem>
              <MobileNavLink to="/category/知识产权保护" onClick={() => setIsMenuOpen(false)}>知识产权保护</MobileNavLink>
            </MobileNavItem>
            <MobileNavItem>
              <MobileNavLink to="/category/国际知识产权" onClick={() => setIsMenuOpen(false)}>国际动态</MobileNavLink>
            </MobileNavItem>
            <MobileNavItem>
              <MobileNavLink to="/ip-service" onClick={() => setIsMenuOpen(false)}>服务中心</MobileNavLink>
            </MobileNavItem>
            <MobileNavItem>
              <MobileNavLink to="/lectures" onClick={() => setIsMenuOpen(false)}>公益讲座</MobileNavLink>
            </MobileNavItem>
            <MobileNavItem>
              <MobileNavLink to="/ai-agent" onClick={() => setIsMenuOpen(false)}>智能助手</MobileNavLink>
            </MobileNavItem>
          </MobileNavLinks>

          {/* 移动端搜索 */}
          <MobileSearchForm onSubmit={(e) => { handleSearchSubmit(e); setIsMenuOpen(false); }}>
            <MobileSearchInput
              type="text"
              placeholder="搜索知识产权资讯..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MobileSearchButton type="submit">
              <FaSearch />
            </MobileSearchButton>
          </MobileSearchForm>
        </MobileNavInner>
      </MobileNav>
    </HeaderWrapper>
  );
};

/* ======================== Styled Components ======================== */

const cubic = 'cubic-bezier(0.4, 0, 0.2, 1)';

const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: 1000;
  background: ${({ $scrolled }) =>
    $scrolled ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.72)'};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid
    ${({ $scrolled }) =>
      $scrolled ? 'rgba(226, 232, 240, 0.6)' : 'rgba(255, 255, 255, 0.2)'};
  box-shadow: ${({ $scrolled }) =>
    $scrolled ? 'var(--shadow-md)' : 'none'};
  transition: background 0.4s ${cubic},
              box-shadow 0.4s ${cubic},
              border-color 0.4s ${cubic};
`;

const Container = styled.div`
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding);
`;

const NavContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ $scrolled }) => ($scrolled ? '8px 0' : '14px 0')};
  transition: padding 0.4s ${cubic};
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;
`;

const LogoMain = styled.span`
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
`;

const LogoSubtitle = styled.span`
  font-size: ${({ $scrolled }) => ($scrolled ? '0.7rem' : '0.8rem')};
  color: var(--text-secondary);
  font-weight: 500;
  white-space: nowrap;
  transition: font-size 0.4s ${cubic};

  @media (max-width: 480px) {
    display: none;
  }
`;

/* ---- Desktop Nav ---- */

const DesktopNav = styled.nav`
  display: flex;
  align-items: center;
  margin: 0 var(--spacing-lg);
  flex: 1;
  min-width: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLinks = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 4px;
  flex-wrap: nowrap;
`;

const NavItem = styled.li`
  position: relative;
`;

const NavLink = styled(Link)`
  position: relative;
  display: block;
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 500;
  font-size: var(--font-size-sm);
  padding: 6px 10px;
  white-space: nowrap;
  transition: color 0.3s ${cubic};

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background: var(--gradient-primary);
    border-radius: 1px;
    transition: width 0.3s ${cubic};
  }

  &:hover {
    color: var(--primary-600);

    &::after {
      width: 100%;
    }
  }

  &.active {
    color: var(--primary-600);

    &::after {
      width: 100%;
    }
  }
`;

/* ---- Right Actions ---- */

const RightActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

/* ---- Expandable Search ---- */

const SearchWrapper = styled.div`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  position: relative;
`;

const SearchInput = styled.input`
  width: ${({ $isOpen }) => ($isOpen ? '220px' : '0')};
  padding: ${({ $isOpen }) => ($isOpen ? '8px 14px' : '8px 0')};
  border: ${({ $isOpen }) =>
    $isOpen ? '1.5px solid var(--gray-200)' : '1.5px solid transparent'};
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-sm);
  background: ${({ $isOpen }) => ($isOpen ? 'var(--gray-50)' : 'transparent')};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  transition: width 0.4s ${cubic},
              padding 0.4s ${cubic},
              opacity 0.3s ${cubic},
              border-color 0.3s ${cubic},
              background 0.3s ${cubic};
  outline: none;

  &:focus {
    border-color: var(--primary-400);
    background: white;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }
`;

const SearchToggle = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--border-radius-full);
  background: transparent;
  color: var(--text-secondary);
  font-size: 15px;
  cursor: pointer;
  transition: color 0.3s ${cubic}, background 0.3s ${cubic};

  &:hover {
    color: var(--primary-600);
    background: var(--primary-100);
  }
`;

/* ---- User Menu ---- */

const AuthLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const AuthLink = styled.a`
  color: var(--text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: 500;
  padding: 6px 12px;
  border-radius: var(--border-radius-full);
  transition: color 0.3s ${cubic}, background 0.3s ${cubic};

  &:hover {
    color: var(--primary-600);
    background: var(--primary-100);
  }
`;

const AuthDivider = styled.span`
  width: 1px;
  height: 14px;
  background: var(--gray-300);
`;

const UserMenu = styled.div`
  position: relative;

  @media (max-width: 768px) {
    display: none;
  }
`;

const UserMenuTrigger = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: ${({ $isOpen }) => ($isOpen ? 'var(--primary-100)' : 'transparent')};
  border: none;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  padding: 6px 12px;
  border-radius: var(--border-radius-full);
  cursor: pointer;
  transition: background 0.3s ${cubic}, color 0.3s ${cubic};

  svg:first-child {
    font-size: 18px;
    color: var(--primary-600);
  }

  &:hover {
    background: var(--primary-100);
  }
`;

const UserName = styled.span`
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UserMenuDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 180px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-lg);
  padding: 6px;
  z-index: 1100;

  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
  transform: ${({ $isOpen }) => ($isOpen ? 'translateY(0)' : 'translateY(-8px)')};
  transition: opacity 0.25s ${cubic},
              visibility 0.25s ${cubic},
              transform 0.25s ${cubic};
`;

const DropdownDivider = styled.div`
  height: 1px;
  background: var(--gray-200);
  margin: 4px 0;
`;

const UserMenuItem = styled.a`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
  font-size: var(--font-size-sm);
  border-radius: var(--border-radius-sm);
  transition: background 0.2s ${cubic}, color 0.2s ${cubic};

  &:hover {
    background: var(--primary-100);
    color: var(--primary-600);
  }

  svg {
    font-size: 14px;
  }
`;

/* ---- Mobile ---- */

const MobileMenuButton = styled.button`
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--border-radius-sm);
  background: transparent;
  color: var(--text-primary);
  font-size: 20px;
  cursor: pointer;
  transition: background 0.3s ${cubic};

  &:hover {
    background: var(--gray-100);
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileNav = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: block;
    max-height: ${({ $isOpen }) => ($isOpen ? '600px' : '0')};
    overflow: hidden;
    transition: max-height 0.4s ${cubic};
  }
`;

const MobileNavInner = styled.div`
  padding: 0 var(--container-padding) var(--spacing-md);
`;

const MobileNavLinks = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const MobileNavItem = styled.li`
  border-bottom: 1px solid var(--gray-100);

  &:last-child {
    border-bottom: none;
  }
`;

const MobileNavLink = styled(Link)`
  display: block;
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 500;
  font-size: var(--font-size-sm);
  padding: 14px 0;
  position: relative;
  transition: color 0.3s ${cubic};

  &:hover {
    color: var(--primary-600);
  }
`;

const MobileSearchForm = styled.form`
  display: flex;
  margin-top: var(--spacing-sm);
  gap: 0;
`;

const MobileSearchInput = styled.input`
  flex: 1;
  padding: 10px 16px;
  border: 1.5px solid var(--gray-200);
  border-radius: var(--border-radius-full) 0 0 var(--border-radius-full);
  font-size: var(--font-size-sm);
  background: var(--gray-50);
  outline: none;
  transition: border-color 0.3s ${cubic};

  &:focus {
    border-color: var(--primary-400);
    background: white;
  }
`;

const MobileSearchButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: 0 var(--border-radius-full) var(--border-radius-full) 0;
  cursor: pointer;
  transition: opacity 0.3s ${cubic};

  &:hover {
    opacity: 0.9;
  }
`;

export default Header;
