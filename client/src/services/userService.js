import axios from 'axios';

const API_URL = '/users';

// 获取所有用户 (管理员)

const getUsers = async () => {
    try {
        // res.data 应该直接就是 { success: true, data: [...] }
        const res = await axios.get(API_URL);
        return res.data;
    } catch (err) {
        // 返回一个统一的错误结构，以便组件处理
        return {
            success: false,
            message: err.response?.data?.message || err.message,
        };
    }
};

// 更新用户角色 (管理员)

const updateUser = async (userId, updateData) => {
    try {
        const res = await axios.put(`${API_URL}/${userId}`, updateData);
        return res.data; // 期望 { success: true, data: { ...updatedUser } }
    } catch (err) {
        return {
            success: false,
            message: err.response?.data?.message || err.message,
        };
    }
};

// 删除用户 (管理员)
const deleteUser = async (userId) => {
    try {
        const res = await axios.delete(`${API_URL}/${userId}`);
        return res.data; // 期望 { success: true }
    } catch (err) {
        return {
            success: false,
            message: err.response?.data?.message || err.message,
        };
    }
};

/**
 * @desc    获取当前用户的收藏列表
 * @route   GET /api/auth/favorites
 */
const getFavorites = async () => {
    try {
        const res = await axios.get('/api/auth/favorites');
        return res.data; // 期望 { success: true, data: [...] }
    } catch (err) {
        return {
            success: false,
            message: err.response?.data?.message || err.message,
        };
    }
};

/**
 * @desc    从收藏中移除新闻
 * @route   PUT /api/auth/favorites/remove/:newsId
 */
const removeFavorite = async (newsId) => {
    try {
        const res = await axios.put(`/api/auth/favorites/remove/${newsId}`);
        return res.data; // 期望 { success: true, message: '...' }
    } catch (err) {
        return {
            success: false,
            message: err.response?.data?.message || err.message,
        };
    }
};

// UserManagementPage.js 使用了 *default* 导入
// 所以我们必须 default export 一个包含这些方法的对象
const userService = {
    getUsers,
    updateUser,
    deleteUser,
    getFavorites,
    removeFavorite
};

export default userService;