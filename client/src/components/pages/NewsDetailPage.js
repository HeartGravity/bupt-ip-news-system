// components/pages/NewsDetailPage.js - 添加导入
import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import styled from "styled-components";
import { format } from "date-fns";
import {
  FaUser,
  FaCalendarAlt,
  FaEye,
  FaThumbsUp,
  FaRegThumbsUp,
  FaBookmark,
  FaRegBookmark,
  FaShare,
} from "react-icons/fa";
import DOMPurify from "dompurify";
import { newsApi } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import LoadingSpinner from "../ui/LoadingSpinner";
import Alert from "../ui/Alert";
import RelatedNews from "../news/RelatedNews";
import CommentSection from "../news/CommentSection";
import {
  updatePageTitle,
  updateMetaTags,
  generateArticleSchema,
  addStructuredData,
} from "../../utils/seoUtils";

// 其余代码保持不变...
const NewsDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useContext(AuthContext);

  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [alertInfo, setAlertInfo] = useState({
    show: false,
    type: "",
    message: "",
  });

  // components/pages/NewsDetailPage.js - 行号约 27-62 需要替换为：
  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        const response = await newsApi.getNewsById(id);

        if (response.success) {
          setNews(response.data);

          // 检查当前用户是否已收藏该新闻
          if (isAuthenticated && user?.favoriteNews) {
            setFavorited(user.favoriteNews.includes(id));
          }

          // 添加 SEO 相关元数据
          updatePageTitle(response.data.title);
          updateMetaTags({
            description: response.data.summary,
            keywords: response.data.tags.join(", "),
            ogTitle: response.data.title,
            ogDescription: response.data.summary,
            ogImage: response.data.coverImage?.startsWith("http")
              ? response.data.coverImage
              : response.data.coverImage?.startsWith("/")
                ? `${window.location.origin}${response.data.coverImage.replace("/images/", "/Images/")}`
                : response.data.coverImage?.startsWith("images/") ||
                    response.data.coverImage?.startsWith("Images/")
                  ? `${window.location.origin}/${response.data.coverImage.replace(/^images\//i, "Images/")}`
                  : response.data.coverImage?.startsWith("covers/")
                    ? `${window.location.origin}/Images/${response.data.coverImage}`
                    : `${window.location.origin}/Images/covers/${response.data.coverImage}`,
          });

          // 添加结构化数据
          const articleSchema = generateArticleSchema(response.data);
          if (articleSchema) {
            addStructuredData(articleSchema);
          }
        } else {
          setError("获取新闻详情失败");
        }
      } catch (err) {
        console.error("获取新闻详情出错:", err);
        setError("获取新闻详情时发生错误");
      } finally {
        setLoading(false);
      }
    };

    fetchNewsDetail();

    // 清理函数
    return () => {
      // 重置页面标题
      updatePageTitle();
    };
  }, [id, isAuthenticated, user]);

  // 处理点赞
  const handleLike = async () => {
    if (!isAuthenticated) {
      setAlertInfo({
        show: true,
        type: "warning",
        message: "请先登录后再点赞",
      });
      return;
    }

    try {
      const response = await newsApi.likeNews(id);

      if (response.success) {
        setNews((prev) => ({
          ...prev,
          likes: response.likes,
        }));
        setLiked(true);

        setAlertInfo({
          show: true,
          type: "success",
          message: "点赞成功！",
        });
      }
    } catch (err) {
      console.error("点赞失败:", err);
      setAlertInfo({
        show: true,
        type: "error",
        message: "点赞失败，请稍后再试",
      });
    }
  };

  // 处理收藏
  const handleFavorite = async () => {
    if (!isAuthenticated) {
      setAlertInfo({
        show: true,
        type: "warning",
        message: "请先登录后再收藏",
      });
      return;
    }

    try {
      const response = await newsApi.favoriteNews(id);

      if (response.success) {
        setFavorited(response.isFavorite);

        setAlertInfo({
          show: true,
          type: "success",
          message: response.isFavorite ? "收藏成功！" : "已取消收藏",
        });
      }
    } catch (err) {
      console.error("收藏/取消收藏失败:", err);
      setAlertInfo({
        show: true,
        type: "error",
        message: "操作失败，请稍后再试",
      });
    }
  };

  // 处理分享
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: news.title,
          text: news.summary,
          url: window.location.href,
        })
        .then(() => console.log("成功分享"))
        .catch((error) => console.log("分享失败", error));
    } else {
      // 复制链接到剪贴板
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          setAlertInfo({
            show: true,
            type: "success",
            message: "链接已复制到剪贴板",
          });
        })
        .catch(() => {
          setAlertInfo({
            show: true,
            type: "error",
            message: "复制链接失败",
          });
        });
    }
  };

  const closeAlert = () => {
    setAlertInfo({ show: false, type: "", message: "" });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !news) {
    return (
      <ErrorContainer className="container">
        <ErrorMessage>{error || "未找到该新闻"}</ErrorMessage>
        <BackButton as={Link} to="/news">
          返回新闻列表
        </BackButton>
      </ErrorContainer>
    );
  }

  const {
    title,
    content,
    category,
    tags,
    author,
    publishDate,
    views,
    likes,
    comments,
    coverImage,
  } = news;

  // 格式化日期
  const formattedDate = format(new Date(publishDate), "yyyy-MM-dd");

  // 默认封面图地址
  const coverImageUrl = !coverImage
    ? "/Images/default-news.jpg"
    : coverImage.startsWith("http") || coverImage.startsWith("/")
      ? coverImage.replace("/images/", "/Images/")
      : coverImage.startsWith("images/") || coverImage.startsWith("Images/")
        ? `/${coverImage.replace(/^images\//i, "Images/")}`
        : coverImage.startsWith("covers/")
          ? `/Images/${coverImage}`
          : `/Images/covers/${coverImage}`;

  return (
    <PageContainer>
      {alertInfo.show && (
        <Alert
          type={alertInfo.type}
          message={alertInfo.message}
          onClose={closeAlert}
        />
      )}

      <NewsHeader style={{ backgroundImage: `url(${coverImageUrl})` }}>
        <HeaderOverlay>
          <div className="container">
            <BreadcrumbNav>
              <BreadcrumbItem as={Link} to="/">
                首页
              </BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem
                as={Link}
                to={`/news?category=${encodeURIComponent(category)}`}
              >
                {category}
              </BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem>正文</BreadcrumbItem>
            </BreadcrumbNav>

            <NewsTitle>{title}</NewsTitle>

            <NewsMeta>
              <MetaItem>
                <FaUser />
                <span>{author.nickname || author.username}</span>
              </MetaItem>
              <MetaItem>
                <FaCalendarAlt />
                <span>{formattedDate}</span>
              </MetaItem>
              <MetaItem>
                <FaEye />
                <span>{views} 阅读</span>
              </MetaItem>
            </NewsMeta>
          </div>
        </HeaderOverlay>
      </NewsHeader>

      <NewsContainer className="container">
        <MainContent>
          <NewsContent
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
          />

          <TagsContainer>
            {tags.map((tag, index) => (
              <TagItem
                key={index}
                as={Link}
                to={`/news?tag=${encodeURIComponent(tag)}`}
              >
                {tag}
              </TagItem>
            ))}
          </TagsContainer>

          <ActionBar>
            <ActionButton onClick={handleLike} active={liked}>
              {liked ? <FaThumbsUp /> : <FaRegThumbsUp />}
              <span>点赞 {likes}</span>
            </ActionButton>

            <ActionButton onClick={handleFavorite} active={favorited}>
              {favorited ? <FaBookmark /> : <FaRegBookmark />}
              <span>{favorited ? "已收藏" : "收藏"}</span>
            </ActionButton>

            <ActionButton onClick={handleShare}>
              <FaShare />
              <span>分享</span>
            </ActionButton>
          </ActionBar>

          <Divider />

          <CommentSection newsId={id} comments={comments} />
        </MainContent>

        <Sidebar>
          <AuthorCard>
            <AuthorAvatar
              src={author.avatar || "/images/default-avatar.png"}
              alt={author.nickname || author.username}
            />
            <AuthorName>{author.nickname || author.username}</AuthorName>
            <AuthorBio>知识产权资讯编辑</AuthorBio>
          </AuthorCard>

          <RelatedNewsWrapper>
            <RelatedNews category={category} currentNewsId={id} />
          </RelatedNewsWrapper>
        </Sidebar>
      </NewsContainer>
    </PageContainer>
  );
};

