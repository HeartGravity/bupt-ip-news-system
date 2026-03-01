import React, { useState, useEffect, useContext } from 'react';
import userService from '../../services/userService';
import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components';
import { FaTrashAlt, FaUserShield, FaUser } from 'react-icons/fa';

const PageContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 2rem auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-bottom: 2rem;
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;

  th, td {
    border: 1px solid #ddd;
    padding: 0.8rem;
    text-align: left;
  }

  th {
    background-color: #f2f2f2;
    font-weight: bold;
  }

  tr:nth-child(even) {
    background-color: #f9f9f9;
  }

  tr:hover {
    background-color: #f1f1f1;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  margin: 0 5px;
  color: ${props => props.color || '#333'};
  transition: color 0.2s;

  &:hover {
    color: ${props => props.hoverColor || '#000'};
  }
`;

const RoleSelect = styled.select`
    padding: 5px;
    border-radius: 4px;
    border: 1px solid #ccc;
`;

const Loading = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: red;
`;

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: currentUser } = useContext(AuthContext); // 获取当前登录用户

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userService.getUsers();
        if (response.success) {
          setUsers(response.data);
          setError(null);
        } else {
          setError(response.message || '加载用户列表失败');
        }
      } catch (err) {
        setError(err.message || '无法连接服务器');
        console.error('获取用户列表失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
        setLoading(true);
        const response = await userService.updateUser(userId, { role: newRole });
        if (response.success) {
            setUsers(users.map(user => user._id === userId ? { ...user, role: newRole } : user));
        } else {
            alert(`更新角色失败: ${response.message}`);
        }
    } catch (err) { 
        alert(`更新角色时出错: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (window.confirm(`确定要删除用户 ${username} 吗？此操作不可恢复！`)) {
      try {
        setLoading(true);
        await userService.deleteUser(userId);
        setUsers(users.filter(user => user._id !== userId));
      } catch (err) {
        alert(`删除用户失败: ${err.message}`);
      } finally {
          setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (loading) return <Loading>加载中...</Loading>;
  if (error) return <ErrorMessage>错误: {error}</ErrorMessage>;

  return (
    <PageContainer>
      <Title>用户管理</Title>
      <UserTable>
        <thead>
          <tr>
            <th>用户名</th>
            <th>昵称</th>
            <th>邮箱</th>
            <th>角色</th>
            <th>注册时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.username}</td>
              <td>{user.nickname || '-'}</td>
              <td>{user.email}</td>
              <td>
                {currentUser._id === user._id ? (
                    <span>{user.role === 'admin' ? <FaUserShield title="管理员"/> : <FaUser title="用户"/>} {user.role} (自己)</span>
                ) : (
                    <RoleSelect 
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                    </RoleSelect>
                )}
              </td>
              <td>{formatDate(user.createdAt)}</td>
              <td>
                {/* 可以添加编辑用户按钮，跳转到编辑页面或弹出模态框 */}
                {/* <ActionButton color="#007bff" hoverColor="#0056b3" title="编辑用户"> <FaEdit /> </ActionButton> */}
                {currentUser._id !== user._id && ( // 不能删除自己
                  <ActionButton 
                    color="#dc3545" 
                    hoverColor="#a71d2a" 
                    title="删除用户"
                    onClick={() => handleDeleteUser(user._id, user.username)}
                  >
                    <FaTrashAlt />
                  </ActionButton>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </UserTable>
    </PageContainer>
  );
}

export default UserManagementPage; 