// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import GlobalStyles from './styles/GlobalStyles';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Page Components
import HomePage from './components/pages/HomePage';
import IPServiceCenter from './components/pages/IPServiceCenter';
import NewsPage from './components/pages/NewsPage';
import NewsDetailPage from './components/pages/NewsDetailPage';
import SearchResultsPage from './components/pages/SearchResultsPage';
import LoginPage from './components/pages/LoginPage';
import RegisterPage from './components/pages/RegisterPage';
import ProfilePage from './components/pages/ProfilePage';
import NotFoundPage from './components/pages/NotFoundPage';
// 引入讲座页面组件
import LectureListPage from './components/pages/LectureListPage';
import LectureDetailPage from './components/pages/LectureDetailPage';
// 引入管理员页面组件
import AdminDashboard from './components/pages/AdminDashboard';
import UserManagementPage from './components/pages/UserManagementPage';
// 引入管理员新闻管理页面组件
import AdminNewsManagementPage from './components/pages/AdminNewsManagementPage';
import AdminNewsCreatePage from './components/pages/AdminNewsCreatePage';
import AdminNewsEditPage from './components/pages/AdminNewsEditPage';
// 引入管理员讲座管理页面组件
import AdminLectureManagementPage from './components/pages/AdminLectureManagementPage';
import AdminLectureCreatePage from './components/pages/AdminLectureCreatePage';
import AdminLectureEditPage from './components/pages/AdminLectureEditPage';
// 引入分类页面组件
import CategoryPage from './components/pages/CategoryPage';

// 新增：引入服务中心子页面组件
import PatentRetrievalPage from './components/pages/PatentRetrievalPage';
import PatentApplicationPage from './components/pages/PatentApplicationPage';
import LegalConsultingPage from './components/pages/LegalConsultingPage';
import TrainingPage from './components/pages/TrainingPage';
import TechnologyTransferPage from './components/pages/TechnologyTransferPage';
import ResourceSharingPage from './components/pages/ResourceSharingPage';
// 引入智能体页面组件
import AIAgentPage from './components/pages/AIAgentPage';
import PrivateRoute from './components/auth/PrivateRoute';
import AdminRoute from './components/auth/AdminRoute';

// 路由切换时自动滚动到顶部
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <GlobalStyles />
        <Header />
        <main className="main-content">
          <Routes>
            {/* 公共路由 */}
            <Route path="/" element={<HomePage />} />
            <Route path="/ip-service" element={<IPServiceCenter />} />
            {/* 新增：服务中心子页面路由 */}
            <Route path="/ip-service/retrieval" element={<PatentRetrievalPage />} />
            <Route path="/ip-service/application" element={<PatentApplicationPage />} />
            <Route path="/ip-service/legal" element={<LegalConsultingPage />} />
            <Route path="/ip-service/training" element={<TrainingPage />} />
            <Route path="/ip-service/transfer" element={<TechnologyTransferPage />} />
            <Route path="/ip-service/sharing" element={<ResourceSharingPage />} />
            
            <Route path="/news" element={<NewsPage />} />
            <Route path="/news/:id" element={<NewsDetailPage />} />
            <Route path="/lectures" element={<LectureListPage />} />
            <Route path="/lectures/:id" element={<LectureDetailPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* 智能体页面 - 需要登录 */}
            <Route path="/ai-agent" element={<PrivateRoute><AIAgentPage /></PrivateRoute>} />
            {/* 修改: 使用 JSX 注释 */}
            {/* 添加分类页面路由 */}
            <Route path="/category/:categoryName" element={<CategoryPage />} />

            {/* 管理员路由 - 使用 AdminRoute 组件保护 */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><UserManagementPage /></AdminRoute>} />
            <Route path="/admin/news" element={<AdminRoute><AdminNewsManagementPage /></AdminRoute>} />
            <Route path="/admin/news/create" element={<AdminRoute><AdminNewsCreatePage /></AdminRoute>} />
            <Route path="/admin/news/edit/:id" element={<AdminRoute><AdminNewsEditPage /></AdminRoute>} />
            <Route path="/admin/lectures" element={<AdminRoute><AdminLectureManagementPage /></AdminRoute>} />
            <Route path="/admin/lectures/create" element={<AdminRoute><AdminLectureCreatePage /></AdminRoute>} />
            <Route path="/admin/lectures/edit/:id" element={<AdminRoute><AdminLectureEditPage /></AdminRoute>} />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;