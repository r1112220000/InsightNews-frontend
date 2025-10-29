(function () {
  const { API_BASE_URL } = window.AppConfig || {};

  function getToken() {
    return localStorage.getItem('token');
  }

  async function request(path, { method = 'GET', headers = {}, body } = {}) {
    const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
    const token = getToken();

    const reqInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: token } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    };

    const res = await fetch(url, reqInit);
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(text || `HTTP ${res.status}`);
    }
    // 尝试按后端统一格式 { code, data, msg } 解析
    const json = await res.json().catch(() => ({}));
    if (json && typeof json === 'object' && 'code' in json) {
      if (json.code === 200) return json.data;
      throw new Error(json.msg || '请求失败');
    }
    // 如果不是统一包装，直接返回解析内容
    return json;
  }

  const api = {
    get: (path, params) => {
      const query = params
        ? `?${new URLSearchParams(params).toString()}`
        : '';
      return request(`${path}${query}`, { method: 'GET' });
    },
    post: (path, body) => request(path, { method: 'POST', body }),
    put: (path, body) => request(path, { method: 'PUT', body }),
    delete: (path) => request(path, { method: 'DELETE' }),
  };

  window.api = api;
})();