// 样式组件
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: var(--bg-primary);
`;

const NewsHeader = styled.div`
  height: 450px;
  background-size: cover;
  background-position: center;
  position: relative;

  @media (max-width: 768px) {
    height: 320px;
  }
`;

const HeaderOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(15, 23, 42, 0.1) 0%,
    rgba(15, 23, 42, 0.85) 100%
  );
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding-bottom: var(--spacing-xxl);
`;

const BreadcrumbNav = styled.div`
  display: inline-flex;
  align-items: center;
  margin-bottom: var(--spacing-md);
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-full);
  border: 1px solid rgba(255, 255, 255, 0.15);
`;

const BreadcrumbItem = styled.span`
  color: rgba(255, 255, 255, 0.75);
  font-size: var(--font-size-sm);
  transition: color var(--transition-fast);

  &:last-child {
    color: white;
    font-weight: 500;
  }

  &:hover {
    color: white;
    text-decoration: underline;
  }
`;

const BreadcrumbSeparator = styled.span`
  margin: 0 var(--spacing-xs);
  color: rgba(255, 255, 255, 0.4);
  font-size: var(--font-size-xs);
`;

const NewsTitle = styled.h1`
  color: white;
  font-size: var(--font-size-xxxl);
  margin-bottom: var(--spacing-md);
  line-height: 1.3;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.01em;

  @media (max-width: 768px) {
    font-size: var(--font-size-xxl);
  }
`;

