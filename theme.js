(function () {
  const THEME_KEY = 'admin_theme';
  const BRAND_KEY = 'admin_brand_primary';

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  function applyBrand(color) {
    if (!color) return;
    document.documentElement.style.setProperty('--primary', color);
    // derive a slightly darker for hover
    document.documentElement.style.setProperty('--primary-600', color);
    localStorage.setItem(BRAND_KEY, color);
  }

  // init from storage
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  applyTheme(savedTheme);
  const savedBrand = localStorage.getItem(BRAND_KEY) || (window.AppConfig && window.AppConfig.BRAND);
  if (savedBrand) applyBrand(savedBrand);

  // expose helpers
  window.Theme = {
    toggle() {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
    },
    setBrand(color) {
      applyBrand(color);
    },
    current() {
      return document.documentElement.getAttribute('data-theme') || 'light';
    },
  };
})();


