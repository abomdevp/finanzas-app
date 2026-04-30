export const initRouter = (routes) => {
  const navigateTo = (url) => {
    history.pushState(null, null, url);
    router();
  };

  const router = async () => {
    const path = window.location.pathname;
    const route = routes[path] || routes['/'];
    
    // Update active nav link
    document.querySelectorAll('.nav-item').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === path) {
        link.classList.add('active');
      }
    });

    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(await route());
    
    // Re-initialize Lucide icons for new content
    if (window.lucide) {
      window.lucide.createIcons();
    }
  };

  window.addEventListener('popstate', router);

  document.body.addEventListener('click', e => {
    const link = e.target.closest('[data-link]');
    if (link) {
      e.preventDefault();
      navigateTo(link.getAttribute('href'));
    }
  });

  router();
  
  return { navigateTo };
};
