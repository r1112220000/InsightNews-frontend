(function () {
  // 后端基础地址：可根据需要修改为生产环境地址
  const API_BASE_URL = 'http://116.62.221.163:8087';
  // 可选品牌色（十六进制），留空则使用默认
  const BRAND = '';

  // 统一约定的用户管理端点（请根据后端实际实现调整）
  // 建议在后端新增 /admin/users 系列接口。若暂不可用，可在 users.js 中启用本地模拟。
  const ENDPOINTS = {
    // 认证
    login: '/user/login',

    // 用户管理（假定的管理员接口）
    users: {
      list: '/admin/users', // GET ?page=&pageSize=&keyword=
      create: '/admin/users', // POST
      detail: (id) => `/admin/users/${id}`, // GET
      update: (id) => `/admin/users/${id}`, // PUT
      remove: (id) => `/admin/users/${id}`, // DELETE
    },

    // 用户活动/日志（建议后端提供以下端点，供管理端查询）
    activities: {
      timeline: (userId) => `/admin/users/${userId}/activities`, // GET ?page=&pageSize=&type=&start=&end=
      visits: (userId) => `/admin/users/${userId}/visits`, // GET
      topicViews: (userId) => `/admin/users/${userId}/topic-views`, // GET
      comments: (userId) => `/admin/users/${userId}/comments`, // GET
      likes: (userId) => `/admin/users/${userId}/likes`, // GET
    },
  };

  // 暴露为全局只读配置
  window.AppConfig = Object.freeze({ API_BASE_URL, ENDPOINTS, BRAND });
})();


