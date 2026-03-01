import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import lectureService from '../../services/lectureService';

const FormContainer = styled.form`
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  margin: 2rem auto;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
`;

const Select = styled.select`
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
  cursor: pointer;
`;

const Checkbox = styled.input`
  margin-right: 0.5rem;
`;

const Button = styled.button`
  background-color: var(--primary-color);
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-right: 1rem;

  &:hover {
    background-color: var(--primary-dark);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background-color: #6c757d;
  &:hover {
      background-color: #5a6268;
  }
`;

const ErrorMessage = styled.p`
  color: red;
  font-size: 0.9rem;
  margin-top: 1rem;
`;

// 讲座状态选项
const lectureStatuses = ['upcoming', 'ongoing', 'finished', 'cancelled'];
const statusMap = {
    upcoming: '即将开始',
    ongoing: '进行中',
    finished: '已结束',
    cancelled: '已取消'
};

const LectureForm = ({ lectureData, isEditing }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    speaker: '',
    lectureTime: '',
    location: '',
    organizer: '信息与通信工程学院', // 默认值
    registrationRequired: false,
    registrationLink: '',
    status: 'upcoming' // 默认状态
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isEditing && lectureData) {
      setFormData({
        title: lectureData.title || '',
        description: lectureData.description || '',
        speaker: lectureData.speaker || '',
        // 将日期时间格式化为 YYYY-MM-DDTHH:mm
        lectureTime: lectureData.lectureTime ? new Date(lectureData.lectureTime).toISOString().substring(0, 16) : '',
        location: lectureData.location || '',
        organizer: lectureData.organizer || '信息与通信工程学院',
        registrationRequired: lectureData.registrationRequired || false,
        registrationLink: lectureData.registrationLink || '',
        status: lectureData.status || 'upcoming'
      });
    }
  }, [isEditing, lectureData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 确保日期时间正确发送
    const dataToSend = {
        ...formData,
        lectureTime: formData.lectureTime ? new Date(formData.lectureTime).toISOString() : null
    };
    
    // 如果不需要报名，清空报名链接
    if (!dataToSend.registrationRequired) {
        dataToSend.registrationLink = '';
    }

    try {
      if (isEditing) {
        await lectureService.updateLecture(lectureData._id, dataToSend);
        alert('讲座更新成功!');
      } else {
        await lectureService.createLecture(dataToSend);
        alert('讲座发布成功!');
      }
      navigate('/admin/lectures'); // 操作成功后返回列表页
    } catch (err) {
      console.error('操作讲座失败:', err);
      setError(err.response?.data?.message || err.message || '操作失败，请检查输入或联系管理员。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormGroup>
        <Label htmlFor="title">讲座标题</Label>
        <Input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="description">讲座描述</Label>
        <Textarea id="description" name="description" value={formData.description} onChange={handleChange} required rows={5}/>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="speaker">主讲人</Label>
        <Input type="text" id="speaker" name="speaker" value={formData.speaker} onChange={handleChange} required />
      </FormGroup>
      
       <FormGroup>
        <Label htmlFor="lectureTime">讲座时间</Label>
        <Input type="datetime-local" id="lectureTime" name="lectureTime" value={formData.lectureTime} onChange={handleChange} required />
      </FormGroup>
      
       <FormGroup>
        <Label htmlFor="location">讲座地点</Label>
        <Input type="text" id="location" name="location" value={formData.location} onChange={handleChange} required />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="organizer">组织方</Label>
        <Input type="text" id="organizer" name="organizer" value={formData.organizer} onChange={handleChange} />
      </FormGroup>

       <FormGroup>
        <Label htmlFor="status">状态</Label>
        <Select id="status" name="status" value={formData.status} onChange={handleChange} required>
          {lectureStatuses.map(stat => <option key={stat} value={stat}>{statusMap[stat]}</option>)}
        </Select>
      </FormGroup>

      <FormGroup>
        <CheckboxLabel htmlFor="registrationRequired">
          <Checkbox 
            type="checkbox" 
            id="registrationRequired" 
            name="registrationRequired" 
            checked={formData.registrationRequired} 
            onChange={handleChange} 
           />
          需要报名
        </CheckboxLabel>
      </FormGroup>

      {formData.registrationRequired && (
          <FormGroup>
            <Label htmlFor="registrationLink">报名链接</Label>
            <Input type="url" id="registrationLink" name="registrationLink" value={formData.registrationLink} onChange={handleChange} placeholder="https://example.com/register" />
          </FormGroup>
      )}

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Button type="submit" disabled={loading}>
        {loading ? '处理中...' : (isEditing ? '更新讲座' : '发布讲座')}
      </Button>
      <CancelButton type="button" onClick={() => navigate('/admin/lectures')} disabled={loading}>
        取消
      </CancelButton>
    </FormContainer>
  );
};

export default LectureForm; 