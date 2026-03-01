import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';
const LECTURES_BASE_URL = `${API_URL}/lectures`;

// 获取所有讲座
export const getLectures = async () => {
  try {
    const response = await axios.get(LECTURES_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('获取讲座列表失败:', error.response?.data || error.message);
    throw error.response?.data || new Error('获取讲座列表时发生错误');
  }
};

// 获取单个讲座详情
export const getLectureById = async (id) => {
  try {
    const response = await axios.get(`${LECTURES_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`获取讲座 ${id} 详情失败:`, error.response?.data || error.message);
    throw error.response?.data || new Error('获取讲座详情时发生错误');
  }
};

// 创建讲座 (需要管理员权限，Token 由全局拦截器添加)
export const createLecture = async (lectureData) => {
  try {
    const response = await axios.post(LECTURES_BASE_URL, lectureData);
    return response.data;
  } catch (error) {
    console.error('创建讲座失败:', error.response?.data || error.message);
    throw error.response?.data || new Error('创建讲座时发生错误');
  }
};

// 更新讲座 (需要管理员权限，Token 由全局拦截器添加)
export const updateLecture = async (id, lectureData) => {
  try {
    const response = await axios.put(`${LECTURES_BASE_URL}/${id}`, lectureData);
    return response.data;
  } catch (error) {
    console.error(`更新讲座 ${id} 失败:`, error.response?.data || error.message);
    throw error.response?.data || new Error('更新讲座时发生错误');
  }
};

// 删除讲座 (需要管理员权限，Token 由全局拦截器添加)
export const deleteLecture = async (id) => {
  try {
    const response = await axios.delete(`${LECTURES_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`删除讲座 ${id} 失败:`, error.response?.data || error.message);
    throw error.response?.data || new Error('删除讲座时发生错误');
  }
};

// 导出所有服务函数，以便在组件中使用
const lectureService = {
    getLectures,
    getLectureById,
    createLecture,
    updateLecture,
    deleteLecture
};

export default lectureService; 