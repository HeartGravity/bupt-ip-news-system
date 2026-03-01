import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { newsApi } from '../../services/api'; // 使用 api.js
import ReactQuill from 'react-quill'; // 引入富文本编辑器
import 'react-quill/dist/quill.snow.css'; // Quill 样式

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

const QuillEditor = styled(ReactQuill)`
  .ql-editor {
    min-height: 300px; // 设置编辑器最小高度
    font-size: 1rem;
    background-color: white;
  }
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
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

// Quill 编辑器配置
const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['link', 'image'], // 允许插入链接和图片
    ['clean']
  ],
};

const NewsForm = ({ newsData, isEditing }) => {
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: '专利法规', // 默认分类
    tags: '', // 标签暂时用逗号分隔的字符串
    coverImage: '' // 封面图片 URL 或留空
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // 分类和标签选项 (可以从后端获取或在此定义)
  const categories = [
    '专利法规', '商标法规', '著作权法规', '知识产权保护', 
    '专利申请', '专利案例', '知识产权动态', '国际知识产权'
  ];

  useEffect(() => {
    if (isEditing && newsData) {
      setFormData({
        title: newsData.title || '',
        summary: newsData.summary || '',
        content: newsData.content || '',
        category: newsData.category || '专利法规',
        tags: newsData.tags?.join(', ') || '', // 将数组转为字符串
        coverImage: newsData.coverImage || ''
      });
    }
  }, [isEditing, newsData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQuillChange = (value) => {
    setFormData(prev => ({ ...prev, content: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const dataToSend = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') // 将字符串转为数组
    };

    try {
      if (isEditing) {
        await newsApi.updateNews(newsData._id, dataToSend);
        alert('新闻更新成功!');
      } else {
        await newsApi.createNews(dataToSend);
        alert('新闻发布成功!');
      }
      navigate('/admin/news'); // 操作成功后返回列表页
    } catch (err) {
      console.error('操作新闻失败:', err);
      setError(err.response?.data?.message || err.message || '操作失败，请检查输入或联系管理员。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormGroup>
        <Label htmlFor="title">标题</Label>
        <Input 
          type="text" 
          id="title" 
          name="title" 
          value={formData.title}
          onChange={handleChange}
          required 
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="summary">摘要</Label>
        <Textarea 
          id="summary" 
          name="summary" 
          value={formData.summary}
          onChange={handleChange}
          required
          rows={3}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="content">正文内容</Label>
        <QuillEditor 
          theme="snow" 
          value={formData.content}
          onChange={handleQuillChange}
          modules={quillModules}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="category">分类</Label>
        <Select 
          id="category" 
          name="category" 
          value={formData.category}
          onChange={handleChange}
          required
        >
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </Select>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="tags">标签 (用逗号分隔)</Label>
        <Input 
          type="text" 
          id="tags" 
          name="tags" 
          value={formData.tags}
          onChange={handleChange}
          placeholder="例如: 专利法, 人工智能, 保护"
          required
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="coverImage">封面图片 URL (可选)</Label>
        <Input 
          type="text" 
          id="coverImage" 
          name="coverImage" 
          value={formData.coverImage}
          onChange={handleChange}
          placeholder="例如: /images/covers/my-image.jpg 或 https://example.com/image.png"
        />
        {/* 未来可以添加图片上传功能 */}
      </FormGroup>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Button type="submit" disabled={loading}>
        {loading ? '处理中...' : (isEditing ? '更新新闻' : '发布新闻')}
      </Button>
      <CancelButton type="button" onClick={() => navigate('/admin/news')} disabled={loading}>
        取消
      </CancelButton>
    </FormContainer>
  );
};

export default NewsForm; 