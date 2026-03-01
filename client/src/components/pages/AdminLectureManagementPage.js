import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import lectureService from '../../services/lectureService'; // 使用 lectureService
import LoadingSpinner from '../ui/LoadingSpinner';
// import Pagination from '../ui/Pagination'; // 如果需要分页，取消注释

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

const LectureTable = styled.table`
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

const StatusBadge = styled.span`
  padding: 0.2em 0.6em;
  border-radius: 4px;
  font-size: 0.85em;
  font-weight: bold;
  color: white;
  background-color: ${props => {
    switch (props.status) {
      case 'upcoming': return '#28a745'; // green
      case 'ongoing': return '#007bff'; // blue
      case 'finished': return '#6c757d'; // grey
      case 'cancelled': return '#dc3545'; // red
      default: return '#6c757d';
    }
  }};
`;

function AdminLectureManagementPage() {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 }); // 如果需要分页

  useEffect(() => {
    const fetchLectures = async () => {
      try {
        setLoading(true);
        const response = await lectureService.getLectures(); // 假设 getLectures 返回所有讲座
        if (response.success) {
          setLectures(response.data);
          // 如果需要分页，设置分页数据
          // setPagination({ ...pagination, total: response.total, pages: response.pagination?.pages || 1 });
          setError(null);
        } else {
          setError(response.message || '加载讲座列表失败');
        }
      } catch (err) {
        setError(err.message || '无法连接服务器');
        console.error('获取讲座列表失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, []); // 如果需要分页，添加 pagination.page, pagination.limit 依赖

  const handleDeleteLecture = async (lectureId, title) => {
    if (window.confirm(`确定要删除讲座 "${title}" 吗？此操作不可恢复！`)) {
      try {
        setLoading(true);
        await lectureService.deleteLecture(lectureId);
        // 重新加载数据
        const response = await lectureService.getLectures();
        if (response.success) {
          setLectures(response.data);
           // 如果需要分页，处理分页逻辑 (类似新闻管理)
        } else {
          setError(response.message || '重新加载讲座列表失败');
        }
      } catch (err) {
        alert(`删除讲座失败: ${err.message}`);
        setError(err.message);
      } finally {
          setLoading(false);
      }
    }
  };
  
  // const handlePageChange = (newPage) => { // 如果需要分页
  //     setPagination(prev => ({ ...prev, page: newPage }));
  // };

  const formatDate = (dateString) => {
      if (!dateString) return '-';
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleString('zh-CN', options);
  };
  
   const getStatusText = (status) => {
      switch (status) {
          case 'upcoming': return '即将开始';
          case 'ongoing': return '进行中';
          case 'finished': return '已结束';
          case 'cancelled': return '已取消';
          default: return '未知';
      }
  }

  if (loading && lectures.length === 0) return <LoadingSpinner />;
  if (error) return <ErrorMessage>错误: {error}</ErrorMessage>;

  return (
    <PageContainer>
      <Title>公益讲座管理</Title>
      <AddButton to="/admin/lectures/create">
        <FaPlus /> 发布新讲座
      </AddButton>
      
      {loading && <p>加载中...</p>} 
      
      <LectureTable>
        <thead>
          <tr>
            <th>标题</th>
            <th>主讲人</th>
            <th>时间</th>
            <th>地点</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {lectures.map((lecture) => (
            <tr key={lecture._id}>
              <td>
                <Link to={`/admin/lectures/edit/${lecture._id}`} title={lecture.title}>
                    {lecture.title.length > 30 ? `${lecture.title.substring(0, 30)}...` : lecture.title}
                </Link>
                <br />
                <small><Link to={`/lectures/${lecture._id}`} target="_blank" style={{color: 'gray'}}>查看</Link></small>
              </td>
              <td>{lecture.speaker}</td>
              <td>{formatDate(lecture.lectureTime)}</td>
              <td>{lecture.location}</td>
               <td><StatusBadge status={lecture.status}>{getStatusText(lecture.status)}</StatusBadge></td>
              <td>
                 <Link to={`/admin/lectures/edit/${lecture._id}`} title="编辑">
                     <ActionButton color="#007bff" hoverColor="#0056b3">
                         <FaEdit />
                     </ActionButton>
                 </Link>
                 <ActionButton 
                    color="#dc3545" 
                    hoverColor="#a71d2a" 
                    title="删除"
                    onClick={() => handleDeleteLecture(lecture._id, lecture.title)}
                    disabled={loading} // 防止重复点击
                  >
                    <FaTrashAlt />
                  </ActionButton>
              </td>
            </tr>
          ))}
        </tbody>
      </LectureTable>

      {/* 如果需要分页 */}
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

export default AdminLectureManagementPage; 