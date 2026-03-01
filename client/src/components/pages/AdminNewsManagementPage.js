import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import { newsApi } from '../../services/api'; // 使用 api.js 中的 newsApi
import LoadingSpinner from '../ui/LoadingSpinner';
// import Pagination from '../ui/Pagination'; // 假设有分页组件 - 暂时注释

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
  margin-bottom: 1rem;
`;

const AddButton = styled(Link)`
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  padding: 0.7rem 1.2rem;
  border-radius: var(--border-radius-md);
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 1.5rem;
  transition: background-color var(--transition-normal);

  &:hover {
    background-color: var(--primary-dark);
  }

  svg {
    margin-right: 0.5rem;
  }
`;

const NewsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1.5rem;

  th, td {
    border: 1px solid #ddd;
    padding: 0.8rem;
    text-align: left;
    vertical-align: middle;
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

const ErrorMessage = styled.p`
  text-align: center;
  font-size: 1.2rem;
  color: red;
  margin-top: 2rem;
`;

function AdminNewsManagementPage() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10, // 每页显示条数
    total: 0,
    pages: 1
  });

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // 获取所有新闻，无论状态如何，以便管理
        const response = await newsApi.getNews(pagination.page, pagination.limit);
        if (response.success) {
          setNewsList(response.data);
          setPagination(prev => ({ // 使用函数式更新以避免将 pagination 作为依赖
            ...prev,
            total: response.total,
            pages: response.pagination?.pages || 1
          }));
          setError(null);
        } else {
          setError(response.message || '加载新闻列表失败');
        }
      } catch (err) {
        setError(err.message || '无法连接服务器');
        console.error('获取新闻列表失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [pagination.page, pagination.limit]); // 添加 pagination.page 和 pagination.limit 作为依赖

  const handleDeleteNews = async (newsId, title) => {
    if (window.confirm(`确定要删除新闻 "${title}" 吗？此操作不可恢复！`)) {
      try {
        setLoading(true);
        await newsApi.deleteNews(newsId);
        // 重新加载当前页数据
        const response = await newsApi.getNews(pagination.page, pagination.limit);
        if (response.success) {
          setNewsList(response.data);
           setPagination(prev => ({ // 使用函数式更新
            ...prev,
            total: response.total,
            pages: response.pagination?.pages || 1
          }));
           // 如果删除后当前页为空且不是第一页，则返回上一页
          if (response.data.length === 0 && pagination.page > 1) {
             handlePageChange(pagination.page - 1);
          }
        } else {
          setError(response.message || '重新加载新闻列表失败');
        }
      } catch (err) {
        alert(`删除新闻失败: ${err.message}`);
        setError(err.message);
      } finally {
          setLoading(false);
      }
    }
  };
  
  const handlePageChange = (newPage) => {
      setPagination(prev => ({ ...prev, page: newPage }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN');
  };

  if (loading && newsList.length === 0) return <LoadingSpinner />;
  if (error) return <ErrorMessage>错误: {error}</ErrorMessage>;

  return (
    <PageContainer>
      <Title>新闻管理</Title>
      <AddButton to="/admin/news/create">
        <FaPlus /> 发布新新闻
      </AddButton>
      
      {loading && <p>加载中...</p>} 
      
      <NewsTable>
        <thead>
          <tr>
            <th>标题</th>
            <th>分类</th>
            <th>作者</th>
            <th>发布日期</th>
            <th>浏览量</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {newsList.map((news) => (
            <tr key={news._id}>
              <td>
                <Link to={`/admin/news/edit/${news._id}`} title={news.title}>
                    {news.title.length > 30 ? `${news.title.substring(0, 30)}...` : news.title}
                </Link>
                <br />
                <small><Link to={`/news/${news._id}`} target="_blank" style={{color: 'gray'}}>查看</Link></small>
              </td>
              <td>{news.category}</td>
              <td>{news.author?.nickname || news.author?.username || '未知'}</td>
              <td>{formatDate(news.publishDate)}</td>
              <td>{news.views}</td>
              <td>
                 <Link to={`/admin/news/edit/${news._id}`} title="编辑">
                     <ActionButton color="#007bff" hoverColor="#0056b3">
                         <FaEdit />
                     </ActionButton>
                 </Link>
                 <ActionButton 
                    color="#dc3545" 
                    hoverColor="#a71d2a" 
                    title="删除"
                    onClick={() => handleDeleteNews(news._id, news.title)}
                    disabled={loading} // 防止重复点击
                  >
                    <FaTrashAlt />
                  </ActionButton>
              </td>
            </tr>
          ))}
        </tbody>
      </NewsTable>

      {/* 暂时注释分页 */}
      {/* {pagination.pages > 1 && (
          <Pagination 
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
          />
      )} */}

    </PageContainer>
  );
}

export default AdminNewsManagementPage; 