/**
 * 模拟数据 - 仅用于开发环境
 * 
 * 当API请求失败或开发环境中使用
 */

// 模拟新闻数据
export const mockNewsData = [
  {
    _id: '1',
    title: '中国专利法修订案2021年正式实施',
    summary: '中国专利法修订案将于2021年6月1日正式实施，此次修订加强了专利保护力度，延长了外观设计专利保护期限。',
    content: `
      <p>中国专利法修订案于2020年10月17日通过，将于2021年6月1日正式实施。此次是继2008年后，专利法时隔13年的又一次大修，标志着我国知识产权保护进入新阶段。</p>
      <p>新修订的专利法主要有以下变化：</p>
      <ul>
        <li>将外观设计专利保护期限由10年延长至15年</li>
        <li>增加了专利侵权惩罚性赔偿制度，最高可达5倍</li>
        <li>增设了专利开放许可制度，促进专利技术转化应用</li>
        <li>完善了职务发明创造制度，加强对发明人权益保护</li>
      </ul>
      <p>这些修改内容体现了我国加强知识产权保护的决心与行动，对促进科技创新和经济发展具有重要意义。</p>
    `,
    category: '专利法规',
    tags: ['专利法', '法律修订'],
    coverImage: 'patent-law.jpg',
    publishDate: new Date('2021-05-15'),
    views: 1245,
    likes: 86,
    comments: [],
    author: { username: 'admin', nickname: '知识产权编辑' }
  },
  {
    _id: '2',
    title: '华为最新5G通信专利申请引领全球创新',
    summary: '华为公司在5G通信领域再创佳绩，最新专利申请数量位居全球第一，展示了中国企业在高科技领域的创新实力。',
    content: `
      <p>据世界知识产权组织(WIPO)最新数据显示，华为公司在5G通信相关专利申请数量连续三年位居全球第一，累计申请量已超过6000件，超过欧美和日韩主要竞争对手。</p>
      <p>华为的专利分布主要集中在以下领域：</p>
      <ul>
        <li>基站传输技术</li>
        <li>网络架构</li>
        <li>移动终端通信技术</li>
        <li>毫米波技术</li>
      </ul>
      <p>华为研发投入占年收入的15%以上，2022年研发支出超过1500亿元人民币，位居全球科技企业前列。这种持续的创新投入使华为在全球通信技术领域保持领先地位。</p>
    `,
    category: '专利申请',
    tags: ['华为', '5G通信', '专利申请'],
    coverImage: 'huawei-5g.jpg',
    publishDate: new Date('2022-07-20'),
    views: 980,
    likes: 62,
    comments: [],
    author: { username: 'admin', nickname: '知识产权编辑' }
  },
  {
    _id: '3',
    title: '人工智能生成内容的著作权争议与最新司法解释',
    summary: '随着人工智能技术的快速发展，AI生成内容的著作权归属问题引发广泛讨论，多国司法机构开始出台相关解释和规定。',
    content: `
      <p>随着AIGC(AI生成内容)技术的快速发展，由人工智能生成的文字、图像、音乐、视频等创作物的著作权归属问题引发了全球范围内的法律争议。</p>
      <p>目前，各国对AI生成内容的著作权保护态度不一：</p>
      <ul>
        <li>美国著作权局认为，完全由AI生成的作品不受著作权保护，但人类对AI输出结果有创造性干预的作品可以获得保护</li>
        <li>欧盟倾向于将AI生成内容视为"计算机生成作品"，版权归属于设置和使用AI系统的人</li>
        <li>中国最新司法解释提出了"人机协作"概念，根据人类创造性贡献程度确定著作权保护范围</li>
      </ul>
      <p>随着AI技术不断发展，这一领域的法律规定也将持续演变，各国立法和司法实践正在积极探索适合AIGC时代的著作权保护框架。</p>
    `,
    category: '著作权法规',
    tags: ['人工智能', 'AI创作', '著作权'],
    coverImage: 'ai-copyright.jpg',
    publishDate: new Date('2023-09-05'),
    views: 753,
    likes: 41,
    comments: [],
    author: { username: 'admin', nickname: '知识产权编辑' }
  }
];

// 模拟用户数据
export const mockUserData = {
  _id: 'user1',
  username: 'testuser',
  email: 'test@example.com',
  nickname: '测试用户',
  avatar: 'default-avatar.png',
  role: 'user',
  favoriteNews: ['1', '3']
};

// 模拟分类数据
export const mockCategoriesData = [
  { id: '1', name: '专利法规', count: 28 },
  { id: '2', name: '商标法规', count: 15 },
  { id: '3', name: '著作权法规', count: 22 },
  { id: '4', name: '知识产权保护', count: 35 },
  { id: '5', name: '专利申请', count: 42 },
  { id: '6', name: '专利案例', count: 31 },
  { id: '7', name: '知识产权动态', count: 56 },
  { id: '8', name: '国际知识产权', count: 27 }
]; 