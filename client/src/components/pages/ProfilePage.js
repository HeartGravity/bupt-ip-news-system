import React, { useState, useContext } from 'react';
import styled from 'styled-components';
import { AuthContext } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import AccountSettings from '../profile/AccountSettings';
import MyFavorites from '../profile/MyFavorites';
import { FaUserCog, FaHeart } from 'react-icons/fa'; // 引入图标

// (个人中心页面的整体布局样式)
const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Sidebar = styled.aside`
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  align-self: flex-start; // 停在顶部

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const SidebarNav = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: 0.5rem;
`;

const NavLink = styled.button`
  width: 100%;
  padding: 1rem;
  background: ${props => (props.active ? 'var(--primary-color, #007bff)' : 'transparent')};
  color: ${props => (props.active ? 'white' : 'var(--text-primary, #333)')};
  border: none;
  border-radius: 4px;
  text-align: left;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background: ${props => (props.active ? 'var(--primary-dark, #0056b3)' : '#f4f4f4')};
  }

  svg {
    margin-right: 0.75rem;
    font-size: 1.2em;
  }
`;

const ContentArea = styled.main`
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  min-height: 400px;
`;

const ProfilePage = () => {
    const { isAuthenticated, loading } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('settings'); // 'settings' 或 'favorites'

    if (loading) {
        return <div className="container"><p>加载中...</p></div>;
    }

    // 如果未登录，重定向到登录页
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // 根据 activeTab 渲染不同内容
    const renderContent = () => {
        switch (activeTab) {
            case 'settings':
                return <AccountSettings />;
            case 'favorites':
                return <MyFavorites />;
            default:
                return <AccountSettings />;
        }
    };

    return (
        <ProfileContainer>
            <Sidebar>
                <SidebarNav>
                    <NavItem>
                        <NavLink
                            active={activeTab === 'settings'}
                            onClick={() => setActiveTab('settings')}
                        >
                            <FaUserCog />
                            账户设置
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            active={activeTab === 'favorites'}
                            onClick={() => setActiveTab('favorites')}
                        >
                            <FaHeart />
                            我的收藏
                        </NavLink>
                    </NavItem>
                </SidebarNav>
            </Sidebar>
            <ContentArea>
                {renderContent()}
            </ContentArea>
        </ProfileContainer>
    );
};

export default ProfilePage;