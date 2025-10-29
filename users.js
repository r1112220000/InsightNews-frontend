(function () {
  const { ENDPOINTS } = window.AppConfig || {};

  const state = {
    page: 1,
    pageSize: 10,
    total: 0,
    keyword: '',
    items: [],
    usingMock: false,
  };

  const els = {
    tbody: document.getElementById('usersTbody'),
    pagination: document.getElementById('pagination'),
    keyword: document.getElementById('keyword'),
    searchBtn: document.getElementById('searchBtn'),
    logoutBtn: document.getElementById('logoutBtn'),
    addBtn: document.getElementById('addUserBtn'),
  };

  // 路由守卫：未登录跳回登录
  (function guard() {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = 'index.html';
    }
  })();

  function renderTable() {
    if (!state.items.length) {
      els.tbody.innerHTML = `<tr><td colspan="7" class="text-center">暂无数据</td></tr>`;
      return;
    }
    
    els.tbody.innerHTML = state.items
      .map(
        (u) => `
        <tr>
          <td>${u.id ?? ''}</td>
          <td>${escapeHtml(u.name ?? '')}</td>
          <td>${escapeHtml(u.email ?? '')}</td>
          <td>${u.gender ?? ''}</td>
          <td>${escapeHtml(u.region ?? '')}</td>
          <td>${badgeStatus(u.status || 'active')}</td>
          <td>
            <button class="btn" data-edit="${u.id}">编辑</button>
            <button class="btn btn-danger" data-del="${u.id}">删除</button>
          </td>
        </tr>`
      )
      .join('');
  }

  function badgeStatus(status) {
    const text = status === 'disabled' ? '禁用' : '启用';
    const cls = status === 'disabled' ? 'disabled' : 'active';
    return `<span class="badge ${cls}">${text}</span>`;
  }

  async function loadUsers() {
    els.tbody.innerHTML = `<tr><td colspan="7" class="text-center">加载中...</td></tr>`;
    try {
      const data = await api.get(ENDPOINTS.users.list, {
        page: state.page,
        pageSize: state.pageSize,
        keyword: state.keyword || '',
      });

      const list = Array.isArray(data?.list) ? data.list : Array.isArray(data) ? data : [];
      state.items = list;
      state.total = data?.total || list.length;
      state.usingMock = false;
      
      renderTable();
      renderPagination();
    } catch (e) {
      console.warn('用户接口不可用，使用本地模拟数据。错误：', e.message);
      const mock = getMockUsers();
      state.items = mock;
      state.total = mock.length;
      state.usingMock = true;
      
      renderTable();
      renderPagination();
    }
  }

  function renderPagination() {
    const totalPages = Math.max(1, Math.ceil(state.total / state.pageSize));
    const page = Math.min(state.page, totalPages);
    if (totalPages <= 1) {
      els.pagination.innerHTML = '';
      return;
    }
    
    const pages = [];
    const addBtn = (p, label = p, active = p === page) =>
      `<button class="page-btn ${active ? 'active' : ''}" data-page="${p}">${label}</button>`;

    if (page > 1) pages.push(addBtn(page - 1, '上一页', false));
    for (let p = 1; p <= totalPages; p++) {
      pages.push(addBtn(p));
    }
    if (page < totalPages) pages.push(addBtn(page + 1, '下一页', false));

    els.pagination.innerHTML = pages.join('');
    els.pagination.querySelectorAll('[data-page]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        state.page = Number(btn.getAttribute('data-page'));
        await loadUsers();
      });
    });
  }

  // Events
  els.logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });

  els.searchBtn.addEventListener('click', async () => {
    state.keyword = els.keyword.value.trim();
    state.page = 1;
    await loadUsers();
  });

  els.addBtn.addEventListener('click', () => {
    alert('新建用户功能开发中...');
  });

  // Helpers
  function escapeHtml(str) {
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function getMockUsers() {
    const list = [];
    for (let i = 1; i <= 53; i++) {
      list.push({
        id: i,
        name: `用户${i}`,
        email: `user${i}@example.com`,
        gender: i % 2 === 0 ? 'male' : 'female',
        region: i % 3 === 0 ? '上海' : i % 3 === 1 ? '北京' : '深圳',
        status: i % 5 === 0 ? 'disabled' : 'active',
        phone: `1380000${String(1000 + i)}`,
      });
    }
    return list;
  }

  // 绑定编辑和删除按钮事件
  function bindTableEvents() {
    els.tbody.querySelectorAll('[data-edit]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-edit');
        alert(`编辑用户 ${id} 功能开发中...`);
      });
    });
    
    els.tbody.querySelectorAll('[data-del]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-del');
        if (!confirm('确认删除该用户吗？')) return;
        try {
          await api.delete(ENDPOINTS.users.remove(id));
          await loadUsers();
        } catch (e) {
          alert(`删除失败：${e.message}`);
        }
      });
    });
  }

  // 重写renderTable以包含事件绑定
  const originalRenderTable = renderTable;
  renderTable = function() {
    originalRenderTable();
    bindTableEvents();
  };

  // init
  (async function init() {
    await loadUsers();
  })();
})();