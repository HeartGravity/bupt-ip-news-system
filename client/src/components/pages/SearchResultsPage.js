import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import { FaSearch, FaTimes, FaFilter, FaSort } from 'react-icons/fa';
import { newsApi } from '../../services/api';
import NewsCard from '../news/NewsCard';
import LoadingSpinner from '../ui/LoadingSpinner';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newSearchQuery, setNewSearchQuery] = useState(searchQuery);
  const [category, setCategory] = useState(categoryParam);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  
  // 执行搜索
  useEffect(() => {
    const search = async () => {
      if (!searchQuery.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        console.log(`搜索关键词: "${searchQuery}"`, category ? `分类: ${category}` : '');
        const response = await newsApi.searchNews(searchQuery, { category });
        
        if (response.success) {
          setResults(response.data);
          
          // 提取所有可用分类供过滤使用
          const categories = [...new Set(response.data.map(item => item.category))];
          setAvailableCategories(categories);
          
          console.log(`搜索成功，找到 ${response.data.length} 条结果`);
          console.log(`搜索方法: ${response.searchMethod || 'default'}`);
        } else {
          setError('搜索失败');
          console.error('搜索失败:', response.message);
        }
      } catch (err) {
        console.error('搜索出错:', err);
        setError('搜索时发生错误');
      } finally {
        setLoading(false);
      }
    };
    
    search();
  }, [searchQuery, category]);
  
  // 根据排序和过滤设置处理结果
  useEffect(() => {
    let filtered = [...results];
    
    // 应用排序
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'views') {
      filtered.sort((a, b) => b.views - a.views);
    }
    
    setFilteredResults(filtered);
  }, [results, sortBy]);
  
  // 新搜索请求处理
  const handleSearch = (e) => {
    e.preventDefault();
    if (newSearchQuery.trim()) {
      // 构建包含所有参数的URL
      let url = `/search?q=${encodeURIComponent(newSearchQuery.trim())}`;
      
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }
      
      window.location.href = url;
    }
  };
  
  // 清除搜索内容
  const clearSearch = () => {
    setNewSearchQuery('');
  };
  
  // 切换显示过滤器
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // 切换分类过滤
  const handleCategoryChange = (value) => {
    setCategory(value);
    
    // 构建包含所有参数的URL
    let url = `/search?q=${encodeURIComponent(searchQuery)}`;
    
    if (value) {
      url += `&category=${encodeURIComponent(value)}`;
    }
    
    window.location.href = url;
  };
  
  // 切换排序方式
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };
  
  return (
    <PageContainer className="container">
      <SearchHeader>
        <SearchTitle>搜索结果</SearchTitle>
        <SearchForm onSubmit={handleSearch}>
          <SearchInputWrapper>
            <SearchIcon>
              <FaSearch />
            </SearchIcon>
            <SearchInput
              type="text"
              placeholder="搜索知识产权资讯..."
              value={newSearchQuery}
              onChange={(e) => setNewSearchQuery(e.target.value)}
            />
            {newSearchQuery && (
              <ClearButton type="button" onClick={clearSearch}>
                <FaTimes />
              </ClearButton>
            )}
          </SearchInputWrapper>
          <SearchButton type="submit">搜索</SearchButton>
          <FilterButton type="button" onClick={toggleFilters} isActive={showFilters}>
            <FaFilter />
          </FilterButton>
        </SearchForm>
        
        {showFilters && (
          <FiltersContainer>
            <FilterSection>
              <FilterLabel>分类:</FilterLabel>
              <FilterOptions>
                <FilterOption 
                  isActive={!category} 
                  onClick={() => handleCategoryChange('')}
                >
                  全部
                </FilterOption>
                {availableCategories.map(cat => (
                  <FilterOption 
                    key={cat} 
                    isActive={category === cat}
                    onClick={() => handleCategoryChange(cat)}
                  >
                    {cat}
                  </FilterOption>
                ))}
              </FilterOptions>
            </FilterSection>
            
            <FilterSection>
              <FilterLabel>排序:</FilterLabel>
              <SortSelect value={sortBy} onChange={handleSortChange}>
                <option value="relevance">相关度</option>
                <option value="date">最新发布</option>
                <option value="views">最多浏览</option>
              </SortSelect>
            </FilterSection>
          </FiltersContainer>
        )}
      </SearchHeader>
      
      <SearchInfo>
        {searchQuery && (
          <SearchQuery>
            搜索: <span>"{searchQuery}"</span>
            {category && <CategoryBadge>分类: {category}</CategoryBadge>}
          </SearchQuery>
        )}
        {!loading && filteredResults.length > 0 && (
          <ResultCount>找到 {filteredResults.length} 条结果</ResultCount>
        )}
      </SearchInfo>
      
      <SearchContent>
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : filteredResults.length === 0 ? (
          <NoResults>
            <NoResultsIcon>🔍</NoResultsIcon>
            <NoResultsTitle>未找到相关结果</NoResultsTitle>
            <NoResultsText>
              抱歉，没有找到与 "{searchQuery}" 相关的内容。您可以尝试：
            </NoResultsText>
            <NoResultsTips>
              <li>检查您的搜索词是否有拼写错误</li>
              <li>尝试使用更广泛的关键词</li>
              <li>尝试使用不同的关键词</li>
              {category && <li>尝试在所有分类中搜索</li>}
            </NoResultsTips>
            <BackToHomeLink to="/">返回首页</BackToHomeLink>
          </NoResults>
        ) : (
          <ResultsGrid>
            {filteredResults.map(news => (
              <NewsCard key={news._id} news={news} />
            ))}
          </ResultsGrid>
        )}
      </SearchContent>
    </PageContainer>
  );
};

