import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import styled from 'styled-components';

// (这里添加一些基础样式，你可以自定义)
const SettingsWrapper = styled.div`
  max-width: 600px;
`;

const FormSection = styled.div`
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const FormTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid #eee;
  padding-bottom: 0.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
`;

const Button = styled.button`
  background-color: var(--primary-color, #007bff);
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--primary-dark, #0056b3);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Alert = styled.div`
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  color: ${props => (props.type === 'success' ? '#155724' : '#721c24')};
  background-color: ${props => (props.type === 'success' ? '#d4edda' : '#f8d7da')};
  border: 1px solid ${props => (props.type === 'success' ? '#c3e6cb' : '#f5c6cb')};
`;

const AccountSettings = () => {
    const { user, updateProfile, updatePassword, loading } = useContext(AuthContext);

    // 个人资料
    const [profileData, setProfileData] = useState({
        nickname: user?.nickname || '',
        email: user?.email || '',
    });
    const [profileAlert, setProfileAlert] = useState(null);

    // 密码
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [passwordAlert, setPasswordAlert] = useState(null);

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setProfileAlert(null);
        const result = await updateProfile(profileData);
        if (result.success) {
            setProfileAlert({ type: 'success', message: '资料更新成功！' });
        } else {
            setProfileAlert({ type: 'error', message: result.message });
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPasswordAlert(null);

        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            setPasswordAlert({ type: 'error', message: '两次输入的新密码不一致' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordAlert({ type: 'error', message: '新密码至少需要6个字符' });
            return;
        }

        const result = await updatePassword({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
        });

        if (result.success) {
            setPasswordAlert({ type: 'success', message: '密码更新成功！' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
        } else {
            setPasswordAlert({ type: 'error', message: result.message });
        }
    };

    return (
        <SettingsWrapper>
            <FormSection>
                <FormTitle>账户设置</FormTitle>
                {profileAlert && <Alert type={profileAlert.type}>{profileAlert.message}</Alert>}
                <form onSubmit={handleProfileSubmit}>
                    <FormGroup>
                        <Label htmlFor="username">用户名 (不可更改)</Label>
                        <Input
                            type="text"
                            id="username"
                            name="username"
                            value={user?.username || ''}
                            disabled
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="nickname">昵称</Label>
                        <Input
                            type="text"
                            id="nickname"
                            name="nickname"
                            value={profileData.nickname}
                            onChange={handleProfileChange}
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="email">邮箱</Label>
                        <Input
                            type="email"
                            id="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                        />
                    </FormGroup>
                    <Button type="submit" disabled={loading}>
                        {loading ? '保存中...' : '保存更改'}
                    </Button>
                </form>
            </FormSection>

            <FormSection>
                <FormTitle>修改密码</FormTitle>
                {passwordAlert && <Alert type={passwordAlert.type}>{passwordAlert.message}</Alert>}
                <form onSubmit={handlePasswordSubmit}>
                    <FormGroup>
                        <Label htmlFor="currentPassword">当前密码</Label>
                        <Input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="newPassword">新密码</Label>
                        <Input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="confirmNewPassword">确认新密码</Label>
                        <Input
                            type="password"
                            id="confirmNewPassword"
                            name="confirmNewPassword"
                            value={passwordData.confirmNewPassword}
                            onChange={handlePasswordChange}
                            required
                        />
                    </FormGroup>
                    <Button type="submit" disabled={loading}>
                        {loading ? '更新中...' : '更新密码'}
                    </Button>
                </form>
            </FormSection>
        </SettingsWrapper>
    );
};

export default AccountSettings;