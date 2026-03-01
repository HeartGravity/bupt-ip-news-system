import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";

const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // 假设项目中使用了 localStorage 存储 jwt token
        const token = localStorage.getItem("token");

        // 发起请求到刚写好的后端管理接口
        const response = await fetch("/api/admin/analytics/ai", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (data.success) {
          // 后端 aggregation 返回的是倒序（最新日期在前），给折线图用时需要翻转为正序（按时间递增）
          const sortedDailyChats = [...data.data.dailyChats].reverse();
          setAnalytics({
            ...data.data,
            dailyChats: sortedDailyChats,
          });
        } else {
          setError(data.message || "获取分析数据失败，可能是权限不足");
        }
      } catch (err) {
        console.error(err);
        setError("网络错误，无法连接到后台接口");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">加载中...</span>
        </div>
        <p className="mt-2">正在加载智能体分析数据...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!analytics) return null;

  // ==== ECharts 图表配置项 ====

  // 1. 近7天活跃度折线图配置
  const dailyChartOptions = {
    title: { text: "近7天对话活跃度", left: "center" },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: analytics.dailyChats.map((item) => item._id),
    },
    yAxis: { type: "value" },
    series: [
      {
        data: analytics.dailyChats.map((item) => item.count),
        type: "line",
        smooth: true,
        itemStyle: { color: "#007bff" },
        areaStyle: { color: "rgba(0, 123, 255, 0.2)" },
      },
    ],
  };

  // 2. 热搜词柱状图（横向）配置
  const hotWordChartOptions = {
    title: { text: "用户高频咨询热词 TOP10", left: "center" },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    xAxis: { type: "value" },
    // ECharts 默认从下往上画图，所以把最热的放最上面也需要 reverse
    yAxis: {
      type: "category",
      data: analytics.hotKeywords.map((item) => item.word).reverse(),
    },
    series: [
      {
        name: "检索频次",
        data: analytics.hotKeywords.map((item) => item.count).reverse(),
        type: "bar",
        itemStyle: { color: "#28a745" },
      },
    ],
  };

  return (
    <div className="container my-5">
      <h2 className="mb-4">
        管理员控制台 <span className="fs-5 text-muted">/ 智能体数据分析</span>
      </h2>

      {/* 顶部数据总览 */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card text-white bg-primary mb-3">
            <div className="card-body">
              <h5 className="card-title">系统总对话请求数</h5>
              <h2 className="card-text">
                {analytics.totalChats || 0} <span className="fs-6">次</span>
              </h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-success mb-3">
            <div className="card-body">
              <h5 className="card-title">今日活跃请求数</h5>
              <h2 className="card-text">
                {analytics.dailyChats.length > 0
                  ? analytics.dailyChats[analytics.dailyChats.length - 1].count
                  : 0}
                <span className="fs-6"> 次</span>
              </h2>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card text-white bg-danger mb-3">
            <div className="card-body">
              <h5 className="card-title">待处理差评反馈</h5>
              <h2 className="card-text">
                {analytics.qualityIssues.length || 0}{" "}
                <span className="fs-6">条</span>
              </h2>
            </div>
          </div>
        </div>
      </div>

      {/* 统计图表区 */}
      <div className="row mb-5">
        <div className="col-md-6 mb-4 mb-md-0">
          <div className="card shadow-sm p-3">
            <ReactECharts
              option={dailyChartOptions}
              style={{ height: "350px" }}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="card shadow-sm p-3">
            <ReactECharts
              option={hotWordChartOptions}
              style={{ height: "350px" }}
            />
          </div>
        </div>
      </div>

      {/* 质量监控：差评反馈追踪表 */}
      <div className="card shadow-sm mb-5">
        <div className="card-header bg-white py-3">
          <h5 className="mb-0 text-danger">
            <i className="bi bi-exclamation-triangle me-2"></i>AI 回复质量预警
            (用户差评记录)
          </h5>
        </div>
        <div className="card-body p-0">
          {analytics.qualityIssues.length === 0 ? (
            <div className="p-4 text-center text-muted">
              暂无差评记录，AI表现良好！
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>记录时间</th>
                    <th>AI 回复内容片段</th>
                    <th>用户反馈/意见</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.qualityIssues.map((issue, idx) => (
                    <tr key={idx}>
                      <td>
                        {new Date(issue.timestamp).toLocaleString("zh-CN")}
                      </td>
                      <td
                        style={{ maxWidth: "300px" }}
                        className="text-truncate"
                      >
                        {issue.messageContent}
                      </td>
                      <td className="text-danger fw-bold">
                        {issue.feedback || "未填写具体意见"}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline-primary">
                          查看对话上下文
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