const NewsMeta = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  color: rgba(255, 255, 255, 0.8);
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  font-size: var(--font-size-sm);

  svg {
    margin-right: var(--spacing-xs);
    opacity: 0.8;
  }
`;

const NewsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-xl);
  margin-top: -40px;
  position: relative;
  z-index: 5;
  margin-bottom: var(--spacing-xxl);
  padding-bottom: var(--spacing-xxl);

  @media (min-width: 992px) {
    grid-template-columns: 3fr 1fr;
  }
`;

const MainContent = styled.div`
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-xxl);

  @media (max-width: 768px) {
    padding: var(--spacing-lg);
    border-radius: var(--border-radius-lg);
  }
`;

const NewsContent = styled.div`
  line-height: 1.9;
  color: var(--text-primary);
  font-size: 18px;
  font-family: inherit;

  /* 重置原站内联字体/大小，避免全文统一大号黑体 */
  * {
    font-family: inherit !important;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin: var(--spacing-md) 0;
  }
  td,
  th {
    border: 1px solid var(--border-color);
    padding: 6px 10px;
  }
  th {
    background-color: var(--bg-primary);
    font-weight: bold;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: var(--spacing-xl);
    margin-bottom: var(--spacing-md);
    color: var(--text-primary);
  }

  h1 {
    font-size: var(--font-size-xxl);
  }

  h2 {
    font-size: var(--font-size-xl);
    padding-bottom: var(--spacing-sm);
    border-bottom: 1px solid var(--border-color);
  }

  h3 {
    font-size: var(--font-size-lg);
  }

  p {
    margin-bottom: var(--spacing-md);
  }

  ul,
  ol {
    margin-bottom: var(--spacing-md);
    padding-left: var(--spacing-xl);
  }

  a {
    color: var(--primary-color);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  blockquote {
    border-left: 4px solid var(--accent-cyan);
    padding: var(--spacing-md) var(--spacing-lg);
    margin-left: 0;
    margin-right: 0;
    margin-bottom: var(--spacing-md);
    background: rgba(6, 182, 212, 0.05);
    border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
    color: var(--text-secondary);
    font-style: italic;
  }

  img {
    max-width: 100%;
    border-radius: var(--border-radius-md);
    margin: var(--spacing-md) 0;
  }

  code {
    background-color: var(--bg-primary);
    padding: 2px 4px;
    border-radius: var(--border-radius-sm);
    font-family: monospace;
    font-size: 0.9em;
  }

  pre {
    background-color: var(--bg-primary);
    padding: var(--spacing-md);
    border-radius: var(--border-radius-md);
    overflow-x: auto;
    margin: var(--spacing-md) 0;

    code {
      background-color: transparent;
      padding: 0;
    }
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin: var(--spacing-xl) 0;
`;

const TagItem = styled.span`
  background: var(--primary-100);
  color: var(--primary-600);
  font-size: var(--font-size-sm);
  font-weight: 500;
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--border-radius-full);
  transition: all var(--transition-fast);
  cursor: pointer;

  &:hover {
    background: var(--primary-600);
    color: white;
    box-shadow: var(--shadow-sm);
    transform: translateY(-1px);
  }
`;

const ActionBar = styled.div`
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: ${(props) =>
    props.active ? "var(--gradient-primary)" : "var(--bg-primary)"};
  color: ${(props) => (props.active ? "white" : "var(--text-secondary)")};
  border: none;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-full);
  cursor: pointer;
  font-weight: 500;
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
  box-shadow: ${(props) =>
    props.active ? "var(--shadow-glow)" : "var(--shadow-sm)"};

  &:hover {
    background: ${(props) =>
      props.active ? "var(--gradient-primary)" : "var(--primary-600)"};
    color: white;
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--border-color);
  margin: var(--spacing-lg) 0;
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
`;

const AuthorCard = styled.div`
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-xl);
  text-align: center;
  position: sticky;
  top: 100px;
`;

const AuthorAvatar = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: var(--spacing-sm);
  border: 3px solid var(--primary-100);
  box-shadow: var(--shadow-sm);
`;

const AuthorName = styled.h3`
  color: var(--text-primary);
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-xs);
`;

const AuthorBio = styled.p`
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  margin-bottom: 0;
`;

const RelatedNewsWrapper = styled.div`
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-lg);
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: var(--spacing-xxl) 0;
`;

const ErrorMessage = styled.div`
  font-size: var(--font-size-xl);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
`;

const BackButton = styled.button`
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: var(--spacing-sm) var(--spacing-xl);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-md);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);

  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-glow);
    color: white;
  }
`;

export default NewsDetailPage;
