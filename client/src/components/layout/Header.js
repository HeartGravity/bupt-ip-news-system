import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaUserCircle, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
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

  return (
    <HeaderWrapper>
      {/* 顶部条 */}
      <TopBar>
        <Container>
          <TopBarContent>
            <WelcomeText>欢迎访问北邮一站式知识产权服务中心</WelcomeText>
            <UserActions>
              {isAuthenticated ? (
                <UserMenu>
                  <UserMenuTrigger>
                    <FaUserCircle />
                    <span>{user?.nickname || user?.username}</span>
                  </UserMenuTrigger>
                  <UserMenuDropdown>
                    <UserMenuItem as={Link} to="/profile">个人中心</UserMenuItem>
                    {user?.role === 'admin' && (
                      <UserMenuItem as={Link} to="/admin">管理控制台</UserMenuItem>
                    )}
                    <UserMenuItem onClick={handleLogout}>
                      <FaSignOutAlt /> 退出登录
                    </UserMenuItem>
                  </UserMenuDropdown>
                </UserMenu>
              ) : (
                <AuthLinks>
                  <AuthLink as={Link} to="/login">登录</AuthLink>
                  <AuthDivider>|</AuthDivider>
                  <AuthLink as={Link} to="/register">注册</AuthLink>
                </AuthLinks>
              )}
            </UserActions>
          </TopBarContent>
        </Container>
      </TopBar>

      {/* 主导航栏 */}
      <MainNavbar>
        <Container>
          <NavContent>
            {/* Logo区域 */}
            <LogoContainer>
              <Link to="/">
                <Logo>
                  <LogoMain>BUPT</LogoMain>
                  <LogoTagline>一站式知识产权服务中心</LogoTagline>
                </Logo>
              </Link>

              {/* 移动端菜单图标 */}
              <MobileIcons>
                <SearchIcon onClick={toggleSearch}>
                  <FaSearch />
                </SearchIcon>
                <MenuIcon onClick={toggleMenu}>
                  {isMenuOpen ? <FaTimes /> : <FaBars />}
                </MenuIcon>
              </MobileIcons>
            </LogoContainer>

            {/* 导航区域 */}
            <NavContainer className={isMenuOpen ? 'active' : ''}>
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

              {/* 搜索区域 */}
              <SearchContainer className={isSearchOpen ? 'active' : ''}>
                <SearchForm onSubmit={handleSearchSubmit}>
                  <SearchInput
                    type="text"
                    placeholder="搜索知识产权资讯..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <SearchButton type="submit">
                    <FaSearch />
                  </SearchButton>
                </SearchForm>
              </SearchContainer>
            </NavContainer>
          </NavContent>
        </Container>
      </MainNavbar>
    </HeaderWrapper>
  );
};

// 新的样式组件
const HeaderWrapper = styled.header`
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Container = styled.div`
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding);
`;

const TopBar = styled.div`
  background-color: var(--bg-dark);
  color: var(--text-white);
  padding: 8px 0;
  font-size: 14px;
`;

const TopBarContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const WelcomeText = styled.div`
  display: none;
  
  @media (min-width: 768px) {
    display: block;
  }
`;

const AuthLinks = styled.div`
  display: flex;
  align-items: center;
`;

const AuthLink = styled.a`
  color: var(--text-white);
  text-decoration: none;
  transition: color 0.2s;
  
  &:hover {
    color: var(--primary-light);
  }
`;

const AuthDivider = styled.span`
  margin: 0 8px;
  opacity: 0.5;
`;

const MainNavbar = styled.div`
  background-color: white;
  padding: 15px 0;
`;

const NavContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

const Logo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const LogoMain = styled.span`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1.1;
`;

const LogoTagline = styled.span`
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.2;
  text-align: left;
`;

const MobileIcons = styled.div`
  display: none;
  align-items: center;
  gap: 15px;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const SearchIcon = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 20px;
  margin-right: 15px;
  cursor: pointer;
`;

const MenuIcon = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  font-size: 20px;
  cursor: pointer;
`;

const NavContainer = styled.nav`
  display: flex;
  align-items: center;

  @media (max-width: 768px) {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background-color: white;
    flex-direction: column;
    align-items: stretch;
    max-height: ${props => (props.className?.includes('active') ? '500px' : '0')};
    overflow: hidden;
    transition: max-height 0.3s ease-in-out;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const NavLinks = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 25px;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: var(--spacing-md);
    gap: 0;
  }
`;

const NavItem = styled.li`
  @media (max-width: 768px) {
    border-bottom: 1px solid var(--border-color-light);
    &:last-child {
      border-bottom: none;
    }
  }
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: var(--text-primary);
  font-weight: 500;
  padding: 10px 5px;
  transition: color 0.3s ease;
  white-space: nowrap;
  display: block;

  &:hover,
  &.active {
    color: var(--primary-color);
  }

  @media (max-width: 768px) {
    padding: var(--spacing-md) 0;
  }
`;

const SearchContainer = styled.div`
  width: 100%;
  margin: 10px 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  
  &.active {
    max-height: 50px;
  }
  
  @media (min-width: 768px) {
    width: 300px;
    margin: 0;
    max-height: none;
    overflow: visible;
  }
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  width: 100%;
`;

const SearchInput = styled.input`
  padding: 10px 15px;
  border: 1px solid var(--border-color);
  border-radius: 20px 0 0 20px;
  font-size: 14px;
  width: 100%;
  background-color: #f5f5f5;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    background-color: white;
  }
`;

const SearchButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0 20px 20px 0;
  padding: 10px 15px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--primary-dark);
  }
`;

const UserActions = styled.div`
`;

const UserMenu = styled.div`
  position: relative;
  display: inline-block;
`;

const UserMenuTrigger = styled.button`
  background: none;
  border: none;
  display: flex;
  align-items: center;
  color: var(--text-white);
  font-size: 14px;
  cursor: pointer;
  
  svg {
    margin-right: 5px;
  }
  
  &:hover {
    color: var(--primary-light);
  }
`;

const UserMenuDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  z-index: 1000;
  padding: 5px 0;
  display: none;
  //margin-top: 5px;
  
  ${UserMenu}:hover & {
    display: block;
  }
`;

const UserMenuItem = styled.a`
  display: block;
  padding: 8px 15px;
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: #f8f9fa;
    color: var(--primary-color);
  }
  
  svg {
    margin-right: 8px;
  }
`;

export default Header;