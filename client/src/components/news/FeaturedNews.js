import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { format } from "date-fns";
import { FaEye, FaThumbsUp, FaComment, FaArrowRight } from "react-icons/fa";

const FeaturedNews = ({ news }) => {
  const {
    _id,
    title,
    summary,
    category,
    tags,
    coverImage,
    publishDate,
    views,
    likes,
    comments,
    author,
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
    <FeaturedContainer>
      <FeaturedImage>
        <img src={coverImageUrl} alt={title} />
        <FeaturedCategory>{category}</FeaturedCategory>
      </FeaturedImage>

      <FeaturedContent>
        <FeaturedMeta>
          <FeaturedDate>{formattedDate}</FeaturedDate>

          <FeaturedStats>
            <FeaturedStat title="浏览量">
              <FaEye /> <span>{views}</span>
            </FeaturedStat>
            <FeaturedStat title="点赞数">
              <FaThumbsUp /> <span>{likes}</span>
            </FeaturedStat>
            <FeaturedStat title="评论数">
              <FaComment /> <span>{comments?.length || 0}</span>
            </FeaturedStat>
          </FeaturedStats>
        </FeaturedMeta>

        <FeaturedTitle>{title}</FeaturedTitle>
        <FeaturedSummary>{summary}</FeaturedSummary>

        <FeaturedTags>
          {tags.slice(0, 5).map((tag, index) => (
            <FeaturedTag key={index}>{tag}</FeaturedTag>
          ))}
        </FeaturedTags>

        <FeaturedReadMore to={`/news/${_id}`}>
          阅读全文 <FaArrowRight />
        </FeaturedReadMore>
      </FeaturedContent>
    </FeaturedContainer>
  );
};

// 样式组件
const FeaturedContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  transition:
    box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1),
    border-color 0.35s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: var(--shadow-xl);
    border-color: rgba(37, 99, 235, 0.12);
  }

  @media (min-width: 768px) {
    grid-template-columns: 3fr 2fr;
  }
`;

const FeaturedImage = styled.div`
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.35) 0%,
      rgba(0, 0, 0, 0.1) 40%,
      transparent 100%
    );
    z-index: 1;
    pointer-events: none;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }

  ${FeaturedContainer}:hover & img {
    transform: scale(1.05);
  }
`;

const FeaturedCategory = styled.div`
  position: absolute;
  top: var(--spacing-md);
  left: var(--spacing-md);
  background: var(--gradient-primary);
  color: white;
  font-size: var(--font-size-xs);
  font-weight: 600;
  padding: 6px 16px;
  border-radius: var(--border-radius-full);
  z-index: 2;
  letter-spacing: 0.02em;
`;

const FeaturedContent = styled.div`
  padding: var(--spacing-xl);
  display: flex;
  flex-direction: column;
`;

const FeaturedMeta = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--text-light);
`;

const FeaturedDate = styled.span`
  white-space: nowrap;
`;

const FeaturedStats = styled.div`
  display: flex;
  gap: var(--spacing-md);
`;

const FeaturedStat = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const FeaturedTitle = styled.h2`
  font-size: var(--font-size-xxl);
  margin-bottom: var(--spacing-md);
  line-height: 1.3;
  color: var(--text-primary);
  font-weight: 700;
`;

const FeaturedSummary = styled.p`
  font-size: var(--font-size-md);
  margin-bottom: var(--spacing-lg);
  color: var(--text-secondary);
  line-height: 1.7;
  flex-grow: 1;
`;

const FeaturedTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-lg);
`;

const FeaturedTag = styled.span`
  background: var(--primary-100);
  color: var(--primary-600);
  font-size: var(--font-size-xs);
  padding: 4px 12px;
  border-radius: var(--border-radius-full);
  font-weight: 500;
  letter-spacing: 0.01em;
`;

const FeaturedReadMore = styled(Link)`
  display: inline-flex;
  align-items: center;
  color: var(--primary-color);
  font-weight: 600;
  font-size: var(--font-size-md);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  svg {
    margin-left: var(--spacing-xs);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  &:hover {
    color: var(--primary-dark);

    svg {
      transform: translateX(6px);
    }
  }
`;

export default FeaturedNews;