// 样式组件
const PageContainer = styled.div`
  padding: var(--spacing-xl) var(--container-padding);
`;

const SearchHeader = styled.div`
  margin-bottom: var(--spacing-xl);
`;

const SearchTitle = styled.h1`
  font-size: var(--font-size-xxl);
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
`;

const SearchForm = styled.form`
  display: flex;
  max-width: 700px;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const SearchIcon = styled.div`
  position: absolute;
  top: 50%;
  left: var(--spacing-md);
  transform: translateY(-50%);
  color: var(--text-light);
`;

const SearchInput = styled.input`
  width: 100%;
  padding: var(--spacing-md) var(--spacing-md) var(--spacing-md) calc(var(--spacing-md) * 2 + 16px);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-md) 0 0 var(--border-radius-md);
  font-size: var(--font-size-md);
  transition: border-color var(--transition-fast);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const ClearButton = styled.button`
  position: absolute;
  top: 50%;
  right: var(--spacing-md);
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-light);
  cursor: pointer;
  
  &:hover {
    color: var(--text-primary);
  }
`;

const SearchButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 0 var(--spacing-lg);
  border-radius: 0 var(--border-radius-md) var(--border-radius-md) 0;
  font-size: var(--font-size-md);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  
  &:hover {
    background-color: var(--primary-dark);
  }
`;

const FilterButton = styled.button`
  background-color: ${props => props.isActive ? 'var(--primary-color)' : 'var(--bg-secondary)'};
  color: ${props => props.isActive ? 'white' : 'var(--text-primary)'};
  border: none;
  border-radius: var(--border-radius-md);
  width: 40px;
  margin-left: var(--spacing-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: ${props => props.isActive ? 'var(--primary-dark)' : 'var(--border-color)'};
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  background-color: var(--bg-secondary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
  margin-top: var(--spacing-md);
  max-width: 700px;
`;

const FilterSection = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
`;

const FilterLabel = styled.span`
  font-weight: 500;
  color: var(--text-secondary);
`;

const FilterOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FilterOption = styled.button`
  background-color: ${props => props.isActive ? 'var(--primary-color)' : 'white'};
  color: ${props => props.isActive ? 'white' : 'var(--text-primary)'};
  border: 1px solid ${props => props.isActive ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${props => props.isActive ? 'var(--primary-dark)' : 'var(--bg-light)'};
  }
`;

const SortSelect = styled.select`
  padding: 4px 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  background-color: white;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const SearchInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-sm);
`;

const SearchQuery = styled.div`
  font-size: var(--font-size-md);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  
  span {
    color: var(--primary-color);
    font-weight: 500;
  }
`;

const CategoryBadge = styled.div`
  background-color: var(--bg-secondary);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 13px;
  color: var(--text-primary);
`;

const ResultCount = styled.div`
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
`;

const SearchContent = styled.div`
  min-height: 400px;
`;

const ResultsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: var(--spacing-lg);
  
  @media (min-width: 576px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: 992px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--accent-color);
  font-size: var(--font-size-lg);
`;

const NoResults = styled.div`
  text-align: center;
  padding: var(--spacing-xxl) 0;
  max-width: 600px;
  margin: 0 auto;
`;

const NoResultsIcon = styled.div`
  font-size: 4rem;
  margin-bottom: var(--spacing-md);
`;

const NoResultsTitle = styled.h2`
  font-size: var(--font-size-xl);
  color: var(--text-primary);
  margin-bottom: var(--spacing-md);
`;

const NoResultsText = styled.p`
  color: var(--text-secondary);
  margin-bottom: var(--spacing-md);
`;

const NoResultsTips = styled.ul`
  text-align: left;
  max-width: 400px;
  margin: 0 auto var(--spacing-lg);
  color: var(--text-secondary);
`;

const BackToHomeLink = styled(Link)`
  display: inline-block;
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--primary-color);
  color: white;
  border-radius: var(--border-radius-md);
  text-decoration: none;
  font-weight: 500;
  transition: background-color var(--transition-fast);
  
  &:hover {
    background-color: var(--primary-dark);
    color: white;
  }
`;

export default SearchResultsPage;